from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr

from .models import ItemCategory, QuestStatus, QuestType, Rank, SkillType


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class PlayerCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class PlayerRead(BaseModel):
    id: int
    username: str
    email: EmailStr
    level: int
    xp: int
    stat_points: int
    strength: int
    agility: int
    intelligence: int
    vitality: int
    sense: int
    mana: int
    currency: int
    daily_streak: int
    best_streak: int
    rank: Rank
    class_name: Optional[str]

    class Config:
        from_attributes = True


class PlayerUpdateStats(BaseModel):
    strength: int
    agility: int
    intelligence: int
    vitality: int
    sense: int


class QuestRead(BaseModel):
    id: int
    title: str
    description: str
    quest_type: QuestType
    status: QuestStatus
    difficulty: str
    xp_reward: int
    stat_reward: int
    loot_box_reward: bool
    currency_reward: int
    deadline: Optional[datetime]
    started_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


class QuestCreate(BaseModel):
    title: str
    description: str
    quest_type: QuestType = QuestType.STORY
    xp_reward: int = 100
    stat_reward: int = 1
    loot_box_reward: bool = False
    currency_reward: int = 0
    deadline: Optional[datetime] = None
    difficulty: str = "E"


class ItemRead(BaseModel):
    id: int
    name: str
    description: str
    category: ItemCategory
    strength_bonus: int
    agility_bonus: int
    intelligence_bonus: int
    vitality_bonus: int
    sense_bonus: int
    rank_requirement: Rank
    price: int

    class Config:
        from_attributes = True


class InventoryItemRead(BaseModel):
    id: int
    item: ItemRead
    quantity: int
    equipped: bool

    class Config:
        from_attributes = True


class SkillRead(BaseModel):
    id: int
    name: str
    description: str
    skill_type: SkillType
    unlock_level: int
    mana_cost: int

    class Config:
        from_attributes = True


class PlayerSkillRead(BaseModel):
    id: int
    skill: SkillRead
    level: int
    equipped: bool

    class Config:
        from_attributes = True


class RewardResultRead(BaseModel):
    leveled_up: bool
    levels_gained: int
    stat_points_awarded: int
    new_rank: str


class EmergencyQuestRequest(BaseModel):
    description: str
    duration_minutes: int
    priority: str = "A"


class ShopPurchaseRequest(BaseModel):
    item_id: int
    quantity: int = 1


class AnalyticsRead(BaseModel):
    level: int
    xp: int
    quests_completed: int
    quests_failed: int
    streak: int
    average_daily_xp: float


class AchievementRead(BaseModel):
    id: int
    name: str
    description: str
    unlocked_at: datetime

    class Config:
        from_attributes = True
