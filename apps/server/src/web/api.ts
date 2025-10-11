import { Router } from 'express';
import { authRouter } from './routes/auth';
import { playerRouter } from './routes/player';
import { questRouter } from './routes/quest';
import { inventoryRouter } from './routes/inventory';
import { shopRouter } from './routes/shop';
import { analyticsRouter } from './routes/analytics';

export const router = Router();

router.use('/auth', authRouter);
router.use('/player', playerRouter);
router.use('/quests', questRouter);
router.use('/inventory', inventoryRouter);
router.use('/shop', shopRouter);
router.use('/analytics', analyticsRouter);
