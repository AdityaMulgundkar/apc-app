import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { json } from 'body-parser';
import { Model } from './model';
import { GhlAuth } from './providers/ghlAuth';
import { GhlProvider } from './providers/ghlProvider';
import { AgentService } from './services/agentService';
import { LlmService } from './services/llmService';
import { logger } from './utils/logger';
import { requestLogger } from './middleware/requestLogger';
import { createAuthMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { createAuthRouter } from './routes/auth';
import { createCopilotRouter } from './routes/copilot';

const path = __dirname + '/ui/dist/';

dotenv.config();
const app: Express = express();
app.use(json({ type: 'application/json' }));
app.use(cors());
app.use(requestLogger);
app.use(express.static(path));

const model = new Model();
const ghlAuth = new GhlAuth(model);
const ghlProvider = new GhlProvider(ghlAuth);
const agentService = new AgentService(ghlProvider);
const llmService = new LlmService();

if (process.env.DEV_ACCESS_TOKEN && process.env.DEV_LOCATION_ID) {
  model.installationObjects[process.env.DEV_LOCATION_ID] = {
    access_token: process.env.DEV_ACCESS_TOKEN,
    token_type: 'Bearer' as any,
    expires_in: 86400,
    refresh_token: process.env.DEV_REFRESH_TOKEN || '',
    scope: '',
    userType: 'Location' as any,
    locationId: process.env.DEV_LOCATION_ID,
  };
  logger.info(`[Dev Mode] Seeded token for location ${process.env.DEV_LOCATION_ID}`);
}

const port = process.env.PORT;

app.use('/', createAuthRouter(ghlAuth));
app.use('/api', createAuthMiddleware(ghlAuth, model), createCopilotRouter(agentService, llmService));

app.get('/dev-credentials', (req: Request, res: Response) => {
  const installations = model.installationObjects;
  const entries = Object.entries(installations);
  if (entries.length === 0) {
    return res.status(404).json({ error: 'No installations found. Open the app inside GHL first.' });
  }
  const credentials = entries.map(([resourceId, details]) => ({
    resourceId,
    accessToken: details.access_token,
    refreshToken: details.refresh_token,
    locationId: details.locationId ?? null,
    companyId: details.companyId ?? null,
  }));
  res.json(credentials);
});

app.get('/', function (req, res) {
  res.sendFile(path + 'index.html');
});

app.use(errorHandler);

app.listen(port, () => {
  logger.info(`GHL app listening on port ${port}`);
});
