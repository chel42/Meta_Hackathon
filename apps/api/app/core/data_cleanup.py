from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    ClaimRecord,
    EvidenceRecord,
    Report,
    Run,
    SourceRecord,
    Submission,
    TraceEvent,
)


async def delete_run_data(session: AsyncSession, run_ids: list[str]) -> None:
    if not run_ids:
        return

    run_id_query = select(Run.id).where(Run.id.in_(run_ids))
    claim_id_query = select(ClaimRecord.id).where(ClaimRecord.run_id.in_(run_id_query))
    submission_ids = list(
        await session.scalars(
            select(Run.submission_id).where(Run.id.in_(run_id_query))
        )
    )

    await session.execute(
        delete(EvidenceRecord).where(EvidenceRecord.claim_pk.in_(claim_id_query))
    )
    await session.execute(delete(ClaimRecord).where(ClaimRecord.run_id.in_(run_id_query)))
    await session.execute(delete(SourceRecord).where(SourceRecord.run_id.in_(run_id_query)))
    await session.execute(delete(Report).where(Report.run_id.in_(run_id_query)))
    await session.execute(delete(TraceEvent).where(TraceEvent.run_id.in_(run_id_query)))
    await session.execute(delete(Run).where(Run.id.in_(run_id_query)))
    if submission_ids:
        remaining_runs = (
            select(Run.id)
            .where(Run.submission_id == Submission.id)
            .exists()
        )
        await session.execute(
            delete(Submission).where(
                Submission.id.in_(submission_ids),
                ~remaining_runs,
            )
        )
