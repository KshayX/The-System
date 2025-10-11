from __future__ import annotations

from datetime import datetime, timedelta
from typing import Annotated, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlmodel import Session, select

from ..config import get_settings
from ..database import get_session
from ..models import Player

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")
settings = get_settings()


class TokenData:
    username: str

    def __init__(self, username: str) -> None:
        self.username = username


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.access_token_expire_minutes))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.secret_key, algorithm="HS256")


def get_player_by_username(session: Session, username: str) -> Optional[Player]:
    statement = select(Player).where(Player.username == username)
    return session.exec(statement).one_or_none()


def authenticate_player(session: Session, username: str, password: str) -> Optional[Player]:
    player = get_player_by_username(session, username)
    if not player or not verify_password(password, player.hashed_password):
        return None
    return player


async def get_current_player(token: Annotated[str, Depends(oauth2_scheme)], session: Annotated[Session, Depends(get_session)]) -> Player:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        username: str = payload.get("sub")  # type: ignore[assignment]
        if username is None:
            raise credentials_exception
    except JWTError as exc:  # pragma: no cover - failure path
        raise credentials_exception from exc
    player = get_player_by_username(session, username)
    if player is None:
        raise credentials_exception
    return player
