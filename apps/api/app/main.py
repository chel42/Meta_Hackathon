import os

from fastapi import FastAPI

from app.api.health import router as health_router
from app.agents.pipeline import AgentPipeline
from app.core.run_manager import RunManager
from app.providers.factory import create_provider

app = FastAPI(
    title="TRAUNES AI API",
    version="0.1.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)

provider = create_provider()
app.state.provider = provider
app.state.pipeline = AgentPipeline(
    provider,
    budget_usd=float(os.getenv("RUN_BUDGET_USD", "0.50")),
    token_input_usd_per_million=float(os.getenv("TOKEN_INPUT_USD_PER_MILLION", "0")),
    token_output_usd_per_million=float(os.getenv("TOKEN_OUTPUT_USD_PER_MILLION", "0")),
    search_usd=float(os.getenv("SEARCH_USD", "0")),
)
app.state.run_manager = RunManager(app.state.pipeline)
app.include_router(health_router, prefix="/api/v1")
