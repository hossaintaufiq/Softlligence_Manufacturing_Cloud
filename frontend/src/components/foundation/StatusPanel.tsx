'use client';

import { useEffect, useState } from 'react';
import { fetchHealth, fetchReady, type HealthResponse, type ReadyResponse } from '@/lib/api/health';

type State = {
  health?: HealthResponse;
  ready?: ReadyResponse;
  error?: string;
};

function Pill({ tone, children }: { tone: 'ok' | 'bad' | 'pending'; children: React.ReactNode }) {
  const tones = {
    ok: 'bg-emerald-50 text-ok ring-1 ring-inset ring-emerald-600/15',
    bad: 'bg-red-50 text-bad ring-1 ring-inset ring-red-600/15',
    pending: 'bg-slate-100 text-mute ring-1 ring-inset ring-slate-300/60',
  };

  return (
    <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

function StatusRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-line py-3 text-sm first:border-t-0 first:pt-0 last:pb-0">
      <span className="text-mute">{label}</span>
      {children}
    </div>
  );
}

export function StatusPanel() {
  const [state, setState] = useState<State>({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [health, ready] = await Promise.all([fetchHealth(), fetchReady()]);
        if (!cancelled) setState({ health, ready });
      } catch (err) {
        if (!cancelled) {
          setState({
            error: err instanceof Error ? err.message : 'API unreachable',
          });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const readyOk = state.ready?.status === 'ready';

  return (
    <section
      className="mt-10 rounded-2xl border border-line bg-elevated p-5 shadow-soft sm:p-6"
      aria-live="polite"
    >
      <h2 className="mb-1 text-sm font-semibold text-ink">Foundation status</h2>
      <p className="mb-4 text-xs text-mute">Live checks against the local API</p>

      {state.error ? (
        <p className="text-sm text-mute">
          Could not reach API ({state.error}). Start backend on :5001, then refresh.
        </p>
      ) : !state.health ? (
        <p className="text-sm text-mute">Checking API…</p>
      ) : (
        <>
          <StatusRow label="API health">
            <Pill tone="ok">ok</Pill>
          </StatusRow>
          <StatusRow label="API ready (database)">
            <Pill tone={readyOk ? 'ok' : 'bad'}>{readyOk ? 'ready' : 'not ready'}</Pill>
          </StatusRow>
          <StatusRow label="Version">
            <span className="font-medium text-ink">{state.health.version}</span>
          </StatusRow>
          {!readyOk && state.ready?.checks.database.message ? (
            <p className="mt-3 text-sm text-mute">DB: {state.ready.checks.database.message}</p>
          ) : null}
        </>
      )}
    </section>
  );
}
