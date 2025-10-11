import { prisma } from '../instrumentation';
import {
  DAILY_QUESTS,
  buildQuestPayload,
  penaltyQuestPayload,
  emergencyQuestPayload,
} from '../domain/quests';
import { QuestStatus, QuestType } from '@prisma/client';
import dayjs from 'dayjs';

export async function ensureDailyQuest(userId: string) {
  const activeDaily = await prisma.quest.findFirst({
    where: {
      userId,
      type: QuestType.DAILY,
      status: { in: [QuestStatus.ACTIVE, QuestStatus.PENDING] },
      expiresAt: { gte: new Date() },
    },
  });
  if (activeDaily) return activeDaily;

  const payload = buildQuestPayload(DAILY_QUESTS[0], userId);
  return prisma.quest.create({ data: payload });
}

export async function activatePenaltyQuest(userId: string, failedQuestId: string) {
  const penalty = penaltyQuestPayload(userId, `Failed quest ${failedQuestId}`);
  return prisma.quest.create({ data: penalty });
}

export async function triggerEmergencyQuest(
  userId: string,
  title: string,
  description: string,
  hours: number,
) {
  return prisma.quest.create({ data: emergencyQuestPayload(userId, title, description, hours) });
}

export async function listQuests(userId: string) {
  const quests = await prisma.quest.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  return quests.map((quest) => ({
    ...quest,
    remainingSeconds: quest.expiresAt
      ? Math.max(0, dayjs(quest.expiresAt).diff(dayjs(), 'second'))
      : null,
  }));
}
