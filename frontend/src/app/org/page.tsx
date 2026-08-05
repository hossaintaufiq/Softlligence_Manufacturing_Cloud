'use client';

import { useWorkspace } from '@/context/WorkspaceContext';
import { OrgPanel } from '@/components/org/OrgPanel';

export default function OrgPage() {
  const { user, tenant, isLoadingUser } = useWorkspace();

  if (isLoadingUser || !user) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-sm text-slate-500">Loading organization…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 pb-16 pt-12">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">
            {tenant?.name ?? 'Workspace'}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Organization</h1>
          <p className="mt-1 text-sm text-slate-500">Companies and factories for this tenant.</p>
        </div>
      </header>

      <div className="mt-8">
        <OrgPanel />
      </div>
    </main>
  );
}
