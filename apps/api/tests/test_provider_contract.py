import pytest

from app.providers.fake import FakeProvider
from app.providers.fallback import FallbackProvider
from app.schemas.agents import ClaimList, ClaimVerdict, Investigation
from app.schemas.proof import ProofReport


@pytest.mark.asyncio
async def test_fake_provider_contract() -> None:
    provider = FakeProvider()
    claims, usage = await provider.generate_json(
        schema_name="ClaimList",
        output_model=ClaimList,
        system_prompt="sys",
        user_prompt="Langue de réponse : fr\n\nContenu à analyser :\nParis est la capitale de la France.",
        reasoning_effort="low",
        timeout=5,
    )
    assert claims.claims
    assert usage.input_tokens >= 0
    investigation, search_usage = await provider.grounded_search(prompt="Paris capitale", timeout=5)
    assert isinstance(investigation, Investigation)
    assert investigation.search_calls == 1
    assert search_usage.searches == 1
    verdict, _ = await provider.generate_json(
        schema_name="ClaimVerdict",
        output_model=ClaimVerdict,
        system_prompt="sys",
        user_prompt="source_id=c1-s1; snippet=Les observations scientifiques confirment cette information.",
        reasoning_effort="medium",
        timeout=5,
    )
    assert verdict.verdict in {"supported", "contradicted", "unverifiable"}


@pytest.mark.asyncio
async def test_five_fake_cases_produce_valid_proof() -> None:
    from app.agents.pipeline import AgentPipeline

    cases = [
        "Paris est la capitale de la France.",
        "La Terre orbite autour du Soleil.",
        "L'eau bout à 100 °C au niveau de la mer.",
        "Le Nil traverse l'Egypte.",
        "Cette opinion est la plus belle du monde.",
    ]
    for text in cases:
        report = (await AgentPipeline(FakeProvider()).run(text)).report
        ProofReport.model_validate(report.model_dump())
        assert report.schema_version == "1.0"
        for claim in report.claims:
            confirmed_ids = {
                source.source_id
                for source in report.sources
                if source.support_check.status == "confirmed"
            }
            for evidence in claim.evidence:
                assert evidence.source_id in confirmed_ids


@pytest.mark.asyncio
async def test_fallback_provider_switches_on_temporary_error() -> None:
    from openai import APIStatusError
    from httpx import Request, Response

    class Boom:
        name = "meta"
        model = "primary"

        async def generate_json(self, **kwargs):
            request = Request("POST", "https://api.meta.ai/v1/chat/completions")
            raise APIStatusError(
                "busy",
                response=Response(429, request=request),
                body=None,
            )

    class Ok(FakeProvider):
        name = "fallback"

    provider = FallbackProvider(Boom(), Ok())
    result, _ = await provider.generate_json(
        schema_name="ClaimList",
        output_model=ClaimList,
        system_prompt="s",
        user_prompt="Contenu à analyser :\nParis est la capitale.",
        reasoning_effort="low",
        timeout=5,
    )
    assert result.claims
    assert "fallback" in provider.name


@pytest.mark.parametrize("status_code", [429, 503])
@pytest.mark.asyncio
async def test_fallback_records_actual_provider_and_usage(status_code: int) -> None:
    from httpx import Request, Response
    from openai import APIStatusError

    from app.agents.pipeline import AgentPipeline

    class FailingProvider:
        name = "meta"
        model = "primary-model"

        async def generate_json(self, **kwargs):
            request = Request("POST", "https://api.meta.ai/v1/chat/completions")
            raise APIStatusError(
                "temporarily unavailable",
                response=Response(status_code, request=request),
                body=None,
            )

        async def grounded_search(self, **kwargs):
            request = Request("POST", "https://api.meta.ai/v1/responses")
            raise APIStatusError(
                "temporarily unavailable",
                response=Response(status_code, request=request),
                body=None,
            )

        async def describe_image(self, **kwargs):
            request = Request("POST", "https://api.meta.ai/v1/chat/completions")
            raise APIStatusError(
                "temporarily unavailable",
                response=Response(status_code, request=request),
                body=None,
            )

    fallback = FakeProvider()
    result = await AgentPipeline(
        FallbackProvider(FailingProvider(), fallback)
    ).run("Paris est la capitale de la France.")

    assert result.report.trace.provider == "fake"
    assert result.report.trace.model == fallback.model
    assert result.report.trace.input_tokens == result.usage.input_tokens
    assert result.report.trace.output_tokens == result.usage.output_tokens
    assert result.usage.input_tokens > 0
    assert result.usage.searches > 0


@pytest.mark.parametrize("status_code", [400, 401, 403])
@pytest.mark.asyncio
async def test_fallback_does_not_hide_permanent_provider_errors(status_code: int) -> None:
    from httpx import Request, Response
    from openai import APIStatusError

    class FailingProvider:
        name = "meta"
        model = "primary-model"
        calls = 0

        async def generate_json(self, **kwargs):
            self.calls += 1
            request = Request("POST", "https://api.meta.ai/v1/chat/completions")
            raise APIStatusError(
                "permanent error",
                response=Response(status_code, request=request),
                body=None,
            )

    primary = FailingProvider()
    provider = FallbackProvider(primary, FakeProvider())
    with pytest.raises(APIStatusError):
        await provider.generate_json(
            schema_name="ClaimList",
            output_model=ClaimList,
            system_prompt="s",
            user_prompt="Contenu à analyser :\nParis est la capitale.",
            reasoning_effort="low",
            timeout=5,
        )
    assert primary.calls == 1
