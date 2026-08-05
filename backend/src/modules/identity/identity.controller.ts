import type { Request, Response, NextFunction } from 'express';
import { COOKIE } from '../../config/env.js';
import { clearAuthCookies, setAuthCookies, verifyAccessToken } from './identity.crypto.js';
import * as identityService from './identity.service.js';

function authResponse(bundle: Awaited<ReturnType<typeof identityService.loginWithPassword>>) {
  return {
    access_token: bundle.accessToken,
    token_type: 'Bearer' as const,
    expires_in: bundle.expiresIn,
    user: bundle.user,
    tenant: bundle.tenant,
  };
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body ?? {};
    const bundle = await identityService.loginWithPassword({
      email: String(email ?? ''),
      password: String(password ?? ''),
      userAgent: req.get('user-agent') ?? undefined,
      ipAddress: req.ip,
      clientSigHeader: req.get('x-client-signature') ?? undefined,
    });

    setAuthCookies(res, bundle.accessToken, bundle.refreshToken);
    res.json(authResponse(bundle));
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken =
      (req.body?.refresh_token as string | undefined) ||
      (req.cookies?.[COOKIE.refresh] as string | undefined);

    const bundle = await identityService.refreshSession({
      refreshToken,
      userAgent: req.get('user-agent') ?? undefined,
      ipAddress: req.ip,
      clientSigHeader: req.get('x-client-signature') ?? undefined,
    });

    setAuthCookies(res, bundle.accessToken, bundle.refreshToken);
    res.json(authResponse(bundle));
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    let sessionId = req.auth?.sessionId;
    if (!sessionId) {
      const access = req.cookies?.[COOKIE.access] as string | undefined;
      if (access) {
        try {
          sessionId = verifyAccessToken(access).sid;
        } catch {
          sessionId = undefined;
        }
      }
    }

    await identityService.logoutSession(
      sessionId,
      req.cookies?.[COOKIE.refresh] as string | undefined,
    );
    clearAuthCookies(res);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await identityService.getMe(req.auth!.user.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
}
