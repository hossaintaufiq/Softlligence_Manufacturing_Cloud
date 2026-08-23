'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface ScrapRow {
  id: number;
  date: string;
  supplier_name: string;
  scrap_category: string;
  truck_no: string;
  gross_weight: number;
  tare_weight: number;
  net_received_kg: number;
  rate_per_kg: number;
  total_cost: number;
}

export default function ScrapPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';
  
  // Data State
  const [data, setData] = useState<ScrapRow[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Search
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortField, setSortField] = useState<keyof ScrapRow>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  
  // Dialog Form
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    supplier_name: '',
    scrap_category: 'LC Scrap',
    truck_no: '',
    gross_weight: '',
    tare_weight: '',
    rate_per_kg: ''
  });
  const [validationError, setValidationError] = useState('');

  const cellPadding = isCompact ? 'px-4 py-2 text-[11px]' : 'px-5 py-3 text-xs';

  const categories = ['LC Scrap', 'Rolling Kechi', 'Tin Bundle', 'Plate Cutting', 'Heavy Melting', 'Others'];

  async function loadData() {
    try {
      const res = await fetch('/api/scrap');
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

  const handleSort = (field: keyof ScrapRow) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Supplier Name', 'Category', 'Truck No', 'Gross (kg)', 'Tare (kg)', 'Net Received (kg)', 'Rate/kg', 'Total Cost'];
    const rows = filteredData.map(r => [
      r.id, r.date, r.supplier_name, r.scrap_category, r.truck_no, r.gross_weight, r.tare_weight, r.net_received_kg, r.rate_per_kg, r.total_cost
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `scrap_procurement_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const gross = parseFloat(form.gross_weight);
    const tare = parseFloat(form.tare_weight);
    const rate = parseFloat(form.rate_per_kg);

    // Inline Validation
    if (!form.supplier_name.trim()) return setValidationError('Supplier Name is required.');
    if (!form.truck_no.trim()) return setValidationError('Truck Number is required.');
    if (isNaN(gross) || gross <= 0) return setValidationError('Gross weight must be positive.');
    if (isNaN(tare) || tare <= 0) return setValidationError('Tare weight must be positive.');
    if (gross <= tare) return setValidationError('Gross weight must be greater than Tare weight.');
    if (isNaN(rate) || rate <= 0) return setValidationError('Rate/kg must be positive.');

    try {
      const res = await fetch('/api/scrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const json = await res.json();
      if (json.success) {
        setIsAddOpen(false);
        setForm({
          date: new Date().toISOString().split('T')[0],
          supplier_name: '',
          scrap_category: 'LC Scrap',
          truck_no: '',
          gross_weight: '',
          tare_weight: '',
          rate_per_kg: ''
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
      const matchSearch = r.supplier_name.toLowerCase().includes(search.toLowerCase()) || 
                          r.truck_no.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter ? r.scrap_category === categoryFilter : true;
      return matchSearch && matchCat;
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

  // Supplier Intake Summary
  const supplierSummary = filteredData.reduce((acc: any, curr) => {
    acc[curr.supplier_name] = (acc[curr.supplier_name] || 0) + curr.net_received_kg;
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 ">
      
      {/* Title Bar */}
      <div className="flex justify-between items-center border-b border-slate-200  pb-3.5">
        <div>
          <h2 className="text-base font-extrabold text-slate-900  uppercase tracking-wider font-mono">Scrap Procurement & Inventory</h2>
          <p className="text-[11px] text-slate-500  mt-0.5">Log inbound truck weighments, rate configurations, and automatically increment yard inventory ledger.</p>
        </div>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 bg-[#C5A059] hover:bg-[#B48F48] text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          + Log Scrap Receipt
        </button>
      </div>

      {/* Supplier Intake Summaries Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(supplierSummary).slice(0, 4).map(([supplier, weightKg]: any, idx) => (
          <div key={idx} className="bg-white  border border-slate-200  p-4 rounded-xl shadow-2xs">
            <p className="text-[9px] text-slate-400  font-bold uppercase font-mono truncate">{supplier}</p>
            <h4 className="text-lg font-black text-slate-900  font-mono mt-1">{(weightKg / 1000).toFixed(2)} MT</h4>
            <p className="text-[8px] text-emerald-600  font-bold font-mono mt-1">● SUPPLIED METRIC TONS</p>
          </div>
        ))}
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white  border border-slate-200  p-4 rounded-2xl shadow-2xs">
        <input 
          type="text" 
          placeholder="Search by supplier or truck number..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-slate-50  border border-slate-200  text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-[#C5A059]"
        />
        <select 
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-50  border border-slate-200  text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-[#C5A059]"
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
                <th className={`${cellPadding} cursor-pointer hover:text-slate-800`} onClick={() => handleSort('supplier_name')}>Supplier {sortField === 'supplier_name' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                <th className={`${cellPadding} cursor-pointer hover:text-slate-800`} onClick={() => handleSort('scrap_category')}>Category {sortField === 'scrap_category' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                <th className={`${cellPadding} cursor-pointer hover:text-slate-800`} onClick={() => handleSort('truck_no')}>Truck No {sortField === 'truck_no' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                <th className={`${cellPadding} text-right cursor-pointer hover:text-slate-800`} onClick={() => handleSort('gross_weight')}>Gross (kg)</th>
                <th className={`${cellPadding} text-right cursor-pointer hover:text-slate-800`} onClick={() => handleSort('tare_weight')}>Tare (kg)</th>
                <th className={`${cellPadding} text-right cursor-pointer hover:text-slate-800`} onClick={() => handleSort('net_received_kg')}>Net (kg)</th>
                <th className={`${cellPadding} text-right cursor-pointer hover:text-slate-800`} onClick={() => handleSort('rate_per_kg')}>Rate/kg</th>
                <th className={`${cellPadding} text-right cursor-pointer hover:text-slate-800`} onClick={() => handleSort('total_cost')}>Total Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 ">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-xs text-slate-400  font-mono">Fetching scrap inventory ledger...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-xs text-slate-400  font-mono">No receipts match the filters.</td>
                </tr>
              ) : filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50  transition-colors">
                  <td className={`${cellPadding} font-mono font-semibold`}>{row.date}</td>
                  <td className={`${cellPadding} font-black`}>{row.supplier_name}</td>
                  <td className={cellPadding}>
                    <span className="px-2 py-0.5 text-[9px] font-bold border rounded-full bg-slate-50  border-slate-200 ">
                      {row.scrap_category}
                    </span>
                  </td>
                  <td className={`${cellPadding} font-mono text-slate-500 `}>{row.truck_no}</td>
                  <td className={`${cellPadding} text-right font-mono`}>{row.gross_weight.toLocaleString()}</td>
                  <td className={`${cellPadding} text-right font-mono`}>{row.tare_weight.toLocaleString()}</td>
                  <td className={`${cellPadding} text-right font-mono text-emerald-600  font-bold`}>{row.net_received_kg.toLocaleString()}</td>
                  <td className={`${cellPadding} text-right font-mono`}>৳{row.rate_per_kg}</td>
                  <td className={`${cellPadding} text-right font-mono font-bold text-slate-900 `}>৳{row.total_cost.toLocaleString()}</td>
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
              <h3 className="text-sm font-extrabold text-slate-900  uppercase tracking-wider font-mono">Log Scrap Procurement weighment</h3>
              <p className="text-[10px] text-slate-400  mt-1">Calculate net weight and log payment vouchers in the daily ledger.</p>
            </div>
            
            {validationError && (
              <div className="bg-rose-50  text-rose-800  p-3 rounded-xl border border-rose-200/50 text-[10px] font-bold font-mono">
                🚨 Error: {validationError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500 font-mono">Log Date</label>
                  <input 
                    type="date" 
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#B48F48] font-medium placeholder-slate-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500 font-mono">Scrap Category</label>
                  <select 
                    value={form.scrap_category}
                    onChange={(e) => setForm({ ...form, scrap_category: e.target.value })}
                    className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#B48F48] font-medium placeholder-slate-400"
                  >
                    {categories.map((c, idx) => <option key={idx} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500 font-mono">Supplier Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Metal Recyclers Corp"
                  value={form.supplier_name}
                  onChange={(e) => setForm({ ...form, supplier_name: e.target.value })}
                  className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#B48F48] font-medium placeholder-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500 font-mono">Truck Number</label>
                  <input 
                    type="text" 
                    placeholder="TR-5022"
                    value={form.truck_no}
                    onChange={(e) => setForm({ ...form, truck_no: e.target.value })}
                    className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#B48F48] font-medium placeholder-slate-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500 font-mono">Rate (৳/kg)</label>
                  <input 
                    type="number" 
                    placeholder="42"
                    value={form.rate_per_kg}
                    onChange={(e) => setForm({ ...form, rate_per_kg: e.target.value })}
                    className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#B48F48] font-medium placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500 font-mono">Gross Weight (kg)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 24000"
                    value={form.gross_weight}
                    onChange={(e) => setForm({ ...form, gross_weight: e.target.value })}
                    className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#B48F48] font-medium placeholder-slate-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500 font-mono">Tare Weight (kg)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 9000"
                    value={form.tare_weight}
                    onChange={(e) => setForm({ ...form, tare_weight: e.target.value })}
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
                  Confirm Weight & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
