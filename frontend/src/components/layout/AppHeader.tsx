'use client';

import { useState } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';

export function AppHeader() {
  const { setIsCmdPaletteOpen, isOperatorMode, toggleOperatorMode, user, tenant, isPlatformAdmin } = useWorkspace();
  const [showNotifications, setShowNotifications] = useState(false);
  const [tenantScope, setTenantScope] = useState('active');

  const tenantDisplayName = tenant ? `${tenant.name} (${tenant.slug})` : 'Active Tenant Scope';

  return (
    <header className="h-14 border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center space-x-3">
        {/* Scope Display / Switcher */}
        <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          {isPlatformAdmin ? (
            <select
              value={tenantScope}
              onChange={(e) => setTenantScope(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="active">{tenantDisplayName}</option>
              <option value="platform">[Super Admin Scope]</option>
            </select>
          ) : (
            <span className="text-xs font-semibold text-slate-800 tracking-tight">
              {tenantDisplayName}
            </span>
          )}
        </div>

        {/* User Identity / Role Badge */}
        {user && (
          <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            {user.email} {isPlatformAdmin ? '• Super Admin' : ''}
          </span>
        )}

        {/* Developer Mode Badge */}
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-amber-50 text-amber-700 border border-amber-200">
          ENTERPRISE LIGHT
        </span>
      </div>

      <div className="flex items-center space-x-3">
        {/* Global Search Button */}
        <button
          onClick={() => setIsCmdPaletteOpen(true)}
          className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium transition-colors"
        >
          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>Search or type command...</span>
          <kbd className="font-mono text-[10px] bg-white text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">⌘K</kbd>
        </button>

        {/* Operator HMI Toggle */}
        <button
          onClick={toggleOperatorMode}
          title="Toggle Factory Touch HMI Mode"
          className={`p-2 rounded-lg border text-xs font-semibold transition-colors ${
            isOperatorMode
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
          }`}
        >
          HMI Mode
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 relative transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-4 space-y-3 z-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Notifications (Section 14)</h4>
                <span className="text-[10px] text-indigo-600 font-mono">/api/v1/notifications</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-indigo-50/80 border border-indigo-100">
                  <p className="font-bold text-indigo-950">Heat Log #HEAT-2026-001 Confirmed</p>
                  <p className="text-[11px] text-indigo-700 mt-0.5">Furnace 1 yield recorded at 92.4%</p>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-100">
                  <p className="font-bold text-emerald-950">Delivery Challan CHAL-2026-001 Dispatched</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">50 MT Rebar shipped to National Builders</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
