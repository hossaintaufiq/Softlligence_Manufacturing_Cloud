'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';

type PermissionSet = {
  roleName: string;
  merchandising: string;
  production: string;
  finance: string;
  quality: string;
};

export default function SystemConfigurationPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';
  const tableCellPadding = isCompact ? 'px-4 py-2 text-[11px]' : 'px-6 py-3.5 text-xs';
  const tableHeaderPadding = isCompact ? 'px-4 py-2.5 text-[8px]' : 'px-6 py-3.5 text-[9px]';

  const [alerts, setAlerts] = React.useState<string[]>([]);
  const [newAlert, setNewAlert] = React.useState('');

  React.useEffect(() => {
    const data = localStorage.getItem('smc_critical_alerts');
    if (data) {
      setAlerts(JSON.parse(data));
    } else {
      const defaults = [
        "⚠️ CRITICAL: Siam Spinner PO-YRN-001 (Cotton Yarn) delayed in transit.",
        "⚠️ ALARM: Sewing Line 3 defect rate spike detected (2.8% actual vs 1.5% target).",
        "⚠️ ALERT: Dye Vat 01 pressure approaching safety limit (3.2 Bar)."
      ];
      localStorage.setItem('smc_critical_alerts', JSON.stringify(defaults));
      setAlerts(defaults);
    }
  }, []);

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlert.trim()) return;
    const updated = [...alerts, newAlert.trim()];
    localStorage.setItem('smc_critical_alerts', JSON.stringify(updated));
    setAlerts(updated);
    setNewAlert('');
  };

  const handleRemoveAlert = (index: number) => {
    const updated = alerts.filter((_, idx) => idx !== index);
    localStorage.setItem('smc_critical_alerts', JSON.stringify(updated));
    setAlerts(updated);
  };

  const permissions: PermissionSet[] = [
    { roleName: 'Tenant Executive / Administrator', merchandising: 'Full Edit', production: 'Full Edit', finance: 'Full Edit', quality: 'Full Edit' },
    { roleName: 'Production Supervisor / Engineer', merchandising: 'Read-only', production: 'Full Edit', finance: 'Read-only', quality: 'View & Input' },
    { roleName: 'QA / Inspector', merchandising: 'No Access', production: 'Read-only', finance: 'No Access', quality: 'Full Edit' }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in text-slate-800">
      
      {/* Section 1: Permissions Matrix */}
      <div className="space-y-4">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-base font-extrabold text-slate-900">Workspace Module Permissions Matrix</h2>
          <p className="text-[11px] text-slate-500">Configure corporate user group rights and workspace security restrictions.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/85 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                  <th className={tableHeaderPadding}>User Role Group</th>
                  <th className={tableHeaderPadding}>Merchandising</th>
                  <th className={tableHeaderPadding}>Production</th>
                  <th className={tableHeaderPadding}>Finance Ledger</th>
                  <th className={tableHeaderPadding}>Quality Audits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {permissions.map((perm, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className={`${tableCellPadding} text-slate-950 font-bold`}>{perm.roleName}</td>
                    <td className={tableCellPadding}>{perm.merchandising}</td>
                    <td className={tableCellPadding}>{perm.production}</td>
                    <td className={tableCellPadding}>{perm.finance}</td>
                    <td className={tableCellPadding}>{perm.quality}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Section 2: Overview Ticker Alerts Configuration */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-3.5">
          <svg className="w-4 h-4 text-[#B48F48]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono">Overview Rolling Alerts Ticker Config</h3>
        </div>

        <p className="text-[11px] text-slate-550">Add or remove alerts shown in the rolling ticker bar on the workspace Overview page. Removing all alerts will hide the ticker entirely.</p>

        {/* List of active alerts */}
        <div className="space-y-2 max-h-56 overflow-y-auto">
          {alerts.length === 0 ? (
            <p className="text-xs text-slate-400 font-mono py-2 italic">No active alerts configured. The rolling ticker is currently hidden on the Overview page.</p>
          ) : (
            alerts.map((alertText, index) => (
              <div key={index} className="flex items-center justify-between bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-mono">
                <span className="truncate max-w-[85%] text-slate-800 font-semibold">{alertText}</span>
                <button
                  onClick={() => handleRemoveAlert(index)}
                  className="text-[9px] text-rose-600 hover:text-rose-800 font-extrabold uppercase tracking-wider pl-2 transition-colors active:scale-95 animate-fade-in"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add alert form */}
        <form onSubmit={handleAddAlert} className="flex items-center space-x-3 pt-2">
          <input
            type="text"
            value={newAlert}
            onChange={(e) => setNewAlert(e.target.value)}
            placeholder="Type new critical warning alert..."
            className="flex-1 px-3.5 py-2.5 bg-slate-50/50 text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-all text-xs font-semibold"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-[#C5A059] hover:bg-[#B48F48] text-white text-xs font-bold rounded-xl transition-all shadow-xs shrink-0 font-mono uppercase tracking-wider active:scale-[0.98]"
          >
            Add Alert
          </button>
        </form>
      </div>

    </div>
  );
}
