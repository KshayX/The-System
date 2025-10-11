from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from ..database import get_session
from ..models import Player, Quest, QuestStatus, QuestType
from ..schemas import EmergencyQuestRequest, QuestCreate, QuestRead, RewardResultRead
from ..services.progression import apply_quest_rewards
from ..services.quests import (
    complete_quest,
    ensure_daily_quest,
    fail_expired_quests,
    trigger_emergency_quest,
    trigger_penalty_quest,
)
from ..utils.security import get_current_player
from ..utils.leveling import level_from_xp

router = APIRouter(prefix="/quests", tags=["quests"])


@router.get("/daily", response_model=QuestRead)
def get_daily_quest(
    current_player: Player = Depends(get_current_player),
    session: Session = Depends(get_session),
) -> Quest:
    quest = ensure_daily_quest(session, current_player)
    return quest


@router.get("/active", response_model=List[QuestRead])
def list_active_quests(
    current_player: Player = Depends(get_current_player),
    session: Session = Depends(get_session),
) -> List[Quest]:
    statement = select(Quest).where(Quest.player_id == current_player.id, Quest.status == QuestStatus.ACTIVE)
    quests = session.exec(statement).all()
    fail_expired_quests(session, quests)
    return quests


@router.get("/completed", response_model=List[QuestRead])
def list_completed_quests(
    current_player: Player = Depends(get_current_player),
    session: Session = Depends(get_session),
) -> List[Quest]:
    statement = select(Quest).where(Quest.player_id == current_player.id, Quest.status == QuestStatus.COMPLETED)
    return session.exec(statement).all()


@router.post("/", response_model=QuestRead, status_code=status.HTTP_201_CREATED)
def create_custom_quest(
    payload: QuestCreate,
    current_player: Player = Depends(get_current_player),
    session: Session = Depends(get_session),
) -> Quest:
    quest = Quest(player_id=current_player.id, **payload.dict())
    session.add(quest)
    session.commit()
    session.refresh(quest)
    return quest


@router.post("/{quest_id}/complete", response_model=RewardResultRead)
def complete_player_quest(
    quest_id: int,
    current_player: Player = Depends(get_current_player),
    session: Session = Depends(get_session),
) -> RewardResultRead:
    quest = session.get(Quest, quest_id)
    if not quest or quest.player_id != current_player.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quest not found")
    if quest.status != QuestStatus.ACTIVE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quest is not active")
    complete_quest(session, quest)
    rewards = apply_quest_rewards(session, current_player, quest)
    return RewardResultRead(**rewards.__dict__)


@router.post("/{quest_id}/fail", status_code=status.HTTP_204_NO_CONTENT)
def fail_quest(
    quest_id: int,
    current_player: Player = Depends(get_current_player),
    session: Session = Depends(get_session),
) -> None:
    quest = session.get(Quest, quest_id)
    if not quest or quest.player_id != current_player.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quest not found")
    quest.status = QuestStatus.FAILED
    session.add(quest)
    session.commit()
    if quest.quest_type == QuestType.DAILY:
        current_player.daily_streak = 0
    current_player.xp = max(current_player.xp - 250, 0)
    current_player.level = level_from_xp(current_player.xp).level
    session.add(current_player)
    session.commit()
    trigger_penalty_quest(session, current_player)


@router.post("/penalty", response_model=QuestRead)
def activate_penalty(current_player: Player = Depends(get_current_player), session: Session = Depends(get_session)) -> Quest:
    return trigger_penalty_quest(session, current_player)


@router.post("/emergency", response_model=QuestRead)
def create_emergency_quest(
    payload: EmergencyQuestRequest,
    current_player: Player = Depends(get_current_player),
    session: Session = Depends(get_session),
) -> Quest:
    return trigger_emergency_quest(session, current_player, payload.description, payload.duration_minutes, payload.priority)


@router.get("/history", response_model=List[QuestRead])
def quest_history(
    current_player: Player = Depends(get_current_player),
    session: Session = Depends(get_session),
) -> List[Quest]:
    statement = select(Quest).where(Quest.player_id == current_player.id).order_by(Quest.started_at.desc())
    quests = session.exec(statement).all()
    return quests
