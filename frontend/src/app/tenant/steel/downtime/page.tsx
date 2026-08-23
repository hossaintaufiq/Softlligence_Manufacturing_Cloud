'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface DowntimeRow {
  id: number;
  date: string;
  section: 'BILLET_LINE' | 'ROLLING_LINE';
  breakdown_category: 'Mechanical' | 'Electrical' | 'Roll Change' | 'Power Outage';
  duration_min: number;
  root_cause_notes: string;
  resolved_by: string;
}

export default function DowntimePage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';
  
  // Data State
  const [data, setData] = useState<DowntimeRow[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Search
  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortField, setSortField] = useState<keyof DowntimeRow>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  
  // Dialog Form
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    section: 'BILLET_LINE' as const,
    breakdown_category: 'Mechanical' as const,
    duration_min: '',
    root_cause_notes: '',
    resolved_by: ''
  });
  const [validationError, setValidationError] = useState('');

  const cellPadding = isCompact ? 'px-4 py-2 text-[11px]' : 'px-5 py-3 text-xs';

  const sections = ['BILLET_LINE', 'ROLLING_LINE'];
  const categories = ['Mechanical', 'Electrical', 'Roll Change', 'Power Outage'];

  async function loadData() {
    try {
      const res = await fetch('/api/downtime');
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

  const handleSort = (field: keyof DowntimeRow) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Section', 'Category', 'Duration (min)', 'Root Cause Notes', 'Resolved By'];
    const rows = filteredData.map(r => [
      r.id, r.date, r.section, r.breakdown_category, r.duration_min, r.root_cause_notes, r.resolved_by
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `breakdown_downtime_log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const duration = parseInt(form.duration_min, 10);

    // Inline Validation
    if (isNaN(duration) || duration <= 0) return setValidationError('Downtime duration must be a positive integer.');
    if (!form.root_cause_notes.trim()) return setValidationError('Root Cause Notes is required.');
    if (!form.resolved_by.trim()) return setValidationError('Resolved By (person/crew) is required.');

    try {
      const res = await fetch('/api/downtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const json = await res.json();
      if (json.success) {
        setIsAddOpen(false);
        setForm({
          date: new Date().toISOString().split('T')[0],
          section: 'BILLET_LINE',
          breakdown_category: 'Mechanical',
          duration_min: '',
          root_cause_notes: '',
          resolved_by: ''
        });
        loadData();
      } else {
        setValidationError(json.error || 'Server error occurred.');
      }
    } catch (err) {
      setValidationError('Failed to connect to backend.');
    }
  };

  // Filter & Sort Logic
  const filteredData = data
    .filter(r => {
      const matchSearch = r.root_cause_notes.toLowerCase().includes(search.toLowerCase()) || 
                          r.resolved_by.toLowerCase().includes(search.toLowerCase());
      const matchSec = sectionFilter ? r.section === sectionFilter : true;
      const matchCat = categoryFilter ? r.breakdown_category === categoryFilter : true;
      return matchSearch && matchSec && matchCat;
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

  const totalDowntimeMin = filteredData.reduce((sum, r) => sum + r.duration_min, 0);

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 ">
      
      {/* Title Bar */}
      <div className="flex justify-between items-center border-b border-slate-200  pb-3.5">
        <div>
          <h2 className="text-base font-extrabold text-slate-900  uppercase tracking-wider font-mono">Downtime & Breakdown Tracker</h2>
          <p className="text-[11px] text-slate-500  mt-0.5">Log line delays, monitor MTTR (Mean Time to Repair), categorize breakdowns, and assign maintenance crews.</p>
        </div>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 bg-[#C5A059] hover:bg-[#B48F48] text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          + Log Line Breakdown
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white  border border-slate-200  p-4 rounded-xl shadow-2xs">
          <p className="text-[9px] text-slate-400  font-bold uppercase font-mono">Total Cumulative Downtime</p>
          <h4 className="text-xl font-black text-slate-900  font-mono mt-1">
            {Math.floor(totalDowntimeMin / 60)}h {totalDowntimeMin % 60}m
          </h4>
          <p className="text-[8px] text-rose-600  font-bold font-mono mt-1">● LINE DURATION OFFLINE</p>
        </div>
        <div className="bg-white  border border-slate-200  p-4 rounded-xl shadow-2xs">
          <p className="text-[9px] text-slate-400  font-bold uppercase font-mono">MTTR (Mean Time to Repair)</p>
          <h4 className="text-xl font-black text-slate-900  font-mono mt-1">
            {filteredData.length > 0 ? (totalDowntimeMin / filteredData.length).toFixed(0) : '0'} mins
          </h4>
          <p className="text-[8px] text-[#B48F48]  font-bold font-mono mt-1">● AVERAGE INCIDENT RESOLUTION</p>
        </div>
        <div className="bg-white  border border-slate-200  p-4 rounded-xl shadow-2xs">
          <p className="text-[9px] text-slate-400  font-bold uppercase font-mono">Breakdown Frequency</p>
          <h4 className="text-xl font-black text-slate-900  font-mono mt-1">{filteredData.length} Incidents</h4>
          <p className="text-[8px] text-indigo-600  font-bold font-mono mt-1">● TOTAL REPORTED BREAKDOWNS</p>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white  border border-slate-200  p-4 rounded-2xl shadow-2xs">
        <input 
          type="text" 
          placeholder="Search by root cause or resolver crew..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-slate-50  border border-slate-200  text-xs px-3 py-2 rounded-xl focus:outline-none"
        />
        <select 
          value={sectionFilter}
          onChange={(e) => setSectionFilter(e.target.value)}
          className="bg-slate-50  border border-slate-200  text-xs px-3 py-2 rounded-xl focus:outline-none"
        >
          <option value="">All Sections</option>
          {sections.map((s, idx) => <option key={idx} value={s}>{s}</option>)}
        </select>
        <select 
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-50  border border-slate-200  text-xs px-3 py-2 rounded-xl focus:outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((c, idx) => <option key={idx} value={c}>{c}</option>)}
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
                <th className={`${cellPadding} cursor-pointer hover:text-slate-800`} onClick={() => handleSort('section')}>Section</th>
                <th className={`${cellPadding} cursor-pointer hover:text-slate-800`} onClick={() => handleSort('breakdown_category')}>Category</th>
                <th className={`${cellPadding} text-right cursor-pointer hover:text-slate-800`} onClick={() => handleSort('duration_min')}>Duration (min)</th>
                <th className={cellPadding}>Root Cause & Breakdown Notes</th>
                <th className={cellPadding}>Resolved By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 ">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-xs text-slate-400  font-mono">Loading incident log...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-xs text-slate-400  font-mono">No downtime incidents recorded.</td>
                </tr>
              ) : filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50  transition-colors">
                  <td className={`${cellPadding} font-mono font-semibold`}>{row.date}</td>
                  <td className={cellPadding}>
                    <span className="px-2 py-0.5 text-[9px] font-bold border rounded-full bg-slate-50  border-slate-200 ">
                      {row.section}
                    </span>
                  </td>
                  <td className={cellPadding}>
                    <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-full ${
                      row.breakdown_category === 'Mechanical' ? 'bg-amber-50  text-amber-600 border-amber-200/50' :
                      row.breakdown_category === 'Electrical' ? 'bg-indigo-50  text-indigo-600 border-indigo-200/50' :
                      row.breakdown_category === 'Roll Change' ? 'bg-emerald-50  text-emerald-600 border-emerald-200/50' :
                      'bg-rose-50  text-rose-600 border-rose-200/50'
                    }`}>
                      {row.breakdown_category}
                    </span>
                  </td>
                  <td className={`${cellPadding} text-right font-mono font-bold text-rose-500`}>{row.duration_min} mins</td>
                  <td className={`${cellPadding} font-medium max-w-[280px] truncate`} title={row.root_cause_notes}>{row.root_cause_notes}</td>
                  <td className={`${cellPadding} font-black text-slate-900 `}>{row.resolved_by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Dialog Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40  backdrop-blur-xs">
          <div className="bg-white  border border-slate-200  p-6 rounded-2xl w-full max-w-md shadow-2xl space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900  uppercase tracking-wider font-mono">Log Line Breakdown Incident</h3>
              <p className="text-[10px] text-slate-450  mt-1">Add details of mechanical, electrical failures or roll changes.</p>
            </div>
            
            {validationError && (
              <div className="bg-rose-50  text-rose-800  p-3 rounded-xl border border-rose-200/50 text-[10px] font-bold font-mono">
                🚨 Error: {validationError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-extrabold text-slate-450 ">Date</label>
                  <input 
                    type="date" 
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full bg-slate-50  border border-slate-200  text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-extrabold text-slate-450 ">Duration (min)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 30"
                    value={form.duration_min}
                    onChange={(e) => setForm({ ...form, duration_min: e.target.value })}
                    className="w-full bg-slate-50  border border-slate-200  text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-extrabold text-slate-450 ">Line Section</label>
                  <select 
                    value={form.section}
                    onChange={(e) => setForm({ ...form, section: e.target.value as any })}
                    className="w-full bg-slate-50  border border-slate-200  text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                  >
                    {sections.map((s, idx) => <option key={idx} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-extrabold text-slate-450 ">Category</label>
                  <select 
                    value={form.breakdown_category}
                    onChange={(e) => setForm({ ...form, breakdown_category: e.target.value as any })}
                    className="w-full bg-slate-50  border border-slate-200  text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                  >
                    {categories.map((c, idx) => <option key={idx} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider font-extrabold text-slate-450 ">Resolved By</label>
                <input 
                  type="text" 
                  placeholder="e.g. Engr. Latif / Shift B crew"
                  value={form.resolved_by}
                  onChange={(e) => setForm({ ...form, resolved_by: e.target.value })}
                  className="w-full bg-slate-50  border border-slate-200  text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider font-extrabold text-slate-450 ">Root Cause & Maintenance Notes</label>
                <textarea 
                  placeholder="Describe failure symptoms and repair operations..."
                  value={form.root_cause_notes}
                  onChange={(e) => setForm({ ...form, root_cause_notes: e.target.value })}
                  className="w-full bg-slate-50  border border-slate-200  text-xs px-2.5 py-1.5 rounded-lg focus:outline-none h-20"
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
                  className="px-4 py-2 bg-[#C5A059] hover:bg-[#B48F48] text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Log Breakdown
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
