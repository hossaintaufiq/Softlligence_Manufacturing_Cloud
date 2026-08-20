'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

type Tenant = {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended';
  planCode: string;
  createdAt: string;
};

type GarmentsData = {
  tenantId: string;
  activeStyles: string[];
  linesCount: number;
  dailyOutput: number;
  avgEfficiency: number;
  syncState: string;
};

export default function GarmentsMonitorPage() {
  const { user } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [garmentsMap, setGarmentsMap] = useState<Record<string, GarmentsData>>({});

  // Seed metrics for tenants (including default ones and dynamically created ones)
  const loadTenantsAndMetrics = () => {
    const data = localStorage.getItem('smc_tenants');
    if (data) {
      const parsedTenants: Tenant[] = JSON.parse(data);
      setTenants(parsedTenants);

      // Create dummy production yield data for the workspaces
      const map: Record<string, GarmentsData> = {};
      parsedTenants.forEach((tenant) => {
        // Standard seeding variables based on slug
        if (tenant.slug === 'acme') {
          map[tenant.id] = {
            tenantId: tenant.id,
            activeStyles: ['STYLE-2026-A92 (Polo)', 'STYLE-2026-B12 (Tee)'],
            linesCount: 3,
            dailyOutput: 2251,
            avgEfficiency: 91.9,
            syncState: 'Operational'
          };
        } else if (tenant.slug === 'sterling') {
          map[tenant.id] = {
            tenantId: tenant.id,
            activeStyles: ['STYLE-2026-C04 (Hoodie)'],
            linesCount: 2,
            dailyOutput: 1450,
            avgEfficiency: 89.2,
            syncState: 'Operational'
          };
        } else {
          // Dynamic defaults for newly added tenants
          map[tenant.id] = {
            tenantId: tenant.id,
            activeStyles: ['STYLE-2026-DEF (Default Style)'],
            linesCount: 1,
            dailyOutput: 500,
            avgEfficiency: 85.0,
            syncState: 'Synchronized'
          };
        }
      });
      setGarmentsMap(map);
    }
  };

  useEffect(() => {
    loadTenantsAndMetrics();
  }, []);

  const handleToggleSuspension = (id: string) => {
    const updated = tenants.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          status: t.status === 'active' ? ('suspended' as const) : ('active' as const)
        };
      }
      return t;
    });
    setTenants(updated);
    localStorage.setItem('smc_tenants', JSON.stringify(updated));
  };

  const isCompact = user?.preferences?.density === 'compact';
  const tableCellPadding = isCompact ? 'px-4 py-2.5 text-[11px]' : 'px-6 py-4 text-xs';
  const tableHeaderPadding = isCompact ? 'px-4 py-2.5 text-[8px]' : 'px-6 py-4 text-[9px]';

  // Summaries
  const totalProductionYield = Object.values(garmentsMap).reduce((sum, g) => sum + g.dailyOutput, 0);
  const activeLinesCount = Object.values(garmentsMap).reduce((sum, g) => sum + g.linesCount, 0);
  const suspendedCount = tenants.filter((t) => t.status === 'suspended').length;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in text-slate-800">
      
      {/* Header section */}
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-extrabold text-slate-900">Multi-Tenant Garments & Access Monitor</h2>
        <p className="text-xs text-slate-500 mt-0.5">Oversee production performance levels across workspaces and configure firewall lockout states.</p>
      </div>

      {/* Grid of Diagnostics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Monitored Nodes</p>
          <h3 className="text-2xl font-extrabold text-slate-950 font-mono mt-1">{tenants.length}</h3>
          <p className="text-[9px] text-slate-400 font-mono mt-1">ACTIVE CORPORATE TENANTS</p>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Tracked Sewing Lines</p>
          <h3 className="text-2xl font-extrabold text-slate-955 font-mono mt-1">{activeLinesCount}</h3>
          <p className="text-[9px] text-[#B48F48] font-bold font-mono mt-1">REAL-TIME PRODUCTION HOOKS</p>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Global Yield Average</p>
          <h3 className="text-2xl font-extrabold text-slate-955 font-mono mt-1">{totalProductionYield.toLocaleString()}</h3>
          <p className="text-[9px] text-emerald-600 font-bold font-mono mt-1">TOTAL PCS / DAY STREAMED</p>
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Suspended Gateways</p>
          <h3 className="text-2xl font-extrabold text-slate-955 font-mono mt-1">{suspendedCount}</h3>
          <p className="text-[9px] text-rose-600 font-bold font-mono mt-1">BLOCKED ACCESS LOGS</p>
        </div>

      </div>

      {/* Main monitoring grid table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/85 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                <th className={tableHeaderPadding}>Workspace Node Name</th>
                <th className={tableHeaderPadding}>Active Garments Styles</th>
                <th className={tableHeaderPadding}>Daily Production Yield</th>
                <th className={tableHeaderPadding}>Avg Efficiency</th>
                <th className={tableHeaderPadding}>Connection State</th>
                <th className={tableHeaderPadding}>Node Access Status</th>
                <th className={tableHeaderPadding}>Platform Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {tenants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400 italic">No workspace tenants currently provisioned.</td>
                </tr>
              ) : (
                tenants.map((tenant) => {
                  const metric = garmentsMap[tenant.id] || {
                    activeStyles: ['No Active Styles'],
                    linesCount: 0,
                    dailyOutput: 0,
                    avgEfficiency: 0,
                    syncState: 'Sync Failure'
                  };

                  return (
                    <tr key={tenant.id} className="hover:bg-slate-50/50 transition-colors">
                      
                      {/* Brand Name */}
                      <td className={tableCellPadding}>
                        <div>
                          <p className="text-slate-950 font-bold text-xs">{tenant.name}</p>
                          <p className="text-[9px] text-slate-400 font-mono tracking-wider">ID: {tenant.id.toUpperCase()}</p>
                        </div>
                      </td>

                      {/* Active Apparel items */}
                      <td className={tableCellPadding}>
                        <div className="space-y-1">
                          {metric.activeStyles.map((style, sIdx) => (
                            <span key={sIdx} className="inline-block bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-mono px-2 py-0.5 rounded mr-1">
                              {style}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Daily Yield */}
                      <td className={tableCellPadding}>
                        <div className="font-mono">
                          <span className="font-extrabold text-slate-900">{metric.dailyOutput.toLocaleString()} Pcs</span>
                          <span className="text-slate-400 block text-[9px] font-bold">across {metric.linesCount} lines</span>
                        </div>
                      </td>

                      {/* Efficiency */}
                      <td className={tableCellPadding}>
                        <span className={`font-mono font-extrabold text-xs ${metric.avgEfficiency >= 90 ? 'text-emerald-600' : 'text-slate-800'}`}>
                          {metric.avgEfficiency}%
                        </span>
                      </td>

                      {/* Sync State */}
                      <td className={tableCellPadding}>
                        <div className="flex items-center space-x-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${tenant.status === 'suspended' ? 'bg-slate-400' : 'bg-emerald-500 animate-pulse'}`} />
                          <span className="text-[10px] font-bold text-slate-500 font-mono tracking-wide uppercase">{tenant.status === 'suspended' ? 'Suspended' : metric.syncState}</span>
                        </div>
                      </td>

                      {/* Access Status */}
                      <td className={tableCellPadding}>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase font-mono tracking-wider ${
                          tenant.status === 'active' 
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                        }`}>
                          {tenant.status}
                        </span>
                      </td>

                      {/* Toggles */}
                      <td className={tableCellPadding}>
                        <button
                          onClick={() => handleToggleSuspension(tenant.id)}
                          className={`px-3 py-1.5 rounded-xl font-bold font-mono text-[9px] uppercase tracking-wider transition-all active:scale-[0.98] ${
                            tenant.status === 'active'
                              ? 'bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600'
                              : 'bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 text-emerald-600'
                          }`}
                        >
                          {tenant.status === 'active' ? 'Suspend Node' : 'Activate Node'}
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
