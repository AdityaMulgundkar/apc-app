import { Router, Request, Response } from 'express';
import { GhlAuth } from '../providers/ghlAuth';
import { decryptSSOData } from '../utils/sso';
import { logger } from '../utils/logger';

export const createAuthRouter = (ghlAuth: GhlAuth): Router => {
  const router = Router();

  router.get('/authorize-handler', async (req: Request, res: Response) => {
    const { code } = req.query;
    await ghlAuth.authorizationHandler(code as string);
    res.redirect('https://app.gohighlevel.com/');
  });

  router.post('/decrypt-sso', async (req: Request, res: Response) => {
    const { key } = req.body || {};
    if (!key) {
      return res.status(400).send('Please send valid key');
    }
    try {
      const data = decryptSSOData(key);
      res.send(data);
    } catch (error) {
      res.status(400).send('Invalid Key');
      logger.error(error, 'SSO decryption failed');
    }
  });

  return router;
};
