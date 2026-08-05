import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { AppError } from '../../common/errors/AppError.js';

const CODE_RE = /^[A-Z0-9][A-Z0-9_-]{0,63}$/i;

export type CompanyDto = {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  taxId: string | null;
  currency: string;
  addressJson: unknown;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type FactoryDto = {
  id: string;
  tenantId: string;
  companyId: string;
  name: string;
  code: string;
  timezone: string;
  addressJson: unknown;
  status: string;
  createdAt: string;
  updatedAt: string;
};

function mapCompany(c: {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  taxId: string | null;
  currency: string;
  addressJson: Prisma.JsonValue | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): CompanyDto {
  return {
    id: c.id,
    tenantId: c.tenantId,
    name: c.name,
    code: c.code,
    taxId: c.taxId,
    currency: c.currency,
    addressJson: c.addressJson,
    status: c.status,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

function mapFactory(f: {
  id: string;
  tenantId: string;
  companyId: string;
  name: string;
  code: string;
  timezone: string;
  addressJson: Prisma.JsonValue | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): FactoryDto {
  return {
    id: f.id,
    tenantId: f.tenantId,
    companyId: f.companyId,
    name: f.name,
    code: f.code,
    timezone: f.timezone,
    addressJson: f.addressJson,
    status: f.status,
    createdAt: f.createdAt.toISOString(),
    updatedAt: f.updatedAt.toISOString(),
  };
}

function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

function assertCode(code: string) {
  if (!CODE_RE.test(code)) {
    throw new AppError(
      400,
      'code must be 1–64 chars: letters, numbers, underscore, hyphen',
      'VALIDATION_ERROR',
    );
  }
}

// —— Companies ——

export async function listCompanies(tenantId: string): Promise<CompanyDto[]> {
  const rows = await prisma.company.findMany({
    where: { tenantId, deletedAt: null },
    orderBy: { name: 'asc' },
  });
  return rows.map(mapCompany);
}

export async function getCompany(tenantId: string, id: string): Promise<CompanyDto> {
  const row = await prisma.company.findFirst({
    where: { id, tenantId, deletedAt: null },
  });
  if (!row) throw new AppError(404, 'Company not found', 'NOT_FOUND');
  return mapCompany(row);
}

export async function createCompany(
  tenantId: string,
  input: {
    name: string;
    code: string;
    taxId?: string | null;
    currency?: string;
    addressJson?: unknown;
    status?: string;
  },
): Promise<CompanyDto> {
  const name = input.name.trim();
  const code = normalizeCode(input.code);
  if (!name || !code) {
    throw new AppError(400, 'name and code are required', 'VALIDATION_ERROR');
  }
  assertCode(code);

  const currency = (input.currency || 'USD').trim().toUpperCase();
  if (currency.length !== 3) {
    throw new AppError(400, 'currency must be a 3-letter ISO code', 'VALIDATION_ERROR');
  }

  try {
    const created = await prisma.company.create({
      data: {
        tenantId,
        name,
        code,
        taxId: input.taxId?.trim() || null,
        currency,
        addressJson: (input.addressJson as Prisma.InputJsonValue) ?? undefined,
        status: (input.status || 'active').trim(),
      },
    });
    return mapCompany(created);
  } catch (err: unknown) {
    if (typeof err === 'object' && err && 'code' in err && (err as { code: string }).code === 'P2002') {
      throw new AppError(409, 'Company code already exists', 'CONFLICT');
    }
    throw err;
  }
}

export async function updateCompany(
  tenantId: string,
  id: string,
  input: {
    name?: string;
    taxId?: string | null;
    currency?: string;
    addressJson?: unknown;
    status?: string;
  },
): Promise<CompanyDto> {
  await getCompany(tenantId, id);

  const data: Prisma.CompanyUpdateInput = {};
  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name) throw new AppError(400, 'name cannot be empty', 'VALIDATION_ERROR');
    data.name = name;
  }
  if (input.taxId !== undefined) data.taxId = input.taxId === null ? null : String(input.taxId).trim() || null;
  if (input.currency !== undefined) {
    const currency = input.currency.trim().toUpperCase();
    if (currency.length !== 3) {
      throw new AppError(400, 'currency must be a 3-letter ISO code', 'VALIDATION_ERROR');
    }
    data.currency = currency;
  }
  if (input.addressJson !== undefined) {
    data.addressJson = input.addressJson as Prisma.InputJsonValue;
  }
  if (input.status !== undefined) data.status = input.status.trim();

  const updated = await prisma.company.update({ where: { id }, data });
  return mapCompany(updated);
}

export async function softDeleteCompany(tenantId: string, id: string): Promise<void> {
  const row = await getCompany(tenantId, id);
  const factories = await prisma.factory.count({
    where: { tenantId, companyId: id, deletedAt: null },
  });
  if (factories > 0) {
    throw new AppError(409, 'Cannot delete company with active factories', 'CONFLICT');
  }

  await prisma.company.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      code: `DEL:${row.code}:${id.slice(0, 8)}`,
    },
  });
}

// —— Factories ——

export async function listFactories(tenantId: string, companyId?: string): Promise<FactoryDto[]> {
  const rows = await prisma.factory.findMany({
    where: {
      tenantId,
      deletedAt: null,
      ...(companyId ? { companyId } : {}),
    },
    orderBy: { name: 'asc' },
  });
  return rows.map(mapFactory);
}

export async function getFactory(tenantId: string, id: string): Promise<FactoryDto> {
  const row = await prisma.factory.findFirst({
    where: { id, tenantId, deletedAt: null },
  });
  if (!row) throw new AppError(404, 'Factory not found', 'NOT_FOUND');
  return mapFactory(row);
}

export async function createFactory(
  tenantId: string,
  input: {
    companyId: string;
    name: string;
    code: string;
    timezone?: string;
    addressJson?: unknown;
    status?: string;
  },
): Promise<FactoryDto> {
  await getCompany(tenantId, input.companyId);

  const name = input.name.trim();
  const code = normalizeCode(input.code);
  if (!name || !code) {
    throw new AppError(400, 'name and code are required', 'VALIDATION_ERROR');
  }
  assertCode(code);

  try {
    const created = await prisma.factory.create({
      data: {
        tenantId,
        companyId: input.companyId,
        name,
        code,
        timezone: (input.timezone || 'UTC').trim() || 'UTC',
        addressJson: (input.addressJson as Prisma.InputJsonValue) ?? undefined,
        status: (input.status || 'active').trim(),
      },
    });
    return mapFactory(created);
  } catch (err: unknown) {
    if (typeof err === 'object' && err && 'code' in err && (err as { code: string }).code === 'P2002') {
      throw new AppError(409, 'Factory code already exists for this company', 'CONFLICT');
    }
    throw err;
  }
}

export async function updateFactory(
  tenantId: string,
  id: string,
  input: {
    name?: string;
    timezone?: string;
    addressJson?: unknown;
    status?: string;
  },
): Promise<FactoryDto> {
  await getFactory(tenantId, id);

  const data: Prisma.FactoryUpdateInput = {};
  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name) throw new AppError(400, 'name cannot be empty', 'VALIDATION_ERROR');
    data.name = name;
  }
  if (input.timezone !== undefined) data.timezone = input.timezone.trim() || 'UTC';
  if (input.addressJson !== undefined) {
    data.addressJson = input.addressJson as Prisma.InputJsonValue;
  }
  if (input.status !== undefined) data.status = input.status.trim();

  const updated = await prisma.factory.update({ where: { id }, data });
  return mapFactory(updated);
}

export async function softDeleteFactory(tenantId: string, id: string): Promise<void> {
  const row = await getFactory(tenantId, id);
  await prisma.factory.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      code: `DEL:${row.code}:${id.slice(0, 8)}`,
    },
  });
}
