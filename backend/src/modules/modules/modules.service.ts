import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { AppError } from '../../common/errors/AppError.js';
import { MODULE_CATALOG } from './modules.catalog.js';

export async function seedModuleCatalog() {
  const existing = await prisma.moduleCatalog.findMany({
    select: { code: true, name: true, description: true, category: true, isCore: true, defaultEnabled: true },
  });
  const byCode = new Map(existing.map((row) => [row.code, row]));

  const missing = MODULE_CATALOG.filter((item) => !byCode.has(item.code));
  if (missing.length > 0) {
    await prisma.moduleCatalog.createMany({
      data: missing.map((item) => ({
        code: item.code,
        name: item.name,
        description: item.description,
        category: item.category,
        isCore: item.isCore,
        defaultEnabled: item.defaultEnabled,
      })),
      skipDuplicates: true,
    });
  }

  const stale = MODULE_CATALOG.filter((item) => {
    const row = byCode.get(item.code);
    return (
      row &&
      (row.name !== item.name ||
        row.description !== item.description ||
        row.category !== item.category ||
        row.isCore !== item.isCore ||
        row.defaultEnabled !== item.defaultEnabled)
    );
  });

  await Promise.all(
    stale.map((item) =>
      prisma.moduleCatalog.update({
        where: { code: item.code },
        data: {
          name: item.name,
          description: item.description,
          category: item.category,
          isCore: item.isCore,
          defaultEnabled: item.defaultEnabled,
        },
      }),
    ),
  );
}

/** Ensure default module rows exist for a tenant (idempotent). */
export async function ensureTenantModuleDefaults(tenantId: string) {
  await seedModuleCatalog();
  const catalog = await prisma.moduleCatalog.findMany({
    select: { code: true, defaultEnabled: true },
  });

  const existing = await prisma.tenantModule.findMany({
    where: { tenantId },
    select: { moduleCode: true },
  });
  const existingCodes = new Set(existing.map((row) => row.moduleCode));

  const missing = catalog.filter((item) => !existingCodes.has(item.code));
  if (missing.length === 0) return;

  await prisma.tenantModule.createMany({
    data: missing.map((item) => ({
      tenantId,
      moduleCode: item.code,
      enabled: item.defaultEnabled,
    })),
    skipDuplicates: true,
  });
}

async function backfillTenantModulesIfEmpty(tenantId: string) {
  const count = await prisma.tenantModule.count({ where: { tenantId } });
  if (count === 0) {
    await ensureTenantModuleDefaults(tenantId);
  }
}

export async function listModuleCatalog() {
  await seedModuleCatalog();
  const rows = await prisma.moduleCatalog.findMany({
    orderBy: [{ category: 'asc' }, { code: 'asc' }],
  });
  return rows.map((r) => ({
    id: r.id,
    code: r.code,
    name: r.name,
    description: r.description,
    category: r.category,
    isCore: r.isCore,
    defaultEnabled: r.defaultEnabled,
  }));
}

export async function listTenantModules(tenantId: string) {
  await backfillTenantModulesIfEmpty(tenantId);
  const rows = await prisma.tenantModule.findMany({
    where: { tenantId },
    include: { module: true },
    orderBy: { moduleCode: 'asc' },
  });

  return rows.map((r) => ({
    id: r.id,
    tenantId: r.tenantId,
    moduleCode: r.moduleCode,
    enabled: r.enabled,
    enabledAt: r.enabledAt.toISOString(),
    configJson: r.configJson,
    name: r.module.name,
    description: r.module.description,
    category: r.module.category,
    isCore: r.module.isCore,
  }));
}

export async function getTenantEntitlements(tenantId: string): Promise<string[]> {
  await backfillTenantModulesIfEmpty(tenantId);
  const rows = await prisma.tenantModule.findMany({
    where: { tenantId, enabled: true },
    select: { moduleCode: true },
  });
  return rows.map((r) => r.moduleCode).sort();
}

export async function isModuleEnabledForTenant(tenantId: string, moduleCode: string): Promise<boolean> {
  const row = await prisma.tenantModule.findUnique({
    where: { tenantId_moduleCode: { tenantId, moduleCode } },
    select: { enabled: true },
  });
  if (!row) {
    await backfillTenantModulesIfEmpty(tenantId);
    const refreshed = await prisma.tenantModule.findUnique({
      where: { tenantId_moduleCode: { tenantId, moduleCode } },
      select: { enabled: true },
    });
    return refreshed?.enabled ?? false;
  }
  return row.enabled;
}

export async function toggleTenantModule(
  tenantId: string,
  moduleCode: string,
  input: { enabled: boolean; configJson?: unknown },
) {
  await seedModuleCatalog();
  const moduleItem = await prisma.moduleCatalog.findUnique({ where: { code: moduleCode } });
  if (!moduleItem) {
    throw new AppError(404, `Module ${moduleCode} not found in catalog`, 'NOT_FOUND');
  }

  if (moduleItem.isCore && !input.enabled) {
    throw new AppError(400, `Core module '${moduleCode}' cannot be disabled`, 'VALIDATION_ERROR');
  }

  await backfillTenantModulesIfEmpty(tenantId);

  const updated = await prisma.tenantModule.upsert({
    where: { tenantId_moduleCode: { tenantId, moduleCode } },
    update: {
      enabled: input.enabled,
      configJson: input.configJson !== undefined ? (input.configJson as Prisma.InputJsonValue) : undefined,
    },
    create: {
      tenantId,
      moduleCode,
      enabled: input.enabled,
      configJson: input.configJson !== undefined ? (input.configJson as Prisma.InputJsonValue) : undefined,
    },
    include: { module: true },
  });

  return {
    id: updated.id,
    tenantId: updated.tenantId,
    moduleCode: updated.moduleCode,
    enabled: updated.enabled,
    enabledAt: updated.enabledAt.toISOString(),
    configJson: updated.configJson,
    name: updated.module.name,
    description: updated.module.description,
    category: updated.module.category,
    isCore: updated.module.isCore,
  };
}

// —— Custom Field Definitions (ADR-0011) ——

export async function listCustomFieldDefinitions(tenantId: string, entityType?: string) {
  const rows = await prisma.customFieldDefinition.findMany({
    where: {
      tenantId,
      deletedAt: null,
      ...(entityType ? { entityType } : {}),
    },
    orderBy: [{ entityType: 'asc' }, { fieldKey: 'asc' }],
  });

  return rows.map((r) => ({
    id: r.id,
    tenantId: r.tenantId,
    entityType: r.entityType,
    fieldKey: r.fieldKey,
    label: r.label,
    dataType: r.dataType,
    isRequired: r.isRequired,
    optionsJson: r.optionsJson,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function createCustomFieldDefinition(
  tenantId: string,
  input: {
    entityType: string;
    fieldKey: string;
    label: string;
    dataType?: string;
    isRequired?: boolean;
    optionsJson?: unknown;
  },
) {
  const entityType = input.entityType.trim().toLowerCase();
  const fieldKey = input.fieldKey.trim().toLowerCase();
  const label = input.label.trim();

  if (!entityType || !fieldKey || !label) {
    throw new AppError(400, 'entityType, fieldKey, and label are required', 'VALIDATION_ERROR');
  }

  const validTypes = ['string', 'number', 'boolean', 'select', 'date'];
  const dataType = (input.dataType || 'string').trim().toLowerCase();
  if (!validTypes.includes(dataType)) {
    throw new AppError(400, `dataType must be one of: ${validTypes.join(', ')}`, 'VALIDATION_ERROR');
  }

  try {
    const created = await prisma.customFieldDefinition.create({
      data: {
        tenantId,
        entityType,
        fieldKey,
        label,
        dataType,
        isRequired: Boolean(input.isRequired),
        optionsJson: input.optionsJson !== undefined ? (input.optionsJson as Prisma.InputJsonValue) : undefined,
      },
    });

    return {
      id: created.id,
      tenantId: created.tenantId,
      entityType: created.entityType,
      fieldKey: created.fieldKey,
      label: created.label,
      dataType: created.dataType,
      isRequired: created.isRequired,
      optionsJson: created.optionsJson,
      createdAt: created.createdAt.toISOString(),
    };
  } catch (err: unknown) {
    if (typeof err === 'object' && err && 'code' in err && (err as { code: string }).code === 'P2002') {
      throw new AppError(409, `Custom field '${fieldKey}' already defined for entity '${entityType}'`, 'CONFLICT');
    }
    throw err;
  }
}

export async function deleteCustomFieldDefinition(tenantId: string, id: string) {
  const row = await prisma.customFieldDefinition.findFirst({
    where: { id, tenantId, deletedAt: null },
  });
  if (!row) throw new AppError(404, 'Custom field definition not found', 'NOT_FOUND');

  await prisma.customFieldDefinition.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      fieldKey: `del_${row.fieldKey}_${id.slice(0, 6)}`,
    },
  });
}
