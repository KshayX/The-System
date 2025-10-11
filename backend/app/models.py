from __future__ import annotations

import enum
from datetime import datetime
from typing import Optional

from sqlmodel import Field, Relationship, SQLModel


class Rank(str, enum.Enum):
    E = "E"
    D = "D"
    C = "C"
    B = "B"
    A = "A"
    S = "S"
    NATIONAL = "National Level"


class QuestType(str, enum.Enum):
    DAILY = "daily"
    PENALTY = "penalty"
    EMERGENCY = "emergency"
    STORY = "story"


class QuestStatus(str, enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    FAILED = "failed"


class ItemCategory(str, enum.Enum):
    WEAPON = "weapon"
    EQUIPMENT = "equipment"
    POTION = "potion"
    MISC = "misc"


class SkillType(str, enum.Enum):
    ACTIVE = "active"
    PASSIVE = "passive"


class Player(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str

    level: int = Field(default=1)
    xp: int = Field(default=0)
    stat_points: int = Field(default=0)
    strength: int = Field(default=10)
    agility: int = Field(default=10)
    intelligence: int = Field(default=10)
    vitality: int = Field(default=10)
    sense: int = Field(default=10)
    mana: int = Field(default=100)
    currency: int = Field(default=0)
    daily_streak: int = Field(default=0)
    best_streak: int = Field(default=0)
    rank: Rank = Field(default=Rank.E)
    class_name: Optional[str] = Field(default=None, index=True)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"onupdate": datetime.utcnow})

    quests: list[Quest] = Relationship(back_populates="player")
    inventory_items: list[InventoryItem] = Relationship(back_populates="player")
    skills: list[PlayerSkill] = Relationship(back_populates="player")
    transactions: list[Transaction] = Relationship(back_populates="player")
    achievements: list[Achievement] = Relationship(back_populates="player")


class Quest(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    player_id: int = Field(foreign_key="player.id")
    title: str
    description: str
    quest_type: QuestType = Field(default=QuestType.DAILY)
    status: QuestStatus = Field(default=QuestStatus.ACTIVE)
    difficulty: str = Field(default="E")
    xp_reward: int = Field(default=100)
    stat_reward: int = Field(default=1)
    loot_box_reward: bool = Field(default=False)
    currency_reward: int = Field(default=0)
    deadline: Optional[datetime] = None
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    metadata: Optional[str] = Field(default=None, sa_column_kwargs={"nullable": True})

    player: Player = Relationship(back_populates="quests")


class Item(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: str
    category: ItemCategory
    strength_bonus: int = 0
    agility_bonus: int = 0
    intelligence_bonus: int = 0
    vitality_bonus: int = 0
    sense_bonus: int = 0
    rank_requirement: Rank = Rank.E
    price: int = 0


class InventoryItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    player_id: int = Field(foreign_key="player.id")
    item_id: int = Field(foreign_key="item.id")
    quantity: int = Field(default=1)
    equipped: bool = Field(default=False)

    player: Player = Relationship(back_populates="inventory_items")
    item: Item = Relationship()


class Skill(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: str
    skill_type: SkillType = SkillType.ACTIVE
    unlock_level: int = 1
    mana_cost: int = 0


class PlayerSkill(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    player_id: int = Field(foreign_key="player.id")
    skill_id: int = Field(foreign_key="skill.id")
    level: int = Field(default=1)
    equipped: bool = Field(default=False)

    player: Player = Relationship(back_populates="skills")
    skill: Skill = Relationship()


class Transaction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    player_id: int = Field(foreign_key="player.id")
    description: str
    delta_xp: int = 0
    delta_currency: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

    player: Player = Relationship(back_populates="transactions")


class Achievement(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    player_id: int = Field(foreign_key="player.id")
    name: str
    description: str
    unlocked_at: datetime = Field(default_factory=datetime.utcnow)

    player: Player = Relationship(back_populates="achievements")


class AnalyticsSnapshot(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    player_id: int = Field(foreign_key="player.id")
    captured_at: datetime = Field(default_factory=datetime.utcnow)
    level: int
    xp: int
    strength: int
    agility: int
    intelligence: int
    vitality: int
    sense: int
    mana: int
    quests_completed: int
    quests_failed: int
