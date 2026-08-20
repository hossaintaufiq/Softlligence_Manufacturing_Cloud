'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

type Tenant = {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended';
  planCode: string;
  createdAt: string;
};

export default function SuperAdminDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New Tenant Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [planCode, setPlanCode] = useState('Growth');
  const [error, setError] = useState<string | null>(null);

  // Security guard redirect if not authorized
  useEffect(() => {
    if (!loading && (!user || user.role !== 'super-admin')) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  // Load tenants from localStorage
  const loadTenants = () => {
    const data = localStorage.getItem('smc_tenants');
    if (data) {
      setTenants(JSON.parse(data));
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  if (loading || !user || user.role !== 'super-admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-mono text-xs">
        Authenticating Super User...
      </div>
    );
  }

  // Dashboard calculations
  const totalTenants = tenants.length;
  const activeTenants = tenants.filter((t) => t.status === 'active').length;
  const suspendedTenants = tenants.filter((t) => t.status === 'suspended').length;

  const handleAddTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      setError('Please fill in all required fields.');
      return;
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9]/g, '');
    const exists = tenants.some((t) => t.slug === cleanSlug);
    if (exists) {
      setError(`Tenant slug "${cleanSlug}" is already in use.`);
      return;
    }

    const newTenant: Tenant = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      slug: cleanSlug,
      status: 'active',
      planCode,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updated = [...tenants, newTenant];
    setTenants(updated);
    localStorage.setItem('smc_tenants', JSON.stringify(updated));

    // Reset Form
    setName('');
    setSlug('');
    setPlanCode('Growth');
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

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-800 flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="bg-white/85 backdrop-blur-md border-b border-slate-200/60 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <div className="flex items-center space-x-3">
          <span className="text-[#C5A059] text-xl">👑</span>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 leading-none">
              Super Admin Console
            </h1>
            <p className="text-[9px] text-[#B48F48] font-mono tracking-wider uppercase mt-1.5 font-bold">
              Softlligence Manufacturing Cloud
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900">{user.name}</p>
            <p className="text-[10px] text-slate-500 font-mono font-medium">{user.email}</p>
          </div>
          <button
            onClick={logout}
            className="px-3.5 py-1.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-600 text-xs font-bold rounded-xl transition-all shadow-xs"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
        
        {/* KPI Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center justify-between shadow-xs">
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">
                Total Subscriptions
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1 font-mono">{totalTenants}</h3>
            </div>
            <span className="text-2xl text-[#C5A059] bg-[#FAF6EE] p-2.5 rounded-xl border border-[#C5A059]/10">🏢</span>
          </div>

          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center justify-between shadow-xs">
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">
                Active Nodes
              </p>
              <h3 className="text-3xl font-extrabold text-emerald-600 mt-1 font-mono">{activeTenants}</h3>
            </div>
            <span className="text-2xl text-emerald-600 bg-emerald-50 p-2.5 rounded-xl border border-emerald-500/10">🟢</span>
          </div>

          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center justify-between shadow-xs">
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">
                Suspended Nodes
              </p>
              <h3 className="text-3xl font-extrabold text-amber-600 mt-1 font-mono">{suspendedTenants}</h3>
            </div>
            <span className="text-2xl text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-500/10">⚠️</span>
          </div>
        </div>

        {/* Tenant Table Header Action */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Corporate Tenants</h2>
            <p className="text-xs text-slate-500 mt-0.5">Provision and manage isolated workspaces on the platform.</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-[#C5A059] hover:bg-[#B48F48] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-amber-500/10 active:scale-[0.98] flex items-center space-x-1.5"
          >
            <span>+ Provision Tenant</span>
          </button>
        </div>

        {/* Tenants Table Grid */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                  <th className="px-6 py-4">Company Name</th>
                  <th className="px-6 py-4">Workspace / URL Slug</th>
                  <th className="px-6 py-4">Billing Plan</th>
                  <th className="px-6 py-4">Provisioned Date</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-950 font-bold">{tenant.name}</td>
                    <td className="px-6 py-4 text-[#B48F48] font-mono text-xs">/{tenant.slug}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 bg-slate-50 border border-slate-200 rounded-md text-slate-600 font-bold font-mono">
                        {tenant.planCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">{tenant.createdAt}</td>
                    <td className="px-6 py-4 text-center">
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
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => toggleTenantStatus(tenant.id)}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                          tenant.status === 'active'
                            ? 'bg-amber-50/60 hover:bg-amber-100/60 border-amber-200/50 text-amber-700'
                            : 'bg-emerald-50/60 hover:bg-emerald-100/60 border-emerald-200/50 text-emerald-700'
                        }`}
                      >
                        {tenant.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteTenant(tenant.id)}
                        className="px-2.5 py-1 bg-rose-50/60 hover:bg-rose-100/60 border border-rose-200/50 text-rose-600 rounded-lg transition-all"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {tenants.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-xs text-slate-400 font-mono">
                      No corporate workspaces provisioned yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Monitoring Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Node Traffic Monitor */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">API Nodes Performance</h3>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
              <div className="w-[45%] bg-[#C5A059] h-full" title="Node A" />
              <div className="w-[30%] bg-[#B48F48] h-full" title="Node B" />
              <div className="w-[15%] bg-slate-300 h-full" title="Node C" />
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-slate-400 font-extrabold font-mono text-[9px] uppercase">Node A Load</p>
                <p className="font-extrabold text-slate-900 mt-0.5">45% (Nominal)</p>
              </div>
              <div>
                <p className="text-slate-400 font-extrabold font-mono text-[9px] uppercase">Node B Load</p>
                <p className="font-extrabold text-slate-900 mt-0.5">30% (Idle)</p>
              </div>
              <div>
                <p className="text-slate-400 font-extrabold font-mono text-[9px] uppercase">Gateway latency</p>
                <p className="font-extrabold text-[#B48F48] mt-0.5">14ms</p>
              </div>
            </div>
          </div>

          {/* Database Connections */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">Database Pool telemetry</h3>
            <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
              <span className="text-slate-500 font-medium">Connection Limit</span>
              <span className="font-bold text-slate-850 font-mono">10 Connections (Max)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Current pool consumption</span>
              <span className="font-bold text-emerald-600 font-mono">3 / 10 active</span>
            </div>
          </div>
        </div>
      </main>

      {/* Add Tenant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-2xl max-w-md w-full space-y-6 animate-zoom-in text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Provision New Workspace</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setError(null);
                }}
                className="text-slate-400 hover:text-slate-800 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/5 border border-rose-500/20 text-rose-700 text-xs font-bold rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleAddTenant} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 font-mono uppercase tracking-wider">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sterling Casting Mills"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''));
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] text-sm font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 font-mono uppercase tracking-wider">Tenant URL Slug</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-sm select-none">/</span>
                  <input
                    type="text"
                    placeholder="sterlingcasting"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full pl-6 pr-3.5 py-2.5 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] text-sm font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 font-mono uppercase tracking-wider">Subscription Plan</label>
                <select
                  value={planCode}
                  onChange={(e) => setPlanCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-[#C5A059] text-sm font-medium"
                >
                  <option value="Standard">Standard (Core Modules)</option>
                  <option value="Growth">Growth (Core + Inventory)</option>
                  <option value="Enterprise">Enterprise (Full ERP & MIS)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#C5A059] hover:bg-[#B48F48] text-white font-bold rounded-xl transition-all text-sm shadow-md"
              >
                Provision & Seed Databases
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
