import json
from base64 import urlsafe_b64decode, urlsafe_b64encode
from datetime import datetime

from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import StreamingResponse
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import current_user
from app.core.errors import ApiError
from app.core.event_bus import EventBus
from app.core.run_manager import RunManager
from app.db.session import get_session
from app.models import ClaimRecord, Run, Submission, User

router = APIRouter(tags=["runs"])


def _encode_cursor(created_at: datetime, run_id: str) -> str:
    raw = f"{created_at.isoformat()}|{run_id}".encode("utf-8")
    return urlsafe_b64encode(raw).decode("ascii")


def _decode_cursor(cursor: str) -> tuple[datetime, str]:
    try:
        stamp, run_id = urlsafe_b64decode(cursor.encode("ascii")).decode("utf-8").split("|", 1)
        return datetime.fromisoformat(stamp), run_id
    except Exception as exc:
        raise ApiError(422, "invalid_input", "The request payload is invalid") from exc


@router.get("/runs")
async def list_runs(
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
    status: str | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=50),
    cursor: str | None = Query(default=None),
) -> dict:
    query = (
        select(Run, Submission.content)
        .join(Submission, Submission.id == Run.submission_id)
        .where(Run.user_id == user.id)
    )
    if status:
        query = query.where(Run.status == status)
    if cursor:
        created_at, run_id = _decode_cursor(cursor)
        query = query.where(
            (Run.created_at < created_at) | ((Run.created_at == created_at) & (Run.id < run_id))
        )
    query = query.order_by(Run.created_at.desc(), Run.id.desc()).limit(limit + 1)
    rows = (await session.execute(query)).all()
    page = rows[:limit]
    items = []
    for run, content in page:
        counts = dict(
            (
                await session.execute(
                    select(ClaimRecord.verdict, func.count())
                    .where(ClaimRecord.run_id == run.id)
                    .group_by(ClaimRecord.verdict)
                )
            ).all()
        )
        items.append(
            {
                "run_id": run.id,
                "status": run.status,
                "created_at": run.created_at.isoformat(),
                "excerpt": (content or "")[:180],
                "verdicts": {
                    "supported": int(counts.get("supported", 0)),
                    "contradicted": int(counts.get("contradicted", 0)),
                    "unverifiable": int(counts.get("unverifiable", 0)),
                },
                "report_id": run.report_id,
            }
        )
    next_cursor = None
    if len(rows) > limit:
        last = page[-1][0]
        next_cursor = _encode_cursor(last.created_at, last.id)
    return {"items": items, "next_cursor": next_cursor}


@router.get("/runs/{run_id}")
async def get_run(
    run_id: str,
    request: Request,
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> dict:
    manager: RunManager = request.app.state.run_manager
    run = await manager.get_owned_run(session, run_id, user.id)
    if run is None:
        raise ApiError(404, "not_found", "Resource not found")
    return {
        "run_id": run.id,
        "status": run.status,
        "current_step": run.current_step,
        "budget_used": run.budget_used,
        "report_id": run.report_id,
        "error": {"code": run.error_code} if run.error_code else None,
    }


@router.get("/runs/{run_id}/stream")
async def stream_run(
    run_id: str,
    request: Request,
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> StreamingResponse:
    manager: RunManager = request.app.state.run_manager
    run = await manager.get_owned_run(session, run_id, user.id)
    if run is None:
        raise ApiError(404, "not_found", "Resource not found")
    last_event_id = request.headers.get("last-event-id", "0")
    try:
        after_seq = int(last_event_id)
    except ValueError:
        after_seq = 0
    bus: EventBus = request.app.state.event_bus

    async def events():
        async for event in bus.stream(run_id, after_seq):
            data = json.dumps(event.payload, default=str)
            yield f"id: {event.seq}\nevent: {event.type}\ndata: {data}\n\n"

    return StreamingResponse(
        events(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.delete("/runs/{run_id}")
async def delete_run(
    run_id: str,
    request: Request,
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> dict:
    manager: RunManager = request.app.state.run_manager
    run = await manager.get_owned_run(session, run_id, user.id)
    if run is None:
        raise ApiError(404, "not_found", "Resource not found")
    await manager.delete_run(run_id, user.id)
    return {"status": "deleted"}
