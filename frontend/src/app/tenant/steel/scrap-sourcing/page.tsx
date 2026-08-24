'use client';
import { exportToExcel } from '@/lib/excelExport';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface ScrapRow {
  id: number;
  date: string;
  supplier_name: string;
  scrap_category: string;
  scrap_rcv_kg: number;
  truck_no: string;
  gross_weight: number;
  value_tare: number;
  rate_per_kg: number;
  total_cost: number;
  yard_location: string;
  customValues?: Record<string, string>;
}

const STORAGE_KEY = 'steel_erp_scrap';

const initialScrapData: ScrapRow[] = [
  { id: 1, date: '2026-08-20', supplier_name: 'Metal Recyclers Corp', scrap_category: 'LC Scrap', scrap_rcv_kg: 15000, truck_no: 'TR-1024', gross_weight: 24500, value_tare: 9500, rate_per_kg: 42, total_cost: 630000, yard_location: 'Bay A' },
  { id: 2, date: '2026-08-21', supplier_name: 'Apex Scrap Suppliers', scrap_category: 'Rolling Kechi', scrap_rcv_kg: 12800, truck_no: 'TR-8812', gross_weight: 22000, value_tare: 9200, rate_per_kg: 44, total_cost: 563200, yard_location: 'Bay B' },
  { id: 3, date: '2026-08-22', supplier_name: 'Alpha Alloys', scrap_category: 'Plate Cutting', scrap_rcv_kg: 9500, truck_no: 'TR-5034', gross_weight: 18500, value_tare: 9000, rate_per_kg: 40, total_cost: 380000, yard_location: 'Bay A' }
];

export default function ScrapSourcingPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';

  const [data, setData] = useState<ScrapRow[]>([]);
  const [customCols, setCustomCols] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortField, setSortField] = useState<keyof ScrapRow>('date');
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
  const categories = ['LC Scrap', 'Rolling Kechi', 'Tin Bundle', 'Plate Cutting', 'Heavy Melting', 'Others'];

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setData(parsed);
      } catch {
        setData(initialScrapData);
      }
    } else {
      setData(initialScrapData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialScrapData));
    }

    const storedCols = localStorage.getItem(`${STORAGE_KEY}_cols`);
    if (storedCols) {
      try { setCustomCols(JSON.parse(storedCols)); } catch {}
    }
  }, []);

  const saveToStorage = (updated: ScrapRow[], cols = customCols) => {
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

  const handleSort = (field: keyof ScrapRow) => {
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
    const newRow: ScrapRow = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      supplier_name: 'New Supplier',
      scrap_category: 'LC Scrap',
      scrap_rcv_kg: 0,
      truck_no: 'TR-' + Math.floor(1000 + Math.random() * 9000),
      gross_weight: 0,
      value_tare: 0,
      rate_per_kg: 0,
      total_cost: 0,
      yard_location: 'Bay A',
      customValues: {}
    };
    saveToStorage([...data, newRow]);
  };

  // Delete Row via Custom Modal Dialog
  const handleDeleteRow = (id: number) => {
    setDialog({
      type: 'confirm',
      title: 'Confirm Delete',
      message: 'Are you sure you want to permanently delete this scrap sourcing record?',
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
      : data[0][field as keyof ScrapRow];

    const updated = data.map((row, idx) => {
      if (idx === 0) return row;
      if (isCustom) {
        return {
          ...row,
          customValues: { ...(row.customValues || {}), [field]: String(firstVal) }
        };
      } else {
        const baseRow = { ...row, [field]: firstVal };
        const gross = Number(baseRow.gross_weight);
        const tare = Number(baseRow.value_tare);
        const rcv = Math.max(0, gross - tare) || Number(baseRow.scrap_rcv_kg);
        const rate = Number(baseRow.rate_per_kg);
        baseRow.scrap_rcv_kg = rcv;
        baseRow.total_cost = rcv * rate;
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
          if (field === 'scrap_rcv_kg' || field === 'gross_weight' || field === 'value_tare' || field === 'rate_per_kg') {
            val = Number(evaluated);
            if (isNaN(val)) val = row[field as keyof ScrapRow] || 0;
          }
          const baseRow = { ...row, [field]: val };
          const gross = Number(baseRow.gross_weight);
          const tare = Number(baseRow.value_tare);
          const rcv = (field === 'gross_weight' || field === 'value_tare') 
            ? Math.max(0, gross - tare) 
            : Number(baseRow.scrap_rcv_kg);
          const rate = Number(baseRow.rate_per_kg);
          
          baseRow.scrap_rcv_kg = rcv;
          baseRow.total_cost = rcv * rate;
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
    const headers = ['Date', 'Supplier Name', 'Scrap Category', 'Scrap Received (kg)', 'Challan/Truck No', 'Gross Weight (kg)', 'Tare Weight (kg)', 'Rate/kg', 'Total Cost', 'Yard Location', ...customHeaders];
    
    const rows = filteredData.map(r => [
      r.date, r.supplier_name, r.scrap_category, r.scrap_rcv_kg, r.truck_no, r.gross_weight, r.value_tare, r.rate_per_kg, r.total_cost, r.yard_location,
      ...(customCols.map(col => r.customValues?.[col] || ''))
    ]);
    exportToExcel(headers, rows, 'scrap_procurement_ledger');
  };

  const filteredData = data
    .filter(row => {
      const matchesSearch = row.supplier_name.toLowerCase().includes(search.toLowerCase()) ||
                            row.truck_no.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter ? row.scrap_category === categoryFilter : true;
      return matchesSearch && matchesCategory;
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
  const totalRcv = filteredData.reduce((sum, r) => sum + r.scrap_rcv_kg, 0);
  const totalCost = filteredData.reduce((sum, r) => sum + r.total_cost, 0);

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      
      {/* Custom Modal Dialog Window */}
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
          <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wider font-mono">Scrap Sourcing Sheet</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Logs inbound raw scrap party details, received weight compliance, rates, and unloading bay locations.</p>
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
          placeholder="Filter by Supplier Name, or Challan/Truck No..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none"
        />
        <select 
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((c, idx) => <option key={idx} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Full-Screen Sheet Grid Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1250px] table-fixed">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-150 text-[10px] uppercase font-mono text-slate-400 select-none">
                <th className={`w-14 text-center ${cellPadding}`}>Actions</th>
                <th className={`w-32 ${cellPadding} cursor-pointer hover:bg-slate-100`} onClick={() => handleSort('date')}>
                  Date {sortField === 'date' && (sortDir === 'asc' ? '▲' : '▼')}
                </th>
                <th className={`w-52 ${cellPadding}`}>
                  Supplier Name <button onClick={() => handleFillDown('supplier_name')} title="Fill Down First Row Value" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                </th>
                <th className={`w-40 ${cellPadding}`}>Scrap Category</th>
                <th className={`w-36 ${cellPadding} text-right`}>
                  Rcv Weight (KG) <button onClick={() => handleFillDown('scrap_rcv_kg')} title="Fill Down First Row Value" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                </th>
                <th className={`w-36 ${cellPadding}`}>
                  Challan/Truck No <button onClick={() => handleFillDown('truck_no')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                </th>
                <th className={`w-32 ${cellPadding} text-right`}>
                  Gross (KG) <button onClick={() => handleFillDown('gross_weight')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                </th>
                <th className={`w-32 ${cellPadding} text-right`}>
                  Tare (KG) <button onClick={() => handleFillDown('value_tare')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                </th>
                <th className={`w-28 ${cellPadding} text-right`}>
                  Rate/KG <button onClick={() => handleFillDown('rate_per_kg')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                </th>
                <th className={`w-36 ${cellPadding} text-right`}>Total Cost</th>
                <th className={`w-32 ${cellPadding}`}>
                  Yard Location <button onClick={() => handleFillDown('yard_location')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                </th>
                
                {/* Dynamic Columns */}
                {customCols.map(col => (
                  <th key={col} className={`w-32 ${cellPadding} text-slate-600 bg-amber-50/30`}>
                    {col} <button onClick={() => handleFillDown(col, true)} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={11 + customCols.length} className="text-center py-8 text-xs text-slate-400 font-mono">No records found.</td>
                </tr>
              ) : filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/40 transition-colors h-9">
                  
                  {/* Inline Delete Button */}
                  <td className="w-14 text-center py-1">
                    <button 
                      onClick={() => handleDeleteRow(row.id)}
                      className="text-red-500 hover:text-red-750 font-bold text-xs"
                      title="Delete Row"
                    >
                      ✕
                    </button>
                  </td>

                  {/* Date Column */}
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

                  {/* Supplier Name Column */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center">
                      {editingCell?.id === row.id && editingCell?.field === 'supplier_name' ? (
                        <input 
                          type="text" 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveInlineEdit(row.id, 'supplier_name')}
                          onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'supplier_name')}
                          className="absolute inset-0 w-full h-full bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10"
                          autoFocus
                        />
                      ) : (
                        <span className="w-full h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block select-none" onClick={() => startEdit(row.id, 'supplier_name', row.supplier_name)}>{row.supplier_name}</span>
                      )}
                    </div>
                  </td>

                  {/* Scrap Category select */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center">
                      <select
                        value={row.scrap_category}
                        onChange={(e) => {
                          const updated = data.map(r => r.id === row.id ? { ...r, scrap_category: e.target.value } : r);
                          saveToStorage(updated);
                        }}
                        className="w-full bg-transparent text-xs py-0.5 font-sans border-0 focus:outline-none font-bold text-[#B48F48] truncate"
                      >
                        {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </td>

                  {/* Received Weight (Calculated/Editable) */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center justify-end text-right">
                      {editingCell?.id === row.id && editingCell?.field === 'scrap_rcv_kg' ? (
                        <input 
                          type="text" 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveInlineEdit(row.id, 'scrap_rcv_kg')}
                          onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'scrap_rcv_kg')}
                          className="absolute inset-0 w-full h-full text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10"
                          autoFocus
                        />
                      ) : (
                        <span className="w-full h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block select-none font-semibold" onClick={() => startEdit(row.id, 'scrap_rcv_kg', row.scrap_rcv_kg)}>{row.scrap_rcv_kg.toLocaleString()}</span>
                      )}
                    </div>
                  </td>

                  {/* Challan/Truck No */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center">
                      {editingCell?.id === row.id && editingCell?.field === 'truck_no' ? (
                        <input 
                          type="text" 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveInlineEdit(row.id, 'truck_no')}
                          onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'truck_no')}
                          className="absolute inset-0 w-full h-full bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10"
                          autoFocus
                        />
                      ) : (
                        <span className="w-full h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block select-none" onClick={() => startEdit(row.id, 'truck_no', row.truck_no)}>{row.truck_no}</span>
                      )}
                    </div>
                  </td>

                  {/* Gross Weight */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center justify-end text-right">
                      {editingCell?.id === row.id && editingCell?.field === 'gross_weight' ? (
                        <input 
                          type="text" 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveInlineEdit(row.id, 'gross_weight')}
                          onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'gross_weight')}
                          className="absolute inset-0 w-full h-full text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10"
                          autoFocus
                        />
                      ) : (
                        <span className="w-full h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block select-none" onClick={() => startEdit(row.id, 'gross_weight', row.gross_weight)}>{row.gross_weight.toLocaleString()}</span>
                      )}
                    </div>
                  </td>

                  {/* Tare Weight */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center justify-end text-right">
                      {editingCell?.id === row.id && editingCell?.field === 'value_tare' ? (
                        <input 
                          type="text" 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveInlineEdit(row.id, 'value_tare')}
                          onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'value_tare')}
                          className="absolute inset-0 w-full h-full text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10"
                          autoFocus
                        />
                      ) : (
                        <span className="w-full h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block select-none" onClick={() => startEdit(row.id, 'value_tare', row.value_tare)}>{row.value_tare.toLocaleString()}</span>
                      )}
                    </div>
                  </td>

                  {/* Rate per KG */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center justify-end text-right">
                      {editingCell?.id === row.id && editingCell?.field === 'rate_per_kg' ? (
                        <input 
                          type="text" 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveInlineEdit(row.id, 'rate_per_kg')}
                          onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'rate_per_kg')}
                          className="absolute inset-0 w-full h-full text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10"
                          autoFocus
                        />
                      ) : (
                        <span className="w-full h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block select-none" onClick={() => startEdit(row.id, 'rate_per_kg', row.rate_per_kg)}>৳{row.rate_per_kg}</span>
                      )}
                    </div>
                  </td>

                  {/* Total Cost (Calculated) */}
                  <td className={`${cellPadding} text-right font-bold text-emerald-600`}>
                    <span className="h-7 flex items-center justify-end px-1 select-none">৳{row.total_cost.toLocaleString()}</span>
                  </td>

                  {/* Yard Location */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center">
                      {editingCell?.id === row.id && editingCell?.field === 'yard_location' ? (
                        <input 
                          type="text" 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveInlineEdit(row.id, 'yard_location')}
                          onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'yard_location')}
                          className="absolute inset-0 w-full h-full bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10"
                          autoFocus
                        />
                      ) : (
                        <span className="w-full h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block select-none" onClick={() => startEdit(row.id, 'yard_location', row.yard_location)}>{row.yard_location}</span>
                      )}
                    </div>
                  </td>

                  {/* Dynamic Column cells */}
                  {customCols.map(col => (
                    <td key={col} className={`${cellPadding} bg-amber-50/10`}>
                      <div className="relative w-full h-7 flex items-center">
                        {editingCell?.id === row.id && editingCell?.field === col && editingCell?.isCustom ? (
                          <input 
                            type="text" 
                            value={editValue} 
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => saveInlineEdit(row.id, col, true)}
                            onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, col, true)}
                            className="absolute inset-0 w-full h-full bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10"
                            autoFocus
                          />
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
                <td className={cellPadding} colSpan={4}>Totals</td>
                <td className={`${cellPadding} text-right font-bold`}>{totalRcv.toLocaleString()} kg</td>
                <td colSpan={4}></td>
                <td className={`${cellPadding} text-right font-black text-emerald-600`}>৳{totalCost.toLocaleString()}</td>
                <td colSpan={1 + customCols.length}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  );
}
