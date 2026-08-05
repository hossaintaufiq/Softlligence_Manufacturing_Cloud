export type Tenant = {
  id: string;
  slug: string;
  name: string;
  status: string;
  planCode: string | null;
  createdAt: string;
  updatedAt: string;
};

type ApiErrorBody = {
  error?: { code?: string; message?: string };
};

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json()) as T & ApiErrorBody;
  if (!res.ok) {
    throw new Error(data?.error?.message || `Request failed (${res.status})`);
  }
  return data;
}

export async function listTenants(): Promise<Tenant[]> {
  const res = await fetch('/api/v1/platform/tenants', {
    credentials: 'include',
    cache: 'no-store',
  });
  const data = await parseJson<{ tenants: Tenant[] }>(res);
  return data.tenants;
}

export async function createTenant(input: {
  slug: string;
  name: string;
  planCode?: string;
}): Promise<Tenant> {
  const res = await fetch('/api/v1/platform/tenants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });
  const data = await parseJson<{ tenant: Tenant }>(res);
  return data.tenant;
}

export async function updateTenant(
  id: string,
  input: { name?: string; planCode?: string | null },
): Promise<Tenant> {
  const res = await fetch(`/api/v1/platform/tenants/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });
  const data = await parseJson<{ tenant: Tenant }>(res);
  return data.tenant;
}

export async function suspendTenant(id: string): Promise<Tenant> {
  const res = await fetch(`/api/v1/platform/tenants/${id}/suspend`, {
    method: 'POST',
    credentials: 'include',
  });
  const data = await parseJson<{ tenant: Tenant }>(res);
  return data.tenant;
}

export async function reactivateTenant(id: string): Promise<Tenant> {
  const res = await fetch(`/api/v1/platform/tenants/${id}/reactivate`, {
    method: 'POST',
    credentials: 'include',
  });
  const data = await parseJson<{ tenant: Tenant }>(res);
  return data.tenant;
}
