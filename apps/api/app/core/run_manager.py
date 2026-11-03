import asyncio
import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from app.agents.pipeline import AgentPipeline
from app.schemas.proof import ProofReport

logger = logging.getLogger(__name__)


@dataclass
class RunState:
    run_id: str
    status: str = "queued"
    current_step: str = "intake"
    report: ProofReport | None = None
    error_code: str | None = None
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    events: list[dict[str, Any]] = field(default_factory=list)


class RunManager:
    def __init__(self, pipeline: AgentPipeline, max_concurrent: int = 3) -> None:
        self.pipeline = pipeline
        self.semaphore = asyncio.Semaphore(max_concurrent)
        self.runs: dict[str, RunState] = {}
        self.tasks: set[asyncio.Task[None]] = set()

    def submit(self, content: str, language: str = "fr") -> str:
        run_id = str(uuid4())
        state = RunState(run_id=run_id)
        self.runs[run_id] = state
        task = asyncio.create_task(self._execute(state, content, language))
        self.tasks.add(task)
        task.add_done_callback(self.tasks.discard)
        return run_id

    async def _execute(self, state: RunState, content: str, language: str) -> None:
        async with self.semaphore:
            state.status = "running"
            state.current_step = "claim_extraction"
            try:
                result = await self.pipeline.run(
                    content, run_id=state.run_id, language=language
                )
                state.report = result.report
                state.status = "completed"
                state.current_step = "report_generation"
            except Exception:
                state.status = "failed"
                state.error_code = "provider_unavailable"
                logger.exception("Run %s failed", state.run_id)

    def get(self, run_id: str) -> RunState | None:
        return self.runs.get(run_id)
