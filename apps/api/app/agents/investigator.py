import asyncio

from app.agents.prompt_loader import load_prompt
from app.providers.base import LLMProvider, Usage
from app.schemas.agents import Investigation


class Investigator:
    def __init__(self, provider: LLMProvider) -> None:
        self.provider = provider

    async def investigate(self, claim: str, language: str = "fr") -> tuple[Investigation, Usage]:
        system = load_prompt("investigator")
        prompt = (
            f"Langue de réponse : {language}\nAffirmation : {claim}\n"
            "Cherche des sources fiables et datées sur cette affirmation, y compris "
            "des sources qui la contredisent. Cite chaque source."
        )
        investigation, usage = await self.provider.grounded_search(
            prompt=f"{system}\n\n{prompt}", timeout=90
        )
        if investigation.search_calls:
            return investigation, usage
        await asyncio.sleep(0)
        retry_prompt = prompt + "\nEffectue maintenant une recherche web explicite."
        retry, retry_usage = await self.provider.grounded_search(
            prompt=f"{system}\n\n{retry_prompt}", timeout=90
        )
        return retry, Usage(
            input_tokens=usage.input_tokens + retry_usage.input_tokens,
            output_tokens=usage.output_tokens + retry_usage.output_tokens,
            searches=usage.searches + retry_usage.searches,
            reported=usage.reported and retry_usage.reported,
        )
