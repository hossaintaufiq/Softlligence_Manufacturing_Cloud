'use client';

import React from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { SessionPanel } from '@/components/auth/SessionPanel';

export default function ProfilePage() {
  const { user, tenant, isPlatformAdmin } = useWorkspace();

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {}
    window.location.href = '/login';
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6 space-y-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">👤 User Profile & Account Settings</h1>
            <p className="text-xs text-slate-500 mt-1">Manage your active authentication session, security credentials, and organization context.</p>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors shadow-xs"
          >
            Sign Out
          </button>
        </div>

        {/* User Details Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex items-center space-x-4 border-b border-slate-200 pb-6">
            <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
              {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{user?.name || 'Enterprise User'}</h2>
              <p className="text-xs font-mono text-slate-500">{user?.email}</p>
              <div className="mt-1 flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {isPlatformAdmin ? 'Super Administrator' : 'Tenant Operator'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active Account
                </span>
              </div>
            </div>
          </div>

          {/* Account Meta Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="font-semibold text-slate-500">Organization / Tenant:</span>
              <p className="font-bold text-slate-900">{tenant?.name || 'Default Organization'} ({tenant?.slug || 'demo'})</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="font-semibold text-slate-500">User ID:</span>
              <p className="font-mono font-bold text-slate-900 truncate">{user?.id || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Active Session & Security Details */}
        <SessionPanel />
      </div>
    </main>
  );
}
