from app.agents.prompt_loader import load_prompt
from app.providers.base import LLMProvider, Usage
from app.schemas.agents import ClaimList


class ClaimExtractor:
    def __init__(self, provider: LLMProvider) -> None:
        self.provider = provider

    async def extract(self, content: str, language: str = "fr") -> tuple[ClaimList, Usage]:
        return await self.provider.generate_json(
            schema_name="ClaimList",
            output_model=ClaimList,
            system_prompt=load_prompt("claim_extractor"),
            user_prompt=f"Langue de réponse : {language}\n\nContenu à analyser :\n{content}",
            reasoning_effort="low",
            timeout=45,
        )
