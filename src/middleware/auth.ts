import { Request, Response, NextFunction } from 'express';
import { GhlAuth } from '../providers/ghlAuth';
import { Model } from '../model';
import { config } from '../config';

export const resolveLocationId = (req: Request, model: Model): string | undefined => {
  return (req.query.locationId as string)
    || config.dev.locationId
    || Object.keys(model.installationObjects)[0]
    || undefined;
};

export const createAuthMiddleware = (ghlAuth: GhlAuth, model: Model) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const locationId = resolveLocationId(req, model);
    if (!locationId) {
      res.status(400).json({ error: 'Missing locationId — pass as query param or set DEV_LOCATION_ID' });
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
