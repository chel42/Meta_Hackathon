from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.deps import current_user
from app.core.errors import ApiError
from app.db.session import get_session
from app.models import Report, Run, User

router = APIRouter(tags=["reports"])


@router.get("/reports/{report_id}")
async def get_report(
    report_id: str,
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> dict:
    report = await session.scalar(
        select(Report)
        .options(selectinload(Report.run))
        .where(Report.id == report_id)
    )
    if report is None or report.run.user_id != user.id:
        raise ApiError(404, "not_found", "Resource not found")
    return report.payload
