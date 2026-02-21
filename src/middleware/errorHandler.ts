import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction): void => {
  logger.error({ err, path: req.originalUrl }, 'Unhandled error');
  res.status(500).json({ error: 'Internal server error' });
};
