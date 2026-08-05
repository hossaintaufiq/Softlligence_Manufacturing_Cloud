'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import {
  createCompany,
  createFactory,
  deleteCompany,
  deleteFactory,
  listCompanies,
  listFactories,
  type Company,
  type Factory,
} from '@/lib/api/org';

export function OrgPanel() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [cName, setCName] = useState('');
  const [cCode, setCCode] = useState('');
  const [cCurrency, setCCurrency] = useState('USD');

  const [fCompanyId, setFCompanyId] = useState('');
  const [fName, setFName] = useState('');
  const [fCode, setFCode] = useState('');
  const [fTz, setFTz] = useState('Asia/Dhaka');

  const refresh = useCallback(async () => {
    const [c, f] = await Promise.all([listCompanies(), listFactories()]);
    setCompanies(c);
    setFactories(f);
    if (!fCompanyId && c[0]) setFCompanyId(c[0].id);
  }, [fCompanyId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refresh();
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  async function onCreateCompany(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createCompany({ name: cName, code: cCode, currency: cCurrency });
      setCName('');
      setCCode('');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create company failed');
    }
  }

  async function onCreateFactory(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createFactory({
        companyId: fCompanyId,
        name: fName,
        code: fCode,
        timezone: fTz,
      });
      setFName('');
      setFCode('');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create factory failed');
    }
  }

  if (loading) return <p className="text-sm text-mute">Loading organization…</p>;

  return (
    <div className="space-y-8">
      {error ? <p className="text-sm text-bad">{error}</p> : null}

      <section className="rounded-2xl border border-line bg-elevated p-5 shadow-soft sm:p-6">
        <h2 className="text-sm font-semibold text-ink">Companies</h2>
        <form onSubmit={onCreateCompany} className="mt-4 grid gap-3 sm:grid-cols-4">
          <input
            required
            value={cName}
            onChange={(e) => setCName(e.target.value)}
            placeholder="Name"
            className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
          />
          <input
            required
            value={cCode}
            onChange={(e) => setCCode(e.target.value)}
            placeholder="Code"
            className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
          />
          <input
            required
            value={cCurrency}
            onChange={(e) => setCCurrency(e.target.value)}
            placeholder="USD"
            maxLength={3}
            className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="submit"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-strong"
          >
            Add company
          </button>
        </form>

        <ul className="mt-4 divide-y divide-line">
          {companies.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <div>
                <p className="font-medium text-ink">
                  {c.name}{' '}
                  <span className="font-normal text-mute">({c.code})</span>
                </p>
                <p className="text-xs text-mute">
                  {c.currency} · {c.status}
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  setError(null);
                  try {
                    await deleteCompany(c.id);
                    await refresh();
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Delete failed');
                  }
                }}
                className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium hover:bg-canvas"
              >
                Delete
              </button>
            </li>
          ))}
          {companies.length === 0 ? <li className="py-3 text-sm text-mute">No companies yet.</li> : null}
        </ul>
      </section>

      <section className="rounded-2xl border border-line bg-elevated p-5 shadow-soft sm:p-6">
        <h2 className="text-sm font-semibold text-ink">Factories</h2>
        <form onSubmit={onCreateFactory} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <select
            required
            value={fCompanyId}
            onChange={(e) => setFCompanyId(e.target.value)}
            className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">Select company</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
          <input
            required
            value={fName}
            onChange={(e) => setFName(e.target.value)}
            placeholder="Factory name"
            className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
          />
          <input
            required
            value={fCode}
            onChange={(e) => setFCode(e.target.value)}
            placeholder="Code"
            className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
          />
          <input
            value={fTz}
            onChange={(e) => setFTz(e.target.value)}
            placeholder="Timezone"
            className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="submit"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-strong"
          >
            Add factory
          </button>
        </form>

        <ul className="mt-4 divide-y divide-line">
          {factories.map((f) => {
            const company = companies.find((c) => c.id === f.companyId);
            return (
              <li key={f.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-medium text-ink">
                    {f.name}{' '}
                    <span className="font-normal text-mute">({f.code})</span>
                  </p>
                  <p className="text-xs text-mute">
                    {company?.name ?? f.companyId} · {f.timezone} · {f.status}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    setError(null);
                    try {
                      await deleteFactory(f.id);
                      await refresh();
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Delete failed');
                    }
                  }}
                  className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium hover:bg-canvas"
                >
                  Delete
                </button>
              </li>
            );
          })}
          {factories.length === 0 ? <li className="py-3 text-sm text-mute">No factories yet.</li> : null}
        </ul>
      </section>
    </div>
  );
}
