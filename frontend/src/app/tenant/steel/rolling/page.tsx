'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface RollingRow {
  id: number;
  date: string;
  billet_input_kg: number;
  rod_size: string;
  rod_production_kg: number;
  burning_loss_kg: number;
  end_cut_loss_kg: number;
  miss_roll_kg: number;
  rod_loss_kg: number;
  rod_yield_pct: number;
}

export default function RollingPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';
  
  // Data State
  const [data, setData] = useState<RollingRow[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Search
  const [search, setSearch] = useState('');
  const [rodSizeFilter, setRodSizeFilter] = useState('');
  const [sortField, setSortField] = useState<keyof RollingRow>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  
  // Dialog Form
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    billet_input_kg: '',
    rod_size: '12mm',
    rod_production_kg: '',
    burning_loss_kg: '',
    end_cut_loss_kg: '',
    miss_roll_kg: ''
  });
  const [validationError, setValidationError] = useState('');

  const cellPadding = isCompact ? 'px-4 py-2 text-[11px]' : 'px-5 py-3 text-xs';

  const rodSizes = ['10mm', '12mm', '16mm', '20mm', '25mm', '32mm'];

  async function loadData() {
    try {
      const res = await fetch('/api/rolling');
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

  const handleSort = (field: keyof RollingRow) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Billet Input (kg)', 'Rod Size', 'Rod Prod (kg)', 'Burning Loss (kg)', 'End Cut Loss (kg)', 'Miss Roll (kg)', 'Total Loss (kg)', 'Yield %'];
    const rows = filteredData.map(r => [
      r.id, r.date, r.billet_input_kg, r.rod_size, r.rod_production_kg, r.burning_loss_kg, r.end_cut_loss_kg, r.miss_roll_kg, r.rod_loss_kg, r.rod_yield_pct
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rolling_mill_rod_production_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const input = parseFloat(form.billet_input_kg);
    const prod = parseFloat(form.rod_production_kg);
    const burning = parseFloat(form.burning_loss_kg);
    const endCut = parseFloat(form.end_cut_loss_kg);
    const miss = parseFloat(form.miss_roll_kg);

    // Inline Validation
    if (isNaN(input) || input <= 0) return setValidationError('Billet Input weight must be positive.');
    if (isNaN(prod) || prod <= 0) return setValidationError('Rod Production weight must be positive.');
    if (isNaN(burning) || burning < 0) return setValidationError('Burning loss must be non-negative.');
    if (isNaN(endCut) || endCut < 0) return setValidationError('End cut loss must be non-negative.');
    if (isNaN(miss) || miss < 0) return setValidationError('Miss roll loss must be non-negative.');
    if (prod > input) return setValidationError('Rod production cannot exceed billet input.');

    try {
      const res = await fetch('/api/rolling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const json = await res.json();
      if (json.success) {
        setIsAddOpen(false);
        setForm({
          date: new Date().toISOString().split('T')[0],
          billet_input_kg: '',
          rod_size: '12mm',
          rod_production_kg: '',
          burning_loss_kg: '',
          end_cut_loss_kg: '',
          miss_roll_kg: ''
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
      const matchSearch = r.rod_size.toLowerCase().includes(search.toLowerCase());
      const matchSize = rodSizeFilter ? r.rod_size === rodSizeFilter : true;
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

  const totalBilletInput = filteredData.reduce((sum, r) => sum + r.billet_input_kg, 0);
  const totalRodProd = filteredData.reduce((sum, r) => sum + r.rod_production_kg, 0);
  const totalBurningLoss = filteredData.reduce((sum, r) => sum + r.burning_loss_kg, 0);
  const totalMissRoll = filteredData.reduce((sum, r) => sum + r.miss_roll_kg, 0);
  
  const avgYield = totalBilletInput > 0 ? ((totalRodProd / totalBilletInput) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 ">
      
      {/* Title Bar */}
      <div className="flex justify-between items-center border-b border-slate-200  pb-3.5">
        <div>
          <h2 className="text-base font-extrabold text-slate-900  uppercase tracking-wider font-mono">Rolling Mill & Rod Production</h2>
          <p className="text-[11px] text-slate-500  mt-0.5">Record billet feeds to the reheating furnace, configure rebar diameters, and track burning, tail-crop, and miss-roll losses.</p>
        </div>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 bg-[#C5A059] hover:bg-[#B48F48] text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          + Log Rolling Run
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white  border border-slate-200  p-4 rounded-xl shadow-2xs">
          <p className="text-[9px] text-slate-400  font-bold uppercase font-mono">Average Rolling Yield</p>
          <h4 className="text-xl font-black text-slate-900  font-mono mt-1">{avgYield}%</h4>
          <p className="text-[8px] text-emerald-600  font-bold font-mono mt-1">● TARGET: &gt;95% EXCELLENT</p>
        </div>
        <div className="bg-white  border border-slate-200  p-4 rounded-xl shadow-2xs">
          <p className="text-[9px] text-slate-400  font-bold uppercase font-mono">Total Rod Production</p>
          <h4 className="text-xl font-black text-slate-900  font-mono mt-1">{(totalRodProd / 1000).toFixed(2)} MT</h4>
          <p className="text-[8px] text-[#B48F48]  font-bold font-mono mt-1">● ADDED TO REBAR YARDS</p>
        </div>
        <div className="bg-white  border border-slate-200  p-4 rounded-xl shadow-2xs">
          <p className="text-[9px] text-slate-400  font-bold uppercase font-mono">Total Furnace Burning Loss</p>
          <h4 className="text-xl font-black text-slate-900  font-mono mt-1">{totalBurningLoss.toLocaleString()} kg</h4>
          <p className="text-[8px] text-amber-600  font-bold font-mono mt-1">● REHEATING SCALE SCRAP</p>
        </div>
        <div className="bg-white  border border-slate-200  p-4 rounded-xl shadow-2xs">
          <p className="text-[9px] text-slate-400  font-bold uppercase font-mono">Total Miss-Roll Scraps</p>
          <h4 className="text-xl font-black text-slate-900  font-mono mt-1">{totalMissRoll.toLocaleString()} kg</h4>
          <p className="text-[8px] text-rose-600  font-bold font-mono mt-1">● MILL COBBLES / ACCIDENTS</p>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white  border border-slate-200  p-4 rounded-2xl shadow-2xs">
        <input 
          type="text" 
          placeholder="Search by rod size..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-slate-50  border border-slate-200  text-xs px-3 py-2 rounded-xl focus:outline-none"
        />
        <select 
          value={rodSizeFilter}
          onChange={(e) => setRodSizeFilter(e.target.value)}
          className="bg-slate-50  border border-slate-200  text-xs px-3 py-2 rounded-xl focus:outline-none"
        >
          <option value="">All Rebar Sizes</option>
          {rodSizes.map((size, idx) => <option key={idx} value={size}>{size}</option>)}
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
                <th className={`${cellPadding} text-right cursor-pointer hover:text-slate-800`} onClick={() => handleSort('billet_input_kg')}>Billet Input (kg)</th>
                <th className={`${cellPadding} cursor-pointer hover:text-slate-800`} onClick={() => handleSort('rod_size')}>Rod Size {sortField === 'rod_size' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                <th className={`${cellPadding} text-right cursor-pointer hover:text-slate-800`} onClick={() => handleSort('rod_production_kg')}>Rod Production (kg)</th>
                <th className={`${cellPadding} text-right`}>Burning Loss (kg)</th>
                <th className={`${cellPadding} text-right`}>End Cut Loss (kg)</th>
                <th className={`${cellPadding} text-right`}>Miss Roll (kg)</th>
                <th className={`${cellPadding} text-right`}>Total Loss (kg)</th>
                <th className={`${cellPadding} text-right cursor-pointer hover:text-slate-800`} onClick={() => handleSort('rod_yield_pct')}>Yield %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 ">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-xs text-slate-400  font-mono">Fetching rolling mill reports...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-xs text-slate-400  font-mono">No rolling logs logged.</td>
                </tr>
              ) : filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50  transition-colors">
                  <td className={`${cellPadding} font-mono font-semibold`}>{row.date}</td>
                  <td className={`${cellPadding} text-right font-mono text-slate-500`}>{row.billet_input_kg.toLocaleString()}</td>
                  <td className={cellPadding}>
                    <span className="px-2 py-0.5 text-[9px] font-bold border rounded-full bg-slate-50  border-slate-200  text-[#B48F48] ">
                      {row.rod_size}
                    </span>
                  </td>
                  <td className={`${cellPadding} text-right font-mono text-emerald-650  font-bold`}>{row.rod_production_kg.toLocaleString()}</td>
                  <td className={`${cellPadding} text-right font-mono text-slate-450`}>{row.burning_loss_kg}</td>
                  <td className={`${cellPadding} text-right font-mono text-slate-450`}>{row.end_cut_loss_kg}</td>
                  <td className={`${cellPadding} text-right font-mono text-rose-500`}>{row.miss_roll_kg}</td>
                  <td className={`${cellPadding} text-right font-mono text-slate-500`}>{row.rod_loss_kg.toLocaleString()}</td>
                  <td className={`${cellPadding} text-right font-mono font-extrabold text-[#B48F48] `}>{row.rod_yield_pct}%</td>
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
              <h3 className="text-sm font-extrabold text-slate-900  uppercase tracking-wider font-mono">Log Rolling Mill Run</h3>
              <p className="text-[10px] text-slate-450  mt-1">Logs production outputs and triggers Billet Yard decrement and Rebar Yard increment.</p>
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
                  <label className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500 font-mono">Rod Size (dia)</label>
                  <select 
                    value={form.rod_size}
                    onChange={(e) => setForm({ ...form, rod_size: e.target.value })}
                    className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#B48F48] font-medium placeholder-slate-400"
                  >
                    {rodSizes.map((s, idx) => <option key={idx} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500 font-mono">Billet Input (kg)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 10000"
                    value={form.billet_input_kg}
                    onChange={(e) => setForm({ ...form, billet_input_kg: e.target.value })}
                    className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#B48F48] font-medium placeholder-slate-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500 font-mono">Rod Production (kg)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 9600"
                    value={form.rod_production_kg}
                    onChange={(e) => setForm({ ...form, rod_production_kg: e.target.value })}
                    className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#B48F48] font-medium placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500 font-mono">Burning (kg)</label>
                  <input 
                    type="number" 
                    placeholder="200"
                    value={form.burning_loss_kg}
                    onChange={(e) => setForm({ ...form, burning_loss_kg: e.target.value })}
                    className="w-full bg-slate-50  border border-slate-200  text-xs px-2 py-1.5 rounded-lg focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500 font-mono">Tail-Cut (kg)</label>
                  <input 
                    type="number" 
                    placeholder="150"
                    value={form.end_cut_loss_kg}
                    onChange={(e) => setForm({ ...form, end_cut_loss_kg: e.target.value })}
                    className="w-full bg-slate-50  border border-slate-200  text-xs px-2 py-1.5 rounded-lg focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500 font-mono">Miss-Roll (kg)</label>
                  <input 
                    type="number" 
                    placeholder="50"
                    value={form.miss_roll_kg}
                    onChange={(e) => setForm({ ...form, miss_roll_kg: e.target.value })}
                    className="w-full bg-slate-50  border border-slate-200  text-xs px-2 py-1.5 rounded-lg focus:outline-none"
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
                  Save Rolling Run
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
