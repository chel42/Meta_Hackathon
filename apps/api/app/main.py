import logging
from contextlib import asynccontextmanager
import asyncio
from uuid import uuid4

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.agents.pipeline import AgentPipeline
from app.api.auth import router as auth_router
from app.api.health import router as health_router
from app.api.me import router as me_router
from app.api.reports import router as reports_router
from app.api.runs import router as runs_router
from app.api.submissions import router as submissions_router
from app.core.config import get_settings
from app.core.errors import error_body, register_exception_handlers
from app.core.event_bus import EventBus
from app.core.run_manager import RunManager
from app.db import session as db_session
from app.db.base import Base
from app.models import entities as _models  # noqa: F401
from app.providers.factory import create_provider

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("vera")
RUN_PURGE_INTERVAL_SECONDS = 3600


async def initialize_runtime_state(app: FastAPI) -> None:
    if getattr(app.state, "runtime_initialized", False) and getattr(app.state, "run_manager", None) is not None:
        return
    settings = get_settings()
    session_factory = db_session.configure_engine(settings)
    assert db_session.engine is not None
    async with db_session.engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    provider = create_provider()
    pipeline = AgentPipeline(
        provider,
        budget_usd=settings.run_budget_usd,
        token_input_usd_per_million=settings.token_input_usd_per_million,
        token_output_usd_per_million=settings.token_output_usd_per_million,
        search_usd=settings.search_usd,
    )
    event_bus = EventBus(session_factory)
    run_manager = RunManager(pipeline, session_factory, event_bus, settings)
    interrupted = await run_manager.recover_interrupted()
    if interrupted:
        logger.info("Marked interrupted runs as failed count=%s", interrupted)
    purged = await run_manager.purge_expired()
    if purged:
        logger.info("Purged expired runs count=%s", purged)
    app.state.settings = settings
    app.state.provider = provider
    app.state.pipeline = pipeline
    app.state.event_bus = event_bus
    app.state.run_manager = run_manager
    app.state.runtime_initialized = True


async def _purge_expired_runs(run_manager: RunManager) -> None:
    while True:
        await asyncio.sleep(RUN_PURGE_INTERVAL_SECONDS)
        try:
            purged = await run_manager.purge_expired()
            if purged:
                logger.info("Purged expired runs count=%s", purged)
        except Exception:
            logger.exception("Periodic expired-run purge failed")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await initialize_runtime_state(app)
    purge_task = asyncio.create_task(_purge_expired_runs(app.state.run_manager))
    try:
        yield
    finally:
        purge_task.cancel()
        try:
            await purge_task
        except asyncio.CancelledError:
            pass
        app.state.runtime_initialized = False
        if db_session.engine is not None:
            await db_session.engine.dispose()


app = FastAPI(
    title="VERA API",
    version="0.2.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)
register_exception_handlers(app)
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(health_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(me_router, prefix="/api/v1")
app.include_router(submissions_router, prefix="/api/v1")
app.include_router(runs_router, prefix="/api/v1")
app.include_router(reports_router, prefix="/api/v1")


@app.middleware("http")
async def request_context(request: Request, call_next):
    request.state.request_id = request.headers.get("x-request-id") or str(uuid4())
    if not getattr(request.app.state, "runtime_initialized", False):
        await initialize_runtime_state(request.app)
    settings = get_settings()
    if request.method in {"POST", "PUT", "PATCH", "DELETE"} and request.url.path.startswith("/api/"):
        origin = request.headers.get("origin")
        if origin and origin.rstrip("/") not in settings.origins:
            return JSONResponse(
                status_code=403,
                content=error_body("forbidden", "Origin is not allowed", request.state.request_id),
            )
    response = await call_next(request)
    response.headers["X-Request-ID"] = request.state.request_id
    return response
