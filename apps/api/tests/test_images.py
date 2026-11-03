import pytest
from httpx import AsyncClient


PNG = bytes.fromhex(
    "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489"
    "0000000a49444154789c63000100000500010d0a2db40000000049454e44ae426082"
)


@pytest.mark.asyncio
async def test_image_submission_sets_provenance_not_assessed(client: AsyncClient, signup, wait_completed) -> None:

    await signup(client, "image@example.com")
    created = await client.post(
        "/api/v1/submissions",
        data={"type": "image", "content": "Une photo de paysage", "language": "fr"},
        files={"file": ("tiny.png", PNG, "image/png")},
    )
    assert created.status_code == 202, created.text
    run = await wait_completed(client, created.json()["run_id"])
    assert run["status"] == "completed", run
    assert run["report_id"]
    report = await client.get(f"/api/v1/reports/{run['report_id']}")
    assert report.status_code == 200, report.text
    media = report.json()["media_analysis"]
    assert media["provenance"] == "not_assessed"
    assert "falsif" not in report.text.lower()


@pytest.mark.asyncio
async def test_invalid_image_is_rejected(client: AsyncClient, signup) -> None:
    await signup(client, "badimg@example.com")
    response = await client.post(
        "/api/v1/submissions",
        data={"type": "image"},
        files={"file": ("bad.txt", b"not-an-image", "text/plain")},
    )
    assert response.status_code == 422
