import asyncio
from datetime import datetime, timedelta, timezone

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select

from app.core.security import hash_password
from app.models import Run, Submission, User


@pytest.mark.asyncio
async def test_periodic_purger_runs(monkeypatch) -> None:
    import asyncio

    import app.main as main

    called = asyncio.Event()

    class Manager:
        async def purge_expired(self) -> int:
            called.set()
            return 0

    monkeypatch.setattr(main, "RUN_PURGE_INTERVAL_SECONDS", 0.01)
    task = asyncio.create_task(main._purge_expired_runs(Manager()))
    await asyncio.wait_for(called.wait(), timeout=1)
    task.cancel()
    with pytest.raises(asyncio.CancelledError):
        await task


@pytest.mark.asyncio
async def test_interrupted_runs_are_failed_on_startup() -> None:
    from app.main import app

    async with app.router.lifespan_context(app):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            factory = app.state.run_manager.session_factory
            async with factory() as session:
                user = User(email="interrupt@example.com", password_hash=hash_password("password12"))
                session.add(user)
                await session.flush()
                submission = Submission(
                    user_id=user.id,
                    type="text",
                    content="pending",
                    expires_at=datetime.now(timezone.utc) + timedelta(days=7),
                )
                session.add(submission)
                await session.flush()
                run = Run(
                    user_id=user.id,
                    submission_id=submission.id,
                    status="running",
                    current_step="investigation",
                )
                session.add(run)
                await session.commit()
                run_id = run.id
            count = await app.state.run_manager.recover_interrupted()
            assert count >= 1
            async with factory() as session:
                restored = await session.scalar(select(Run).where(Run.id == run_id))
                assert restored is not None
                assert restored.status == "failed"
                assert restored.error_code == "interrupted"
                events = await app.state.event_bus.replay(run_id)
                assert events[-1].type == "run.failed"
                assert events[-1].payload["code"] == "interrupted"
                del client


@pytest.mark.asyncio
async def test_event_bus_serializes_concurrent_sequences_and_closes_terminal_replay(
    client, monkeypatch
) -> None:
    from app.main import app

    factory = app.state.run_manager.session_factory
    async with factory() as session:
        user = User(email="event-sequence@example.com", password_hash=hash_password("password12"))
        session.add(user)
        await session.flush()
        submission = Submission(
                user_id=user.id,
                type="text",
                content="event sequence",
                expires_at=datetime.now(timezone.utc) + timedelta(days=7),
        )
        session.add(submission)
        await session.flush()
        run = Run(
                user_id=user.id,
                submission_id=submission.id,
                status="running",
                current_step="investigation",
        )
        session.add(run)
        await session.commit()
        run_id = run.id

    bus = app.state.event_bus
    await asyncio.gather(
        *[bus.emit(run_id, "claim.verdict", {"index": index}) for index in range(30)]
    )
    events = await bus.replay(run_id)
    sequences = [event.seq for event in events]
    assert sequences == list(range(1, 31))

    terminal_emitted = False

    async def report_terminal_after_initial_replay(_run_id: str) -> bool:
        nonlocal terminal_emitted
        if not terminal_emitted:
                await bus.emit(run_id, "report.ready", {"report_id": "test"})
                terminal_emitted = True
        return True

    monkeypatch.setattr(bus, "_has_terminal_event", report_terminal_after_initial_replay)
    replayed = [event async for event in bus.stream(run_id, after_seq=30)]
    assert [event.type for event in replayed] == ["report.ready"]
    terminal_seq = replayed[0].seq
    after_terminal = [
        event async for event in bus.stream(run_id, after_seq=terminal_seq)
    ]
    assert after_terminal == []


@pytest.mark.asyncio
async def test_delete_run_and_purge(client: AsyncClient, signup, wait_completed) -> None:
    await signup(client, "purge@example.com")
    created = await client.post(
        "/api/v1/submissions",
        json={"type": "text", "content": "La Lune orbite autour de la Terre."},
    )
    run_id = created.json()["run_id"]
    await wait_completed(client, run_id)
    deleted = await client.delete(f"/api/v1/runs/{run_id}")
    assert deleted.status_code == 200
    assert (await client.get(f"/api/v1/runs/{run_id}")).status_code == 404
    from app.main import app

    factory = app.state.run_manager.session_factory
    async with factory() as session:
        user = User(email="old@example.com", password_hash=hash_password("password12"))
        session.add(user)
        await session.flush()
        submission = Submission(
            user_id=user.id,
            type="text",
            content="old",
            expires_at=datetime.now(timezone.utc) - timedelta(days=1),
            created_at=datetime.now(timezone.utc) - timedelta(days=8),
        )
        session.add(submission)
        await session.flush()
        run = Run(
            user_id=user.id,
            submission_id=submission.id,
            status="completed",
            created_at=datetime.now(timezone.utc) - timedelta(days=8),
        )
        session.add(run)
        await session.commit()
    removed = await app.state.run_manager.purge_expired()
    assert removed >= 1
