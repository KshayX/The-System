import { Router } from 'express';
import { authenticate, AuthenticatedRequest } from '../../utils/auth';
import {
  applyPenaltyForQuest,
  applyQuestRewards,
  checkAndResetDailyQuests,
} from '../../services/player-service';
import { ensureDailyQuest, activatePenaltyQuest, triggerEmergencyQuest, listQuests } from '../../services/quest-service';
import { prisma } from '../../instrumentation';
import { z } from 'zod';
import dayjs from 'dayjs';
import { QuestStatus } from '@prisma/client';

export const questRouter = Router();

questRouter.use(authenticate);

questRouter.get('/', async (req: AuthenticatedRequest, res) => {
  const data = await listQuests(req.user.userId);
  res.json(data);
});

questRouter.post('/daily', async (req: AuthenticatedRequest, res) => {
  await checkAndResetDailyQuests(req.user.userId);
  const quest = await ensureDailyQuest(req.user.userId);
  res.json(quest);
});

questRouter.post('/:questId/complete', async (req: AuthenticatedRequest, res) => {
  const { questId } = req.params;
  await applyQuestRewards(req.user.userId, questId);
  res.json({ success: true });
});

questRouter.post('/:questId/fail', async (req: AuthenticatedRequest, res) => {
  const { questId } = req.params;
  await applyPenaltyForQuest(req.user.userId, questId);
  const penaltyQuest = await activatePenaltyQuest(req.user.userId, questId);
  res.json({ success: true, penaltyQuest });
});

const emergencySchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  hours: z.number().min(1).max(48),
});

questRouter.post('/emergency', async (req: AuthenticatedRequest, res) => {
  const payload = emergencySchema.parse(req.body);
  const quest = await triggerEmergencyQuest(
    req.user.userId,
    payload.title,
    payload.description,
    payload.hours,
  );
  res.json(quest);
});

questRouter.post('/:questId/tick', async (req: AuthenticatedRequest, res) => {
  const quest = await prisma.quest.findUnique({ where: { id: req.params.questId } });
  if (!quest || quest.userId !== req.user.userId) {
    res.status(404).json({ message: 'Quest not found' });
    return;
  }

  if (quest.expiresAt && dayjs().isAfter(quest.expiresAt)) {
    await applyPenaltyForQuest(req.user.userId, quest.id);
    const penaltyQuest = await activatePenaltyQuest(req.user.userId, quest.id);
    res.status(410).json({ message: 'Quest expired', penaltyQuest });
    return;
  }

  res.json({ remainingSeconds: quest.expiresAt ? dayjs(quest.expiresAt).diff(dayjs(), 'second') : null });
});

questRouter.get('/history/completed', async (req: AuthenticatedRequest, res) => {
  const completed = await prisma.quest.findMany({
    where: { userId: req.user.userId, status: QuestStatus.COMPLETED },
    orderBy: { completedAt: 'desc' },
  });
  res.json(completed);
});
