import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_login_me_logout(client: AsyncClient, signup) -> None:
    await signup(client, "user@example.com")
    assert "vera_session" in client.cookies
    cookie = client.cookies.get("vera_session")
    assert cookie
    me = await client.get("/api/v1/auth/me")
    assert me.status_code == 200
    assert me.json()["email"] == "user@example.com"
    profile = await client.get("/api/v1/me")
    assert profile.status_code == 200
    assert profile.json()["runs_total"] == 0
    logout = await client.post("/api/v1/auth/logout")
    assert logout.status_code == 200
    denied = await client.get("/api/v1/me")
    assert denied.status_code == 401
    login = await client.post(
        "/api/v1/auth/login",
        json={"email": "user@example.com", "password": "password12"},
    )
    assert login.status_code == 200
    assert (await client.get("/api/v1/me")).status_code == 200


@pytest.mark.asyncio
async def test_login_errors_are_uniform_and_rate_limited(client: AsyncClient, signup) -> None:
    await signup(client, "rate@example.com")
    await client.post("/api/v1/auth/logout")
    codes = []
    for _ in range(5):
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": "rate@example.com", "password": "wrong-pass-1"},
        )
        assert response.status_code == 401
        body = response.json()["error"]
        assert body["code"] == "unauthenticated"
        assert "request_id" in body
        codes.append(body["message"])
    unknown = await client.post(
        "/api/v1/auth/login",
        json={"email": "missing@example.com", "password": "wrong-pass-1"},
    )
    assert unknown.status_code in {401, 429}
    limited = await client.post(
        "/api/v1/auth/login",
        json={"email": "rate@example.com", "password": "wrong-pass-1"},
    )
    assert limited.status_code == 429
    assert limited.json()["error"]["code"] == "rate_limited"
    assert len(set(codes)) == 1


@pytest.mark.asyncio
async def test_duplicate_email_conflict(client: AsyncClient, signup) -> None:
    await signup(client, "dup@example.com")
    response = await client.post(
        "/api/v1/auth/register",
        json={"email": "DUP@example.com", "password": "password12"},
    )
    assert response.status_code == 409
    assert response.json()["error"]["code"] == "email_taken"


@pytest.mark.asyncio
async def test_forbidden_origin_is_rejected(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/auth/register",
        json={"email": "origin@example.com", "password": "password12"},
        headers={"Origin": "https://evil.example"},
    )
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "forbidden"
