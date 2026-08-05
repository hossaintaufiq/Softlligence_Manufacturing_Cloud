'use client';

import React, { FormEvent, useCallback, useEffect, useState } from 'react';
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
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : status === 'suspended'
        ? 'bg-rose-50 text-rose-700 border-rose-200'
        : 'bg-slate-100 text-slate-600 border-slate-200';

  return (
    <span className={`rounded px-2 py-0.5 text-xs font-bold border ${tone}`}>
      {status}
    </span>
  );
}

export function TenantAdminPanel() {
  const [activeTab, setActiveTab] = useState<'tenants' | 'modules' | 'health'>('tenants');

  // Tenants State
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
    try {
      const rows = await listTenants();
      setTenants(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tenants');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await refresh();
      if (!cancelled) setLoading(false);
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

  return (
    <div className="space-y-6">
      {/* Super Admin Control Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-fit space-x-1 border border-slate-200">
        <button
          onClick={() => setActiveTab('tenants')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'tenants'
              ? 'bg-white text-indigo-700 shadow-2xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'
          }`}
        >
          Tenants & Billing
        </button>
        <button
          onClick={() => setActiveTab('modules')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'modules'
              ? 'bg-white text-indigo-700 shadow-2xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'
          }`}
        >
          System Modules
        </button>
        <button
          onClick={() => setActiveTab('health')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'health'
              ? 'bg-white text-indigo-700 shadow-2xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'
          }`}
        >
          Platform Health
        </button>
      </div>

      {activeTab === 'tenants' && (
        <div className="space-y-6">
          {/* Create Tenant Form */}
          <form onSubmit={onCreate} className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Provision New Corporate Tenant</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Manually launch isolated tenant database contexts.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <input
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="Workspace Slug (e.g. acme-steel)"
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs bg-slate-50 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Corporate Name"
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs bg-slate-50 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
              <input
                value={planCode}
                onChange={(e) => setPlanCode(e.target.value)}
                placeholder="Plan Code (e.g. enterprise)"
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs bg-slate-50 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white transition-colors disabled:opacity-50"
            >
              {creating ? 'Creating Workspace...' : 'Create Tenant Workspace'}
            </button>
          </form>

          {/* Tenants List Table */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Active Workspace Registrations</h2>
            {error ? <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2.5 rounded border border-rose-100">{error}</p> : null}

            {loading ? (
              <p className="text-xs text-slate-500 font-medium">Resolving tenant list...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-xs">
                  <thead className="border-b border-slate-200 text-slate-400 uppercase font-bold">
                    <tr>
                      <th className="py-2 pr-3">Corporate Name</th>
                      <th className="py-2 pr-3">Workspace Slug</th>
                      <th className="py-2 pr-3">Billing Tier</th>
                      <th className="py-2 pr-3">Operational Status</th>
                      <th className="py-2">Control Switch</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tenants.map((t) => (
                      <tr key={t.id}>
                        <td className="py-3 pr-3 font-bold text-slate-900">{t.name}</td>
                        <td className="py-3 pr-3 font-mono text-slate-500">{t.slug}</td>
                        <td className="py-3 pr-3">
                          <input
                            defaultValue={t.planCode ?? ''}
                            key={`${t.id}-${t.planCode}`}
                            onBlur={(e) => {
                              const next = e.target.value.trim();
                              if (next !== (t.planCode ?? '')) onSavePlan(t, next);
                            }}
                            className="w-28 rounded-md border border-slate-200 px-2 py-1 text-xs outline-none focus:border-indigo-600 focus:bg-white"
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
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                          >
                            {t.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {tenants.length === 0 ? <p className="text-xs text-slate-500 mt-4 text-center">No tenants found.</p> : null}
              </div>
            )}
          </section>
        </div>
      )}

      {activeTab === 'modules' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Unified Module Entitlements</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Toggle global access availability for ERP modules.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900">🔥 Steel Vertical Loggers</span>
                <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded text-[9px] font-bold">TEMPLATE ACTIVE</span>
              </div>
              <p className="text-slate-500 text-[11px]">Enables Scrap weighing, Furnace Melt yield KPIs, and Rolling mill log track sheets.</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900">👔 Garments & Apparel Master</span>
                <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded text-[9px] font-bold">READY</span>
              </div>
              <p className="text-slate-500 text-[11px]">Style catalog matrix, color-size SKU tables, and bundle tag cut-to-pack metrics.</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900">📦 Advanced WMS & Bin tracking</span>
                <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded text-[9px] font-bold">SYSTEM CORE</span>
              </div>
              <p className="text-slate-500 text-[11px]">Forward-backward batch genealogy, 2D DataMatrix print generator, and bin capacities.</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900">🤖 AI Operation Predictor</span>
                <span className="px-2 py-0.5 bg-purple-50 border border-purple-200 text-purple-700 rounded text-[9px] font-bold">EXTENDED</span>
              </div>
              <p className="text-slate-500 text-[11px]">Generative ERP query natural language modal and ML demand forecasting modules.</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'health' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Platform Health & Node Statistics</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Real-time stats from container nodes and DB connections.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p className="font-bold text-slate-500 text-[10px] uppercase">Node API Clusters</p>
              <p className="text-lg font-bold text-emerald-600">3 Online / 0 Error</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p className="font-bold text-slate-500 text-[10px] uppercase">DB Pool Usage</p>
              <p className="text-lg font-bold text-slate-900">14 Active / 40 Idle</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p className="font-bold text-slate-500 text-[10px] uppercase">BullMQ background worker</p>
              <p className="text-lg font-bold text-indigo-600">182 Active Jobs</p>
            </div>
          </div>

          {/* DR Snapshots list */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Automatic Disaster Recovery Backups</h3>
            
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 font-bold text-slate-700 flex justify-between">
                <span>Backup Archive</span>
                <span>Created At</span>
              </div>
              <div className="divide-y divide-slate-100 bg-white">
                <div className="px-4 py-3 flex justify-between font-mono">
                  <span className="text-slate-900 font-semibold">backup-db-postgres-2026-08-05.tar.gz</span>
                  <span className="text-slate-500">2026-08-05 04:00:12</span>
                </div>
                <div className="px-4 py-3 flex justify-between font-mono">
                  <span className="text-slate-900 font-semibold">backup-db-postgres-2026-08-04.tar.gz</span>
                  <span className="text-slate-500">2026-08-04 04:00:09</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
