from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from ..database import get_session
from ..models import Player
from ..schemas import PlayerRead, PlayerUpdateStats
from ..utils.security import get_current_player

router = APIRouter(prefix="/players", tags=["players"])


@router.get("/me", response_model=PlayerRead)
def read_profile(current_player: Player = Depends(get_current_player)) -> Player:
    return current_player


@router.post("/me/allocate", response_model=PlayerRead)
def allocate_stats(
    payload: PlayerUpdateStats,
    current_player: Player = Depends(get_current_player),
    session: Session = Depends(get_session),
) -> Player:
    total_requested = sum([
        payload.strength - current_player.strength,
        payload.agility - current_player.agility,
        payload.intelligence - current_player.intelligence,
        payload.vitality - current_player.vitality,
        payload.sense - current_player.sense,
    ])
    if total_requested > current_player.stat_points:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Not enough stat points")
    if total_requested < 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot reduce stats")

    current_player.strength = payload.strength
    current_player.agility = payload.agility
    current_player.intelligence = payload.intelligence
    current_player.vitality = payload.vitality
    current_player.sense = payload.sense
    current_player.stat_points -= total_requested

    session.add(current_player)
    session.commit()
    session.refresh(current_player)
    return current_player
