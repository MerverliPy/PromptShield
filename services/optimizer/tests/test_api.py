from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"ok": True, "service": "optimizer"}


def test_optimize_returns_expected_shape() -> None:
    response = client.post(
        "/optimize",
        json={
            "messages": [
                {"role": "user", "content": "Summarize this long prompt"}
            ],
            "protected_sections": [],
        },
    )

    assert response.status_code == 200

    body = response.json()
    assert "category" in body
    assert "compressed_messages" in body
    assert "actions" in body
    assert "risk" in body


def test_optimize_preserves_message_shape() -> None:
    response = client.post(
        "/optimize",
        json={
            "messages": [
                {"role": "system", "content": "Follow policy"},
                {"role": "user", "content": "Explain this content carefully"},
            ],
            "protected_sections": [],
        },
    )

    assert response.status_code == 200

    body = response.json()
    assert isinstance(body["compressed_messages"], list)
    if body["compressed_messages"]:
        first = body["compressed_messages"][0]
        assert "role" in first
        assert "content" in first


def test_optimize_rejects_invalid_payload() -> None:
    response = client.post(
        "/optimize",
        json={},
    )

    assert response.status_code == 422
