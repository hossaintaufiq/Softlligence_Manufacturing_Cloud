'use client';
import { exportToExcel } from '@/lib/excelExport';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface ExpenseRow {
  id: number;
  date: string;
  expense_head: string;
  particular_details: string;
  voucher_no: string;
  amount_bdt: number;
  paid_to: string;
  payment_mode: 'Cash' | 'Bank Transfer' | 'Cheque' | 'Mobile Money';
  customValues?: Record<string, string>;
}

const STORAGE_KEY = 'steel_erp_expenses';

const initialExpenses: ExpenseRow[] = [
  { id: 1, date: '2026-08-20', expense_head: 'Refractory Consumables', particular_details: 'Purchase of furnace patching powder', voucher_no: 'VOU-7712', amount_bdt: 45000, paid_to: 'Refractory Supplies Ltd', payment_mode: 'Bank Transfer' },
  { id: 2, date: '2026-08-21', expense_head: 'Factory Consumables', particular_details: 'CCM dummy bar pins and guide rollers', voucher_no: 'VOU-7713', amount_bdt: 12500, paid_to: 'Local Spares Workshop', payment_mode: 'Cash' },
  { id: 3, date: '2026-08-22', expense_head: 'Melting Auxiliary', particular_details: 'Furnace carbon electrodes delivery', voucher_no: 'VOU-7714', amount_bdt: 180000, paid_to: 'Carbon Electrodes Bangladesh', payment_mode: 'Cheque' }
];

export default function LedgerExpensesPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';

  const [data, setData] = useState<ExpenseRow[]>([]);
  const [customCols, setCustomCols] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState('');
  const [sortField, setSortField] = useState<keyof ExpenseRow>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Cell Editing
  const [editingCell, setEditingCell] = useState<{ id: number; field: string; isCustom: boolean } | null>(null);
  const [editValue, setEditValue] = useState('');

  // Custom Modal Dialog box
  const [dialog, setDialog] = useState<{
    type: 'confirm' | 'prompt';
    title: string;
    message: string;
    value?: string;
    onConfirm: (val?: string) => void;
  } | null>(null);

  const cellPadding = isCompact ? 'px-3 py-1 text-[11px]' : 'px-4 py-1.5 text-xs';
  const paymentModes = ['Cash', 'Bank Transfer', 'Cheque', 'Mobile Money'];

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch {
        setData(initialExpenses);
      }
    } else {
      setData(initialExpenses);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialExpenses));
    }

    const storedCols = localStorage.getItem(`${STORAGE_KEY}_cols`);
    if (storedCols) {
      try { setCustomCols(JSON.parse(storedCols)); } catch {}
    }
  }, []);

  const saveToStorage = (updated: ExpenseRow[], cols = customCols) => {
    setData(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem(`${STORAGE_KEY}_cols`, JSON.stringify(cols));
  };

  // Safe Math Evaluator
  const evaluateMath = (val: string): number | string => {
    let clean = val.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
      return clean;
    }
    if (clean.startsWith('=')) {
      clean = clean.substring(1).trim();
    }
    if (/^[0-9.+\-*/()\s]+$/.test(clean)) {
      try {
        const result = new Function(`return (${clean})`)();
        if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
          return parseFloat(result.toFixed(2));
        }
      } catch {}
    }
    return val;
  };

  const handleSort = (field: keyof ExpenseRow) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  // Add Dynamic Column via Custom Modal Dialog
  const handleAddColumn = () => {
    setDialog({
      type: 'prompt',
      title: 'Add Custom Column',
      message: 'Enter the header name for your new dynamic column:',
      value: '',
      onConfirm: (val) => {
        if (val && val.trim()) {
          const updatedCols = [...customCols, val.trim()];
          setCustomCols(updatedCols);
          saveToStorage(data, updatedCols);
        }
      }
    });
  };

  // Add Row Directly Inline
  const handleAddRow = () => {
    const nextNum = Math.floor(100 + Math.random() * 900);
    const newRow: ExpenseRow = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      expense_head: 'Consumables',
      particular_details: 'Local workshop spares purchase',
      voucher_no: `VOU-${nextNum}`,
      amount_bdt: 0,
      paid_to: 'Local Supplier',
      payment_mode: 'Cash',
      customValues: {}
    };
    saveToStorage([...data, newRow]);
  };

  // Delete Row via Custom Modal Confirm Dialog
  const handleDeleteRow = (id: number) => {
    setDialog({
      type: 'confirm',
      title: 'Confirm Delete',
      message: 'Are you sure you want to permanently delete this expense ledger record?',
      onConfirm: () => {
        saveToStorage(data.filter(r => r.id !== id));
      }
    });
  };

  // Excel Copy Down (Fill Down)
  const handleFillDown = (field: string, isCustom = false) => {
    if (data.length <= 1) return;
    const firstVal = isCustom 
      ? (data[0].customValues?.[field] || '') 
      : data[0][field as keyof ExpenseRow];

    const updated = data.map((row, idx) => {
      if (idx === 0) return row;
      if (isCustom) {
        return {
          ...row,
          customValues: { ...(row.customValues || {}), [field]: String(firstVal) }
        };
      } else {
        return { ...row, [field]: firstVal };
      }
    });
    saveToStorage(updated);
  };

  const startEdit = (id: number, field: string, currentVal: any, isCustom = false) => {
    if (editingCell) {
      saveInlineEdit(editingCell.id, editingCell.field, editingCell.isCustom, editValue);
    }
    setEditingCell({ id, field, isCustom });
    setEditValue(String(currentVal));
  };

  const saveInlineEdit = (id: number, field: string, isCustom = false, forcedValue?: string) => {
    const valToSave = forcedValue !== undefined ? forcedValue : editValue;
    const evaluated = evaluateMath(valToSave);
    const updated = data.map(row => {
      if (row.id === id) {
        if (isCustom) {
          return {
            ...row,
            customValues: { ...(row.customValues || {}), [field]: String(evaluated) }
          };
        } else {
          let val: any = evaluated;
          if (field === 'amount_bdt') {
            val = Number(evaluated);
            if (isNaN(val)) val = row[field as keyof ExpenseRow] || 0;
          }
          return { ...row, [field]: val };
        }
      }
      return row;
    });

    saveToStorage(updated);
    setEditingCell(null);
  };

  const handleExportExcel = () => {
    const customHeaders = customCols;
    const headers = ['Date', 'Expense Head (Consumable Group)', 'Particulars Details', 'Voucher Number', 'Amount (BDT)', 'Paid To Name', 'Payment Mode', ...customHeaders];
    
    const rows = filteredData.map(r => [
      r.date, r.expense_head, r.particular_details, r.voucher_no, r.amount_bdt, r.paid_to, r.payment_mode,
      ...(customCols.map(col => r.customValues?.[col] || ''))
    ]);
    exportToExcel(headers, rows, 'ledger_expenses');
  };

  const filteredData = data
    .filter(row => {
      const matchesSearch = row.expense_head.toLowerCase().includes(search.toLowerCase()) ||
                            row.particular_details.toLowerCase().includes(search.toLowerCase()) ||
                            row.voucher_no.toLowerCase().includes(search.toLowerCase()) ||
                            row.paid_to.toLowerCase().includes(search.toLowerCase());
      const matchesMode = modeFilter ? row.payment_mode === modeFilter : true;
      return matchesSearch && matchesMode;
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

  // Summaries
  const totalAmount = filteredData.reduce((sum, r) => sum + r.amount_bdt, 0);

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      
      {/* Custom Modal Dialog Box */}
      {dialog && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200/90 p-6 rounded-2xl shadow-2xl w-full max-w-md space-y-4 animate-zoom-in my-8">
            <h3 className="text-base font-bold text-slate-900 font-sans border-b border-slate-100 pb-2.5">
              {dialog.title}
            </h3>
            <p className="text-sm text-slate-600 font-sans leading-relaxed">
              {dialog.message}
            </p>
            {dialog.type === 'prompt' && (
              <input 
                type="text" 
                value={dialog.value || ''}
                onChange={(e) => setDialog({ ...dialog, value: e.target.value })}
                className="w-full bg-white border border-slate-300 text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059] font-sans text-slate-900"
                placeholder="Type dynamic column name..."
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    dialog.onConfirm(dialog.value);
                    setDialog(null);
                  }
                }}
              />
            )}
            <div className="flex flex-wrap justify-end gap-3 pt-3 border-t border-slate-100">
              <button 
                onClick={() => setDialog(null)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition-all cursor-pointer bg-white"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  dialog.onConfirm(dialog.value);
                  setDialog(null);
                }}
                className="px-5 py-2 bg-[#B48F48] hover:bg-[#9E7A37] text-white font-semibold text-sm rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enterprise Header Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#B48F48] uppercase tracking-wider font-mono mb-1.5">
            <span>Cost Accounting & CAPEX</span>
            <span>•</span>
            <span>Plant Ledger & Vouchers</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">Factory Ledger Expenses</h1>
          <p className="text-sm text-slate-500 font-sans mt-0.5">Disbursement vouchers for refractory linings, ferroalloy additives, mechanical mill spares, and plant auxiliary operational costs.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleAddColumn}
            className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer flex flex-wrap items-center justify-center gap-2"
          >
            <span>+ Add Column</span>
          </button>
          <button 
            onClick={handleExportExcel}
            className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer flex flex-wrap items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export XLS</span>
          </button>
          <button 
            onClick={handleAddRow}
            className="flex-1 md:flex-none px-5 py-2.5 bg-[#B48F48] hover:bg-[#9E7A37] text-white text-sm font-semibold rounded-xl shadow-sm transition-all cursor-pointer flex flex-wrap items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>+ Record Voucher</span>
          </button>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Total Expenses</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-amber-50 text-amber-700 border border-amber-200">This Month</span>
          </div>
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-4">
            <span className="text-3xl font-bold font-mono tracking-tight text-slate-900">৳{(totalAmount / 1000).toFixed(0)}k</span>
            <span className="text-xs text-slate-400 font-mono">BDT Total</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Spares & Hardware</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">Maintenance</span>
          </div>
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-4">
            <span className="text-3xl font-bold font-mono tracking-tight text-slate-900">
              ৳{(filteredData.filter(r => r.expense_head.includes('Mechanical') || r.expense_head.includes('Electrical')).reduce((acc, r) => acc + (Number(r.amount_bdt) || 0), 0) / 1000).toFixed(0)}k
            </span>
            <span className="text-xs text-slate-400 font-mono">BDT Spent</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Refractory & Lining</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-blue-50 text-blue-700 border border-blue-200">Furnace</span>
          </div>
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-4">
            <span className="text-3xl font-bold font-mono tracking-tight text-slate-900">
              ৳{(filteredData.filter(r => r.expense_head.includes('Refractory')).reduce((acc, r) => acc + (Number(r.amount_bdt) || 0), 0) / 1000).toFixed(0)}k
            </span>
            <span className="text-xs text-slate-400 font-mono">BDT Lining</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Vouchers Logged</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">Audited</span>
          </div>
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-4">
            <span className="text-3xl font-bold font-mono tracking-tight text-emerald-600">{filteredData.length}</span>
            <span className="text-xs text-emerald-600 font-mono font-medium">Valid Vouchers</span>
          </div>
        </div>
      </div>

      {/* Spreadsheet Control Search */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white border border-slate-200/90 p-4 rounded-2xl shadow-xs">
        <input 
          type="text" 
          placeholder="Filter by Head, Voucher, Details, or Payee..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-white border border-slate-300 text-sm px-3.5 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059] font-sans text-slate-900"
        />
        <select 
          value={modeFilter}
          onChange={(e) => setModeFilter(e.target.value)}
          className="bg-white border border-slate-300 text-sm px-3.5 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059] font-sans text-slate-900"
        >
          <option value="">All Payment Modes</option>
          {paymentModes.map((m, idx) => <option key={idx} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Full-Screen Sheet Grid Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px] table-fixed">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase font-mono text-slate-500 select-none">
                <th className={`w-14 text-center ${cellPadding}`}>Actions</th>
                <th className={`w-32 ${cellPadding} cursor-pointer hover:text-slate-900 transition-colors`} onClick={() => handleSort('date')}>
                  Date {sortField === 'date' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th className={`w-44 ${cellPadding}`}>Expense Head</th>
                <th className={`w-64 ${cellPadding}`}>
                  Particulars Details
                </th>
                <th className={`w-36 ${cellPadding}`}>
                  Voucher No
                </th>
                <th className={`w-32 ${cellPadding} text-right text-emerald-700 font-bold`}>
                  Amount (BDT)
                </th>
                <th className={`w-40 ${cellPadding}`}>
                  Paid To
                </th>
                <th className={`w-36 ${cellPadding}`}>Payment Mode</th>

                {/* Dynamic Columns */}
                {customCols.map(col => (
                  <th key={col} className={`w-32 ${cellPadding} text-amber-900 bg-amber-50/60 font-semibold`}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/40 transition-colors h-9">
                  
                  {/* Delete Button */}
                  <td className="text-center py-1">
                    <button 
                      onClick={() => handleDeleteRow(row.id)}
                      className="text-red-500 hover:text-red-750 font-bold text-xs"
                    >
                      ✕
                    </button>
                  </td>

                  {/* Date */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center">
                      {editingCell?.id === row.id && editingCell?.field === 'date' ? (
                        <input 
                          type="date" 
                          value={editValue} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditValue(val);
                            if (val && val.length === 10) {
                              saveInlineEdit(row.id, 'date', false, val);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              saveInlineEdit(row.id, 'date', false, editValue);
                            } else if (e.key === 'Escape') {
                              setEditingCell(null);
                            }
                          }}
                          className="absolute inset-0 w-full h-full bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10" 
                          autoFocus 
                        />
                      ) : (
                        <span className="w-full h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block select-none" onClick={() => startEdit(row.id, 'date', row.date)}>{row.date}</span>
                      )}
                    </div>
                  </td>

                  {/* Expense Head Free text */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center">
                      {editingCell?.id === row.id && editingCell?.field === 'expense_head' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'expense_head')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'expense_head')} className="absolute inset-0 w-full h-full bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10" autoFocus />
                      ) : (
                        <span className="w-full h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block font-bold text-slate-800 select-none" onClick={() => startEdit(row.id, 'expense_head', row.expense_head)}>{row.expense_head}</span>
                      )}
                    </div>
                  </td>

                  {/* Particulars Details */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center">
                      {editingCell?.id === row.id && editingCell?.field === 'particular_details' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'particular_details')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'particular_details')} className="absolute inset-0 w-full h-full bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10" autoFocus />
                      ) : (
                        <span className="w-full h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block truncate select-none" title={row.particular_details} onClick={() => startEdit(row.id, 'particular_details', row.particular_details)}>{row.particular_details}</span>
                      )}
                    </div>
                  </td>

                  {/* Voucher No */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center">
                      {editingCell?.id === row.id && editingCell?.field === 'voucher_no' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'voucher_no')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'voucher_no')} className="absolute inset-0 w-full h-full bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10" autoFocus />
                      ) : (
                        <span className="w-full h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block select-none" onClick={() => startEdit(row.id, 'voucher_no', row.voucher_no)}>{row.voucher_no}</span>
                      )}
                    </div>
                  </td>

                  {/* Amount BDT */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center justify-end text-right">
                      {editingCell?.id === row.id && editingCell?.field === 'amount_bdt' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'amount_bdt')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'amount_bdt')} className="absolute inset-0 w-full h-full text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10 font-semibold" autoFocus />
                      ) : (
                        <span className="w-full h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block select-none font-semibold" onClick={() => startEdit(row.id, 'amount_bdt', row.amount_bdt)}>৳{row.amount_bdt.toLocaleString()}</span>
                      )}
                    </div>
                  </td>

                  {/* Paid To */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center">
                      {editingCell?.id === row.id && editingCell?.field === 'paid_to' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'paid_to')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'paid_to')} className="absolute inset-0 w-full h-full bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10" autoFocus />
                      ) : (
                        <span className="w-full h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block select-none" onClick={() => startEdit(row.id, 'paid_to', row.paid_to)}>{row.paid_to}</span>
                      )}
                    </div>
                  </td>

                  {/* Payment Mode select */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center">
                      <select
                        value={row.payment_mode}
                        onChange={(e) => {
                          const updated = data.map(r => r.id === row.id ? { ...r, payment_mode: e.target.value as any } : r);
                          saveToStorage(updated);
                        }}
                        className="w-full bg-transparent border-0 focus:outline-none py-0.5 text-xs font-sans text-amber-650 font-bold truncate"
                      >
                        {paymentModes.map((m, i) => <option key={i} value={m}>{m}</option>)}
                      </select>
                    </div>
                  </td>

                  {/* Dynamic Columns */}
                  {customCols.map(col => (
                    <td key={col} className={`${cellPadding} bg-amber-50/10`}>
                      <div className="relative w-full h-7 flex items-center">
                        {editingCell?.id === row.id && editingCell?.field === col && editingCell?.isCustom ? (
                          <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, col, true)} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, col, true)} className="absolute inset-0 w-full h-full bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10" autoFocus />
                        ) : (
                          <span className="w-full h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block min-h-[1.2rem] select-none" onClick={() => startEdit(row.id, col, row.customValues?.[col] || '', true)}>{row.customValues?.[col] || ''}</span>
                        )}
                      </div>
                    </td>
                  ))}

                </tr>
              ))}
            </tbody>

            {/* Table Summary Footer */}
            <tfoot>
              <tr className="bg-slate-50 font-semibold border-t-2 border-slate-200 text-xs">
                <td className={cellPadding} colSpan={5}>Total Expenses</td>
                <td className={`${cellPadding} text-right font-black text-rose-600`}>৳{totalAmount.toLocaleString()}</td>
                <td colSpan={2 + customCols.length}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  );
}
