'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface ExpenseRow {
  id: number;
  date: string;
  category: string;
  voucher_no: string;
  description: string;
  amount: number;
  type: 'Expense' | 'Scrap Payable' | 'Customer Receivable';
}

export default function ExpensesPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';
  
  // Data State
  const [data, setData] = useState<ExpenseRow[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Search
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortField, setSortField] = useState<keyof ExpenseRow>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  
  // Dialog Form
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Consumables',
    voucher_no: '',
    description: '',
    amount: '',
    type: 'Expense' as const
  });
  const [validationError, setValidationError] = useState('');

  const cellPadding = isCompact ? 'px-4 py-2 text-[11px]' : 'px-5 py-3 text-xs';

  const types = ['Expense', 'Scrap Payable', 'Customer Receivable'];
  const categories = ['Electricity', 'Gas', 'Consumables', 'Salary', 'Spares', 'Scrap Purchase', 'Sales Dispatch', 'Others'];

  async function loadData() {
    try {
      const res = await fetch('/api/expenses');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    generateVoucherNo();
  }, []);

  const generateVoucherNo = () => {
    const random = Math.floor(10000 + Math.random() * 90000);
    setForm(prev => ({ ...prev, voucher_no: `V-${random}` }));
  };

  const handleSort = (field: keyof ExpenseRow) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Type', 'Category', 'Voucher No', 'Description', 'Amount (৳)'];
    const rows = filteredData.map(r => [
      r.id, r.date, r.type, r.category, r.voucher_no, r.description, r.amount
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `operating_expenses_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const amt = parseFloat(form.amount);

    // Inline Validation
    if (!form.voucher_no.trim()) return setValidationError('Voucher Number is required.');
    if (!form.description.trim()) return setValidationError('Description is required.');
    if (isNaN(amt) || amt <= 0) return setValidationError('Amount must be a positive number.');

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const json = await res.json();
      if (json.success) {
        setIsAddOpen(false);
        setForm({
          date: new Date().toISOString().split('T')[0],
          category: 'Consumables',
          voucher_no: '',
          description: '',
          amount: '',
          type: 'Expense'
        });
        loadData();
        generateVoucherNo();
      } else {
        setValidationError(json.error || 'Server error occurred.');
      }
    } catch (err) {
      setValidationError('Failed to connect to ledger API.');
    }
  };

  // Filter & Sort Logic
  const filteredData = data
    .filter(r => {
      const matchSearch = r.description.toLowerCase().includes(search.toLowerCase()) || 
                          r.voucher_no.toLowerCase().includes(search.toLowerCase()) ||
                          r.category.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter ? r.type === typeFilter : true;
      return matchSearch && matchType;
    })
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      
      if (typeof valA === 'string') {
        return sortDir === 'asc' 
          ? (valA as string).localeCompare(valB as string)
          : (valB as string).localeCompare(valA as string);
      } else {
        return sortDir === 'asc' 
          ? (valA as number) - (valB as number)
          : (valB as number) - (valA as number);
      }
    });

  // Financial aggregates
  const totalExpenses = filteredData.filter(r => r.type === 'Expense').reduce((sum, r) => sum + r.amount, 0);
  const totalPayables = filteredData.filter(r => r.type === 'Scrap Payable').reduce((sum, r) => sum + r.amount, 0);
  const totalReceivables = filteredData.filter(r => r.type === 'Customer Receivable').reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 ">
      
      {/* Title Bar */}
      <div className="flex justify-between items-center border-b border-slate-200  pb-3.5">
        <div>
          <h2 className="text-base font-extrabold text-slate-900  uppercase tracking-wider font-mono">Operating Expenses & Financial Ledger</h2>
          <p className="text-[11px] text-slate-500  mt-0.5">Post daily factory utility costs, employee payouts, raw scrap purchase payables, and customer sales receivables.</p>
        </div>
        <button 
          onClick={() => {
            setIsAddOpen(true);
            generateVoucherNo();
          }}
          className="px-4 py-2 bg-[#C5A059] hover:bg-[#B48F48] text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          + Log Ledger Entry
        </button>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white  border border-slate-200  p-4 rounded-xl shadow-2xs">
          <p className="text-[9px] text-slate-450  font-bold uppercase font-mono">Total Operating Expenses</p>
          <h4 className="text-xl font-black text-slate-900  font-mono mt-1">৳{totalExpenses.toLocaleString()}</h4>
          <p className="text-[8px] text-rose-600  font-bold font-mono mt-1">● DEBIT BALANCE (PAID)</p>
        </div>
        <div className="bg-white  border border-slate-200  p-4 rounded-xl shadow-2xs">
          <p className="text-[9px] text-slate-455  font-bold uppercase font-mono">Total Scrap Payables</p>
          <h4 className="text-xl font-black text-slate-900  font-mono mt-1">৳{totalPayables.toLocaleString()}</h4>
          <p className="text-[8px] text-[#B48F48]  font-bold font-mono mt-1">● SUPPLIER INVOICES PENDING</p>
        </div>
        <div className="bg-white  border border-slate-200  p-4 rounded-xl shadow-2xs">
          <p className="text-[9px] text-slate-455  font-bold uppercase font-mono">Total Customer Receivables</p>
          <h4 className="text-xl font-black text-slate-900  font-mono mt-1">৳{totalReceivables.toLocaleString()}</h4>
          <p className="text-[8px] text-emerald-650  font-bold font-mono mt-1">● SALES OUTSTANDING CREDIT</p>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white  border border-slate-200  p-4 rounded-2xl shadow-2xs">
        <input 
          type="text" 
          placeholder="Search by voucher, description, or category..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-slate-50  border border-slate-200  text-xs px-3 py-2 rounded-xl focus:outline-none"
        />
        <select 
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-slate-50  border border-slate-200  text-xs px-3 py-2 rounded-xl focus:outline-none"
        >
          <option value="">All Ledger Types</option>
          {types.map((type, idx) => <option key={idx} value={type}>{type}</option>)}
        </select>
        <button 
          onClick={handleExportCSV}
          className="bg-slate-100  hover:bg-slate-200  border border-slate-200  text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
        >
          Download CSV
        </button>
      </div>

      {/* Data Grid Table */}
      <div className="bg-white  border border-slate-200  rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50  border-b border-slate-150  text-[10px] uppercase font-mono text-slate-450 ">
                <th className={`${cellPadding} cursor-pointer hover:text-slate-800`} onClick={() => handleSort('date')}>Date {sortField === 'date' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                <th className={`${cellPadding} cursor-pointer hover:text-slate-800`} onClick={() => handleSort('type')}>Ledger Type</th>
                <th className={`${cellPadding} cursor-pointer hover:text-slate-800`} onClick={() => handleSort('category')}>Category</th>
                <th className={`${cellPadding} cursor-pointer hover:text-slate-800`} onClick={() => handleSort('voucher_no')}>Voucher No</th>
                <th className={cellPadding}>Voucher Description</th>
                <th className={`${cellPadding} text-right cursor-pointer hover:text-slate-800`} onClick={() => handleSort('amount')}>Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 ">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-xs text-slate-400  font-mono">Fetching financial ledger...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-xs text-slate-400  font-mono">No ledger entries matching the search.</td>
                </tr>
              ) : filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50  transition-colors">
                  <td className={`${cellPadding} font-mono font-semibold`}>{row.date}</td>
                  <td className={cellPadding}>
                    <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-full ${
                      row.type === 'Expense' ? 'bg-rose-50  text-rose-600 border-rose-200/50' :
                      row.type === 'Scrap Payable' ? 'bg-[#FAF6EE]  text-[#B48F48] border-[#C5A059]/20' :
                      'bg-emerald-50  text-emerald-600 border-emerald-200/50'
                    }`}>
                      {row.type}
                    </span>
                  </td>
                  <td className={`${cellPadding} font-bold`}>{row.category}</td>
                  <td className={`${cellPadding} font-mono text-slate-500 `}>{row.voucher_no}</td>
                  <td className={`${cellPadding} font-medium max-w-[260px] truncate`} title={row.description}>{row.description}</td>
                  <td className={`${cellPadding} text-right font-mono font-bold text-slate-900 `}>
                    ৳{row.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Dialog Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40  backdrop-blur-xs">
          <div className="bg-white  border border-slate-200  p-6 rounded-2xl w-full max-w-md shadow-2xl space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900  uppercase tracking-wider font-mono">Add Ledger Entry</h3>
              <p className="text-[10px] text-slate-450  mt-1">Logs a financial voucher. Updates operating expenses and receivables instantly.</p>
            </div>
            
            {validationError && (
              <div className="bg-rose-50  text-rose-800  p-3 rounded-xl border border-rose-200/50 text-[10px] font-bold font-mono">
                🚨 Error: {validationError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-extrabold text-slate-450 ">Date</label>
                  <input 
                    type="date" 
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full bg-slate-50  border border-slate-200  text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-extrabold text-slate-450 ">Voucher No</label>
                  <input 
                    type="text" 
                    value={form.voucher_no}
                    readOnly
                    className="w-full bg-slate-100  border border-slate-200  text-xs px-2.5 py-1.5 rounded-lg font-mono font-bold focus:outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-extrabold text-slate-450 ">Ledger Type</label>
                  <select 
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                    className="w-full bg-slate-50  border border-slate-200  text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                  >
                    {types.map((type, idx) => <option key={idx} value={type}>{type}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-extrabold text-slate-450 ">Expense Category</label>
                  <select 
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-slate-50  border border-slate-200  text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                  >
                    {categories.map((c, idx) => <option key={idx} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider font-extrabold text-slate-450 ">Voucher Amount (৳)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 50000"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full bg-slate-50  border border-slate-200  text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider font-extrabold text-slate-450 ">Description / Notes</label>
                <textarea 
                  placeholder="Describe the nature of this transaction..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-50  border border-slate-200  text-xs px-2.5 py-1.5 rounded-lg focus:outline-none h-18"
                />
              </div>

              <div className="pt-3 border-t border-slate-100  flex justify-end space-x-2">
                <button 
                  type="button" 
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border border-slate-200  text-slate-655  text-xs font-bold rounded-xl hover:bg-slate-50 "
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-[#C5A059] hover:bg-[#B48F48] text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Log Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
