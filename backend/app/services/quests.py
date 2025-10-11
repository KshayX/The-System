from __future__ import annotations

from datetime import datetime, timedelta
from typing import Iterable

import pendulum
from sqlmodel import Session, select

from ..models import Player, Quest, QuestStatus, QuestType

DAILY_TASKS = [
    ("100 push-ups", "Complete one hundred push-ups."),
    ("100 sit-ups", "Complete one hundred sit-ups."),
    ("100 squats", "Complete one hundred squats."),
    ("10km run", "Run ten kilometers."),
]


def _base_daily_description() -> str:
    steps = "\n".join(f"- {title}: {desc}" for title, desc in DAILY_TASKS)
    return f"Complete the following preparation routine today:\n{steps}"


def generate_daily_quest(player: Player) -> Quest:
    today = pendulum.now().start_of("day")
    deadline = today.add(days=1)
    return Quest(
        player_id=player.id,
        title="Preparation To Become Powerful",
        description=_base_daily_description(),
        quest_type=QuestType.DAILY,
        xp_reward=750,
        stat_reward=5,
        loot_box_reward=True,
        currency_reward=150,
        deadline=deadline,
        difficulty="D",
    )


def ensure_daily_quest(session: Session, player: Player) -> Quest:
    today = pendulum.now().start_of("day")
    statement = select(Quest).where(
        Quest.player_id == player.id,
        Quest.quest_type == QuestType.DAILY,
        Quest.started_at >= today.naive(),
    )
    quest = session.exec(statement).one_or_none()
    if quest:
        return quest

    quest = generate_daily_quest(player)
    session.add(quest)
    session.commit()
    session.refresh(quest)
    return quest


def complete_quest(session: Session, quest: Quest) -> Quest:
    quest.status = QuestStatus.COMPLETED
    quest.completed_at = datetime.utcnow()
    session.add(quest)
    session.commit()
    session.refresh(quest)
    return quest


def fail_expired_quests(session: Session, quests: Iterable[Quest]) -> None:
    for quest in quests:
        if quest.deadline and quest.deadline < datetime.utcnow() and quest.status == QuestStatus.ACTIVE:
            quest.status = QuestStatus.FAILED
            session.add(quest)
    session.commit()


def trigger_penalty_quest(session: Session, player: Player) -> Quest:
    deadline = datetime.utcnow() + timedelta(hours=4)
    quest = Quest(
        player_id=player.id,
        title="Survival Quest",
        description="Survive the penalty zone for four hours. Endure high intensity interval training and mental resilience drills.",
        quest_type=QuestType.PENALTY,
        xp_reward=500,
        stat_reward=2,
        loot_box_reward=False,
        currency_reward=0,
        deadline=deadline,
        difficulty="B",
    )
    session.add(quest)
    session.commit()
    session.refresh(quest)
    return quest


def trigger_emergency_quest(session: Session, player: Player, description: str, duration_minutes: int, priority: str = "A") -> Quest:
    deadline = datetime.utcnow() + timedelta(minutes=duration_minutes)
    quest = Quest(
        player_id=player.id,
        title="Kill the Enemies",
        description=description,
        quest_type=QuestType.EMERGENCY,
        xp_reward=1000,
        stat_reward=6,
        loot_box_reward=True,
        currency_reward=300,
        deadline=deadline,
        difficulty=priority,
    )
    session.add(quest)
    session.commit()
    session.refresh(quest)
    return quest
