'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';

export default function FinancialAccountingPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';
  const tableCellPadding = isCompact ? 'px-4 py-2 text-[11px]' : 'px-6 py-3.5 text-xs';
  const tableHeaderPadding = isCompact ? 'px-4 py-2.5 text-[8px]' : 'px-6 py-3.5 text-[9px]';

  const accounts = [
    { code: '1010-02', accountName: 'Cash at Bank (HSBC Corporate)', balance: 412500, type: 'Asset', status: 'Reconciled' },
    { code: '1200-01', accountName: 'Accounts Receivable (Zara Group LC)', balance: 185000, type: 'Asset', status: 'Pending Advised' },
    { code: '2100-05', accountName: 'Accounts Payable (Siam Spinners PO)', balance: -42000, type: 'Liability', status: 'Approved' },
    { code: '2100-06', accountName: 'Accounts Payable (Guangdong Knit PO)', balance: -38250, type: 'Liability', status: 'Approved' }
  ];

  return (
    <div className="space-y-5 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-extrabold text-slate-900">Financial Ledger & Balance Accounts</h2>
        <p className="text-[11px] text-slate-500">Inspect corporate cash accounts, receivable LCs, and payable procurement invoices.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/85 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                <th className={tableHeaderPadding}>Account Code</th>
                <th className={tableHeaderPadding}>Corporate Account Name</th>
                <th className={tableHeaderPadding}>Account Classification</th>
                <th className={`${tableHeaderPadding} text-right`}>Ledger Balance</th>
                <th className={`${tableHeaderPadding} text-center`}>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {accounts.map((acc, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className={`${tableCellPadding} text-indigo-600 font-mono font-bold`}>{acc.code}</td>
                  <td className={`${tableCellPadding} text-slate-950 font-bold`}>{acc.accountName}</td>
                  <td className={tableCellPadding}>{acc.type}</td>
                  <td className={`px-6 py-3.5 text-xs text-right font-mono font-bold ${acc.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {acc.balance >= 0 ? `$${acc.balance.toLocaleString()}` : `-$${Math.abs(acc.balance).toLocaleString()}`}
                  </td>
                  <td className={`${tableCellPadding} text-center`}>
                    <span className="px-2 py-0.5 bg-slate-100 text-[#B48F48] rounded text-[9px] font-bold uppercase font-mono tracking-wider">
                      {acc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
