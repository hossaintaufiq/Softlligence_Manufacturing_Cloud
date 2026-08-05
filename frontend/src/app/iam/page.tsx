'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchMe, logout, refreshSession, type MeResponse } from '@/lib/api/auth';
import { IamPanel } from '@/components/iam/IamPanel';

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
    <main className="mx-auto max-w-5xl px-6 pb-16 pt-12">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
            {me.tenant?.name ?? 'Workspace'}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">IAM</h1>
          <p className="mt-1 text-sm text-mute">
            Users, roles, permissions, factory scopes — enforced on the API.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/org"
            className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium hover:bg-canvas"
          >
            Organization
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium hover:bg-canvas"
          >
            Home
          </Link>
          <button
            type="button"
            onClick={async () => {
              await logout();
              router.push('/login');
            }}
            className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium hover:bg-canvas"
          >
            Sign out
          </button>
        </div>
      </header>
      <div className="mt-8">
        <IamPanel />
      </div>
    </main>
  );
}
