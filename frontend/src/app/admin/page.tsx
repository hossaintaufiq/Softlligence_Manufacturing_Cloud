'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { TenantAdminPanel } from '@/components/admin/TenantAdminPanel';
import { listTenants, type Tenant } from '@/lib/api/tenants';

export default function AdminPage() {
  const { user, isLoadingUser } = useWorkspace();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const rows = await listTenants();
        setTenants(rows);
      } catch (err) {
        console.error('Failed to load tenants list for admin dashboard:', err);
      } finally {
        setLoadingStats(false);
      }
    }
    loadStats();
  }, []);

  if (isLoadingUser || !user) {
    return (
      <div className="p-6">
        <p className="text-xs text-slate-500 font-mono animate-pulse">Resolving platform admin credentials...</p>
      </div>
    );
  }

  // Calculate platform totals
  const totalTenantsCount = tenants.length;
  const activeTenants = tenants.filter((t) => t.status === 'active' || t.status === 'trial').length;
  const suspendedTenants = tenants.filter((t) => t.status === 'suspended').length;
  const enterpriseCount = tenants.filter((t) => t.planCode?.toLowerCase() === 'enterprise').length;

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* Console Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Platform Super Admin Control Panel</h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Signed in as <span className="font-semibold text-slate-800">{user.email}</span> • Manage corporate tenants, SaaS packages, modules, and platform infrastructure nodes.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Platform Health: 100% Operational</span>
        </div>
      </header>

      {/* Grid of Key SaaS Platform Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Provisioned Tenants</span>
            <span className="text-lg">🏢</span>
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-950 font-mono">
              {loadingStats ? '—' : totalTenantsCount}
            </p>
            <p className="text-[10px] text-slate-400 font-medium">Global database-isolated contexts</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Operational Tiers</span>
            <span className="text-lg">👑</span>
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-950 font-mono">
              {loadingStats ? '—' : `${enterpriseCount} Enterprise`}
            </p>
            <p className="text-[10px] text-slate-400 font-medium">{totalTenantsCount - enterpriseCount} Basic / Standard slots</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Workspace Node Health</span>
            <span className="text-lg">⚡</span>
          </div>
          <div>
            <p className="text-xl font-extrabold text-emerald-600 font-mono">
              {loadingStats ? '—' : `${activeTenants} / ${totalTenantsCount}`}
            </p>
            <p className="text-[10px] text-slate-400 font-medium">{suspendedTenants} tenant(s) suspended</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Node API Health Status</span>
            <span className="text-lg">🛡️</span>
          </div>
          <div>
            <p className="text-xl font-extrabold text-indigo-700 font-mono">3 Clusters</p>
            <p className="text-[10px] text-slate-400 font-medium">0 container errors flagged</p>
          </div>
        </div>
      </div>

      {/* Platform Activity logs and Tenant Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left main pane: Management Tabs (Takes 8/12) */}
        <div className="lg:col-span-8 space-y-4">
          <TenantAdminPanel />
        </div>

        {/* Right pane: Platform Health Visualizer (Takes 4/12) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Infrastructure Health Visualizer */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Infrastructure Telemetry</h3>
              <span className="text-[9px] font-bold text-slate-400 font-mono uppercase bg-slate-50 border border-slate-100 px-1 py-0.5 rounded">REALTIME</span>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* CPU Usage progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-slate-700 text-[10px]">
                  <span>CPU Usage (Platform Average)</span>
                  <span className="font-mono text-indigo-600">24%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '24%' }} />
                </div>
              </div>

              {/* Memory Usage progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-slate-700 text-[10px]">
                  <span>Memory Allocation (SaaS Clusters)</span>
                  <span className="font-mono text-emerald-600">58%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '58%' }} />
                </div>
              </div>

              {/* API Load */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-slate-700 text-[10px]">
                  <span>API Load (Concurrent Traffic)</span>
                  <span className="font-mono text-amber-600">12 / 100 req/s</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '12%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Database Migration Track */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Database Migration Log</h3>
              <p className="text-[10px] text-slate-400 font-medium">Automatic platform version synchronization</p>
            </div>

            <div className="space-y-3 font-mono text-[10px]">
              <div className="flex justify-between text-slate-700">
                <span className="font-semibold">v1.1.2 — Multi-tenant Ledger</span>
                <span className="text-emerald-600 font-bold">SUCCESS</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span className="font-semibold">v1.1.0 — Factory contexts setup</span>
                <span className="text-emerald-600 font-bold">SUCCESS</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span className="font-semibold">v1.0.8 — Entitlements migration</span>
                <span className="text-emerald-600 font-bold">SUCCESS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
