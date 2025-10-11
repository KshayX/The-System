import { Router } from 'express';
import { authenticate, AuthenticatedRequest } from '../../utils/auth';
import { getOrCreateProfile } from '../../services/player-service';
import { prisma } from '../../instrumentation';
import { z } from 'zod';

export const playerRouter = Router();

playerRouter.use(authenticate);

playerRouter.get('/me', async (req: AuthenticatedRequest, res) => {
  const data = await getOrCreateProfile(req.user.userId);
  const achievements = await prisma.achievementProgress.findMany({
    where: { userId: req.user.userId },
    include: { achievement: true },
  });
  res.json({ ...data, achievements });
});

const allocateSchema = z.object({
  strength: z.number().min(0).optional(),
  agility: z.number().min(0).optional(),
  intelligence: z.number().min(0).optional(),
  vitality: z.number().min(0).optional(),
  sense: z.number().min(0).optional(),
});

playerRouter.post('/allocate', async (req: AuthenticatedRequest, res) => {
  const payload = allocateSchema.parse(req.body);
  const profile = await prisma.playerProfile.findUnique({ where: { userId: req.user.userId } });
  if (!profile) {
    res.status(404).json({ message: 'Profile missing' });
    return;
  }

  const total = Object.values(payload).reduce((acc, val) => acc + (val ?? 0), 0);
  if (total > profile.unallocatedStatPoints) {
    res.status(400).json({ message: 'Not enough stat points' });
    return;
  }

  await prisma.playerProfile.update({
    where: { userId: req.user.userId },
    data: {
      strength: profile.strength + (payload.strength ?? 0),
      agility: profile.agility + (payload.agility ?? 0),
      intelligence: profile.intelligence + (payload.intelligence ?? 0),
      vitality: profile.vitality + (payload.vitality ?? 0),
      sense: profile.sense + (payload.sense ?? 0),
      unallocatedStatPoints: profile.unallocatedStatPoints - total,
    },
  });

  res.json(await getOrCreateProfile(req.user.userId));
});
