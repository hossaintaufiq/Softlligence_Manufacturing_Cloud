'use client';
import { exportToExcel } from '@/lib/excelExport';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface DispatchRow {
  id: number;
  date: string;
  customer_name: string;
  contact_info: string;
  order_no: string;
  challan_no: string;
  vehicle_no: string;
  dispatch_qty_kg: number;
  rate_per_kg: number;
  total_sales_value: number;
  payment_status: 'Paid' | 'Partial' | 'Pending';
  rod_size: string;
  customValues?: Record<string, string>;
}

const STORAGE_KEY = 'steel_erp_dispatch';

const initialDispatchData: DispatchRow[] = [
  { id: 1, date: '2026-08-20', customer_name: 'Metro Infrastructures', contact_info: '01712-334455', order_no: 'ORD-502', challan_no: 'CH-260820A', vehicle_no: 'TR-2005', dispatch_qty_kg: 8000, rate_per_kg: 92, total_sales_value: 736000, payment_status: 'Paid', rod_size: '12MM' },
  { id: 2, date: '2026-08-21', customer_name: 'Bengal Housing Ltd', contact_info: '01715-667788', order_no: 'ORD-503', challan_no: 'CH-260821A', vehicle_no: 'TR-1049', dispatch_qty_kg: 12000, rate_per_kg: 94, total_sales_value: 1128000, payment_status: 'Partial', rod_size: '16MM' },
  { id: 3, date: '2026-08-22', customer_name: 'Sikder Builders', contact_info: '01819-223344', order_no: 'ORD-504', challan_no: 'CH-260822A', vehicle_no: 'TR-7720', dispatch_qty_kg: 9500, rate_per_kg: 92, total_sales_value: 874000, payment_status: 'Pending', rod_size: '20MM' }
];

export default function SalesDispatchPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';

  const [data, setData] = useState<DispatchRow[]>([]);
  const [customCols, setCustomCols] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [sortField, setSortField] = useState<keyof DispatchRow>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Cell Editing
  const [editingCell, setEditingCell] = useState<{ id: number; field: string; isCustom: boolean } | null>(null);
  const [editValue, setEditValue] = useState('');

  // Custom Modal Dialog Box State
  const [dialog, setDialog] = useState<{
    type: 'confirm' | 'prompt';
    title: string;
    message: string;
    value?: string;
    onConfirm: (val?: string) => void;
  } | null>(null);

  const cellPadding = isCompact ? 'px-3 py-1 text-[11px]' : 'px-4 py-1.5 text-xs';
  const sizes = ['8MM', '10MM', '12MM', '16MM', '20MM', '22MM', '25MM', '32MM'];
  const paymentModes = ['Paid', 'Partial', 'Pending'];

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch {
        setData(initialDispatchData);
      }
    } else {
      setData(initialDispatchData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDispatchData));
    }

    const storedCols = localStorage.getItem(`${STORAGE_KEY}_cols`);
    if (storedCols) {
      try { setCustomCols(JSON.parse(storedCols)); } catch {}
    }
  }, []);

  const saveToStorage = (updated: DispatchRow[], cols = customCols) => {
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

  const handleSort = (field: keyof DispatchRow) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
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
    const newRow: DispatchRow = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      customer_name: 'New Client Ltd',
      contact_info: '',
      order_no: `ORD-${nextNum}`,
      challan_no: `CH-2608${nextNum}`,
      vehicle_no: 'TR-' + nextNum,
      dispatch_qty_kg: 0,
      rate_per_kg: 92,
      total_sales_value: 0,
      payment_status: 'Pending',
      rod_size: '12MM',
      customValues: {}
    };
    saveToStorage([...data, newRow]);
  };

  // Delete Row via Custom Modal Confirm Dialog
  const handleDeleteRow = (id: number) => {
    setDialog({
      type: 'confirm',
      title: 'Confirm Delete',
      message: 'Are you sure you want to permanently delete this sales dispatch record?',
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
      : data[0][field as keyof DispatchRow];

    const updated = data.map((row, idx) => {
      if (idx === 0) return row;
      if (isCustom) {
        return {
          ...row,
          customValues: { ...(row.customValues || {}), [field]: String(firstVal) }
        };
      } else {
        const baseRow = { ...row, [field]: firstVal };
        const qty = Number(baseRow.dispatch_qty_kg);
        const rate = Number(baseRow.rate_per_kg);
        baseRow.total_sales_value = qty * rate;
        return baseRow;
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
          if (field === 'dispatch_qty_kg' || field === 'rate_per_kg' || field === 'total_sales_value') {
            val = Number(evaluated);
            if (isNaN(val)) val = row[field as keyof DispatchRow] || 0;
          }
          const baseRow = { ...row, [field]: val };
          const qty = Number(baseRow.dispatch_qty_kg);
          const rate = Number(baseRow.rate_per_kg);
          baseRow.total_sales_value = qty * rate;
          return baseRow;
        }
      }
      return row;
    });

    saveToStorage(updated);
    setEditingCell(null);
  };

  const handleExportExcel = () => {
    const customHeaders = customCols;
    const headers = ['Date', 'Customer Name', 'Contact Info', 'Order No', 'Challan No', 'Vehicle No', 'Finished Size', 'Dispatch Weight (KG)', 'Selling Rate/KG', 'Total Sales Invoice Value', 'Payment Mode/Status', ...customHeaders];
    
    const rows = filteredData.map(r => [
      r.date, r.customer_name, r.contact_info, r.order_no, r.challan_no, r.vehicle_no, r.rod_size, r.dispatch_qty_kg, r.rate_per_kg, r.total_sales_value, r.payment_status,
      ...(customCols.map(col => r.customValues?.[col] || ''))
    ]);
    exportToExcel(headers, rows, 'sales_dispatch_ledger');
  };

  const filteredData = data
    .filter(row => {
      const matchesSearch = row.customer_name.toLowerCase().includes(search.toLowerCase()) ||
                            row.challan_no.toLowerCase().includes(search.toLowerCase());
      const matchesPayment = paymentFilter ? row.payment_status === paymentFilter : true;
      return matchesSearch && matchesPayment;
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
  const totalQty = filteredData.reduce((sum, r) => sum + r.dispatch_qty_kg, 0);
  const totalSales = filteredData.reduce((sum, r) => sum + r.total_sales_value, 0);

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
          <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wider font-mono">Sales & Dispatch Ledger</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Logs outbound finished goods delivery notes, customer contacts, dispatch scales, invoice balances, and billing stages.</p>
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
          placeholder="Filter by Customer Name, or Challan No..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none"
        />
        <select 
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none"
        >
          <option value="">All Payment Modes</option>
          {paymentModes.map((m, idx) => <option key={idx} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Full-Screen Sheet Grid Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1250px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-150 text-[10px] uppercase font-mono text-slate-400 select-none">
                <th className={`w-14 text-center ${cellPadding}`}>Actions</th>
                <th className={`${cellPadding} cursor-pointer hover:bg-slate-100`} onClick={() => handleSort('date')}>
                  Date {sortField === 'date' && (sortDir === 'asc' ? '▲' : '▼')}
                </th>
                <th className={`${cellPadding}`}>
                  Customer Name <button onClick={() => handleFillDown('customer_name')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                </th>
                <th className={`${cellPadding}`}>
                  Contact Info <button onClick={() => handleFillDown('contact_info')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                </th>
                <th className={`${cellPadding}`}>Order No</th>
                <th className={`${cellPadding}`}>Challan No</th>
                <th className={`${cellPadding}`}>Vehicle No</th>
                <th className={`${cellPadding}`}>Finished Size</th>
                <th className={`${cellPadding} text-right`}>
                  Dispatch Qty (KG) <button onClick={() => handleFillDown('dispatch_qty_kg')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                </th>
                <th className={`${cellPadding} text-right`}>
                  Rate/KG <button onClick={() => handleFillDown('rate_per_kg')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                </th>
                <th className={`${cellPadding} text-right`}>Invoice Value</th>
                <th className={`${cellPadding}`}>Payment Status</th>

                {/* Dynamic Columns */}
                {customCols.map(col => (
                  <th key={col} className={`${cellPadding} text-slate-600 bg-amber-50/30`}>
                    {col} <button onClick={() => handleFillDown(col, true)} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/40 transition-colors h-9">
                  
                  {/* Delete row */}
                  <td className="text-center py-1">
                    <button 
                      onClick={() => handleDeleteRow(row.id)}
                      className="text-red-500 hover:text-red-750 font-bold text-xs"
                    >
                      ✕
                    </button>
                  </td>

                  {/* Date */}
                  <td className={cellPadding} onClick={() => startEdit(row.id, 'date', row.date)}>
                    {editingCell?.id === row.id && editingCell?.field === 'date' ? (
                      <input type="date" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'date')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'date')} className="h-7 w-28 bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans" autoFocus />
                    ) : (
                      <span className="h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block select-none">{row.date}</span>
                    )}
                  </td>

                  {/* Customer Name */}
                  <td className={cellPadding} onClick={() => startEdit(row.id, 'customer_name', row.customer_name)}>
                    {editingCell?.id === row.id && editingCell?.field === 'customer_name' ? (
                      <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'customer_name')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'customer_name')} className="h-7 w-full bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans" autoFocus />
                    ) : (
                      <span className="h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block select-none">{row.customer_name}</span>
                    )}
                  </td>

                  {/* Contact Info */}
                  <td className={cellPadding} onClick={() => startEdit(row.id, 'contact_info', row.contact_info)}>
                    {editingCell?.id === row.id && editingCell?.field === 'contact_info' ? (
                      <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'contact_info')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'contact_info')} className="h-7 w-full bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans" autoFocus />
                    ) : (
                      <span className="h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block select-none">{row.contact_info || 'Add contact'}</span>
                    )}
                  </td>

                  {/* Order No */}
                  <td className={cellPadding} onClick={() => startEdit(row.id, 'order_no', row.order_no)}>
                    {editingCell?.id === row.id && editingCell?.field === 'order_no' ? (
                      <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'order_no')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'order_no')} className="h-7 w-20 bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans" autoFocus />
                    ) : (
                      <span className="h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block select-none">{row.order_no}</span>
                    )}
                  </td>

                  {/* Challan No */}
                  <td className={cellPadding} onClick={() => startEdit(row.id, 'challan_no', row.challan_no)}>
                    {editingCell?.id === row.id && editingCell?.field === 'challan_no' ? (
                      <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'challan_no')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'challan_no')} className="h-7 w-24 bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans" autoFocus />
                    ) : (
                      <span className="h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block font-bold select-none">{row.challan_no}</span>
                    )}
                  </td>

                  {/* Vehicle No */}
                  <td className={cellPadding} onClick={() => startEdit(row.id, 'vehicle_no', row.vehicle_no)}>
                    {editingCell?.id === row.id && editingCell?.field === 'vehicle_no' ? (
                      <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'vehicle_no')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'vehicle_no')} className="h-7 w-20 bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans" autoFocus />
                    ) : (
                      <span className="h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block select-none">{row.vehicle_no}</span>
                    )}
                  </td>

                  {/* Finished Size Select */}
                  <td className={cellPadding}>
                    <select
                      value={row.rod_size}
                      onChange={(e) => {
                        const updated = data.map(r => r.id === row.id ? { ...r, rod_size: e.target.value } : r);
                        saveToStorage(updated);
                      }}
                      className="bg-transparent border-0 focus:outline-none py-0.5 text-xs font-sans text-amber-650 font-bold"
                    >
                      {sizes.map((s, i) => <option key={i} value={s}>{s}</option>)}
                    </select>
                  </td>

                  {/* Dispatch Qty (KG) */}
                  <td className={`${cellPadding} text-right font-semibold`} onClick={() => startEdit(row.id, 'dispatch_qty_kg', row.dispatch_qty_kg)}>
                    {editingCell?.id === row.id && editingCell?.field === 'dispatch_qty_kg' ? (
                      <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'dispatch_qty_kg')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'dispatch_qty_kg')} className="h-7 w-20 text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans" autoFocus />
                    ) : (
                      <span className="h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block text-[#B48F48] select-none">{row.dispatch_qty_kg.toLocaleString()}</span>
                    )}
                  </td>

                  {/* Rate/KG */}
                  <td className={`${cellPadding} text-right`} onClick={() => startEdit(row.id, 'rate_per_kg', row.rate_per_kg)}>
                    {editingCell?.id === row.id && editingCell?.field === 'rate_per_kg' ? (
                      <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'rate_per_kg')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'rate_per_kg')} className="h-7 w-16 text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans" autoFocus />
                    ) : (
                      <span className="h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block select-none">৳{row.rate_per_kg}</span>
                    )}
                  </td>

                  {/* Invoice Value (Calculated) */}
                  <td className={`${cellPadding} text-right font-black text-emerald-600`}>
                    <span className="h-7 flex items-center justify-end px-1 select-none">৳{row.total_sales_value.toLocaleString()}</span>
                  </td>

                  {/* Payment Status Dropdown */}
                  <td className={cellPadding}>
                    <select
                      value={row.payment_status}
                      onChange={(e) => {
                        const updated = data.map(r => r.id === row.id ? { ...r, payment_status: e.target.value as any } : r);
                        saveToStorage(updated);
                      }}
                      className="bg-transparent border-0 focus:outline-none py-0.5 text-xs font-sans font-bold"
                    >
                      {paymentModes.map((m, i) => <option key={i} value={m}>{m}</option>)}
                    </select>
                  </td>

                  {/* Dynamic Columns */}
                  {customCols.map(col => (
                    <td key={col} className={`${cellPadding} bg-amber-50/10`} onClick={() => startEdit(row.id, col, row.customValues?.[col] || '', true)}>
                      {editingCell?.id === row.id && editingCell?.field === col && editingCell?.isCustom ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, col, true)} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, col, true)} className="h-7 w-20 bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans" autoFocus />
                      ) : (
                        <span className="h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block min-h-[1.2rem] select-none">{row.customValues?.[col] || ''}</span>
                      )}
                    </td>
                  ))}

                </tr>
              ))}
            </tbody>

            {/* Table Summary Footer */}
            <tfoot>
              <tr className="bg-slate-50 font-semibold border-t-2 border-slate-200 text-xs">
                <td className={cellPadding} colSpan={8}>Totals</td>
                <td className={`${cellPadding} text-right font-bold text-[#B48F48]`}>{totalQty.toLocaleString()} kg</td>
                <td></td>
                <td className={`${cellPadding} text-right font-black text-emerald-600`}>৳{totalSales.toLocaleString()}</td>
                <td colSpan={1 + customCols.length}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  );
}
