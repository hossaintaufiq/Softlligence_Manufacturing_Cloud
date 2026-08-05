'use client';

import { useWorkspace } from '@/context/WorkspaceContext';
import { TenantAdminPanel } from '@/components/admin/TenantAdminPanel';

export default function AdminPage() {
  const { user, isLoadingUser, isPlatformAdmin } = useWorkspace();

  if (isLoadingUser || !user) {
    return (
      <div className="p-6">
        <p className="text-xs text-slate-500 font-mono animate-pulse">Resolving platform admin credentials...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-slate-800">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 font-sans">Super Admin Console</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Signed in as {user.email} — manage platform tenants, plan codes, modules, and platform statistics.
          </p>
        </div>
      </header>

      <div className="mt-4">
        <TenantAdminPanel />
      </div>
    </div>
  );
}
