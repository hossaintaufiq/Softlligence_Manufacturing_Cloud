'use client';

import { useEffect, useState } from 'react';
import { fetchHealth, fetchReady, type HealthResponse, type ReadyResponse } from '@/lib/api/health';

type State = {
  health?: HealthResponse;
  ready?: ReadyResponse;
  error?: string;
};

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
    <section className="status" aria-live="polite">
      <h2>Foundation status</h2>
      {state.error ? (
        <p className="muted">
          Could not reach API ({state.error}). Start backend on :5001, then refresh.
        </p>
      ) : !state.health ? (
        <p className="muted">Checking API…</p>
      ) : (
        <>
          <div className="status-row">
            <span>API health</span>
            <span className="pill ok">ok</span>
          </div>
          <div className="status-row">
            <span>API ready (database)</span>
            <span className={`pill ${readyOk ? 'ok' : 'bad'}`}>
              {readyOk ? 'ready' : 'not ready'}
            </span>
          </div>
          <div className="status-row">
            <span>Version</span>
            <span className="muted">{state.health.version}</span>
          </div>
          {!readyOk && state.ready?.checks.database.message ? (
            <p className="muted" style={{ marginTop: '0.85rem' }}>
              DB: {state.ready.checks.database.message}
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}
