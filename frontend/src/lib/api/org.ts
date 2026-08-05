export type Company = {
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

export type Factory = {
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

type ApiErrorBody = {
  error?: { code?: string; message?: string };
};

async function parseJson<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;
  const data = (await res.json()) as T & ApiErrorBody;
  if (!res.ok) {
    throw new Error(data?.error?.message || `Request failed (${res.status})`);
  }
  return data;
}

export async function listCompanies(): Promise<Company[]> {
  const res = await fetch('/api/v1/companies', { credentials: 'include', cache: 'no-store' });
  const data = await parseJson<{ companies: Company[] }>(res);
  return data.companies;
}

export async function createCompany(input: {
  name: string;
  code: string;
  currency?: string;
  taxId?: string;
}): Promise<Company> {
  const res = await fetch('/api/v1/companies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });
  const data = await parseJson<{ company: Company }>(res);
  return data.company;
}

export async function deleteCompany(id: string): Promise<void> {
  const res = await fetch(`/api/v1/companies/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  await parseJson(res);
}

export async function listFactories(companyId?: string): Promise<Factory[]> {
  const q = companyId ? `?company_id=${encodeURIComponent(companyId)}` : '';
  const res = await fetch(`/api/v1/factories${q}`, { credentials: 'include', cache: 'no-store' });
  const data = await parseJson<{ factories: Factory[] }>(res);
  return data.factories;
}

export async function createFactory(input: {
  companyId: string;
  name: string;
  code: string;
  timezone?: string;
}): Promise<Factory> {
  const res = await fetch('/api/v1/factories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });
  const data = await parseJson<{ factory: Factory }>(res);
  return data.factory;
}

export async function deleteFactory(id: string): Promise<void> {
  const res = await fetch(`/api/v1/factories/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  await parseJson(res);
}
