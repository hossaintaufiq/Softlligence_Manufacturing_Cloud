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

type TabType = 'subscriptions' | 'infrastructure' | 'database' | 'audit';

export default function SuperAdminDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('subscriptions');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
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
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] text-slate-400 font-mono text-xs">
        Authenticating Super User...
      </div>
    );
  }

  // Calculations
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

  const SidebarContent = () => (
    <>
      <div className="flex flex-col">
        {/* Sidebar Header Brand */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-white to-slate-50/40">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-[#FAF6EE] border border-[#C5A059]/20 flex items-center justify-center text-sm shadow-xs">
              👑
            </div>
            <div>
              <h2 className="text-xs font-black text-slate-900 leading-none">
                SMC SuperAdmin
              </h2>
              <p className="text-[8px] text-[#B48F48] font-mono tracking-wider uppercase font-extrabold mt-1">
                Corporate Core
              </p>
            </div>
          </div>
          {/* Close button for Mobile Sidebar */}
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="block lg:hidden text-slate-400 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5 flex-1">
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest px-2.5 pb-2 font-mono">
            Control Panel
          </p>

          <button
            onClick={() => {
              setActiveTab('subscriptions');
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'subscriptions'
                ? 'bg-[#FAF6EE]/60 text-[#B48F48]'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            {activeTab === 'subscriptions' && (
              <div className="absolute left-0 top-2.5 w-1 h-5 bg-[#C5A059] rounded-r" />
            )}
            <span>🏢</span>
            <span>Tenant Subscriptions</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('infrastructure');
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'infrastructure'
                ? 'bg-[#FAF6EE]/60 text-[#B48F48]'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            {activeTab === 'infrastructure' && (
              <div className="absolute left-0 top-2.5 w-1 h-5 bg-[#C5A059] rounded-r" />
            )}
            <span>⚡</span>
            <span>API Nodes Monitor</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('database');
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'database'
                ? 'bg-[#FAF6EE]/60 text-[#B48F48]'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            {activeTab === 'database' && (
              <div className="absolute left-0 top-2.5 w-1 h-5 bg-[#C5A059] rounded-r" />
            )}
            <span>📊</span>
            <span>Database Telemetry</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('audit');
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'audit'
                ? 'bg-[#FAF6EE]/60 text-[#B48F48]'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            {activeTab === 'audit' && (
              <div className="absolute left-0 top-2.5 w-1 h-5 bg-[#C5A059] rounded-r" />
            )}
            <span>📜</span>
            <span>Security Audit Logs</span>
          </button>
        </nav>
      </div>

      {/* Sidebar Footer User Details */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FAF6EE] border border-[#C5A059]/30 flex items-center justify-center font-bold text-[10px] text-[#B48F48]">
              SA
            </div>
            <div className="leading-tight">
              <p className="text-[10px] font-black text-slate-900">System Admin</p>
              <p className="text-[8px] text-slate-400 font-mono font-medium truncate w-28">
                {user.email}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full py-2 bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-600 text-[10px] font-bold rounded-xl transition-all shadow-xs flex items-center justify-center space-x-1"
        >
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="h-screen w-screen flex bg-[#FAF9F6] text-slate-800 font-sans overflow-hidden relative">
      
      {/* DESKTOP SIDEBAR NAVIGATION (Visible on lg screens) */}
      <aside className="hidden lg:flex w-64 h-full bg-white border-r border-slate-200/80 flex-col justify-between flex-shrink-0 z-10">
        <SidebarContent />
      </aside>

      {/* MOBILE SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* MOBILE SIDEBAR SLIDE PANEL */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 w-64 bg-white border-r border-slate-200/80 z-50 flex flex-col justify-between transition-transform duration-300 transform lg:hidden ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* MAIN CONTENT AREA: Right Side */}
      <div className="flex-1 h-full flex flex-col overflow-hidden">
        
        {/* Top Header Breadcrumbs */}
        <header className="h-14 border-b border-slate-200/60 bg-white/50 backdrop-blur-xs flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="block lg:hidden p-1 text-slate-500 hover:bg-slate-100 rounded-lg focus:outline-none"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-2 text-[10px] font-semibold text-slate-400 font-mono">
              <span>SMC</span>
              <span>/</span>
              <span>SUPER ADMIN</span>
              <span>/</span>
              <span className="text-slate-800 capitalize font-bold">{activeTab}</span>
            </div>
          </div>
          <div className="text-[10px] font-bold text-slate-400 font-mono hidden sm:block">
            NODE RUNTIME: LOCAL HOST
          </div>
        </header>

        {/* Scrollable Dashboard View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8 bg-slate-50/50">
          
          {activeTab === 'subscriptions' && (
            <>
              {/* KPI Panel */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 animate-fade-in">
                
                <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">
                      Total Workspaces
                    </p>
                    <h3 className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">{totalTenants}</h3>
                  </div>
                  <span className="text-xl text-[#C5A059] bg-[#FAF6EE] p-2 rounded-xl border border-[#C5A059]/10">🏢</span>
                </div>

                <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">
                      Active Instances
                    </p>
                    <h3 className="text-2xl font-extrabold text-emerald-600 mt-1 font-mono">{activeTenants}</h3>
                  </div>
                  <span className="text-xl text-emerald-600 bg-emerald-50 p-2 rounded-xl border border-emerald-500/10">🟢</span>
                </div>

                <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">
                      Suspended Instances
                    </p>
                    <h3 className="text-2xl font-extrabold text-amber-600 mt-1 font-mono">{suspendedTenants}</h3>
                  </div>
                  <span className="text-xl text-amber-600 bg-amber-50 p-2 rounded-xl border border-amber-500/10">⚠️</span>
                </div>
              </div>

              {/* Action Title Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-3 gap-3">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Corporate Tenant Subscriptions</h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">Provision, inspect, and toggle isolated workspace nodes.</p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-3.5 py-2 bg-[#C5A059] hover:bg-[#B48F48] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-amber-500/10 active:scale-[0.98] flex items-center justify-center space-x-1"
                >
                  <span>+ Provision Workspace</span>
                </button>
              </div>

              {/* Tenants Grid/Table */}
              <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs animate-fade-in">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200/80 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                        <th className="px-6 py-3.5">Company Name</th>
                        <th className="px-6 py-3.5">Slug URL</th>
                        <th className="px-6 py-3.5">Billing Plan</th>
                        <th className="px-6 py-3.5">Date Created</th>
                        <th className="px-6 py-3.5 text-center">Status</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                      {tenants.map((tenant) => (
                        <tr key={tenant.id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-6 py-3.5 text-slate-950 font-bold">{tenant.name}</td>
                          <td className="px-6 py-3.5 text-[#B48F48] font-mono">/{tenant.slug}</td>
                          <td className="px-6 py-3.5">
                            <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-slate-600 font-bold font-mono">
                              {tenant.planCode}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-slate-400 font-mono">{tenant.createdAt}</td>
                          <td className="px-6 py-3.5 text-center">
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
                          <td className="px-6 py-3.5 text-right space-x-1.5 whitespace-nowrap">
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
                      ))}
                      {tenants.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-10 text-center text-xs text-slate-400 font-mono">
                            No corporate workspaces provisioned yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'infrastructure' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-mono">API Load Balancer Status</h3>
                <p className="text-xs text-slate-500 mt-0.5">Real-time performance metrics of the Softlligence Gateway Cluster.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">Node load levels</h4>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="w-[45%] bg-[#C5A059] h-full" title="Node A" />
                    <div className="w-[30%] bg-[#B48F48] h-full" title="Node B" />
                    <div className="w-[15%] bg-slate-350 h-full" title="Node C" />
                  </div>
                  <div className="grid grid-cols-3 gap-2.5 text-xs text-slate-600">
                    <div>
                      <p className="text-[8px] font-bold text-slate-400 tracking-widest font-mono">Node A</p>
                      <p className="font-extrabold text-slate-900 mt-0.5">45%</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-slate-400 tracking-widest font-mono">Node B</p>
                      <p className="font-extrabold text-slate-900 mt-0.5">30%</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-slate-400 tracking-widest font-mono">Node C</p>
                      <p className="font-extrabold text-slate-900 mt-0.5">15%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-sm flex flex-col justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">SLA & Latency</h4>
                  <div className="flex items-center justify-between text-xs gap-3">
                    <span className="text-slate-500 font-medium">Gateway Latency</span>
                    <span className="font-extrabold text-[#B48F48] font-mono">14ms (Optimal)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs gap-3">
                    <span className="text-slate-500 font-medium">Monthly SLA target</span>
                    <span className="font-extrabold text-emerald-600 font-mono">99.99%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-mono">Database Pools & Telemetry</h3>
                <p className="text-xs text-slate-500 mt-0.5">Prisma Client connections to cloud Supabase instance.</p>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-sm max-w-xl">
                <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2 gap-3">
                  <span className="text-slate-500 font-medium">Database connection limit</span>
                  <span className="font-bold text-slate-800 font-mono">10 Connections (Max)</span>
                </div>
                <div className="flex items-center justify-between text-xs gap-3">
                  <span className="text-slate-500 font-medium">Active query pools</span>
                  <span className="font-bold text-emerald-600 font-mono">3 / 10 active</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-5 animate-fade-in">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-mono">Platform Security Logs</h3>
                <p className="text-xs text-slate-500 mt-0.5">Append-only audit logs of platform management actions.</p>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200/80 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                        <th className="px-4 py-3">Timestamp</th>
                        <th className="px-4 py-3">Actor</th>
                        <th className="px-4 py-3">Action Type</th>
                        <th className="px-4 py-3">Target Node</th>
                        <th className="px-4 py-3 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                      <tr>
                        <td className="px-4 py-3 font-mono text-slate-400">2026-08-20 11:42</td>
                        <td className="px-4 py-3">admin@softlligence.com</td>
                        <td className="px-4 py-3 text-indigo-600 uppercase font-bold font-mono">provision_tenant</td>
                        <td className="px-4 py-3">/sterlingcasting</td>
                        <td className="px-4 py-3 text-right text-slate-400 font-mono">Plan: Enterprise</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-slate-400">2026-08-20 10:15</td>
                        <td className="px-4 py-3">admin@softlligence.com</td>
                        <td className="px-4 py-3 text-amber-600 uppercase font-bold font-mono">suspend_tenant</td>
                        <td className="px-4 py-3">/globalalloys</td>
                        <td className="px-4 py-3 text-right text-slate-400 font-mono">Billing overdue</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

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
                <label className="text-xs font-bold text-slate-550 font-mono uppercase tracking-wider">Company Name</label>
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
                <label className="text-xs font-bold text-slate-550 font-mono uppercase tracking-wider">Tenant URL Slug</label>
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
                <label className="text-xs font-bold text-slate-550 font-mono uppercase tracking-wider">Subscription Plan</label>
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
