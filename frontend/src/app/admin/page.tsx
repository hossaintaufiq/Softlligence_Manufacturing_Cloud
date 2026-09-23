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
  businessType?: 'garments' | 'steel' | 'local';
};

export default function SubscriptionsDashboard() {
  const { user } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, any>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New Tenant Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [planCode, setPlanCode] = useState('Growth');
  const [businessType, setBusinessType] = useState<'garments' | 'steel' | 'local'>('garments');
  const [error, setError] = useState<string | null>(null);

  // Load tenants from localStorage
  const loadTenants = () => {
    const data = localStorage.getItem('smc_tenants');
    if (data) {
      setTenants(JSON.parse(data));
    }
    const uData = localStorage.getItem('smc_users');
    if (uData) {
      setUsersMap(JSON.parse(uData));
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  // Spacing presets based on density preference
  const isCompact = user?.preferences?.density === 'compact';
  const tableCellPadding = isCompact ? 'px-4 py-2.5 text-[11px]' : 'px-6 py-4 text-xs';
  const tableHeaderPadding = isCompact ? 'px-4 py-2.5 text-[8px]' : 'px-6 py-4 text-[9px]';
  const gridGap = isCompact ? 'gap-3.5' : 'gap-4 sm:gap-6';
  const kpiPadding = isCompact ? 'p-4' : 'p-5';

  const handleAddTenant = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !slug.trim()) {
      setError('Please provide both the Company Name and Slug URL.');
      return;
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    const duplicate = tenants.find((t) => t.slug === cleanSlug);
    if (duplicate) {
      setError('A workspace with this Slug URL already exists.');
      return;
    }

    const newTenant: Tenant = {
      id: Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      slug: cleanSlug,
      status: 'active',
      planCode,
      createdAt: new Date().toISOString().split('T')[0],
      businessType
    };

    // Register details in default user profiles
    const defaultManagerEmail = `manager@${cleanSlug}.com`;
    const storedUsers = localStorage.getItem('smc_users');
    if (storedUsers) {
      const parsedUsers = JSON.parse(storedUsers);
      parsedUsers[defaultManagerEmail] = {
        name: `${newTenant.name} Administrator`,
        role: 'tenant-admin',
        hash: 'manager123',
        tenantId: newTenant.id,
        tenantName: newTenant.name,
        preferences: {
          density: 'cozy',
          defaultTab: 'overview'
        }
      };
      localStorage.setItem('smc_users', JSON.stringify(parsedUsers));
      setUsersMap(parsedUsers);
    }

    const updated = [...tenants, newTenant];
    setTenants(updated);
    localStorage.setItem('smc_tenants', JSON.stringify(updated));

    setName('');
    setSlug('');
    setPlanCode('Growth');
    setBusinessType('garments');
    setError(null);
    setShowAddModal(false);
  };

  const toggleTenantStatus = (id: string) => {
    const updated = tenants.map((t) => {
      if (t.id === id) {
        return { ...t, status: t.status === 'active' ? 'suspended' : 'active' };
      }
      return t;
    }) as Tenant[];

    setTenants(updated);
    localStorage.setItem('smc_tenants', JSON.stringify(updated));
  };

  const handleDeleteTenant = (id: string) => {
    if (!confirm('Are you sure you want to delete this tenant and all associated data?')) return;
    const updated = tenants.filter((t) => t.id !== id);
    setTenants(updated);
    localStorage.setItem('smc_tenants', JSON.stringify(updated));
  };

  const totalTenants = tenants.length;
  const activeTenants = tenants.filter((t) => t.status === 'active').length;
  const suspendedTenants = tenants.filter((t) => t.status === 'suspended').length;

  return (
    <>
      {/* KPI Panel */}
      <div className={`grid grid-cols-1 sm:grid-cols-3 ${gridGap} animate-fade-in`}>
        <div className={`bg-white border border-slate-200/80 ${kpiPadding} rounded-2xl flex items-center justify-between shadow-sm`}>
          <div>
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Total Workspaces</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">{totalTenants}</h3>
          </div>
          <span className="text-xl text-[#C5A059] bg-[#FAF6EE] p-2 rounded-xl border border-[#C5A059]/10">🏢</span>
        </div>

        <div className={`bg-white border border-slate-200/80 ${kpiPadding} rounded-2xl flex items-center justify-between shadow-sm`}>
          <div>
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Active Instances</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1 font-mono">{activeTenants}</h3>
          </div>
          <span className="text-xl text-emerald-600 bg-emerald-50 p-2 rounded-xl border border-emerald-500/10">🟢</span>
        </div>

        <div className={`bg-white border border-slate-200/80 ${kpiPadding} rounded-2xl flex items-center justify-between shadow-sm`}>
          <div>
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Suspended Instances</p>
            <h3 className="text-2xl font-extrabold text-amber-600 mt-1 font-mono">{suspendedTenants}</h3>
          </div>
          <span className="text-xl text-amber-600 bg-amber-50 p-2 rounded-xl border border-amber-500/10">⚠️</span>
        </div>
      </div>

      {/* Action Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-3 gap-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">Corporate Tenant Workspaces</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Provision, inspect, and toggle isolated workspace nodes.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 bg-[#C5A059] hover:bg-[#B48F48] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-amber-500/10 active:scale-[0.98] flex items-center justify-center space-x-1 font-mono uppercase tracking-wider"
        >
          <span>+ Provision Workspace</span>
        </button>
      </div>

      {/* Tenants Grid/Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                <th className={tableHeaderPadding}>Company / Node Name</th>
                <th className={tableHeaderPadding}>Administrator User</th>
                <th className={tableHeaderPadding}>quick credentials</th>
                <th className={tableHeaderPadding}>Slug URL</th>
                <th className={tableHeaderPadding}>Billing Plan</th>
                <th className={`${tableHeaderPadding} text-center`}>Status</th>
                <th className={`${tableHeaderPadding} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {tenants.map((tenant) => {
                // Find admin user associated with this tenant
                const adminEntry = Object.entries(usersMap).find(
                  ([email, info]: [string, any]) => info.tenantId === tenant.id && info.role === 'tenant-admin'
                );
                
                const adminEmail = adminEntry ? adminEntry[0] : `manager@${tenant.slug}.com`;
                const adminName = adminEntry ? adminEntry[1].name : 'Default Manager';
                const adminPassword = adminEntry ? adminEntry[1].hash : 'manager123';
                const typeLabel = tenant.businessType === 'steel' 
                  ? 'Steel Mill ERP' 
                  : tenant.businessType === 'local' 
                    ? 'Local Business' 
                    : 'Garments ERP';

                return (
                  <tr key={tenant.id} className="hover:bg-slate-50/30 transition-colors">
                    
                    {/* Workspace Company details */}
                    <td className={tableCellPadding}>
                      <div>
                        <p className="text-slate-950 font-bold">{tenant.name}</p>
                        <span className={`inline-block px-1.5 py-0.2 rounded text-[8px] font-extrabold uppercase font-mono mt-1 ${
                          tenant.businessType === 'steel' 
                            ? 'bg-orange-500/10 text-orange-600 border border-orange-500/20' 
                            : tenant.businessType === 'local' 
                              ? 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20' 
                              : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                        }`}>
                          {typeLabel}
                        </span>
                      </div>
                    </td>

                    {/* Admin User Contact details */}
                    <td className={tableCellPadding}>
                      <div>
                        <p className="text-slate-900 font-bold">{adminName}</p>
                        <p className="text-[9px] text-slate-450 font-mono mt-0.5">{adminEmail}</p>
                      </div>
                    </td>

                    {/* Admin Credentials */}
                    <td className={tableCellPadding}>
                      <div className="font-mono bg-slate-50 border border-slate-150 px-2 py-1.5 rounded-lg inline-block">
                        <p className="text-[9px] text-slate-500">Hash: <span className="font-bold text-slate-800">{adminPassword}</span></p>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className={`${tableCellPadding} text-[#B48F48] font-mono`}>/{tenant.slug}</td>

                    {/* Pricing */}
                    <td className={tableCellPadding}>
                      <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-slate-600 font-bold font-mono">
                        {tenant.planCode}
                      </span>
                    </td>

                    {/* Status */}
                    <td className={`${tableCellPadding} text-center`}>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase font-mono tracking-wider ${
                          tenant.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                        }`}
                      >
                        {tenant.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className={`${tableCellPadding} text-right space-x-1.5 whitespace-nowrap`}>
                      <button
                        onClick={() => toggleTenantStatus(tenant.id)}
                        className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                          tenant.status === 'active'
                            ? 'bg-amber-50/60 hover:bg-amber-100/60 border-amber-200/50 text-amber-700'
                            : 'bg-emerald-50/60 hover:bg-emerald-100/60 border-emerald-200/50 text-emerald-700'
                        }`}
                      >
                        {tenant.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteTenant(tenant.id)}
                        className="px-2 py-1 bg-rose-50/60 hover:bg-rose-100/60 border border-rose-200/50 text-rose-600 rounded-lg transition-all"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
              {tenants.length === 0 && (
                <tr>
                  <td colSpan={7} className={`${tableCellPadding} text-center text-xs text-slate-400 font-mono py-10`}>
                    No corporate workspaces provisioned yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision Workspace Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 animate-zoom-in text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono">Provision New Node</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/5 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl mb-4 animate-shake">
                {error}
              </div>
            )}

            <form onSubmit={handleAddTenant} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Advanced Alloys"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''));
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-[#C5A059] text-xs font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">Routing Slug URL</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-slate-400 text-xs font-mono">/</span>
                  <input
                    type="text"
                    placeholder="acme-alloys"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 border border-slate-200 rounded-r-xl focus:outline-none focus:border-[#C5A059] text-xs font-semibold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">Industry Module Type</label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-[#C5A059] text-xs font-semibold"
                  >
                    <option value="garments">Garments ERP</option>
                    <option value="steel">Steel Mill ERP</option>
                    <option value="local">Local Business</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">Service Pricing Tier</label>
                  <select
                    value={planCode}
                    onChange={(e) => setPlanCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-[#C5A059] text-xs font-semibold"
                  >
                    <option value="Starter">Starter Pack</option>
                    <option value="Growth">Growth Module</option>
                    <option value="Enterprise">Enterprise Unlimited</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#C5A059] hover:bg-[#B48F48] text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-[0.98] font-mono uppercase tracking-wider"
                >
                  Confirm Provisioning
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
