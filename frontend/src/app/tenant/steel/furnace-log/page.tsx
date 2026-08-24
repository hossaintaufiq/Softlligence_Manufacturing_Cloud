'use client';
import { exportToExcel } from '@/lib/excelExport';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface FurnaceRow {
  id: number;
  date: string;
  furnace_no: string;
  heat_no: string;
  scrap_input_kg: number;
  runtime_min: number;
  used_patching_powder_kg: number;
  used_patching_forma_kg: number;
  tapping_temp_c: number;
  liquid_steel_tapped_kg: number;
  power_consumed_kwh: number;
  shift_id: string;
  furnace_master: string;
  yield_pct: number;
  customValues?: Record<string, string>;
}

const STORAGE_KEY = 'steel_erp_furnace';

const initialFurnaceLogs: FurnaceRow[] = [
  { id: 1, date: '2026-08-20', furnace_no: 'Furnace 01', heat_no: 'H-260820A', scrap_input_kg: 12000, runtime_min: 52, used_patching_powder_kg: 150, used_patching_forma_kg: 1, tapping_temp_c: 1540, liquid_steel_tapped_kg: 10800, power_consumed_kwh: 7200, shift_id: 'A', furnace_master: 'Kabir Ahmed', yield_pct: 90.0 },
  { id: 2, date: '2026-08-21', furnace_no: 'Furnace 01', heat_no: 'H-260821A', scrap_input_kg: 13000, runtime_min: 55, used_patching_powder_kg: 180, used_patching_forma_kg: 1, tapping_temp_c: 1560, liquid_steel_tapped_kg: 11440, power_consumed_kwh: 7800, shift_id: 'B', furnace_master: 'Zahirul Haque', yield_pct: 88.0 },
  { id: 3, date: '2026-08-22', furnace_no: 'Furnace 02', heat_no: 'H-260822A', scrap_input_kg: 11500, runtime_min: 48, used_patching_powder_kg: 120, used_patching_forma_kg: 0, tapping_temp_c: 1550, liquid_steel_tapped_kg: 10465, power_consumed_kwh: 6900, shift_id: 'C', furnace_master: 'Ataur Rahman', yield_pct: 91.0 }
];

export default function FurnaceLogPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';

  const [data, setData] = useState<FurnaceRow[]>([]);
  const [customCols, setCustomCols] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [furnaceFilter, setFurnaceFilter] = useState('');
  const [sortField, setSortField] = useState<keyof FurnaceRow>('heat_no');
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
  const furnaces = ['Furnace 01', 'Furnace 02', 'Ladle Furnace LF-01'];
  const shifts = ['A', 'B', 'C', 'General'];

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch {
        setData(initialFurnaceLogs);
      }
    } else {
      setData(initialFurnaceLogs);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialFurnaceLogs));
    }

    const storedCols = localStorage.getItem(`${STORAGE_KEY}_cols`);
    if (storedCols) {
      try { setCustomCols(JSON.parse(storedCols)); } catch {}
    }
  }, []);

  const saveToStorage = (updated: FurnaceRow[], cols = customCols) => {
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

  const handleSort = (field: keyof FurnaceRow) => {
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
    const nextLetter = String.fromCharCode(65 + (data.length % 26));
    const newRow: FurnaceRow = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      furnace_no: 'Furnace 01',
      heat_no: `H-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}${nextLetter}`,
      scrap_input_kg: 0,
      runtime_min: 0,
      used_patching_powder_kg: 0,
      used_patching_forma_kg: 0,
      tapping_temp_c: 1550,
      liquid_steel_tapped_kg: 0,
      power_consumed_kwh: 0,
      shift_id: 'A',
      furnace_master: 'Supervisor',
      yield_pct: 0,
      customValues: {}
    };
    saveToStorage([...data, newRow]);
  };

  // Delete Row via Custom Modal Confirm Dialog
  const handleDeleteRow = (id: number) => {
    setDialog({
      type: 'confirm',
      title: 'Confirm Delete',
      message: 'Are you sure you want to permanently delete this furnace log record?',
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
      : data[0][field as keyof FurnaceRow];

    const updated = data.map((row, idx) => {
      if (idx === 0) return row;
      if (isCustom) {
        return {
          ...row,
          customValues: { ...(row.customValues || {}), [field]: String(firstVal) }
        };
      } else {
        const baseRow = { ...row, [field]: firstVal };
        const input = Number(baseRow.scrap_input_kg);
        const tapped = Number(baseRow.liquid_steel_tapped_kg);
        baseRow.yield_pct = input > 0 ? parseFloat(((tapped / input) * 100).toFixed(2)) : 0;
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
          if (field === 'scrap_input_kg' || field === 'runtime_min' || field === 'used_patching_powder_kg' || field === 'used_patching_forma_kg' || field === 'tapping_temp_c' || field === 'liquid_steel_tapped_kg' || field === 'power_consumed_kwh') {
            val = Number(evaluated);
            if (isNaN(val)) val = row[field as keyof FurnaceRow] || 0;
          }
          const baseRow = { ...row, [field]: val };
          const input = Number(baseRow.scrap_input_kg);
          const tapped = Number(baseRow.liquid_steel_tapped_kg);
          baseRow.yield_pct = input > 0 ? parseFloat(((tapped / input) * 100).toFixed(2)) : 0;
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
    const headers = ['Heat No', 'Date', 'Furnace No', 'Shift ID', 'Scrap Input (KG)', 'Runtime (Min)', 'Powder (KG)', 'Forma (Qty)', 'Temp (°C)', 'Steel Tapped (KG)', 'Scrap Loss (KG)', 'Power (kWh)', 'Yield (%)', ...customHeaders];
    
    const rows = filteredData.map(r => [
      r.heat_no, r.date, r.furnace_no, r.shift_id, r.scrap_input_kg, r.runtime_min, r.used_patching_powder_kg, r.used_patching_forma_kg, r.tapping_temp_c, r.liquid_steel_tapped_kg, Math.max(0, r.scrap_input_kg - r.liquid_steel_tapped_kg), r.power_consumed_kwh, r.yield_pct,
      ...(customCols.map(col => r.customValues?.[col] || ''))
    ]);
    exportToExcel(headers, rows, 'furnace_melt_logs');
  };

  const filteredData = data
    .filter(row => {
      const matchesSearch = row.heat_no.toLowerCase().includes(search.toLowerCase()) ||
                            row.furnace_master.toLowerCase().includes(search.toLowerCase());
      const matchesFurnace = furnaceFilter ? row.furnace_no === furnaceFilter : true;
      return matchesSearch && matchesFurnace;
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
  const totalInput = filteredData.reduce((sum, r) => sum + r.scrap_input_kg, 0);
  const totalTapped = filteredData.reduce((sum, r) => sum + r.liquid_steel_tapped_kg, 0);
  const totalLoss = Math.max(0, totalInput - totalTapped);
  const totalPower = filteredData.reduce((sum, r) => sum + r.power_consumed_kwh, 0);
  const avgYield = totalInput > 0 ? parseFloat(((totalTapped / totalInput) * 100).toFixed(2)) : 0;

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
          <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wider font-mono">Furnace Melting Log</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Logs electric arc/ladle refining furnace heats, patching consumables, runtimes, tapping temperatures, and power usage.</p>
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
          placeholder="Filter by Heat No, or Furnace Master..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none"
        />
        <select 
          value={furnaceFilter}
          onChange={(e) => {
            setSearch('');
            setFurnaceFilter(e.target.value);
          }}
          className="bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none"
        >
          <option value="">All Furnaces</option>
          {furnaces.map((f, idx) => <option key={idx} value={f}>{f}</option>)}
        </select>
      </div>

      {/* Full-Screen Sheet Grid Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1350px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-150 text-[10px] uppercase font-mono text-slate-400 select-none">
                <th className={`w-14 text-center ${cellPadding}`}>Actions</th>
                <th className={`${cellPadding} cursor-pointer hover:bg-slate-100`} onClick={() => handleSort('heat_no')}>
                  Heat No {sortField === 'heat_no' && (sortDir === 'asc' ? '▲' : '▼')}
                </th>
                <th className={`${cellPadding} cursor-pointer hover:bg-slate-100`} onClick={() => handleSort('date')}>Date</th>
                <th className={`${cellPadding}`}>Furnace No</th>
                <th className={`${cellPadding}`}>Shift ID</th>
                <th className={`${cellPadding} text-right`}>
                  Scrap Input (KG) <button onClick={() => handleFillDown('scrap_input_kg')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                </th>
                <th className={`${cellPadding} text-right`}>
                  Runtime (Min) <button onClick={() => handleFillDown('runtime_min')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                </th>
                <th className={`${cellPadding} text-right`}>
                  Powder (KG) <button onClick={() => handleFillDown('used_patching_powder_kg')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                </th>
                <th className={`${cellPadding} text-right`}>
                  Forma (Qty) <button onClick={() => handleFillDown('used_patching_forma_kg')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                </th>
                <th className={`${cellPadding} text-right`}>
                  Temp (°C) <button onClick={() => handleFillDown('tapping_temp_c')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                </th>
                <th className={`${cellPadding} text-right`}>
                  Steel Tapped (KG) <button onClick={() => handleFillDown('liquid_steel_tapped_kg')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                </th>
                <th className={`${cellPadding} text-right text-rose-500`}>Scrap Loss (KG)</th>
                <th className={`${cellPadding} text-right`}>
                  Power (kWh) <button onClick={() => handleFillDown('power_consumed_kwh')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                </th>
                <th className={`${cellPadding} text-right`}>Yield%</th>
                <th className={`${cellPadding}`}>
                  Master Name <button onClick={() => handleFillDown('furnace_master')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
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
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={15 + customCols.length} className="text-center py-8 text-slate-400">No records found.</td>
                </tr>
              ) : filteredData.map((row) => {
                const scrapLoss = Math.max(0, row.scrap_input_kg - row.liquid_steel_tapped_kg);
                return (
                  <tr key={row.id} className="hover:bg-slate-50/40 transition-colors h-9">
                    
                    {/* Delete Action */}
                    <td className="text-center py-1">
                      <button 
                        onClick={() => handleDeleteRow(row.id)}
                        className="text-red-500 hover:text-red-750 font-bold text-xs"
                      >
                        ✕
                      </button>
                    </td>

                    {/* Heat No */}
                    <td className={cellPadding} onClick={() => startEdit(row.id, 'heat_no', row.heat_no)}>
                      {editingCell?.id === row.id && editingCell?.field === 'heat_no' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'heat_no')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'heat_no')} className="h-7 w-24 bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans" autoFocus />
                      ) : (
                        <span className="h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block select-none font-bold text-slate-900">{row.heat_no}</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className={cellPadding} onClick={() => startEdit(row.id, 'date', row.date)}>
                      {editingCell?.id === row.id && editingCell?.field === 'date' ? (
                        <input type="date" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'date')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'date')} className="h-7 w-28 bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans" autoFocus />
                      ) : (
                        <span className="h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block select-none">{row.date}</span>
                      )}
                    </td>

                    {/* Furnace No Select */}
                    <td className={cellPadding}>
                      <select 
                        value={row.furnace_no}
                        onChange={(e) => {
                          const updated = data.map(r => r.id === row.id ? { ...r, furnace_no: e.target.value } : r);
                          saveToStorage(updated);
                        }}
                        className="bg-transparent border-0 focus:outline-none font-sans py-0.5 font-bold"
                      >
                        {furnaces.map((f, i) => <option key={i} value={f}>{f}</option>)}
                      </select>
                    </td>

                    {/* Shift ID Select */}
                    <td className={cellPadding}>
                      <select 
                        value={row.shift_id}
                        onChange={(e) => {
                          const updated = data.map(r => r.id === row.id ? { ...r, shift_id: e.target.value } : r);
                          saveToStorage(updated);
                        }}
                        className="bg-transparent border-0 focus:outline-none font-sans py-0.5 font-bold text-indigo-650"
                      >
                        {shifts.map((s, i) => <option key={i} value={s}>{s}</option>)}
                      </select>
                    </td>

                    {/* Scrap Input */}
                    <td className={`${cellPadding} text-right font-semibold`} onClick={() => startEdit(row.id, 'scrap_input_kg', row.scrap_input_kg)}>
                      {editingCell?.id === row.id && editingCell?.field === 'scrap_input_kg' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'scrap_input_kg')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'scrap_input_kg')} className="h-7 w-20 text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans" autoFocus />
                      ) : (
                        <span className="h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block select-none">{row.scrap_input_kg.toLocaleString()}</span>
                      )}
                    </td>

                    {/* Runtime (Min) */}
                    <td className={`${cellPadding} text-right`} onClick={() => startEdit(row.id, 'runtime_min', row.runtime_min)}>
                      {editingCell?.id === row.id && editingCell?.field === 'runtime_min' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'runtime_min')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'runtime_min')} className="h-7 w-20 text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans" autoFocus />
                      ) : (
                        <span className="h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block select-none">{row.runtime_min} min</span>
                      )}
                    </td>

                    {/* Powder KG */}
                    <td className={`${cellPadding} text-right`} onClick={() => startEdit(row.id, 'used_patching_powder_kg', row.used_patching_powder_kg)}>
                      {editingCell?.id === row.id && editingCell?.field === 'used_patching_powder_kg' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'used_patching_powder_kg')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'used_patching_powder_kg')} className="h-7 w-20 text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans" autoFocus />
                      ) : (
                        <span className="h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block select-none">{row.used_patching_powder_kg.toLocaleString()}</span>
                      )}
                    </td>

                    {/* Forma Qty */}
                    <td className={`${cellPadding} text-right`} onClick={() => startEdit(row.id, 'used_patching_forma_kg', row.used_patching_forma_kg)}>
                      {editingCell?.id === row.id && editingCell?.field === 'used_patching_forma_kg' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'used_patching_forma_kg')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'used_patching_forma_kg')} className="h-7 w-20 text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans" autoFocus />
                      ) : (
                        <span className="h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block select-none">{row.used_patching_forma_kg}</span>
                      )}
                    </td>

                    {/* Tapping Temp */}
                    <td className={`${cellPadding} text-right`} onClick={() => startEdit(row.id, 'tapping_temp_c', row.tapping_temp_c)}>
                      {editingCell?.id === row.id && editingCell?.field === 'tapping_temp_c' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'tapping_temp_c')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'tapping_temp_c')} className="h-7 w-20 text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans" autoFocus />
                      ) : (
                        <span className="h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block select-none">{row.tapping_temp_c}°C</span>
                      )}
                    </td>

                    {/* Steel Tapped KG */}
                    <td className={`${cellPadding} text-right font-semibold`} onClick={() => startEdit(row.id, 'liquid_steel_tapped_kg', row.liquid_steel_tapped_kg)}>
                      {editingCell?.id === row.id && editingCell?.field === 'liquid_steel_tapped_kg' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'liquid_steel_tapped_kg')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'liquid_steel_tapped_kg')} className="h-7 w-20 text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans" autoFocus />
                      ) : (
                        <span className="h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block select-none">{row.liquid_steel_tapped_kg.toLocaleString()}</span>
                      )}
                    </td>

                    {/* Scrap Loss KG (Calculated) */}
                    <td className={`${cellPadding} text-right text-rose-650 font-bold bg-rose-50/20`}>
                      <span className="h-7 flex items-center justify-end px-1 select-none">{scrapLoss.toLocaleString()}</span>
                    </td>

                    {/* Power kwh */}
                    <td className={`${cellPadding} text-right`} onClick={() => startEdit(row.id, 'power_consumed_kwh', row.power_consumed_kwh)}>
                      {editingCell?.id === row.id && editingCell?.field === 'power_consumed_kwh' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'power_consumed_kwh')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'power_consumed_kwh')} className="h-7 w-20 text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans" autoFocus />
                      ) : (
                        <span className="h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block select-none">{row.power_consumed_kwh.toLocaleString()} kWh</span>
                      )}
                    </td>

                    {/* Yield % */}
                    <td className={`${cellPadding} text-right font-black text-rose-600`}>
                      <span className="h-7 flex items-center justify-end px-1 select-none">{row.yield_pct}%</span>
                    </td>

                    {/* Master Name */}
                    <td className={cellPadding} onClick={() => startEdit(row.id, 'furnace_master', row.furnace_master)}>
                      {editingCell?.id === row.id && editingCell?.field === 'furnace_master' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'furnace_master')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'furnace_master')} className="h-7 w-28 bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans" autoFocus />
                      ) : (
                        <span className="h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block select-none">{row.furnace_master}</span>
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
                );
              })}
            </tbody>

            {/* Table Summary Footer */}
            <tfoot>
              <tr className="bg-slate-50 font-semibold border-t-2 border-slate-200 text-xs">
                <td className={cellPadding} colSpan={5}>Totals & Averages</td>
                <td className={`${cellPadding} text-right font-bold`}>{totalInput.toLocaleString()} kg</td>
                <td colSpan={4}></td>
                <td className={`${cellPadding} text-right font-bold text-emerald-600`}>{totalTapped.toLocaleString()} kg</td>
                <td className={`${cellPadding} text-right font-bold text-rose-655 bg-rose-50/20`}>{totalLoss.toLocaleString()} kg</td>
                <td className={`${cellPadding} text-right font-bold`}>{totalPower.toLocaleString()} kWh</td>
                <td className={`${cellPadding} text-right font-black text-[#B48F48]`}>{avgYield}%</td>
                <td colSpan={1 + customCols.length}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  );
}
