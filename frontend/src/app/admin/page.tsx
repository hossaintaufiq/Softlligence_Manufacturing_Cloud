'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchMe, logout, refreshSession, type MeResponse } from '@/lib/api/auth';
import { TenantAdminPanel } from '@/components/admin/TenantAdminPanel';

export default function AdminPage() {
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
          if (!data.user.isPlatformAdmin) {
            router.replace('/');
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
        <p className="text-sm text-mute">Loading Super Admin…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 pb-16 pt-12">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
            Softlligence Platform
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Super Admin</h1>
          <p className="mt-1 text-sm text-mute">
            Signed in as {me.user.email} — manage tenants and plan stubs.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/"
            className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink hover:bg-canvas"
          >
            Home
          </Link>
          <button
            type="button"
            onClick={async () => {
              await logout();
              router.push('/login');
            }}
            className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink hover:bg-canvas"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="mt-8">
        <TenantAdminPanel />
      </div>
    </main>
  );
}
