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

  const permissions: PermissionSet[] = [
    { roleName: 'Tenant Executive / Administrator', merchandising: 'Full Edit', production: 'Full Edit', finance: 'Full Edit', quality: 'Full Edit' },
    { roleName: 'Production Supervisor / Engineer', merchandising: 'Read-only', production: 'Full Edit', finance: 'Read-only', quality: 'View & Input' },
    { roleName: 'QA / Inspector', merchandising: 'No Access', production: 'Read-only', finance: 'No Access', quality: 'Full Edit' }
  ];

  return (
    <div className="space-y-5 animate-fade-in text-slate-800">
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
  );
}
