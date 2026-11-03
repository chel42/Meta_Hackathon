from types import SimpleNamespace
from unittest.mock import AsyncMock

import httpx
import pytest
from openai import APIStatusError

from app.providers.fake import FakeProvider
from app.providers.meta import MetaProvider
from app.schemas.agents import ClaimList

_UNSET = object()


def _chat_response(
    content: str,
    *,
    prompt_tokens: int = 0,
    completion_tokens: int = 0,
    usage: object = _UNSET,
) -> SimpleNamespace:
    return SimpleNamespace(
        choices=[SimpleNamespace(message=SimpleNamespace(content=content))],
        usage=usage
        if usage is not _UNSET
        else SimpleNamespace(
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
        ),
    )


def _api_error(status_code: int, message: str) -> APIStatusError:
    response = httpx.Response(
        status_code,
        request=httpx.Request("POST", "https://api.meta.ai/v1/chat/completions"),
        json={"error": {"message": message}},
    )
    return APIStatusError(
        message=message, response=response, body={"error": {"message": message}}
    )


def _provider_with_chat(create: AsyncMock) -> MetaProvider:
    provider = MetaProvider(api_key="test-key")
    provider.client = SimpleNamespace(
        chat=SimpleNamespace(completions=SimpleNamespace(create=create))
    )
    return provider


def _claim_json(text: str = "La Terre tourne autour du Soleil.") -> str:
    return ClaimList.model_validate(
        {"claims": [{"text": text, "checkable": True}]}
    ).model_dump_json()


@pytest.mark.asyncio
async def test_meta_chat_completions_returns_schema_validated_data_and_usage() -> None:
    create = AsyncMock(return_value=_chat_response(_claim_json(), prompt_tokens=11, completion_tokens=7))
    provider = _provider_with_chat(create)

    result, usage = await provider.generate_json(
        schema_name="ClaimList",
        output_model=ClaimList,
        system_prompt="system",
        user_prompt="user",
        reasoning_effort="low",
        timeout=45,
    )

    assert result.claims[0].text == "La Terre tourne autour du Soleil."
    assert usage.input_tokens == 11
    assert usage.output_tokens == 7
    assert usage.reported
    request = create.await_args.kwargs
    assert request["model"] == provider.model
    assert request["response_format"]["type"] == "json_schema"
    assert request["response_format"]["json_schema"]["strict"] is True
    assert request["response_format"]["json_schema"]["schema"] == ClaimList.model_json_schema()
    assert request["reasoning_effort"] == "low"
    assert request["max_tokens"] == 4000


@pytest.mark.asyncio
async def test_meta_chat_falls_back_when_strict_schema_is_rejected() -> None:
    create = AsyncMock(
        side_effect=[
            _api_error(400, "strict json_schema is not supported"),
            _chat_response(_claim_json()),
        ]
    )
    provider = _provider_with_chat(create)

    result, _ = await provider.generate_json(
        schema_name="ClaimList",
        output_model=ClaimList,
        system_prompt="system",
        user_prompt="user",
        reasoning_effort="low",
        timeout=45,
    )

    assert len(result.claims) == 1
    assert create.await_count == 2
    assert create.await_args_list[0].kwargs["response_format"]["json_schema"]["strict"]
    assert not create.await_args_list[1].kwargs["response_format"]["json_schema"]["strict"]


@pytest.mark.asyncio
async def test_meta_chat_retries_invalid_json_and_accumulates_usage() -> None:
    create = AsyncMock(
        side_effect=[
            _chat_response("{invalid", prompt_tokens=10, completion_tokens=3),
            _chat_response(_claim_json(), prompt_tokens=20, completion_tokens=4),
        ]
    )
    provider = _provider_with_chat(create)

    result, usage = await provider.generate_json(
        schema_name="ClaimList",
        output_model=ClaimList,
        system_prompt="system",
        user_prompt="user",
        reasoning_effort="low",
        timeout=45,
    )

    assert len(result.claims) == 1
    assert usage.input_tokens == 30
    assert usage.output_tokens == 7
    assert usage.reported
    assert "La réponse précédente était invalide" in create.await_args_list[1].kwargs[
        "messages"
    ][1]["content"]


@pytest.mark.asyncio
async def test_meta_usage_is_unknown_if_any_retry_response_omits_it() -> None:
    create = AsyncMock(
        side_effect=[
            _chat_response("{invalid", usage=None),
            _chat_response(_claim_json(), prompt_tokens=20, completion_tokens=4),
        ]
    )
    provider = _provider_with_chat(create)

    _, usage = await provider.generate_json(
        schema_name="ClaimList",
        output_model=ClaimList,
        system_prompt="system",
        user_prompt="user",
        reasoning_effort="low",
        timeout=45,
    )

    assert usage.input_tokens == 20
    assert usage.output_tokens == 4
    assert not usage.reported


@pytest.mark.asyncio
async def test_meta_chat_retries_rate_limit_once(monkeypatch: pytest.MonkeyPatch) -> None:
    create = AsyncMock(
        side_effect=[
            _api_error(429, "rate limit"),
            _chat_response(_claim_json()),
        ]
    )
    provider = _provider_with_chat(create)
    sleep = AsyncMock()
    monkeypatch.setattr("app.providers.meta.asyncio.sleep", sleep)

    await provider.generate_json(
        schema_name="ClaimList",
        output_model=ClaimList,
        system_prompt="system",
        user_prompt="user",
        reasoning_effort="low",
        timeout=45,
    )

    assert create.await_count == 2
    sleep.assert_awaited_once()


@pytest.mark.asyncio
async def test_meta_responses_api_parses_search_results_and_citations() -> None:
    payload = {
        "output": [
            {
                "type": "web_search_call",
                "results": [
                    {
                        "url": "https://example.com/fact",
                        "title": "Source",
                        "snippet": "Snippet vérifiable.",
                    }
                ],
            },
            {
                "type": "message",
                "content": [
                    {
                        "type": "output_text",
                        "text": "Résultat sourcé.",
                        "annotations": [
                            {
                                "type": "url_citation",
                                "url": "https://example.com/fact",
                                "title": "Source",
                                "start_index": 0,
                                "end_index": 15,
                            }
                        ],
                    }
                ],
            },
        ]
    }
    response = SimpleNamespace(
        model_dump=lambda: payload,
        usage=SimpleNamespace(input_tokens=31, output_tokens=14),
    )
    create = AsyncMock(return_value=response)
    provider = MetaProvider(api_key="test-key")
    provider.client = SimpleNamespace(
        responses=SimpleNamespace(create=create)
    )

    investigation, usage = await provider.grounded_search(
        prompt="Cherche une source.", timeout=90
    )

    assert investigation.answer_text == "Résultat sourcé."
    assert investigation.search_calls == 1
    assert str(investigation.citations[0].url) == "https://example.com/fact"
    assert investigation.raw_results[0].snippet == "Snippet vérifiable."
    assert usage.input_tokens == 31
    assert usage.output_tokens == 14
    assert usage.searches == 1
    assert usage.reported
    request = create.await_args.kwargs
    assert request["model"] == provider.model
    assert request["tools"] == [
        {"type": "web_search", "search_context_size": "medium"}
    ]
    assert request["include"] == ["web_search_call.results"]
    assert request["max_output_tokens"] == 4000


@pytest.mark.asyncio
async def test_meta_responses_api_retries_server_error_once(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    create = AsyncMock(
        side_effect=[
            _api_error(503, "service unavailable"),
            SimpleNamespace(
                model_dump=lambda: {"output": []},
                usage=None,
            ),
        ]
    )
    provider = MetaProvider(api_key="test-key")
    provider.client = SimpleNamespace(responses=SimpleNamespace(create=create))
    sleep = AsyncMock()
    monkeypatch.setattr("app.providers.meta.asyncio.sleep", sleep)

    result, usage = await provider.grounded_search(prompt="query", timeout=90)

    assert result.search_calls == 0
    assert not usage.reported
    assert create.await_count == 2
    sleep.assert_awaited_once()


@pytest.mark.asyncio
async def test_fake_provider_implements_all_contract_surfaces() -> None:
    provider = FakeProvider(
        json_responses={
            "ClaimList": [
                {"claims": [{"text": "Fait vérifiable.", "checkable": True}]}
            ]
        },
        searches=[
            {
                "answer_text": "Réponse.",
                "citations": [],
                "raw_results": [],
                "search_calls": 1,
            }
        ],
    )

    claims, json_usage = await provider.generate_json(
        schema_name="ClaimList",
        output_model=ClaimList,
        system_prompt="system",
        user_prompt="input",
        reasoning_effort="low",
        timeout=45,
    )
    investigation, search_usage = await provider.grounded_search(
        prompt="query", timeout=90
    )
    image, image_usage = await provider.describe_image(
        image_data_url="data:image/png;base64,AA==",
        caption="Légende",
        timeout=45,
    )

    assert claims.claims[0].text == "Fait vérifiable."
    assert json_usage.reported
    assert investigation.search_calls == 1
    assert search_usage.searches == 1
    assert image.provenance == "not_assessed"
    assert image_usage.reported
    assert [call[0] for call in provider.calls] == [
        "ClaimList",
        "Investigation",
        "MediaAnalysis",
    ]


@pytest.mark.asyncio
async def test_fake_provider_does_not_hide_exhausted_configured_response() -> None:
    provider = FakeProvider(json_responses={"ClaimList": [{"claims": []}]})
    arguments = {
        "schema_name": "ClaimList",
        "output_model": ClaimList,
        "system_prompt": "system",
        "user_prompt": "input",
        "reasoning_effort": "low",
        "timeout": 45,
    }

    await provider.generate_json(**arguments)
    with pytest.raises(ValueError, match="No fake response remaining"):
        await provider.generate_json(**arguments)
