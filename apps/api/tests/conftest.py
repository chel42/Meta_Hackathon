import os

os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///:memory:"
os.environ["MOCK_PROVIDER"] = "1"
os.environ["COOKIE_SECURE"] = "0"
os.environ["ALLOWED_ORIGINS"] = (
    "http://localhost:8080,http://127.0.0.1:8080,http://localhost:8000,http://test"
)

import asyncio
from collections.abc import AsyncIterator  # noqa: E402

import pytest  # noqa: E402
from httpx import ASGITransport, AsyncClient  # noqa: E402

from app.core.config import get_settings  # noqa: E402

get_settings.cache_clear()


@pytest.fixture
async def client(tmp_path) -> AsyncIterator[AsyncClient]:
    from app.main import app

    settings = get_settings()
    original_database_url = settings.database_url
    settings.database_url = f"sqlite+aiosqlite:///{tmp_path / 'vera.db'}"
    try:
        async with app.router.lifespan_context(app):
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as http:
                yield http
    finally:
        settings.database_url = original_database_url


async def signup_user(client: AsyncClient, email: str, password: str = "password12") -> AsyncClient:
    response = await client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "display_name": email.split("@")[0]},
    )
    assert response.status_code == 201, response.text
    return client


@pytest.fixture
def signup():
    return signup_user


async def wait_for_run(client: AsyncClient, run_id: str, timeout: float = 15) -> dict:
    deadline = asyncio.get_event_loop().time() + timeout
    while asyncio.get_event_loop().time() < deadline:
        response = await client.get(f"/api/v1/runs/{run_id}")
        assert response.status_code == 200
        payload = response.json()
        if payload["status"] in {"completed", "failed"}:
            return payload
        await asyncio.sleep(0.05)
    raise AssertionError("run did not finish")


@pytest.fixture
def wait_completed():
    return wait_for_run
