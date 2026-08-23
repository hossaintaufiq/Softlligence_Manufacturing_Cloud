'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface ShiftRow {
  id: number;
  date: string;
  shift: 'Shift A' | 'Shift B' | 'Shift C';
  furnace_master: string;
  roll_turner: string;
  operators_present: number;
  attendance_log: string;
}

export default function ShiftsPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';
  
  // Data State
  const [data, setData] = useState<ShiftRow[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Search
  const [search, setSearch] = useState('');
  const [shiftFilter, setShiftFilter] = useState('');
  const [sortField, setSortField] = useState<keyof ShiftRow>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  
  // Dialog Form
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    shift: 'Shift A' as const,
    furnace_master: '',
    roll_turner: '',
    operators_present: '',
    attendance_log: ''
  });
  const [validationError, setValidationError] = useState('');

  const cellPadding = isCompact ? 'px-4 py-2 text-[11px]' : 'px-5 py-3 text-xs';

  const shifts = ['Shift A', 'Shift B', 'Shift C'];

  async function loadData() {
    try {
      const res = await fetch('/api/shifts');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleSort = (field: keyof ShiftRow) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Shift', 'Furnace Master', 'Roll Turner', 'Operators Present', 'Attendance Log / Shift Notes'];
    const rows = filteredData.map(r => [
      r.id, r.date, r.shift, r.furnace_master, r.roll_turner, r.operators_present, r.attendance_log
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `shifts_log_hrms_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const operators = parseInt(form.operators_present, 10);

    // Inline Validation
    if (!form.furnace_master.trim()) return setValidationError('Furnace Master name is required.');
    if (!form.roll_turner.trim()) return setValidationError('Roll Turner name is required.');
    if (isNaN(operators) || operators < 0) return setValidationError('Operators Present must be a positive integer.');
    if (!form.attendance_log.trim()) return setValidationError('Attendance notes / logs is required.');

    try {
      const res = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const json = await res.json();
      if (json.success) {
        setIsAddOpen(false);
        setForm({
          date: new Date().toISOString().split('T')[0],
          shift: 'Shift A',
          furnace_master: '',
          roll_turner: '',
          operators_present: '',
          attendance_log: ''
        });
        loadData();
      } else {
        setValidationError(json.error || 'Server error occurred.');
      }
    } catch (err) {
      setValidationError('Failed to connect to shift operations API.');
    }
  };

  // Filter & Sort Logic
  const filteredData = data
    .filter(r => {
      const matchSearch = r.furnace_master.toLowerCase().includes(search.toLowerCase()) || 
                          r.roll_turner.toLowerCase().includes(search.toLowerCase()) ||
                          r.attendance_log.toLowerCase().includes(search.toLowerCase());
      const matchShift = shiftFilter ? r.shift === shiftFilter : true;
      return matchSearch && matchShift;
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

  const avgAttendance = filteredData.length > 0 
    ? (filteredData.reduce((sum, r) => sum + r.operators_present, 0) / filteredData.length).toFixed(1)
    : '0';

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 ">
      
      {/* Title Bar */}
      <div className="flex justify-between items-center border-b border-slate-200  pb-3.5">
        <div>
          <h2 className="text-base font-extrabold text-slate-900  uppercase tracking-wider font-mono">HRMS & Shift Operations</h2>
          <p className="text-[11px] text-slate-500  mt-0.5">Log daily shift operations (Shift A, B, C), register line crew attendance counts, assign furnace masters and roll-turners.</p>
        </div>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 bg-[#C5A059] hover:bg-[#B48F48] text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          + Log Shift Handover
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
        <div className="bg-white  border border-slate-200  p-4 rounded-xl shadow-2xs">
          <p className="text-[9px] text-slate-450  font-bold uppercase font-mono">Total Recorded Shifts</p>
          <h4 className="text-xl font-black text-slate-900  font-mono mt-1">{filteredData.length} Shifts</h4>
          <p className="text-[8px] text-emerald-600  font-bold font-mono mt-1">● 100% OPERATIONAL UP-TIME</p>
        </div>
        <div className="bg-white  border border-slate-200  p-4 rounded-xl shadow-2xs">
          <p className="text-[9px] text-slate-455  font-bold uppercase font-mono">Average Operators / Shift</p>
          <h4 className="text-xl font-black text-slate-900  font-mono mt-1">{avgAttendance} crew</h4>
          <p className="text-[8px] text-[#B48F48]  font-bold font-mono mt-1">● MINIMUM SHIFT THRESHOLD: 20</p>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white  border border-slate-200  p-4 rounded-2xl shadow-2xs">
        <input 
          type="text" 
          placeholder="Search by furnace master, roll turner, or attendance notes..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-slate-50  border border-slate-200  text-xs px-3 py-2 rounded-xl focus:outline-none"
        />
        <select 
          value={shiftFilter}
          onChange={(e) => setShiftFilter(e.target.value)}
          className="bg-slate-50  border border-slate-200  text-xs px-3 py-2 rounded-xl focus:outline-none"
        >
          <option value="">All Shifts</option>
          {shifts.map((shift, idx) => <option key={idx} value={shift}>{shift}</option>)}
        </select>
        <button 
          onClick={handleExportCSV}
          className="bg-slate-100  hover:bg-slate-200  border border-slate-200  text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
        >
          Download CSV
        </button>
      </div>

      {/* Data Grid Table */}
      <div className="bg-white  border border-slate-200  rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50  border-b border-slate-150  text-[10px] uppercase font-mono text-slate-450 ">
                <th className={`${cellPadding} cursor-pointer hover:text-slate-800`} onClick={() => handleSort('date')}>Date {sortField === 'date' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                <th className={`${cellPadding} cursor-pointer hover:text-slate-800`} onClick={() => handleSort('shift')}>Shift</th>
                <th className={`${cellPadding} cursor-pointer hover:text-slate-800`} onClick={() => handleSort('furnace_master')}>Furnace Master</th>
                <th className={`${cellPadding} cursor-pointer hover:text-slate-800`} onClick={() => handleSort('roll_turner')}>Roll Turner</th>
                <th className={`${cellPadding} text-right cursor-pointer hover:text-slate-800`} onClick={() => handleSort('operators_present')}>Present count</th>
                <th className={cellPadding}>Shift Handover Notes & Logs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 ">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-xs text-slate-400  font-mono">Fetching shift logs...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-xs text-slate-400  font-mono">No shift logs found.</td>
                </tr>
              ) : filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50  transition-colors">
                  <td className={`${cellPadding} font-mono font-semibold`}>{row.date}</td>
                  <td className={cellPadding}>
                    <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-full ${
                      row.shift === 'Shift A' ? 'bg-[#FAF6EE]  text-[#B48F48] border-[#C5A059]/20' :
                      row.shift === 'Shift B' ? 'bg-indigo-50  text-indigo-600 border-indigo-200/50' :
                      'bg-slate-50  text-slate-700  border-slate-200'
                    }`}>
                      {row.shift}
                    </span>
                  </td>
                  <td className={`${cellPadding} font-black text-slate-900 `}>{row.furnace_master}</td>
                  <td className={`${cellPadding} font-semibold`}>{row.roll_turner}</td>
                  <td className={`${cellPadding} text-right font-mono font-extrabold text-emerald-650 `}>{row.operators_present} operators</td>
                  <td className={`${cellPadding} font-medium max-w-[280px] truncate`} title={row.attendance_log}>{row.attendance_log}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Dialog Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40">
          <div className="bg-white/95 border border-slate-200/85 p-7 rounded-3xl w-full max-w-md shadow-2xl space-y-5 relative overflow-hidden border-t-4 border-t-[#C5A059] flex flex-col">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900  uppercase tracking-wider font-mono">Log Shift Handover</h3>
              <p className="text-[10px] text-slate-450  mt-1">Logs furnace control masters, roll setups, and operator attendance roster.</p>
            </div>
            
            {validationError && (
              <div className="bg-rose-50  text-rose-800  p-3 rounded-xl border border-rose-200/50 text-[10px] font-bold font-mono">
                🚨 Error: {validationError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500 font-mono">Date</label>
                  <input 
                    type="date" 
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#B48F48] font-medium placeholder-slate-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500 font-mono">Shift Name</label>
                  <select 
                    value={form.shift}
                    onChange={(e) => setForm({ ...form, shift: e.target.value as any })}
                    className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#B48F48] font-medium placeholder-slate-400"
                  >
                    {shifts.map((s, idx) => <option key={idx} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500 font-mono">Furnace Master</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Kabir Ahmed"
                    value={form.furnace_master}
                    onChange={(e) => setForm({ ...form, furnace_master: e.target.value })}
                    className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#B48F48] font-medium placeholder-slate-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500 font-mono">Roll Turner</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Rashedul Bari"
                    value={form.roll_turner}
                    onChange={(e) => setForm({ ...form, roll_turner: e.target.value })}
                    className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#B48F48] font-medium placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500 font-mono">Operators Present</label>
                <input 
                  type="number" 
                  placeholder="e.g. 24"
                  value={form.operators_present}
                  onChange={(e) => setForm({ ...form, operators_present: e.target.value })}
                  className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#B48F48] font-medium placeholder-slate-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500 font-mono">Shift Notes / Handover log</label>
                <textarea 
                  placeholder="Describe heat achievements, roll changeovers, mechanical issues logged..."
                  value={form.attendance_log}
                  onChange={(e) => setForm({ ...form, attendance_log: e.target.value })}
                  className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#B48F48] font-medium placeholder-slate-400 h-18"
                />
              </div>

              <div className="pt-3 border-t border-slate-100  flex justify-end space-x-2">
                <button 
                  type="button" 
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border border-slate-200  text-slate-650  text-xs font-bold rounded-xl hover:bg-slate-50 "
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-gradient-to-r from-[#B48F48] to-[#C5A059] hover:from-[#C5A059] hover:to-[#B48F48] text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Log Shift Handover
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
