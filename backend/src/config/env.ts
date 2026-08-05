import 'dotenv/config';

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

function optional(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

const corsRaw = optional('CORS_ORIGINS', optional('FRONTEND_URL', 'http://localhost:3000'));

export const env = {
  port: Number(optional('PORT', '5001')),
  nodeEnv: optional('NODE_ENV', 'development'),
  databaseUrl: process.env.DATABASE_URL ?? '',
  jwtSecret: optional('JWT_SECRET', 'dev-only-change-me'),
  accessTtlSec: Number(optional('JWT_ACCESS_TTL_SEC', '900')),
  refreshTtlSec: Number(optional('JWT_REFRESH_TTL_SEC', String(60 * 60 * 24 * 7))),
  frontendUrl: optional('FRONTEND_URL', 'http://localhost:3000'),
  corsOrigins: corsRaw.split(',').map((s) => s.trim()).filter(Boolean),
  cookieSecure: optional('COOKIE_SECURE', 'false') === 'true',
  cookieSameSite: (optional('COOKIE_SAME_SITE', 'lax') as 'lax' | 'strict' | 'none'),
  appName: optional('APP_NAME', 'Softlligence Manufacturing Cloud'),
  appSlug: optional('APP_SLUG', 'smc'),
  appVersion: optional('APP_VERSION', '0.1.0'),
  isProd: optional('NODE_ENV', 'development') === 'production',
} as const;

export const COOKIE = {
  access: 'smc_access',
  refresh: 'smc_refresh',
} as const;

/** Call when a feature truly needs DATABASE_URL (e.g. migrate/seed). */
export function assertDatabaseUrl(): string {
  return required('DATABASE_URL');
}
