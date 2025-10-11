import express from 'express';
import cors from 'cors';
import { json } from 'express';
import { router as apiRouter } from './web/api';
import { errorHandler } from './web/error-handler';

export function createServer() {
  const app = express();
  app.use(cors());
  app.use(json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api', apiRouter);
  app.use(errorHandler);

  return app;
}
