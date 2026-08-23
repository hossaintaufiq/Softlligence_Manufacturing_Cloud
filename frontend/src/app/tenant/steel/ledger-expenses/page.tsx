'use client';
import { exportToExcel } from '@/lib/excelExport';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface ExpenseRow {
  id: number;
  date: string;
  voucher_no: string;
  expense_head: string;
  amount: number;
  paid_to: string;
  payment_mode: 'Cash' | 'Bank Transfer' | 'Cheque' | 'Mobile Banking';
  remarks: string;
  approved_by: string;
}

export default function LedgerExpensesPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';

  // Local state with seed data
  const [data, setData] = useState<ExpenseRow[]>([
    { id: 1, date: '2026-08-20', voucher_no: 'EXP-260820-01', expense_head: 'Furnace Refractory Consumables', amount: 154000, paid_to: 'Refractory Solutions Ltd', payment_mode: 'Bank Transfer', remarks: 'Patching powder shipment payment', approved_by: 'B. H. Chowdhury' },
    { id: 2, date: '2026-08-21', voucher_no: 'EXP-260821-01', expense_head: 'Electricity Utilities Billing', amount: 170400, paid_to: 'DPDC Power Authority', payment_mode: 'Bank Transfer', remarks: 'Daily factory power charge clearance', approved_by: 'B. H. Chowdhury' },
    { id: 3, date: '2026-08-22', voucher_no: 'EXP-260822-01', expense_head: 'Office Stationary & Spares', amount: 12500, paid_to: 'Karim Stationery Store', payment_mode: 'Cash', remarks: 'Control room paper and logbooks purchase', approved_by: 'Masum Billah' }
  ]);

  // Sheet States
  const [search, setSearch] = useState('');
  const [headFilter, setHeadFilter] = useState('');
  const [sortField, setSortField] = useState<keyof ExpenseRow>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Visible Columns Toggle
  const [visibleCols, setVisibleCols] = useState({
    date: true,
    voucher_no: true,
    expense_head: true,
    amount: true,
    paid_to: true,
    payment_mode: true,
    remarks: true,
    approved_by: true
  });
  const [showColMenu, setShowColMenu] = useState(false);

  // Inline Cell Editing State
  const [editingCell, setEditingCell] = useState<{ id: number; field: keyof ExpenseRow } | null>(null);
  const [editValue, setEditValue] = useState('');

  // Multi-Row Modal Entry
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRows, setModalRows] = useState<any[]>([
    { date: new Date().toISOString().split('T')[0], voucher_no: '', expense_head: 'Furnace Refractory Consumables', amount: '', paid_to: '', payment_mode: 'Cash', remarks: '', approved_by: user?.name || 'Manager' }
  ]);
  const [validationError, setValidationError] = useState('');

  const cellPadding = isCompact ? 'px-3 py-1.5 text-[11px]' : 'px-4 py-2.5 text-xs';
  const expenseHeads = [
    'Furnace Refractory Consumables',
    'Electricity Utilities Billing',
    'Gas Utility Bill',
    'Office Stationary & Spares',
    'HR Salaries & Overtime',
    'Unloading Labor Wages',
    'Others'
  ];

  const handleSort = (field: keyof ExpenseRow) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const startEdit = (id: number, field: keyof ExpenseRow, currentVal: any) => {
    setEditingCell({ id, field });
    setEditValue(String(currentVal));
  };

  const saveInlineEdit = (id: number, field: keyof ExpenseRow) => {
    const updatedRows = data.map(row => {
      if (row.id === id) {
        let val: any = editValue;
        if (field === 'amount') {
          val = parseFloat(editValue);
          if (isNaN(val)) val = row[field];
        }
        return { ...row, [field]: val };
      }
      return row;
    });

    setData(updatedRows);
    setEditingCell(null);
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Voucher No', 'Expense Head', 'Amount (৳)', 'Paid To', 'Payment Mode', 'Remarks', 'Approved By'];
    const rows = filteredData.map(r => [
      r.date, r.voucher_no, r.expense_head, r.amount, r.paid_to, r.payment_mode, r.remarks, r.approved_by
    ]);
    exportToExcel(headers, rows, 'factory_ledger_expenses');
  };

  const addModalRow = () => {
    const nextVoucher = `EXP-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(10 + Math.random() * 90)}`;
    setModalRows([
      ...modalRows,
      { date: new Date().toISOString().split('T')[0], voucher_no: nextVoucher, expense_head: 'Furnace Refractory Consumables', amount: '', paid_to: '', payment_mode: 'Cash', remarks: '', approved_by: user?.name || 'Manager' }
    ]);
  };

  const removeModalRow = (idx: number) => {
    setModalRows(modalRows.filter((_, i) => i !== idx));
  };

  const handleModalRowChange = (idx: number, field: string, val: string) => {
    const updated = [...modalRows];
    updated[idx][field] = val;
    setModalRows(updated);
  };

  const handleMultiRowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    for (let i = 0; i < modalRows.length; i++) {
      const row = modalRows[i];
      const amt = parseFloat(row.amount);

      if (!row.date) return setValidationError(`Row ${i + 1}: Date is required.`);
      if (!row.voucher_no.trim()) return setValidationError(`Row ${i + 1}: Voucher number is required.`);
      if (!row.paid_to.trim()) return setValidationError(`Row ${i + 1}: Paid To recipient is required.`);
      if (isNaN(amt) || amt <= 0) return setValidationError(`Row ${i + 1}: Expense amount must be positive.`);
    }

    const newEntries = modalRows.map((row, index) => {
      return {
        id: data.length + index + 1,
        date: row.date,
        voucher_no: row.voucher_no,
        expense_head: row.expense_head,
        amount: parseFloat(row.amount),
        paid_to: row.paid_to,
        payment_mode: row.payment_mode,
        remarks: row.remarks || 'N/A',
        approved_by: row.approved_by
      };
    });

    setData([...data, ...newEntries]);
    setIsModalOpen(false);
    setModalRows([{ date: new Date().toISOString().split('T')[0], voucher_no: '', expense_head: 'Furnace Refractory Consumables', amount: '', paid_to: '', payment_mode: 'Cash', remarks: '', approved_by: user?.name || 'Manager' }]);
  };

  const filteredData = data
    .filter(row => {
      const matchesSearch = row.paid_to.toLowerCase().includes(search.toLowerCase()) ||
                            row.voucher_no.toLowerCase().includes(search.toLowerCase()) ||
                            row.remarks.toLowerCase().includes(search.toLowerCase());
      const matchesHead = headFilter ? row.expense_head === headFilter : true;
      return matchesSearch && matchesHead;
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

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      
      {/* Title Bar */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wider font-mono">Ledger Expenditures & Expenses</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Logs factory cash vouchers, utility settlements, consumable purchases, and supervisor signature approvals.</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowColMenu(!showColMenu)}
            className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all relative cursor-pointer"
          >
            Column visibility ⚙️
            {showColMenu && (
              <div className="absolute right-0 top-10 z-30 bg-white border border-slate-250 p-3 rounded-xl shadow-xl w-48 text-left space-y-1.5 font-sans font-normal text-xs text-slate-700">
                {Object.keys(visibleCols).map(col => (
                  <label key={col} className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={visibleCols[col as keyof typeof visibleCols]} 
                      onChange={() => setVisibleCols({ ...visibleCols, [col]: !visibleCols[col as keyof typeof visibleCols] })}
                    />
                    <span className="capitalize">{col.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            )}
          </button>
          <button 
            onClick={handleExportCSV}
            className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Export Excel
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-[#C5A059] hover:bg-[#B48F48] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            + Multi-Row Log Entry
          </button>
        </div>
      </div>

      {/* Spreadsheet Control Search */}
      <div className="flex gap-3 bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs">
        <input 
          type="text" 
          placeholder="Search by Paid To, Remarks, or Voucher No..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none"
        />
        <select 
          value={headFilter}
          onChange={(e) => setHeadFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none"
        >
          <option value="">All Expense Heads</option>
          {expenseHeads.map((h, idx) => <option key={idx} value={h}>{h}</option>)}
        </select>
      </div>

      {/* Full-Screen Sheet Grid Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-150 text-[10px] uppercase font-mono text-slate-450">
                {visibleCols.date && (
                  <th className={`sticky left-0 bg-slate-50 z-10 border-r border-slate-100 ${cellPadding} cursor-pointer hover:bg-slate-100`} onClick={() => handleSort('date')}>
                    Date {sortField === 'date' && (sortDir === 'asc' ? '▲' : '▼')}
                  </th>
                )}
                {visibleCols.voucher_no && <th className={`${cellPadding} cursor-pointer hover:bg-slate-100`} onClick={() => handleSort('voucher_no')}>Voucher No</th>}
                {visibleCols.expense_head && <th className={`${cellPadding}`}>Expense Head</th>}
                {visibleCols.amount && <th className={`${cellPadding} text-right`}>Amount (৳)</th>}
                {visibleCols.paid_to && <th className={`${cellPadding}`}>Paid To</th>}
                {visibleCols.payment_mode && <th className={`${cellPadding}`}>Payment Mode</th>}
                {visibleCols.remarks && <th className={`${cellPadding}`}>Remarks</th>}
                {visibleCols.approved_by && <th className={`${cellPadding}`}>Approved By</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/40 transition-colors">
                  {visibleCols.date && (
                    <td className={`sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-150 ${cellPadding} font-bold text-slate-900`}>
                      {row.date}
                    </td>
                  )}
                  {visibleCols.voucher_no && <td className={`${cellPadding} font-semibold`}>{row.voucher_no}</td>}
                  {visibleCols.expense_head && (
                    <td className={cellPadding}>
                      <span className="px-2 py-0.5 text-[9px] font-bold border rounded-full bg-slate-50 text-slate-700 border-slate-250/20">
                        {row.expense_head}
                      </span>
                    </td>
                  )}
                  {visibleCols.amount && (
                    <td className={`${cellPadding} text-right font-bold text-rose-650`} onClick={() => startEdit(row.id, 'amount', row.amount)}>
                      {editingCell?.id === row.id && editingCell?.field === 'amount' ? (
                        <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'amount')} className="bg-slate-50 border border-slate-200 text-right w-24 p-0.5 rounded text-xs focus:outline-none font-mono" autoFocus />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">৳{row.amount.toLocaleString()}</span>
                      )}
                    </td>
                  )}
                  {visibleCols.paid_to && (
                    <td className={cellPadding} onClick={() => startEdit(row.id, 'paid_to', row.paid_to)}>
                      {editingCell?.id === row.id && editingCell?.field === 'paid_to' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'paid_to')} className="bg-slate-50 border border-slate-200 p-0.5 rounded text-xs focus:outline-none" autoFocus />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.paid_to}</span>
                      )}
                    </td>
                  )}
                  {visibleCols.payment_mode && <td className={cellPadding}>{row.payment_mode}</td>}
                  {visibleCols.remarks && <td className={`${cellPadding} text-slate-500 max-w-[200px] truncate`}>{row.remarks}</td>}
                  {visibleCols.approved_by && <td className={`${cellPadding} italic text-slate-500`}>{row.approved_by}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Multi-Row Quick Modal Entry */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 p-4 md:p-6">
          <div className="bg-white border border-slate-250 p-6 rounded-2xl w-full max-w-5xl md:max-w-6xl shadow-2xl space-y-4 relative overflow-hidden border-t-4 border-t-[#C5A059] flex flex-col max-h-[90vh]">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-mono">Create Expense Vouchers</h3>
              <p className="text-[10px] text-slate-450 mt-1">Simultaneously log multiple expense entries, cash claims, and operational bills.</p>
            </div>

            {validationError && (
              <div className="bg-rose-50 text-rose-800 p-3 rounded-xl border border-rose-100 text-[10px] font-bold font-mono">
                🚨 Error: {validationError}
              </div>
            )}

            <form onSubmit={handleMultiRowSubmit} className="space-y-4 flex-1 overflow-y-auto min-h-0">
              <div className="overflow-x-auto pb-3">
                <div className="space-y-3 min-w-[950px] pr-2">
                {modalRows.map((row, idx) => (
                  <div key={idx} className="flex gap-3 items-end border-b border-slate-100 pb-3 last:border-b-0">
                    <div className="w-28 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Date</label>
                      <input type="date" value={row.date} onChange={(e) => handleModalRowChange(idx, 'date', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded focus:outline-none" />
                    </div>
                    <div className="w-28 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Voucher No</label>
                      <input type="text" placeholder="EXP-260823-XX" value={row.voucher_no} onChange={(e) => handleModalRowChange(idx, 'voucher_no', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded focus:outline-none font-mono" />
                    </div>
                    <div className="w-48 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Expense Head</label>
                      <select value={row.expense_head} onChange={(e) => handleModalRowChange(idx, 'expense_head', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded focus:outline-none">
                        {expenseHeads.map((h, i) => <option key={i} value={h}>{h}</option>)}
                      </select>
                    </div>
                    <div className="w-24 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Amount (৳)</label>
                      <input type="number" placeholder="5000" value={row.amount} onChange={(e) => handleModalRowChange(idx, 'amount', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded focus:outline-none font-mono" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Paid To</label>
                      <input type="text" placeholder="Recipient Name" value={row.paid_to} onChange={(e) => handleModalRowChange(idx, 'paid_to', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded focus:outline-none" />
                    </div>
                    <div className="w-28 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Mode</label>
                      <select value={row.payment_mode} onChange={(e) => handleModalRowChange(idx, 'payment_mode', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded focus:outline-none">
                        <option value="Cash">Cash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Mobile Banking">Mobile Banking</option>
                      </select>
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Remarks</label>
                      <input type="text" placeholder="Remarks..." value={row.remarks} onChange={(e) => handleModalRowChange(idx, 'remarks', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded focus:outline-none" />
                    </div>
                    {modalRows.length > 1 && (
                      <button type="button" onClick={() => removeModalRow(idx)} className="text-red-500 hover:text-red-750 pb-2.5 font-bold cursor-pointer">✕</button>
                    )}
                  </div>
                ))}
                </div>
              </div>

              <div className="pt-3 flex justify-between">
                <button 
                  type="button" 
                  onClick={addModalRow}
                  className="px-3.5 py-2 border border-[#C5A059] text-[#B48F48] hover:bg-[#FAF6EE] text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  + Add Row
                </button>
                <div className="flex space-x-2">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-4.5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2.5 bg-gradient-to-r from-[#B48F48] to-[#C5A059] hover:from-[#C5A059] hover:to-[#B48F48] text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    Save Expense Vouchers
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
