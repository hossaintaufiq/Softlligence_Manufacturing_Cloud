'use client';

import React, { useState, useEffect } from 'react';

type ApiKeyItem = {
  id: string;
  name: string;
  keyPrefix: string;
  status: 'ACTIVE' | 'REVOKED';
  permissions: string[];
  createdAt: string;
};

type WebhookItem = {
  id: string;
  targetUrl: string;
  events: string[];
  secretKey: string;
  status: 'ACTIVE' | 'DISABLED';
  createdAt: string;
};

export function DeveloperPlatformPanel() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([]);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [generatedSecret, setGeneratedSecret] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [keysRes, whRes] = await Promise.all([
        fetch('/api/v1/developer/keys', { credentials: 'include' }),
        fetch('/api/v1/developer/webhooks', { credentials: 'include' }),
      ]);
      if (keysRes.ok) setKeys((await keysRes.json()).keys || []);
      if (whRes.ok) setWebhooks((await whRes.json()).webhooks || []);
    } catch {}
  };

  const handleCreateKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/developer/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: keyName, permissions: ['read:all', 'write:challan'] }),
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedSecret(data.fullKeySecret);
        setKeyName('');
        await loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to generate key');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">💻 Developer API Keys & Webhook Subscriptions</h3>
          <p className="text-xs text-slate-500 mt-0.5">REST API Token Gateway, Webhook Event Subscriptions, and Accounting Connectors.</p>
        </div>

        <button
          onClick={() => setShowNewKeyModal(true)}
          className="px-3.5 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-xs"
        >
          + Generate New API Key
        </button>
      </div>

      {/* API Keys Table */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Active API Tokens</h4>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 uppercase text-[11px] font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Token Name</th>
                <th className="px-4 py-3">Key Prefix</th>
                <th className="px-4 py-3">Permissions Scope</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {keys.map((k) => (
                <tr key={k.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-sans font-bold text-slate-900">{k.name}</td>
                  <td className="px-4 py-3 font-bold text-indigo-600">{k.keyPrefix}...</td>
                  <td className="px-4 py-3 font-sans">
                    <div className="flex flex-wrap gap-1">
                      {k.permissions.map((p) => (
                        <span key={p} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-sans">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {k.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-[11px]">{new Date(k.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Webhooks Section */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Registered Webhook Subscriptions</h4>
        <div className="space-y-2">
          {webhooks.map((w) => (
            <div key={w.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-indigo-600">{w.targetUrl}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {w.status}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs font-mono text-slate-500">
                <span>Subscribed Events:</span>
                <span className="text-slate-800 font-bold">{w.events.join(', ')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Generate Key */}
      {showNewKeyModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Generate New API Integration Key</h3>

            {!generatedSecret ? (
              <form onSubmit={handleCreateKeySubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Key Description Name</label>
                  <input
                    type="text"
                    placeholder="e.g. QuickBooks Accounting Sync Key"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-900"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowNewKeyModal(false)}
                    className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-xs"
                  >
                    Generate Token
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-amber-700 font-semibold bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                  ⚠️ Save this token now! It will never be displayed again.
                </p>
                <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-xs font-bold rounded-lg break-all">
                  {generatedSecret}
                </div>
                <button
                  onClick={() => {
                    setGeneratedSecret(null);
                    setShowNewKeyModal(false);
                  }}
                  className="w-full py-2 text-xs font-bold bg-indigo-600 text-white rounded-lg"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
