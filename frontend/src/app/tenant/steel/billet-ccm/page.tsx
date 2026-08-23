'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface BilletRow {
  id: number;
  date: string;
  billet_size_section: string;
  billet_output_kg: number;
  scull_loss_kg: number;
  billet_yield_pct: number;
  billet_stock_kg: number;
  heat_no: string;
}

export default function BilletCCMPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';

  // Local state with seed data
  const [data, setData] = useState<BilletRow[]>([
    { id: 1, date: '2026-08-20', billet_size_section: '100x100mm x 6m', billet_output_kg: 10500, scull_loss_kg: 1500, billet_yield_pct: 87.5, billet_stock_kg: 50000, heat_no: 'H-260820A' },
    { id: 2, date: '2026-08-21', billet_size_section: '130x130mm x 6m', billet_output_kg: 11100, scull_loss_kg: 1900, billet_yield_pct: 85.38, billet_stock_kg: 61100, heat_no: 'H-260821A' },
    { id: 3, date: '2026-08-22', billet_size_section: '100x100mm x 6m', billet_output_kg: 10200, scull_loss_kg: 1300, billet_yield_pct: 88.7, billet_stock_kg: 71300, heat_no: 'H-260822A' }
  ]);

  const [heats] = useState<string[]>(['H-260820A', 'H-260821A', 'H-260822A', 'H-260823A', 'H-260823B']);

  // Sheet States
  const [search, setSearch] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [sortField, setSortField] = useState<keyof BilletRow>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Visible Columns Toggle
  const [visibleCols, setVisibleCols] = useState({
    date: true,
    heat_no: true,
    billet_size_section: true,
    billet_output_kg: true,
    scull_loss_kg: true,
    billet_yield_pct: true,
    billet_stock_kg: true
  });
  const [showColMenu, setShowColMenu] = useState(false);

  // Inline Cell Editing State
  const [editingCell, setEditingCell] = useState<{ id: number; field: keyof BilletRow } | null>(null);
  const [editValue, setEditValue] = useState('');

  // Multi-Row Modal Entry
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRows, setModalRows] = useState<any[]>([
    { date: new Date().toISOString().split('T')[0], billet_size_section: '100x100mm x 6m', billet_output_kg: '', heat_no: 'H-260823A' }
  ]);
  const [validationError, setValidationError] = useState('');

  const cellPadding = isCompact ? 'px-3 py-1.5 text-[11px]' : 'px-4 py-2.5 text-xs';
  const sizes = ['100x100mm x 6m', '130x130mm x 6m', '150x150mm x 6m'];

  const handleSort = (field: keyof BilletRow) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const startEdit = (id: number, field: keyof BilletRow, currentVal: any) => {
    setEditingCell({ id, field });
    setEditValue(String(currentVal));
  };

  const saveInlineEdit = (id: number, field: keyof BilletRow) => {
    const updatedRows = data.map(row => {
      if (row.id === id) {
        let val: any = editValue;
        if (field === 'billet_output_kg' || field === 'scull_loss_kg' || field === 'billet_yield_pct' || field === 'billet_stock_kg') {
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
    const headers = ['Date', 'Heat No', 'Billet Size', 'Production Output (kg)', 'Scrap Loss (kg)', 'Yield %', 'Billet Stock (kg)'];
    const rows = filteredData.map(r => [
      r.date, r.heat_no, r.billet_size_section, r.billet_output_kg, r.scull_loss_kg, r.billet_yield_pct, r.billet_stock_kg
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ccm_billet_ledger.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addModalRow = () => {
    setModalRows([
      ...modalRows,
      { date: new Date().toISOString().split('T')[0], billet_size_section: '100x100mm x 6m', billet_output_kg: '', heat_no: heats[modalRows.length % heats.length] || '' }
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
      const output = parseFloat(row.billet_output_kg);

      if (!row.date) return setValidationError(`Row ${i + 1}: Date is required.`);
      if (!row.heat_no) return setValidationError(`Row ${i + 1}: Furnace Heat reference is required.`);
      if (isNaN(output) || output <= 0) return setValidationError(`Row ${i + 1}: Billet Output weight must be positive.`);
    }

    const newEntries = modalRows.map((row, index) => {
      const out = parseFloat(row.billet_output_kg);
      const prevStock = data.length > 0 ? data[data.length - 1].billet_stock_kg : 40000;
      return {
        id: data.length + index + 1,
        date: row.date,
        billet_size_section: row.billet_size_section,
        billet_output_kg: out,
        scull_loss_kg: Math.round(out * 0.12), // estimate scull loss
        billet_yield_pct: 88.0,
        billet_stock_kg: prevStock + out,
        heat_no: row.heat_no
      };
    });

    setData([...data, ...newEntries]);
    setIsModalOpen(false);
    setModalRows([{ date: new Date().toISOString().split('T')[0], billet_size_section: '100x100mm x 6m', billet_output_kg: '', heat_no: 'H-260823A' }]);
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

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      
      {/* Title Bar */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wider font-mono">Billet CCM Casting Ledger</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Logs billet continuous casting machine lengths, output yields, refractory skull losses, and running yard stock levels.</p>
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
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-150 text-[10px] uppercase font-mono text-slate-450">
                {visibleCols.date && (
                  <th className={`sticky left-0 bg-slate-50 z-10 border-r border-slate-100 ${cellPadding} cursor-pointer hover:bg-slate-100`} onClick={() => handleSort('date')}>
                    Date {sortField === 'date' && (sortDir === 'asc' ? '▲' : '▼')}
                  </th>
                )}
                {visibleCols.heat_no && <th className={`${cellPadding} cursor-pointer hover:bg-slate-100`} onClick={() => handleSort('heat_no')}>Heat No</th>}
                {visibleCols.billet_size_section && <th className={`${cellPadding}`}>Billet Size</th>}
                {visibleCols.billet_output_kg && <th className={`${cellPadding} text-right`}>Production Output (KG)</th>}
                {visibleCols.scull_loss_kg && <th className={`${cellPadding} text-right`}>Scrap/Skull Loss (KG)</th>}
                {visibleCols.billet_yield_pct && <th className={`${cellPadding} text-right`}>Billet Yield %</th>}
                {visibleCols.billet_stock_kg && <th className={`${cellPadding} text-right`}>Running Billet Stock (KG)</th>}
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
                  {visibleCols.heat_no && <td className={cellPadding}>{row.heat_no}</td>}
                  {visibleCols.billet_size_section && <td className={cellPadding}>{row.billet_size_section}</td>}
                  {visibleCols.billet_output_kg && (
                    <td className={`${cellPadding} text-right font-semibold`} onClick={() => startEdit(row.id, 'billet_output_kg', row.billet_output_kg)}>
                      {editingCell?.id === row.id && editingCell?.field === 'billet_output_kg' ? (
                        <input 
                          type="number" 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveInlineEdit(row.id, 'billet_output_kg')}
                          className="bg-slate-50 border border-slate-200 text-right text-xs p-0.5 rounded w-20 focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.billet_output_kg.toLocaleString()}</span>
                      )}
                    </td>
                  )}
                  {visibleCols.scull_loss_kg && (
                    <td className={`${cellPadding} text-right font-semibold`} onClick={() => startEdit(row.id, 'scull_loss_kg', row.scull_loss_kg)}>
                      {editingCell?.id === row.id && editingCell?.field === 'scull_loss_kg' ? (
                        <input 
                          type="number" 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveInlineEdit(row.id, 'scull_loss_kg')}
                          className="bg-slate-50 border border-slate-200 text-right text-xs p-0.5 rounded w-20 focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.scull_loss_kg.toLocaleString()}</span>
                      )}
                    </td>
                  )}
                  {visibleCols.billet_yield_pct && (
                    <td className={`${cellPadding} text-right font-bold text-rose-600`}>
                      {row.billet_yield_pct}%
                    </td>
                  )}
                  {visibleCols.billet_stock_kg && (
                    <td className={`${cellPadding} text-right font-black text-[#B48F48]`} onClick={() => startEdit(row.id, 'billet_stock_kg', row.billet_stock_kg)}>
                      {editingCell?.id === row.id && editingCell?.field === 'billet_stock_kg' ? (
                        <input 
                          type="number" 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveInlineEdit(row.id, 'billet_stock_kg')}
                          className="bg-slate-50 border border-slate-200 text-right text-xs p-0.5 rounded w-20 focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.billet_stock_kg.toLocaleString()}</span>
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
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-mono">Quick Billet Cast Entry</h3>
              <p className="text-[10px] text-slate-450 mt-1">Simultaneously log billet output castings from EAF refine heat runs.</p>
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
                    <div className="w-36 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Furnace Heat No</label>
                      <select 
                        value={row.heat_no}
                        onChange={(e) => handleModalRowChange(idx, 'heat_no', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                      >
                        <option value="">Select Heat Reference</option>
                        {heats.map((h, i) => <option key={i} value={h}>{h}</option>)}
                      </select>
                    </div>
                    <div className="w-44 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Billet Size</label>
                      <select 
                        value={row.billet_size_section}
                        onChange={(e) => handleModalRowChange(idx, 'billet_size_section', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                      >
                        {sizes.map((s, i) => <option key={i} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="w-36 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Production (KG)</label>
                      <input 
                        type="number" 
                        placeholder="10000"
                        value={row.billet_output_kg}
                        onChange={(e) => handleModalRowChange(idx, 'billet_output_kg', e.target.value)}
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
                    Save Casting Logs
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
