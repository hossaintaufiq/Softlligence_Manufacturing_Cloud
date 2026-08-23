'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface DowntimeRow {
  id: number;
  date: string;
  billet_breakdown_min: number;
  rolling_breakdown_min: number;
  breakdown_category: string;
  root_cause_notes: string;
  shift_code: string;
  action_taken: string;
}

export default function DowntimeTrackerPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';

  // Local state with seed data
  const [data, setData] = useState<DowntimeRow[]>([
    { id: 1, date: '2026-08-20', billet_breakdown_min: 45, rolling_breakdown_min: 0, breakdown_category: 'Electrical', root_cause_notes: 'CCM mold stirrer sensor replacement', shift_code: 'A', action_taken: 'Replaced inductive sensor' },
    { id: 2, date: '2026-08-21', billet_breakdown_min: 0, rolling_breakdown_min: 90, breakdown_category: 'Roll Changing', root_cause_notes: 'Scheduled changeover to 16MM guide rolls', shift_code: 'B', action_taken: 'Replaced 12mm sizing blocks' },
    { id: 3, date: '2026-08-22', billet_breakdown_min: 30, rolling_breakdown_min: 0, breakdown_category: 'Mechanical', root_cause_notes: 'Ladle slide-gate nozzle alignment checks', shift_code: 'C', action_taken: 'Re-aligned cylinder guides' }
  ]);

  // Sheet States
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortField, setSortField] = useState<keyof DowntimeRow>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Visible Columns Toggle
  const [visibleCols, setVisibleCols] = useState({
    date: true,
    billet_breakdown_min: true,
    rolling_breakdown_min: true,
    breakdown_category: true,
    root_cause_notes: true,
    shift_code: true,
    action_taken: true
  });
  const [showColMenu, setShowColMenu] = useState(false);

  // Inline Cell Editing State
  const [editingCell, setEditingCell] = useState<{ id: number; field: keyof DowntimeRow } | null>(null);
  const [editValue, setEditValue] = useState('');

  // Multi-Row Modal Entry
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRows, setModalRows] = useState<any[]>([
    { date: new Date().toISOString().split('T')[0], billet_breakdown_min: '0', rolling_breakdown_min: '0', breakdown_category: 'Mechanical', root_cause_notes: '', shift_code: 'A', action_taken: '' }
  ]);
  const [validationError, setValidationError] = useState('');

  const cellPadding = isCompact ? 'px-3 py-1.5 text-[11px]' : 'px-4 py-2.5 text-xs';
  const categories = ['Mechanical', 'Electrical', 'Roll Changing', 'Power Cut', 'Furnace Relining', 'Others'];

  const handleSort = (field: keyof DowntimeRow) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const startEdit = (id: number, field: keyof DowntimeRow, currentVal: any) => {
    setEditingCell({ id, field });
    setEditValue(String(currentVal));
  };

  const saveInlineEdit = (id: number, field: keyof DowntimeRow) => {
    const updatedRows = data.map(row => {
      if (row.id === id) {
        let val: any = editValue;
        if (field === 'billet_breakdown_min' || field === 'rolling_breakdown_min') {
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
    const headers = ['Date', 'Billet Breakdown (Min)', 'Rolling Breakdown (Min)', 'Category', 'Root Cause Notes', 'Shift Code', 'Action Taken'];
    const rows = filteredData.map(r => [
      r.date, r.billet_breakdown_min, r.rolling_breakdown_min, r.breakdown_category, r.root_cause_notes, r.shift_code, r.action_taken
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `downtime_breakdown_logs.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addModalRow = () => {
    setModalRows([
      ...modalRows,
      { date: new Date().toISOString().split('T')[0], billet_breakdown_min: '0', rolling_breakdown_min: '0', breakdown_category: 'Mechanical', root_cause_notes: '', shift_code: 'A', action_taken: '' }
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
      const billet = parseFloat(row.billet_breakdown_min);
      const rolling = parseFloat(row.rolling_breakdown_min);

      if (!row.date) return setValidationError(`Row ${i + 1}: Date is required.`);
      if (!row.root_cause_notes.trim()) return setValidationError(`Row ${i + 1}: Root cause notes are required.`);
      if (!row.action_taken.trim()) return setValidationError(`Row ${i + 1}: Action taken is required.`);
      if (isNaN(billet) || billet < 0) return setValidationError(`Row ${i + 1}: Billet breakdown minutes must be non-negative.`);
      if (isNaN(rolling) || rolling < 0) return setValidationError(`Row ${i + 1}: Rolling breakdown minutes must be non-negative.`);
      if (billet === 0 && rolling === 0) return setValidationError(`Row ${i + 1}: You must log at least 1 breakdown minute.`);
    }

    const newEntries = modalRows.map((row, index) => {
      return {
        id: data.length + index + 1,
        date: row.date,
        billet_breakdown_min: parseFloat(row.billet_breakdown_min),
        rolling_breakdown_min: parseFloat(row.rolling_breakdown_min),
        breakdown_category: row.breakdown_category,
        root_cause_notes: row.root_cause_notes,
        shift_code: row.shift_code,
        action_taken: row.action_taken
      };
    });

    setData([...data, ...newEntries]);
    setIsModalOpen(false);
    setModalRows([{ date: new Date().toISOString().split('T')[0], billet_breakdown_min: '0', rolling_breakdown_min: '0', breakdown_category: 'Mechanical', root_cause_notes: '', shift_code: 'A', action_taken: '' }]);
  };

  const filteredData = data
    .filter(row => {
      const matchesSearch = row.root_cause_notes.toLowerCase().includes(search.toLowerCase()) ||
                            row.action_taken.toLowerCase().includes(search.toLowerCase());
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

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      
      {/* Title Bar */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wider font-mono">Downtime & Breakdown Tracker</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Logs plant mechanical/electrical breakdown run minutes, root cause details, and maintenance actions.</p>
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
          placeholder="Search by Root Cause, Action Taken, or Shift..." 
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
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-150 text-[10px] uppercase font-mono text-slate-450">
                {visibleCols.date && (
                  <th className={`sticky left-0 bg-slate-50 z-10 border-r border-slate-100 ${cellPadding} cursor-pointer hover:bg-slate-100`} onClick={() => handleSort('date')}>
                    Date {sortField === 'date' && (sortDir === 'asc' ? '▲' : '▼')}
                  </th>
                )}
                {visibleCols.billet_breakdown_min && <th className={`${cellPadding} text-right`}>Melt Shop Breakdown (Min)</th>}
                {visibleCols.rolling_breakdown_min && <th className={`${cellPadding} text-right`}>Rolling Breakdown (Min)</th>}
                {visibleCols.breakdown_category && <th className={`${cellPadding}`}>Category</th>}
                {visibleCols.root_cause_notes && <th className={`${cellPadding}`}>Root Cause Notes</th>}
                {visibleCols.shift_code && <th className={`${cellPadding}`}>Shift Code</th>}
                {visibleCols.action_taken && <th className={`${cellPadding}`}>Action Taken</th>}
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
                  {visibleCols.billet_breakdown_min && (
                    <td className={`${cellPadding} text-right font-semibold`} onClick={() => startEdit(row.id, 'billet_breakdown_min', row.billet_breakdown_min)}>
                      {editingCell?.id === row.id && editingCell?.field === 'billet_breakdown_min' ? (
                        <input 
                          type="number" 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveInlineEdit(row.id, 'billet_breakdown_min')}
                          className="bg-slate-50 border border-slate-200 text-right text-xs p-0.5 rounded w-20 focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.billet_breakdown_min} mins</span>
                      )}
                    </td>
                  )}
                  {visibleCols.rolling_breakdown_min && (
                    <td className={`${cellPadding} text-right font-semibold`} onClick={() => startEdit(row.id, 'rolling_breakdown_min', row.rolling_breakdown_min)}>
                      {editingCell?.id === row.id && editingCell?.field === 'rolling_breakdown_min' ? (
                        <input 
                          type="number" 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveInlineEdit(row.id, 'rolling_breakdown_min')}
                          className="bg-slate-50 border border-slate-200 text-right text-xs p-0.5 rounded w-20 focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.rolling_breakdown_min} mins</span>
                      )}
                    </td>
                  )}
                  {visibleCols.breakdown_category && (
                    <td className={cellPadding}>
                      <span className="px-2 py-0.5 text-[9px] font-bold border rounded-full bg-rose-50 text-rose-650 border-rose-250/20">
                        {row.breakdown_category}
                      </span>
                    </td>
                  )}
                  {visibleCols.root_cause_notes && (
                    <td className={`${cellPadding} truncate max-w-[200px]`} onClick={() => startEdit(row.id, 'root_cause_notes', row.root_cause_notes)}>
                      {editingCell?.id === row.id && editingCell?.field === 'root_cause_notes' ? (
                        <input 
                          type="text" 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveInlineEdit(row.id, 'root_cause_notes')}
                          className="bg-slate-50 border border-slate-200 p-0.5 rounded text-xs focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded" title={row.root_cause_notes}>{row.root_cause_notes}</span>
                      )}
                    </td>
                  )}
                  {visibleCols.shift_code && <td className={cellPadding}>{row.shift_code}</td>}
                  {visibleCols.action_taken && (
                    <td className={`${cellPadding} truncate max-w-[200px]`} onClick={() => startEdit(row.id, 'action_taken', row.action_taken)}>
                      {editingCell?.id === row.id && editingCell?.field === 'action_taken' ? (
                        <input 
                          type="text" 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveInlineEdit(row.id, 'action_taken')}
                          className="bg-slate-50 border border-slate-200 p-0.5 rounded text-xs focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded" title={row.action_taken}>{row.action_taken}</span>
                      )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40">
          <div className="bg-white border border-slate-200/85 p-7 rounded-3xl w-full max-w-4xl shadow-2xl space-y-5 relative overflow-hidden border-t-4 border-t-[#C5A059] flex flex-col max-h-[85vh]">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-mono">Quick Downtime Log</h3>
              <p className="text-[10px] text-slate-450 mt-1">Simultaneously log plant area breakdown durations and maintenance reports.</p>
            </div>

            {validationError && (
              <div className="bg-rose-50 text-rose-800 p-3 rounded-xl border border-rose-100 text-[10px] font-bold font-mono">
                🚨 Error: {validationError}
              </div>
            )}

            <form onSubmit={handleMultiRowSubmit} className="space-y-4 flex-1 overflow-y-auto min-h-0">
              <div className="space-y-3">
                {modalRows.map((row, idx) => (
                  <div key={idx} className="flex gap-3 items-end border-b border-slate-100 pb-3 last:border-b-0">
                    <div className="w-28 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Date</label>
                      <input 
                        type="date" 
                        value={row.date}
                        onChange={(e) => handleModalRowChange(idx, 'date', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                      />
                    </div>
                    <div className="w-24 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Melt Min</label>
                      <input 
                        type="number" 
                        value={row.billet_breakdown_min}
                        onChange={(e) => handleModalRowChange(idx, 'billet_breakdown_min', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                      />
                    </div>
                    <div className="w-24 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Rolling Min</label>
                      <input 
                        type="number" 
                        value={row.rolling_breakdown_min}
                        onChange={(e) => handleModalRowChange(idx, 'rolling_breakdown_min', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                      />
                    </div>
                    <div className="w-32 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Category</label>
                      <select 
                        value={row.breakdown_category}
                        onChange={(e) => handleModalRowChange(idx, 'breakdown_category', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                      >
                        {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Root Cause Notes</label>
                      <input 
                        type="text" 
                        placeholder="Mold sensor replacement..."
                        value={row.root_cause_notes}
                        onChange={(e) => handleModalRowChange(idx, 'root_cause_notes', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none font-mono"
                      />
                    </div>
                    <div className="w-20 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Shift</label>
                      <select 
                        value={row.shift_code}
                        onChange={(e) => handleModalRowChange(idx, 'shift_code', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                      >
                        <option value="A">Shift A</option>
                        <option value="B">Shift B</option>
                        <option value="C">Shift C</option>
                        <option value="General">General</option>
                      </select>
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Action Taken</label>
                      <input 
                        type="text" 
                        placeholder="Replaced inductive blocks..."
                        value={row.action_taken}
                        onChange={(e) => handleModalRowChange(idx, 'action_taken', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none font-mono"
                      />
                    </div>
                    {modalRows.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeModalRow(idx)}
                        className="text-red-500 hover:text-red-750 pb-2.5 font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
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
                    Save Downtime logs
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
