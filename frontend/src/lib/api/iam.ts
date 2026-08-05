import { parseJson } from './client';

export type IamUser = {
  id: string;
  email: string;
  name: string;
  status: string;
  tenantId: string | null;
  roles: { id: string; code: string; name: string }[];
  scopes: { id: string; scopeType: string; scopeId: string }[];
};

export type IamRole = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: string[];
};

export type Permission = {
  id: string;
  code: string;
  moduleCode: string;
  description: string | null;
};

export async function listUsers(): Promise<IamUser[]> {
  const res = await fetch('/api/v1/users', { credentials: 'include', cache: 'no-store' });
  return (await parseJson<{ users: IamUser[] }>(res)).users;
}

export async function inviteUser(input: {
  email: string;
  name: string;
  roleIds?: string[];
  factoryIds?: string[];
}): Promise<{ user: IamUser; inviteToken: string; expiresAt: string }> {
  const res = await fetch('/api/v1/users/invites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });
  return parseJson(res);
}

export async function deactivateUser(id: string): Promise<IamUser> {
  const res = await fetch(`/api/v1/users/${id}/deactivate`, {
    method: 'POST',
    credentials: 'include',
  });
  return (await parseJson<{ user: IamUser }>(res)).user;
}

export async function assignRoles(userId: string, roleIds: string[]): Promise<IamUser> {
  const res = await fetch(`/api/v1/users/${userId}/roles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ roleIds }),
  });
  return (await parseJson<{ user: IamUser }>(res)).user;
}

export async function setScopes(userId: string, factoryIds: string[]): Promise<IamUser> {
  const res = await fetch(`/api/v1/users/${userId}/scopes`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ factoryIds }),
  });
  return (await parseJson<{ user: IamUser }>(res)).user;
}

export async function listRoles(): Promise<IamRole[]> {
  const res = await fetch('/api/v1/roles', { credentials: 'include', cache: 'no-store' });
  return (await parseJson<{ roles: IamRole[] }>(res)).roles;
}

export async function listPermissions(): Promise<Permission[]> {
  const res = await fetch('/api/v1/permissions', { credentials: 'include', cache: 'no-store' });
  return (await parseJson<{ permissions: Permission[] }>(res)).permissions;
}

export async function createRole(input: {
  code: string;
  name: string;
  description?: string;
  permissionCodes?: string[];
}): Promise<IamRole> {
  const res = await fetch('/api/v1/roles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });
  return (await parseJson<{ role: IamRole }>(res)).role;
}

export async function setRolePermissions(roleId: string, permissionCodes: string[]): Promise<IamRole> {
  const res = await fetch(`/api/v1/roles/${roleId}/permissions`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ permissionCodes }),
  });
  return (await parseJson<{ role: IamRole }>(res)).role;
}

export async function acceptInvite(input: {
  token: string;
  password: string;
  name?: string;
}): Promise<void> {
  const res = await fetch('/api/v1/auth/invites/accept', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  await parseJson(res);
}
