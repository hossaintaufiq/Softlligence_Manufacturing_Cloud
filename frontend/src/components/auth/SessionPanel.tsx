'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchMe, logout, refreshSession, type MeResponse } from '@/lib/api/auth';

export function SessionPanel() {
  const router = useRouter();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchMe();
        if (!cancelled) setMe(data);
      } catch {
        try {
          await refreshSession();
          const data = await fetchMe();
          if (!cancelled) setMe(data);
        } catch {
          if (!cancelled) setMe(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onLogout() {
    setError(null);
    try {
      await logout();
      setMe(null);
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
    }
  }

  if (loading) {
    return (
      <section className="mt-8 rounded-2xl border border-line bg-elevated p-5 shadow-soft sm:p-6">
        <p className="text-sm text-mute">Checking session…</p>
      </section>
    );
  }

  if (!me) {
    return (
      <section className="mt-8 rounded-2xl border border-line bg-elevated p-5 shadow-soft sm:p-6">
        <h2 className="text-sm font-semibold text-ink">Not signed in</h2>
        <p className="mt-1 text-sm text-mute">Sign in to use your tenant workspace.</p>
        <Link
          href="/login"
          className="mt-4 inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-strong"
        >
          Go to sign in
        </Link>
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-2xl border border-line bg-elevated p-5 shadow-soft sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-ink">Signed in</h2>
          <p className="mt-1 text-sm text-mute">Session from `/auth/me`</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink hover:bg-canvas"
        >
          Sign out
        </button>
      </div>

      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between gap-4 border-t border-line pt-3">
          <dt className="text-mute">User</dt>
          <dd className="text-right font-medium text-ink">
            {me.user.name}
            <span className="mt-0.5 block font-normal text-mute">{me.user.email}</span>
          </dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-line pt-3">
          <dt className="text-mute">Tenant</dt>
          <dd className="text-right font-medium text-ink">
            {me.tenant?.name ?? (me.user.isPlatformAdmin ? 'Platform' : '—')}
            {me.tenant?.slug ? (
              <span className="mt-0.5 block font-normal text-mute">{me.tenant.slug}</span>
            ) : null}
          </dd>
        </div>
      </dl>

      {me.user.isPlatformAdmin ? (
        <Link
          href="/admin"
          className="mt-4 inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-strong"
        >
          Open Super Admin
        </Link>
      ) : null}

      {me.user.tenantId ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/inventory"
            className="inline-flex rounded-lg border border-emerald-200 bg-emerald-50/50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
          >
            Inventory Core
          </Link>
          <Link
            href="/manufacturing"
            className="inline-flex rounded-lg border border-amber-200 bg-amber-50/50 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100"
          >
            Manufacturing Core
          </Link>
          <Link
            href="/commercial"
            className="inline-flex rounded-lg border border-blue-200 bg-blue-50/50 px-4 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-100"
          >
            Commercial Ops
          </Link>
          <Link
            href="/steel"
            className="inline-flex rounded-lg border border-rose-200 bg-rose-50/50 px-4 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-100"
          >
            Steel Vertical
          </Link>
          <Link
            href="/org"
            className="inline-flex rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink hover:bg-canvas"
          >
            Organization
          </Link>
          <Link
            href="/iam"
            className="inline-flex rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink hover:bg-canvas"
          >
            IAM
          </Link>
          <Link
            href="/modules"
            className="inline-flex rounded-lg border border-indigo-200 bg-indigo-50/50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
          >
            Modules & Entitlements
          </Link>
        </div>
      ) : null}

      {error ? <p className="mt-3 text-sm text-bad">{error}</p> : null}
    </section>
  );
}
