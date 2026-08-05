'use client';

import Link from 'next/link';
import { useWorkspace } from '@/context/WorkspaceContext';
import { IamPanel } from '@/components/iam/IamPanel';
import { SecuritySettingsPanel } from '@/components/auth/SecuritySettingsPanel';

export default function IamPage() {
  const { user, tenant, isLoadingUser } = useWorkspace();

  if (isLoadingUser || !user) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-sm text-slate-500">Loading IAM…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 pb-16 pt-12 space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">
            {tenant?.name ?? 'Workspace'}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Identity & Access Management (IAM)</h1>
          <p className="mt-1 text-xs text-slate-500">
            Users, roles, permissions, factory scopes, MFA authentication, and audit trails.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/org"
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Organization
          </Link>
        </div>
      </header>

      <div className="space-y-8">
        <IamPanel />
        <SecuritySettingsPanel />
      </div>
    </main>
  );
}
