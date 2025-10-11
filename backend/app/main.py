from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from .config import get_settings
from .database import get_session, init_db, session_scope
from .models import Item, ItemCategory, Skill, SkillType
from .routers import analytics, auth, inventory, players, quests, shop, skills

settings = get_settings()
app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()
    seed_data()


def seed_data() -> None:
    with session_scope() as session:
        seed_items(session)
        seed_skills(session)


def seed_items(session: Session) -> None:
    existing = session.exec(select(Item)).first()
    if existing:
        return
    items = [
        Item(
            name="Beginner Hunter Sword",
            description="A standard issue sword for novice hunters.",
            category=ItemCategory.WEAPON,
            strength_bonus=5,
            price=250,
        ),
        Item(
            name="Reinforced Combat Suit",
            description="Protective gear increasing vitality and agility.",
            category=ItemCategory.EQUIPMENT,
            agility_bonus=3,
            vitality_bonus=4,
            price=400,
        ),
        Item(
            name="Mana Recovery Potion",
            description="Instantly restores 50 mana.",
            category=ItemCategory.POTION,
            price=120,
        ),
    ]
    for item in items:
        session.add(item)
    session.commit()


def seed_skills(session: Session) -> None:
    existing = session.exec(select(Skill)).first()
    if existing:
        return
    skills = [
        Skill(
            name="Sprint",
            description="Boost agility for a short duration.",
            skill_type=SkillType.ACTIVE,
            unlock_level=3,
            mana_cost=15,
        ),
        Skill(
            name="Iron Skin",
            description="Increase vitality permanently.",
            skill_type=SkillType.PASSIVE,
            unlock_level=5,
        ),
        Skill(
            name="Mana Blade",
            description="Enchant your weapon with mana for amplified damage.",
            skill_type=SkillType.ACTIVE,
            unlock_level=8,
            mana_cost=30,
        ),
    ]
    for skill in skills:
        session.add(skill)
    session.commit()


app.include_router(auth.router)
app.include_router(players.router)
app.include_router(quests.router)
app.include_router(inventory.router)
app.include_router(skills.router)
app.include_router(shop.router)
app.include_router(analytics.router)


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}
