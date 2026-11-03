from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings, get_settings
from app.core.cookies import clear_session_cookie, set_session_cookie
from app.core.deps import current_user
from app.core.errors import ApiError
from app.core.rate_limit import login_limiter
from app.core.security import hash_password, hash_token, new_session_token, session_expiry, verify_password
from app.db.session import get_session
from app.models import AuthSession, User
from app.schemas.api import LoginRequest, RegisterRequest

router = APIRouter(tags=["auth"])


async def _open_session(session: AsyncSession, user: User, request: Request, settings: Settings) -> str:
    token = new_session_token()
    session.add(
        AuthSession(
            user_id=user.id,
            token_hash=hash_token(token),
            expires_at=session_expiry(settings.session_days),
            user_agent=request.headers.get("user-agent", "")[:512],
        )
    )
    await session.commit()
    return token


@router.post("/auth/register", status_code=201)
async def register(
    payload: RegisterRequest,
    request: Request,
    response: Response,
    session: AsyncSession = Depends(get_session),
    settings: Settings = Depends(get_settings),
) -> dict:
    email = payload.email.lower()
    existing = await session.scalar(select(User).where(User.email == email))
    if existing:
        raise ApiError(409, "email_taken", "An account already exists for this email")
    user = User(
        email=email,
        password_hash=hash_password(payload.password),
        display_name=payload.display_name or email.split("@")[0],
        language=payload.language,
    )
    session.add(user)
    await session.flush()
    token = await _open_session(session, user, request, settings)
    set_session_cookie(response, token, settings)
    return {"id": user.id, "email": user.email, "display_name": user.display_name}


@router.post("/auth/login")
async def login(
    payload: LoginRequest,
    request: Request,
    response: Response,
    session: AsyncSession = Depends(get_session),
    settings: Settings = Depends(get_settings),
) -> dict:
    email = payload.email.lower()
    ip = request.client.host if request.client else "unknown"
    login_limiter.hit(
        f"{ip}:{email}",
        limit=settings.login_attempts_per_minute,
        window_seconds=60,
    )
    user = await session.scalar(select(User).where(User.email == email))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise ApiError(401, "unauthenticated", "Invalid email or password")
    token = await _open_session(session, user, request, settings)
    set_session_cookie(response, token, settings)
    return {"id": user.id, "email": user.email, "display_name": user.display_name}


@router.post("/auth/logout")
async def logout(
    request: Request,
    response: Response,
    session: AsyncSession = Depends(get_session),
    settings: Settings = Depends(get_settings),
) -> dict:
    token = request.cookies.get(settings.cookie_name)
    if token:
        record = await session.scalar(select(AuthSession).where(AuthSession.token_hash == hash_token(token)))
        if record:
            await session.delete(record)
            await session.commit()
    clear_session_cookie(response, settings)
    return {"status": "ok"}


@router.get("/auth/me")
async def auth_me(user: User = Depends(current_user)) -> dict:
    return {"id": user.id, "email": user.email, "display_name": user.display_name, "language": user.language}
