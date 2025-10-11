import { prisma } from '../instrumentation';
import { calculateLevelUp, powerLevel, rankForLevel, xpForNextLevel } from '../domain/leveling';
import dayjs from 'dayjs';
import { QuestStatus, QuestType } from '@prisma/client';

export async function getOrCreateProfile(userId: string) {
  let profile = await prisma.playerProfile.findUnique({ where: { userId } });
  if (!profile) {
    profile = await prisma.playerProfile.create({
      data: {
        user: { connect: { id: userId } },
      },
    });
  }
  const xpNext = xpForNextLevel(profile.level);
  const power = powerLevel({
    strength: profile.strength,
    agility: profile.agility,
    intelligence: profile.intelligence,
    vitality: profile.vitality,
    sense: profile.sense,
    mana: profile.mana,
    level: profile.level,
  });

  const dailyQuests = await prisma.quest.findMany({
    where: { userId, type: QuestType.DAILY, status: { in: [QuestStatus.ACTIVE, QuestStatus.PENDING] } },
  });

  const streak = profile.streakCount;

  return { profile, xpNext, power, activeDailyQuests: dailyQuests, streak };
}

export async function applyQuestRewards(userId: string, questId: string) {
  const quest = await prisma.quest.findUnique({ where: { id: questId } });
  if (!quest || quest.userId !== userId) {
    throw new Error('Quest not found');
  }

  await prisma.$transaction(async (tx) => {
    const profile = await tx.playerProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Profile missing');

    const xpTotal = profile.xp + quest.xpReward;
    const { level, xp, statPointsGained } = calculateLevelUp(profile.level, xpTotal);
    const newRank = rankForLevel(level);

    await tx.playerProfile.update({
      where: { userId },
      data: {
        level,
        xp,
        mana: profile.mana + quest.manaReward,
        unallocatedStatPoints: profile.unallocatedStatPoints + statPointsGained,
        rank: newRank,
        streakCount: quest.type === QuestType.DAILY ? profile.streakCount + 1 : profile.streakCount,
        longestStreak:
          quest.type === QuestType.DAILY
            ? Math.max(profile.longestStreak, profile.streakCount + 1)
            : profile.longestStreak,
      },
    });

    await tx.quest.update({
      where: { id: questId },
      data: { status: QuestStatus.COMPLETED, completedAt: new Date() },
    });

    if (quest.lootTable) {
      const lootItems = buildLootItems(quest.lootTable);
      for (const item of lootItems) {
        await tx.inventoryItem.create({
          data: {
            userId,
            name: item.name,
            description: item.description,
            category: item.category,
            rarity: item.rarity,
            quantity: item.quantity,
            statBonuses: item.statBonuses,
          },
        });
      }
    }

    if (quest.statReward) {
      const statReward = quest.statReward as Record<string, number>;
      await tx.playerProfile.update({
        where: { userId },
        data: {
          strength: profile.strength + (statReward.strength ?? 0),
          agility: profile.agility + (statReward.agility ?? 0),
          intelligence: profile.intelligence + (statReward.intelligence ?? 0),
          vitality: profile.vitality + (statReward.vitality ?? 0),
          sense: profile.sense + (statReward.sense ?? 0),
        },
      });
    }

    await tx.transaction.create({
      data: {
        userId,
        questId,
        type: 'QUEST_REWARD',
        amount: quest.xpReward,
        metadata: { manaReward: quest.manaReward },
      },
    });
  });
}

function buildLootItems(lootTable: any) {
  const items: Array<{
    name: string;
    description: string;
    category: any;
    rarity: any;
    quantity: number;
    statBonuses?: Record<string, number>;
  }> = [];
  if (lootTable.guaranteed) {
    for (const entry of lootTable.guaranteed) {
      items.push({
        name: entry.item,
        description: `${entry.item} obtained from quest rewards`,
        category: entry.category || 'MISC',
        rarity: entry.rarity || 'COMMON',
        quantity: entry.quantity ?? 1,
        statBonuses: entry.statBonuses,
      });
    }
  }

  if (lootTable.random && lootTable.random.length) {
    const random = lootTable.random[Math.floor(Math.random() * lootTable.random.length)];
    items.push({
      name: random.item,
      description: `${random.item} (random drop)`,
      category: random.category || 'MISC',
      rarity: random.rarity || 'COMMON',
      quantity: random.quantity ?? 1,
      statBonuses: random.statBonuses,
    });
  }
  return items;
}

export async function checkAndResetDailyQuests(userId: string) {
  const profile = await prisma.playerProfile.findUnique({ where: { userId } });
  if (!profile) return;

  const needsReset =
    !profile.lastDailyReset || dayjs(profile.lastDailyReset).isBefore(dayjs().startOf('day'));

  if (needsReset) {
    await prisma.playerProfile.update({
      where: { userId },
      data: { lastDailyReset: new Date() },
    });
    await prisma.quest.updateMany({
      where: { userId, type: QuestType.DAILY, status: { in: [QuestStatus.PENDING, QuestStatus.ACTIVE] } },
      data: { status: QuestStatus.FAILED, failedAt: new Date() },
    });
    await prisma.playerProfile.update({
      where: { userId },
      data: { streakCount: 0 },
    });
  }
}

export async function applyPenaltyForQuest(userId: string, questId: string) {
  const quest = await prisma.quest.findUnique({ where: { id: questId } });
  if (!quest) throw new Error('Quest not found');

  await prisma.$transaction(async (tx) => {
    await tx.quest.update({
      where: { id: questId },
      data: { status: QuestStatus.FAILED, failedAt: new Date() },
    });

    const profile = await tx.playerProfile.findUnique({ where: { userId } });
    if (!profile) return;

    const xpLoss = (quest.penalty as any)?.xpLoss ?? 0;
    const newXp = Math.max(0, profile.xp - xpLoss);

    await tx.playerProfile.update({
      where: { userId },
      data: {
        xp: newXp,
        streakCount: 0,
      },
    });

    await tx.transaction.create({
      data: {
        userId,
        questId,
        type: 'PENALTY',
        amount: xpLoss,
      },
    });
  });
}
