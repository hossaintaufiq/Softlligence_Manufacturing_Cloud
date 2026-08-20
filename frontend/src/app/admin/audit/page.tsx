'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';

export default function SecurityAuditPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';
  const tableCellPadding = isCompact ? 'px-4 py-2 text-[11px]' : 'px-6 py-3.5 text-xs';
  const tableHeaderPadding = isCompact ? 'px-4 py-2.5 text-[8px]' : 'px-6 py-3.5 text-[9px]';

  return (
    <div className="space-y-5 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-3">
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-mono">Platform Security Logs</h3>
        <p className="text-xs text-slate-500 mt-0.5">Append-only audit logs of platform management actions.</p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                <th className={tableHeaderPadding}>Timestamp</th>
                <th className={tableHeaderPadding}>Actor</th>
                <th className={tableHeaderPadding}>Action Type</th>
                <th className={tableHeaderPadding}>Target Node</th>
                <th className={`${tableHeaderPadding} text-right`}>Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              <tr>
                <td className={`${tableCellPadding} font-mono text-slate-400`}>2026-08-20 11:42</td>
                <td className={tableCellPadding}>admin@softlligence.com</td>
                <td className={`${tableCellPadding} text-indigo-600 uppercase font-bold font-mono`}>provision_tenant</td>
                <td className={tableCellPadding}>/sterlingcasting</td>
                <td className={`${tableCellPadding} text-right text-slate-400 font-mono`}>Plan: Enterprise</td>
              </tr>
              <tr>
                <td className={`${tableCellPadding} font-mono text-slate-400`}>2026-08-20 10:15</td>
                <td className={tableCellPadding}>admin@softlligence.com</td>
                <td className={`${tableCellPadding} text-amber-600 uppercase font-bold font-mono`}>suspend_tenant</td>
                <td className={tableCellPadding}>/globalalloys</td>
                <td className={`${tableCellPadding} text-right text-slate-400 font-mono`}>Billing overdue</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
