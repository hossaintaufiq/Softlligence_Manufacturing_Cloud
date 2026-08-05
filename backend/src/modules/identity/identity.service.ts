import { prisma } from '../../config/prisma.js';
import { AppError } from '../../common/errors/AppError.js';
import { env } from '../../config/env.js';
import type { AuthTenant, AuthUser } from '../../types/express.js';
import {
  clientSignatureFromRequest,
  hashToken,
  newRefreshToken,
  signAccessToken,
  verifyPassword,
} from './identity.crypto.js';

function mapUser(user: {
  id: string;
  email: string;
  name: string;
  status: string;
  tenantId: string | null;
  isPlatformAdmin: boolean;
}): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    status: user.status,
    tenantId: user.tenantId,
    isPlatformAdmin: user.isPlatformAdmin,
  };
}

function mapTenant(
  tenant: {
    id: string;
    slug: string;
    name: string;
    status: string;
    planCode: string | null;
  } | null,
): AuthTenant | null {
  if (!tenant) return null;
  return {
    id: tenant.id,
    slug: tenant.slug,
    name: tenant.name,
    status: tenant.status,
    planCode: tenant.planCode,
  };
}

export type AuthBundle = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
  tenant: AuthTenant | null;
};

async function issueSession(params: {
  user: {
    id: string;
    email: string;
    name: string;
    status: string;
    tenantId: string | null;
    isPlatformAdmin: boolean;
    tenant: {
      id: string;
      slug: string;
      name: string;
      status: string;
      planCode: string | null;
    } | null;
  };
  userAgent?: string;
  ipAddress?: string;
  clientSigHeader?: string;
}): Promise<AuthBundle> {
  const refreshToken = newRefreshToken();
  const refreshTokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + env.refreshTtlSec * 1000);
  const signature = clientSignatureFromRequest(params.userAgent, params.clientSigHeader);

  const session = await prisma.authSession.create({
    data: {
      userId: params.user.id,
      tenantId: params.user.tenantId,
      refreshTokenHash,
      clientSignature: signature,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
      expiresAt,
    },
  });

  const accessToken = signAccessToken({
    sub: params.user.id,
    tid: params.user.tenantId,
    sid: session.id,
    email: params.user.email,
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: env.accessTtlSec,
    user: mapUser(params.user),
    tenant: mapTenant(params.user.tenant),
  };
}

export async function loginWithPassword(input: {
  email: string;
  password: string;
  userAgent?: string;
  ipAddress?: string;
  clientSigHeader?: string;
}): Promise<AuthBundle> {
  const email = input.email.trim().toLowerCase();
  if (!email || !input.password) {
    throw new AppError(400, 'Email and password are required', 'VALIDATION_ERROR');
  }

  const user = await prisma.user.findFirst({
    where: { email, status: 'active' },
    include: { tenant: true },
  });

  if (!user || !user.passwordHash) {
    throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) {
    throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  if (user.tenant && user.tenant.status === 'suspended') {
    throw new AppError(403, 'Tenant is suspended', 'TENANT_SUSPENDED');
  }

  if (user.tenant?.deletedAt) {
    throw new AppError(403, 'Tenant is unavailable', 'TENANT_UNAVAILABLE');
  }

  return issueSession({
    user,
    userAgent: input.userAgent,
    ipAddress: input.ipAddress,
    clientSigHeader: input.clientSigHeader,
  });
}

export async function refreshSession(input: {
  refreshToken: string | undefined;
  userAgent?: string;
  ipAddress?: string;
  clientSigHeader?: string;
}): Promise<AuthBundle> {
  if (!input.refreshToken) {
    throw new AppError(401, 'Refresh token missing', 'UNAUTHORIZED');
  }

  const refreshTokenHash = hashToken(input.refreshToken);
  const session = await prisma.authSession.findUnique({
    where: { refreshTokenHash },
    include: {
      user: { include: { tenant: true } },
    },
  });

  if (!session || session.revokedAt || session.expiresAt.getTime() <= Date.now()) {
    throw new AppError(401, 'Invalid or expired refresh session', 'UNAUTHORIZED');
  }

  if (session.user.status !== 'active') {
    throw new AppError(401, 'User is not active', 'UNAUTHORIZED');
  }

  if (session.user.tenant?.status === 'suspended') {
    throw new AppError(403, 'Tenant is suspended', 'TENANT_SUSPENDED');
  }

  const expectedSig = clientSignatureFromRequest(input.userAgent, input.clientSigHeader);
  if (session.clientSignature && session.clientSignature !== expectedSig) {
    await prisma.authSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });
    throw new AppError(401, 'Refresh binding mismatch', 'UNAUTHORIZED');
  }

  // Rotate: revoke old, create new
  await prisma.authSession.update({
    where: { id: session.id },
    data: { revokedAt: new Date() },
  });

  return issueSession({
    user: session.user,
    userAgent: input.userAgent,
    ipAddress: input.ipAddress,
    clientSigHeader: input.clientSigHeader,
  });
}

export async function logoutSession(sessionId: string | undefined, refreshToken: string | undefined) {
  if (sessionId) {
    await prisma.authSession.updateMany({
      where: { id: sessionId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return;
  }

  if (refreshToken) {
    const refreshTokenHash = hashToken(refreshToken);
    await prisma.authSession.updateMany({
      where: { refreshTokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { tenant: true },
  });

  if (!user || user.status !== 'active') {
    throw new AppError(401, 'Unauthorized', 'UNAUTHORIZED');
  }

  const { getUserPermissionCodes, getUserFactoryScopeIds } = await import('../iam/iam.permissions.js');
  const { getTenantEntitlements } = await import('../modules/modules.service.js');

  const permissions = user.isPlatformAdmin ? ['*'] : await getUserPermissionCodes(user.id);
  const factoryScopeIds = user.isPlatformAdmin ? null : await getUserFactoryScopeIds(user.id);
  const enabledModules = user.tenantId ? await getTenantEntitlements(user.tenantId) : ['org', 'iam', 'inventory', 'manufacturing', 'commercial', 'steel'];

  return {
    user: mapUser(user),
    tenant: mapTenant(user.tenant),
    permissions,
    scopes: {
      factories: factoryScopeIds,
    },
    entitlements: {
      modules: enabledModules,
    },
  };
}
