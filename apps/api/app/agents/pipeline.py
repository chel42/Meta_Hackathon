import asyncio
from collections.abc import Awaitable, Callable
from dataclasses import dataclass
import logging
import math
from uuid import uuid4

from app.agents.claim_extractor import ClaimExtractor
from app.agents.investigator import Investigator
from app.agents.media_analyst import MediaAnalyst
from app.agents.prompt_loader import load_prompt
from app.agents.report_builder import ReportBuilder
from app.agents.source_verifier import SourceVerifier
from app.agents.verdict_judge import VerdictJudge
from app.providers.base import LLMProvider, Usage
from app.schemas.agents import ClaimVerdict, MediaAnalysis, SourceCheck
from app.schemas.proof import ProofReport

EmitFn = Callable[[str, dict], Awaitable[None]]

logger = logging.getLogger(__name__)
MAX_OUTPUT_TOKENS = 4000
MAX_SEARCH_CALLS_PER_RESPONSE = 2


@dataclass
class PipelineResult:
    report: ProofReport
    usage: Usage


class _BudgetTracker:
    def __init__(
        self,
        *,
        provider_name: str,
        budget_usd: float,
        input_rate: float | None,
        output_rate: float | None,
        search_rate: float | None,
    ) -> None:
        self.provider_name = provider_name
        self.budget_usd = budget_usd
        self.input_rate = input_rate
        self.output_rate = output_rate
        self.search_rate = search_rate
        self.usage = Usage()
        self.reserved = 0.0
        self.exhausted = False
        self.unmeasurable = False
        self.lock = asyncio.Lock()

    def cost(self, usage: Usage | None = None) -> float | None:
        usage = usage or self.usage
        if self.provider_name == "fake":
            return 0.0
        if (
            not usage.reported
            or self.input_rate is None
            or self.output_rate is None
            or self.search_rate is None
        ):
            return None
        return (
            usage.input_tokens * self.input_rate / 1_000_000
            + usage.output_tokens * self.output_rate / 1_000_000
            + usage.searches * self.search_rate
        )

    def _estimate(
        self,
        input_bytes: int,
        *,
        calls: int,
        searches: int,
        retry_input_bytes: int,
    ) -> float:
        if self.provider_name == "fake":
            return 0.0
        assert self.input_rate is not None
        assert self.output_rate is not None
        assert self.search_rate is not None
        input_tokens = input_bytes + retry_input_bytes
        return calls * (
            input_tokens * self.input_rate + MAX_OUTPUT_TOKENS * self.output_rate
        ) / 1_000_000 + searches * self.search_rate

    async def reserve(
        self,
        input_bytes: int,
        *,
        calls: int,
        searches: int = 0,
        retry_input_bytes: int = 0,
    ) -> float | None:
        async with self.lock:
            if self.unmeasurable or self.exhausted:
                return None
            measured_cost = self.cost()
            if measured_cost is None:
                self.unmeasurable = True
                return None
            reservation = self._estimate(
                input_bytes,
                calls=calls,
                searches=searches,
                retry_input_bytes=retry_input_bytes,
            )
            if measured_cost + self.reserved + reservation > self.budget_usd:
                self.exhausted = True
                return None
            self.reserved += reservation
            return reservation

    async def record(self, reservation: float, usage: Usage) -> bool:
        async with self.lock:
            self.reserved = max(0.0, self.reserved - reservation)
            self.usage = _add_usage(self.usage, usage)
            if not usage.reported and self.provider_name != "fake":
                self.unmeasurable = True
            measured_cost = self.cost()
            if measured_cost is None:
                self.unmeasurable = True
                return False
            if measured_cost + self.reserved > self.budget_usd:
                self.exhausted = True
                return False
            return not self.unmeasurable

    async def mark_unmeasurable(self, reservation: float = 0.0) -> None:
        async with self.lock:
            self.reserved = max(0.0, self.reserved - reservation)
            if self.provider_name == "fake":
                return
            self.usage = _add_usage(self.usage, Usage(reported=False))
            self.unmeasurable = True


class AgentPipeline:
    def __init__(
        self,
        provider: LLMProvider,
        *,
        max_parallel_searches: int = 3,
        budget_usd: float = 0.50,
        token_input_usd_per_million: float | None = None,
        token_output_usd_per_million: float | None = None,
        search_usd: float | None = None,
    ) -> None:
        rates = (
            token_input_usd_per_million,
            token_output_usd_per_million,
            search_usd,
        )
        if provider.name != "fake":
            if any(rate is None for rate in rates):
                raise ValueError("Meta pricing must be configured before running the pipeline")
            if (
                not math.isfinite(budget_usd)
                or budget_usd <= 0
                or any(not math.isfinite(rate) or rate < 0 for rate in rates if rate is not None)
                or not any(rate > 0 for rate in rates if rate is not None)
            ):
                raise ValueError("A positive run budget and valid Meta pricing are required")
        self.provider = provider
        self.extractor = ClaimExtractor(provider)
        self.investigator = Investigator(provider)
        self.verifier = SourceVerifier()
        self.judge = VerdictJudge(provider)
        self.media = MediaAnalyst(provider)
        self.builder = ReportBuilder()
        self.semaphore = asyncio.Semaphore(max_parallel_searches)
        self.budget_usd = budget_usd
        self.input_rate = token_input_usd_per_million
        self.output_rate = token_output_usd_per_million
        self.search_rate = search_usd

    def _cost(self, usage: Usage) -> float | None:
        return _BudgetTracker(
            provider_name=self.provider.name,
            budget_usd=self.budget_usd,
            input_rate=self.input_rate,
            output_rate=self.output_rate,
            search_rate=self.search_rate,
        ).cost(usage)

    async def run(
        self,
        content: str,
        *,
        run_id: str | None = None,
        content_type: str = "text",
        language: str = "fr",
        image_data_url: str | None = None,
        emit: EmitFn | None = None,
    ) -> PipelineResult:
        if len(content) > 8000:
            raise ValueError("Submission exceeds the 8,000 character limit")
        run_id = run_id or str(uuid4())
        total = Usage()
        extraction_failed = False
        additional_limits: list[str] = []
        budget = _BudgetTracker(
            provider_name=self.provider.name,
            budget_usd=self.budget_usd,
            input_rate=self.input_rate,
            output_rate=self.output_rate,
            search_rate=self.search_rate,
        )

        async def notify(event_type: str, payload: dict | None = None) -> None:
            if emit:
                await emit(event_type, payload or {})

        extraction_content = content
        if content_type == "url":
            await notify("step.started", {"step": "url_research"})
            url_prompt_size = len(
                (load_prompt("investigator") + content + language + " " * 500).encode("utf-8")
            )
            reservation = await budget.reserve(
                url_prompt_size,
                calls=2,
                searches=2 * MAX_SEARCH_CALLS_PER_RESPONSE,
                retry_input_bytes=100,
            )
            if reservation is None:
                extraction_failed = True
            else:
                try:
                    investigation, url_usage = await self.investigator.investigate_url(
                        content, language
                    )
                except BaseException:
                    await budget.mark_unmeasurable(reservation)
                    raise
                await budget.record(reservation, url_usage)
                total = _add_usage(total, url_usage)
                if investigation.search_calls and investigation.answer_text.strip():
                    extraction_content = investigation.answer_text
                else:
                    extraction_failed = True
                    additional_limits.append(
                        "contenu de l'URL inaccessible par la recherche web"
                    )
            await notify("step.completed", {"step": "url_research"})

        await notify("step.started", {"step": "claim_extraction"})
        claims = []
        if not extraction_failed:
            extraction_prompt = (
                load_prompt("claim_extractor")
                + f"Langue de réponse : {language}\n\nContenu à analyser :\n{extraction_content}"
            )
            reservation = await budget.reserve(
                len(extraction_prompt.encode("utf-8")),
                calls=2,
                retry_input_bytes=MAX_OUTPUT_TOKENS,
            )
            if reservation is None:
                extraction_failed = True
            else:
                try:
                    extraction, usage = await self.extractor.extract(
                        extraction_content, language
                    )
                except ValueError:
                    logger.warning("Claim extraction response rejected")
                    await budget.mark_unmeasurable(reservation)
                    extraction_failed = True
                except BaseException:
                    await budget.mark_unmeasurable(reservation)
                    raise
                else:
                    await budget.record(reservation, usage)
                    total = _add_usage(total, usage)
                    claims = extraction.claims
        await notify("claims.extracted", {"count": len(claims)})
        await notify("step.completed", {"step": "claim_extraction"})
        verdicts: list[ClaimVerdict] = []
        all_sources: list[SourceCheck] = []

        async def analyze(
            claim_text: str, claim_index: int
        ) -> tuple[ClaimVerdict, list[SourceCheck], Usage]:
            if budget.unmeasurable:
                return _blocked_verdict(budget), [], Usage()
            search_prompt_size = len(
                (
                    load_prompt("investigator")
                    + claim_text
                    + language
                    + "Cherche des sources fiables, y compris contradictoires. Cite chaque source."
                ).encode("utf-8")
            )
            reservation = await budget.reserve(
                search_prompt_size,
                calls=2,
                searches=2 * MAX_SEARCH_CALLS_PER_RESPONSE,
                retry_input_bytes=100,
            )
            if reservation is None:
                return _blocked_verdict(budget), [], Usage()
            async with self.semaphore:
                try:
                    investigation, search_usage = await self.investigator.investigate(
                        claim_text, language
                    )
                except BaseException:
                    await budget.mark_unmeasurable(reservation)
                    raise
            within_budget = await budget.record(reservation, search_usage)
            checked = self.verifier.verify(
                investigation, source_id_prefix=f"c{claim_index}-"
            )
            for source in checked:
                await notify(
                    "source.found",
                    {
                        "source_id": source.source_id,
                        "status": source.status,
                        "url": str(source.url),
                    },
                )
            if not within_budget:
                return _blocked_verdict(budget), checked, search_usage
            if investigation.search_calls == 0 or not checked:
                return (
                    ClaimVerdict(
                        verdict="unverifiable",
                        rationale="Aucune recherche ou citation exploitable n'a abouti.",
                        evidence=[],
                        limits=[
                            "aucune recherche aboutie"
                            if not investigation.search_calls
                            else "aucune citation exploitable"
                        ],
                    ),
                    checked,
                    search_usage,
                )

            judge_prompt = (
                load_prompt("verdict_judge")
                + self.judge.user_prompt(claim_text, [
                    source for source in checked if source.status == "confirmed"
                ], language)
            )
            reservation = await budget.reserve(
                len(judge_prompt.encode("utf-8")),
                calls=2,
                retry_input_bytes=MAX_OUTPUT_TOKENS,
            )
            if reservation is None:
                return _blocked_verdict(budget), checked, search_usage
            try:
                judged, judge_usage = await self.judge.judge(
                    claim_text, checked, language
                )
            except ValueError:
                logger.warning("Structured verdict response rejected")
                await budget.mark_unmeasurable(reservation)
                return (
                    ClaimVerdict(
                        verdict="unverifiable",
                        rationale="Le jugement n'a pas pu être validé.",
                        evidence=[],
                        limits=["réponse structurée invalide"],
                    ),
                    checked,
                    search_usage,
                )
            except BaseException:
                await budget.mark_unmeasurable(reservation)
                raise
            within_budget = await budget.record(reservation, judge_usage)
            if not within_budget:
                judged = _blocked_verdict(budget)
            return judged, checked, _add_usage(search_usage, judge_usage)

        async def run_claim(
            claim_text: str, claim_index: int
        ) -> tuple[ClaimVerdict, list[SourceCheck], Usage]:
            try:
                return await asyncio.wait_for(analyze(claim_text, claim_index), timeout=180)
            except (TimeoutError, asyncio.TimeoutError):
                return _timeout_verdict(), [], Usage()

        def skip_claim() -> tuple[ClaimVerdict, list[SourceCheck], Usage]:
            return (
                ClaimVerdict(
                    verdict="unverifiable",
                    rationale="Cette affirmation ne peut pas être vérifiée par une recherche factuelle.",
                    evidence=[],
                    limits=["affirmation non vérifiable"],
                ),
                [],
                Usage(),
            )

        await notify("step.started", {"step": "investigation"})
        results = await asyncio.gather(
            *[
                run_claim(claim.text, index) if claim.checkable else skip_claim()
                for index, claim in enumerate(claims, start=1)
            ],
            return_exceptions=True,
        )
        for result in results:
            if isinstance(result, BaseException):
                logger.error(
                    "Agent pipeline failed for a claim",
                    exc_info=(type(result), result, result.__traceback__),
                )
                raise result
            verdict, sources, claim_usage = result
            total = _add_usage(total, claim_usage)
            verdicts.append(verdict)
            all_sources.extend(sources)
            await notify(
                "claim.verdict",
                {"claim_index": len(verdicts), "verdict": verdict.verdict},
            )
        await notify("step.completed", {"step": "investigation"})
        await notify("step.started", {"step": "source_verification"})
        await notify("step.completed", {"step": "source_verification"})

        media: MediaAnalysis | None = None
        if image_data_url:
            await notify("step.started", {"step": "media_analysis"})
            image_prompt_size = len(
                (image_data_url + content + language).encode("utf-8")
            )
            reservation = await budget.reserve(image_prompt_size, calls=1)
            if reservation is None:
                media = _unclear_media()
            else:
                try:
                    media, media_usage = await self.media.analyze(
                        image_data_url, content, language
                    )
                except Exception:
                    logger.exception("Image analysis failed")
                    await budget.mark_unmeasurable(reservation)
                    media = _unclear_media()
                else:
                    await budget.record(reservation, media_usage)
                    total = _add_usage(total, media_usage)
            await notify("step.completed", {"step": "media_analysis"})

        if budget.unmeasurable:
            total = _add_usage(total, Usage(reported=False))
        budget_used = budget.cost()
        await notify("budget.update", {"budget_used": budget_used})
        await notify("step.started", {"step": "report_generation"})

        report = self.builder.build(
            run_id=run_id,
            content=content,
            content_type=content_type,
            language=language,
            claims=claims,
            verdicts=verdicts,
            sources=all_sources,
            provider=total.provider or self.provider.name,
            model=total.model or self.provider.model,
            search_calls=total.searches,
            budget_used=budget_used,
            input_tokens=total.input_tokens,
            output_tokens=total.output_tokens,
            partial=budget.exhausted,
            budget_unmeasurable=budget.unmeasurable,
            additional_limits=additional_limits,
            extraction_failed=extraction_failed,
            media_analysis=media,
        )
        await notify("step.completed", {"step": "report_generation"})
        return PipelineResult(report=report, usage=total)


def _add_usage(first: Usage, second: Usage) -> Usage:
    providers = ", ".join(
        dict.fromkeys(item for item in (first.provider, second.provider) if item)
    )
    models = ", ".join(dict.fromkeys(item for item in (first.model, second.model) if item))
    return Usage(
        input_tokens=first.input_tokens + second.input_tokens,
        output_tokens=first.output_tokens + second.output_tokens,
        searches=first.searches + second.searches,
        reported=first.reported and second.reported,
        provider=providers or None,
        model=models or None,
    )


def _blocked_verdict(budget: _BudgetTracker) -> ClaimVerdict:
    if budget.unmeasurable:
        return ClaimVerdict(
            verdict="unverifiable",
            rationale="La consommation fournisseur ne peut pas être mesurée.",
            evidence=[],
            limits=["consommation non mesurable"],
        )
    return ClaimVerdict(
        verdict="unverifiable",
        rationale="Le budget maximal de vérification est atteint.",
        evidence=[],
        limits=["budget maximal atteint"],
    )


def _unclear_media() -> MediaAnalysis:
    return MediaAnalysis(
        observations=[],
        caption_consistency="unclear",
        provenance="not_assessed",
    )


def _timeout_verdict() -> ClaimVerdict:
    return ClaimVerdict(
        verdict="unverifiable",
        rationale="La recherche pour cette affirmation a dépassé le délai autorisé.",
        evidence=[],
        limits=["délai de recherche dépassé"],
    )
