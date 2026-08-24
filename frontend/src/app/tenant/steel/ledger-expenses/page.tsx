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
    setEditingCell({ id, field, isCustom });
    setEditValue(String(currentVal));
  };

  const saveInlineEdit = (id: number, field: string, isCustom = false) => {
    const evaluated = evaluateMath(editValue);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xl w-full max-w-md space-y-4 animate-scale-in">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-mono border-b border-slate-100 pb-2">
              {dialog.title}
            </h3>
            <p className="text-xs text-slate-655 font-sans leading-relaxed">
              {dialog.message}
            </p>
            {dialog.type === 'prompt' && (
              <input 
                type="text" 
                value={dialog.value || ''}
                onChange={(e) => setDialog({ ...dialog, value: e.target.value })}
                className="w-full bg-slate-50 border border-slate-250 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-[#C5A059] font-sans"
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
            <div className="flex justify-end space-x-2 pt-2">
              <button 
                onClick={() => setDialog(null)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all cursor-pointer bg-white"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  dialog.onConfirm(dialog.value);
                  setDialog(null);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Title Bar */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wider font-mono">Factory Ledger Expenses</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Logs factory cash vouchers, consumable spares payments, utilities bills, auxiliary expenses, and transaction logs.</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handleAddColumn}
            className="px-3 py-2 border border-[#C5A059] text-[#B48F48] hover:bg-[#FAF6EE] text-xs font-bold rounded-xl transition-all cursor-pointer bg-white"
          >
            + Add Column
          </button>
          <button 
            onClick={handleExportExcel}
            className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all cursor-pointer bg-white"
          >
            Export Excel
          </button>
          <button 
            onClick={handleAddRow}
            className="px-4 py-2 bg-[#C5A059] hover:bg-[#B48F48] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            + Add Row
          </button>
        </div>
      </div>

      {/* Spreadsheet Control Search */}
      <div className="flex gap-3 bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs">
        <input 
          type="text" 
          placeholder="Filter by Head, Voucher, Details, or Payee..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none"
        />
        <select 
          value={modeFilter}
          onChange={(e) => setModeFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none"
        >
          <option value="">All Payment Modes</option>
          {paymentModes.map((m, idx) => <option key={idx} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Full-Screen Sheet Grid Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px] table-fixed">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-150 text-[10px] uppercase font-mono text-slate-400 select-none">
                <th className={`w-14 text-center ${cellPadding}`}>Actions</th>
                <th className={`w-32 ${cellPadding} cursor-pointer hover:bg-slate-100`} onClick={() => handleSort('date')}>
                  Date {sortField === 'date' && (sortDir === 'asc' ? '▲' : '▼')}
                </th>
                <th className={`w-48 ${cellPadding}`}>
                  Expense Head (Consumable Group) <button onClick={() => handleFillDown('expense_head')} title="Fill Down First Row Value" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                </th>
                <th className={`w-52 ${cellPadding}`}>
                  Particulars Details <button onClick={() => handleFillDown('particular_details')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                </th>
                <th className={`w-28 ${cellPadding}`}>Voucher No</th>
                <th className={`w-32 ${cellPadding} text-right`}>
                  Amount (BDT) <button onClick={() => handleFillDown('amount_bdt')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                </th>
                <th className={`w-40 ${cellPadding}`}>
                  Paid To <button onClick={() => handleFillDown('paid_to')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                </th>
                <th className={`w-36 ${cellPadding}`}>Payment Mode</th>

                {/* Dynamic Columns */}
                {customCols.map(col => (
                  <th key={col} className={`w-32 ${cellPadding} text-slate-650 bg-amber-50/30`}>
                    {col} <button onClick={() => handleFillDown(col, true)} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
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
                        <input type="date" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'date')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'date')} className="absolute inset-0 w-full h-full bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10" autoFocus />
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
                    <select
                      value={row.payment_mode}
                      onChange={(e) => {
                        const updated = data.map(r => r.id === row.id ? { ...r, payment_mode: e.target.value as any } : r);
                        saveToStorage(updated);
                      }}
                      className="bg-transparent border-0 focus:outline-none py-0.5 text-xs font-sans text-amber-650 font-bold"
                    >
                      {paymentModes.map((m, i) => <option key={i} value={m}>{m}</option>)}
                    </select>
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
