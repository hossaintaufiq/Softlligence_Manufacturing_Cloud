import { randomBytes } from 'node:crypto';
import { prisma } from '../../config/prisma.js';
import { AppError } from '../../common/errors/AppError.js';
import { hashPassword, hashToken } from '../identity/identity.crypto.js';
import { ensureTenantIamDefaults } from './iam.permissions.js';

function mapUser(u: {
  id: string;
  email: string;
  name: string;
  status: string;
  tenantId: string | null;
  isPlatformAdmin: boolean;
  createdAt: Date;
  userRoles?: { role: { id: string; code: string; name: string } }[];
  userScopes?: { id: string; scopeType: string; scopeId: string }[];
}) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    status: u.status,
    tenantId: u.tenantId,
    isPlatformAdmin: u.isPlatformAdmin,
    createdAt: u.createdAt.toISOString(),
    roles: (u.userRoles ?? []).map((ur) => ({
      id: ur.role.id,
      code: ur.role.code,
      name: ur.role.name,
    })),
    scopes: (u.userScopes ?? []).map((s) => ({
      id: s.id,
      scopeType: s.scopeType,
      scopeId: s.scopeId,
    })),
  };
}

function mapRole(r: {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions?: { permission: { code: string } }[];
}) {
  return {
    id: r.id,
    code: r.code,
    name: r.name,
    description: r.description,
    isSystem: r.isSystem,
    permissions: (r.permissions ?? []).map((p) => p.permission.code).sort(),
  };
}

export async function listUsers(tenantId: string) {
  const rows = await prisma.user.findMany({
    where: { tenantId },
    include: {
      userRoles: { include: { role: true } },
      userScopes: true,
    },
    orderBy: { email: 'asc' },
  });
  return rows.map(mapUser);
}

export async function getUser(tenantId: string, id: string) {
  const row = await prisma.user.findFirst({
    where: { id, tenantId },
    include: {
      userRoles: { include: { role: true } },
      userScopes: true,
    },
  });
  if (!row) throw new AppError(404, 'User not found', 'NOT_FOUND');
  return mapUser(row);
}

export async function createUser(
  tenantId: string,
  input: { email: string; name: string; password: string; roleIds?: string[] },
) {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  if (!email || !name || !input.password) {
    throw new AppError(400, 'email, name, and password are required', 'VALIDATION_ERROR');
  }
  if (input.password.length < 8) {
    throw new AppError(400, 'password must be at least 8 characters', 'VALIDATION_ERROR');
  }

  const passwordHash = await hashPassword(input.password);
  try {
    const user = await prisma.user.create({
      data: {
        tenantId,
        email,
        name,
        passwordHash,
        status: 'active',
      },
    });
    if (input.roleIds?.length) {
      await assignRoles(tenantId, user.id, input.roleIds);
    }
    return getUser(tenantId, user.id);
  } catch (err: unknown) {
    if (typeof err === 'object' && err && 'code' in err && (err as { code: string }).code === 'P2002') {
      throw new AppError(409, 'User email already exists in tenant', 'CONFLICT');
    }
    throw err;
  }
}

export async function inviteUser(
  tenantId: string,
  input: { email: string; name: string; roleIds?: string[]; factoryIds?: string[] },
) {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  if (!email || !name) {
    throw new AppError(400, 'email and name are required', 'VALIDATION_ERROR');
  }

  const rawToken = randomBytes(32).toString('base64url');
  const inviteTokenHash = hashToken(rawToken);
  const inviteExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  let user;
  try {
    user = await prisma.user.create({
      data: {
        tenantId,
        email,
        name,
        status: 'invited',
        passwordHash: null,
        inviteTokenHash,
        inviteExpiresAt,
      },
    });
  } catch (err: unknown) {
    if (typeof err === 'object' && err && 'code' in err && (err as { code: string }).code === 'P2002') {
      throw new AppError(409, 'User email already exists in tenant', 'CONFLICT');
    }
    throw err;
  }

  if (input.roleIds?.length) {
    await assignRoles(tenantId, user.id, input.roleIds);
  }
  if (input.factoryIds?.length) {
    await setUserScopes(tenantId, user.id, input.factoryIds);
  }

  return {
    user: await getUser(tenantId, user.id),
    inviteToken: rawToken,
    expiresAt: inviteExpiresAt.toISOString(),
  };
}

export async function acceptInvite(input: { token: string; password: string; name?: string }) {
  if (!input.token || !input.password) {
    throw new AppError(400, 'token and password are required', 'VALIDATION_ERROR');
  }
  if (input.password.length < 8) {
    throw new AppError(400, 'password must be at least 8 characters', 'VALIDATION_ERROR');
  }

  const inviteTokenHash = hashToken(input.token);
  const user = await prisma.user.findFirst({
    where: { inviteTokenHash, status: 'invited' },
  });
  if (!user || !user.inviteExpiresAt || user.inviteExpiresAt.getTime() < Date.now()) {
    throw new AppError(400, 'Invalid or expired invite', 'INVALID_INVITE');
  }

  const passwordHash = await hashPassword(input.password);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      status: 'active',
      name: input.name?.trim() || user.name,
      inviteTokenHash: null,
      inviteExpiresAt: null,
    },
  });

  return { email: user.email, tenantId: user.tenantId };
}

export async function updateUser(
  tenantId: string,
  id: string,
  input: { name?: string; status?: string },
) {
  await getUser(tenantId, id);
  const data: { name?: string; status?: string } = {};
  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name) throw new AppError(400, 'name cannot be empty', 'VALIDATION_ERROR');
    data.name = name;
  }
  if (input.status !== undefined) data.status = input.status.trim();
  await prisma.user.update({ where: { id }, data });
  return getUser(tenantId, id);
}

export async function deactivateUser(tenantId: string, id: string, actorUserId: string) {
  if (id === actorUserId) {
    throw new AppError(400, 'Cannot deactivate yourself', 'VALIDATION_ERROR');
  }
  await getUser(tenantId, id);
  await prisma.user.update({
    where: { id },
    data: { status: 'deactivated', deactivatedAt: new Date() },
  });
  await prisma.authSession.updateMany({
    where: { userId: id, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  return getUser(tenantId, id);
}

export async function assignRoles(tenantId: string, userId: string, roleIds: string[]) {
  await getUser(tenantId, userId);
  const roles = await prisma.role.findMany({
    where: { id: { in: roleIds }, tenantId, deletedAt: null },
  });
  if (roles.length !== roleIds.length) {
    throw new AppError(400, 'One or more roles are invalid', 'VALIDATION_ERROR');
  }

  for (const role of roles) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId, roleId: role.id } },
      update: {},
      create: { tenantId, userId, roleId: role.id },
    });
  }
  return getUser(tenantId, userId);
}

export async function removeRole(tenantId: string, userId: string, roleId: string) {
  await getUser(tenantId, userId);
  await prisma.userRole.deleteMany({ where: { tenantId, userId, roleId } });
  return getUser(tenantId, userId);
}

export async function setUserScopes(tenantId: string, userId: string, factoryIds: string[]) {
  await getUser(tenantId, userId);

  if (factoryIds.length) {
    const factories = await prisma.factory.findMany({
      where: { id: { in: factoryIds }, tenantId, deletedAt: null },
    });
    if (factories.length !== factoryIds.length) {
      throw new AppError(400, 'One or more factories are invalid', 'VALIDATION_ERROR');
    }
  }

  await prisma.userScope.deleteMany({ where: { userId, scopeType: 'factory' } });
  for (const scopeId of factoryIds) {
    await prisma.userScope.create({
      data: { tenantId, userId, scopeType: 'factory', scopeId },
    });
  }
  return getUser(tenantId, userId);
}

export async function listRoles(tenantId: string) {
  const query = {
    where: { tenantId, deletedAt: null },
    include: { permissions: { include: { permission: true } } },
    orderBy: { name: 'asc' },
  } as const;

  let rows = await prisma.role.findMany(query);
  if (rows.length === 0) {
    // Tenant predates IAM defaults (or they were removed) — backfill once.
    await ensureTenantIamDefaults(tenantId);
    rows = await prisma.role.findMany(query);
  }
  return rows.map(mapRole);
}

export async function getRole(tenantId: string, id: string) {
  const row = await prisma.role.findFirst({
    where: { id, tenantId, deletedAt: null },
    include: { permissions: { include: { permission: true } } },
  });
  if (!row) throw new AppError(404, 'Role not found', 'NOT_FOUND');
  return mapRole(row);
}

export async function createRole(
  tenantId: string,
  input: { code: string; name: string; description?: string; permissionCodes?: string[] },
) {
  const code = input.code.trim().toLowerCase();
  const name = input.name.trim();
  if (!code || !name) {
    throw new AppError(400, 'code and name are required', 'VALIDATION_ERROR');
  }

  try {
    const role = await prisma.role.create({
      data: {
        tenantId,
        code,
        name,
        description: input.description?.trim() || null,
        isSystem: false,
      },
    });
    if (input.permissionCodes?.length) {
      await setRolePermissions(tenantId, role.id, input.permissionCodes);
    }
    return getRole(tenantId, role.id);
  } catch (err: unknown) {
    if (typeof err === 'object' && err && 'code' in err && (err as { code: string }).code === 'P2002') {
      throw new AppError(409, 'Role code already exists', 'CONFLICT');
    }
    throw err;
  }
}

export async function updateRole(
  tenantId: string,
  id: string,
  input: { name?: string; description?: string | null },
) {
  const role = await prisma.role.findFirst({ where: { id, tenantId, deletedAt: null } });
  if (!role) throw new AppError(404, 'Role not found', 'NOT_FOUND');

  await prisma.role.update({
    where: { id },
    data: {
      name: input.name === undefined ? undefined : input.name.trim(),
      description:
        input.description === undefined
          ? undefined
          : input.description === null
            ? null
            : input.description.trim(),
    },
  });
  return getRole(tenantId, id);
}

export async function setRolePermissions(tenantId: string, roleId: string, permissionCodes: string[]) {
  const role = await prisma.role.findFirst({ where: { id: roleId, tenantId, deletedAt: null } });
  if (!role) throw new AppError(404, 'Role not found', 'NOT_FOUND');

  const perms = await prisma.permissionCatalog.findMany({
    where: { code: { in: permissionCodes } },
  });
  if (perms.length !== permissionCodes.length) {
    throw new AppError(400, 'One or more permission codes are invalid', 'VALIDATION_ERROR');
  }

  await prisma.rolePermission.deleteMany({ where: { roleId } });
  for (const perm of perms) {
    await prisma.rolePermission.create({
      data: { roleId, permissionId: perm.id },
    });
  }
  return getRole(tenantId, roleId);
}

export async function deleteRole(tenantId: string, id: string) {
  const role = await prisma.role.findFirst({ where: { id, tenantId, deletedAt: null } });
  if (!role) throw new AppError(404, 'Role not found', 'NOT_FOUND');
  if (role.isSystem) {
    throw new AppError(400, 'Cannot delete system role', 'VALIDATION_ERROR');
  }
  await prisma.role.update({
    where: { id },
    data: { deletedAt: new Date(), code: `del_${role.code}_${id.slice(0, 6)}` },
  });
}

export async function listPermissions() {
  const rows = await prisma.permissionCatalog.findMany({ orderBy: { code: 'asc' } });
  return rows.map((p) => ({
    id: p.id,
    code: p.code,
    moduleCode: p.moduleCode,
    description: p.description,
  }));
}
