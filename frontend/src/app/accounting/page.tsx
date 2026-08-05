'use client';

import React, { useState } from 'react';

type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';

type AccountItem = {
  code: string;
  name: string;
  type: AccountType;
  balance: number;
};

type JournalEntry = {
  id: string;
  date: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  reference: string;
};

export default function AccountingPage() {
  const [activeTab, setActiveTab] = useState<'coa' | 'journal' | 'trial'>('coa');
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAddJournal, setShowAddJournal] = useState(false);

  // Seed default Chart of Accounts data
  const [accounts, setAccounts] = useState<AccountItem[]>([
    { code: '1010', name: 'Cash at Bank', type: 'ASSET', balance: 142500 },
    { code: '1200', name: 'Accounts Receivable', type: 'ASSET', balance: 84000 },
    { code: '1400', name: 'Raw Material Inventory (Scrap/Billets)', type: 'ASSET', balance: 284500 },
    { code: '1500', name: 'Finished Rebar Inventory', type: 'ASSET', balance: 115000 },
    { code: '2010', name: 'Accounts Payable', type: 'LIABILITY', balance: 45000 },
    { code: '2200', name: 'Accrued Energy Utilities (EGCB)', type: 'LIABILITY', balance: 12400 },
    { code: '3010', name: 'Shareholder Capital', type: 'EQUITY', balance: 400000 },
    { code: '4010', name: 'Sales Revenue (Deformed Bar 12mm)', type: 'REVENUE', balance: 184500 },
    { code: '5010', name: 'Cost of Scrap Melted', type: 'EXPENSE', balance: 125000 },
    { code: '5020', name: 'Furnace Electricity Utility Expense', type: 'EXPENSE', balance: 10400 },
  ]);

  // Seed default journal entries
  const [journals, setJournals] = useState<JournalEntry[]>([
    { id: 'JV-2026-001', date: '2026-08-01', description: 'Raw scrap stock purchase invoice receipt', debitAccount: '1400', creditAccount: '2010', amount: 45000, reference: 'PO-2026-009' },
    { id: 'JV-2026-002', date: '2026-08-02', description: 'Rebar sales delivery & customer billing', debitAccount: '1200', creditAccount: '4010', amount: 84000, reference: 'CH-2026-114' },
    { id: 'JV-2026-003', date: '2026-08-04', description: 'Melt shop furnace power utility bill accrual', debitAccount: '5020', creditAccount: '2200', amount: 10400, reference: 'BILL-8820' },
  ]);

  // Add Account Form State
  const [accountForm, setAccountForm] = useState({
    code: '',
    name: '',
    type: 'ASSET' as AccountType,
    balance: '0',
  });

  // Add Journal Form State
  const [journalForm, setJournalForm] = useState({
    description: '',
    debitAccount: '1010',
    creditAccount: '2010',
    amount: '',
    reference: '',
  });

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountForm.code || !accountForm.name) return;
    setAccounts((prev) => [
      ...prev,
      {
        code: accountForm.code,
        name: accountForm.name,
        type: accountForm.type,
        balance: Number(accountForm.balance || 0),
      },
    ]);
    setShowAddAccount(false);
    setAccountForm({ code: '', name: '', type: 'ASSET', balance: '0' });
  };

  const handleAddJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalForm.description || !journalForm.amount) return;
    const amt = Number(journalForm.amount);
    const newJv: JournalEntry = {
      id: `JV-2026-00${journals.length + 1}`,
      date: new Date().toISOString().slice(0, 10),
      description: journalForm.description,
      debitAccount: journalForm.debitAccount,
      creditAccount: journalForm.creditAccount,
      amount: amt,
      reference: journalForm.reference || 'N/A',
    };
    setJournals((prev) => [newJv, ...prev]);

    // Update Chart of Accounts balances
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.code === journalForm.debitAccount) {
          // Debit increases assets and expenses, decreases liabilities, equity, revenues
          const direction = ['ASSET', 'EXPENSE'].includes(acc.type) ? 1 : -1;
          return { ...acc, balance: acc.balance + amt * direction };
        }
        if (acc.code === journalForm.creditAccount) {
          // Credit increases liabilities, equity, revenues, decreases assets and expenses
          const direction = ['LIABILITY', 'EQUITY', 'REVENUE'].includes(acc.type) ? 1 : -1;
          return { ...acc, balance: acc.balance + amt * direction };
        }
        return acc;
      })
    );

    setShowAddJournal(false);
    setJournalForm({ description: '', debitAccount: '1010', creditAccount: '2010', amount: '', reference: '' });
  };

  // Trial Balance math
  const trialBalanceSums = accounts.reduce(
    (sums, acc) => {
      const isDebitType = ['ASSET', 'EXPENSE'].includes(acc.type);
      if (isDebitType) {
        sums.debit += acc.balance;
      } else {
        sums.credit += acc.balance;
      }
      return sums;
    },
    { debit: 0, credit: 0 }
  );

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Financial Ledger & Cost Control</h1>
          <p className="text-xs text-slate-500 mt-0.5">Automated Double-entry bookkeeping, dynamic Chart of Accounts, and Trial Balance sheets.</p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2">
          {activeTab === 'coa' && (
            <button
              onClick={() => setShowAddAccount(true)}
              className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 text-xs font-bold transition-colors shadow-xs"
            >
              + Create Account Ledger
            </button>
          )}
          {activeTab === 'journal' && (
            <button
              onClick={() => setShowAddJournal(true)}
              className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 text-xs font-bold transition-colors shadow-xs"
            >
              + Post Journal Entry
            </button>
          )}
        </div>
      </div>

      {/* Tab Segmented Bar */}
      <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl w-fit space-x-1 border border-slate-200">
        <button
          onClick={() => setActiveTab('coa')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'coa'
              ? 'bg-white text-indigo-700 shadow-2xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'
          }`}
        >
          Chart of Accounts
        </button>
        <button
          onClick={() => setActiveTab('journal')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'journal'
              ? 'bg-white text-indigo-700 shadow-2xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'
          }`}
        >
          General Journal Ledger
        </button>
        <button
          onClick={() => setActiveTab('trial')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'trial'
              ? 'bg-white text-indigo-700 shadow-2xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'
          }`}
        >
          Trial Balance Report
        </button>
      </div>

      {/* Content Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        {/* Tab 1: Chart of Accounts */}
        {activeTab === 'coa' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Operational Accounts Ledger</h3>
              <span className="text-xs text-slate-500 font-medium">Total registered codes: {accounts.length}</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Account Code</th>
                    <th className="px-4 py-3">Account Title Name</th>
                    <th className="px-4 py-3">GL Category Type</th>
                    <th className="px-4 py-3 text-right">Current Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {accounts.map((acc) => (
                    <tr key={acc.code} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-bold text-indigo-700">{acc.code}</td>
                      <td className="px-4 py-3">{acc.name}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            acc.type === 'ASSET'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : acc.type === 'LIABILITY'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : acc.type === 'EQUITY'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : acc.type === 'REVENUE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {acc.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                        ${acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: General Journal Ledger */}
        {activeTab === 'journal' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Double-Entry Journal Postings</h3>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">JV Number</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Transaction details</th>
                    <th className="px-4 py-3">Debit A/C (Dr)</th>
                    <th className="px-4 py-3">Credit A/C (Cr)</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3">Reference Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {journals.map((jv) => {
                    const drAcc = accounts.find((a) => a.code === jv.debitAccount)?.name || jv.debitAccount;
                    const crAcc = accounts.find((a) => a.code === jv.creditAccount)?.name || jv.creditAccount;
                    return (
                      <tr key={jv.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono font-bold text-indigo-700">{jv.id}</td>
                        <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{jv.date}</td>
                        <td className="px-4 py-3 text-slate-700">{jv.description}</td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-900 font-mono">{jv.debitAccount}</p>
                          <p className="text-[10px] text-slate-500 truncate max-w-[120px]">{drAcc}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-900 font-mono">{jv.creditAccount}</p>
                          <p className="text-[10px] text-slate-500 truncate max-w-[120px]">{crAcc}</p>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                          ${jv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-600">{jv.reference}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Trial Balance */}
        {activeTab === 'trial' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-800">Summarized General Ledger Trial Balance</h3>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Account</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3 text-right">Debit Balance (Dr)</th>
                    <th className="px-4 py-3 text-right">Credit Balance (Cr)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {accounts.map((acc) => {
                    const isDebit = ['ASSET', 'EXPENSE'].includes(acc.type);
                    return (
                      <tr key={acc.code} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <span className="font-mono font-bold text-indigo-700 mr-2">{acc.code}</span>
                          <span>{acc.name}</span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-500 text-[10px] tracking-wide">{acc.type}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                          {isDebit ? `$${acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                          {!isDebit ? `$${acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                  {/* Totals Row */}
                  <tr className="bg-slate-50 font-bold border-t border-slate-300">
                    <td colSpan={2} className="px-4 py-4 text-sm text-slate-900 uppercase tracking-wider">Matched Ledger Totals</td>
                    <td className="px-4 py-4 text-right font-mono text-sm text-indigo-700">
                      ${trialBalanceSums.debit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-sm text-indigo-700">
                      ${trialBalanceSums.credit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {trialBalanceSums.debit === trialBalanceSums.credit ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 flex items-center space-x-2 text-emerald-800 text-xs font-semibold shadow-xs">
                <span>🛡️</span>
                <span>Ledger in balance! Total Debits match Credits perfectly. All transaction records verified.</span>
              </div>
            ) : (
              <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 flex items-center space-x-2 text-rose-800 text-xs font-semibold shadow-xs">
                <span>⚠️</span>
                <span>Audit warning: Debit/Credit sums mismatch. Please inspect ledger journals.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Add Account */}
      {showAddAccount && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Create New Account Ledger</h3>
            <form onSubmit={handleAddAccount} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1010 or 5030"
                  value={accountForm.code}
                  onChange={(e) => setAccountForm({ ...accountForm, code: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Title Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cash at Bank"
                  value={accountForm.name}
                  onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Category Type</label>
                <select
                  value={accountForm.type}
                  onChange={(e) => setAccountForm({ ...accountForm, type: e.target.value as AccountType })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900"
                >
                  <option value="ASSET">ASSET</option>
                  <option value="LIABILITY">LIABILITY</option>
                  <option value="EQUITY">EQUITY</option>
                  <option value="REVENUE">REVENUE</option>
                  <option value="EXPENSE">EXPENSE</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Opening Balance ($)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={accountForm.balance}
                  onChange={(e) => setAccountForm({ ...accountForm, balance: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddAccount(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-xs"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Journal Entry */}
      {showAddJournal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Post Double-Entry Journal JV</h3>
            <form onSubmit={handleAddJournal} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Transaction Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scrap purchase invoice payment"
                  value={journalForm.description}
                  onChange={(e) => setJournalForm({ ...journalForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Debit Account (Dr)</label>
                  <select
                    value={journalForm.debitAccount}
                    onChange={(e) => setJournalForm({ ...journalForm, debitAccount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900"
                  >
                    {accounts.map((a) => (
                      <option key={a.code} value={a.code}>
                        {a.code} — {a.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Credit Account (Cr)</label>
                  <select
                    value={journalForm.creditAccount}
                    onChange={(e) => setJournalForm({ ...journalForm, creditAccount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900"
                  >
                    {accounts.map((a) => (
                      <option key={a.code} value={a.code}>
                        {a.code} — {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Transaction Value ($)</label>
                  <input
                    type="number"
                    required
                    placeholder="Amount"
                    value={journalForm.amount}
                    onChange={(e) => setJournalForm({ ...journalForm, amount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reference Code (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. PO-2026-012"
                    value={journalForm.reference}
                    onChange={(e) => setJournalForm({ ...journalForm, reference: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddJournal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-xs"
                >
                  Confirm Posting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
