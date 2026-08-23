'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface QualityRow {
  id: number;
  heat_no: string;
  test_date: string;
  pct_c: number;
  pct_mn: number;
  pct_si: number;
  pct_s: number;
  pct_p: number;
  pct_ce: number;
  yield_strength_n_mm2: number;
  tensile_strength_n_mm2: number;
  elongation_pct: number;
  bend_test_status: 'Approved' | 'Rejected';
}

export default function QualityPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';
  
  // Data State
  const [data, setData] = useState<QualityRow[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState<keyof QualityRow>('heat_no');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  
  // Dialog Form
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({
    heat_no: '',
    test_date: new Date().toISOString().split('T')[0],
    pct_c: '',
    pct_mn: '',
    pct_si: '',
    pct_s: '',
    pct_p: '',
    yield_strength_n_mm2: '',
    tensile_strength_n_mm2: '',
    elongation_pct: '',
    bend_test_status: 'Approved' as const
  });
  const [validationError, setValidationError] = useState('');

  const cellPadding = isCompact ? 'px-4 py-2 text-[10px]' : 'px-5 py-3 text-xs';

  const statuses = ['Approved', 'Rejected'];

  async function loadData() {
    try {
      const res = await fetch('/api/quality');
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

  const handleSort = (field: keyof QualityRow) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Heat No', 'Test Date', '%C', '%Mn', '%Si', '%S', '%P', '%CE (Carbon Equiv)', 'Yield Strength (N/mm2)', 'Tensile Strength (N/mm2)', 'Elongation %', 'Bend Test Status'];
    const rows = filteredData.map(r => [
      r.id, r.heat_no, r.test_date, r.pct_c, r.pct_mn, r.pct_si, r.pct_s, r.pct_p, r.pct_ce, r.yield_strength_n_mm2, r.tensile_strength_n_mm2, r.elongation_pct, r.bend_test_status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `spectrometry_chemical_physical_reports_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const c = parseFloat(form.pct_c);
    const mn = parseFloat(form.pct_mn);
    const si = parseFloat(form.pct_si);
    const s = parseFloat(form.pct_s);
    const p = parseFloat(form.pct_p);
    const ys = parseFloat(form.yield_strength_n_mm2);
    const ts = parseFloat(form.tensile_strength_n_mm2);
    const el = parseFloat(form.elongation_pct);

    // Inline Validation
    if (!form.heat_no.trim()) return setValidationError('Heat Number is required.');
    if (isNaN(c) || c < 0 || c > 100) return setValidationError('Carbon % must be between 0 and 100.');
    if (isNaN(mn) || mn < 0 || mn > 100) return setValidationError('Manganese % must be between 0 and 100.');
    if (isNaN(si) || si < 0 || si > 100) return setValidationError('Silicon % must be between 0 and 100.');
    if (isNaN(s) || s < 0 || s > 100) return setValidationError('Sulfur % must be between 0 and 100.');
    if (isNaN(p) || p < 0 || p > 100) return setValidationError('Phosphorous % must be between 0 and 100.');
    if (isNaN(ys) || ys <= 0) return setValidationError('Yield Strength must be positive.');
    if (isNaN(ts) || ts <= 0) return setValidationError('Tensile Strength must be positive.');
    if (ys >= ts) return setValidationError('Tensile strength must exceed Yield strength.');
    if (isNaN(el) || el < 0 || el > 100) return setValidationError('Elongation % must be between 0 and 100.');

    try {
      const res = await fetch('/api/quality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const json = await res.json();
      if (json.success) {
        setIsAddOpen(false);
        setForm({
          heat_no: '',
          test_date: new Date().toISOString().split('T')[0],
          pct_c: '',
          pct_mn: '',
          pct_si: '',
          pct_s: '',
          pct_p: '',
          yield_strength_n_mm2: '',
          tensile_strength_n_mm2: '',
          elongation_pct: '',
          bend_test_status: 'Approved'
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
      const matchStatus = statusFilter ? r.bend_test_status === statusFilter : true;
      return matchSearch && matchStatus;
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
    <div className="space-y-6 animate-fade-in text-slate-800 ">
      
      {/* Title Bar */}
      <div className="flex justify-between items-center border-b border-slate-200  pb-3.5">
        <div>
          <h2 className="text-base font-extrabold text-slate-900  uppercase tracking-wider font-mono">Quality Assurance & Spectrometry</h2>
          <p className="text-[11px] text-slate-500  mt-0.5">Spectrometer chemistry analysis reports (%C, %Mn, %Si, %S, %P, %CE) and physical load testing (tensile strengths, elongation %, bend tests).</p>
        </div>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 bg-[#C5A059] hover:bg-[#B48F48] text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          + Record QA Lab Test
        </button>
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
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50  border border-slate-200  text-xs px-3 py-2 rounded-xl focus:outline-none"
        >
          <option value="">All statuses</option>
          {statuses.map((status, idx) => <option key={idx} value={status}>{status}</option>)}
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
                <th className={`${cellPadding} cursor-pointer hover:text-slate-800`} onClick={() => handleSort('heat_no')}>Heat No {sortField === 'heat_no' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                <th className={cellPadding}>Date</th>
                <th className={`${cellPadding} text-right`}>Carbon %C</th>
                <th className={`${cellPadding} text-right`}>Mn %</th>
                <th className={`${cellPadding} text-right`}>Si %</th>
                <th className={`${cellPadding} text-right`}>Sulfur %S</th>
                <th className={`${cellPadding} text-right`}>Phos %P</th>
                <th className={`${cellPadding} text-right cursor-pointer hover:text-slate-800`} onClick={() => handleSort('pct_ce')}>Equiv %CE</th>
                <th className={`${cellPadding} text-right`}>Yield (N/mm²)</th>
                <th className={`${cellPadding} text-right`}>Tensile (N/mm²)</th>
                <th className={`${cellPadding} text-right`}>Elongation %</th>
                <th className={`${cellPadding} text-center`}>180° Bend Test</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 ">
              {loading ? (
                <tr>
                  <td colSpan={12} className="text-center py-8 text-xs text-slate-400  font-mono">Fetching spectrometry reports...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-8 text-xs text-slate-400  font-mono">No spectrometry logs recorded.</td>
                </tr>
              ) : filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50  transition-colors">
                  <td className={`${cellPadding} font-black font-mono`}>{row.heat_no}</td>
                  <td className={`${cellPadding} font-mono text-slate-500`}>{row.test_date}</td>
                  <td className={`${cellPadding} text-right font-mono font-semibold`}>{row.pct_c}%</td>
                  <td className={`${cellPadding} text-right font-mono`}>{row.pct_mn}%</td>
                  <td className={`${cellPadding} text-right font-mono`}>{row.pct_si}%</td>
                  <td className={`${cellPadding} text-right font-mono text-amber-600 `}>{row.pct_s}%</td>
                  <td className={`${cellPadding} text-right font-mono text-amber-600 `}>{row.pct_p}%</td>
                  <td className={`${cellPadding} text-right font-mono font-bold text-[#B48F48] `}>{row.pct_ce}%</td>
                  <td className={`${cellPadding} text-right font-mono`}>{row.yield_strength_n_mm2}</td>
                  <td className={`${cellPadding} text-right font-mono`}>{row.tensile_strength_n_mm2}</td>
                  <td className={`${cellPadding} text-right font-mono`}>{row.elongation_pct}%</td>
                  <td className={`${cellPadding} text-center`}>
                    <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-full ${
                      row.bend_test_status === 'Approved' ? 'bg-emerald-50  text-emerald-600 border-emerald-200/50' : 'bg-rose-50  text-rose-600 border-rose-200/50'
                    }`}>
                      {row.bend_test_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Dialog Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40">
          <div className="bg-white/95 border border-slate-200/85 p-7 rounded-3xl w-full max-w-lg shadow-2xl space-y-5 relative overflow-hidden border-t-4 border-t-[#C5A059] flex flex-col">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900  uppercase tracking-wider font-mono">Record Spectrometry & Physical Test</h3>
              <p className="text-[10px] text-slate-450  mt-1">Logs chemical carbon equivalence indices and structural approvals for safety compliance.</p>
            </div>
            
            {validationError && (
              <div className="bg-rose-50  text-rose-800  p-3 rounded-xl border border-rose-200/50 text-[10px] font-bold font-mono">
                🚨 Error: {validationError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500 font-mono">Heat Number</label>
                  <input 
                    type="text" 
                    placeholder="e.g. H-260823A (Must exist)"
                    value={form.heat_no}
                    onChange={(e) => setForm({ ...form, heat_no: e.target.value })}
                    className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#B48F48] font-medium placeholder-slate-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500 font-mono">Test Date</label>
                  <input 
                    type="date" 
                    value={form.test_date}
                    onChange={(e) => setForm({ ...form, test_date: e.target.value })}
                    className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#B48F48] font-medium placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Chemical fields */}
              <div className="border border-slate-100  p-3 rounded-xl space-y-2">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">1. Chemical Chemistry Spectrograph (%)</p>
                <div className="grid grid-cols-5 gap-2">
                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-slate-450">C%</label>
                    <input type="text" placeholder="0.22" value={form.pct_c} onChange={(e) => setForm({ ...form, pct_c: e.target.value })} className="w-full bg-slate-50  border border-slate-200  text-xs p-1.5 rounded-lg focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-slate-450">Mn%</label>
                    <input type="text" placeholder="0.85" value={form.pct_mn} onChange={(e) => setForm({ ...form, pct_mn: e.target.value })} className="w-full bg-slate-50  border border-slate-200  text-xs p-1.5 rounded-lg focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-slate-450">Si%</label>
                    <input type="text" placeholder="0.24" value={form.pct_si} onChange={(e) => setForm({ ...form, pct_si: e.target.value })} className="w-full bg-slate-50  border border-slate-200  text-xs p-1.5 rounded-lg focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-slate-450">S%</label>
                    <input type="text" placeholder="0.035" value={form.pct_s} onChange={(e) => setForm({ ...form, pct_s: e.target.value })} className="w-full bg-slate-50  border border-slate-200  text-xs p-1.5 rounded-lg focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-slate-450">P%</label>
                    <input type="text" placeholder="0.038" value={form.pct_p} onChange={(e) => setForm({ ...form, pct_p: e.target.value })} className="w-full bg-slate-50  border border-slate-200  text-xs p-1.5 rounded-lg focus:outline-none" />
                  </div>
                </div>
              </div>

              {/* Physical strength fields */}
              <div className="border border-slate-100  p-3 rounded-xl space-y-2">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">2. Physical Mechanical Load Testing</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-slate-450">Yield Strength (N/mm²)</label>
                    <input type="number" placeholder="520" value={form.yield_strength_n_mm2} onChange={(e) => setForm({ ...form, yield_strength_n_mm2: e.target.value })} className="w-full bg-slate-50  border border-slate-200  text-xs p-1.5 rounded-lg focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-slate-450">Tensile Strength (N/mm²)</label>
                    <input type="number" placeholder="635" value={form.tensile_strength_n_mm2} onChange={(e) => setForm({ ...form, tensile_strength_n_mm2: e.target.value })} className="w-full bg-slate-50  border border-slate-200  text-xs p-1.5 rounded-lg focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-slate-450">Elongation (%)</label>
                    <input type="number" placeholder="18" value={form.elongation_pct} onChange={(e) => setForm({ ...form, elongation_pct: e.target.value })} className="w-full bg-slate-50  border border-slate-200  text-xs p-1.5 rounded-lg focus:outline-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500 font-mono">180° Bend Test approval</label>
                <select 
                  value={form.bend_test_status}
                  onChange={(e) => setForm({ ...form, bend_test_status: e.target.value as any })}
                  className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#B48F48] font-medium placeholder-slate-400"
                >
                  {statuses.map((s, idx) => <option key={idx} value={s}>{s}</option>)}
                </select>
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
                  Save QA Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
