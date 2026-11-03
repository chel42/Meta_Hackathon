import asyncio
import random
from typing import Any, TypeVar

from openai import AsyncOpenAI, APIStatusError
from pydantic import BaseModel, ValidationError

from app.providers.base import Usage
from app.schemas.agents import Citation, Investigation, RawResult

T = TypeVar("T", bound=BaseModel)


def _usage(
    response: Any,
    *,
    provider: str | None = None,
    model: str | None = None,
    responses_api: bool = False,
) -> Usage:
    usage = getattr(response, "usage", None)
    input_name = "input_tokens" if responses_api else "prompt_tokens"
    output_name = "output_tokens" if responses_api else "completion_tokens"
    return Usage(
        input_tokens=getattr(usage, input_name, 0) or 0,
        output_tokens=getattr(usage, output_name, 0) or 0,
        reported=usage is not None,
        provider=provider,
        model=model,
    )


def _add_usage(first: Usage, second: Usage) -> Usage:
    providers = ", ".join(
        dict.fromkeys(item for item in (first.provider, second.provider) if item)
    )
    models = ", ".join(
        dict.fromkeys(item for item in (first.model, second.model) if item)
    )
    return Usage(
        input_tokens=first.input_tokens + second.input_tokens,
        output_tokens=first.output_tokens + second.output_tokens,
        searches=first.searches + second.searches,
        reported=first.reported and second.reported,
        provider=providers or None,
        model=models or None,
    )


class MetaProvider:
    name = "meta"

    def __init__(
        self,
        api_key: str,
        model: str = "muse-spark-1.3",
        base_url: str = "https://api.meta.ai/v1",
    ) -> None:
        self.model = model
        self.client = AsyncOpenAI(api_key=api_key, base_url=base_url, max_retries=0)

    async def _chat(self, **kwargs: Any) -> Any:
        for attempt in range(2):
            try:
                return await self.client.chat.completions.create(**kwargs)
            except APIStatusError as exc:
                if attempt or exc.status_code < 500 and exc.status_code != 429:
                    raise
                await asyncio.sleep(random.uniform(0.25, 0.75))
        raise RuntimeError("Unreachable retry state")

    async def _responses(self, **kwargs: Any) -> Any:
        for attempt in range(2):
            try:
                return await self.client.responses.create(**kwargs)
            except APIStatusError as exc:
                if attempt or exc.status_code < 500 and exc.status_code != 429:
                    raise
                await asyncio.sleep(random.uniform(0.25, 0.75))
        raise RuntimeError("Unreachable retry state")

    async def generate_json(
        self,
        *,
        schema_name: str,
        output_model: type[T],
        system_prompt: str,
        user_prompt: str,
        reasoning_effort: str,
        timeout: float,
    ) -> tuple[T, Usage]:
        schema = output_model.model_json_schema()
        last_error = "No structured response returned"
        total_usage = Usage()
        for attempt in range(2):
            prompt = user_prompt if attempt == 0 else (
                f"{user_prompt}\n\nLa réponse précédente était invalide : {last_error}. "
                "Retourne un JSON corrigé conforme au schéma."
            )
            request = dict(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt},
                ],
                response_format={
                    "type": "json_schema",
                    "json_schema": {
                        "name": schema_name,
                        "strict": True,
                        "schema": schema,
                    },
                },
                reasoning_effort=reasoning_effort,
                max_tokens=4000,
                timeout=timeout,
            )
            try:
                response = await self._chat(**request)
            except APIStatusError as exc:
                message = str(exc).casefold()
                if (
                    attempt
                    or exc.status_code != 400
                    or "strict" not in message and "json_schema" not in message
                ):
                    raise
                fallback_request = {
                    **request,
                    "response_format": {
                        **request["response_format"],
                        "json_schema": {
                            **request["response_format"]["json_schema"],
                            "strict": False,
                        },
                    },
                }
                response = await self._chat(**fallback_request)
            raw = response.choices[0].message.content
            response_usage = _usage(
                response, provider=self.name, model=self.model
            )
            total_usage = _add_usage(total_usage, response_usage)
            try:
                if raw is None:
                    raise ValueError("Empty structured response")
                return output_model.model_validate_json(raw), total_usage
            except (ValidationError, ValueError) as exc:
                last_error = str(exc)
        raise ValueError(f"Meta returned invalid {schema_name} JSON: {last_error}")

    async def grounded_search(
        self, *, prompt: str, timeout: float
    ) -> tuple[Investigation, Usage]:
        response: Any = await self._responses(
            model=self.model,
            input=prompt,
            max_output_tokens=4000,
            tools=[{"type": "web_search", "search_context_size": "medium"}],
            include=["web_search_call.results"],
            timeout=timeout,
        )
        data = response.model_dump()
        output = data.get("output", [])
        search_calls = [item for item in output if item.get("type") == "web_search_call"]
        raw_results: list[RawResult] = []
        for call in search_calls:
            for result in call.get("results", []):
                if result.get("url"):
                    raw_results.append(
                        RawResult(
                            url=result["url"],
                            title=result.get("title", ""),
                            snippet=result.get("snippet", ""),
                        )
                    )
        message = next((item for item in output if item.get("type") == "message"), {})
        content = message.get("content", [{}])
        annotations = content[0].get("annotations", []) if content else []
        citations = [
            Citation(
                url=item["url"],
                title=item.get("title", ""),
                start_index=item.get("start_index", 0),
                end_index=item.get("end_index", 0),
            )
            for item in annotations
            if item.get("type") == "url_citation" and item.get("url")
        ]
        investigation = Investigation(
            answer_text=content[0].get("text", "") if content else "",
            citations=citations,
            raw_results=raw_results,
            search_calls=len(search_calls),
        )
        response_usage = _usage(
            response,
            provider=self.name,
            model=self.model,
            responses_api=True,
        )
        return investigation, Usage(
            input_tokens=response_usage.input_tokens,
            output_tokens=response_usage.output_tokens,
            searches=len(search_calls),
            reported=response_usage.reported,
            provider=self.name,
            model=self.model,
        )

    async def describe_image(
        self, *, image_data_url: str, caption: str, timeout: float
    ) -> tuple[BaseModel, Usage]:
        from app.schemas.agents import MediaAnalysis

        schema = MediaAnalysis.model_json_schema()
        response = await self._chat(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Décris l'image sans conclure à une falsification. "
                        "La provenance est toujours not_assessed."
                    ),
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": f"Légende : {caption}"},
                        {"type": "image_url", "image_url": {"url": image_data_url}},
                    ],
                },
            ],
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "MediaAnalysis",
                    "strict": True,
                    "schema": schema,
                },
            },
            reasoning_effort="low",
            max_tokens=4000,
            timeout=timeout,
        )
        raw = response.choices[0].message.content
        if raw is None:
            raise ValueError("Meta returned an empty image analysis")
        return MediaAnalysis.model_validate_json(raw), _usage(
            response, provider=self.name, model=self.model
        )
