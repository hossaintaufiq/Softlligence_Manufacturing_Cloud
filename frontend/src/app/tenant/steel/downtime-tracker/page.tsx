'use client';
import { exportToExcel } from '@/lib/excelExport';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface DowntimeRow {
  id: number;
  date: string;
  ticket_no: string;
  equipment: string;
  billet_breakdown_min: number;
  rolling_breakdown_min: number;
  breakdown_category: string;
  root_cause_notes: string;
  shift_code: string;
  action_taken: string;
  customValues?: Record<string, string>;
}

const STORAGE_KEY = 'steel_erp_downtime';

const initialDowntimeData: DowntimeRow[] = [
  { id: 1, date: '2026-08-20', ticket_no: 'TKT-2608-01', equipment: 'CCM Mold Stirrer', billet_breakdown_min: 45, rolling_breakdown_min: 0, breakdown_category: 'Electrical', root_cause_notes: 'CCM mold stirrer sensor replacement', shift_code: 'A', action_taken: 'Replaced inductive sensor' },
  { id: 2, date: '2026-08-21', ticket_no: 'TKT-2608-02', equipment: 'Sizing Blocks', billet_breakdown_min: 0, rolling_breakdown_min: 90, breakdown_category: 'Roll Changing', root_cause_notes: 'Scheduled changeover to 16MM guide rolls', shift_code: 'B', action_taken: 'Replaced 12mm sizing blocks' },
  { id: 3, date: '2026-08-22', ticket_no: 'TKT-2608-03', equipment: 'Ladle Nozzle', billet_breakdown_min: 30, rolling_breakdown_min: 0, breakdown_category: 'Mechanical', root_cause_notes: 'Ladle slide-gate nozzle alignment checks', shift_code: 'C', action_taken: 'Re-aligned cylinder guides' }
];

export default function DowntimeTrackerPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';

  const [data, setData] = useState<DowntimeRow[]>([]);
  const [customCols, setCustomCols] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortField, setSortField] = useState<keyof DowntimeRow>('date');
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
  const categories = ['Mechanical', 'Electrical', 'Furnace Refractory', 'CCM Mold', 'Roll Changing', 'Power Failure', 'No Billet Stock', 'Others'];
  const shifts = ['A', 'B', 'C', 'General'];

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch {
        setData(initialDowntimeData);
      }
    } else {
      setData(initialDowntimeData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDowntimeData));
    }

    const storedCols = localStorage.getItem(`${STORAGE_KEY}_cols`);
    if (storedCols) {
      try { setCustomCols(JSON.parse(storedCols)); } catch {}
    }
  }, []);

  const saveToStorage = (updated: DowntimeRow[], cols = customCols) => {
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

  const handleSort = (field: keyof DowntimeRow) => {
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
    const nextNum = Math.floor(1000 + Math.random() * 9000);
    const newRow: DowntimeRow = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      ticket_no: `TKT-2608-${nextNum}`,
      equipment: 'General Mechanical',
      billet_breakdown_min: 0,
      rolling_breakdown_min: 0,
      breakdown_category: 'Mechanical',
      root_cause_notes: '',
      shift_code: 'A',
      action_taken: '',
      customValues: {}
    };
    saveToStorage([...data, newRow]);
  };

  // Delete Row via Custom Modal Confirm Dialog
  const handleDeleteRow = (id: number) => {
    setDialog({
      type: 'confirm',
      title: 'Confirm Delete',
      message: 'Are you sure you want to permanently delete this downtime record?',
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
      : data[0][field as keyof DowntimeRow];

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
          if (field === 'billet_breakdown_min' || field === 'rolling_breakdown_min') {
            val = Number(evaluated);
            if (isNaN(val)) val = row[field as keyof DowntimeRow] || 0;
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
    const headers = ['Date', 'Ticket No', 'Equipment', 'Melt Shop (Min)', 'Rolling Mill (Min)', 'Breakdown Category', 'Root Cause Notes', 'Shift', 'Action Taken', ...customHeaders];
    
    const rows = filteredData.map(r => [
      r.date, r.ticket_no, r.equipment, r.billet_breakdown_min, r.rolling_breakdown_min, r.breakdown_category, r.root_cause_notes, r.shift_code, r.action_taken,
      ...(customCols.map(col => r.customValues?.[col] || ''))
    ]);
    exportToExcel(headers, rows, 'downtime_breakdown_ledger');
  };

  const filteredData = data
    .filter(row => {
      const matchesSearch = row.equipment.toLowerCase().includes(search.toLowerCase()) ||
                            row.ticket_no.toLowerCase().includes(search.toLowerCase()) ||
                            row.root_cause_notes.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter ? row.breakdown_category === categoryFilter : true;
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
  const totalBilletDown = filteredData.reduce((sum, r) => sum + r.billet_breakdown_min, 0);
  const totalRollingDown = filteredData.reduce((sum, r) => sum + r.rolling_breakdown_min, 0);

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
          <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wider font-mono">Downtime & Breakdown Tracker</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Logs factory shutdowns, machinery maintenance logs, root causes, shift categories, and action resolutions.</p>
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
          placeholder="Filter by Ticket No, Equipment, or Root Cause..." 
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
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-150 text-[10px] uppercase font-mono text-slate-450 select-none">
                <th className={`w-14 text-center ${cellPadding}`}>Actions</th>
                <th className={`${cellPadding} cursor-pointer hover:bg-slate-100`} onClick={() => handleSort('date')}>
                  Date {sortField === 'date' && (sortDir === 'asc' ? '▲' : '▼')}
                </th>
                <th className={`${cellPadding}`}>
                  Ticket No <button onClick={() => handleFillDown('ticket_no')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                </th>
                <th className={`${cellPadding}`}>
                  Equipment <button onClick={() => handleFillDown('equipment')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                </th>
                <th className={`${cellPadding}`}>Breakdown Category</th>
                <th className={`${cellPadding}`}>
                  Root Cause Notes <button onClick={() => handleFillDown('root_cause_notes')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                </th>
                <th className={`${cellPadding}`}>Shift Code</th>
                <th className={`${cellPadding}`}>
                  Action Taken <button onClick={() => handleFillDown('action_taken')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                </th>
                <th className={`${cellPadding} text-right`}>
                  Melt Shop (Min) <button onClick={() => handleFillDown('billet_breakdown_min')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                </th>
                <th className={`${cellPadding} text-right`}>
                  Rolling Mill (Min) <button onClick={() => handleFillDown('rolling_breakdown_min')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
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

                  {/* Ticket No */}
                  <td className={cellPadding} onClick={() => startEdit(row.id, 'ticket_no', row.ticket_no)}>
                    {editingCell?.id === row.id && editingCell?.field === 'ticket_no' ? (
                      <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'ticket_no')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'ticket_no')} className="h-7 w-28 bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans" autoFocus />
                    ) : (
                      <span className="h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block select-none font-bold text-slate-900">{row.ticket_no}</span>
                    )}
                  </td>

                  {/* Equipment */}
                  <td className={cellPadding} onClick={() => startEdit(row.id, 'equipment', row.equipment)}>
                    {editingCell?.id === row.id && editingCell?.field === 'equipment' ? (
                      <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'equipment')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'equipment')} className="h-7 w-full bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans" autoFocus />
                    ) : (
                      <span className="h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block select-none">{row.equipment}</span>
                    )}
                  </td>

                  {/* Category Select */}
                  <td className={cellPadding}>
                    <select
                      value={row.breakdown_category}
                      onChange={(e) => {
                        const updated = data.map(r => r.id === row.id ? { ...r, breakdown_category: e.target.value } : r);
                        saveToStorage(updated);
                      }}
                      className="bg-transparent border-0 focus:outline-none py-0.5 text-xs font-sans font-bold text-indigo-650"
                    >
                      {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
                    </select>
                  </td>

                  {/* Root Cause Notes */}
                  <td className={cellPadding} onClick={() => startEdit(row.id, 'root_cause_notes', row.root_cause_notes)}>
                    {editingCell?.id === row.id && editingCell?.field === 'root_cause_notes' ? (
                      <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'root_cause_notes')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'root_cause_notes')} className="h-7 w-full bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans" autoFocus />
                    ) : (
                      <span className="h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block truncate max-w-[200px] select-none" title={row.root_cause_notes}>{row.root_cause_notes || 'Add root cause'}</span>
                    )}
                  </td>

                  {/* Shift Code select */}
                  <td className={cellPadding}>
                    <select
                      value={row.shift_code}
                      onChange={(e) => {
                        const updated = data.map(r => r.id === row.id ? { ...r, shift_code: e.target.value } : r);
                        saveToStorage(updated);
                      }}
                      className="bg-transparent border-0 focus:outline-none py-0.5 text-xs font-sans text-slate-700"
                    >
                      {shifts.map((s, i) => <option key={i} value={s}>{s}</option>)}
                    </select>
                  </td>

                  {/* Action Taken */}
                  <td className={cellPadding} onClick={() => startEdit(row.id, 'action_taken', row.action_taken)}>
                    {editingCell?.id === row.id && editingCell?.field === 'action_taken' ? (
                      <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'action_taken')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'action_taken')} className="h-7 w-full bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans" autoFocus />
                    ) : (
                      <span className="h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block truncate max-w-[200px] select-none" title={row.action_taken}>{row.action_taken || 'Add action taken'}</span>
                    )}
                  </td>

                  {/* Billet Breakdown Min */}
                  <td className={`${cellPadding} text-right`} onClick={() => startEdit(row.id, 'billet_breakdown_min', row.billet_breakdown_min)}>
                    {editingCell?.id === row.id && editingCell?.field === 'billet_breakdown_min' ? (
                      <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'billet_breakdown_min')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'billet_breakdown_min')} className="h-7 w-16 text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans" autoFocus />
                    ) : (
                      <span className="h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block select-none text-rose-650">{row.billet_breakdown_min} min</span>
                    )}
                  </td>

                  {/* Rolling Breakdown Min */}
                  <td className={`${cellPadding} text-right`} onClick={() => startEdit(row.id, 'rolling_breakdown_min', row.rolling_breakdown_min)}>
                    {editingCell?.id === row.id && editingCell?.field === 'rolling_breakdown_min' ? (
                      <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'rolling_breakdown_min')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'rolling_breakdown_min')} className="h-7 w-16 text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans" autoFocus />
                    ) : (
                      <span className="h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block select-none text-indigo-650">{row.rolling_breakdown_min} min</span>
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
                <td className={cellPadding} colSpan={8}>Totals</td>
                <td className={`${cellPadding} text-right font-bold text-rose-650`}>{totalBilletDown} mins</td>
                <td className={`${cellPadding} text-right font-bold text-indigo-650`}>{totalRollingDown} mins</td>
                <td colSpan={customCols.length}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  );
}
