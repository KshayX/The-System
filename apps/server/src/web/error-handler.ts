import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    res.status(422).json({ message: 'Validation failed', issues: err.issues });
    return;
  }

  if (err instanceof Error) {
    console.error(err);
    res.status(500).json({ message: err.message });
    return;
  }

  res.status(500).json({ message: 'Unknown error' });
}
