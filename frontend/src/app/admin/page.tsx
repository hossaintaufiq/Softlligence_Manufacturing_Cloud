'use client';

import { useWorkspace } from '@/context/WorkspaceContext';
import { TenantAdminPanel } from '@/components/admin/TenantAdminPanel';

export default function AdminPage() {
  const { user, isLoadingUser, isPlatformAdmin } = useWorkspace();

  if (isLoadingUser || !user) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-sm text-slate-500">Loading Super Admin…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 pb-16 pt-12">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">
            Softlligence Platform
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Super Admin Console</h1>
          <p className="mt-1 text-sm text-slate-500">
            Signed in as {user.email} — manage platform tenants, plan codes, modules, and configurations.
          </p>
        </div>
      </header>

      <div className="mt-8">
        <TenantAdminPanel />
      </div>
    </main>
  );
}
