from datetime import datetime, timezone

from fastapi import Cookie, Depends, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import Settings, get_settings
from app.core.errors import ApiError
from app.core.security import hash_token
from app.db.session import get_session
from app.models import AuthSession, User


def _as_utc_naive(value: datetime) -> datetime:
    if value.tzinfo is not None:
        return value.astimezone(timezone.utc).replace(tzinfo=None)
    return value


async def current_user(
    request: Request,
    session: AsyncSession = Depends(get_session),
    settings: Settings = Depends(get_settings),
    vera_session: str | None = Cookie(default=None),
) -> User:
    token = vera_session or request.cookies.get(settings.cookie_name)
    if not token:
        raise ApiError(401, "unauthenticated", "Authentication required")
    record = await session.scalar(
        select(AuthSession)
        .options(selectinload(AuthSession.user))
        .where(AuthSession.token_hash == hash_token(token))
    )
    if record is None or _as_utc_naive(record.expires_at) <= _as_utc_naive(datetime.now(timezone.utc)):
        raise ApiError(401, "unauthenticated", "Authentication required")
    return record.user
