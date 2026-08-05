'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchMe, logout, refreshSession, type MeResponse } from '@/lib/api/auth';
import { IamPanel } from '@/components/iam/IamPanel';
import { SecuritySettingsPanel } from '@/components/auth/SecuritySettingsPanel';

export default function IamPage() {
  const router = useRouter();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let data: MeResponse;
        try {
          data = await fetchMe();
        } catch {
          await refreshSession();
          data = await fetchMe();
        }
        if (!cancelled) {
          if (!data.user.tenantId) {
            router.replace(data.user.isPlatformAdmin ? '/admin' : '/');
            return;
          }
          setMe(data);
        }
      } catch {
        if (!cancelled) router.replace('/login');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading || !me) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-sm text-mute">Loading IAM…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 pb-16 pt-12 space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-400">
            {me.tenant?.name ?? 'Workspace'}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Identity & Access Management (IAM)</h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Users, roles, permissions, factory scopes, MFA authentication, and audit trails.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/org"
            className="rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Organization
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Home
          </Link>
          <button
            type="button"
            onClick={async () => {
              await logout();
              router.push('/login');
            }}
            className="rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="space-y-8">
        <IamPanel />
        <SecuritySettingsPanel />
      </div>
    </main>
  );
}
