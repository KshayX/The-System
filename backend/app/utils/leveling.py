from __future__ import annotations

from dataclasses import dataclass


@dataclass
class LevelInfo:
    level: int
    xp_for_next: int
    total_xp_required: int


BASE_XP = 500
XP_SCALE = 1.25


def xp_required_for_level(level: int) -> int:
    xp = BASE_XP
    for _ in range(1, level):
        xp = int(xp * XP_SCALE)
    return xp


def total_xp_to_reach(level: int) -> int:
    total = 0
    for i in range(1, level + 1):
        total += xp_required_for_level(i)
    return total


def level_from_xp(xp: int) -> LevelInfo:
    level = 1
    xp_pool = xp
    while xp_pool >= xp_required_for_level(level):
        xp_pool -= xp_required_for_level(level)
        level += 1
    return LevelInfo(level=level, xp_for_next=xp_required_for_level(level) - xp_pool, total_xp_required=total_xp_to_reach(level))
