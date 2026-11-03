from typing import TypeVar

from openai import APIStatusError
from pydantic import BaseModel

from app.providers.base import LLMProvider, Usage
from app.schemas.agents import Investigation

T = TypeVar("T", bound=BaseModel)


class FallbackProvider:
    name = "meta-with-fallback"

    def __init__(self, primary: LLMProvider, fallback: LLMProvider) -> None:
        self.primary = primary
        self.fallback = fallback
        self.model = primary.model

    async def _invoke(self, method_name: str, **kwargs):
        try:
            return await getattr(self.primary, method_name)(**kwargs)
        except APIStatusError as exc:
            if exc.status_code != 429 and exc.status_code < 500:
                raise
            result = await getattr(self.fallback, method_name)(**kwargs)
            self.name = f"{self.primary.name}+{self.fallback.name}"
            self.model = self.fallback.model
            return result

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
        return await self._invoke(
            "generate_json",
            schema_name=schema_name,
            output_model=output_model,
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            reasoning_effort=reasoning_effort,
            timeout=timeout,
        )

    async def grounded_search(
        self, *, prompt: str, timeout: float
    ) -> tuple[Investigation, Usage]:
        return await self._invoke("grounded_search", prompt=prompt, timeout=timeout)

    async def describe_image(
        self, *, image_data_url: str, caption: str, timeout: float
    ) -> tuple[BaseModel, Usage]:
        return await self._invoke(
            "describe_image",
            image_data_url=image_data_url,
            caption=caption,
            timeout=timeout,
        )
