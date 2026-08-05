'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import {
  createTenant,
  listTenants,
  reactivateTenant,
  suspendTenant,
  updateTenant,
  type Tenant,
} from '@/lib/api/tenants';

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === 'active' || status === 'trial'
      ? 'bg-emerald-50 text-ok ring-emerald-600/15'
      : status === 'suspended'
        ? 'bg-red-50 text-bad ring-red-600/15'
        : 'bg-slate-100 text-mute ring-slate-300/60';

  return (
    <span className={`rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tone}`}>
      {status}
    </span>
  );
}

export function TenantAdminPanel() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [planCode, setPlanCode] = useState('trial');
  const [creating, setCreating] = useState(false);

  const refresh = useCallback(async () => {
    setError(null);
    const rows = await listTenants();
    setTenants(rows);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refresh();
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load tenants');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await createTenant({ slug, name, planCode: planCode || undefined });
      setSlug('');
      setName('');
      setPlanCode('trial');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setCreating(false);
    }
  }

  async function onToggleStatus(tenant: Tenant) {
    setBusyId(tenant.id);
    setError(null);
    try {
      if (tenant.status === 'suspended') {
        await reactivateTenant(tenant.id);
      } else {
        await suspendTenant(tenant.id);
      }
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setBusyId(null);
    }
  }

  async function onSavePlan(tenant: Tenant, nextPlan: string) {
    setBusyId(tenant.id);
    setError(null);
    try {
      await updateTenant(tenant.id, { planCode: nextPlan || null });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Plan update failed');
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-mute">Loading tenants…</p>;
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={onCreate}
        className="rounded-2xl border border-line bg-elevated p-5 shadow-soft sm:p-6"
      >
        <h2 className="text-sm font-semibold text-ink">Create tenant</h2>
        <p className="mt-1 text-xs text-mute">Billing is a stub — plan code is stored on the tenant only.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <input
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="slug (acme-steel)"
            className="rounded-lg border border-line px-3 py-2 text-sm outline-none ring-accent focus:ring-2"
          />
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Display name"
            className="rounded-lg border border-line px-3 py-2 text-sm outline-none ring-accent focus:ring-2"
          />
          <input
            value={planCode}
            onChange={(e) => setPlanCode(e.target.value)}
            placeholder="plan code"
            className="rounded-lg border border-line px-3 py-2 text-sm outline-none ring-accent focus:ring-2"
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-strong disabled:opacity-60"
        >
          {creating ? 'Creating…' : 'Create tenant'}
        </button>
      </form>

      <section className="rounded-2xl border border-line bg-elevated p-5 shadow-soft sm:p-6">
        <h2 className="text-sm font-semibold text-ink">Tenants</h2>
        {error ? <p className="mt-2 text-sm text-bad">{error}</p> : null}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wide text-mute">
              <tr>
                <th className="py-2 pr-3 font-medium">Name</th>
                <th className="py-2 pr-3 font-medium">Slug</th>
                <th className="py-2 pr-3 font-medium">Plan</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.id} className="border-b border-line/80">
                  <td className="py-3 pr-3 font-medium text-ink">{t.name}</td>
                  <td className="py-3 pr-3 text-mute">{t.slug}</td>
                  <td className="py-3 pr-3">
                    <input
                      defaultValue={t.planCode ?? ''}
                      key={`${t.id}-${t.planCode}`}
                      onBlur={(e) => {
                        const next = e.target.value.trim();
                        if (next !== (t.planCode ?? '')) onSavePlan(t, next);
                      }}
                      className="w-28 rounded-md border border-line px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-accent"
                      disabled={busyId === t.id}
                    />
                  </td>
                  <td className="py-3 pr-3">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="py-3">
                    <button
                      type="button"
                      disabled={busyId === t.id}
                      onClick={() => onToggleStatus(t)}
                      className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink hover:bg-canvas disabled:opacity-60"
                    >
                      {t.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tenants.length === 0 ? <p className="mt-4 text-sm text-mute">No tenants yet.</p> : null}
        </div>
      </section>
    </div>
  );
}
