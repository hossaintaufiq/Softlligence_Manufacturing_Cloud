'use client';
import { exportToExcel } from '@/lib/excelExport';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface RollingRow {
  id: number;
  date: string;
  billet_input_kg: number;
  rod_size: string;
  rod_production_kg: number;
  rod_loss_kg: number;
  rod_yield_pct: number;
  rod_stock_kg: number;
  customValues?: Record<string, string>;
}

const STORAGE_KEY = 'steel_erp_rolling';

const initialRollingData: RollingRow[] = [
  { id: 1, date: '2026-08-20', billet_input_kg: 10000, rod_size: '12MM', rod_production_kg: 9600, rod_loss_kg: 400, rod_yield_pct: 96.0, rod_stock_kg: 145000 },
  { id: 2, date: '2026-08-21', billet_input_kg: 11000, rod_size: '16MM', rod_production_kg: 10580, rod_loss_kg: 420, rod_yield_pct: 96.18, rod_stock_kg: 155580 },
  { id: 3, date: '2026-08-22', billet_input_kg: 10000, rod_size: '20MM', rod_production_kg: 9550, rod_loss_kg: 450, rod_yield_pct: 95.5, rod_stock_kg: 165130 }
];

export default function RollingMillPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';

  const [data, setData] = useState<RollingRow[]>([]);
  const [customCols, setCustomCols] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [sortField, setSortField] = useState<keyof RollingRow>('date');
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
  const sizes = ['8MM', '10MM', '12MM', '16MM', '20MM', '22MM', '25MM', '32MM'];

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch {
        setData(initialRollingData);
      }
    } else {
      setData(initialRollingData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialRollingData));
    }

    const storedCols = localStorage.getItem(`${STORAGE_KEY}_cols`);
    if (storedCols) {
      try { setCustomCols(JSON.parse(storedCols)); } catch {}
    }
  }, []);

  const saveToStorage = (updated: RollingRow[], cols = customCols) => {
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

  const handleSort = (field: keyof RollingRow) => {
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
    const prevStock = data.length > 0 ? data[data.length - 1].rod_stock_kg : 120000;
    const newRow: RollingRow = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      billet_input_kg: 0,
      rod_size: '12MM',
      rod_production_kg: 0,
      rod_loss_kg: 0,
      rod_yield_pct: 0,
      rod_stock_kg: prevStock,
      customValues: {}
    };
    saveToStorage([...data, newRow]);
  };

  // Delete Row via Custom Modal Dialog
  const handleDeleteRow = (id: number) => {
    setDialog({
      type: 'confirm',
      title: 'Confirm Delete',
      message: 'Are you sure you want to permanently delete this rolling mill production record?',
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
      : data[0][field as keyof RollingRow];

    const updated = data.map((row, idx) => {
      if (idx === 0) return row;
      if (isCustom) {
        return {
          ...row,
          customValues: { ...(row.customValues || {}), [field]: String(firstVal) }
        };
      } else {
        const baseRow = { ...row, [field]: firstVal };
        const input = Number(baseRow.billet_input_kg);
        const output = Number(baseRow.rod_production_kg);
        baseRow.rod_loss_kg = Math.max(0, input - output);
        baseRow.rod_yield_pct = input > 0 ? parseFloat(((output / input) * 100).toFixed(2)) : 0;
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
          if (field === 'billet_input_kg' || field === 'rod_production_kg' || field === 'rod_loss_kg' || field === 'rod_yield_pct' || field === 'rod_stock_kg') {
            val = Number(evaluated);
            if (isNaN(val)) val = row[field as keyof RollingRow] || 0;
          }
          const baseRow = { ...row, [field]: val };
          const input = Number(baseRow.billet_input_kg);
          const output = Number(baseRow.rod_production_kg);
          baseRow.rod_loss_kg = Math.max(0, input - output);
          baseRow.rod_yield_pct = input > 0 ? parseFloat(((output / input) * 100).toFixed(2)) : 0;
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
    const headers = ['Date', 'Billet Input Charged (KG)', 'Finished Rebar Size', 'Production Output (KG)', 'Shear/Scale Loss (KG)', 'Rolling Yield %', 'Finished Rod Stock (KG)', ...customHeaders];
    
    const rows = filteredData.map(r => [
      r.date, r.billet_input_kg, r.rod_size, r.rod_production_kg, r.rod_loss_kg, r.rod_yield_pct, r.rod_stock_kg,
      ...(customCols.map(col => r.customValues?.[col] || ''))
    ]);
    exportToExcel(headers, rows, 'rolling_mill_ledger');
  };

  const filteredData = data
    .filter(row => {
      const matchesSize = sizeFilter ? row.rod_size === sizeFilter : true;
      return matchesSize;
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
  const totalInput = filteredData.reduce((sum, r) => sum + r.billet_input_kg, 0);
  const totalOutput = filteredData.reduce((sum, r) => sum + r.rod_production_kg, 0);
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
          <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wider font-mono">Rolling Mill Production Ledger</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Logs billet charging inputs, rebar rolling sizes, finished wire rod/deformed bar production outputs, and burning/shearing losses.</p>
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
        <select 
          value={sizeFilter}
          onChange={(e) => setSizeFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none"
        >
          <option value="">All Finished Sizes</option>
          {sizes.map((s, idx) => <option key={idx} value={s}>{s}</option>)}
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
                <th className={`w-36 ${cellPadding} text-right`}>
                  Billet Input Charged (KG) <button onClick={() => handleFillDown('billet_input_kg')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                </th>
                <th className={`w-36 ${cellPadding}`}>Rebar Finished Size</th>
                <th className={`w-36 ${cellPadding} text-right`}>
                  Production Output (KG) <button onClick={() => handleFillDown('rod_production_kg')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                </th>
                <th className={`w-32 ${cellPadding} text-right text-rose-500`}>Shearing/Burning Loss (KG)</th>
                <th className={`w-28 ${cellPadding} text-right`}>Rolling Yield %</th>
                <th className={`w-40 ${cellPadding} text-right`}>
                  Finished Rod Stock (KG) <button onClick={() => handleFillDown('rod_stock_kg')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                </th>

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
                        <input type="date" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'date')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'date')} className="absolute inset-0 w-full h-full bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10" autoFocus />
                      ) : (
                        <span className="w-full h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block select-none" onClick={() => startEdit(row.id, 'date', row.date)}>{row.date}</span>
                      )}
                    </div>
                  </td>

                  {/* Billet Input */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center justify-end text-right">
                      {editingCell?.id === row.id && editingCell?.field === 'billet_input_kg' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'billet_input_kg')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'billet_input_kg')} className="absolute inset-0 w-full h-full text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10" autoFocus />
                      ) : (
                        <span className="w-full h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block select-none" onClick={() => startEdit(row.id, 'billet_input_kg', row.billet_input_kg)}>{row.billet_input_kg.toLocaleString()}</span>
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

                  {/* Production Output */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center justify-end text-right">
                      {editingCell?.id === row.id && editingCell?.field === 'rod_production_kg' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'rod_production_kg')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'rod_production_kg')} className="absolute inset-0 w-full h-full text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10" autoFocus />
                      ) : (
                        <span className="w-full h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block text-emerald-650 select-none font-semibold" onClick={() => startEdit(row.id, 'rod_production_kg', row.rod_production_kg)}>{row.rod_production_kg.toLocaleString()}</span>
                      )}
                    </div>
                  </td>

                  {/* Shearing Loss (Calculated) */}
                  <td className={`${cellPadding} text-right text-rose-655 font-bold bg-rose-50/20`}>
                    <span className="h-7 flex items-center justify-end px-1 select-none">{row.rod_loss_kg.toLocaleString()}</span>
                  </td>

                  {/* Yield Pct (Calculated) */}
                  <td className={`${cellPadding} text-right font-black text-rose-600`}>
                    <span className="h-7 flex items-center justify-end px-1 select-none">{row.rod_yield_pct}%</span>
                  </td>

                  {/* Finished Stock */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center justify-end text-right">
                      {editingCell?.id === row.id && editingCell?.field === 'rod_stock_kg' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'rod_stock_kg')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'rod_stock_kg')} className="absolute inset-0 w-full h-full text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10 font-black text-emerald-600" autoFocus />
                      ) : (
                        <span className="w-full h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block select-none font-black text-emerald-600" onClick={() => startEdit(row.id, 'rod_stock_kg', row.rod_stock_kg)}>{row.rod_stock_kg.toLocaleString()}</span>
                      )}
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
                <td className={cellPadding} colSpan={2}>Totals & Averages</td>
                <td className={`${cellPadding} text-right font-bold`}>{totalInput.toLocaleString()} kg</td>
                <td></td>
                <td className={`${cellPadding} text-right font-bold text-emerald-600`}>{totalOutput.toLocaleString()} kg</td>
                <td className={`${cellPadding} text-right font-bold text-rose-655 bg-rose-50/20`}>{totalLoss.toLocaleString()} kg</td>
                <td className={`${cellPadding} text-right font-black text-rose-600`}>{avgYield}%</td>
                <td colSpan={customCols.length}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  );
}
