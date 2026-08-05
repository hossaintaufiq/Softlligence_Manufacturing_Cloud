import type { NextFunction, Request, Response } from 'express';
import { COOKIE } from '../../config/env.js';
import { AppError } from '../../common/errors/AppError.js';
import { prisma } from '../../config/prisma.js';
import { verifyAccessToken } from './identity.crypto.js';
import type { AccessTokenPayload, AuthTenant, AuthUser } from '../../types/express.js';

type CachedSession = {
  auth: {
    user: AuthUser;
    tenant: AuthTenant | null;
    sessionId: string;
    payload: AccessTokenPayload;
  };
  expiresAt: number;
};

// Global in-memory cache to prevent redundant database checks for active user sessions
const sessionCache = new Map<string, CachedSession>();

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    const bearer = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    const token = bearer || req.cookies?.[COOKIE.access];

    if (!token) {
      throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
    }

    let payload: AccessTokenPayload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      throw new AppError(401, 'Invalid or expired access token', 'UNAUTHORIZED');
    }

    // Check memory cache first to resolve immediately
    const cached = sessionCache.get(payload.sid);
    if (cached && cached.expiresAt > Date.now()) {
      req.auth = cached.auth;
      next();
      return;
    }

    // Resolve from database if cache missed or expired
    const session = await prisma.authSession.findUnique({
      where: { id: payload.sid },
      include: {
        user: { include: { tenant: true } },
      },
    });

    if (!session || session.revokedAt || session.expiresAt.getTime() <= Date.now()) {
      throw new AppError(401, 'Session revoked or expired', 'UNAUTHORIZED');
    }

    if (session.userId !== payload.sub || session.user.status !== 'active') {
      throw new AppError(401, 'Unauthorized', 'UNAUTHORIZED');
    }

    if (session.user.tenant?.status === 'suspended') {
      throw new AppError(403, 'Tenant is suspended', 'TENANT_SUSPENDED');
    }

    const authData = {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        status: session.user.status,
        tenantId: session.user.tenantId,
        isPlatformAdmin: session.user.isPlatformAdmin,
      },
      tenant: session.user.tenant
        ? {
            id: session.user.tenant.id,
            slug: session.user.tenant.slug,
            name: session.user.tenant.name,
            status: session.user.tenant.status,
            planCode: session.user.tenant.planCode,
          }
        : null,
      sessionId: payload.sid,
      payload: payload,
    };

    // Cache the resolved session
    sessionCache.set(payload.sid, {
      auth: authData,
      expiresAt: session.expiresAt.getTime(),
    });

    req.auth = authData;
    next();
  } catch (err) {
    next(err);
  }
}
