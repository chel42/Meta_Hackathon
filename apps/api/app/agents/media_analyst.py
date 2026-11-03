from app.agents.prompt_loader import load_prompt
from app.providers.base import LLMProvider, Usage
from app.schemas.agents import MediaAnalysis


class MediaAnalyst:
    def __init__(self, provider: LLMProvider) -> None:
        self.provider = provider

    async def analyze(
        self, image_data_url: str, caption: str, language: str = "fr"
    ) -> tuple[MediaAnalysis, Usage]:
        result, usage = await self.provider.describe_image(
            image_data_url=image_data_url,
            caption=f"Langue : {language}\n{caption}",
            timeout=45,
        )
        return MediaAnalysis.model_validate(
            result.model_dump() | {"provenance": "not_assessed"}
        ), usage
