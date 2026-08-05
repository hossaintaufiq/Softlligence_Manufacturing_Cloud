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
  const data = await parseJson<{ data: ModuleCatalogItem[] }>(res);
  return data.data;
}

export async function fetchTenantModules(): Promise<TenantModuleItem[]> {
  const res = await fetch(`${apiBase()}/api/v1/modules`, {
    headers: { Accept: 'application/json' },
  });
  const data = await parseJson<{ data: TenantModuleItem[] }>(res);
  return data.data;
}

export async function fetchEntitlements(): Promise<string[]> {
  const res = await fetch(`${apiBase()}/api/v1/modules/entitlements`, {
    headers: { Accept: 'application/json' },
  });
  const data = await parseJson<{ data: { modules: string[] } }>(res);
  return data.data.modules;
}

export async function toggleTenantModuleApi(code: string, enabled: boolean): Promise<TenantModuleItem> {
  const res = await fetch(`${apiBase()}/api/v1/modules/${encodeURIComponent(code)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ enabled }),
  });
  const data = await parseJson<{ data: TenantModuleItem }>(res);
  return data.data;
}
