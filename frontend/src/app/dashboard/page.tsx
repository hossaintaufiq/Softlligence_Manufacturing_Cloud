'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWorkspace } from '@/context/WorkspaceContext';

export default function DashboardPage() {
  const { user, tenant, entitlements } = useWorkspace();
  const [stats, setStats] = useState({
    meltYield: '94.2%',
    rollingYield: '98.1%',
    activeOrders: 4,
    scrapReceived: '280 MT',
  });

  return (
    <main className="min-h-screen bg-slate-50 p-6 space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Welcome to {tenant?.name || 'Softlligence Workspace'}
          </h1>
          <p className="text-xs text-indigo-100 mt-1 leading-relaxed max-w-xl">
            You are logged in to the unified Softlligence Manufacturing Cloud. Manage steel furnace heats, rolling logs, WMS inventories, and commercial dispatches.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/steel"
            className="px-4 py-2 rounded-lg bg-white text-indigo-600 hover:bg-slate-50 text-xs font-bold transition-all shadow-xs"
          >
            Open Steel Plant HMI
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Furnace Yield</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">{stats.meltYield}</span>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">+1.2%</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Live melting log reconciliation</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rolling Mill Output</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">{stats.rollingYield}</span>
            <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">Steady</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Rebar & billet structural yield</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Work Orders</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">{stats.activeOrders}</span>
            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">In Progress</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Kanban scheduling status</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Raw Scrap Inventory</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">{stats.scrapReceived}</span>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Full capacity</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Gate Pass weighbridge inflow</span>
        </div>
      </div>

      {/* Main Panels Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Quick Actions & Operations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Operations Control Center</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/manufacturing"
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-slate-50/50 transition-all text-left space-y-1 block"
              >
                <span className="text-lg">⚙️</span>
                <p className="text-xs font-bold text-slate-900">Manufacturing Execution (MES)</p>
                <p className="text-[10px] text-slate-500">Track BOM structures, schedules, and OEE parameters.</p>
              </Link>

              <Link
                href="/inventory"
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-slate-50/50 transition-all text-left space-y-1 block"
              >
                <span className="text-lg">📦</span>
                <p className="text-xs font-bold text-slate-900">Advanced Inventory & WMS</p>
                <p className="text-[10px] text-slate-500">Lot lineage trees, DataMatrix print, and stock ledger.</p>
              </Link>

              <Link
                href="/commercial"
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-slate-50/50 transition-all text-left space-y-1 block"
              >
                <span className="text-lg">💼</span>
                <p className="text-xs font-bold text-slate-900">Commercial & Invoicing</p>
                <p className="text-[10px] text-slate-500">Manage POs, SOs, Weighbridge Gates, and land costs.</p>
              </Link>

              <Link
                href="/analytics"
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-slate-50/50 transition-all text-left space-y-1 block"
              >
                <span className="text-lg">📈</span>
                <p className="text-xs font-bold text-slate-900">Executive Analytics</p>
                <p className="text-[10px] text-slate-500">Generate real-time OEE trends and custom SQL reports.</p>
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Active Tenant Configuration</h3>
            <div className="text-xs space-y-2">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-semibold">Tenant Slug:</span>
                <span className="font-mono font-bold text-slate-800">{tenant?.slug}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-semibold">Subscription Tier:</span>
                <span className="font-bold text-indigo-600 capitalize">{tenant?.planCode || 'Trial'}</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-slate-500 font-semibold">Active Industry Module:</span>
                <span className="font-bold text-slate-800">
                  {entitlements?.modules.includes('steel') ? 'Steel Mills template' : 'Standard Manufacturing'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right col: Notification Alerts & Dynamic Widgets */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">System Log Feed</h3>
            
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-900">Billet stock updated</span>
                  <span className="text-[9px] font-mono text-slate-400">10 mins ago</span>
                </div>
                <p className="text-[11px] text-slate-500">+100 MT added to WH-FG warehouse catalog.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-900">Weighbridge Gate Pass</span>
                  <span className="text-[9px] font-mono text-slate-400">1 hr ago</span>
                </div>
                <p className="text-[11px] text-slate-500">Gate Pass #GATE-029 issued to vehicle BHA-2091.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-900">E-Signature Signed</span>
                  <span className="text-[9px] font-mono text-slate-400">3 hrs ago</span>
                </div>
                <p className="text-[11px] text-slate-500">OSHA Safety check completed by inspector admin.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
