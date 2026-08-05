import { prisma } from '../../config/prisma.js';
import { AppError } from '../../common/errors/AppError.js';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type TenantDto = {
  id: string;
  slug: string;
  name: string;
  status: string;
  planCode: string | null;
  createdAt: string;
  updatedAt: string;
};

function mapTenant(t: {
  id: string;
  slug: string;
  name: string;
  status: string;
  planCode: string | null;
  createdAt: Date;
  updatedAt: Date;
}): TenantDto {
  return {
    id: t.id,
    slug: t.slug,
    name: t.name,
    status: t.status,
    planCode: t.planCode,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}

function normalizeSlug(slug: string): string {
  return slug.trim().toLowerCase();
}

export async function listTenants(): Promise<TenantDto[]> {
  const rows = await prisma.tenant.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(mapTenant);
}

export async function getTenant(id: string): Promise<TenantDto> {
  const row = await prisma.tenant.findFirst({
    where: { id, deletedAt: null },
  });
  if (!row) {
    throw new AppError(404, 'Tenant not found', 'NOT_FOUND');
  }
  return mapTenant(row);
}

export async function createTenant(input: {
  slug: string;
  name: string;
  planCode?: string | null;
  status?: string;
}): Promise<TenantDto> {
  const slug = normalizeSlug(input.slug);
  const name = input.name.trim();
  if (!slug || !name) {
    throw new AppError(400, 'slug and name are required', 'VALIDATION_ERROR');
  }
  if (!SLUG_RE.test(slug) || slug.length > 64) {
    throw new AppError(
      400,
      'slug must be lowercase alphanumeric with optional hyphens (max 64)',
      'VALIDATION_ERROR',
    );
  }

  const status = (input.status || 'trial').trim();
  const allowed = new Set(['active', 'trial', 'suspended']);
  if (!allowed.has(status)) {
    throw new AppError(400, 'Invalid status', 'VALIDATION_ERROR');
  }

  const existing = await prisma.tenant.findUnique({ where: { slug } });
  if (existing && !existing.deletedAt) {
    throw new AppError(409, 'Tenant slug already exists', 'CONFLICT');
  }

  if (existing?.deletedAt) {
    const revived = await prisma.tenant.update({
      where: { id: existing.id },
      data: {
        name,
        status,
        planCode: input.planCode?.trim() || existing.planCode,
        deletedAt: null,
      },
    });
    const { ensureTenantIamDefaults } = await import('../iam/iam.permissions.js');
    const { ensureTenantModuleDefaults } = await import('../modules/modules.service.js');
    await ensureTenantIamDefaults(revived.id);
    await ensureTenantModuleDefaults(revived.id);
    return mapTenant(revived);
  }

  const created = await prisma.tenant.create({
    data: {
      slug,
      name,
      status,
      planCode: input.planCode?.trim() || 'trial',
    },
  });

  const { ensureTenantIamDefaults } = await import('../iam/iam.permissions.js');
  const { ensureTenantModuleDefaults } = await import('../modules/modules.service.js');
  await ensureTenantIamDefaults(created.id);
  await ensureTenantModuleDefaults(created.id);

  return mapTenant(created);
}

export async function updateTenant(
  id: string,
  input: { name?: string; planCode?: string | null },
): Promise<TenantDto> {
  const row = await prisma.tenant.findFirst({ where: { id, deletedAt: null } });
  if (!row) {
    throw new AppError(404, 'Tenant not found', 'NOT_FOUND');
  }

  const data: { name?: string; planCode?: string | null } = {};
  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name) throw new AppError(400, 'name cannot be empty', 'VALIDATION_ERROR');
    data.name = name;
  }
  if (input.planCode !== undefined) {
    data.planCode = input.planCode === null ? null : String(input.planCode).trim() || null;
  }

  const updated = await prisma.tenant.update({
    where: { id },
    data,
  });
  return mapTenant(updated);
}

export async function suspendTenant(id: string): Promise<TenantDto> {
  const row = await prisma.tenant.findFirst({ where: { id, deletedAt: null } });
  if (!row) {
    throw new AppError(404, 'Tenant not found', 'NOT_FOUND');
  }
  if (row.status === 'suspended') {
    return mapTenant(row);
  }
  const updated = await prisma.tenant.update({
    where: { id },
    data: { status: 'suspended' },
  });
  return mapTenant(updated);
}

export async function reactivateTenant(id: string): Promise<TenantDto> {
  const row = await prisma.tenant.findFirst({ where: { id, deletedAt: null } });
  if (!row) {
    throw new AppError(404, 'Tenant not found', 'NOT_FOUND');
  }
  const updated = await prisma.tenant.update({
    where: { id },
    data: { status: 'active' },
  });
  return mapTenant(updated);
}
