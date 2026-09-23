'use client';
import { exportToExcel } from '@/lib/excelExport';

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
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

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
    exportToExcel(headers, rows, 'hrms_production_shifts');
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

  // Calculate summary KPI stats
  const totalManpower = filteredData.reduce((sum, r) => sum + Number(r.total_manpower || 0), 0);
  const totalOutput = filteredData.reduce((sum, r) => sum + Number(r.logged_output_kg || 0), 0);
  const zeroAccidentPct = filteredData.length > 0 ? Math.round((filteredData.filter(r => r.safety_incident_logged === 'No').length / filteredData.length) * 100) : 100;

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      
      {/* Enterprise Header Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#B48F48] uppercase tracking-wider font-mono mb-1.5">
            <span>Human Resources & Operations</span>
            <span>•</span>
            <span>Shift Manning & Industrial Safety</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">Crew Roster & Production Shifts</h1>
          <p className="text-sm text-slate-500 font-sans mt-0.5">Shift supervisor assignments, furnace masters, rolling mill operators, helper headcount, and zero-accident safety compliance.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleExportCSV}
            className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer flex flex-wrap items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export CSV</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 md:flex-none px-5 py-2.5 bg-[#B48F48] hover:bg-[#9E7A37] text-white text-sm font-semibold rounded-xl shadow-sm transition-all cursor-pointer flex flex-wrap items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>+ Log Shift Crew</span>
          </button>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Total Shift Manning</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-amber-50 text-amber-700 border border-amber-200">Active Crew</span>
          </div>
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-4">
            <span className="text-3xl font-bold font-mono tracking-tight text-slate-900">{totalManpower}</span>
            <span className="text-xs text-slate-400 font-mono">Personnel On Duty</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Logged Production</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">Output</span>
          </div>
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-4">
            <span className="text-3xl font-bold font-mono tracking-tight text-slate-900">{(totalOutput / 1000).toFixed(1)}</span>
            <span className="text-xs text-slate-400 font-mono">Metric Tons</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Active Shift</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-blue-50 text-blue-700 border border-blue-200">06:00 - 14:00</span>
          </div>
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-4">
            <span className="text-3xl font-bold font-mono tracking-tight text-slate-900">Shift A</span>
            <span className="text-xs text-blue-600 font-mono font-medium">Kabir Ahmed</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Safety Record</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">EHS Certified</span>
          </div>
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-4">
            <span className="text-3xl font-bold font-mono tracking-tight text-emerald-600">{zeroAccidentPct}%</span>
            <span className="text-xs text-emerald-600 font-mono font-medium">Zero Accidents</span>
          </div>
        </div>
      </div>

      {/* Spreadsheet Control Search */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white border border-slate-200/90 p-4 rounded-2xl shadow-xs">
        <input 
          type="text" 
          placeholder="Search by Supervisor or Charge Engineer Name..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-white border border-slate-300 text-sm px-3.5 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059] font-sans text-slate-900"
        />
        <select 
          value={shiftFilter}
          onChange={(e) => setShiftFilter(e.target.value)}
          className="bg-white border border-slate-300 text-sm px-3.5 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059] font-sans text-slate-900"
        >
          <option value="">All Production Shifts</option>
          {shifts.map((s, idx) => <option key={idx} value={s}>Shift {s}</option>)}
        </select>
      </div>

      {/* Full-Screen Sheet Grid Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase font-mono text-slate-500 select-none">
                {visibleCols.date && (
                  <th className={`sticky left-0 bg-slate-50/90 z-10 border-r border-slate-200 ${cellPadding} cursor-pointer hover:text-slate-900 transition-colors`} onClick={() => handleSort('date')}>
                    Date {sortField === 'date' && (sortDir === 'asc' ? '↑' : '↓')}
                  </th>
                )}
                {visibleCols.shift_no && <th className={`${cellPadding}`}>Shift</th>}
                {visibleCols.supervisor_name && <th className={`${cellPadding} cursor-pointer hover:text-slate-900 transition-colors`} onClick={() => handleSort('supervisor_name')}>Supervisor</th>}
                {visibleCols.shift_charge_engineer && <th className={`${cellPadding}`}>Charge Engineer</th>}
                {visibleCols.operator_count && <th className={`${cellPadding} text-right`}>Operators</th>}
                {visibleCols.helper_count && <th className={`${cellPadding} text-right`}>Helpers</th>}
                {visibleCols.total_manpower && <th className={`${cellPadding} text-right text-slate-900 font-bold`}>Total Crew</th>}
                {visibleCols.logged_output_kg && <th className={`${cellPadding} text-right text-emerald-700 font-bold`}>Output (KG)</th>}
                {visibleCols.safety_incident_logged && <th className={`${cellPadding}`}>Safety Record</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/40 transition-colors">
                  {visibleCols.date && (
                    <td className={`sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-150 ${cellPadding} font-bold text-slate-900`}>
                      {row.date}
                    </td>
                  )}
                  {visibleCols.shift_no && (
                    <td className={cellPadding}>
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md font-bold text-xs">
                        Shift {row.shift_no}
                      </span>
                    </td>
                  )}
                  {visibleCols.supervisor_name && (
                    <td className={cellPadding} onClick={() => startEdit(row.id, 'supervisor_name', row.supervisor_name)}>
                      {editingCell?.id === row.id && editingCell?.field === 'supervisor_name' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'supervisor_name')} className="bg-white border border-[#C5A059] rounded px-1 text-xs focus:outline-none font-sans" autoFocus />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded font-sans font-medium text-slate-900">{row.supervisor_name}</span>
                      )}
                    </td>
                  )}
                  {visibleCols.shift_charge_engineer && <td className={`${cellPadding} font-sans text-slate-600`}>{row.shift_charge_engineer}</td>}
                  {visibleCols.operator_count && (
                    <td className={`${cellPadding} text-right`} onClick={() => startEdit(row.id, 'operator_count', row.operator_count)}>
                      {editingCell?.id === row.id && editingCell?.field === 'operator_count' ? (
                        <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'operator_count')} className="bg-white border border-[#C5A059] rounded px-1 text-right w-16 focus:outline-none font-mono text-xs" autoFocus />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.operator_count}</span>
                      )}
                    </td>
                  )}
                  {visibleCols.helper_count && (
                    <td className={`${cellPadding} text-right`} onClick={() => startEdit(row.id, 'helper_count', row.helper_count)}>
                      {editingCell?.id === row.id && editingCell?.field === 'helper_count' ? (
                        <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'helper_count')} className="bg-white border border-[#C5A059] rounded px-1 text-right w-16 focus:outline-none font-mono text-xs" autoFocus />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.helper_count}</span>
                      )}
                    </td>
                  )}
                  {visibleCols.total_manpower && (
                    <td className={`${cellPadding} text-right font-semibold text-slate-900`}>
                      {row.total_manpower}
                    </td>
                  )}
                  {visibleCols.logged_output_kg && (
                    <td className={`${cellPadding} text-right font-bold text-emerald-700`} onClick={() => startEdit(row.id, 'logged_output_kg', row.logged_output_kg)}>
                      {editingCell?.id === row.id && editingCell?.field === 'logged_output_kg' ? (
                        <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'logged_output_kg')} className="bg-white border border-[#C5A059] rounded px-1 text-right w-24 focus:outline-none font-mono text-xs" autoFocus />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.logged_output_kg.toLocaleString()} kg</span>
                      )}
                    </td>
                  )}
                  {visibleCols.safety_incident_logged && (
                    <td className={cellPadding}>
                      <span className={`px-2 py-0.5 text-[11px] font-bold border rounded-full ${
                        row.safety_incident_logged === 'No' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {row.safety_incident_logged === 'No' ? '✓ Zero Incident' : '⚠ Incident Logged'}
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
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200/90 p-6 rounded-2xl w-full max-w-5xl shadow-2xl space-y-4 relative overflow-hidden flex flex-col max-h-[90vh] my-8 animate-zoom-in">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-sans">Log Production Shift Crew</h3>
                <p className="text-xs text-slate-500 font-sans mt-0.5">Record shift supervisors, furnace charge engineers, and manpower headcount.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {validationError && (
              <div className="bg-rose-50 text-rose-800 p-3 rounded-xl border border-rose-200 text-xs font-bold font-mono">
                Error: {validationError}
              </div>
            )}

            <form onSubmit={handleMultiRowSubmit} className="space-y-4 flex-1 overflow-y-auto min-h-0">
              <div className="overflow-x-auto pb-3">
                <div className="space-y-3 min-w-[850px] pr-2">
                {modalRows.map((row, idx) => (
                  <div key={idx} className="flex gap-3 items-end border-b border-slate-100 pb-3 last:border-b-0">
                    <div className="w-36 space-y-1">
                      <label className="text-xs font-semibold text-slate-600 uppercase font-mono">Date</label>
                      <input type="date" value={row.date} onChange={(e) => handleModalRowChange(idx, 'date', e.target.value)} className="w-full bg-white border border-slate-300 text-sm px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059] font-mono text-slate-900" />
                    </div>
                    <div className="w-24 space-y-1">
                      <label className="text-xs font-semibold text-slate-600 uppercase font-mono">Shift</label>
                      <select value={row.shift_no} onChange={(e) => handleModalRowChange(idx, 'shift_no', e.target.value)} className="w-full bg-white border border-slate-300 text-sm px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059] font-sans text-slate-900">
                        {shifts.map((s, i) => <option key={i} value={s}>Shift {s}</option>)}
                      </select>
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-xs font-semibold text-slate-600 uppercase font-mono">Supervisor Name</label>
                      <input type="text" placeholder="Kabir Ahmed" value={row.supervisor_name} onChange={(e) => handleModalRowChange(idx, 'supervisor_name', e.target.value)} className="w-full bg-white border border-slate-300 text-sm px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059] font-sans text-slate-900" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-xs font-semibold text-slate-600 uppercase font-mono">Charge Engineer</label>
                      <input type="text" placeholder="Engr. M. Hasan" value={row.shift_charge_engineer} onChange={(e) => handleModalRowChange(idx, 'shift_charge_engineer', e.target.value)} className="w-full bg-white border border-slate-300 text-sm px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059] font-sans text-slate-900" />
                    </div>
                    <div className="w-20 space-y-1">
                      <label className="text-xs font-semibold text-slate-600 uppercase font-mono">Operators</label>
                      <input type="number" placeholder="12" value={row.operator_count} onChange={(e) => handleModalRowChange(idx, 'operator_count', e.target.value)} className="w-full bg-white border border-slate-300 text-sm px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059] font-mono text-slate-900" />
                    </div>
                    <div className="w-20 space-y-1">
                      <label className="text-xs font-semibold text-slate-600 uppercase font-mono">Helpers</label>
                      <input type="number" placeholder="24" value={row.helper_count} onChange={(e) => handleModalRowChange(idx, 'helper_count', e.target.value)} className="w-full bg-white border border-slate-300 text-sm px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059] font-mono text-slate-900" />
                    </div>
                    <div className="w-28 space-y-1">
                      <label className="text-xs font-semibold text-slate-600 uppercase font-mono">Output (KG)</label>
                      <input type="number" placeholder="22000" value={row.logged_output_kg} onChange={(e) => handleModalRowChange(idx, 'logged_output_kg', e.target.value)} className="w-full bg-white border border-slate-300 text-sm px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059] font-mono text-slate-900" />
                    </div>
                    {modalRows.length > 1 && (
                      <button type="button" onClick={() => removeModalRow(idx)} className="text-rose-550 hover:text-rose-700 font-bold text-xs p-2">✕</button>
                    )}
                  </div>
                ))}
                </div>
              </div>

              <div className="flex flex-wrap justify-between gap-4 items-center pt-3 border-t border-slate-100">
                <button type="button" onClick={addModalRow} className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition-all cursor-pointer">
                  + Add Another Shift
                </button>
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition-all cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 bg-[#B48F48] hover:bg-[#9E7A37] text-white text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer">
                    Save Shift Records
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
