from collections.abc import AsyncIterator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.core.config import Settings, get_settings

engine = None
SessionLocal: async_sessionmaker[AsyncSession] | None = None


def configure_engine(settings: Settings | None = None) -> async_sessionmaker[AsyncSession]:
    global engine, SessionLocal
    settings = settings or get_settings()
    url = settings.async_database_url
    kwargs: dict = {"echo": False}
    if url.startswith("sqlite"):
        kwargs["connect_args"] = {"check_same_thread": False}
        if ":memory:" in url or url.rstrip("/").endswith("sqlite+aiosqlite:/"):
            kwargs["poolclass"] = StaticPool
    engine = create_async_engine(url, **kwargs)
    SessionLocal = async_sessionmaker(engine, expire_on_commit=False)
    return SessionLocal


async def get_session() -> AsyncIterator[AsyncSession]:
    if SessionLocal is None:
        configure_engine()
    assert SessionLocal is not None
    async with SessionLocal() as session:
        yield session
