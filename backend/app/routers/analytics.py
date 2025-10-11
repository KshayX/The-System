from __future__ import annotations

from datetime import datetime, timedelta

import pendulum
from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from ..database import get_session
from ..models import Player, Quest, QuestStatus, QuestType
from ..schemas import AnalyticsRead
from ..utils.security import get_current_player

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/me", response_model=AnalyticsRead)
def analytics_dashboard(
    current_player: Player = Depends(get_current_player),
    session: Session = Depends(get_session),
) -> AnalyticsRead:
    quests = session.exec(select(Quest).where(Quest.player_id == current_player.id)).all()
    completed = sum(1 for quest in quests if quest.status == QuestStatus.COMPLETED)
    failed = sum(1 for quest in quests if quest.status == QuestStatus.FAILED)
    now = pendulum.now()
    week_ago = now.subtract(days=7)
    xp_week = sum(q.xp_reward for q in quests if q.completed_at and q.completed_at >= week_ago)
    daily_average = xp_week / 7

    streak = current_player.daily_streak

    return AnalyticsRead(
        level=current_player.level,
        xp=current_player.xp,
        quests_completed=completed,
        quests_failed=failed,
        streak=streak,
        average_daily_xp=daily_average,
    )
