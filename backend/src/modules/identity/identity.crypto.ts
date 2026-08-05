import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { CookieOptions, Response } from 'express';
import { COOKIE, env } from '../../config/env.js';
import type { AccessTokenPayload } from '../../types/express.js';

const BCRYPT_ROUNDS = 12;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

export function newRefreshToken(): string {
  return randomBytes(48).toString('base64url');
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.accessTtlSec,
    issuer: env.appSlug,
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.jwtSecret, {
    issuer: env.appSlug,
  }) as AccessTokenPayload;
  return decoded;
}

function baseCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSameSite,
    path: '/',
  };
}

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie(COOKIE.access, accessToken, {
    ...baseCookieOptions(),
    maxAge: env.accessTtlSec * 1000,
  });
  res.cookie(COOKIE.refresh, refreshToken, {
    ...baseCookieOptions(),
    maxAge: env.refreshTtlSec * 1000,
  });
}

export function clearAuthCookies(res: Response) {
  const opts = baseCookieOptions();
  res.clearCookie(COOKIE.access, opts);
  res.clearCookie(COOKIE.refresh, opts);
}

export function clientSignatureFromRequest(userAgent: string | undefined, clientSigHeader: string | undefined): string {
  const raw = clientSigHeader?.trim() || userAgent || 'unknown';
  return hashToken(raw);
}
