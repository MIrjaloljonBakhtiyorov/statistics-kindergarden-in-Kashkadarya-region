import { config } from 'dotenv';

config();

type SmtpConfig = {
  host: string;
  port: number;
  user: string | undefined;
  pass: string | undefined;
  from: string | undefined;
};

type EnvConfig = {
  port: number;
  parentPortalPort: number;
  databaseUrl: string;
  smtp: SmtpConfig;
};

const getRequiredEnv = (name: string): string => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const getOptionalEnv = (name: string): string | undefined => {
  const value = process.env[name]?.trim();
  return value || undefined;
};

const getNumberEnv = (name: string, defaultValue: number): number => {
  const rawValue = getOptionalEnv(name);

  if (!rawValue) {
    return defaultValue;
  }

  const value = Number(rawValue);

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Environment variable ${name} must be a positive integer`);
  }

  return value;
};

export const env: EnvConfig = {
  port: getNumberEnv('PORT', 4001),
  parentPortalPort: getNumberEnv('PARENT_PORTAL_PORT', 4002),
  databaseUrl: getRequiredEnv('DATABASE_URL'),
  smtp: {
    host: getOptionalEnv('SMTP_HOST') ?? 'smtp.gmail.com',
    port: getNumberEnv('SMTP_PORT', 587),
    user: getOptionalEnv('SMTP_USER'),
    pass: getOptionalEnv('SMTP_PASS'),
    from: getOptionalEnv('SMTP_FROM') ?? getOptionalEnv('SMTP_USER'),
  },
};
