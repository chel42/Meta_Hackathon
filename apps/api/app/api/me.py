from fastapi import APIRouter, Depends, Response
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings, get_settings
from app.core.cookies import clear_session_cookie
from app.core.data_cleanup import delete_run_data
from app.core.deps import current_user
from app.core.errors import ApiError
from app.core.security import hash_password, verify_password
from app.db.session import get_session
from app.models import AuthSession, ClaimRecord, Run, Submission, User
from app.schemas.api import AccountDelete, PasswordChange, ProfileUpdate

router = APIRouter(tags=["me"])


@router.get("/me")
async def read_me(
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> dict:
    runs_total = await session.scalar(select(func.count()).select_from(Run).where(Run.user_id == user.id))
    verdict_rows = await session.execute(
        select(ClaimRecord.verdict, func.count())
        .join(Run, Run.id == ClaimRecord.run_id)
        .where(Run.user_id == user.id)
        .group_by(ClaimRecord.verdict)
    )
    verdicts = {row[0]: row[1] for row in verdict_rows}
    return {
        "id": user.id,
        "email": user.email,
        "display_name": user.display_name,
        "language": user.language,
        "runs_total": int(runs_total or 0),
        "verdicts": {
            "supported": int(verdicts.get("supported", 0)),
            "contradicted": int(verdicts.get("contradicted", 0)),
            "unverifiable": int(verdicts.get("unverifiable", 0)),
        },
    }


@router.patch("/me")
async def update_me(
    payload: ProfileUpdate,
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> dict:
    if payload.display_name is not None:
        user.display_name = payload.display_name
    if payload.language is not None:
        user.language = payload.language
    await session.commit()
    return {"id": user.id, "email": user.email, "display_name": user.display_name, "language": user.language}


@router.post("/me/password")
async def change_password(
    payload: PasswordChange,
    response: Response,
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
    settings: Settings = Depends(get_settings),
) -> dict:
    if not verify_password(payload.current_password, user.password_hash):
        raise ApiError(401, "unauthenticated", "Invalid email or password")
    user.password_hash = hash_password(payload.new_password)
    await session.execute(AuthSession.__table__.delete().where(AuthSession.user_id == user.id))
    await session.commit()
    clear_session_cookie(response, settings)
    return {"status": "ok"}


@router.delete("/me")
async def delete_me(
    payload: AccountDelete,
    response: Response,
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
    settings: Settings = Depends(get_settings),
) -> dict:
    if not verify_password(payload.password, user.password_hash):
        raise ApiError(401, "unauthenticated", "Invalid email or password")
    run_ids = list(
        await session.scalars(select(Run.id).where(Run.user_id == user.id))
    )
    await delete_run_data(session, run_ids)
    await session.execute(delete(Submission).where(Submission.user_id == user.id))
    await session.execute(delete(AuthSession).where(AuthSession.user_id == user.id))
    await session.execute(delete(User).where(User.id == user.id))
    await session.commit()
    clear_session_cookie(response, settings)
    return {"status": "deleted"}
