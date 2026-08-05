import { apiBase, parseJson } from './client';

export type TenantModuleItem = {
  id: string;
  tenantId: string;
  moduleCode: string;
  enabled: boolean;
  enabledAt: string;
  configJson: unknown;
  name: string;
  description: string | null;
  category: string;
  isCore: boolean;
};

export type ModuleCatalogItem = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: string;
  isCore: boolean;
  defaultEnabled: boolean;
};

export async function fetchModuleCatalog(): Promise<ModuleCatalogItem[]> {
  const res = await fetch(`${apiBase()}/api/v1/modules/catalog`, {
    headers: { Accept: 'application/json' },
  });
  const data = await parseJson<{ catalog: ModuleCatalogItem[] }>(res);
  return data.catalog || [];
}

export async function fetchTenantModules(): Promise<TenantModuleItem[]> {
  const res = await fetch(`${apiBase()}/api/v1/modules`, {
    headers: { Accept: 'application/json' },
  });
  const data = await parseJson<{ modules: TenantModuleItem[] }>(res);
  return data.modules || [];
}

export async function fetchEntitlements(): Promise<string[]> {
  const res = await fetch(`${apiBase()}/api/v1/modules/entitlements`, {
    headers: { Accept: 'application/json' },
  });
  const data = await parseJson<{ modules: string[] }>(res);
  return data.modules || [];
}

export async function toggleTenantModuleApi(code: string, enabled: boolean): Promise<TenantModuleItem> {
  const res = await fetch(`${apiBase()}/api/v1/modules/${encodeURIComponent(code)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ enabled }),
  });
  const data = await parseJson<{ module: TenantModuleItem }>(res);
  return data.module;
}
