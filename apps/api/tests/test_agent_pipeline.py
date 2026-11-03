import pytest

from app.agents.pipeline import AgentPipeline
from app.agents.source_verifier import SourceVerifier, normalize_url
from app.agents.verdict_judge import VerdictJudge
from app.providers.fake import FakeProvider
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
