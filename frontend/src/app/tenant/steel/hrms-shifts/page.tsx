'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface ShiftRow {
  id: number;
  date: string;
  shift_no: 'A' | 'B' | 'C' | 'General';
  supervisor_name: string;
  shift_charge_engineer: string;
  operator_count: number;
  helper_count: number;
  total_manpower: number;
  logged_output_kg: number;
  safety_incident_logged: 'Yes' | 'No';
}

export default function HRMSShiftsPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';

  // Local state with seed data
  const [data, setData] = useState<ShiftRow[]>([
    { id: 1, date: '2026-08-20', shift_no: 'A', supervisor_name: 'Imtiaz Uddin', shift_charge_engineer: 'S. M. Nazmul', operator_count: 12, helper_count: 18, total_manpower: 30, logged_output_kg: 10500, safety_incident_logged: 'No' },
    { id: 2, date: '2026-08-21', shift_no: 'B', supervisor_name: 'Jasim Hameed', shift_charge_engineer: 'Fayez Ahmed', operator_count: 14, helper_count: 20, total_manpower: 34, logged_output_kg: 11100, safety_incident_logged: 'No' },
    { id: 3, date: '2026-08-22', shift_no: 'C', supervisor_name: 'Rafiqul Islam', shift_charge_engineer: 'Tariq Al-Amin', operator_count: 10, helper_count: 15, total_manpower: 25, logged_output_kg: 10200, safety_incident_logged: 'Yes' }
  ]);

  // Sheet States
  const [search, setSearch] = useState('');
  const [shiftFilter, setShiftFilter] = useState('');
  const [sortField, setSortField] = useState<keyof ShiftRow>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Visible Columns Toggle
  const [visibleCols, setVisibleCols] = useState({
    date: true,
    shift_no: true,
    supervisor_name: true,
    shift_charge_engineer: true,
    operator_count: true,
    helper_count: true,
    total_manpower: true,
    logged_output_kg: true,
    safety_incident_logged: true
  });
  const [showColMenu, setShowColMenu] = useState(false);

  // Inline Cell Editing State
  const [editingCell, setEditingCell] = useState<{ id: number; field: keyof ShiftRow } | null>(null);
  const [editValue, setEditValue] = useState('');

  // Multi-Row Modal Entry
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRows, setModalRows] = useState<any[]>([
    { date: new Date().toISOString().split('T')[0], shift_no: 'A', supervisor_name: '', shift_charge_engineer: '', operator_count: '', helper_count: '', logged_output_kg: '', safety_incident_logged: 'No' }
  ]);
  const [validationError, setValidationError] = useState('');

  const cellPadding = isCompact ? 'px-3 py-1.5 text-[11px]' : 'px-4 py-2.5 text-xs';
  const shifts = ['A', 'B', 'C', 'General'];

  const handleSort = (field: keyof ShiftRow) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const startEdit = (id: number, field: keyof ShiftRow, currentVal: any) => {
    setEditingCell({ id, field });
    setEditValue(String(currentVal));
  };

  const saveInlineEdit = (id: number, field: keyof ShiftRow) => {
    const updatedRows = data.map(row => {
      if (row.id === id) {
        let val: any = editValue;
        if (field === 'operator_count' || field === 'helper_count' || field === 'logged_output_kg') {
          val = parseFloat(editValue);
          if (isNaN(val)) val = row[field];
        }
        const operators = field === 'operator_count' ? val : row.operator_count;
        const helpers = field === 'helper_count' ? val : row.helper_count;

        return { ...row, [field]: val, total_manpower: operators + helpers };
      }
      return row;
    });

    setData(updatedRows);
    setEditingCell(null);
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Shift No', 'Supervisor Name', 'Charge Engineer', 'Operators', 'Helpers', 'Total Manpower', 'Logged Production (kg)', 'Safety Incident Logged'];
    const rows = filteredData.map(r => [
      r.date, r.shift_no, r.supervisor_name, r.shift_charge_engineer, r.operator_count, r.helper_count, r.total_manpower, r.logged_output_kg, r.safety_incident_logged
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `hrms_production_shifts.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addModalRow = () => {
    setModalRows([
      ...modalRows,
      { date: new Date().toISOString().split('T')[0], shift_no: 'A', supervisor_name: '', shift_charge_engineer: '', operator_count: '', helper_count: '', logged_output_kg: '', safety_incident_logged: 'No' }
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
      const operators = parseFloat(row.operator_count);
      const helpers = parseFloat(row.helper_count);
      const output = parseFloat(row.logged_output_kg);

      if (!row.date) return setValidationError(`Row ${i + 1}: Date is required.`);
      if (!row.supervisor_name.trim()) return setValidationError(`Row ${i + 1}: Supervisor name is required.`);
      if (!row.shift_charge_engineer.trim()) return setValidationError(`Row ${i + 1}: Charge Engineer is required.`);
      if (isNaN(operators) || operators < 0) return setValidationError(`Row ${i + 1}: Operators count must be non-negative.`);
      if (isNaN(helpers) || helpers < 0) return setValidationError(`Row ${i + 1}: Helpers count must be non-negative.`);
      if (isNaN(output) || output < 0) return setValidationError(`Row ${i + 1}: Logged output must be non-negative.`);
    }

    const newEntries = modalRows.map((row, index) => {
      const ops = parseFloat(row.operator_count);
      const hps = parseFloat(row.helper_count);
      return {
        id: data.length + index + 1,
        date: row.date,
        shift_no: row.shift_no,
        supervisor_name: row.supervisor_name,
        shift_charge_engineer: row.shift_charge_engineer,
        operator_count: ops,
        helper_count: hps,
        total_manpower: ops + hps,
        logged_output_kg: parseFloat(row.logged_output_kg),
        safety_incident_logged: row.safety_incident_logged
      };
    });

    setData([...data, ...newEntries]);
    setIsModalOpen(false);
    setModalRows([{ date: new Date().toISOString().split('T')[0], shift_no: 'A', supervisor_name: '', shift_charge_engineer: '', operator_count: '', helper_count: '', logged_output_kg: '', safety_incident_logged: 'No' }]);
  };

  const filteredData = data
    .filter(row => {
      const matchesSearch = row.supervisor_name.toLowerCase().includes(search.toLowerCase()) ||
                            row.shift_charge_engineer.toLowerCase().includes(search.toLowerCase());
      const matchesShift = shiftFilter ? row.shift_no === shiftFilter : true;
      return matchesSearch && matchesShift;
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
          <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wider font-mono">HRMS Production Shift Rosters</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Logs plant shift personnel (operators and helpers count), supervisors, charge engineers, and logged outputs.</p>
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
          placeholder="Search by Supervisor or Charge Engineer Name..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none"
        />
        <select 
          value={shiftFilter}
          onChange={(e) => setShiftFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none"
        >
          <option value="">All Shifts</option>
          {shifts.map((s, idx) => <option key={idx} value={s}>Shift {s}</option>)}
        </select>
      </div>

      {/* Full-Screen Sheet Grid Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-150 text-[10px] uppercase font-mono text-slate-450">
                {visibleCols.date && (
                  <th className={`sticky left-0 bg-slate-50 z-10 border-r border-slate-100 ${cellPadding} cursor-pointer hover:bg-slate-100`} onClick={() => handleSort('date')}>
                    Date {sortField === 'date' && (sortDir === 'asc' ? '▲' : '▼')}
                  </th>
                )}
                {visibleCols.shift_no && <th className={`${cellPadding}`}>Shift</th>}
                {visibleCols.supervisor_name && <th className={`${cellPadding} cursor-pointer hover:bg-slate-100`} onClick={() => handleSort('supervisor_name')}>Supervisor</th>}
                {visibleCols.shift_charge_engineer && <th className={`${cellPadding}`}>Charge Engineer</th>}
                {visibleCols.operator_count && <th className={`${cellPadding} text-right`}>Operators</th>}
                {visibleCols.helper_count && <th className={`${cellPadding} text-right`}>Helpers</th>}
                {visibleCols.total_manpower && <th className={`${cellPadding} text-right`}>Total Manpower</th>}
                {visibleCols.logged_output_kg && <th className={`${cellPadding} text-right`}>Logged Output (KG)</th>}
                {visibleCols.safety_incident_logged && <th className={`${cellPadding}`}>Safety Incident?</th>}
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
                  {visibleCols.shift_no && <td className={cellPadding}>Shift {row.shift_no}</td>}
                  {visibleCols.supervisor_name && (
                    <td className={cellPadding} onClick={() => startEdit(row.id, 'supervisor_name', row.supervisor_name)}>
                      {editingCell?.id === row.id && editingCell?.field === 'supervisor_name' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'supervisor_name')} className="bg-slate-50 border border-slate-200 p-0.5 rounded text-xs focus:outline-none" autoFocus />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.supervisor_name}</span>
                      )}
                    </td>
                  )}
                  {visibleCols.shift_charge_engineer && <td className={cellPadding}>{row.shift_charge_engineer}</td>}
                  {visibleCols.operator_count && (
                    <td className={`${cellPadding} text-right`} onClick={() => startEdit(row.id, 'operator_count', row.operator_count)}>
                      {editingCell?.id === row.id && editingCell?.field === 'operator_count' ? (
                        <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'operator_count')} className="bg-slate-50 border border-slate-200 text-right w-16 p-0.5 rounded text-xs focus:outline-none font-mono" autoFocus />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.operator_count}</span>
                      )}
                    </td>
                  )}
                  {visibleCols.helper_count && (
                    <td className={`${cellPadding} text-right`} onClick={() => startEdit(row.id, 'helper_count', row.helper_count)}>
                      {editingCell?.id === row.id && editingCell?.field === 'helper_count' ? (
                        <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'helper_count')} className="bg-slate-50 border border-slate-200 text-right w-16 p-0.5 rounded text-xs focus:outline-none font-mono" autoFocus />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.helper_count}</span>
                      )}
                    </td>
                  )}
                  {visibleCols.total_manpower && (
                    <td className={`${cellPadding} text-right font-semibold text-[#B48F48]`}>
                      {row.total_manpower}
                    </td>
                  )}
                  {visibleCols.logged_output_kg && (
                    <td className={`${cellPadding} text-right font-bold text-emerald-600`} onClick={() => startEdit(row.id, 'logged_output_kg', row.logged_output_kg)}>
                      {editingCell?.id === row.id && editingCell?.field === 'logged_output_kg' ? (
                        <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'logged_output_kg')} className="bg-slate-50 border border-slate-200 text-right w-24 p-0.5 rounded text-xs focus:outline-none font-mono" autoFocus />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.logged_output_kg.toLocaleString()} kg</span>
                      )}
                    </td>
                  )}
                  {visibleCols.safety_incident_logged && (
                    <td className={cellPadding}>
                      <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-full ${
                        row.safety_incident_logged === 'No' ? 'bg-emerald-50 text-emerald-650 border-emerald-250/20' : 'bg-rose-50 text-rose-650 border-rose-250/20'
                      }`}>
                        {row.safety_incident_logged}
                      </span>
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
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-mono">Create Shift Log entries</h3>
              <p className="text-[10px] text-slate-450 mt-1">Simultaneously log multiple shift manpower balances and safety rosters.</p>
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
                    <div className="w-28 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Date</label>
                      <input type="date" value={row.date} onChange={(e) => handleModalRowChange(idx, 'date', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded focus:outline-none" />
                    </div>
                    <div className="w-24 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Shift</label>
                      <select value={row.shift_no} onChange={(e) => handleModalRowChange(idx, 'shift_no', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded focus:outline-none">
                        {shifts.map((s, i) => <option key={i} value={s}>Shift {s}</option>)}
                      </select>
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Supervisor</label>
                      <input type="text" placeholder="Supervisor Name" value={row.supervisor_name} onChange={(e) => handleModalRowChange(idx, 'supervisor_name', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded focus:outline-none font-mono" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Charge Engineer</label>
                      <input type="text" placeholder="Engineer Name" value={row.shift_charge_engineer} onChange={(e) => handleModalRowChange(idx, 'shift_charge_engineer', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded focus:outline-none font-mono" />
                    </div>
                    <div className="w-16 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Operators</label>
                      <input type="number" placeholder="10" value={row.operator_count} onChange={(e) => handleModalRowChange(idx, 'operator_count', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded focus:outline-none font-mono" />
                    </div>
                    <div className="w-16 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Helpers</label>
                      <input type="number" placeholder="15" value={row.helper_count} onChange={(e) => handleModalRowChange(idx, 'helper_count', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded focus:outline-none font-mono" />
                    </div>
                    <div className="w-24 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Output (KG)</label>
                      <input type="number" placeholder="10000" value={row.logged_output_kg} onChange={(e) => handleModalRowChange(idx, 'logged_output_kg', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded focus:outline-none font-mono" />
                    </div>
                    <div className="w-24 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Incident?</label>
                      <select value={row.safety_incident_logged} onChange={(e) => handleModalRowChange(idx, 'safety_incident_logged', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded focus:outline-none">
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                    {modalRows.length > 1 && (
                      <button type="button" onClick={() => removeModalRow(idx)} className="text-red-500 hover:text-red-750 pb-2.5 font-bold cursor-pointer">✕</button>
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
                    Save Shift Logs
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
