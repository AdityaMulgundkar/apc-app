import dotenv from 'dotenv';

dotenv.config();

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
};

export const config = {
  ghl: {
    clientId: requireEnv('GHL_APP_CLIENT_ID'),
    clientSecret: requireEnv('GHL_APP_CLIENT_SECRET'),
    ssoKey: requireEnv('GHL_APP_SSO_KEY'),
    apiDomain: requireEnv('GHL_API_DOMAIN'),
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY ?? '',
  },
  server: {
    port: Number(process.env.PORT) || 3000,
  },
  logging: {
    level: process.env.LOG_LEVEL ?? 'info',
  },
  dev: {
    accessToken: process.env.DEV_ACCESS_TOKEN ?? '',
    locationId: process.env.DEV_LOCATION_ID ?? '',
  },
} as const;
