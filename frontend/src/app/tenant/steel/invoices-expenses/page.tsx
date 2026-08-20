'use client';
import React from 'react';
export default function InvoicesPage() {
  return (
    <div className="space-y-5 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-extrabold text-slate-900">Electricity & Vendor Expense Ledger</h2>
        <p className="text-[11px] text-slate-500">Manage metal alloy purchases and EAF electrical power tariffs bills.</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs text-xs font-mono text-slate-500">
        ðŸ’µ Overhead Ledger: June Grid Electricity Tariff Billing (,500) Approved.
      </div>
    </div>
  );
}
