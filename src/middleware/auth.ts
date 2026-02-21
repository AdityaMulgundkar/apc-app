import { Request, Response, NextFunction } from 'express';
import { GhlAuth } from '../providers/ghlAuth';

export const createAuthMiddleware = (ghlAuth: GhlAuth) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const locationId = req.query.locationId as string;
    if (!locationId) {
      res.status(400).json({ error: 'Missing required query param: locationId' });
      return;
    }
    if (!ghlAuth.checkInstallationExists(locationId)) {
      res.status(401).json({ error: 'No installation found for this location' });
      return;
    }
    req.locationId = locationId;
    next();
  };
};

declare global {
  namespace Express {
    interface Request {
      locationId?: string;
    }
  }
}
