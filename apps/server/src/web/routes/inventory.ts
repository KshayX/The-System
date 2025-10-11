import { Router } from 'express';
import { authenticate, AuthenticatedRequest } from '../../utils/auth';
import { prisma } from '../../instrumentation';
import { z } from 'zod';

export const inventoryRouter = Router();

inventoryRouter.use(authenticate);

inventoryRouter.get('/', async (req: AuthenticatedRequest, res) => {
  const items = await prisma.inventoryItem.findMany({
    where: { userId: req.user.userId },
  });
  res.json(items);
});

const equipSchema = z.object({ equip: z.boolean() });

inventoryRouter.post('/:itemId/equip', async (req: AuthenticatedRequest, res) => {
  const payload = equipSchema.parse(req.body);
  const item = await prisma.inventoryItem.findUnique({ where: { id: req.params.itemId } });
  if (!item || item.userId !== req.user.userId) {
    res.status(404).json({ message: 'Item not found' });
    return;
  }

  const updated = await prisma.inventoryItem.update({
    where: { id: item.id },
    data: { isEquipped: payload.equip },
  });
  res.json(updated);
});
