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

export async function acceptInvite(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, password, name } = req.body ?? {};
    const { acceptInvite } = await import('../iam/iam.service.js');
    const result = await acceptInvite({
      token: String(token ?? ''),
      password: String(password ?? ''),
      name: name === undefined ? undefined : String(name),
    });
    res.json({ ok: true, ...result });
  } catch (err) {
    next(err);
  }
}

/** Section 13 — Security Controllers */

export async function handleMfaSetup(req: Request, res: Response, next: NextFunction) {
  try {
    const { generateTotpSecret } = await import('./security.service.js');
    const email = req.auth!.user.email;
    const result = generateTotpSecret(email);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function handleMfaVerify(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, secret } = req.body ?? {};
    const { verifyTotpToken } = await import('./security.service.js');
    const { prisma } = await import('../../config/prisma.js');

    const isValid = verifyTotpToken(String(secret ?? ''), String(token ?? ''));
    if (!isValid) {
      res.status(400).json({ ok: false, message: 'Invalid 2FA code provided.' });
      return;
    }

    await prisma.user.update({
      where: { id: req.auth!.user.id },
      data: {
        twoFactorSecret: String(secret),
        twoFactorEnabled: true,
      } as any,
    });

    res.json({ ok: true, message: 'Multi-Factor Authentication enabled successfully.' });
  } catch (err) {
    next(err);
  }
}

export async function handleListSessions(req: Request, res: Response, next: NextFunction) {
  try {
    const { getUserSessions } = await import('./security.service.js');
    const sessions = await getUserSessions(req.auth!.user.id);
    res.json({ sessions, activeSessionId: req.auth!.sessionId });
  } catch (err) {
    next(err);
  }
}

export async function handleRevokeSession(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionIdToRevoke = String(req.params.id);
    const { revokeUserSession } = await import('./security.service.js');
    const result = await revokeUserSession(
      req.auth!.user.id,
      sessionIdToRevoke,
      req.ip,
      req.get('user-agent') ?? undefined
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function handleGetAuditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const { getTenantAuditLogs } = await import('./security.service.js');
    const tenantId = req.auth?.user.isPlatformAdmin ? null : req.auth?.user.tenantId || null;
    const logs = await getTenantAuditLogs(tenantId, 100);
    res.json({ auditLogs: logs });
  } catch (err) {
    next(err);
  }
}

