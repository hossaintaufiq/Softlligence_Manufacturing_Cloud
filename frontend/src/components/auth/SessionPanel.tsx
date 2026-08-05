'use client';

import React from 'react';
import Link from 'next/link';
import { useWorkspace } from '@/context/WorkspaceContext';

export function SessionPanel() {
  const { user, tenant, isLoadingUser, isPlatformAdmin, permissions } = useWorkspace();

  if (isLoadingUser) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <p className="text-xs text-slate-500 font-medium">Verifying active authentication session...</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs text-center space-y-3">
        <h2 className="text-sm font-bold text-slate-900">Session Expired or Unauthenticated</h2>
        <p className="text-xs text-slate-500">Please sign in to access your tenant workspace.</p>
        <Link
          href="/login"
          className="inline-flex rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white transition-colors"
        >
          Sign In
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
      <div>
        <h2 className="text-sm font-bold text-slate-900">Active Security Session</h2>
        <p className="text-[11px] text-slate-400 font-mono mt-0.5">Cached client session token details</p>
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="flex flex-col p-3 bg-slate-50 rounded-lg border border-slate-200">
          <dt className="font-semibold text-slate-500">Identity Identifier (UUID):</dt>
          <dd className="mt-1 font-mono font-bold text-slate-900">{user.id}</dd>
        </div>

        <div className="flex flex-col p-3 bg-slate-50 rounded-lg border border-slate-200">
          <dt className="font-semibold text-slate-500">Role Context & Permissions:</dt>
          <dd className="mt-1 font-mono font-bold text-indigo-700">
            {isPlatformAdmin ? 'Platform Administrator (*)' : `Standard Tenant operator (${permissions.length} codes)`}
          </dd>
        </div>

        <div className="flex flex-col p-3 bg-slate-50 rounded-lg border border-slate-200">
          <dt className="font-semibold text-slate-500">Active Tenant Scope:</dt>
          <dd className="mt-1 font-bold text-slate-900">{tenant?.name || 'Super Admin Platform'}</dd>
        </div>

        <div className="flex flex-col p-3 bg-slate-50 rounded-lg border border-slate-200">
          <dt className="font-semibold text-slate-500">Assigned Email Access:</dt>
          <dd className="mt-1 font-bold text-slate-900">{user.email}</dd>
        </div>
      </dl>

      <div className="pt-2 flex flex-wrap gap-2">
        {user.tenantId && (
          <>
            <Link
              href="/inventory"
              className="inline-flex rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors"
            >
              Inventory
            </Link>
            <Link
              href="/manufacturing"
              className="inline-flex rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors"
            >
              Manufacturing
            </Link>
            <Link
              href="/commercial"
              className="inline-flex rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors"
            >
              Commercial
            </Link>
            <Link
              href="/steel"
              className="inline-flex rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors"
            >
              Steel
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
