from __future__ import annotations

from dataclasses import dataclass

from sqlmodel import Session

from ..models import Player, Quest, QuestType, Rank
from ..utils.leveling import level_from_xp


@dataclass
class RewardResult:
    leveled_up: bool
    levels_gained: int
    stat_points_awarded: int
    new_rank: str


RANK_THRESHOLDS = [
    ("E", 1),
    ("D", 5),
    ("C", 10),
    ("B", 20),
    ("A", 30),
    ("S", 45),
    ("National Level", 60),
]


def _calculate_rank(level: int) -> str:
    rank = "E"
    for name, min_level in RANK_THRESHOLDS:
        if level >= min_level:
            rank = name
        else:
            break
    return rank


def apply_quest_rewards(session: Session, player: Player, quest: Quest) -> RewardResult:
    xp_before = player.xp
    level_before = player.level
    player.xp += quest.xp_reward
    player.stat_points += quest.stat_reward
    player.mana += 10
    player.currency += quest.currency_reward
    player.level = level_from_xp(player.xp).level
    levels_gained = max(player.level - level_before, 0)
    leveled_up = player.level > level_before
    new_rank = _calculate_rank(player.level)
    player.rank = Rank(new_rank)
    if quest.quest_type == QuestType.DAILY:
        player.daily_streak += 1
        player.best_streak = max(player.best_streak, player.daily_streak)
    session.add(player)
    session.commit()
    session.refresh(player)
    return RewardResult(
        leveled_up=leveled_up,
        levels_gained=levels_gained,
        stat_points_awarded=quest.stat_reward,
        new_rank=new_rank,
    )
