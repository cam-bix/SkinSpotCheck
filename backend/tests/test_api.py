from io import BytesIO

from fastapi.testclient import TestClient
from PIL import Image

from app.main import app
from app.schemas import DISCLAIMER

client = TestClient(app)


def make_png() -> BytesIO:
    buffer = BytesIO()
    Image.new("RGB", (16, 16), color=(180, 120, 90)).save(buffer, format="PNG")
    buffer.seek(0)
    return buffer


def register_and_login(email: str = "user@example.com") -> str:
    register_response = client.post(
        "/auth/register", json={"email": email, "password": "strong-password"}
    )
    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login", json={"email": email, "password": "strong-password"}
    )
    assert login_response.status_code == 200
    return login_response.json()["access_token"]


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_register_login_and_scan_history() -> None:
    token = register_and_login("scan-user@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    scan_response = client.post(
        "/scan",
        headers=headers,
        files={"image": ("spot.png", make_png(), "image/png")},
    )

    assert scan_response.status_code == 201
    scan = scan_response.json()
    assert scan["result"] in {
        "Low concern",
        "Medium concern",
        "High concern",
        "Unable to analyze",
    }
    assert scan["disclaimer"] == DISCLAIMER
    assert scan["confidence"] is None

    history_response = client.get("/scan/history", headers=headers)
    assert history_response.status_code == 200
    history = history_response.json()
    assert len(history) == 1
    assert history[0]["id"] == scan["id"]


def test_scan_rejects_bad_content_type() -> None:
    token = register_and_login("bad-file@example.com")
    response = client.post(
        "/scan",
        headers={"Authorization": f"Bearer {token}"},
        files={"image": ("notes.txt", BytesIO(b"not an image"), "text/plain")},
    )
    assert response.status_code == 415
