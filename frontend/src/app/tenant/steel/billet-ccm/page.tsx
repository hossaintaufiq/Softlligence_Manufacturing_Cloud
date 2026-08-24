'use client';
import { exportToExcel } from '@/lib/excelExport';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface BilletRow {
  id: number;
  date: string;
  furnace_no: string;
  heat_no: string;
  billet_size_section: string;
  steel_tapped_input_kg: number;
  billet_output_kg: number;
  scull_loss_kg: number;
  billet_yield_pct: number;
  billet_stock_kg: number;
  customValues?: Record<string, string>;
}

const STORAGE_KEY = 'steel_erp_billet';

const initialBilletData: BilletRow[] = [
  { id: 1, date: '2026-08-20', furnace_no: 'Furnace 01', heat_no: 'H-260820A', billet_size_section: '100x100mm x 6m', steel_tapped_input_kg: 10800, billet_output_kg: 10500, scull_loss_kg: 300, billet_yield_pct: 97.22, billet_stock_kg: 50000 },
  { id: 2, date: '2026-08-21', furnace_no: 'Furnace 01', heat_no: 'H-260821A', billet_size_section: '130x130mm x 6m', steel_tapped_input_kg: 11440, billet_output_kg: 11100, scull_loss_kg: 340, billet_yield_pct: 97.03, billet_stock_kg: 61100 },
  { id: 3, date: '2026-08-22', furnace_no: 'Furnace 02', heat_no: 'H-260822A', billet_size_section: '100x100mm x 6m', steel_tapped_input_kg: 10465, billet_output_kg: 10200, scull_loss_kg: 265, billet_yield_pct: 97.47, billet_stock_kg: 71300 }
];

export default function BilletCCMPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';

  const [data, setData] = useState<BilletRow[]>([]);
  const [customCols, setCustomCols] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [sortField, setSortField] = useState<keyof BilletRow>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

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
  const sizes = ['100x100mm x 6m', '130x130mm x 6m', '150x150mm x 6m'];

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch {
        setData(initialBilletData);
      }
    } else {
      setData(initialBilletData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialBilletData));
    }

    const storedCols = localStorage.getItem(`${STORAGE_KEY}_cols`);
    if (storedCols) {
      try { setCustomCols(JSON.parse(storedCols)); } catch {}
    }
  }, []);

  const saveToStorage = (updated: BilletRow[], cols = customCols) => {
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

  const handleSort = (field: keyof BilletRow) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  // Helper to lookup furnace log details automatically based on heat_no
  const lookupFurnaceLog = (heatNo: string) => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('steel_erp_furnace');
      if (stored) {
        try {
          const furnaceData = JSON.parse(stored);
          const found = furnaceData.find((f: any) => f.heat_no.toLowerCase() === heatNo.toLowerCase().trim());
          if (found) {
            return {
              furnace_no: found.furnace_no,
              steel_tapped_input_kg: Number(found.liquid_steel_tapped_kg)
            };
          }
        } catch {}
      }
    }
    return null;
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
    const prevStock = data.length > 0 ? data[data.length - 1].billet_stock_kg : 40000;
    const newRow: BilletRow = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      furnace_no: 'Furnace 01',
      heat_no: 'H-2608' + String.fromCharCode(65 + (data.length % 26)) + 'A',
      billet_size_section: '100x100mm x 6m',
      steel_tapped_input_kg: 0,
      billet_output_kg: 0,
      scull_loss_kg: 0,
      billet_yield_pct: 0,
      billet_stock_kg: prevStock,
      customValues: {}
    };
    saveToStorage([...data, newRow]);
  };

  // Delete Row via Custom Modal Confirm Dialog
  const handleDeleteRow = (id: number) => {
    setDialog({
      type: 'confirm',
      title: 'Confirm Delete',
      message: 'Are you sure you want to permanently delete this billet CCM casting record?',
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
      : data[0][field as keyof BilletRow];

    const updated = data.map((row, idx) => {
      if (idx === 0) return row;
      if (isCustom) {
        return {
          ...row,
          customValues: { ...(row.customValues || {}), [field]: String(firstVal) }
        };
      } else {
        const baseRow = { ...row, [field]: firstVal };
        
        // Auto resolve furnace details if heat_no changed
        if (field === 'heat_no') {
          const resolved = lookupFurnaceLog(String(firstVal));
          if (resolved) {
            baseRow.furnace_no = resolved.furnace_no;
            baseRow.steel_tapped_input_kg = resolved.steel_tapped_input_kg;
          }
        }

        const input = Number(baseRow.steel_tapped_input_kg);
        const output = Number(baseRow.billet_output_kg);
        baseRow.scull_loss_kg = Math.max(0, input - output);
        baseRow.billet_yield_pct = input > 0 ? parseFloat(((output / input) * 100).toFixed(2)) : 0;
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
          if (field === 'steel_tapped_input_kg' || field === 'billet_output_kg' || field === 'scull_loss_kg' || field === 'billet_yield_pct' || field === 'billet_stock_kg') {
            val = Number(evaluated);
            if (isNaN(val)) val = row[field as keyof BilletRow] || 0;
          }
          const baseRow = { ...row, [field]: val };
          
          // Auto resolve if heat_no updated
          if (field === 'heat_no') {
            const resolved = lookupFurnaceLog(String(evaluated));
            if (resolved) {
              baseRow.furnace_no = resolved.furnace_no;
              baseRow.steel_tapped_input_kg = resolved.steel_tapped_input_kg;
            }
          }

          const input = Number(baseRow.steel_tapped_input_kg);
          const output = Number(baseRow.billet_output_kg);
          baseRow.scull_loss_kg = Math.max(0, input - output);
          baseRow.billet_yield_pct = input > 0 ? parseFloat(((output / input) * 100).toFixed(2)) : 0;
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
    const headers = ['Date', 'Furnace No', 'Heat No', 'Billet Size', 'Steel Tapped/Input (KG)', 'Production Output (KG)', 'Scrap/Skull Loss (KG)', 'Billet Yield (%)', 'Running Billet Stock (KG)', ...customHeaders];
    
    const rows = filteredData.map(r => [
      r.date, r.furnace_no, r.heat_no, r.billet_size_section, r.steel_tapped_input_kg, r.billet_output_kg, r.scull_loss_kg, r.billet_yield_pct, r.billet_stock_kg,
      ...(customCols.map(col => r.customValues?.[col] || ''))
    ]);
    exportToExcel(headers, rows, 'ccm_billet_ledger');
  };

  const filteredData = data
    .filter(row => {
      const matchesSearch = row.heat_no.toLowerCase().includes(search.toLowerCase());
      const matchesSize = sizeFilter ? row.billet_size_section === sizeFilter : true;
      return matchesSearch && matchesSize;
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
  const totalInput = filteredData.reduce((sum, r) => sum + r.steel_tapped_input_kg, 0);
  const totalOutput = filteredData.reduce((sum, r) => sum + r.billet_output_kg, 0);
  const totalLoss = Math.max(0, totalInput - totalOutput);
  const avgYield = totalInput > 0 ? parseFloat(((totalOutput / totalInput) * 100).toFixed(2)) : 0;

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      
      {/* Custom Modal Dialog Box */}
      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xl w-full max-w-md space-y-4 animate-scale-in">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-mono border-b border-slate-100 pb-2">
              {dialog.title}
            </h3>
            <p className="text-xs text-slate-650 font-sans leading-relaxed">
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
          <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wider font-mono">Billet CCM Casting Ledger</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Logs billet continuous casting machine lengths, output yields, refractory skull losses, and running yard stock levels.</p>
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
          placeholder="Filter by Heat No..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none"
        />
        <select 
          value={sizeFilter}
          onChange={(e) => setSizeFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none"
        >
          <option value="">All Sizes</option>
          {sizes.map((s, idx) => <option key={idx} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Full-Screen Sheet Grid Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-150 text-[10px] uppercase font-mono text-slate-400 select-none">
                <th className={`w-14 text-center ${cellPadding}`}>Actions</th>
                <th className={`${cellPadding} cursor-pointer hover:bg-slate-100`} onClick={() => handleSort('date')}>
                  Date {sortField === 'date' && (sortDir === 'asc' ? '▲' : '▼')}
                </th>
                <th className={`${cellPadding}`}>
                  Furnace No <button onClick={() => handleFillDown('furnace_no')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                </th>
                <th className={`${cellPadding} cursor-pointer hover:bg-slate-100`} onClick={() => handleSort('heat_no')}>
                  Heat No <button onClick={() => handleFillDown('heat_no')} title="Fill Down & Auto Lookup" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                </th>
                <th className={`${cellPadding}`}>Billet Size</th>
                <th className={`${cellPadding} text-right`}>
                  Steel Tapped/Input (KG) <button onClick={() => handleFillDown('steel_tapped_input_kg')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                </th>
                <th className={`${cellPadding} text-right`}>
                  Production Output (KG) <button onClick={() => handleFillDown('billet_output_kg')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                </th>
                <th className={`${cellPadding} text-right text-rose-500`}>Scrap/Skull Loss (KG)</th>
                <th className={`${cellPadding} text-right`}>Billet Yield %</th>
                <th className={`${cellPadding} text-right`}>
                  Running Billet Stock (KG) <button onClick={() => handleFillDown('billet_stock_kg')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                </th>

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
                  
                  {/* Action Delete */}
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

                  {/* Furnace No */}
                  <td className={cellPadding} onClick={() => startEdit(row.id, 'furnace_no', row.furnace_no)}>
                    {editingCell?.id === row.id && editingCell?.field === 'furnace_no' ? (
                      <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'furnace_no')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'furnace_no')} className="h-7 w-24 bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans" autoFocus />
                    ) : (
                      <span className="h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block select-none">{row.furnace_no}</span>
                    )}
                  </td>

                  {/* Heat No */}
                  <td className={cellPadding} onClick={() => startEdit(row.id, 'heat_no', row.heat_no)}>
                    {editingCell?.id === row.id && editingCell?.field === 'heat_no' ? (
                      <input 
                        type="text" 
                        value={editValue} 
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => saveInlineEdit(row.id, 'heat_no')} 
                        onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'heat_no')} 
                        className="h-7 w-24 bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans" 
                        autoFocus 
                      />
                    ) : (
                      <span className="h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block font-bold text-slate-900 select-none" title="Auto-looks up furnace logs">{row.heat_no}</span>
                    )}
                  </td>

                  {/* Billet Size Select */}
                  <td className={cellPadding}>
                    <select
                      value={row.billet_size_section}
                      onChange={(e) => {
                        const updated = data.map(r => r.id === row.id ? { ...r, billet_size_section: e.target.value } : r);
                        saveToStorage(updated);
                      }}
                      className="bg-transparent border-0 focus:outline-none py-0.5 text-xs font-sans"
                    >
                      {sizes.map((s, i) => <option key={i} value={s}>{s}</option>)}
                    </select>
                  </td>

                  {/* Steel Tapped/Input (KG) */}
                  <td className={`${cellPadding} text-right`} onClick={() => startEdit(row.id, 'steel_tapped_input_kg', row.steel_tapped_input_kg)}>
                    {editingCell?.id === row.id && editingCell?.field === 'steel_tapped_input_kg' ? (
                      <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'steel_tapped_input_kg')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'steel_tapped_input_kg')} className="h-7 w-20 text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans" autoFocus />
                    ) : (
                      <span className="h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block select-none">{row.steel_tapped_input_kg.toLocaleString()}</span>
                    )}
                  </td>

                  {/* Production Output (KG) */}
                  <td className={`${cellPadding} text-right font-semibold`} onClick={() => startEdit(row.id, 'billet_output_kg', row.billet_output_kg)}>
                    {editingCell?.id === row.id && editingCell?.field === 'billet_output_kg' ? (
                      <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'billet_output_kg')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'billet_output_kg')} className="h-7 w-20 text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans" autoFocus />
                    ) : (
                      <span className="h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block text-[#B48F48] select-none">{row.billet_output_kg.toLocaleString()}</span>
                    )}
                  </td>

                  {/* Scrap Skull Loss (KG) (Calculated) */}
                  <td className={`${cellPadding} text-right text-rose-650 font-bold bg-rose-50/20`}>
                    <span className="h-7 flex items-center justify-end px-1 select-none">{row.scull_loss_kg.toLocaleString()}</span>
                  </td>

                  {/* Billet Yield (Calculated) */}
                  <td className={`${cellPadding} text-right font-black text-rose-600`}>
                    <span className="h-7 flex items-center justify-end px-1 select-none">{row.billet_yield_pct}%</span>
                  </td>

                  {/* Running Billet Stock (KG) */}
                  <td className={`${cellPadding} text-right font-black text-emerald-600`} onClick={() => startEdit(row.id, 'billet_stock_kg', row.billet_stock_kg)}>
                    {editingCell?.id === row.id && editingCell?.field === 'billet_stock_kg' ? (
                      <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'billet_stock_kg')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'billet_stock_kg')} className="h-7 w-24 text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans" autoFocus />
                    ) : (
                      <span className="h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block select-none">{row.billet_stock_kg.toLocaleString()}</span>
                    )}
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

            {/* Summary Footer */}
            <tfoot>
              <tr className="bg-slate-50 font-semibold border-t-2 border-slate-200 text-xs">
                <td className={cellPadding} colSpan={5}>Totals & Averages</td>
                <td className={`${cellPadding} text-right font-bold`}>{totalInput.toLocaleString()} kg</td>
                <td className={`${cellPadding} text-right font-bold text-emerald-600`}>{totalOutput.toLocaleString()} kg</td>
                <td className={`${cellPadding} text-right font-bold text-rose-650 bg-rose-50/20`}>{totalLoss.toLocaleString()} kg</td>
                <td className={`${cellPadding} text-right font-black text-rose-600`}>{avgYield}%</td>
                <td colSpan={1 + customCols.length}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  );
}
