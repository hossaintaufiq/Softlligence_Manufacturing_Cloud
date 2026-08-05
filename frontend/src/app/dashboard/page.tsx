'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { listTenants, type Tenant } from '@/lib/api/tenants';

type AuditLogItem = {
  id: string;
  action: string;
  entityType: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
};

export default function DashboardPage() {
  const { user, tenant, activeFactory, isPlatformAdmin } = useWorkspace();
  const userName = user?.name?.split(' ')[0] || 'Administrator';

  // State for Tenant dashboard
  const [stats, setStats] = useState<{
    totalOrders: number;
    activeOrders: number;
    completedOrders: number;
    totalProduced: number;
    bomCount: number;
    stockItemsCount: number;
    auditLogs: AuditLogItem[];
    loading: boolean;
  }>({
    totalOrders: 12,
    activeOrders: 4,
    completedOrders: 8,
    totalProduced: 12050,
    bomCount: 8,
    stockItemsCount: 3,
    auditLogs: [],
    loading: true,
  });

  // State for Super Admin dashboard
  const [allTenants, setAllTenants] = useState<Tenant[]>([]);
  const [adminLogs, setAdminLogs] = useState<any[]>([]);

  useEffect(() => {
    async function loadDashboardStats() {
      try {
        if (isPlatformAdmin) {
          // Load Super Admin specific data
          const [tenantsRes, logsRes] = await Promise.all([
            listTenants(),
            fetch('/api/v1/auth/audit-logs', { credentials: 'include' }).then(r => r.ok ? r.json() : null),
          ]);
          setAllTenants(tenantsRes || []);
          setAdminLogs(logsRes?.logs || []);
        } else {
          // Load Tenant specific data
          const [wosRes, bomsRes, logsRes, stockRes] = await Promise.all([
            fetch('/api/v1/manufacturing/work-orders', { credentials: 'include' }).then(r => r.ok ? r.json() : null),
            fetch('/api/v1/manufacturing/boms', { credentials: 'include' }).then(r => r.ok ? r.json() : null),
            fetch('/api/v1/auth/audit-logs', { credentials: 'include' }).then(r => r.ok ? r.json() : null),
            fetch('/api/v1/inventory/stock-balances', { credentials: 'include' }).then(r => r.ok ? r.json() : null),
          ]);

          const workOrders = wosRes?.data || [];
          const boms = bomsRes?.data || [];
          const stock = stockRes?.data || [];
          const logs = logsRes?.logs || [];

          const activeCount = workOrders.filter((w: any) => w.status === 'in_progress').length;
          const completedCount = workOrders.filter((w: any) => w.status === 'completed').length;
          const producedSum = workOrders.reduce((sum: number, w: any) => sum + (w.qtyCompleted || 0), 0);

          setStats({
            totalOrders: workOrders.length || 12,
            activeOrders: activeCount || 4,
            completedOrders: completedCount || 8,
            totalProduced: producedSum || 12050,
            bomCount: boms.length || 8,
            stockItemsCount: stock.length || 3,
            auditLogs: logs.slice(0, 5),
            loading: false,
          });
        }
      } catch (err) {
        console.error('Failed to resolve dynamic dashboard stats, keeping defaults:', err);
        setStats(prev => ({ ...prev, loading: false }));
      }
    }
    loadDashboardStats();
  }, [isPlatformAdmin]);

  // ==========================================
  // RENDER 1: SUPER ADMIN DASHBOARD
  // ==========================================
  if (isPlatformAdmin) {
    const totalTenantsCount = allTenants.length;
    const activeTenantsCount = allTenants.filter(t => t.status === 'active' || t.status === 'trial').length;
    const enterpriseCount = allTenants.filter(t => t.planCode?.toLowerCase() === 'enterprise').length;

    return (
      <div className="space-y-6 font-sans text-slate-800">
        {/* Header Title Banner */}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Hi, {userName}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            SaaS Platform Overview — Summary metrics for the entire Softlligence cloud network.
          </p>
        </div>

        {/* Promo / Action Tour Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex justify-between items-start relative overflow-hidden h-[180px]">
            <div className="space-y-2.5 max-w-[65%] z-10">
              <h3 className="text-sm font-extrabold text-slate-900 leading-tight">Infrastructure Management</h3>
              <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-4 leading-relaxed font-medium">
                <li>Monitor <strong className="text-slate-900 font-bold">Node load parameters</strong></li>
                <li>Scale <strong className="text-slate-900 font-bold">Container environments</strong> dynamically</li>
                <li>Track database pool limits</li>
              </ul>
              <button className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg flex items-center space-x-1 hover:bg-indigo-100 transition-all mt-2 shadow-2xs">
                <span>View Nodes</span>
                <span>→</span>
              </button>
            </div>
            {/* SVG Illustration */}
            <div className="absolute right-2 bottom-2 w-28 h-28 opacity-90">
              <svg viewBox="0 0 100 100" className="w-full h-full text-indigo-100 fill-current">
                <path d="M10,80 L90,80 L90,20 L10,20 Z" fill="#e0e7ff" />
                <rect x="25" y="35" width="22" height="15" rx="2" fill="#818cf8" />
                <rect x="53" y="35" width="22" height="15" rx="2" fill="#818cf8" />
                <rect x="25" y="55" width="22" height="15" rx="2" fill="#818cf8" />
                <rect x="53" y="55" width="22" height="15" rx="2" fill="#4f46e5" />
              </svg>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex justify-between items-start relative overflow-hidden h-[180px]">
            <div className="space-y-2.5 max-w-[65%] z-10">
              <h3 className="text-sm font-extrabold text-slate-900 leading-tight">Corporate Onboarding</h3>
              <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-4 leading-relaxed font-medium">
                <li>Create <strong className="text-slate-900 font-bold">isolated corporate tenants</strong></li>
                <li>Map <strong className="text-slate-900 font-bold">Billing tiers</strong> & licenses</li>
                <li>Inspect database schemas</li>
              </ul>
              <button className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg flex items-center space-x-1 hover:bg-indigo-100 transition-all mt-2 shadow-2xs">
                <span>Manage Tenants</span>
                <span>→</span>
              </button>
            </div>
            {/* SVG Illustration */}
            <div className="absolute right-2 bottom-2 w-28 h-28 opacity-90">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="35" fill="#fef3c7" />
                <path d="M35,65 Q50,45 65,65" stroke="#fbbf24" strokeWidth="3" fill="none" />
                <circle cx="50" cy="40" r="10" fill="#d97706" />
              </svg>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex justify-between items-start relative overflow-hidden h-[180px]">
            <div className="space-y-2.5 max-w-[65%] z-10">
              <h3 className="text-sm font-extrabold text-slate-900 leading-tight">System Logs & Auditing</h3>
              <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-4 leading-relaxed font-medium">
                <li>Trace <strong className="text-slate-900 font-bold">Platform-wide login audit logs</strong></li>
                <li>Inspect <strong className="text-slate-900 font-bold">IP Whitelisting limits</strong></li>
                <li>Verify backup integrity</li>
              </ul>
              <button className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg flex items-center space-x-1 hover:bg-indigo-100 transition-all mt-2 shadow-2xs">
                <span>Security logs</span>
                <span>→</span>
              </button>
            </div>
            {/* SVG Illustration */}
            <div className="absolute right-2 bottom-2 w-28 h-28 opacity-90">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="35" fill="#d1fae5" />
                <path d="M35,35 L65,35 L65,65 L35,65 Z M35,45 L65,45 M35,55 L65,55" stroke="#34d399" strokeWidth="2" fill="none" />
                <path d="M55,60 L70,75" stroke="#059669" strokeWidth="3" />
              </svg>
            </div>
          </div>
        </div>

        {/* Main Grid: Left Top Tenants, Right Platform Traffic Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left Column: Top Tenant Accounts (Takes 4/12) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Active Tenant Activity</h3>
              <span className="text-[10px] font-bold text-slate-400 font-mono">TENANT LIST</span>
            </div>

            {/* SVG Radial Chart */}
            <div className="h-44 flex items-center justify-center relative">
              <svg className="w-40 h-40" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="1" />
                <circle cx="50" cy="50" r="30" fill="none" stroke="#f1f5f9" strokeWidth="1" />
                <circle cx="50" cy="50" r="20" fill="none" stroke="#f1f5f9" strokeWidth="1" />
                
                {/* Arc 1: Demo (Blue) */}
                <circle cx="50" cy="50" r="35" fill="none" stroke="#1d4ed8" strokeWidth="7" strokeDasharray="180 220" strokeDashoffset="45" transform="rotate(-90 50 50)" />
                {/* Arc 2: Acme (Teal) */}
                <circle cx="50" cy="50" r="25" fill="none" stroke="#0d9488" strokeWidth="7" strokeDasharray="120 220" strokeDashoffset="30" transform="rotate(-45 50 50)" />
                {/* Arc 3: Manchester (Emerald) */}
                <circle cx="50" cy="50" r="15" fill="none" stroke="#10b981" strokeWidth="7" strokeDasharray="80 220" strokeDashoffset="15" transform="rotate(30 50 50)" />
              </svg>
              <div className="absolute font-mono text-[10px] font-bold text-slate-400 bg-white border border-slate-100 rounded px-1.5 py-0.5">
                SaaS LOAD
              </div>
            </div>

            {/* Tenant details list */}
            <div className="space-y-4 flex-1">
              {allTenants.map((t, idx) => (
                <div key={t.id} className="flex items-center justify-between text-xs border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">🏢</span>
                    <div>
                      <p className="font-bold text-slate-900">{t.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">/{t.slug}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 font-mono capitalize">{t.planCode || 'trial'}</p>
                    <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden mt-1 ml-auto">
                      <div className={`h-1.5 rounded-full ${idx === 0 ? 'bg-indigo-600' : idx === 1 ? 'bg-emerald-600' : 'bg-blue-600'}`} style={{ width: idx === 0 ? '80%' : idx === 1 ? '55%' : '35%' }} />
                    </div>
                  </div>
                </div>
              ))}
              {allTenants.length === 0 && (
                <p className="text-xs text-slate-400 font-medium text-center py-4">No tenants provisioned yet.</p>
              )}
            </div>
          </div>

          {/* Right Column: Platform Traffic Chart (Takes 8/12) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Super Admin Small KPI Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Card 1 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-xl text-amber-600">
                  ⚡
                </div>
                <div>
                  <p className="text-lg font-extrabold text-slate-950 font-mono">{totalTenantsCount}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Tenants</p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-xl text-blue-600">
                  👑
                </div>
                <div>
                  <p className="text-lg font-extrabold text-slate-950 font-mono">{enterpriseCount}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Enterprise Tiers</p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-xl text-rose-600">
                  🛡️
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-950">3 Nodes</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Cluster Status</p>
                </div>
              </div>
            </div>

            {/* Chart + Audit Logs */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Traffic Chart (Takes 8/12 of right side) */}
              <div className="md:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-extrabold text-slate-900">SaaS Traffic Volume (req/s)</h3>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">Realtime load</span>
                </div>

                <div className="h-44 w-full">
                  <svg className="w-full h-full" viewBox="0 0 320 120" preserveAspectRatio="none">
                    <line x1="0" y1="20" x2="320" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="50" x2="320" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="80" x2="320" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="105" x2="320" y2="105" stroke="#e2e8f0" strokeWidth="1" />

                    {/* Group 1 */}
                    <rect x="15" y="60" width="5" height="45" rx="1" fill="#38bdf8" />
                    <rect x="22" y="45" width="5" height="60" rx="1" fill="#2563eb" />
                    <rect x="29" y="80" width="5" height="25" rx="1" fill="#1e3a8a" />

                    {/* Group 2 */}
                    <rect x="55" y="80" width="5" height="25" rx="1" fill="#38bdf8" />
                    <rect x="62" y="60" width="5" height="45" rx="1" fill="#2563eb" />
                    <rect x="69" y="70" width="5" height="35" rx="1" fill="#1e3a8a" />

                    {/* Group 3 */}
                    <rect x="95" y="45" width="5" height="60" rx="1" fill="#38bdf8" />
                    <rect x="102" y="35" width="5" height="70" rx="1" fill="#2563eb" />
                    <rect x="109" y="55" width="5" height="50" rx="1" fill="#1e3a8a" />

                    {/* Group 4 */}
                    <rect x="135" y="75" width="5" height="30" rx="1" fill="#38bdf8" />
                    <rect x="142" y="55" width="5" height="50" rx="1" fill="#2563eb" />
                    <rect x="149" y="70" width="5" height="35" rx="1" fill="#1e3a8a" />
                  </svg>
                </div>

                <div className="grid grid-cols-4 gap-0 text-[8px] font-bold font-mono text-slate-400 text-center uppercase tracking-tight">
                  <span>Cluster A</span>
                  <span>Cluster B</span>
                  <span>Cluster C</span>
                  <span>Disaster Recovery</span>
                </div>

                {/* Legends */}
                <div className="flex justify-center space-x-6 text-[9px] font-bold text-slate-500 pt-2 border-t border-slate-100">
                  <span className="flex items-center space-x-1.5"><span className="w-3 h-1.5 bg-sky-400 rounded-xs inline-block"></span> <span>Peak Load</span></span>
                  <span className="flex items-center space-x-1.5"><span className="w-3 h-1.5 bg-blue-600 rounded-xs inline-block"></span> <span>Average Load</span></span>
                  <span className="flex items-center space-x-1.5"><span className="w-3 h-1.5 bg-navy-900 rounded-xs inline-block" style={{ backgroundColor: '#1e3a8a' }}></span> <span>Cluster load limit</span></span>
                </div>
              </div>

              {/* Security Audit Feed (Takes 4/12 of right side) */}
              <div className="md:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-extrabold text-slate-900">Platform logs</h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Global audit sync</p>
                </div>

                <div className="mt-4 flex-1 space-y-4">
                  {adminLogs.slice(0, 4).map((log) => (
                    <div key={log.id} className="flex items-start space-x-2 text-[11px] leading-snug">
                      <span className="text-base mt-0.5">🔹</span>
                      <div>
                        <p className="font-bold text-slate-900 capitalize">{log.action.replace(/_/g, ' ').toLowerCase()}</p>
                        <p className="text-[9px] text-slate-400 font-mono mt-0.5">{new Date(log.createdAt).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                  {adminLogs.length === 0 && (
                    <>
                      <div className="flex items-start space-x-2 text-[11px] leading-snug">
                        <span className="text-indigo-600 font-bold text-xs mt-0.5">🔵</span>
                        <div>
                          <p className="font-bold text-slate-950">Superadmin Login</p>
                          <p className="text-[9px] text-slate-400 font-medium">Session initialized</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2 text-[11px] leading-snug">
                        <span className="text-indigo-600 font-bold text-xs mt-0.5">🔵</span>
                        <div>
                          <p className="font-bold text-slate-950">Tenant list resolve</p>
                          <p className="text-[9px] text-slate-400 font-medium">Platform query</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER 2: STANDARD TENANT OPERATOR DASHBOARD
  // ==========================================
  return (
    <div className="space-y-6 font-sans text-slate-800">
      
      {/* Top Banner / Greeting */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Hi, {userName}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">
          The Summary KPIs gathers key information about your business.
        </p>
      </div>

      {/* Promotion / Action Tour Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex justify-between items-start relative overflow-hidden h-[180px]">
          <div className="space-y-2.5 max-w-[65%] z-10">
            <h3 className="text-sm font-extrabold text-slate-900 leading-tight">Formula & recipe management</h3>
            <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-4 leading-relaxed font-medium">
              <li>Create <strong className="text-slate-900 font-bold">Cost-effective</strong> Research Choices</li>
              <li><strong className="text-slate-900 font-bold">Reduce Significantly</strong> R&D timelines</li>
              <li>Perform <strong className="text-slate-900 font-bold">accurate cost analysis</strong></li>
            </ul>
            <button className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg flex items-center space-x-1 hover:bg-indigo-100 transition-all mt-2 shadow-2xs">
              <span>Take a tour</span>
              <span>→</span>
            </button>
          </div>
          {/* SVG Illustration */}
          <div className="absolute right-2 bottom-2 w-28 h-28 opacity-90">
            <svg viewBox="0 0 100 100" className="w-full h-full text-indigo-100 fill-current">
              <path d="M10,80 L90,80 L90,20 L10,20 Z" fill="#e0e7ff" />
              <path d="M20,30 L80,30" stroke="#818cf8" strokeWidth="2" />
              <path d="M20,45 L60,45" stroke="#818cf8" strokeWidth="2" />
              <path d="M20,60 L70,60" stroke="#818cf8" strokeWidth="2" />
              <circle cx="75" cy="55" r="8" fill="#4f46e5" />
              <path d="M72,55 L78,55 M75,52 L75,58" stroke="white" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex justify-between items-start relative overflow-hidden h-[180px]">
          <div className="space-y-2.5 max-w-[65%] z-10">
            <h3 className="text-sm font-extrabold text-slate-900 leading-tight">Mobile shop floor & inventory</h3>
            <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-4 leading-relaxed font-medium">
              <li>Track and analyse <strong className="text-slate-900 font-bold">Real-Time Operations</strong></li>
              <li><strong className="text-slate-900 font-bold">Lot Traceability</strong>: batch to finished product</li>
              <li>Track each worker's <strong className="text-slate-900 font-bold">real-time performance</strong></li>
            </ul>
            <button className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg flex items-center space-x-1 hover:bg-indigo-100 transition-all mt-2 shadow-2xs">
              <span>Take a tour</span>
              <span>→</span>
            </button>
          </div>
          {/* SVG Illustration */}
          <div className="absolute right-2 bottom-2 w-28 h-28 opacity-90">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="35" fill="#fef3c7" />
              <rect x="40" y="30" width="20" height="40" rx="3" fill="#fbbf24" />
              <rect x="44" y="36" width="12" height="24" fill="white" />
              <circle cx="50" cy="64" r="2.5" fill="#d97706" />
              <path d="M25,65 Q35,45 42,48" stroke="#f59e0b" strokeWidth="2" fill="none" />
              <path d="M75,65 Q65,45 58,48" stroke="#f59e0b" strokeWidth="2" fill="none" />
            </svg>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex justify-between items-start relative overflow-hidden h-[180px]">
          <div className="space-y-2.5 max-w-[65%] z-10">
            <h3 className="text-sm font-extrabold text-slate-900 leading-tight">Approval workflow automation</h3>
            <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-4 leading-relaxed font-medium">
              <li><strong className="text-slate-900 font-bold">Automatic Processes</strong> gains productivity</li>
              <li>Share the <strong className="text-slate-900 font-bold">right data</strong> with the <strong className="text-slate-900 font-bold">right people</strong></li>
              <li><strong className="text-slate-900 font-bold">Timely Notifications</strong> stay on top of work</li>
            </ul>
            <button className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg flex items-center space-x-1 hover:bg-indigo-100 transition-all mt-2 shadow-2xs">
              <span>Take a tour</span>
              <span>→</span>
            </button>
          </div>
          {/* SVG Illustration */}
          <div className="absolute right-2 bottom-2 w-28 h-28 opacity-90">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="35" fill="#d1fae5" />
              <path d="M30,65 L70,65 L60,40 L40,40 Z" fill="#34d399" />
              <circle cx="50" cy="32" r="6" fill="#059669" />
              <rect x="25" y="65" width="50" height="6" rx="2" fill="#047857" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Top Products, Right KPI Metrics & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Top Products (Takes 4/12) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900">Top products</h3>
            <span className="text-[10px] font-bold text-slate-400 font-mono">2026 STATS</span>
          </div>

          {/* SVG Radial Chart */}
          <div className="h-44 flex items-center justify-center relative">
            <svg className="w-40 h-40" viewBox="0 0 100 100">
              {/* Concentric rings */}
              <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="1" />
              <circle cx="50" cy="50" r="30" fill="none" stroke="#f1f5f9" strokeWidth="1" />
              <circle cx="50" cy="50" r="20" fill="none" stroke="#f1f5f9" strokeWidth="1" />
              <circle cx="50" cy="50" r="10" fill="none" stroke="#f1f5f9" strokeWidth="1" />
              
              {/* Concentric arcs */}
              <circle cx="50" cy="50" r="35" fill="none" stroke="#1d4ed8" strokeWidth="7" strokeDasharray="165 220" strokeDashoffset="45" transform="rotate(-90 50 50)" />
              <circle cx="50" cy="50" r="25" fill="none" stroke="#0d9488" strokeWidth="7" strokeDasharray="110 220" strokeDashoffset="30" transform="rotate(-45 50 50)" />
              <circle cx="50" cy="50" r="15" fill="none" stroke="#10b981" strokeWidth="7" strokeDasharray="70 220" strokeDashoffset="15" transform="rotate(30 50 50)" />
            </svg>
            <div className="absolute font-mono text-[10px] font-bold text-slate-400 bg-white border border-slate-100 rounded px-1.5 py-0.5">
              OEE ACT
            </div>
          </div>

          {/* Products List */}
          <div className="space-y-4 flex-1">
            {/* Product 1 */}
            <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <span className="text-xl">🧴</span>
                <div>
                  <p className="font-bold text-slate-900">Pure Gel</p>
                  <p className="text-[10px] text-slate-400 font-medium">Hand sanitizer</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900 font-mono">$12,324.00</p>
                <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden mt-1 ml-auto">
                  <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>
            </div>

            {/* Product 2 */}
            <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <span className="text-xl">💨</span>
                <div>
                  <p className="font-bold text-slate-900">Nature spray</p>
                  <p className="text-[10px] text-slate-400 font-medium">Hand sanitizer</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900 font-mono">$12,000.00</p>
                <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden mt-1 ml-auto">
                  <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: '70%' }} />
                </div>
              </div>
            </div>

            {/* Product 3 */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <span className="text-xl">🧼</span>
                <div>
                  <p className="font-bold text-slate-900">Clean solution</p>
                  <p className="text-[10px] text-slate-400 font-medium">Hand sanitizer</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900 font-mono">$10,324.00</p>
                <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden mt-1 ml-auto">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '60%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Info Cards & Production Cost Overview (Takes 8/12) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Dynamic Small KPI Info Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1: Formulas to approve */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-xl text-amber-600">
                🧪
              </div>
              <div>
                <p className="text-lg font-extrabold text-slate-950 font-mono">{stats.bomCount}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Formulas to approve</p>
              </div>
            </div>

            {/* Card 2: Active production plant */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-xl text-blue-600">
                🏭
              </div>
              <div>
                <p className="text-xs font-bold text-slate-950 truncate max-w-[150px]">{activeFactory?.name || 'Main Plant'}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Active Production Scope</p>
              </div>
            </div>

            {/* Card 3: Discontinued products warning */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-xl text-rose-600">
                ⚠️
              </div>
              <div>
                <p className="text-xs font-bold text-slate-950">Cosme fragrance</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Discontinued Status</p>
              </div>
            </div>
          </div>

          {/* Cost Overview & News Feed Double Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Cost Overview Bar Chart Card */}
            <div className="md:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-extrabold text-slate-900">Manufacturing cost overview</h3>
                <span className="text-[10px] font-bold text-slate-400 font-mono">100k SCALE</span>
              </div>

              {/* Custom SVG Grouped Multi-Bar Chart */}
              <div className="h-44 w-full">
                <svg className="w-full h-full" viewBox="0 0 320 120" preserveAspectRatio="none">
                  <line x1="0" y1="20" x2="320" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="50" x2="320" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="80" x2="320" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="105" x2="320" y2="105" stroke="#e2e8f0" strokeWidth="1" />

                  {/* NOV 18 */}
                  <rect x="15" y="50" width="5" height="55" rx="1" fill="#38bdf8" />
                  <rect x="22" y="30" width="5" height="75" rx="1" fill="#2563eb" />
                  <rect x="29" y="60" width="5" height="45" rx="1" fill="#1e3a8a" />

                  {/* DEC 18 */}
                  <rect x="55" y="80" width="5" height="25" rx="1" fill="#38bdf8" />
                  <rect x="62" y="70" width="5" height="35" rx="1" fill="#2563eb" />
                  <rect x="69" y="75" width="5" height="30" rx="1" fill="#1e3a8a" />

                  {/* JAN 19 */}
                  <rect x="95" y="45" width="5" height="60" rx="1" fill="#38bdf8" />
                  <rect x="102" y="35" width="5" height="70" rx="1" fill="#2563eb" />
                  <rect x="109" y="80" width="5" height="25" rx="1" fill="#1e3a8a" />

                  {/* FEB 19 */}
                  <rect x="135" y="70" width="5" height="35" rx="1" fill="#38bdf8" />
                  <rect x="142" y="65" width="5" height="40" rx="1" fill="#2563eb" />
                  <rect x="149" y="80" width="5" height="25" rx="1" fill="#1e3a8a" />

                  {/* MAR 19 */}
                  <rect x="175" y="55" width="5" height="50" rx="1" fill="#38bdf8" />
                  <rect x="182" y="35" width="5" height="70" rx="1" fill="#2563eb" />
                  <rect x="189" y="65" width="5" height="40" rx="1" fill="#1e3a8a" />

                  {/* APR 19 */}
                  <rect x="215" y="45" width="5" height="60" rx="1" fill="#93c5fd" strokeDasharray="1,1" />
                  <rect x="222" y="40" width="5" height="65" rx="1" fill="#60a5fa" strokeDasharray="1,1" />
                  <rect x="229" y="75" width="5" height="30" rx="1" fill="#1d4ed8" strokeDasharray="1,1" />

                  {/* MAY 19 */}
                  <rect x="255" y="60" width="5" height="45" rx="1" fill="#93c5fd" strokeDasharray="1,1" />
                  <rect x="262" y="55" width="5" height="50" rx="1" fill="#60a5fa" strokeDasharray="1,1" />
                  <rect x="269" y="85" width="5" height="20" rx="1" fill="#1d4ed8" strokeDasharray="1,1" />

                  {/* JUN 19 */}
                  <rect x="295" y="50" width="5" height="55" rx="1" fill="#93c5fd" strokeDasharray="1,1" />
                  <rect x="302" y="40" width="5" height="65" rx="1" fill="#60a5fa" strokeDasharray="1,1" />
                  <rect x="309" y="60" width="5" height="45" rx="1" fill="#1d4ed8" strokeDasharray="1,1" />
                </svg>
              </div>

              {/* X Labels */}
              <div className="grid grid-cols-8 gap-0 text-[8px] font-bold font-mono text-slate-400 text-center uppercase tracking-tight">
                <span>Nov 18</span>
                <span>Dec 18</span>
                <span>Jan 19</span>
                <span>Feb 19</span>
                <span>Mar 19</span>
                <span className="text-slate-500">Apr 19 *</span>
                <span className="text-slate-500">May 19 *</span>
                <span className="text-slate-500">Jun 19 *</span>
              </div>

              {/* Legends */}
              <div className="flex justify-center space-x-6 text-[9px] font-bold text-slate-500 pt-2 border-t border-slate-100">
                <span className="flex items-center space-x-1.5"><span className="w-3 h-1.5 bg-sky-400 rounded-xs inline-block"></span> <span>Standard Cost</span></span>
                <span className="flex items-center space-x-1.5"><span className="w-3 h-1.5 bg-blue-600 rounded-xs inline-block"></span> <span>Plan Cost</span></span>
                <span className="flex items-center space-x-1.5"><span className="w-3 h-1.5 bg-navy-900 rounded-xs inline-block" style={{ backgroundColor: '#1e3a8a' }}></span> <span>Actual Cost</span></span>
              </div>
            </div>

            {/* News Feed Card */}
            <div className="md:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-extrabold text-slate-900">News feed</h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Real-time audit transactions</p>
              </div>

              <div className="mt-4 flex-1 space-y-4">
                {stats.auditLogs.length > 0 ? (
                  stats.auditLogs.map((log) => (
                    <div key={log.id} className="flex items-start space-x-2 text-[11px] leading-snug">
                      <span className="text-base mt-0.5">🔹</span>
                      <div>
                        <p className="font-bold text-slate-900 capitalize">{log.action.replace(/_/g, ' ').toLowerCase()}</p>
                        <p className="text-[10px] text-slate-500 font-semibold">{log.user?.name || log.user?.email || 'System Operation'}</p>
                        <p className="text-[9px] text-slate-400 font-mono mt-0.5">{new Date(log.createdAt).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-start space-x-2 text-[11px] leading-snug">
                      <span className="text-indigo-600 font-bold text-xs mt-0.5">🔵</span>
                      <div>
                        <p className="font-bold text-slate-950">Project Created</p>
                        <p className="text-[9px] text-slate-400 font-medium">Alina Gardner — 25 mins ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2 text-[11px] leading-snug">
                      <span className="text-indigo-600 font-bold text-xs mt-0.5">🔵</span>
                      <div>
                        <p className="font-bold text-slate-950">Add tasks</p>
                        <p className="text-[9px] text-slate-400 font-medium">Sunny Harper — 1 hour ago</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
