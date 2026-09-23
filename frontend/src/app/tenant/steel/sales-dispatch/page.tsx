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

  const handleSort = (field: keyof DispatchRow) => {
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
            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
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
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#B48F48] uppercase tracking-wider font-mono mb-1.5">
            <span>Commercial & Logistics</span>
            <span>•</span>
            <span>Dispatch & Billing Control</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">Sales & Dispatch Ledger</h1>
          <p className="text-sm text-slate-500 font-sans mt-0.5">Outbound finished rebar dispatches, customer challan generation, price realization, and invoice statuses.</p>
        </div>
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <button 
            onClick={handleAddColumn}
            className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center space-x-2"
          >
            <span>+ Add Column</span>
          </button>
          <button 
            onClick={handleExportExcel}
            className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export XLS</span>
          </button>
          <button 
            onClick={handleAddRow}
            className="flex-1 md:flex-none px-5 py-2.5 bg-[#B48F48] hover:bg-[#9E7A37] text-white text-sm font-semibold rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>+ Log Dispatch</span>
          </button>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Total Dispatched</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-amber-50 text-amber-700 border border-amber-200">24h Volume</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono tracking-tight text-slate-900">{(totalQty / 1000).toFixed(1)}</span>
            <span className="text-xs text-slate-400 font-mono">Metric Tons</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Total Sales Invoiced</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">Revenue</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono tracking-tight text-slate-900">৳{(totalSales / 1000000).toFixed(2)}M</span>
            <span className="text-xs text-emerald-600 font-mono font-medium">BDT Gross</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Avg Realization Price</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-blue-50 text-blue-700 border border-blue-200">Per KG</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono tracking-tight text-slate-900">
              ৳{totalQty > 0 ? (totalSales / totalQty).toFixed(2) : '94.50'}
            </span>
            <span className="text-xs text-slate-400 font-mono">BDT / kg</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Paid Clearance</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">Collections</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono tracking-tight text-emerald-600">
              {filteredData.length > 0 ? Math.round((filteredData.filter(r => r.payment_status === 'Paid').length / filteredData.length) * 100) : 100}%
            </span>
            <span className="text-xs text-emerald-600 font-mono font-medium">Paid & Cleared</span>
          </div>
        </div>
      </div>

      {/* Spreadsheet Control Search */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white border border-slate-200/90 p-4 rounded-2xl shadow-xs">
        <input 
          type="text" 
          placeholder="Filter by Customer Name, or Challan No..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-white border border-slate-300 text-sm px-3.5 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059] font-sans text-slate-900"
        />
        <select 
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="bg-white border border-slate-300 text-sm px-3.5 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059] font-sans text-slate-900"
        >
          <option value="">All Payment Modes</option>
          {paymentModes.map((m, idx) => <option key={idx} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Full-Screen Sheet Grid Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1300px] table-fixed">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase font-mono text-slate-500 select-none">
                <th className={`w-14 text-center ${cellPadding}`}>Actions</th>
                <th className={`w-32 ${cellPadding} cursor-pointer hover:text-slate-900 transition-colors`} onClick={() => handleSort('date')}>
                  Date {sortField === 'date' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th className={`w-48 ${cellPadding}`}>
                  Customer Name
                </th>
                <th className={`w-36 ${cellPadding}`}>Contact Info</th>
                <th className={`w-32 ${cellPadding}`}>Order No</th>
                <th className={`w-36 ${cellPadding}`}>
                  Challan No
                </th>
                <th className={`w-32 ${cellPadding}`}>Vehicle No</th>
                <th className={`w-28 ${cellPadding}`}>Finished Size</th>
                <th className={`w-36 ${cellPadding} text-right`}>
                  Dispatch Qty (KG)
                </th>
                <th className={`w-32 ${cellPadding} text-right`}>
                  Rate/KG
                </th>
                <th className={`w-36 ${cellPadding} text-right text-emerald-700 font-bold`}>
                  Total Sales (BDT)
                </th>
                <th className={`w-36 ${cellPadding}`}>Payment Status</th>

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

                  {/* Customer Name */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center">
                      {editingCell?.id === row.id && editingCell?.field === 'customer_name' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'customer_name')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'customer_name')} className="absolute inset-0 w-full h-full bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10" autoFocus />
                      ) : (
                        <span className="w-full h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block select-none" onClick={() => startEdit(row.id, 'customer_name', row.customer_name)}>{row.customer_name}</span>
                      )}
                    </div>
                  </td>

                  {/* Contact Info */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center">
                      {editingCell?.id === row.id && editingCell?.field === 'contact_info' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'contact_info')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'contact_info')} className="absolute inset-0 w-full h-full bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10" autoFocus />
                      ) : (
                        <span className="w-full h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block select-none" onClick={() => startEdit(row.id, 'contact_info', row.contact_info)}>{row.contact_info || 'Add contact'}</span>
                      )}
                    </div>
                  </td>

                  {/* Order No */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center">
                      {editingCell?.id === row.id && editingCell?.field === 'order_no' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'order_no')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'order_no')} className="absolute inset-0 w-full h-full bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10" autoFocus />
                      ) : (
                        <span className="w-full h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block select-none" onClick={() => startEdit(row.id, 'order_no', row.order_no)}>{row.order_no}</span>
                      )}
                    </div>
                  </td>

                  {/* Challan No */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center">
                      {editingCell?.id === row.id && editingCell?.field === 'challan_no' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'challan_no')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'challan_no')} className="absolute inset-0 w-full h-full bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10" autoFocus />
                      ) : (
                        <span className="w-full h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block select-none font-bold" onClick={() => startEdit(row.id, 'challan_no', row.challan_no)}>{row.challan_no}</span>
                      )}
                    </div>
                  </td>

                  {/* Vehicle No */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center">
                      {editingCell?.id === row.id && editingCell?.field === 'vehicle_no' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'vehicle_no')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'vehicle_no')} className="absolute inset-0 w-full h-full bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10" autoFocus />
                      ) : (
                        <span className="w-full h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block select-none" onClick={() => startEdit(row.id, 'vehicle_no', row.vehicle_no)}>{row.vehicle_no}</span>
                      )}
                    </div>
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
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center justify-end text-right">
                      {editingCell?.id === row.id && editingCell?.field === 'dispatch_qty_kg' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'dispatch_qty_kg')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'dispatch_qty_kg')} className="absolute inset-0 w-full h-full text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10" autoFocus />
                      ) : (
                        <span className="w-full h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block text-[#B48F48] select-none font-semibold" onClick={() => startEdit(row.id, 'dispatch_qty_kg', row.dispatch_qty_kg)}>{row.dispatch_qty_kg.toLocaleString()}</span>
                      )}
                    </div>
                  </td>

                  {/* Rate/KG */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center justify-end text-right">
                      {editingCell?.id === row.id && editingCell?.field === 'rate_per_kg' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'rate_per_kg')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'rate_per_kg')} className="absolute inset-0 w-full h-full text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10" autoFocus />
                      ) : (
                        <span className="w-full h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block select-none" onClick={() => startEdit(row.id, 'rate_per_kg', row.rate_per_kg)}>৳{row.rate_per_kg}</span>
                      )}
                    </div>
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
