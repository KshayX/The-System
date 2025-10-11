from __future__ import annotations

from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select

from ..database import get_session
from ..models import Player
from ..schemas import PlayerCreate, PlayerRead, TokenResponse
from ..utils.security import authenticate_player, create_access_token, get_password_hash

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=PlayerRead, status_code=status.HTTP_201_CREATED)
def register_player(payload: PlayerCreate, session: Session = Depends(get_session)) -> Player:
    existing = session.exec(select(Player).where(Player.username == payload.username)).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already registered")
    email_existing = session.exec(select(Player).where(Player.email == payload.email)).first()
    if email_existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    player = Player(
        username=payload.username,
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
    )
    session.add(player)
    session.commit()
    session.refresh(player)
    return player


@router.post("/token", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)) -> TokenResponse:
    player = authenticate_player(session, form_data.username, form_data.password)
    if not player:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")
    access_token = create_access_token({"sub": player.username}, expires_delta=timedelta(minutes=60 * 24))
    return TokenResponse(access_token=access_token)
