'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface BilletRow {
  id: number;
  heat_no: string;
  billet_size_section: string;
  billet_output_kg: number;
  scull_loss_kg: number;
  scrap_loss_kg: number;
  billet_yield_pct: number;
}

export default function BilletPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';
  
  // Data State
  const [data, setData] = useState<BilletRow[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Search
  const [search, setSearch] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [sortField, setSortField] = useState<keyof BilletRow>('heat_no');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  
  // Dialog Form
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({
    heat_no: '',
    billet_size_section: '100x100 mm',
    billet_output_kg: '',
    scull_loss_kg: ''
  });
  const [validationError, setValidationError] = useState('');

  const cellPadding = isCompact ? 'px-4 py-2 text-[11px]' : 'px-5 py-3 text-xs';

  const sizeSections = ['100x100 mm', '130x130 mm', '150x150 mm'];

  async function loadData() {
    try {
      const res = await fetch('/api/billet');
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

  const handleSort = (field: keyof BilletRow) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Heat No', 'Billet Size', 'Billet Output (kg)', 'Scull Loss (kg)', 'Scrap Loss (kg)', 'Yield %'];
    const rows = filteredData.map(r => [
      r.id, r.heat_no, r.billet_size_section, r.billet_output_kg, r.scull_loss_kg, r.scrap_loss_kg, r.billet_yield_pct
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ccm_billet_production_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const output = parseFloat(form.billet_output_kg);
    const scull = parseFloat(form.scull_loss_kg);

    // Inline Validation
    if (!form.heat_no.trim()) return setValidationError('Heat Number is required.');
    if (isNaN(output) || output <= 0) return setValidationError('Billet production output must be positive.');
    if (isNaN(scull) || scull < 0) return setValidationError('Scull loss must be non-negative.');

    try {
      const res = await fetch('/api/billet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const json = await res.json();
      if (json.success) {
        setIsAddOpen(false);
        setForm({
          heat_no: '',
          billet_size_section: '100x100 mm',
          billet_output_kg: '',
          scull_loss_kg: ''
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
      const matchSearch = r.heat_no.toLowerCase().includes(search.toLowerCase());
      const matchSize = sizeFilter ? r.billet_size_section === sizeFilter : true;
      return matchSearch && matchSize;
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

  const totalBilletProduction = filteredData.reduce((sum, r) => sum + r.billet_output_kg, 0);
  const totalScullLoss = filteredData.reduce((sum, r) => sum + r.scull_loss_kg, 0);
  const totalScrapLoss = filteredData.reduce((sum, r) => sum + r.scrap_loss_kg, 0);

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 ">
      
      {/* Title Bar */}
      <div className="flex justify-between items-center border-b border-slate-200  pb-3.5">
        <div>
          <h2 className="text-base font-extrabold text-slate-900  uppercase tracking-wider font-mono">Billet Continuous Casting Machine (CCM)</h2>
          <p className="text-[11px] text-slate-500  mt-0.5">Manage billet casting sections, track scrap/scull losses, and monitor casting machine efficiencies.</p>
        </div>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 bg-[#C5A059] hover:bg-[#B48F48] text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          + Log Casting Output
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white  border border-slate-200  p-4 rounded-xl shadow-2xs">
          <p className="text-[9px] text-slate-400  font-bold uppercase font-mono">Total Billet Output</p>
          <h4 className="text-xl font-black text-slate-900  font-mono mt-1">{(totalBilletProduction / 1000).toFixed(2)} MT</h4>
          <p className="text-[8px] text-emerald-600  font-bold font-mono mt-1">● ADDED TO BILLET YARD</p>
        </div>
        <div className="bg-white  border border-slate-200  p-4 rounded-xl shadow-2xs">
          <p className="text-[9px] text-slate-400  font-bold uppercase font-mono">Total Scull Loss</p>
          <h4 className="text-xl font-black text-slate-900  font-mono mt-1">{totalScullLoss.toLocaleString()} kg</h4>
          <p className="text-[8px] text-amber-600  font-bold font-mono mt-1">● LADLE/TUNDISH RESIDUE</p>
        </div>
        <div className="bg-white  border border-slate-200  p-4 rounded-xl shadow-2xs">
          <p className="text-[9px] text-slate-400  font-bold uppercase font-mono">Total Scrap Loss</p>
          <h4 className="text-xl font-black text-slate-900  font-mono mt-1">{totalScrapLoss.toLocaleString()} kg</h4>
          <p className="text-[8px] text-indigo-600  font-bold font-mono mt-1">● SOLID LOSS (INPUT - BILLET)</p>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white  border border-slate-200  p-4 rounded-2xl shadow-2xs">
        <input 
          type="text" 
          placeholder="Search by heat number..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-slate-50  border border-slate-200  text-xs px-3 py-2 rounded-xl focus:outline-none"
        />
        <select 
          value={sizeFilter}
          onChange={(e) => setSizeFilter(e.target.value)}
          className="bg-slate-50  border border-slate-200  text-xs px-3 py-2 rounded-xl focus:outline-none"
        >
          <option value="">All Sizes</option>
          {sizeSections.map((size, idx) => <option key={idx} value={size}>{size}</option>)}
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
                <th className={`${cellPadding} cursor-pointer hover:text-slate-800`} onClick={() => handleSort('heat_no')}>Heat Number {sortField === 'heat_no' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                <th className={`${cellPadding} cursor-pointer hover:text-slate-800`} onClick={() => handleSort('billet_size_section')}>Billet Size</th>
                <th className={`${cellPadding} text-right cursor-pointer hover:text-slate-800`} onClick={() => handleSort('billet_output_kg')}>Billet Output (kg)</th>
                <th className={`${cellPadding} text-right`}>Scull Loss (kg)</th>
                <th className={`${cellPadding} text-right`}>Scrap Loss (kg)</th>
                <th className={`${cellPadding} text-right cursor-pointer hover:text-slate-800`} onClick={() => handleSort('billet_yield_pct')}>Yield %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 ">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-xs text-slate-400  font-mono">Fetching casting logs...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-xs text-slate-400  font-mono">No casting output recorded.</td>
                </tr>
              ) : filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50  transition-colors">
                  <td className={`${cellPadding} font-black font-mono`}>{row.heat_no}</td>
                  <td className={cellPadding}>
                    <span className="px-2 py-0.5 text-[9px] font-bold border rounded-full bg-slate-50  border-slate-200 ">
                      {row.billet_size_section}
                    </span>
                  </td>
                  <td className={`${cellPadding} text-right font-mono text-emerald-650  font-bold`}>{row.billet_output_kg.toLocaleString()} kg</td>
                  <td className={`${cellPadding} text-right font-mono text-slate-500`}>{row.scull_loss_kg} kg</td>
                  <td className={`${cellPadding} text-right font-mono text-slate-500`}>{row.scrap_loss_kg.toLocaleString()} kg</td>
                  <td className={`${cellPadding} text-right font-mono font-extrabold text-[#B48F48] `}>{row.billet_yield_pct}%</td>
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
              <h3 className="text-sm font-extrabold text-slate-900  uppercase tracking-wider font-mono">Log CCM casting run</h3>
              <p className="text-[10px] text-slate-450  mt-1">Logs billet sections and updates the Billet Yard inventory levels in real-time.</p>
            </div>
            
            {validationError && (
              <div className="bg-rose-50  text-rose-800  p-3 rounded-xl border border-rose-200/50 text-[10px] font-bold font-mono">
                🚨 Error: {validationError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500 font-mono">Heat Number</label>
                <input 
                  type="text" 
                  placeholder="e.g. H-260823A (Must match a logged heat)"
                  value={form.heat_no}
                  onChange={(e) => setForm({ ...form, heat_no: e.target.value })}
                  className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#B48F48] font-medium placeholder-slate-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500 font-mono">Billet Size Section</label>
                <select 
                  value={form.billet_size_section}
                  onChange={(e) => setForm({ ...form, billet_size_section: e.target.value })}
                  className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#B48F48] font-medium placeholder-slate-400"
                >
                  {sizeSections.map((s, idx) => <option key={idx} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500 font-mono">Billet Output (kg)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 10800"
                    value={form.billet_output_kg}
                    onChange={(e) => setForm({ ...form, billet_output_kg: e.target.value })}
                    className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#B48F48] font-medium placeholder-slate-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500 font-mono">Scull Loss (kg)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 150"
                    value={form.scull_loss_kg}
                    onChange={(e) => setForm({ ...form, scull_loss_kg: e.target.value })}
                    className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#B48F48] font-medium placeholder-slate-400"
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
                  className="px-5 py-2.5 bg-gradient-to-r from-[#B48F48] to-[#C5A059] hover:from-[#C5A059] hover:to-[#B48F48] text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Log Casting Run
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
