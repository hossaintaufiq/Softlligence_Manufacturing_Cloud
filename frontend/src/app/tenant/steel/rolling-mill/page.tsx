'use client';

import React, { useState } from 'react';
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
}

export default function RollingMillPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';

  // Local state with seed data
  const [data, setData] = useState<RollingRow[]>([
    { id: 1, date: '2026-08-20', billet_input_kg: 10000, rod_size: '12MM', rod_production_kg: 9600, rod_loss_kg: 400, rod_yield_pct: 96, rod_stock_kg: 145000 },
    { id: 2, date: '2026-08-21', billet_input_kg: 11000, rod_size: '16MM', rod_production_kg: 10580, rod_loss_kg: 420, rod_yield_pct: 96.18, rod_stock_kg: 155580 },
    { id: 3, date: '2026-08-22', billet_input_kg: 10000, rod_size: '20MM', rod_production_kg: 9550, rod_loss_kg: 450, rod_yield_pct: 95.5, rod_stock_kg: 165130 }
  ]);

  // Sheet States
  const [search, setSearch] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [sortField, setSortField] = useState<keyof RollingRow>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Visible Columns Toggle
  const [visibleCols, setVisibleCols] = useState({
    date: true,
    billet_input_kg: true,
    rod_size: true,
    rod_production_kg: true,
    rod_loss_kg: true,
    rod_yield_pct: true,
    rod_stock_kg: true
  });
  const [showColMenu, setShowColMenu] = useState(false);

  // Inline Cell Editing State
  const [editingCell, setEditingCell] = useState<{ id: number; field: keyof RollingRow } | null>(null);
  const [editValue, setEditValue] = useState('');

  // Multi-Row Modal Entry
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRows, setModalRows] = useState<any[]>([
    { date: new Date().toISOString().split('T')[0], billet_input_kg: '', rod_size: '12MM', rod_production_kg: '' }
  ]);
  const [validationError, setValidationError] = useState('');

  const cellPadding = isCompact ? 'px-3 py-1.5 text-[11px]' : 'px-4 py-2.5 text-xs';
  const rodSizes = ['10MM', '12MM', '16MM', '20MM', '25MM', '32MM'];

  const handleSort = (field: keyof RollingRow) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const startEdit = (id: number, field: keyof RollingRow, currentVal: any) => {
    setEditingCell({ id, field });
    setEditValue(String(currentVal));
  };

  const saveInlineEdit = (id: number, field: keyof RollingRow) => {
    const updatedRows = data.map(row => {
      if (row.id === id) {
        let val: any = editValue;
        if (field === 'billet_input_kg' || field === 'rod_production_kg' || field === 'rod_loss_kg' || field === 'rod_yield_pct' || field === 'rod_stock_kg') {
          val = parseFloat(editValue);
          if (isNaN(val)) val = row[field];
        }
        const billet = field === 'billet_input_kg' ? val : row.billet_input_kg;
        const rod = field === 'rod_production_kg' ? val : row.rod_production_kg;
        const loss = Math.max(0, billet - rod);
        const yield_pct = parseFloat(((rod / billet) * 100).toFixed(2));

        return { ...row, [field]: val, rod_loss_kg: loss, rod_yield_pct: yield_pct };
      }
      return row;
    });

    setData(updatedRows);
    setEditingCell(null);
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Billet Input (kg)', 'Rod Size', 'Rod Production (kg)', 'Rod Loss (kg)', 'Rod Yield %', 'Rod Stock (kg)'];
    const rows = filteredData.map(r => [
      r.date, r.billet_input_kg, r.rod_size, r.rod_production_kg, r.rod_loss_kg, r.rod_yield_pct, r.rod_stock_kg
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rolling_mill_production.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addModalRow = () => {
    setModalRows([
      ...modalRows,
      { date: new Date().toISOString().split('T')[0], billet_input_kg: '', rod_size: '12MM', rod_production_kg: '' }
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
      const billet = parseFloat(row.billet_input_kg);
      const rod = parseFloat(row.rod_production_kg);

      if (!row.date) return setValidationError(`Row ${i + 1}: Date is required.`);
      if (isNaN(billet) || billet <= 0) return setValidationError(`Row ${i + 1}: Billet Input weight must be positive.`);
      if (isNaN(rod) || rod <= 0) return setValidationError(`Row ${i + 1}: Rod Production weight must be positive.`);
      if (billet < rod) return setValidationError(`Row ${i + 1}: Billet Input weight must exceed Rod Production weight.`);
    }

    const newEntries = modalRows.map((row, index) => {
      const billet = parseFloat(row.billet_input_kg);
      const rod = parseFloat(row.rod_production_kg);
      const prevStock = data.length > 0 ? data[data.length - 1].rod_stock_kg : 120000;
      return {
        id: data.length + index + 1,
        date: row.date,
        billet_input_kg: billet,
        rod_size: row.rod_size,
        rod_production_kg: rod,
        rod_loss_kg: billet - rod,
        rod_yield_pct: parseFloat(((rod / billet) * 100).toFixed(2)),
        rod_stock_kg: prevStock + rod
      };
    });

    setData([...data, ...newEntries]);
    setIsModalOpen(false);
    setModalRows([{ date: new Date().toISOString().split('T')[0], billet_input_kg: '', rod_size: '12MM', rod_production_kg: '' }]);
  };

  const filteredData = data
    .filter(row => {
      const matchesSearch = row.rod_size.toLowerCase().includes(search.toLowerCase());
      const matchesSize = sizeFilter ? row.rod_size === sizeFilter : true;
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

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      
      {/* Title Bar */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wider font-mono">Rolling Mill Production</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Logs billet recharge inputs, finished rebar output sizes, shearing line loss variables, and finished yard stock balances.</p>
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
          placeholder="Search by Rod Size (e.g. 12MM)..." 
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
          {rodSizes.map((s, idx) => <option key={idx} value={s}>{s}</option>)}
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
                {visibleCols.billet_input_kg && <th className={`${cellPadding} text-right`}>Billet Input (KG)</th>}
                {visibleCols.rod_size && <th className={`${cellPadding}`}>Rod Size</th>}
                {visibleCols.rod_production_kg && <th className={`${cellPadding} text-right`}>Production Output (KG)</th>}
                {visibleCols.rod_loss_kg && <th className={`${cellPadding} text-right`}>Shearing Loss (KG)</th>}
                {visibleCols.rod_yield_pct && <th className={`${cellPadding} text-right`}>Rod Yield %</th>}
                {visibleCols.rod_stock_kg && <th className={`${cellPadding} text-right`}>Rod Stock (KG)</th>}
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
                  {visibleCols.billet_input_kg && (
                    <td className={`${cellPadding} text-right font-semibold`} onClick={() => startEdit(row.id, 'billet_input_kg', row.billet_input_kg)}>
                      {editingCell?.id === row.id && editingCell?.field === 'billet_input_kg' ? (
                        <input 
                          type="number" 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveInlineEdit(row.id, 'billet_input_kg')}
                          className="bg-slate-50 border border-slate-200 text-right text-xs p-0.5 rounded w-20 focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.billet_input_kg.toLocaleString()}</span>
                      )}
                    </td>
                  )}
                  {visibleCols.rod_size && (
                    <td className={cellPadding}>
                      <span className="px-2 py-0.5 text-[9px] font-bold border rounded-full bg-emerald-50 text-emerald-650 border-emerald-250/20">
                        {row.rod_size}
                      </span>
                    </td>
                  )}
                  {visibleCols.rod_production_kg && (
                    <td className={`${cellPadding} text-right font-semibold`} onClick={() => startEdit(row.id, 'rod_production_kg', row.rod_production_kg)}>
                      {editingCell?.id === row.id && editingCell?.field === 'rod_production_kg' ? (
                        <input 
                          type="number" 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveInlineEdit(row.id, 'rod_production_kg')}
                          className="bg-slate-50 border border-slate-200 text-right text-xs p-0.5 rounded w-20 focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.rod_production_kg.toLocaleString()}</span>
                      )}
                    </td>
                  )}
                  {visibleCols.rod_loss_kg && (
                    <td className={`${cellPadding} text-right`}>
                      {row.rod_loss_kg.toLocaleString()}
                    </td>
                  )}
                  {visibleCols.rod_yield_pct && (
                    <td className={`${cellPadding} text-right font-bold text-emerald-600`}>
                      {row.rod_yield_pct}%
                    </td>
                  )}
                  {visibleCols.rod_stock_kg && (
                    <td className={`${cellPadding} text-right font-black text-[#B48F48]`} onClick={() => startEdit(row.id, 'rod_stock_kg', row.rod_stock_kg)}>
                      {editingCell?.id === row.id && editingCell?.field === 'rod_stock_kg' ? (
                        <input 
                          type="number" 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveInlineEdit(row.id, 'rod_stock_kg')}
                          className="bg-slate-50 border border-slate-200 text-right text-xs p-0.5 rounded w-20 focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.rod_stock_kg.toLocaleString()}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 p-4 md:p-6">
          <div className="bg-white border border-slate-250 p-6 rounded-2xl w-full max-w-5xl md:max-w-6xl shadow-2xl space-y-4 relative overflow-hidden border-t-4 border-t-[#C5A059] flex flex-col max-h-[90vh]">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-mono">Quick Rebar Rolling entry</h3>
              <p className="text-[10px] text-slate-450 mt-1">Simultaneously log multiple daily bundle rollings, sizes, and charging inputs.</p>
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
                    <div className="w-32 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Date</label>
                      <input 
                        type="date" 
                        value={row.date}
                        onChange={(e) => handleModalRowChange(idx, 'date', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                      />
                    </div>
                    <div className="w-36 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Billet Charged (KG)</label>
                      <input 
                        type="number" 
                        placeholder="11000"
                        value={row.billet_input_kg}
                        onChange={(e) => handleModalRowChange(idx, 'billet_input_kg', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                      />
                    </div>
                    <div className="w-36 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Rod Size</label>
                      <select 
                        value={row.rod_size}
                        onChange={(e) => handleModalRowChange(idx, 'rod_size', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                      >
                        {rodSizes.map((s, i) => <option key={i} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="w-36 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Production (KG)</label>
                      <input 
                        type="number" 
                        placeholder="10500"
                        value={row.rod_production_kg}
                        onChange={(e) => handleModalRowChange(idx, 'rod_production_kg', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
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
                    Save Rolling logs
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
