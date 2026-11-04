import asyncio
import logging
from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import uuid4

from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from sqlalchemy.orm import selectinload

from app.agents.pipeline import AgentPipeline
from app.core.config import Settings
from app.core.data_cleanup import delete_run_data
from app.core.event_bus import EventBus
from app.models import (
    ClaimRecord,
    EvidenceRecord,
    Report,
    Run,
    SourceRecord,
    Submission,
)
from app.schemas.proof import ProofReport

logger = logging.getLogger(__name__)


def utc_now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class RunManager:
    def __init__(
        self,
        pipeline: AgentPipeline,
        session_factory: async_sessionmaker[AsyncSession],
        event_bus: EventBus,
        settings: Settings,
    ) -> None:
        self.pipeline = pipeline
        self.session_factory = session_factory
        self.event_bus = event_bus
        self.settings = settings
        self.semaphore = asyncio.Semaphore(settings.max_concurrent_runs)
        self.tasks: set[asyncio.Task[None]] = set()

    async def recover_interrupted(self) -> int:
        async with self.session_factory() as session:
            run_ids = list(
                await session.scalars(
                    select(Run.id).where(Run.status.in_(("queued", "running")))
                )
            )
        for run_id in run_ids:
            await self.event_bus.emit(
                run_id,
                "run.failed",
                {"code": "interrupted", "retryable": False},
                run_update={
                    "status": "failed",
                    "error_code": "interrupted",
                    "finished_at": utc_now(),
                },
            )
        return len(run_ids)

    async def submit(
        self,
        *,
        user_id: str,
        content: str,
        content_type: str,
        language: str,
        image_data_url: str | None = None,
    ) -> str:
        run_id = str(uuid4())
        async with self.session_factory() as session:
            submission = Submission(
                user_id=user_id,
                type=content_type,
                content=content[: self.settings.max_content_chars],
                language=language,
                expires_at=utc_now() + timedelta(days=self.settings.retention_days),
            )
            session.add(submission)
            await session.flush()
            run = Run(
                id=run_id,
                user_id=user_id,
                submission_id=submission.id,
                status="queued",
                current_step="intake",
            )
            session.add(run)
            await session.commit()
        task = asyncio.create_task(
            self._execute(run_id, content, content_type, language, image_data_url)
        )
        self.tasks.add(task)
        task.add_done_callback(self.tasks.discard)
        return run_id

    async def _execute(
        self,
        run_id: str,
        content: str,
        content_type: str,
        language: str,
        image_data_url: str | None,
    ) -> None:
        async with self.semaphore:
            await self._set_run(run_id, status="running", current_step="intake")
            await self.event_bus.emit(run_id, "run.started", {"run_id": run_id})

            async def emit(event_type: str, payload: dict[str, Any] | None = None) -> None:
                if event_type.startswith("step."):
                    step = (payload or {}).get("step")
                    if event_type == "step.started" and step:
                        await self._set_run(run_id, current_step=str(step))
                if event_type == "budget.update":
                    value = (payload or {}).get("budget_used")
                    await self._set_run(
                        run_id,
                        budget_used=float(value) if value is not None else None,
                    )
                await self.event_bus.emit(run_id, event_type, payload or {})

            try:
                result = await asyncio.wait_for(
                    self.pipeline.run(
                        content,
                        run_id=run_id,
                        content_type=content_type,
                        language=language,
                        image_data_url=image_data_url,
                        emit=emit,
                    ),
                    timeout=self.settings.run_timeout_seconds,
                )
                await self._persist_report(run_id, result.report)
                await self.event_bus.emit(
                    run_id,
                    "report.ready",
                    {"report_id": result.report.report_id},
                    run_update={
                        "status": "completed",
                        "current_step": "report_generation",
                        "report_id": result.report.report_id,
                        "budget_used": result.report.trace.budget_used,
                        "finished_at": utc_now(),
                    },
                )
            except Exception as exc:
                code = "interrupted" if isinstance(exc, TimeoutError | asyncio.TimeoutError) else "provider_unavailable"
                logger.exception("Run %s failed", run_id)
                await self.event_bus.emit(
                    run_id,
                    "run.failed",
                    {"code": code, "retryable": code != "interrupted"},
                    run_update={
                        "status": "failed",
                        "error_code": code,
                        "finished_at": utc_now(),
                    },
                )
            finally:
                self.event_bus.close(run_id)

    async def _set_run(self, run_id: str, **values: Any) -> None:
        async with self.session_factory() as session:
            await session.execute(update(Run).where(Run.id == run_id).values(**values))
            await session.commit()

    async def _persist_report(self, run_id: str, report: ProofReport) -> None:
        payload = report.model_dump(mode="json")
        async with self.session_factory() as session:
            session.add(Report(id=report.report_id, run_id=run_id, schema_version=report.schema_version, payload=payload))
            for claim in report.claims:
                record = ClaimRecord(
                    run_id=run_id,
                    claim_id=claim.claim_id,
                    text=claim.text,
                    verdict=claim.verdict,
                    rationale=claim.rationale,
                )
                session.add(record)
                await session.flush()
                for item in claim.evidence:
                    session.add(
                        EvidenceRecord(
                            claim_pk=record.id,
                            source_id=item.source_id,
                            stance=item.stance,
                            excerpt=item.excerpt,
                        )
                    )
            for source in report.sources:
                session.add(
                    SourceRecord(
                        run_id=run_id,
                        source_id=source.source_id,
                        url=str(source.url),
                        title=source.title,
                        publisher=source.publisher,
                        support_status=source.support_check.status,
                        snippet=source.snippet,
                    )
                )
            await session.commit()

    async def get_owned_run(self, session: AsyncSession, run_id: str, user_id: str) -> Run | None:
        return await session.scalar(
            select(Run)
            .options(selectinload(Run.submission), selectinload(Run.claims))
            .where(Run.id == run_id, Run.user_id == user_id)
        )

    async def delete_run(self, run_id: str, user_id: str) -> bool:
        async with self.session_factory() as session:
            exists = await session.scalar(
                select(Run.id).where(Run.id == run_id, Run.user_id == user_id)
            )
            if exists is None:
                return False
            await delete_run_data(session, [run_id])
            await session.commit()
            return True

    async def purge_expired(self) -> int:
        cutoff = utc_now() - timedelta(days=self.settings.retention_days)
        async with self.session_factory() as session:
            expired_submission_ids = list(
                await session.scalars(
                    select(Submission.id).where(Submission.created_at < cutoff)
                )
            )
            expired_run_ids = list(
                await session.scalars(
                    select(Run.id).where(
                        (Run.created_at < cutoff)
                        | Run.submission_id.in_(expired_submission_ids)
                    )
                )
            )
            await delete_run_data(session, expired_run_ids)
            await session.execute(
                delete(Submission).where(Submission.created_at < cutoff)
            )
            await session.commit()
            return len(expired_run_ids)
