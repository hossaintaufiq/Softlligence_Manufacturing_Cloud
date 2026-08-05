'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import {
  assignRoles,
  createRole,
  deactivateUser,
  inviteUser,
  listPermissions,
  listRoles,
  listUsers,
  setRolePermissions,
  setScopes,
  type IamRole,
  type IamUser,
  type Permission,
} from '@/lib/api/iam';
import { listFactories, type Factory } from '@/lib/api/org';

export function IamPanel() {
  const [users, setUsers] = useState<IamUser[]>([]);
  const [roles, setRoles] = useState<IamRole[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteToken, setInviteToken] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [inviteRoleId, setInviteRoleId] = useState('');
  const [inviteFactoryId, setInviteFactoryId] = useState('');

  const [roleCode, setRoleCode] = useState('');
  const [roleName, setRoleName] = useState('');

  const refresh = useCallback(async () => {
    const [u, r, p, f] = await Promise.all([
      listUsers(),
      listRoles(),
      listPermissions(),
      listFactories(),
    ]);
    setUsers(u);
    setRoles(r);
    setPermissions(p);
    setFactories(f);
    if (!inviteRoleId && r[0]) setInviteRoleId(r[0].id);
  }, [inviteRoleId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refresh();
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load IAM');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  async function onInvite(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInviteToken(null);
    try {
      const result = await inviteUser({
        email,
        name,
        roleIds: inviteRoleId ? [inviteRoleId] : undefined,
        factoryIds: inviteFactoryId ? [inviteFactoryId] : undefined,
      });
      setInviteToken(result.inviteToken);
      setEmail('');
      setName('');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invite failed');
    }
  }

  async function onCreateRole(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createRole({
        code: roleCode,
        name: roleName,
        permissionCodes: ['iam.user.read', 'iam.role.read'],
      });
      setRoleCode('');
      setRoleName('');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create role failed');
    }
  }

  if (loading) return <p className="text-sm text-mute">Loading IAM…</p>;

  return (
    <div className="space-y-8">
      {error ? <p className="text-sm text-bad">{error}</p> : null}
      {inviteToken ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-ok ring-1 ring-inset ring-emerald-600/15">
          Invite created. One-time token (share securely / accept at /invite):{' '}
          <code className="break-all">{inviteToken}</code>
        </p>
      ) : null}

      <section className="rounded-2xl border border-line bg-elevated p-5 shadow-soft sm:p-6">
        <h2 className="text-sm font-semibold text-ink">Invite user</h2>
        <form onSubmit={onInvite} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email"
            className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
          />
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="name"
            className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
          />
          <select
            value={inviteRoleId}
            onChange={(e) => setInviteRoleId(e.target.value)}
            className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <select
            value={inviteFactoryId}
            onChange={(e) => setInviteFactoryId(e.target.value)}
            className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">All factories</option>
            {factories.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.code})
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-strong"
          >
            Send invite
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-line bg-elevated p-5 shadow-soft sm:p-6">
        <h2 className="text-sm font-semibold text-ink">Users</h2>
        <ul className="mt-4 divide-y divide-line">
          {users.map((u) => (
            <li key={u.id} className="space-y-2 py-3 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">
                    {u.name}{' '}
                    <span className="font-normal text-mute">({u.email})</span>
                  </p>
                  <p className="text-xs text-mute">
                    {u.status} · roles: {u.roles.map((r) => r.code).join(', ') || 'none'} ·
                    scopes:{' '}
                    {u.scopes.length
                      ? u.scopes.map((s) => s.scopeId.slice(0, 8)).join(', ')
                      : 'all factories'}
                  </p>
                </div>
                {u.status !== 'deactivated' ? (
                  <button
                    type="button"
                    onClick={async () => {
                      setError(null);
                      try {
                        await deactivateUser(u.id);
                        await refresh();
                      } catch (err) {
                        setError(err instanceof Error ? err.message : 'Deactivate failed');
                      }
                    }}
                    className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium hover:bg-canvas"
                  >
                    Deactivate
                  </button>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  defaultValue=""
                  onChange={async (e) => {
                    const roleId = e.target.value;
                    if (!roleId) return;
                    setError(null);
                    try {
                      await assignRoles(u.id, [roleId]);
                      await refresh();
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Assign failed');
                    }
                    e.target.value = '';
                  }}
                  className="rounded-md border border-line px-2 py-1 text-xs"
                >
                  <option value="">Assign role…</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <select
                  defaultValue=""
                  onChange={async (e) => {
                    const factoryId = e.target.value;
                    setError(null);
                    try {
                      await setScopes(u.id, factoryId ? [factoryId] : []);
                      await refresh();
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Scope failed');
                    }
                    e.target.value = '';
                  }}
                  className="rounded-md border border-line px-2 py-1 text-xs"
                >
                  <option value="">Set factory scope…</option>
                  <option value="">Clear (all factories)</option>
                  {factories.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.code}
                    </option>
                  ))}
                </select>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-line bg-elevated p-5 shadow-soft sm:p-6">
        <h2 className="text-sm font-semibold text-ink">Roles</h2>
        <form onSubmit={onCreateRole} className="mt-4 grid gap-3 sm:grid-cols-3">
          <input
            required
            value={roleCode}
            onChange={(e) => setRoleCode(e.target.value)}
            placeholder="code"
            className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
          />
          <input
            required
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            placeholder="name"
            className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="submit"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-strong"
          >
            Create role
          </button>
        </form>
        <ul className="mt-4 divide-y divide-line">
          {roles.map((r) => (
            <li key={r.id} className="py-3 text-sm">
              <p className="font-medium text-ink">
                {r.name}{' '}
                <span className="font-normal text-mute">
                  ({r.code}){r.isSystem ? ' · system' : ''}
                </span>
              </p>
              <p className="mt-1 text-xs text-mute">{r.permissions.join(', ') || 'no permissions'}</p>
              {!r.isSystem ? (
                <button
                  type="button"
                  className="mt-2 rounded-md border border-line px-2 py-1 text-xs hover:bg-canvas"
                  onClick={async () => {
                    setError(null);
                    try {
                      await setRolePermissions(
                        r.id,
                        permissions.map((p) => p.code),
                      );
                      await refresh();
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Update perms failed');
                    }
                  }}
                >
                  Grant all permissions
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-line bg-elevated p-5 shadow-soft sm:p-6">
        <h2 className="text-sm font-semibold text-ink">Permission catalog</h2>
        <ul className="mt-3 grid gap-1 text-xs text-mute sm:grid-cols-2">
          {permissions.map((p) => (
            <li key={p.id}>
              <span className="font-medium text-ink">{p.code}</span> — {p.description}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
