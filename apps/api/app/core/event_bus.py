import asyncio
from collections import defaultdict
from typing import Any, AsyncIterator

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.models import TraceEvent


class EventBus:
    def __init__(self, session_factory: async_sessionmaker[AsyncSession]) -> None:
        self.session_factory = session_factory
        self._queues: dict[str, list[asyncio.Queue[TraceEvent | None]]] = defaultdict(list)

    async def emit(self, run_id: str, event_type: str, payload: dict[str, Any] | None = None) -> TraceEvent:
        async with self.session_factory() as session:
            seq = await session.scalar(
                select(func.coalesce(func.max(TraceEvent.seq), 0)).where(TraceEvent.run_id == run_id)
            )
            event = TraceEvent(
                run_id=run_id,
                seq=int(seq or 0) + 1,
                type=event_type,
                payload=payload or {},
            )
            session.add(event)
            await session.commit()
        for queue in list(self._queues.get(run_id, [])):
            await queue.put(event)
        return event

    async def replay(self, run_id: str, after_seq: int = 0) -> list[TraceEvent]:
        async with self.session_factory() as session:
            result = await session.scalars(
                select(TraceEvent)
                .where(TraceEvent.run_id == run_id, TraceEvent.seq > after_seq)
                .order_by(TraceEvent.seq)
            )
            return list(result)

    def subscribe(self, run_id: str) -> asyncio.Queue[TraceEvent | None]:
        queue: asyncio.Queue[TraceEvent | None] = asyncio.Queue()
        self._queues[run_id].append(queue)
        return queue

    def unsubscribe(self, run_id: str, queue: asyncio.Queue[TraceEvent | None]) -> None:
        listeners = self._queues.get(run_id, [])
        if queue in listeners:
            listeners.remove(queue)
        if not listeners:
            self._queues.pop(run_id, None)

    def close(self, run_id: str) -> None:
        for queue in list(self._queues.get(run_id, [])):
            queue.put_nowait(None)

    async def stream(self, run_id: str, after_seq: int = 0) -> AsyncIterator[TraceEvent]:
        queue = self.subscribe(run_id)
        try:
            for event in await self.replay(run_id, after_seq):
                yield event
                after_seq = event.seq
                if event.type in {"report.ready", "run.failed"}:
                    return
            while True:
                item = await queue.get()
                if item is None:
                    return
                if item.seq <= after_seq:
                    continue
                yield item
                after_seq = item.seq
                if item.type in {"report.ready", "run.failed"}:
                    return
        finally:
            self.unsubscribe(run_id, queue)
