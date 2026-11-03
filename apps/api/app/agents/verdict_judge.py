import re
from urllib.parse import urlsplit

from app.agents.prompt_loader import load_prompt
from app.providers.base import LLMProvider, Usage
from app.schemas.agents import ClaimVerdict, SourceCheck


def normalize_excerpt(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip().casefold()


class VerdictJudge:
    def __init__(self, provider: LLMProvider) -> None:
        self.provider = provider

    async def judge(
        self, claim: str, sources: list[SourceCheck], language: str = "fr"
    ) -> tuple[ClaimVerdict, Usage]:
        confirmed = [source for source in sources if source.status == "confirmed"]
        if not confirmed:
            return ClaimVerdict(
                verdict="unverifiable",
                rationale="Aucune source confirmée n'est disponible.",
                evidence=[],
                limits=["aucune source confirmée"],
            ), Usage()

        source_text = "\n".join(
            f"- source_id={source.source_id}; domaine={urlsplit(str(source.url)).hostname}; "
            f"date=non disponible; snippet={source.snippet[:600]}"
            for source in confirmed
        )
        candidate, usage = await self.provider.generate_json(
            schema_name="ClaimVerdict",
            output_model=ClaimVerdict,
            system_prompt=load_prompt("verdict_judge"),
            user_prompt=(
                f"Langue : {language}\nAffirmation : {claim}\n"
                f"Sources confirmées uniquement :\n{source_text}"
            ),
            reasoning_effort="medium",
            timeout=45,
        )

        snippets = {source.source_id: normalize_excerpt(source.snippet) for source in confirmed}
        evidence = [
            item
            for item in candidate.evidence
            if item.source_id in snippets
            and normalize_excerpt(item.excerpt)
            and normalize_excerpt(item.excerpt) in snippets[item.source_id]
        ]
        stances = {item.stance for item in evidence}
        limits = list(candidate.limits)
        if "supports" in stances and "contradicts" in stances:
            verdict = "unverifiable"
            if "sources divergentes" not in limits:
                limits.append("sources divergentes")
        elif "contradicts" in stances:
            verdict = "contradicted"
        elif "supports" in stances:
            verdict = "supported"
        else:
            verdict = "unverifiable"
            if not any(item in limits for item in ("aucune preuve exploitable", "extraits non vérifiables")):
                limits.append("extraits non vérifiables")
        return candidate.model_copy(update={"verdict": verdict, "evidence": evidence, "limits": limits}), usage
