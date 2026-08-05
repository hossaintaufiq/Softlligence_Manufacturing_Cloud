'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { acceptInvite } from '@/lib/api/iam';
import { Suspense } from 'react';

function AcceptInviteForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [token, setToken] = useState(params.get('token') ?? '');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await acceptInvite({ token, password, name: name || undefined });
      router.replace('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Accept failed');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <div className="space-y-1.5">
        <label className="block text-sm font-medium" htmlFor="token">
          Invite token
        </label>
        <input
          id="token"
          required
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium" htmlFor="name">
          Display name (optional)
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium" htmlFor="password">
          Choose password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      {error ? <p className="text-sm text-bad">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-strong disabled:opacity-60"
      >
        {pending ? 'Saving…' : 'Activate account'}
      </button>
    </form>
  );
}

export default function InvitePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          Softlligence Technologies
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Accept invite</h1>
        <p className="text-sm text-mute">Set your password to activate your workspace account.</p>
      </header>
      <Suspense fallback={<p className="mt-8 text-sm text-mute">Loading…</p>}>
        <AcceptInviteForm />
      </Suspense>
    </main>
  );
}
