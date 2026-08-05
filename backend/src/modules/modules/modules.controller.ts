import type { Request, Response } from 'express';
import {
  createCustomFieldDefinition,
  deleteCustomFieldDefinition,
  getTenantEntitlements,
  listCustomFieldDefinitions,
  listModuleCatalog,
  listTenantModules,
  toggleTenantModule,
} from './modules.service.js';

export async function handleListCatalog(_req: Request, res: Response) {
  const catalog = await listModuleCatalog();
  res.json({ data: catalog });
}

export async function handleListTenantModules(req: Request, res: Response) {
  const tenantId = req.tenantId!;
  const modules = await listTenantModules(tenantId);
  res.json({ data: modules });
}

export async function handleGetEntitlements(req: Request, res: Response) {
  const tenantId = req.tenantId!;
  const entitlements = await getTenantEntitlements(tenantId);
  res.json({ data: { modules: entitlements } });
}

export async function handleToggleModule(req: Request, res: Response) {
  const tenantId = req.tenantId!;
  const moduleCode = req.params.code;
  const { enabled, configJson } = req.body || {};

  const result = await toggleTenantModule(tenantId, moduleCode, {
    enabled: Boolean(enabled),
    configJson,
  });
  res.json({ data: result });
}

export async function handleListCustomFields(req: Request, res: Response) {
  const tenantId = req.tenantId!;
  const entityType = typeof req.query.entityType === 'string' ? req.query.entityType : undefined;
  const fields = await listCustomFieldDefinitions(tenantId, entityType);
  res.json({ data: fields });
}

export async function handleCreateCustomField(req: Request, res: Response) {
  const tenantId = req.tenantId!;
  const created = await createCustomFieldDefinition(tenantId, req.body || {});
  res.status(201).json({ data: created });
}

export async function handleDeleteCustomField(req: Request, res: Response) {
  const tenantId = req.tenantId!;
  const id = req.params.id;
  await deleteCustomFieldDefinition(tenantId, id);
  res.json({ data: { message: 'Custom field definition deleted successfully' } });
}
