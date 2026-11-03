from datetime import datetime, timezone
from uuid import uuid4

from app.schemas.agents import Claim, ClaimVerdict, MediaAnalysis, SourceCheck
from app.schemas.proof import (
    Advice,
    ProofClaim,
    ProofEvidence,
    ProofReport,
    ProofSource,
    SourceSupportCheck,
    Trace,
)

GENERAL_LIMITS = [
    "la recherche web ne couvre pas toutes les sources",
    "la provenance d'une image n'est pas évaluée",
]


class ReportBuilder:
    def build(
        self,
        *,
        run_id: str,
        content: str,
        content_type: str,
        language: str,
        claims: list[Claim],
        verdicts: list[ClaimVerdict],
        sources: list[SourceCheck],
        provider: str,
        model: str,
        search_calls: int,
        budget_used: float,
        input_tokens: int = 0,
        output_tokens: int = 0,
        partial: bool = False,
        extraction_failed: bool = False,
        media_analysis: MediaAnalysis | None = None,
    ) -> ProofReport:
        source_map = {source.source_id: source for source in sources}
        proof_claims = [
            ProofClaim(
                claim_id=f"c{index}",
                text=claim.text,
                verdict=verdict.verdict if claim.checkable else "unverifiable",
                rationale=verdict.rationale if claim.checkable else "Cette affirmation n'est pas vérifiable.",
                evidence=[
                    ProofEvidence.model_validate(item.model_dump())
                    for item in verdict.evidence
                    if item.source_id in source_map
                    and source_map[item.source_id].status == "confirmed"
                ] if claim.checkable else [],
                limits=verdict.limits if claim.checkable else ["affirmation non vérifiable"],
            )
            for index, (claim, verdict) in enumerate(zip(claims, verdicts), start=1)
        ]
        proof_sources = [
            ProofSource(
                source_id=source.source_id,
                url=source.url,
                title=source.title,
                retrieved_at=datetime.now(timezone.utc),
                snippet=source.snippet,
                support_check=SourceSupportCheck(status=source.status),
            )
            for source in sources
        ]
        limits = list(GENERAL_LIMITS)
        if not claims:
            limits.append("aucune affirmation vérifiable")
        if extraction_failed:
            limits.append("extraction des affirmations non validée")
        if partial:
            limits.append("rapport partiel : budget maximal atteint")
        if any(source.status != "confirmed" for source in sources):
            limits.append("certaines sources citées n'ont pas été confirmées dans les résultats bruts")
        contradicted = any(claim.verdict == "contradicted" for claim in proof_claims)
        return ProofReport(
            report_id=str(uuid4()),
            run_id=run_id,
            input={"type": content_type, "language": language, "excerpt": content[:500]},
            claims=proof_claims,
            sources=proof_sources,
            media_analysis=media_analysis,
            limits=limits,
            advice=Advice(
                level="avoid_sharing" if contradicted else "verify_source",
                text=(
                    "Évitez de partager ce contenu sans contexte."
                    if contradicted
                    else "Vérifiez les sources et le contexte avant de partager."
                ),
            ),
            trace=Trace(
                provider=provider,
                model=model,
                search_calls=search_calls,
                budget_used=budget_used,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
            ),
        )
