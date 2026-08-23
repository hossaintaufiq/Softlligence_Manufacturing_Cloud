'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface FurnaceRow {
  id: number;
  date: string;
  furnace_id: string;
  heat_no: string;
  scrap_input_kg: number;
  runtime_min: number;
  patching_powder_kg: number;
  patching_forma_kg: number;
  liquid_steel_tapped_kg: number;
  yield_pct: number;
}

export default function FurnacePage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';
  
  // Data State
  const [data, setData] = useState<FurnaceRow[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Search
  const [search, setSearch] = useState('');
  const [furnaceFilter, setFurnaceFilter] = useState('');
  const [sortField, setSortField] = useState<keyof FurnaceRow>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  
  // Dialog Form
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    furnace_id: 'EAF-01',
    heat_no: '',
    scrap_input_kg: '',
    runtime_min: '',
    patching_powder_kg: '',
    patching_forma_kg: '',
    liquid_steel_tapped_kg: ''
  });
  const [validationError, setValidationError] = useState('');

  const cellPadding = isCompact ? 'px-4 py-2 text-[11px]' : 'px-5 py-3 text-xs';

  const furnaceIds = ['EAF-01', 'EAF-02', 'LRF-01', 'LRF-02'];

  async function loadData() {
    try {
      const res = await fetch('/api/furnace');
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

  const handleSort = (field: keyof FurnaceRow) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Furnace ID', 'Heat No', 'Scrap Input (kg)', 'Runtime (min)', 'Powder (kg)', 'Forma (kg)', 'Liquid Tapped (kg)', 'Yield %'];
    const rows = filteredData.map(r => [
      r.id, r.date, r.furnace_id, r.heat_no, r.scrap_input_kg, r.runtime_min, r.patching_powder_kg, r.patching_forma_kg, r.liquid_steel_tapped_kg, r.yield_pct
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `furnace_melt_log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const scrap = parseFloat(form.scrap_input_kg);
    const runtime = parseInt(form.runtime_min, 10);
    const powder = parseFloat(form.patching_powder_kg);
    const forma = parseFloat(form.patching_forma_kg);
    const tapped = parseFloat(form.liquid_steel_tapped_kg);

    // Inline Validation
    if (!form.heat_no.trim()) return setValidationError('Heat Number is required.');
    if (isNaN(scrap) || scrap <= 0) return setValidationError('Scrap input must be positive.');
    if (isNaN(runtime) || runtime <= 0) return setValidationError('Runtime must be positive.');
    if (isNaN(powder) || powder < 0) return setValidationError('Patching powder must be a non-negative number.');
    if (isNaN(forma) || forma < 0) return setValidationError('Patching forma must be a non-negative number.');
    if (isNaN(tapped) || tapped <= 0) return setValidationError('Liquid steel tapped must be positive.');
    if (tapped > scrap) return setValidationError('Liquid steel tapped cannot exceed input scrap weight.');

    try {
      const res = await fetch('/api/furnace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const json = await res.json();
      if (json.success) {
        setIsAddOpen(false);
        setForm({
          date: new Date().toISOString().split('T')[0],
          furnace_id: 'EAF-01',
          heat_no: '',
          scrap_input_kg: '',
          runtime_min: '',
          patching_powder_kg: '',
          patching_forma_kg: '',
          liquid_steel_tapped_kg: ''
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
      const matchSearch = r.heat_no.toLowerCase().includes(search.toLowerCase()) || 
                          r.furnace_id.toLowerCase().includes(search.toLowerCase());
      const matchFurnace = furnaceFilter ? r.furnace_id === furnaceFilter : true;
      return matchSearch && matchFurnace;
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

  // Average Yield Calculation
  const totalScrap = filteredData.reduce((sum, r) => sum + r.scrap_input_kg, 0);
  const totalTapped = filteredData.reduce((sum, r) => sum + r.liquid_steel_tapped_kg, 0);
  const avgYield = totalScrap > 0 ? ((totalTapped / totalScrap) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 ">
      
      {/* Title Bar */}
      <div className="flex justify-between items-center border-b border-slate-200  pb-3.5">
        <div>
          <h2 className="text-base font-extrabold text-slate-900  uppercase tracking-wider font-mono">Furnace & Melt Shop Log</h2>
          <p className="text-[11px] text-slate-500  mt-0.5">Track electric arc furnace (EAF) charge weights, cycle times, patching chemicals, and tapped yield percentages.</p>
        </div>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 bg-[#C5A059] hover:bg-[#B48F48] text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          + Log Heat Cycle
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white  border border-slate-200  p-4 rounded-xl shadow-2xs">
          <p className="text-[9px] text-slate-400  font-bold uppercase font-mono">Average Melt Yield</p>
          <h4 className="text-xl font-black text-slate-900  font-mono mt-1">{avgYield}%</h4>
          <p className="text-[8px] text-emerald-600  font-bold font-mono mt-1">● TARGET: 88-92% OPTIMAL</p>
        </div>
        <div className="bg-white  border border-slate-200  p-4 rounded-xl shadow-2xs">
          <p className="text-[9px] text-slate-400  font-bold uppercase font-mono">Total Liquid Steel Tapped</p>
          <h4 className="text-xl font-black text-slate-900  font-mono mt-1">{(totalTapped / 1000).toFixed(2)} MT</h4>
          <p className="text-[8px] text-[#B48F48]  font-bold font-mono mt-1">● CHARGED HEATS COMBINED</p>
        </div>
        <div className="bg-white  border border-slate-200  p-4 rounded-xl shadow-2xs">
          <p className="text-[9px] text-slate-400  font-bold uppercase font-mono">Average Cycle Time</p>
          <h4 className="text-xl font-black text-slate-900  font-mono mt-1">
            {filteredData.length > 0 
              ? (filteredData.reduce((sum, r) => sum + r.runtime_min, 0) / filteredData.length).toFixed(0) 
              : '0'} mins
          </h4>
          <p className="text-[8px] text-indigo-600  font-bold font-mono mt-1">● POWER-ON TO TAP DURATION</p>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white  border border-slate-200  p-4 rounded-2xl shadow-2xs">
        <input 
          type="text" 
          placeholder="Search by heat number or furnace ID..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-slate-50  border border-slate-200  text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-[#C5A059]"
        />
        <select 
          value={furnaceFilter}
          onChange={(e) => setFurnaceFilter(e.target.value)}
          className="bg-slate-50  border border-slate-200  text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-[#C5A059]"
        >
          <option value="">All Furnaces</option>
          {furnaceIds.map((id, idx) => <option key={idx} value={id}>{id}</option>)}
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
                <th className={`${cellPadding} cursor-pointer hover:text-slate-800`} onClick={() => handleSort('furnace_id')}>Furnace ID</th>
                <th className={`${cellPadding} cursor-pointer hover:text-slate-800`} onClick={() => handleSort('heat_no')}>Heat No {sortField === 'heat_no' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                <th className={`${cellPadding} text-right cursor-pointer hover:text-slate-800`} onClick={() => handleSort('scrap_input_kg')}>Scrap Input (kg)</th>
                <th className={`${cellPadding} text-right cursor-pointer hover:text-slate-800`} onClick={() => handleSort('runtime_min')}>Cycle Time (min)</th>
                <th className={`${cellPadding} text-right`}>Forma Powder (kg)</th>
                <th className={`${cellPadding} text-right`}>Patching Forma (kg)</th>
                <th className={`${cellPadding} text-right cursor-pointer hover:text-slate-800`} onClick={() => handleSort('liquid_steel_tapped_kg')}>Tapped steel (kg)</th>
                <th className={`${cellPadding} text-right cursor-pointer hover:text-slate-800`} onClick={() => handleSort('yield_pct')}>Yield %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 ">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-xs text-slate-400  font-mono">Fetching melt log logs...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-xs text-slate-400  font-mono">No heat logs logged.</td>
                </tr>
              ) : filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50  transition-colors">
                  <td className={`${cellPadding} font-mono font-semibold`}>{row.date}</td>
                  <td className={cellPadding}>
                    <span className="px-2 py-0.5 text-[9px] font-bold border rounded-full bg-slate-50  border-slate-200 ">
                      {row.furnace_id}
                    </span>
                  </td>
                  <td className={`${cellPadding} font-black font-mono`}>{row.heat_no}</td>
                  <td className={`${cellPadding} text-right font-mono`}>{row.scrap_input_kg.toLocaleString()}</td>
                  <td className={`${cellPadding} text-right font-mono font-semibold text-indigo-650 `}>{row.runtime_min} mins</td>
                  <td className={`${cellPadding} text-right font-mono`}>{row.patching_powder_kg}</td>
                  <td className={`${cellPadding} text-right font-mono`}>{row.patching_forma_kg}</td>
                  <td className={`${cellPadding} text-right font-mono text-emerald-650  font-bold`}>{row.liquid_steel_tapped_kg.toLocaleString()}</td>
                  <td className={`${cellPadding} text-right font-mono font-extrabold text-[#B48F48] `}>{row.yield_pct}%</td>
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
              <h3 className="text-sm font-extrabold text-slate-900  uppercase tracking-wider font-mono">Log furnace charge cycle</h3>
              <p className="text-[10px] text-slate-450  mt-1">Saves heat calculations and triggers deductions from the Raw Scrap Yard inventory.</p>
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
                  <label className="text-[9px] uppercase tracking-wider font-extrabold text-slate-450 ">Furnace ID</label>
                  <select 
                    value={form.furnace_id}
                    onChange={(e) => setForm({ ...form, furnace_id: e.target.value })}
                    className="w-full bg-slate-50  border border-slate-200  text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                  >
                    {furnaceIds.map((fId, idx) => <option key={idx} value={fId}>{fId}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-extrabold text-slate-450 ">Heat Number</label>
                  <input 
                    type="text" 
                    placeholder="H-260823X"
                    value={form.heat_no}
                    onChange={(e) => setForm({ ...form, heat_no: e.target.value })}
                    className="w-full bg-slate-50  border border-slate-200  text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-extrabold text-slate-450 ">Cycle Time (min)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 50"
                    value={form.runtime_min}
                    onChange={(e) => setForm({ ...form, runtime_min: e.target.value })}
                    className="w-full bg-slate-50  border border-slate-200  text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-extrabold text-slate-450 ">Scrap Input (kg)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 12000"
                    value={form.scrap_input_kg}
                    onChange={(e) => setForm({ ...form, scrap_input_kg: e.target.value })}
                    className="w-full bg-slate-50  border border-slate-200  text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-extrabold text-slate-450 ">Liquid Steel Tapped (kg)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 11000"
                    value={form.liquid_steel_tapped_kg}
                    onChange={(e) => setForm({ ...form, liquid_steel_tapped_kg: e.target.value })}
                    className="w-full bg-slate-50  border border-slate-200  text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-extrabold text-slate-450 ">Forma Powder (kg)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 150"
                    value={form.patching_powder_kg}
                    onChange={(e) => setForm({ ...form, patching_powder_kg: e.target.value })}
                    className="w-full bg-slate-50  border border-slate-200  text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-extrabold text-slate-450 ">Patching Forma (kg)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 45"
                    value={form.patching_forma_kg}
                    onChange={(e) => setForm({ ...form, patching_forma_kg: e.target.value })}
                    className="w-full bg-slate-50  border border-slate-200  text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                  />
                </div>
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
                  Log Heat Cycle & Tap
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
