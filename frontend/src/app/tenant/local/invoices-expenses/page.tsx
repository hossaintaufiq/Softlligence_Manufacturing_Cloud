'use client';
import React from 'react';
export default function ExpensesPage() {
  return (
    <div className="space-y-5 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-extrabold text-slate-900">Invoices & Store Expenses</h2>
        <p className="text-[11px] text-slate-500">Bookkeeping for storefront rent, cashier wages, and wholesale invoices.</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs text-xs font-mono text-slate-550">
        ðŸ’µ Ledger balance: Cash-in-hand (,420), Overhead reserves (,000).
      </div>
    </div>
  );
}
