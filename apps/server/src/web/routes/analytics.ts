import { Router } from 'express';
import { authenticate, AuthenticatedRequest } from '../../utils/auth';
import { prisma } from '../../instrumentation';
import dayjs from 'dayjs';

export const analyticsRouter = Router();

analyticsRouter.use(authenticate);

analyticsRouter.get('/', async (req: AuthenticatedRequest, res) => {
  const since = dayjs().subtract(30, 'day').toDate();
  const quests = await prisma.quest.findMany({
    where: { userId: req.user.userId, createdAt: { gte: since } },
  });
  const completedCount = quests.filter((q) => q.status === 'COMPLETED').length;
  const failedCount = quests.filter((q) => q.status === 'FAILED').length;

  const transactions = await prisma.transaction.findMany({
    where: { userId: req.user.userId, createdAt: { gte: since } },
  });

  res.json({
    questsCompleted: completedCount,
    questsFailed: failedCount,
    questCompletionRate: quests.length ? completedCount / quests.length : 0,
    rewardsEarned: transactions.reduce((acc, txn) => acc + txn.amount, 0),
  });
});
