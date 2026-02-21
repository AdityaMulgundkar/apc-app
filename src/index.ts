import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { json } from "body-parser";
import { Model } from "./model";
import { GhlAuth } from "./providers/ghlAuth";
import { GhlProvider } from "./providers/ghlProvider";
import { decryptSSOData } from "./utils/sso";
import { logger } from "./utils/logger";
import { resolveLocationId } from "./middleware/auth";

const path = __dirname + "/ui/dist/";

dotenv.config();
const app: Express = express();
app.use(json({ type: 'application/json' }))
app.use(express.static(path));

const model = new Model();
const ghlAuth = new GhlAuth(model);
const ghlProvider = new GhlProvider(ghlAuth);

if (process.env.DEV_ACCESS_TOKEN && process.env.DEV_LOCATION_ID) {
  model.installationObjects[process.env.DEV_LOCATION_ID] = {
    access_token: process.env.DEV_ACCESS_TOKEN,
    token_type: "Bearer" as any,
    expires_in: 86400,
    refresh_token: process.env.DEV_REFRESH_TOKEN || '',
    scope: '',
    userType: "Location" as any,
    locationId: process.env.DEV_LOCATION_ID,
  };
  logger.info(`[Dev Mode] Seeded token for location ${process.env.DEV_LOCATION_ID}`);
}

const port = process.env.PORT;

app.get("/authorize-handler", async (req: Request, res: Response) => {
  const { code } = req.query;
  await ghlAuth.authorizationHandler(code as string);
  res.redirect("https://app.gohighlevel.com/");
});

app.post("/decrypt-sso", async (req: Request, res: Response) => {
  const { key } = req.body || {};
  if (!key) {
    return res.status(400).send("Please send valid key");
  }
  try {
    const data = decryptSSOData(key);
    res.send(data);
  } catch (error) {
    res.status(400).send("Invalid Key");
    logger.error(error, "SSO decryption failed");
  }
});

app.get("/test-agents", async (req: Request, res: Response) => {
  const locationId = resolveLocationId(req, model);
  if (!locationId || !ghlAuth.checkInstallationExists(locationId)) {
    return res.status(400).json({ error: "No installation found" });
  }
  try {
    const data = await ghlProvider.listAgents(locationId);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data || error.message });
  }
});

app.get("/dev-credentials", (req: Request, res: Response) => {
  const installations = model.installationObjects;
  const entries = Object.entries(installations);
  if (entries.length === 0) {
    return res.status(404).json({ error: "No installations found. Open the app inside GHL first." });
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

app.get("/", function (req, res) {
  res.sendFile(path + "index.html");
});

app.listen(port, () => {
  logger.info(`GHL app listening on port ${port}`);
});
