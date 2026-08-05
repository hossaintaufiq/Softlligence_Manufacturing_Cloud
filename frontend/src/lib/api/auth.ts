import { parseJson } from './client';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  status: string;
  tenantId: string | null;
  isPlatformAdmin: boolean;
};

export type AuthTenant = {
  id: string;
  slug: string;
  name: string;
  status: string;
  planCode: string | null;
};

export type MeResponse = {
  user: AuthUser;
  tenant: AuthTenant | null;
  permissions: string[];
  scopes?: { factories: string[] | null };
  entitlements?: { modules: string[] };
};

export type LoginResponse = {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  user: AuthUser;
  tenant: AuthTenant | null;
};

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  return parseJson<LoginResponse>(res);
}

export async function fetchMe(): Promise<MeResponse> {
  const res = await fetch('/api/v1/auth/me', {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });
  return parseJson<MeResponse>(res);
}

export async function refreshSession(): Promise<LoginResponse> {
  const res = await fetch('/api/v1/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  });
  return parseJson<LoginResponse>(res);
}

export async function logout(): Promise<void> {
  const res = await fetch('/api/v1/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok && res.status !== 204) {
    throw new Error(`Logout failed (${res.status})`);
  }
}
