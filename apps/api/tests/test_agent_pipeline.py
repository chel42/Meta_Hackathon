import asyncio

import pytest

from app.agents.pipeline import AgentPipeline
from app.agents.source_verifier import SourceVerifier, normalize_url
from app.agents.verdict_judge import VerdictJudge
from app.providers.fake import FakeProvider
from app.core.config import Settings
from app.providers.base import Usage
from app.schemas.agents import ClaimList, Investigation, RawResult


@pytest.mark.asyncio
async def test_pipeline_discards_invented_excerpt_and_marks_unverifiable() -> None:
    provider = FakeProvider(
        json_responses={
            "ClaimList": [{"claims": [{"text": "La ville est capitale.", "checkable": True}]}],
            "ClaimVerdict": [{
                "verdict": "supported",
                "rationale": "La source le confirme.",
                "evidence": [{"source_id": "c1-s1", "stance": "supports", "excerpt": "texte inventé"}],
                "limits": [],
            }],
        },
        searches=[Investigation(
            answer_text="Résultat.",
            citations=[{"url": "https://example.com/article", "title": "Article", "start_index": 0, "end_index": 12}],
            raw_results=[RawResult(url="https://example.com/article", title="Article", snippet="Un snippet différent.")],
            search_calls=1,
        )],
    )
    report = (await AgentPipeline(provider).run("La ville est capitale.")).report
    assert report.claims[0].verdict == "unverifiable"
    assert report.claims[0].evidence == []
    assert report.sources[0].support_check.status == "confirmed"


def test_source_verifier_normalizes_url_and_retains_unconfirmed_citation() -> None:
    investigation = Investigation(
        answer_text="",
        citations=[
            {"url": "https://EXAMPLE.com/page/?utm_source=test#part", "title": "Article", "start_index": 0, "end_index": 0},
            {"url": "https://elsewhere.test/no-result", "title": "Autre", "start_index": 0, "end_index": 0},
        ],
        raw_results=[RawResult(url="https://example.com/page", title="Article brut", snippet="Extrait vérifié.")],
        search_calls=1,
    )
    checked = SourceVerifier().verify(investigation, source_id_prefix="c2-")
    assert checked[0].status == "confirmed"
    assert checked[0].source_id == "c2-s1"
    assert checked[0].snippet == "Extrait vérifié."
    assert checked[1].status == "not_confirmed"
    assert normalize_url("https://EXAMPLE.com/p/?utm_medium=x#x") == "https://example.com/p"


@pytest.mark.asyncio
async def test_judge_requires_confirmed_sources_and_exact_snippet_excerpt() -> None:
    provider = FakeProvider(
        json_responses={
            "ClaimVerdict": [{
                "verdict": "contradicted",
                "rationale": "L'extrait ne correspond pas.",
                "evidence": [{"source_id": "s1", "stance": "contradicts", "excerpt": "pas présent"}],
                "limits": [],
            }]
        }
    )
    from app.schemas.agents import SourceCheck

    verdict, _ = await VerdictJudge(provider).judge(
        "Affirmation",
        [SourceCheck(source_id="s1", url="https://example.com", title="Example",
                     status="confirmed", snippet="Contenu consulté.")],
    )
    assert verdict.verdict == "unverifiable"
    assert verdict.evidence == []
    assert "extraits non vérifiables" in verdict.limits


@pytest.mark.asyncio
async def test_fake_provider_empty_input_produces_valid_empty_report() -> None:
    provider = FakeProvider(json_responses={"ClaimList": [{"claims": []}]})
    result = await AgentPipeline(provider).run("")
    assert result.report.claims == []
    assert result.report.schema_version == "1.0"
    assert result.report.trace.provider == "fake"


@pytest.mark.asyncio
async def test_invalid_claim_extraction_is_explicit_in_report_limits() -> None:
    provider = FakeProvider(json_responses={"ClaimList": [{"claims": [{"text": "", "checkable": True}]}]})
    result = await AgentPipeline(provider).run("Some text")
    assert result.report.claims == []
    assert "extraction des affirmations non validée" in result.report.limits


@pytest.mark.asyncio
async def test_pipeline_runs_independent_claim_searches_concurrently() -> None:
    import asyncio

    class DelayedFake(FakeProvider):
        def __init__(self, **kwargs):
            super().__init__(**kwargs)
            self.active_searches = 0
            self.max_active_searches = 0

        async def grounded_search(self, *, prompt: str, timeout: float):
            self.active_searches += 1
            self.max_active_searches = max(self.max_active_searches, self.active_searches)
            try:
                await asyncio.sleep(0.03)
                return await super().grounded_search(prompt=prompt, timeout=timeout)
            finally:
                self.active_searches -= 1

    provider = DelayedFake(
        json_responses={"ClaimList": [{
            "claims": [
                {"text": "Claim one", "checkable": True},
                {"text": "Claim two", "checkable": True},
                {"text": "Claim three", "checkable": True},
            ]
        }]},
        searches=[
            {"answer_text": "none", "citations": [], "raw_results": [], "search_calls": 0}
            for _ in range(6)
        ],
    )
    await AgentPipeline(provider).run("Three independent claims")
    assert provider.max_active_searches == 3


@pytest.mark.asyncio
async def test_url_submission_is_researched_before_claim_extraction() -> None:
    provider = FakeProvider(
        json_responses={
            "ClaimList": [{
                "claims": [{"text": "La page affirme que Paris est la capitale.", "checkable": True}]
            }],
            "ClaimVerdict": [{
                "verdict": "supported",
                "rationale": "La source confirme l'affirmation.",
                "evidence": [{
                    "source_id": "c1-s1",
                    "stance": "supports",
                    "excerpt": "Paris est la capitale de la France.",
                }],
                "limits": [],
            }],
        },
        searches=[
            {
                "answer_text": "La page affirme que Paris est la capitale.",
                "citations": [],
                "raw_results": [],
                "search_calls": 1,
            },
            Investigation(
                answer_text="Paris est la capitale de la France.",
                citations=[{
                    "url": "https://example.com/paris",
                    "title": "Article",
                    "start_index": 0,
                    "end_index": 36,
                }],
                raw_results=[RawResult(
                    url="https://example.com/paris",
                    title="Article",
                    snippet="Paris est la capitale de la France.",
                )],
                search_calls=1,
            ),
        ],
    )

    report = (
        await AgentPipeline(provider).run(
            "https://example.com/page", content_type="url"
        )
    ).report

    extractor_prompt = next(prompt for name, prompt in provider.calls if name == "ClaimList")
    assert "https://example.com/page" not in extractor_prompt
    assert "La page affirme que Paris est la capitale." in extractor_prompt
    assert report.claims[0].verdict == "supported"
    assert report.input["type"] == "url"
    assert report.trace.search_calls == 2


@pytest.mark.asyncio
async def test_parallel_search_budget_reservations_cannot_exceed_budget() -> None:
    from app.agents.pipeline import _BudgetTracker

    tracker = _BudgetTracker(
        provider_name="meta",
        budget_usd=0.5,
        input_rate=0,
        output_rate=1,
        search_rate=0.1,
    )
    reservations = await asyncio.gather(
        *[
            tracker.reserve(100, calls=2, searches=4)
            for _ in range(3)
        ]
    )

    assert sum(reservation is not None for reservation in reservations) == 1
    assert tracker.exhausted


@pytest.mark.asyncio
async def test_unreported_meta_usage_is_not_reported_as_zero_cost() -> None:
    class UnreportedProvider(FakeProvider):
        name = "meta"

        async def generate_json(self, **kwargs):
            output_model = kwargs["output_model"]
            return output_model.model_validate({
                "claims": [{"text": "A factual claim.", "checkable": True}]
            }), Usage(input_tokens=20, output_tokens=20, reported=False, provider="meta")

    result = await AgentPipeline(
        UnreportedProvider(),
        token_input_usd_per_million=1,
        token_output_usd_per_million=1,
        search_usd=0.01,
    ).run("A factual claim.")

    assert result.report.trace.budget_used is None
    assert "consommation fournisseur non mesurable" in result.report.limits
    assert result.report.claims[0].verdict == "unverifiable"
    assert result.report.trace.search_calls == 0


def test_empty_pricing_environment_values_remain_unconfigured(monkeypatch) -> None:
    for name in (
        "TOKEN_INPUT_USD_PER_MILLION",
        "TOKEN_OUTPUT_USD_PER_MILLION",
        "SEARCH_USD",
    ):
        monkeypatch.setenv(name, "")

    settings = Settings(_env_file=None)

    assert settings.token_input_usd_per_million is None
    assert settings.token_output_usd_per_million is None
    assert settings.search_usd is None


def test_live_pipeline_rejects_missing_pricing() -> None:
    class LiveProvider(FakeProvider):
        name = "meta"

    with pytest.raises(ValueError, match="pricing"):
        AgentPipeline(LiveProvider())
