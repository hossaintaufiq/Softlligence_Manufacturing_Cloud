import { prisma } from '../../config/prisma.js';
import { AppError } from '../../common/errors/AppError.js';
import {
  PERMISSIONS,
  TENANT_ADMIN_PERMISSIONS,
  TENANT_VIEWER_PERMISSIONS,
  type PermissionCode,
} from './permissions.catalog.js';

export async function seedPermissionCatalog() {
  const existing = await prisma.permissionCatalog.findMany({
    select: { code: true, moduleCode: true, description: true },
  });
  const byCode = new Map(existing.map((row) => [row.code, row]));

  const missing = PERMISSIONS.filter((p) => !byCode.has(p.code));
  if (missing.length > 0) {
    await prisma.permissionCatalog.createMany({
      data: missing.map((p) => ({
        code: p.code,
        moduleCode: p.moduleCode,
        description: p.description,
      })),
      skipDuplicates: true,
    });
  }

  const stale = PERMISSIONS.filter((p) => {
    const row = byCode.get(p.code);
    return row && (row.moduleCode !== p.moduleCode || row.description !== p.description);
  });
  await Promise.all(
    stale.map((p) =>
      prisma.permissionCatalog.update({
        where: { code: p.code },
        data: { moduleCode: p.moduleCode, description: p.description },
      }),
    ),
  );
}

async function attachPermissions(roleId: string, codes: readonly string[]) {
  const perms = await prisma.permissionCatalog.findMany({
    where: { code: { in: [...codes] } },
    select: { id: true },
  });
  if (perms.length === 0) return;
  await prisma.rolePermission.createMany({
    data: perms.map((perm) => ({ roleId, permissionId: perm.id })),
    skipDuplicates: true,
  });
}

/** Ensure default system roles exist for a tenant. */
export async function ensureTenantIamDefaults(tenantId: string) {
  await seedPermissionCatalog();

  const admin = await prisma.role.upsert({
    where: { tenantId_code: { tenantId, code: 'tenant_admin' } },
    update: { name: 'Tenant Admin', isSystem: true, deletedAt: null },
    create: {
      tenantId,
      code: 'tenant_admin',
      name: 'Tenant Admin',
      description: 'Full tenant administration',
      isSystem: true,
    },
  });
  await attachPermissions(admin.id, TENANT_ADMIN_PERMISSIONS);

  const viewer = await prisma.role.upsert({
    where: { tenantId_code: { tenantId, code: 'tenant_viewer' } },
    update: { name: 'Tenant Viewer', isSystem: true, deletedAt: null },
    create: {
      tenantId,
      code: 'tenant_viewer',
      name: 'Tenant Viewer',
      description: 'Read-oriented access',
      isSystem: true,
    },
  });
  await attachPermissions(viewer.id, TENANT_VIEWER_PERMISSIONS);

  return { adminRoleId: admin.id, viewerRoleId: viewer.id };
}

export async function getUserPermissionCodes(userId: string): Promise<string[]> {
  const rows = await prisma.userRole.findMany({
    where: { userId },
    include: {
      role: {
        include: {
          permissions: { include: { permission: true } },
        },
      },
    },
  });

  const set = new Set<string>();
  for (const ur of rows) {
    if (ur.role.deletedAt) continue;
    for (const rp of ur.role.permissions) {
      set.add(rp.permission.code);
    }
  }
  return [...set].sort();
}

export async function userHasPermission(userId: string, code: PermissionCode | string): Promise<boolean> {
  const codes = await getUserPermissionCodes(userId);
  return codes.includes(code);
}

export async function assertPermission(userId: string, code: PermissionCode | string) {
  const ok = await userHasPermission(userId, code);
  if (!ok) {
    throw new AppError(403, `Missing permission: ${code}`, 'FORBIDDEN');
  }
}

export async function getUserFactoryScopeIds(userId: string): Promise<string[] | null> {
  const scopes = await prisma.userScope.findMany({
    where: { userId, scopeType: 'factory' },
  });
  // null = unrestricted (no scope rows); empty array shouldn't happen often
  if (scopes.length === 0) return null;
  return scopes.map((s) => s.scopeId);
}
