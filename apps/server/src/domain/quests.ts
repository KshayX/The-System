import dayjs from 'dayjs';
import { QuestType, QuestDifficulty, QuestStatus, Prisma } from '@prisma/client';

export interface QuestDefinition {
  title: string;
  description: string;
  xpReward: number;
  manaReward?: number;
  difficulty: QuestDifficulty;
  durationHours?: number;
  lootTable?: Prisma.JsonValue;
  statReward?: Prisma.JsonValue;
  penalty?: Prisma.JsonValue;
}

export const DAILY_QUESTS: QuestDefinition[] = [
  {
    title: 'Preparation To Become Powerful',
    description:
      'Complete 100 push-ups, 100 sit-ups, 100 squats, and a 10km run before the timer ends.',
    xpReward: 250,
    manaReward: 50,
    difficulty: QuestDifficulty.D,
    durationHours: 24,
    lootTable: {
      guaranteed: [
        { item: 'Recovery Potion', rarity: 'RARE', quantity: 1, category: 'POTION' },
      ],
      random: [
        { item: 'Steel Training Sword', rarity: 'COMMON', category: 'WEAPON', statBonuses: { strength: 3 } },
        { item: 'Lightweight Trainers', rarity: 'COMMON', category: 'ARMOR', statBonuses: { agility: 3 } },
      ],
    },
    statReward: { strength: 1, agility: 1, vitality: 1 },
    penalty: { type: 'penalty-zone', durationHours: 4, xpLoss: 100 },
  },
];

export function buildQuestPayload(def: QuestDefinition, userId: string): Prisma.QuestCreateInput {
  const expiresAt = def.durationHours ? dayjs().add(def.durationHours, 'hour').toDate() : undefined;
  return {
    user: { connect: { id: userId } },
    type: QuestType.DAILY,
    title: def.title,
    description: def.description,
    difficulty: def.difficulty,
    status: QuestStatus.ACTIVE,
    xpReward: def.xpReward,
    manaReward: def.manaReward ?? 0,
    lootTable: def.lootTable,
    statReward: def.statReward,
    penalty: def.penalty,
    startedAt: new Date(),
    expiresAt,
  };
}

export function penaltyQuestPayload(userId: string, reason: string): Prisma.QuestCreateInput {
  const durationHours = 4;
  return {
    user: { connect: { id: userId } },
    type: QuestType.PENALTY,
    title: 'Survival Quest',
    description: `Survive the penalty zone for ${durationHours} hours. Reason: ${reason}`,
    difficulty: QuestDifficulty.C,
    status: QuestStatus.ACTIVE,
    xpReward: 150,
    manaReward: 25,
    penalty: { xpLoss: 200, healthReduction: 20 },
    startedAt: new Date(),
    expiresAt: dayjs().add(durationHours, 'hour').toDate(),
  };
}

export function emergencyQuestPayload(userId: string, title: string, description: string, hours: number) {
  return {
    user: { connect: { id: userId } },
    type: QuestType.EMERGENCY,
    title,
    description,
    difficulty: QuestDifficulty.B,
    status: QuestStatus.ACTIVE,
    xpReward: 400,
    manaReward: 80,
    lootTable: {
      random: [
        { item: 'Shadow Dagger', rarity: 'EPIC', category: 'WEAPON', statBonuses: { agility: 5 } },
        { item: 'Hunter Medal', rarity: 'RARE', category: 'MISC', statBonuses: { sense: 4 } },
      ],
    },
    startedAt: new Date(),
    expiresAt: dayjs().add(hours, 'hour').toDate(),
  } satisfies Prisma.QuestCreateInput;
}
