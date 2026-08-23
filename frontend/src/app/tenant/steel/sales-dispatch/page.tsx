'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface DispatchRow {
  id: number;
  date: string;
  customer_name: string;
  order_no: string;
  challan_no: string;
  vehicle_no: string;
  dispatch_qty_kg: number;
  rate_per_kg: number;
  total_sales_value: number;
  payment_status: 'Paid' | 'Pending' | 'Partial';
}

export default function SalesDispatchPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';

  // Local state with seed data
  const [data, setData] = useState<DispatchRow[]>([
    { id: 1, date: '2026-08-20', customer_name: 'Metro Infrastructures', order_no: 'ORD-502', challan_no: 'CH-260820A', vehicle_no: 'TR-2005', dispatch_qty_kg: 8000, rate_per_kg: 92, total_sales_value: 736000, payment_status: 'Paid' },
    { id: 2, date: '2026-08-21', customer_name: 'Bengal Housing Ltd', order_no: 'ORD-503', challan_no: 'CH-260821A', vehicle_no: 'TR-1049', dispatch_qty_kg: 12000, rate_per_kg: 94, total_sales_value: 1128000, payment_status: 'Partial' },
    { id: 3, date: '2026-08-22', customer_name: 'Sikder Builders', order_no: 'ORD-504', challan_no: 'CH-260822A', vehicle_no: 'TR-7720', dispatch_qty_kg: 9500, rate_per_kg: 92, total_sales_value: 874000, payment_status: 'Pending' }
  ]);

  // Sheet States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState<keyof DispatchRow>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Visible Columns Toggle
  const [visibleCols, setVisibleCols] = useState({
    date: true,
    customer_name: true,
    order_no: true,
    challan_no: true,
    vehicle_no: true,
    dispatch_qty_kg: true,
    rate_per_kg: true,
    total_sales_value: true,
    payment_status: true
  });
  const [showColMenu, setShowColMenu] = useState(false);

  // Inline Cell Editing State
  const [editingCell, setEditingCell] = useState<{ id: number; field: keyof DispatchRow } | null>(null);
  const [editValue, setEditValue] = useState('');

  // Multi-Row Modal Entry
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRows, setModalRows] = useState<any[]>([
    { date: new Date().toISOString().split('T')[0], customer_name: '', order_no: '', challan_no: '', vehicle_no: '', dispatch_qty_kg: '', rate_per_kg: '92', payment_status: 'Pending' }
  ]);
  const [validationError, setValidationError] = useState('');

  const cellPadding = isCompact ? 'px-3 py-1.5 text-[11px]' : 'px-4 py-2.5 text-xs';

  const handleSort = (field: keyof DispatchRow) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const startEdit = (id: number, field: keyof DispatchRow, currentVal: any) => {
    setEditingCell({ id, field });
    setEditValue(String(currentVal));
  };

  const saveInlineEdit = (id: number, field: keyof DispatchRow) => {
    const updatedRows = data.map(row => {
      if (row.id === id) {
        let val: any = editValue;
        if (field === 'dispatch_qty_kg' || field === 'rate_per_kg') {
          val = parseFloat(editValue);
          if (isNaN(val)) val = row[field];
        }
        const qty = field === 'dispatch_qty_kg' ? val : row.dispatch_qty_kg;
        const rate = field === 'rate_per_kg' ? val : row.rate_per_kg;
        const total = qty * rate;

        return { ...row, [field]: val, total_sales_value: total };
      }
      return row;
    });

    setData(updatedRows);
    setEditingCell(null);
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Customer Name', 'Order No', 'Challan No', 'Vehicle Number', 'Dispatch Qty (kg)', 'Rate/kg', 'Total Sales Value', 'Payment Status'];
    const rows = filteredData.map(r => [
      r.date, r.customer_name, r.order_no, r.challan_no, r.vehicle_no, r.dispatch_qty_kg, r.rate_per_kg, r.total_sales_value, r.payment_status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_dispatch_ledger.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addModalRow = () => {
    const nextChallan = `CH-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}${String.fromCharCode(65 + (modalRows.length % 26))}`;
    setModalRows([
      ...modalRows,
      { date: new Date().toISOString().split('T')[0], customer_name: '', order_no: '', challan_no: nextChallan, vehicle_no: '', dispatch_qty_kg: '', rate_per_kg: '92', payment_status: 'Pending' }
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
      const qty = parseFloat(row.dispatch_qty_kg);
      const rate = parseFloat(row.rate_per_kg);

      if (!row.date) return setValidationError(`Row ${i + 1}: Date is required.`);
      if (!row.customer_name.trim()) return setValidationError(`Row ${i + 1}: Customer name is required.`);
      if (!row.order_no.trim()) return setValidationError(`Row ${i + 1}: Order No is required.`);
      if (!row.challan_no.trim()) return setValidationError(`Row ${i + 1}: Challan No is required.`);
      if (!row.vehicle_no.trim()) return setValidationError(`Row ${i + 1}: Vehicle No is required.`);
      if (isNaN(qty) || qty <= 0) return setValidationError(`Row ${i + 1}: Dispatch quantity must be positive.`);
      if (isNaN(rate) || rate <= 0) return setValidationError(`Row ${i + 1}: Rate must be positive.`);
    }

    const newEntries = modalRows.map((row, index) => {
      const qty = parseFloat(row.dispatch_qty_kg);
      const rate = parseFloat(row.rate_per_kg);
      return {
        id: data.length + index + 1,
        date: row.date,
        customer_name: row.customer_name,
        order_no: row.order_no,
        challan_no: row.challan_no,
        vehicle_no: row.vehicle_no,
        dispatch_qty_kg: qty,
        rate_per_kg: rate,
        total_sales_value: qty * rate,
        payment_status: row.payment_status
      };
    });

    setData([...data, ...newEntries]);
    setIsModalOpen(false);
    setModalRows([{ date: new Date().toISOString().split('T')[0], customer_name: '', order_no: '', challan_no: '', vehicle_no: '', dispatch_qty_kg: '', rate_per_kg: '92', payment_status: 'Pending' }]);
  };

  const filteredData = data
    .filter(row => {
      const matchesSearch = row.customer_name.toLowerCase().includes(search.toLowerCase()) ||
                            row.challan_no.toLowerCase().includes(search.toLowerCase()) ||
                            row.order_no.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter ? row.payment_status === statusFilter : true;
      return matchesSearch && matchesStatus;
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
          <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wider font-mono">Sales & Despatch Logs</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Logs customer rod dispatches, delivery challans, truck weights, billing rates, and invoice payment statuses.</p>
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
            Export Sheet
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
          placeholder="Filter by Customer Name, Challan No, or Order No..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none"
        />
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none"
        >
          <option value="">All Payments</option>
          <option value="Paid">Paid</option>
          <option value="Partial">Partial</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      {/* Full-Screen Sheet Grid Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-150 text-[10px] uppercase font-mono text-slate-450">
                {visibleCols.date && (
                  <th className={`sticky left-0 bg-slate-50 z-10 border-r border-slate-100 ${cellPadding} cursor-pointer hover:bg-slate-100`} onClick={() => handleSort('date')}>
                    Date {sortField === 'date' && (sortDir === 'asc' ? '▲' : '▼')}
                  </th>
                )}
                {visibleCols.customer_name && <th className={`${cellPadding} cursor-pointer hover:bg-slate-100`} onClick={() => handleSort('customer_name')}>Customer Name</th>}
                {visibleCols.order_no && <th className={`${cellPadding}`}>Order No</th>}
                {visibleCols.challan_no && <th className={`${cellPadding} cursor-pointer hover:bg-slate-100`} onClick={() => handleSort('challan_no')}>Challan No</th>}
                {visibleCols.vehicle_no && <th className={`${cellPadding}`}>Vehicle No</th>}
                {visibleCols.dispatch_qty_kg && <th className={`${cellPadding} text-right`}>Dispatch Qty (KG)</th>}
                {visibleCols.rate_per_kg && <th className={`${cellPadding} text-right`}>Rate/KG</th>}
                {visibleCols.total_sales_value && <th className={`${cellPadding} text-right`}>Total Sales (৳)</th>}
                {visibleCols.payment_status && <th className={`${cellPadding}`}>Payment Status</th>}
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
                  {visibleCols.customer_name && (
                    <td className={cellPadding} onClick={() => startEdit(row.id, 'customer_name', row.customer_name)}>
                      {editingCell?.id === row.id && editingCell?.field === 'customer_name' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'customer_name')} className="bg-slate-50 border border-slate-200 p-0.5 rounded text-xs focus:outline-none" autoFocus />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.customer_name}</span>
                      )}
                    </td>
                  )}
                  {visibleCols.order_no && <td className={cellPadding}>{row.order_no}</td>}
                  {visibleCols.challan_no && <td className={`${cellPadding} font-bold`}>{row.challan_no}</td>}
                  {visibleCols.vehicle_no && <td className={cellPadding}>{row.vehicle_no}</td>}
                  {visibleCols.dispatch_qty_kg && (
                    <td className={`${cellPadding} text-right font-semibold`} onClick={() => startEdit(row.id, 'dispatch_qty_kg', row.dispatch_qty_kg)}>
                      {editingCell?.id === row.id && editingCell?.field === 'dispatch_qty_kg' ? (
                        <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'dispatch_qty_kg')} className="bg-slate-50 border border-slate-200 text-right w-20 p-0.5 rounded text-xs focus:outline-none font-mono" autoFocus />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.dispatch_qty_kg.toLocaleString()}</span>
                      )}
                    </td>
                  )}
                  {visibleCols.rate_per_kg && (
                    <td className={`${cellPadding} text-right`} onClick={() => startEdit(row.id, 'rate_per_kg', row.rate_per_kg)}>
                      {editingCell?.id === row.id && editingCell?.field === 'rate_per_kg' ? (
                        <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'rate_per_kg')} className="bg-slate-50 border border-slate-200 text-right w-20 p-0.5 rounded text-xs focus:outline-none font-mono" autoFocus />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">৳{row.rate_per_kg}</span>
                      )}
                    </td>
                  )}
                  {visibleCols.total_sales_value && (
                    <td className={`${cellPadding} text-right font-bold text-emerald-600`}>
                      ৳{row.total_sales_value.toLocaleString()}
                    </td>
                  )}
                  {visibleCols.payment_status && (
                    <td className={cellPadding}>
                      <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-full ${
                        row.payment_status === 'Paid' ? 'bg-emerald-50 text-emerald-650 border-emerald-250/20' :
                        row.payment_status === 'Partial' ? 'bg-amber-50 text-[#B48F48] border-amber-250/20' :
                        'bg-rose-50 text-rose-650 border-rose-250/20'
                      }`}>
                        {row.payment_status}
                      </span>
                    </td>
                  )}
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
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-mono">Create Despatch Challans</h3>
              <p className="text-[10px] text-slate-450 mt-1">Simultaneously dispatch multiple customer rod orders and print challan sheets.</p>
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
                      <input type="date" value={row.date} onChange={(e) => handleModalRowChange(idx, 'date', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2 py-1.5 rounded focus:outline-none" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Customer Name</label>
                      <input type="text" placeholder="Metro Builders" value={row.customer_name} onChange={(e) => handleModalRowChange(idx, 'customer_name', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2 py-1.5 rounded focus:outline-none font-mono" />
                    </div>
                    <div className="w-24 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Order No</label>
                      <input type="text" placeholder="ORD-101" value={row.order_no} onChange={(e) => handleModalRowChange(idx, 'order_no', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2 py-1.5 rounded focus:outline-none font-mono" />
                    </div>
                    <div className="w-28 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Challan No</label>
                      <input type="text" placeholder="CH-2608A" value={row.challan_no} onChange={(e) => handleModalRowChange(idx, 'challan_no', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2 py-1.5 rounded focus:outline-none font-mono" />
                    </div>
                    <div className="w-24 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Vehicle No</label>
                      <input type="text" placeholder="TR-1200" value={row.vehicle_no} onChange={(e) => handleModalRowChange(idx, 'vehicle_no', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2 py-1.5 rounded focus:outline-none" />
                    </div>
                    <div className="w-24 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Qty (KG)</label>
                      <input type="number" placeholder="8000" value={row.dispatch_qty_kg} onChange={(e) => handleModalRowChange(idx, 'dispatch_qty_kg', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded focus:outline-none" />
                    </div>
                    <div className="w-20 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Rate/KG</label>
                      <input type="number" value={row.rate_per_kg} onChange={(e) => handleModalRowChange(idx, 'rate_per_kg', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded focus:outline-none" />
                    </div>
                    <div className="w-24 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Status</label>
                      <select value={row.payment_status} onChange={(e) => handleModalRowChange(idx, 'payment_status', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded focus:outline-none">
                        <option value="Pending">Pending</option>
                        <option value="Partial">Partial</option>
                        <option value="Paid">Paid</option>
                      </select>
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
                    Save Despatches
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
