from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from ..database import get_session
from ..models import Player, PlayerSkill, Skill
from ..schemas import PlayerSkillRead, SkillRead
from ..utils.security import get_current_player

router = APIRouter(prefix="/skills", tags=["skills"])


@router.get("/", response_model=List[SkillRead])
def list_skills(session: Session = Depends(get_session)) -> List[Skill]:
    return session.exec(select(Skill)).all()


@router.get("/me", response_model=List[PlayerSkillRead])
def list_player_skills(
    current_player: Player = Depends(get_current_player),
    session: Session = Depends(get_session),
) -> List[PlayerSkill]:
    statement = select(PlayerSkill).where(PlayerSkill.player_id == current_player.id)
    return session.exec(statement).all()


@router.post("/unlock/{skill_id}", response_model=PlayerSkillRead)
def unlock_skill(
    skill_id: int,
    current_player: Player = Depends(get_current_player),
    session: Session = Depends(get_session),
) -> PlayerSkill:
    skill = session.get(Skill, skill_id)
    if not skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")
    if current_player.level < skill.unlock_level:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Level too low for skill")
    existing = session.exec(
        select(PlayerSkill).where(PlayerSkill.player_id == current_player.id, PlayerSkill.skill_id == skill_id)
    ).first()
    if existing:
        return existing
    player_skill = PlayerSkill(player_id=current_player.id, skill_id=skill_id)
    session.add(player_skill)
    session.commit()
    session.refresh(player_skill)
    return player_skill
