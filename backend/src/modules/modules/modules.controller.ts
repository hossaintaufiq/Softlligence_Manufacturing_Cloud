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

function tenantId(req: Request): string {
  return req.auth!.user.tenantId!;
}

export async function handleListCatalog(_req: Request, res: Response) {
  const catalog = await listModuleCatalog();
  res.json({ catalog });
}

export async function handleListTenantModules(req: Request, res: Response) {
  const modules = await listTenantModules(tenantId(req));
  res.json({ modules });
}

export async function handleGetEntitlements(req: Request, res: Response) {
  const modules = await getTenantEntitlements(tenantId(req));
  res.json({ modules });
}

export async function handleToggleModule(req: Request, res: Response) {
  const moduleCode = req.params.code;
  const { enabled, configJson } = req.body || {};

  const module = await toggleTenantModule(tenantId(req), moduleCode, {
    enabled: Boolean(enabled),
    configJson,
  });
  res.json({ module });
}

export async function handleListCustomFields(req: Request, res: Response) {
  const entityType = typeof req.query.entityType === 'string' ? req.query.entityType : undefined;
  const fields = await listCustomFieldDefinitions(tenantId(req), entityType);
  res.json({ fields });
}

export async function handleCreateCustomField(req: Request, res: Response) {
  const field = await createCustomFieldDefinition(tenantId(req), req.body || {});
  res.status(201).json({ field });
}

export async function handleDeleteCustomField(req: Request, res: Response) {
  await deleteCustomFieldDefinition(tenantId(req), req.params.id);
  res.status(204).send();
}
