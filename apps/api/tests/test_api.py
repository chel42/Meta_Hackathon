from fastapi.testclient import TestClient

from app.main import app


def test_health_endpoint_is_public_and_minimal() -> None:
    response = TestClient(app).get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
