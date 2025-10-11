import { Router } from 'express';
import { authenticate, AuthenticatedRequest } from '../../utils/auth';
import { SHOP_ITEMS, purchaseItem } from '../../services/shop-service';
import { z } from 'zod';

export const shopRouter = Router();

shopRouter.use(authenticate);

shopRouter.get('/items', (_req, res) => {
  res.json(SHOP_ITEMS);
});

const purchaseSchema = z.object({ itemId: z.string() });

shopRouter.post('/purchase', async (req: AuthenticatedRequest, res) => {
  const payload = purchaseSchema.parse(req.body);
  const item = await purchaseItem(req.user.userId, payload.itemId);
  res.json(item);
});
