import re
from collections import deque
from typing import Any, TypeVar

from pydantic import BaseModel

from app.schemas.agents import ClaimList, Investigation, MediaAnalysis, RawResult
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
        self._searches_configured = searches is not None
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
        if not queue:
            value = _default_json(schema_name, user_prompt)
        else:
            value = queue.popleft()
        return output_model.model_validate(value), Usage(
            input_tokens=20,
            output_tokens=20,
            reported=True,
            provider=self.name,
            model=self.model,
        )

    async def grounded_search(
        self, *, prompt: str, timeout: float
    ) -> tuple[Investigation, Usage]:
        del timeout
        self.calls.append(("Investigation", prompt))
        if not self.searches:
            if self._searches_configured:
                return Investigation(
                    answer_text="Aucune recherche aboutie.",
                    citations=[],
                    raw_results=[],
                    search_calls=0,
                ), Usage(provider=self.name, model=self.model)
            snippet = "Les observations scientifiques confirment cette information."
            return Investigation(
                answer_text=snippet,
                citations=[{
                    "url": "https://example.org/source",
                    "title": "Source d'exemple",
                    "start_index": 0,
                    "end_index": 12,
                }],
                raw_results=[RawResult(
                    url="https://example.org/source",
                    title="Source d'exemple",
                    snippet=snippet,
                )],
                search_calls=1,
            ), Usage(searches=1, provider=self.name, model=self.model)
        item = self.searches.popleft()
        investigation = item if isinstance(item, Investigation) else Investigation.model_validate(item)
        return investigation, Usage(
            searches=investigation.search_calls,
            provider=self.name,
            model=self.model,
        )

    async def describe_image(
        self, *, image_data_url: str, caption: str, timeout: float
    ) -> tuple[MediaAnalysis, Usage]:
        del image_data_url, timeout
        self.calls.append(("MediaAnalysis", caption))
        return MediaAnalysis(
            observations=["Image reçue pour description visuelle uniquement."],
            caption_consistency="unclear",
            provenance="not_assessed",
        ), Usage(
            input_tokens=10,
            output_tokens=10,
            reported=True,
            provider=self.name,
            model=self.model,
        )


def _default_json(schema_name: str, user_prompt: str) -> dict[str, Any]:
    if schema_name == "ClaimList":
        content = user_prompt.split("Contenu à analyser :", 1)[-1].strip()
        pieces = [part.strip()[:300] for part in re.split(r"[.!?]\s+", content) if part.strip()]
        claims = [{"text": piece, "checkable": True} for piece in pieces[:3]]
        return {"claims": claims}
    if schema_name == "ClaimVerdict":
        source_ids = re.findall(r"source_id=([^;]+)", user_prompt)
        snippet_match = re.search(r"snippet=(.+)", user_prompt)
        snippet = (snippet_match.group(1).strip() if snippet_match else "")[:180]
        excerpt = " ".join(snippet.split()[:20])
        evidence = []
        if source_ids and excerpt:
            evidence = [{
                "source_id": source_ids[0].strip(),
                "stance": "supports",
                "excerpt": excerpt,
            }]
        return {
            "verdict": "supported" if evidence else "unverifiable",
            "rationale": "Les sources confirmées décrivent le même fait." if evidence else "Les éléments disponibles ne suffisent pas.",
            "evidence": evidence,
            "limits": [] if evidence else ["aucune preuve exploitable"],
        }
    raise ValueError(f"No fake response configured for {schema_name}")
