from datetime import datetime, timedelta, timezone

import pytest
from httpx import AsyncClient
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from app.main import app
from app.models import AuthSession, ClaimRecord, EvidenceRecord, Report, Run, SourceRecord, Submission, TraceEvent, User


@pytest.mark.asyncio
async def test_submission_run_report_and_history(client: AsyncClient, signup, wait_completed) -> None:
    await signup(client, "owner@example.com")
    created = await client.post(
        "/api/v1/submissions",
        json={"type": "text", "content": "Paris est la capitale de la France.", "language": "fr"},
    )
    assert created.status_code == 202
    run_id = created.json()["run_id"]
    run = await wait_completed(client, run_id)
    assert run["status"] == "completed"
    assert run["report_id"]
    report = await client.get(f"/api/v1/reports/{run['report_id']}")
    assert report.status_code == 200
    proof = report.json()
    assert proof["schema_version"] == "1.0"
    assert proof["run_id"] == run_id
    history = await client.get("/api/v1/runs?limit=10")
    assert history.status_code == 200
    assert history.json()["items"][0]["run_id"] == run_id


@pytest.mark.asyncio
async def test_user_isolation_returns_404(client: AsyncClient, signup, wait_completed) -> None:
    await signup(client, "alice@example.com")
    created = await client.post(
        "/api/v1/submissions",
        json={"type": "text", "content": "Le Nil traverse l'Egypte."},
    )
    run_id = created.json()["run_id"]
    await wait_completed(client, run_id)
    report_id = (await client.get(f"/api/v1/runs/{run_id}")).json()["report_id"]
    from httpx import ASGITransport

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as other:
        await signup(other, "bob@example.com")
        hidden_run = await other.get(f"/api/v1/runs/{run_id}")
        hidden_report = await other.get(f"/api/v1/reports/{report_id}")
        hidden_stream = await other.get(f"/api/v1/runs/{run_id}/stream")
        hidden_delete = await other.delete(f"/api/v1/runs/{run_id}")
    assert hidden_run.status_code == 404
    assert hidden_report.status_code == 404
    assert hidden_stream.status_code == 404
    assert hidden_delete.status_code == 404
    assert hidden_run.json()["error"]["code"] == "not_found"


@pytest.mark.asyncio
async def test_sse_replay_has_stable_ids(client: AsyncClient, signup, wait_completed) -> None:
    await signup(client, "sse@example.com")
    created = await client.post(
        "/api/v1/submissions",
        json={"type": "text", "content": "La Terre orbite autour du Soleil."},
    )
    run_id = created.json()["run_id"]
    await wait_completed(client, run_id)

    async def read_events(last_id: str | None = None) -> list[tuple[str, str]]:
        headers = {"Accept": "text/event-stream"}
        if last_id is not None:
            headers["Last-Event-ID"] = last_id
        events: list[tuple[str, str]] = []
        async with client.stream("GET", f"/api/v1/runs/{run_id}/stream", headers=headers) as stream:
            event_name = ""
            event_id = ""
            async for line in stream.aiter_lines():
                if line.startswith("id:"):
                    event_id = line.split(":", 1)[1].strip()
                elif line.startswith("event:"):
                    event_name = line.split(":", 1)[1].strip()
                elif line == "" and event_name:
                    events.append((event_id, event_name))
                    if event_name in {"report.ready", "run.failed"}:
                        break
                    event_name = ""
        return events

    first = await read_events()
    assert first
    assert first[0][1] == "run.started"
    assert first[-1][1] in {"report.ready", "run.failed"}
    ids = [item[0] for item in first]
    assert ids == sorted(ids, key=int)
    assert len(ids) == len(set(ids))
    resumed = await read_events(last_id=ids[0])
    assert [item[0] for item in resumed] == ids[1:]


@pytest.mark.asyncio
async def test_invalid_submission_and_unauthenticated(client: AsyncClient, signup) -> None:
    denied = await client.post("/api/v1/submissions", json={"type": "text", "content": "x"})
    assert denied.status_code == 401
    await signup(client, "valid@example.com")
    empty = await client.post("/api/v1/submissions", json={"type": "text", "content": ""})
    assert empty.status_code == 422
    huge = await client.post("/api/v1/submissions", json={"type": "text", "content": "a" * 8001})
    assert huge.status_code == 422


@pytest.mark.asyncio
async def test_profile_password_and_account_delete(client: AsyncClient, signup) -> None:
    await signup(client, "profile@example.com")
    patched = await client.patch("/api/v1/me", json={"display_name": "Vera"})
    assert patched.json()["display_name"] == "Vera"
    old_cookie = client.cookies.get("vera_session")
    assert old_cookie
    changed = await client.post(
        "/api/v1/me/password",
        json={"current_password": "password12", "new_password": "password99"},
    )
    assert changed.status_code == 200
    assert (await client.get("/api/v1/me")).status_code == 401
    stale_session = await client.get(
        "/api/v1/me",
        headers={"Cookie": f"vera_session={old_cookie}"},
    )
    assert stale_session.status_code == 401
    login = await client.post(
        "/api/v1/auth/login",
        json={"email": "profile@example.com", "password": "password99"},
    )
    assert login.status_code == 200
    delete_cookie = client.cookies.get("vera_session")
    assert delete_cookie
    deleted = await client.request(
        "DELETE",
        "/api/v1/me",
        json={"password": "password99"},
    )
    assert deleted.status_code == 200
    stale_after_delete = await client.get(
        "/api/v1/me",
        headers={"Cookie": f"vera_session={delete_cookie}"},
    )
    assert stale_after_delete.status_code == 401
    again = await client.post(
        "/api/v1/auth/login",
        json={"email": "profile@example.com", "password": "password99"},
    )
    assert again.status_code == 401


@pytest.mark.asyncio
async def test_account_delete_revokes_all_sessions(
    client: AsyncClient, signup, wait_completed
) -> None:
    await signup(client, "delete-account@example.com")
    created = await client.post(
        "/api/v1/submissions",
        json={"type": "text", "content": "Paris est la capitale de la France."},
    )
    assert created.status_code == 202
    await wait_completed(client, created.json()["run_id"])
    from httpx import ASGITransport

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as second_session:
        login = await second_session.post(
            "/api/v1/auth/login",
            json={"email": "delete-account@example.com", "password": "password12"},
        )
        assert login.status_code == 200
        old_cookie = second_session.cookies.get("vera_session")
        assert old_cookie

        factory = app.state.run_manager.session_factory
        async with factory() as session:
            sessions_before = await session.scalar(
                select(func.count()).select_from(AuthSession)
            )
        assert sessions_before == 2

        deleted = await client.request(
            "DELETE",
            "/api/v1/me",
            json={"password": "password12"},
        )
        assert deleted.status_code == 200
        assert (await second_session.get("/api/v1/me")).status_code == 401
        stale = await second_session.get(
            "/api/v1/me",
            headers={"Cookie": f"vera_session={old_cookie}"},
        )
        assert stale.status_code == 401

        async with factory() as session:
            sessions_after = await session.scalar(
                select(func.count()).select_from(AuthSession)
            )
            users_after = await session.scalar(select(func.count()).select_from(User))
            remaining_rows = {
                model.__tablename__: await session.scalar(
                    select(func.count()).select_from(model)
                )
                for model in (
                    Run,
                    Submission,
                    Report,
                    ClaimRecord,
                    EvidenceRecord,
                    SourceRecord,
                    TraceEvent,
                )
            }
        assert sessions_after == 0
        assert users_after == 0
        assert all(count == 0 for count in remaining_rows.values()), remaining_rows


@pytest.mark.asyncio
async def test_delete_run_removes_related_records(client: AsyncClient, signup, wait_completed) -> None:
    await signup(client, "delete-run@example.com")
    created = await client.post(
        "/api/v1/submissions",
        json={"type": "text", "content": "Paris est la capitale de la France."},
    )
    assert created.status_code == 202
    run_id = created.json()["run_id"]
    await wait_completed(client, run_id)
    report_id = (await client.get(f"/api/v1/runs/{run_id}")).json()["report_id"]
    factory = app.state.run_manager.session_factory

    deleted = await client.delete(f"/api/v1/runs/{run_id}")
    assert deleted.status_code == 200
    assert deleted.json() == {"status": "deleted"}
    assert (await client.get(f"/api/v1/runs/{run_id}")).status_code == 404
    assert (await client.get(f"/api/v1/reports/{report_id}")).status_code == 404

    async with factory() as session:
        for model in (
            Run,
            Submission,
            Report,
            ClaimRecord,
            EvidenceRecord,
            SourceRecord,
            TraceEvent,
        ):
            remaining = await session.scalar(select(func.count()).select_from(model))
            if model is EvidenceRecord and remaining:
                evidence_claims = list(await session.scalars(select(EvidenceRecord.claim_pk)))
                remaining_claims = list(await session.scalars(select(ClaimRecord.id)))
                assert False, (
                    f"evidence remains: {evidence_claims}; "
                    f"claim rows remaining: {remaining_claims}"
                )
            assert remaining == 0, model.__tablename__


@pytest.mark.asyncio
async def test_purge_removes_run_and_submission_after_seven_days(
    client: AsyncClient, signup, wait_completed
) -> None:
    await signup(client, "retention@example.com")
    created = await client.post(
        "/api/v1/submissions",
        json={"type": "text", "content": "La Terre orbite autour du Soleil."},
    )
    run_id = created.json()["run_id"]
    await wait_completed(client, run_id)
    factory = app.state.run_manager.session_factory
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=8)
    async with factory() as session:
        run = await session.scalar(
            select(Run)
            .options(selectinload(Run.submission))
            .where(Run.id == run_id)
        )
        assert run is not None
        run.created_at = cutoff_date
        run.submission.created_at = cutoff_date
        run.submission.expires_at = datetime.now(timezone.utc) - timedelta(days=1)
        await session.commit()

    removed = await app.state.run_manager.purge_expired()
    assert removed == 1
    async with factory() as session:
        for model in (
            Run,
            Submission,
            Report,
            ClaimRecord,
            EvidenceRecord,
            SourceRecord,
            TraceEvent,
        ):
            remaining = await session.scalar(select(func.count()).select_from(model))
            assert remaining == 0, model.__tablename__
