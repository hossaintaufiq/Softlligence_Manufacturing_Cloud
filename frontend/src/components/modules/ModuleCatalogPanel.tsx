'use client';

import { useEffect, useState } from 'react';
import { fetchTenantModules, toggleTenantModuleApi, type TenantModuleItem } from '../../lib/api/modules.js';

export function ModuleCatalogPanel() {
  const [modules, setModules] = useState<TenantModuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingCode, setTogglingCode] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTenantModules();
      setModules(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load modules');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleToggle(mod: TenantModuleItem) {
    if (mod.isCore) return;
    setTogglingCode(mod.moduleCode);
    setError(null);
    try {
      const updated = await toggleTenantModuleApi(mod.moduleCode, !mod.enabled);
      setModules((prev) =>
        prev.map((m) => (m.moduleCode === updated.moduleCode ? { ...m, enabled: updated.enabled } : m)),
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to toggle module state');
    } finally {
      setTogglingCode(null);
    }
  }

  if (loading) {
    return <div className="p-4 text-slate-500">Loading module catalog & entitlements...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">{error}</div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Module Entitlements</h2>
          <p className="text-sm text-slate-500">Enable or disable modules for this tenant workspace.</p>
        </div>
        <button
          onClick={load}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {modules.map((m) => (
          <div
            key={m.moduleCode}
            className={`rounded-lg border p-4 shadow-sm transition-all ${
              m.enabled
                ? 'border-emerald-200 bg-emerald-50/20 hover:border-emerald-300'
                : 'border-slate-200 bg-slate-50/50 opacity-80 hover:opacity-100'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {m.category}
                  </span>
                  {m.isCore && (
                    <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700">
                      CORE
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{m.name}</h3>
                <p className="text-xs text-slate-600 mt-1">{m.description || 'No description'}</p>
              </div>

              <div className="flex items-center">
                <button
                  disabled={m.isCore || togglingCode === m.moduleCode}
                  onClick={() => handleToggle(m)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    m.enabled ? 'bg-emerald-600' : 'bg-slate-300'
                  } ${m.isCore ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      m.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] text-slate-500">
              <span>Code: <code className="font-mono text-slate-700">{m.moduleCode}</code></span>
              <span>
                Status: {m.enabled ? (
                  <strong className="text-emerald-700 font-semibold">Enabled</strong>
                ) : (
                  <span className="text-slate-400">Disabled</span>
                )}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
