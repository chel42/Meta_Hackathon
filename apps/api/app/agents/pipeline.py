import asyncio
from dataclasses import dataclass
import logging
from uuid import uuid4

from app.agents.claim_extractor import ClaimExtractor
from app.agents.investigator import Investigator
from app.agents.report_builder import ReportBuilder
from app.agents.source_verifier import SourceVerifier
from app.agents.verdict_judge import VerdictJudge
from app.providers.base import LLMProvider, Usage
from app.schemas.agents import ClaimVerdict, SourceCheck
from app.schemas.proof import ProofReport

logger = logging.getLogger(__name__)


@dataclass
class PipelineResult:
    report: ProofReport
    usage: Usage


class AgentPipeline:
    def __init__(
        self,
        provider: LLMProvider,
        *,
        max_parallel_searches: int = 3,
        budget_usd: float = 0.50,
        token_input_usd_per_million: float = 0.0,
        token_output_usd_per_million: float = 0.0,
        search_usd: float = 0.0,
    ) -> None:
        self.provider = provider
        self.extractor = ClaimExtractor(provider)
        self.investigator = Investigator(provider)
        self.verifier = SourceVerifier()
        self.judge = VerdictJudge(provider)
        self.builder = ReportBuilder()
        self.semaphore = asyncio.Semaphore(max_parallel_searches)
        self.budget_usd = budget_usd
        self.input_rate = token_input_usd_per_million
        self.output_rate = token_output_usd_per_million
        self.search_rate = search_usd

    def _cost(self, usage: Usage) -> float:
        return (
            usage.input_tokens * self.input_rate / 1_000_000
            + usage.output_tokens * self.output_rate / 1_000_000
            + usage.searches * self.search_rate
        )

    async def run(
        self,
        content: str,
        *,
        run_id: str | None = None,
        content_type: str = "text",
        language: str = "fr",
    ) -> PipelineResult:
        if len(content) > 8000:
            raise ValueError("Submission exceeds the 8,000 character limit")
        run_id = run_id or str(uuid4())
        total = Usage()
        extraction_failed = False
        try:
            extraction, usage = await self.extractor.extract(content, language)
            total = _add_usage(total, usage)
            claims = extraction.claims
        except ValueError as exc:
            logger.warning("Claim extraction response rejected: %s", exc)
            extraction_failed = True
            claims = []
        verdicts: list[ClaimVerdict] = []
        all_sources: list[SourceCheck] = []
        partial = False

        budget_lock = asyncio.Lock()
        reserved_budget = 0.0

        async def analyze(
            claim_text: str, claim_index: int
        ) -> tuple[ClaimVerdict, list[SourceCheck], Usage]:
            nonlocal reserved_budget
            reservation = max(0.0, self.search_rate * 2)
            async with budget_lock:
                available = self.budget_usd - self._cost(total) - reserved_budget
                if available <= 0 or self.search_rate > 0 and available < self.search_rate:
                    return _budget_verdict(), [], Usage()
                reserved_budget += min(reservation, available)
            async with self.semaphore:
                try:
                    investigation, search_usage = await self.investigator.investigate(claim_text, language)
                except Exception:
                    async with budget_lock:
                        reserved_budget = max(0.0, reserved_budget - reservation)
                    raise
            checked = self.verifier.verify(
                investigation, source_id_prefix=f"c{claim_index}-"
            )
            if investigation.search_calls == 0 or not checked:
                return (
                    ClaimVerdict(
                        verdict="unverifiable",
                        rationale="Aucune recherche ou citation exploitable n'a abouti.",
                        evidence=[],
                        limits=["aucune recherche aboutie" if not investigation.search_calls else "aucune citation exploitable"],
                    ),
                    checked,
                    search_usage,
                )
            async with budget_lock:
                spent = self._cost(_add_usage(total, search_usage))
                budget_remaining = self.budget_usd - spent
            if budget_remaining <= 0:
                return _budget_verdict(), checked, search_usage
            try:
                judged, judge_usage = await self.judge.judge(claim_text, checked, language)
            except ValueError as exc:
                logger.warning("Structured verdict rejected: %s", exc)
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
            return judged, checked, _add_usage(search_usage, judge_usage)

        async def run_claim(
            claim_text: str, claim_index: int
        ) -> tuple[ClaimVerdict, list[SourceCheck], Usage]:
            try:
                return await asyncio.wait_for(analyze(claim_text, claim_index), timeout=180)
            except (TimeoutError, asyncio.TimeoutError):
                return _timeout_verdict(), [], Usage()

        async def skip_claim() -> tuple[ClaimVerdict, list[SourceCheck], Usage]:
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
        partial = any("budget maximal atteint" in verdict.limits for verdict in verdicts)

        report = self.builder.build(
            run_id=run_id,
            content=content,
            content_type=content_type,
            language=language,
            claims=claims,
            verdicts=verdicts,
            sources=all_sources,
            provider=self.provider.name,
            model=self.provider.model,
            search_calls=total.searches,
            budget_used=self._cost(total),
            partial=partial,
            extraction_failed=extraction_failed,
        )
        return PipelineResult(report=report, usage=total)


def _add_usage(first: Usage, second: Usage) -> Usage:
    return Usage(
        input_tokens=first.input_tokens + second.input_tokens,
        output_tokens=first.output_tokens + second.output_tokens,
        searches=first.searches + second.searches,
        reported=first.reported and second.reported,
    )


def _budget_verdict() -> ClaimVerdict:
    return ClaimVerdict(
        verdict="unverifiable",
        rationale="Le budget maximal de vérification est atteint.",
        evidence=[],
        limits=["budget maximal atteint"],
    )


def _timeout_verdict() -> ClaimVerdict:
    return ClaimVerdict(
        verdict="unverifiable",
        rationale="La recherche pour cette affirmation a dépassé le délai autorisé.",
        evidence=[],
        limits=["délai de recherche dépassé"],
    )
