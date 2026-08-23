'use client';

import React, { useState } from 'react';
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
}

export default function FurnaceLogPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';

  // Local state with seed data
  const [data, setData] = useState<FurnaceRow[]>([
    { id: 1, date: '2026-08-20', furnace_no: 'Furnace 01', heat_no: 'H-260820A', scrap_input_kg: 12000, runtime_min: 52, used_patching_powder_kg: 150, used_patching_forma_kg: 1, tapping_temp_c: 1540, liquid_steel_tapped_kg: 10800, power_consumed_kwh: 7200, shift_id: 'A', furnace_master: 'Kabir Ahmed', yield_pct: 90.0 },
    { id: 2, date: '2026-08-21', furnace_no: 'Furnace 01', heat_no: 'H-260821A', scrap_input_kg: 13000, runtime_min: 55, used_patching_powder_kg: 180, used_patching_forma_kg: 1, tapping_temp_c: 1560, liquid_steel_tapped_kg: 11440, power_consumed_kwh: 7800, shift_id: 'B', furnace_master: 'Zahirul Haque', yield_pct: 88.0 },
    { id: 3, date: '2026-08-22', furnace_no: 'Furnace 02', heat_no: 'H-260822A', scrap_input_kg: 11500, runtime_min: 48, used_patching_powder_kg: 120, used_patching_forma_kg: 0, tapping_temp_c: 1550, liquid_steel_tapped_kg: 10465, power_consumed_kwh: 6900, shift_id: 'C', furnace_master: 'Ataur Rahman', yield_pct: 91.0 }
  ]);

  // Sheet States
  const [search, setSearch] = useState('');
  const [furnaceFilter, setFurnaceFilter] = useState('');
  const [sortField, setSortField] = useState<keyof FurnaceRow>('heat_no');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Visible Columns Toggle
  const [visibleCols, setVisibleCols] = useState({
    date: true,
    furnace_no: true,
    heat_no: true,
    scrap_input_kg: true,
    runtime_min: true,
    used_patching_powder_kg: true,
    used_patching_forma_kg: true,
    tapping_temp_c: true,
    liquid_steel_tapped_kg: true,
    power_consumed_kwh: true,
    shift_id: true,
    furnace_master: true,
    yield_pct: true
  });
  const [showColMenu, setShowColMenu] = useState(false);

  // Inline Cell Editing State
  const [editingCell, setEditingCell] = useState<{ id: number; field: keyof FurnaceRow } | null>(null);
  const [editValue, setEditValue] = useState('');

  // Multi-Row Modal Entry
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRows, setModalRows] = useState<any[]>([
    { date: new Date().toISOString().split('T')[0], furnace_no: 'Furnace 01', heat_no: '', scrap_input_kg: '', runtime_min: '', used_patching_powder_kg: '', used_patching_forma_kg: '', tapping_temp_c: '1550', liquid_steel_tapped_kg: '', power_consumed_kwh: '', shift_id: 'A', furnace_master: '' }
  ]);
  const [validationError, setValidationError] = useState('');

  const cellPadding = isCompact ? 'px-3 py-1.5 text-[11px]' : 'px-4 py-2.5 text-xs';
  const furnaces = ['Furnace 01', 'Furnace 02', 'Ladle Furnace LF-01'];
  const shifts = ['A', 'B', 'C', 'General'];

  const handleSort = (field: keyof FurnaceRow) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const startEdit = (id: number, field: keyof FurnaceRow, currentVal: any) => {
    setEditingCell({ id, field });
    setEditValue(String(currentVal));
  };

  const saveInlineEdit = (id: number, field: keyof FurnaceRow) => {
    const updatedRows = data.map(row => {
      if (row.id === id) {
        let val: any = editValue;
        if (field === 'scrap_input_kg' || field === 'runtime_min' || field === 'used_patching_powder_kg' || field === 'used_patching_forma_kg' || field === 'tapping_temp_c' || field === 'liquid_steel_tapped_kg' || field === 'power_consumed_kwh') {
          val = parseFloat(editValue);
          if (isNaN(val)) val = row[field];
        }
        const tapped = field === 'liquid_steel_tapped_kg' ? val : row.liquid_steel_tapped_kg;
        const input = field === 'scrap_input_kg' ? val : row.scrap_input_kg;
        const yield_pct = parseFloat(((tapped / input) * 100).toFixed(2));

        return { ...row, [field]: val, yield_pct };
      }
      return row;
    });

    setData(updatedRows);
    setEditingCell(null);
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Furnace No', 'Heat No', 'Scrap Input (kg)', 'Runtime (Min)', 'Patching Powder (kg)', 'Patching Forma (kg)', 'Tapping Temp (°C)', 'Steel Tapped (kg)', 'Power (kWh)', 'Shift', 'Furnace Master', 'Yield %'];
    const rows = filteredData.map(r => [
      r.date, r.furnace_no, r.heat_no, r.scrap_input_kg, r.runtime_min, r.used_patching_powder_kg, r.used_patching_forma_kg, r.tapping_temp_c, r.liquid_steel_tapped_kg, r.power_consumed_kwh, r.shift_id, r.furnace_master, r.yield_pct
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `furnace_melt_logs.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addModalRow = () => {
    const nextHeat = `H-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}${String.fromCharCode(65 + (modalRows.length % 26))}`;
    setModalRows([
      ...modalRows,
      { date: new Date().toISOString().split('T')[0], furnace_no: 'Furnace 01', heat_no: nextHeat, scrap_input_kg: '', runtime_min: '', used_patching_powder_kg: '', used_patching_forma_kg: '', tapping_temp_c: '1550', liquid_steel_tapped_kg: '', power_consumed_kwh: '', shift_id: 'A', furnace_master: '' }
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
      const input = parseFloat(row.scrap_input_kg);
      const runtime = parseFloat(row.runtime_min);
      const tapped = parseFloat(row.liquid_steel_tapped_kg);
      const kwh = parseFloat(row.power_consumed_kwh);
      const powder = parseFloat(row.used_patching_powder_kg);
      const forma = parseFloat(row.used_patching_forma_kg);

      if (!row.date) return setValidationError(`Row ${i + 1}: Date is required.`);
      if (!row.heat_no.trim()) return setValidationError(`Row ${i + 1}: Heat Number is required.`);
      if (!row.furnace_master.trim()) return setValidationError(`Row ${i + 1}: Furnace Master Name is required.`);
      if (isNaN(input) || input <= 0) return setValidationError(`Row ${i + 1}: Scrap input must be positive.`);
      if (isNaN(runtime) || runtime <= 0) return setValidationError(`Row ${i + 1}: Runtime must be positive.`);
      if (isNaN(tapped) || tapped <= 0) return setValidationError(`Row ${i + 1}: Liquid steel tapped must be positive.`);
      if (isNaN(kwh) || kwh <= 0) return setValidationError(`Row ${i + 1}: Power consumed must be positive.`);
      if (isNaN(powder) || powder < 0) return setValidationError(`Row ${i + 1}: Patching powder must be non-negative.`);
      if (isNaN(forma) || forma < 0) return setValidationError(`Row ${i + 1}: Patching forma must be non-negative.`);
    }

    const newEntries = modalRows.map((row, index) => {
      const input = parseFloat(row.scrap_input_kg);
      const tapped = parseFloat(row.liquid_steel_tapped_kg);
      return {
        id: data.length + index + 1,
        date: row.date,
        furnace_no: row.furnace_no,
        heat_no: row.heat_no,
        scrap_input_kg: input,
        runtime_min: parseFloat(row.runtime_min),
        used_patching_powder_kg: parseFloat(row.used_patching_powder_kg),
        used_patching_forma_kg: parseFloat(row.used_patching_forma_kg),
        tapping_temp_c: parseFloat(row.tapping_temp_c),
        liquid_steel_tapped_kg: tapped,
        power_consumed_kwh: parseFloat(row.power_consumed_kwh),
        shift_id: row.shift_id,
        furnace_master: row.furnace_master,
        yield_pct: parseFloat(((tapped / input) * 100).toFixed(2))
      };
    });

    setData([...data, ...newEntries]);
    setIsModalOpen(false);
    setModalRows([{ date: new Date().toISOString().split('T')[0], furnace_no: 'Furnace 01', heat_no: '', scrap_input_kg: '', runtime_min: '', used_patching_powder_kg: '', used_patching_forma_kg: '', tapping_temp_c: '1550', liquid_steel_tapped_kg: '', power_consumed_kwh: '', shift_id: 'A', furnace_master: '' }]);
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

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      
      {/* Title Bar */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wider font-mono">Furnace Melting Log</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Logs electric arc/ladle refining furnace heats, patching consumables, runtimes, tapping temperatures, and power usage.</p>
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
          placeholder="Filter by Heat No, or Furnace Master..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none"
        />
        <select 
          value={furnaceFilter}
          onChange={(e) => setFurnaceFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none"
        >
          <option value="">All Furnaces</option>
          {furnaces.map((f, idx) => <option key={idx} value={f}>{f}</option>)}
        </select>
      </div>

      {/* Full-Screen Sheet Grid Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1250px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-150 text-[10px] uppercase font-mono text-slate-450">
                {visibleCols.heat_no && (
                  <th className={`sticky left-0 bg-slate-50 z-10 border-r border-slate-100 ${cellPadding} cursor-pointer hover:bg-slate-100`} onClick={() => handleSort('heat_no')}>
                    Heat No {sortField === 'heat_no' && (sortDir === 'asc' ? '▲' : '▼')}
                  </th>
                )}
                {visibleCols.date && <th className={`${cellPadding} cursor-pointer hover:bg-slate-100`} onClick={() => handleSort('date')}>Date</th>}
                {visibleCols.furnace_no && <th className={`${cellPadding}`}>Furnace No</th>}
                {visibleCols.scrap_input_kg && <th className={`${cellPadding} text-right`}>Scrap Input (KG)</th>}
                {visibleCols.runtime_min && <th className={`${cellPadding} text-right`}>Runtime (Min)</th>}
                {visibleCols.used_patching_powder_kg && <th className={`${cellPadding} text-right`}>Powder (KG)</th>}
                {visibleCols.used_patching_forma_kg && <th className={`${cellPadding} text-right`}>Forma (Qty)</th>}
                {visibleCols.tapping_temp_c && <th className={`${cellPadding} text-right`}>Temp (°C)</th>}
                {visibleCols.liquid_steel_tapped_kg && <th className={`${cellPadding} text-right`}>Steel Tapped (KG)</th>}
                {visibleCols.power_consumed_kwh && <th className={`${cellPadding} text-right`}>Power (kWh)</th>}
                {visibleCols.shift_id && <th className={`${cellPadding}`}>Shift ID</th>}
                {visibleCols.furnace_master && <th className={`${cellPadding}`}>Furnace Master</th>}
                {visibleCols.yield_pct && <th className={`${cellPadding} text-right`}>Yield%</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={13} className="text-center py-8 text-xs text-slate-400 font-mono">No records found.</td>
                </tr>
              ) : filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/40 transition-colors">
                  {visibleCols.heat_no && (
                    <td className={`sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-150 ${cellPadding} font-bold text-slate-900`}>
                      {row.heat_no}
                    </td>
                  )}
                  {visibleCols.date && <td className={cellPadding}>{row.date}</td>}
                  {visibleCols.furnace_no && <td className={cellPadding}>{row.furnace_no}</td>}
                  {visibleCols.scrap_input_kg && (
                    <td className={`${cellPadding} text-right font-semibold`} onClick={() => startEdit(row.id, 'scrap_input_kg', row.scrap_input_kg)}>
                      {editingCell?.id === row.id && editingCell?.field === 'scrap_input_kg' ? (
                        <input 
                          type="number" 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveInlineEdit(row.id, 'scrap_input_kg')}
                          className="bg-slate-50 border border-slate-200 text-right text-xs p-0.5 rounded w-20 focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.scrap_input_kg.toLocaleString()}</span>
                      )}
                    </td>
                  )}
                  {visibleCols.runtime_min && (
                    <td className={`${cellPadding} text-right`} onClick={() => startEdit(row.id, 'runtime_min', row.runtime_min)}>
                      {editingCell?.id === row.id && editingCell?.field === 'runtime_min' ? (
                        <input 
                          type="number" 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveInlineEdit(row.id, 'runtime_min')}
                          className="bg-slate-50 border border-slate-200 text-right text-xs p-0.5 rounded w-20 focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.runtime_min} mins</span>
                      )}
                    </td>
                  )}
                  {visibleCols.used_patching_powder_kg && (
                    <td className={`${cellPadding} text-right`} onClick={() => startEdit(row.id, 'used_patching_powder_kg', row.used_patching_powder_kg)}>
                      {editingCell?.id === row.id && editingCell?.field === 'used_patching_powder_kg' ? (
                        <input 
                          type="number" 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveInlineEdit(row.id, 'used_patching_powder_kg')}
                          className="bg-slate-50 border border-slate-200 text-right text-xs p-0.5 rounded w-20 focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.used_patching_powder_kg.toLocaleString()}</span>
                      )}
                    </td>
                  )}
                  {visibleCols.used_patching_forma_kg && (
                    <td className={`${cellPadding} text-right`} onClick={() => startEdit(row.id, 'used_patching_forma_kg', row.used_patching_forma_kg)}>
                      {editingCell?.id === row.id && editingCell?.field === 'used_patching_forma_kg' ? (
                        <input 
                          type="number" 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveInlineEdit(row.id, 'used_patching_forma_kg')}
                          className="bg-slate-50 border border-slate-200 text-right text-xs p-0.5 rounded w-20 focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.used_patching_forma_kg}</span>
                      )}
                    </td>
                  )}
                  {visibleCols.tapping_temp_c && (
                    <td className={`${cellPadding} text-right`} onClick={() => startEdit(row.id, 'tapping_temp_c', row.tapping_temp_c)}>
                      {editingCell?.id === row.id && editingCell?.field === 'tapping_temp_c' ? (
                        <input 
                          type="number" 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveInlineEdit(row.id, 'tapping_temp_c')}
                          className="bg-slate-50 border border-slate-200 text-right text-xs p-0.5 rounded w-20 focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.tapping_temp_c}°C</span>
                      )}
                    </td>
                  )}
                  {visibleCols.liquid_steel_tapped_kg && (
                    <td className={`${cellPadding} text-right font-semibold`} onClick={() => startEdit(row.id, 'liquid_steel_tapped_kg', row.liquid_steel_tapped_kg)}>
                      {editingCell?.id === row.id && editingCell?.field === 'liquid_steel_tapped_kg' ? (
                        <input 
                          type="number" 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveInlineEdit(row.id, 'liquid_steel_tapped_kg')}
                          className="bg-slate-50 border border-slate-200 text-right text-xs p-0.5 rounded w-20 focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.liquid_steel_tapped_kg.toLocaleString()}</span>
                      )}
                    </td>
                  )}
                  {visibleCols.power_consumed_kwh && (
                    <td className={`${cellPadding} text-right`} onClick={() => startEdit(row.id, 'power_consumed_kwh', row.power_consumed_kwh)}>
                      {editingCell?.id === row.id && editingCell?.field === 'power_consumed_kwh' ? (
                        <input 
                          type="number" 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveInlineEdit(row.id, 'power_consumed_kwh')}
                          className="bg-slate-50 border border-slate-200 text-right text-xs p-0.5 rounded w-20 focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.power_consumed_kwh.toLocaleString()}</span>
                      )}
                    </td>
                  )}
                  {visibleCols.shift_id && <td className={cellPadding}>{row.shift_id}</td>}
                  {visibleCols.furnace_master && <td className={cellPadding}>{row.furnace_master}</td>}
                  {visibleCols.yield_pct && (
                    <td className={`${cellPadding} text-right font-black text-rose-600`}>
                      {row.yield_pct}%
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
          <div className="bg-white border border-slate-200/85 p-7 rounded-3xl w-full max-w-5xl shadow-2xl space-y-5 relative overflow-hidden border-t-4 border-t-[#C5A059] flex flex-col max-h-[85vh]">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-mono">Record Furnace Heats</h3>
              <p className="text-[10px] text-slate-450 mt-1">Simultaneously log EAF/LF heats, charged weights, powder logs, tapping parameters, and team supervisors.</p>
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
                    <div className="w-28 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Furnace No</label>
                      <select 
                        value={row.furnace_no}
                        onChange={(e) => handleModalRowChange(idx, 'furnace_no', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                      >
                        {furnaces.map((f, i) => <option key={i} value={f}>{f}</option>)}
                      </select>
                    </div>
                    <div className="w-28 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Heat No</label>
                      <input 
                        type="text" 
                        placeholder="H-2608A"
                        value={row.heat_no}
                        onChange={(e) => handleModalRowChange(idx, 'heat_no', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none font-mono"
                      />
                    </div>
                    <div className="w-20 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Input (kg)</label>
                      <input 
                        type="number" 
                        value={row.scrap_input_kg}
                        onChange={(e) => handleModalRowChange(idx, 'scrap_input_kg', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                      />
                    </div>
                    <div className="w-20 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Runtime (min)</label>
                      <input 
                        type="number" 
                        value={row.runtime_min}
                        onChange={(e) => handleModalRowChange(idx, 'runtime_min', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                      />
                    </div>
                    <div className="w-20 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Powder (kg)</label>
                      <input 
                        type="number" 
                        value={row.used_patching_powder_kg}
                        onChange={(e) => handleModalRowChange(idx, 'used_patching_powder_kg', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                      />
                    </div>
                    <div className="w-20 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Forma (qty)</label>
                      <input 
                        type="number" 
                        value={row.used_patching_forma_kg}
                        onChange={(e) => handleModalRowChange(idx, 'used_patching_forma_kg', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                      />
                    </div>
                    <div className="w-20 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Tapping Temp</label>
                      <input 
                        type="number" 
                        value={row.tapping_temp_c}
                        onChange={(e) => handleModalRowChange(idx, 'tapping_temp_c', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                      />
                    </div>
                    <div className="w-24 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Tapped (kg)</label>
                      <input 
                        type="number" 
                        value={row.liquid_steel_tapped_kg}
                        onChange={(e) => handleModalRowChange(idx, 'liquid_steel_tapped_kg', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                      />
                    </div>
                    <div className="w-20 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Power (kWh)</label>
                      <input 
                        type="number" 
                        value={row.power_consumed_kwh}
                        onChange={(e) => handleModalRowChange(idx, 'power_consumed_kwh', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                      />
                    </div>
                    <div className="w-20 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Shift</label>
                      <select 
                        value={row.shift_id}
                        onChange={(e) => handleModalRowChange(idx, 'shift_id', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                      >
                        {shifts.map((s, i) => <option key={i} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="w-28 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Master Name</label>
                      <input 
                        type="text" 
                        placeholder="Kabir Ahmed"
                        value={row.furnace_master}
                        onChange={(e) => handleModalRowChange(idx, 'furnace_master', e.target.value)}
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
                    Save Heats Logs
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
