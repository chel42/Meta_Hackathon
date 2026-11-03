from collections import deque
from typing import Any, TypeVar

from pydantic import BaseModel

from app.schemas.agents import ClaimList, Investigation, MediaAnalysis
from app.providers.base import Usage

T = TypeVar("T", bound=BaseModel)


class FakeProvider:
    name = "fake"
    model = "fake-vera-v1"

    def __init__(
        self,
        *,
        json_responses: dict[str, list[dict[str, Any]]] | None = None,
        searches: list[Investigation | dict[str, Any]] | None = None,
    ) -> None:
        self.json_responses = {
            key: deque(values) for key, values in (json_responses or {}).items()
        }
        self.searches = deque(searches or [])
        self.calls: list[tuple[str, str]] = []

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
        del system_prompt, reasoning_effort, timeout
        self.calls.append((schema_name, user_prompt))
        queue = self.json_responses.get(schema_name)
        if queue is not None and not queue:
            raise ValueError(f"No fake response remaining for {schema_name}")
        if queue is None:
            if schema_name == "ClaimList":
                value: dict[str, Any] = {"claims": []}
            elif schema_name == "ClaimVerdict":
                value = {
                    "verdict": "unverifiable",
                    "rationale": "Les éléments disponibles ne suffisent pas.",
                    "evidence": [],
                    "limits": ["aucune preuve exploitable"],
                }
            else:
                raise ValueError(f"No fake response configured for {schema_name}")
        else:
            value = queue.popleft()
        return output_model.model_validate(value), Usage(input_tokens=20, output_tokens=20)

    async def grounded_search(
        self, *, prompt: str, timeout: float
    ) -> tuple[Investigation, Usage]:
        del timeout
        self.calls.append(("Investigation", prompt))
        if not self.searches:
            return Investigation(
                answer_text="Aucune recherche aboutie.",
                citations=[],
                raw_results=[],
                search_calls=0,
            ), Usage()
        item = self.searches.popleft()
        investigation = item if isinstance(item, Investigation) else Investigation.model_validate(item)
        return investigation, Usage(searches=investigation.search_calls)

    async def describe_image(
        self, *, image_data_url: str, caption: str, timeout: float
    ) -> tuple[MediaAnalysis, Usage]:
        del image_data_url, timeout
        self.calls.append(("MediaAnalysis", caption))
        return MediaAnalysis(
            observations=[],
            caption_consistency="unclear",
            provenance="not_assessed",
        ), Usage(input_tokens=10, output_tokens=10)
