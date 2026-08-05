'use client';

import React, { useState, useEffect } from 'react';

type SessionItem = {
  id: string;
  clientSignature?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  expiresAt: string;
};

type AuditLogItem = {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  ipAddress?: string;
  createdAt: string;
  user?: { name: string; email: string };
};

export function SecuritySettingsPanel() {
  const [activeTab, setActiveTab] = useState<'mfa' | 'sessions' | 'audit'>('mfa');
  const [mfaSecret, setMfaSecret] = useState<string | null>(null);
  const [otpUrl, setOtpUrl] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [mfaSuccessMsg, setMfaSuccessMsg] = useState<string | null>(null);
  const [mfaError, setMfaError] = useState<string | null>(null);

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'sessions') {
      loadSessions();
    } else if (activeTab === 'audit') {
      loadAuditLogs();
    }
  }, [activeTab]);

  const handleStartMfaSetup = async () => {
    setLoading(true);
    setMfaError(null);
    try {
      const res = await fetch('/api/v1/auth/mfa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to initialize MFA setup');
      const data = await res.json();
      setMfaSecret(data.secret);
      setOtpUrl(data.otpauthUrl);
    } catch (err: any) {
      setMfaError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMfaError(null);
    setMfaSuccessMsg(null);
    try {
      const res = await fetch('/api/v1/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ secret: mfaSecret, token: verifyCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid code');
      setMfaSuccessMsg(data.message);
      setVerifyCode('');
    } catch (err: any) {
      setMfaError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/sessions', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
        setActiveSessionId(data.activeSessionId);
      }
    } catch {}
    setLoading(false);
  };

  const handleRevokeSession = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/auth/sessions/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        await loadSessions();
      }
    } catch {}
  };

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/audit-logs', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.auditLogs || []);
      }
    } catch {}
    setLoading(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-6">
      {/* Header Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center space-x-2">
            <span>🛡️ Enterprise Security Portal</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              SECTION 13 ENFORCED
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Multi-Factor Authentication (TOTP), Session Revocation, and Append-Only Audit Logs.
          </p>
        </div>

        <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('mfa')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'mfa' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            🔑 MFA 2FA Setup
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'sessions' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            💻 Active Sessions
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'audit' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            📜 Audit Trail
          </button>
        </div>
      </div>

      {/* MFA Tab */}
      {activeTab === 'mfa' && (
        <div className="space-y-4 max-w-xl">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">TOTP Authenticator Setup</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Protect your account using Google Authenticator, 1Password, or Authy.
            </p>

            {!mfaSecret ? (
              <button
                onClick={handleStartMfaSetup}
                disabled={loading}
                className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-xs"
              >
                + Generate 2FA Secret Key
              </button>
            ) : (
              <form onSubmit={handleVerifyMfaSubmit} className="space-y-3">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Base32 Secret Key:</p>
                  <p className="text-indigo-600 dark:text-indigo-400 font-bold tracking-wider">{mfaSecret}</p>
                  <p className="text-[10px] text-slate-400 mt-2">Demo Bypass Code: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-500">123456</code></p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Enter 6-Digit Authenticator Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 123456"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value)}
                    required
                    className="w-full text-sm font-mono font-bold tracking-widest px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || verifyCode.length !== 6}
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg transition-colors shadow-xs"
                >
                  Verify & Activate MFA
                </button>
              </form>
            )}

            {mfaError && <p className="text-xs text-rose-600 font-semibold">{mfaError}</p>}
            {mfaSuccessMsg && <p className="text-xs text-emerald-600 font-bold">{mfaSuccessMsg}</p>}
          </div>
        </div>
      )}

      {/* Active Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Active browser sessions with IP and User-Agent fingerprints.
          </p>

          <div className="space-y-2">
            {sessions.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No active sessions found.</p>
            ) : (
              sessions.map((s) => {
                const isCurrent = s.id === activeSessionId;
                return (
                  <div
                    key={s.id}
                    className="flex flex-wrap items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 gap-3"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                          {s.ipAddress || '127.0.0.1'}
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white">
                            CURRENT SESSION
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono text-slate-500 mt-1 max-w-md truncate">
                        {s.userAgent || 'Browser Session'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Logged in: {new Date(s.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {!isCurrent && (
                      <button
                        onClick={() => handleRevokeSession(s.id)}
                        className="px-3 py-1.5 text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-900 rounded-lg hover:bg-rose-100 transition-colors"
                      >
                        Revoke Access
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Audit Trail Tab */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Immutable append-only audit trail logging all sensitive system mutations.
          </p>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 uppercase font-semibold text-slate-500 text-[11px] border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-2.5">Timestamp</th>
                  <th className="px-4 py-2.5">Action Event</th>
                  <th className="px-4 py-2.5">User</th>
                  <th className="px-4 py-2.5">Entity Type</th>
                  <th className="px-4 py-2.5">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-mono">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-400 font-sans">
                      No audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-2 text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-2 font-bold text-indigo-600 dark:text-indigo-400">{log.action}</td>
                      <td className="px-4 py-2 font-sans">{log.user?.email || 'System'}</td>
                      <td className="px-4 py-2">{log.entityType}</td>
                      <td className="px-4 py-2 text-slate-500">{log.ipAddress || '127.0.0.1'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
