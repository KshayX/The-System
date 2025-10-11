from fastapi.testclient import TestClient

from app.main import app, seed_data
from app.database import init_db, session_scope
from app.models import Player
from app.utils.security import get_password_hash


def setup_module() -> None:
    init_db()
    seed_data()
    with session_scope() as session:
        if not session.get(Player, 1):
            player = Player(username="tester", email="tester@example.com", hashed_password=get_password_hash("password"))
            session.add(player)
            session.commit()


def test_healthcheck() -> None:
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_daily_quest_cycle() -> None:
    client = TestClient(app)
    response = client.post(
        "/auth/token",
        data={"username": "tester", "password": "password"},
        headers={"content-type": "application/x-www-form-urlencoded"},
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    daily = client.get("/quests/daily", headers=headers)
    assert daily.status_code == 200
    quest_id = daily.json()["id"]

    complete = client.post(f"/quests/{quest_id}/complete", headers=headers)
    assert complete.status_code == 200
    payload = complete.json()
    assert "leveled_up" in payload
