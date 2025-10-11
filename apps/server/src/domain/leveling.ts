export const BASE_XP_REQUIREMENT = 100;

export function xpForNextLevel(level: number) {
  return Math.round(BASE_XP_REQUIREMENT * Math.pow(1.25, level - 1));
}

export function calculateLevelUp(level: number, xp: number) {
  let newLevel = level;
  let remainingXp = xp;
  let statPointsGained = 0;

  while (remainingXp >= xpForNextLevel(newLevel)) {
    const threshold = xpForNextLevel(newLevel);
    remainingXp -= threshold;
    newLevel += 1;
    statPointsGained += 5;
  }

  return { level: newLevel, xp: remainingXp, statPointsGained };
}

export function rankForLevel(level: number) {
  if (level >= 80) return 'NATIONAL';
  if (level >= 60) return 'S';
  if (level >= 45) return 'A';
  if (level >= 30) return 'B';
  if (level >= 20) return 'C';
  if (level >= 10) return 'D';
  return 'E';
}

export function powerLevel(stats: {
  strength: number;
  agility: number;
  intelligence: number;
  vitality: number;
  sense: number;
  mana: number;
  level: number;
}) {
  const statTotal =
    stats.strength * 2 +
    stats.agility * 1.8 +
    stats.intelligence * 1.5 +
    stats.vitality * 1.7 +
    stats.sense * 1.6 +
    stats.mana * 0.5 +
    stats.level * 5;

  return Math.round(statTotal);
}
