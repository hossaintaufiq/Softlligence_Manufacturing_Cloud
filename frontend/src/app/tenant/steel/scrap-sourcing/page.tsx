'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { exportToExcel } from '@/lib/excelExport';

interface ScrapRow {
  id: number;
  date: string;
  supplier_name: string;
  scrap_category: string;
  scrap_rcv_kg: number;
  truck_no: string;
  gross_weight: number;
  value_tare: number;
  rate_per_kg: number;
  total_cost: number;
  yard_location: string;
  moisture_deduction_pct?: number;
  quality_grade?: 'Premium Heavy' | 'Standard Medium' | 'Light / Kechi' | 'Direct Reduced';
}

const STORAGE_KEY = 'steel_erp_scrap';

const initialScrapData: ScrapRow[] = [
  { id: 1, date: '2026-08-20', supplier_name: 'Metal Recyclers Corp', scrap_category: 'HMS-1 (Heavy Melting)', scrap_rcv_kg: 15000, truck_no: 'DHAKA-METRO-15-1024', gross_weight: 24500, value_tare: 9500, rate_per_kg: 52.0, total_cost: 780000, yard_location: 'Bay A (Heavy Stock)', quality_grade: 'Premium Heavy', moisture_deduction_pct: 0.5 },
  { id: 2, date: '2026-08-21', supplier_name: 'Apex Scrap Suppliers', scrap_category: 'Rolling Kechi / End Cuts', scrap_rcv_kg: 12800, truck_no: 'CTG-METRO-14-8812', gross_weight: 22000, value_tare: 9200, rate_per_kg: 49.0, total_cost: 627200, yard_location: 'Bay B (Fast Feed)', quality_grade: 'Light / Kechi', moisture_deduction_pct: 0.8 },
  { id: 3, date: '2026-08-22', supplier_name: 'Alpha Alloys Sourcing', scrap_category: 'Ship Breaking Plate Cutting', scrap_rcv_kg: 9500, truck_no: 'CTG-METRO-12-5034', gross_weight: 18500, value_tare: 9000, rate_per_kg: 55.0, total_cost: 522500, yard_location: 'Bay A (Heavy Stock)', quality_grade: 'Premium Heavy', moisture_deduction_pct: 0.2 },
  { id: 4, date: '2026-08-23', supplier_name: 'Apex Scrap Suppliers', scrap_category: 'HMS-1 (Heavy Melting)', scrap_rcv_kg: 18200, truck_no: 'DHAKA-METRO-14-2041', gross_weight: 28200, value_tare: 10000, rate_per_kg: 53.0, total_cost: 964600, yard_location: 'Bay C (Bunkers)', quality_grade: 'Premium Heavy', moisture_deduction_pct: 0.4 },
  { id: 5, date: '2026-08-24', supplier_name: 'Direct Metals Ltd', scrap_category: 'Direct Reduced Iron (DRI / Sponge)', scrap_rcv_kg: 21000, truck_no: 'DHAKA-METRO-18-4021', gross_weight: 31000, value_tare: 10000, rate_per_kg: 56.5, total_cost: 1186500, yard_location: 'DRI Silo 01', quality_grade: 'Direct Reduced', moisture_deduction_pct: 0.1 }
];

export default function ScrapSourcingPage() {
  const [data, setData] = useState<ScrapRow[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for new scrap entry
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    supplier_name: '',
    scrap_category: 'HMS-1 (Heavy Melting)',
    truck_no: '',
    gross_weight: '',
    value_tare: '',
    rate_per_kg: '52.0',
    yard_location: 'Bay A (Heavy Stock)',
    moisture_deduction_pct: '0.5',
    quality_grade: 'Premium Heavy' as const
  });

  const categories = [
    'HMS-1 (Heavy Melting)',
    'HMS-2 (Mixed Scrap)',
    'Rolling Kechi / End Cuts',
    'Ship Breaking Plate Cutting',
    'Direct Reduced Iron (DRI / Sponge)',
    'Cast Iron Scrap',
    'Bundle Press Scrap'
  ];

  const yardBays = [
    'Bay A (Heavy Stock)',
    'Bay B (Fast Feed)',
    'Bay C (Bunkers)',
    'Bay D (Kechi Stacking)',
    'DRI Silo 01',
    'DRI Silo 02'
  ];

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch {
        setData(initialScrapData);
      }
    } else {
      setData(initialScrapData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialScrapData));
    }
  }, []);

  const saveToStorage = (updated: ScrapRow[]) => {
    setData(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Auto calculate net and total
  const grossNum = Number(formData.gross_weight) || 0;
  const tareNum = Number(formData.value_tare) || 0;
  const rawNet = Math.max(0, grossNum - tareNum);
  const moisturePct = Number(formData.moisture_deduction_pct) || 0;
  const netScrapCalculated = Math.round(rawNet * (1 - moisturePct / 100));
  const rateNum = Number(formData.rate_per_kg) || 0;
  const totalCostCalculated = Math.round(netScrapCalculated * rateNum);

  const handleCreateScrap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplier_name || !formData.truck_no || rawNet <= 0) {
      showToast('Please enter valid supplier, truck and weighbridge measurements.');
      return;
    }

    const newRow: ScrapRow = {
      id: Date.now(),
      date: formData.date,
      supplier_name: formData.supplier_name.trim(),
      scrap_category: formData.scrap_category,
      scrap_rcv_kg: netScrapCalculated,
      truck_no: formData.truck_no.trim().toUpperCase(),
      gross_weight: grossNum,
      value_tare: tareNum,
      rate_per_kg: rateNum,
      total_cost: totalCostCalculated,
      yard_location: formData.yard_location,
      moisture_deduction_pct: moisturePct,
      quality_grade: formData.quality_grade
    };

    const updated = [newRow, ...data];
    saveToStorage(updated);
    setIsModalOpen(false);
    showToast(`Successfully logged ${netScrapCalculated.toLocaleString()} kg from ${formData.supplier_name}`);

    // Reset Form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      supplier_name: '',
      scrap_category: 'HMS-1 (Heavy Melting)',
      truck_no: '',
      gross_weight: '',
      value_tare: '',
      rate_per_kg: '52.0',
      yard_location: 'Bay A (Heavy Stock)',
      moisture_deduction_pct: '0.5',
      quality_grade: 'Premium Heavy'
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to remove this scrap intake record?')) {
      const updated = data.filter(d => d.id !== id);
      saveToStorage(updated);
      showToast('Intake record deleted');
    }
  };

  // Filtered dataset
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = 
        item.supplier_name.toLowerCase().includes(search.toLowerCase()) ||
        item.truck_no.toLowerCase().includes(search.toLowerCase()) ||
        item.scrap_category.toLowerCase().includes(search.toLowerCase()) ||
        item.yard_location.toLowerCase().includes(search.toLowerCase());
      const matchesCat = !categoryFilter || item.scrap_category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [data, search, categoryFilter]);

  // Aggregated KPIs
  const totalScrapKg = filteredData.reduce((sum, d) => sum + Number(d.scrap_rcv_kg || 0), 0);
  const totalCostBdt = filteredData.reduce((sum, d) => sum + Number(d.total_cost || 0), 0);
  const avgRatePerKg = totalScrapKg > 0 ? (totalCostBdt / totalScrapKg).toFixed(2) : '52.50';
  const uniqueSuppliers = Array.from(new Set(data.map(d => d.supplier_name))).length;

  const handleExportExcel = () => {
    const headers = ['Date', 'Supplier Name', 'Scrap Category', 'Quality Grade', 'Truck No', 'Gross Wt (KG)', 'Tare Wt (KG)', 'Net Scrap (KG)', 'Rate (BDT/KG)', 'Total Value (BDT)', 'Yard Location', 'Moisture Ded (%)'];
    const rows = filteredData.map(r => [
      r.date, r.supplier_name, r.scrap_category, r.quality_grade || 'Standard Medium', r.truck_no, r.gross_weight, r.value_tare, r.scrap_rcv_kg, r.rate_per_kg, r.total_cost, r.yard_location, r.moisture_deduction_pct || 0
    ]);
    exportToExcel(headers, rows, 'scrap_sourcing_manifest');
  };

  return (
    <div className="space-y-7 animate-fade-in text-slate-800 pb-16">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-amber-500/40 flex items-center space-x-3 animate-zoom-in">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs font-semibold font-mono tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* HERO & YARD CONTEXT BANNER WITH REAL INDUSTRIAL IMAGERY */}
      <div className="relative overflow-hidden bg-slate-900 rounded-3xl text-white shadow-xl border border-slate-800">
        <div className="absolute inset-0 opacity-25 mix-blend-luminosity bg-cover bg-center pointer-events-none" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1200&q=80')` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent"></div>

        <div className="relative z-10 p-6 sm:p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2.5">
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase px-3 py-1 rounded-full font-mono tracking-wide">
                Stage 01 • Raw Material Sourcing
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold px-3 py-1 rounded-full font-mono flex items-center">
                <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></span> Weighbridge Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-sans">
              Scrap Yard Sourcing & Inbound Logistics
            </h1>
            <p className="text-sm text-slate-300 font-sans leading-relaxed">
              Supervise scrap truck weigh-ins, moisture/dust tare deductions, yard bay allocations, and HMS quality gradings.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportExcel}
              className="px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-600 transition-all cursor-pointer shadow-xs"
            >
              Export Manifest
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-[#B48F48] to-[#C5A059] hover:from-[#a07e3d] hover:to-[#b5924d] text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-amber-900/25 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Log Scrap Consignment</span>
            </button>
          </div>
        </div>
      </div>

      {/* SHORT MINI-DASHBOARD (4 KPI METRIC CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs flex flex-col justify-between h-40 relative overflow-hidden">
          <div className="flex justify-between items-center text-xs font-semibold uppercase text-slate-500 font-mono">
            <span>Total Intake Volume</span>
            <span className="text-[#B48F48] bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200 font-bold">Yard Net</span>
          </div>
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl font-bold text-slate-900 font-mono tracking-tight">{(totalScrapKg / 1000).toFixed(1)}</span>
              <span className="text-sm font-semibold text-slate-500 font-mono">MT</span>
            </div>
            <p className="text-xs text-emerald-600 font-semibold font-mono mt-1.5">▲ {filteredData.length} Trucks Cleared</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#C5A059]"></div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs flex flex-col justify-between h-40 relative overflow-hidden">
          <div className="flex justify-between items-center text-xs font-semibold uppercase text-slate-500 font-mono">
            <span>Cumulative Value</span>
            <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 font-bold">Cost</span>
          </div>
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl font-bold text-slate-900 font-mono tracking-tight">৳{(totalCostBdt / 100000).toFixed(1)}</span>
              <span className="text-sm font-semibold text-slate-500 font-mono">Lakh</span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-1.5">Weighted Rate: ৳{avgRatePerKg}/kg</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500"></div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs flex flex-col justify-between h-40 relative overflow-hidden">
          <div className="flex justify-between items-center text-xs font-semibold uppercase text-slate-500 font-mono">
            <span>Active Yard Locations</span>
            <span className="text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200 font-bold">Bays</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono">5 Dedicated Bays</div>
            <p className="text-xs text-indigo-600 font-semibold font-mono mt-1.5">Bay A & B at 74% Capacity</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500"></div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs flex flex-col justify-between h-40 relative overflow-hidden">
          <div className="flex justify-between items-center text-xs font-semibold uppercase text-slate-500 font-mono">
            <span>Vendor Reliability</span>
            <span className="text-cyan-700 bg-cyan-50 px-2.5 py-0.5 rounded-md border border-cyan-200 font-bold">Suppliers</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono">{uniqueSuppliers} Registered Vendors</div>
            <p className="text-xs text-slate-500 font-mono mt-1.5">Avg Moisture: 0.4% (Within Spec)</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-500"></div>
        </div>

      </div>

      {/* FILTER & VIEW CONTROLS */}
      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3 flex-1 min-w-[260px]">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search truck, supplier, category, bay..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans focus:outline-none focus:border-[#C5A059] focus:bg-white transition-all"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-sans text-slate-700 focus:outline-none focus:border-[#C5A059]"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Card / Table Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1 font-sans text-xs">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3.5 py-2 rounded-lg font-semibold transition-all ${viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Consignment Cards
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3.5 py-2 rounded-lg font-semibold transition-all ${viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Grid Table
          </button>
        </div>
      </div>

      {/* CONSIGNMENT CARDS VIEW */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredData.map(item => (
            <div key={item.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-[#C5A059]/40 hover:shadow-md transition-all space-y-4 relative group">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400 font-mono uppercase">{item.date} • {item.truck_no}</span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{item.supplier_name}</h3>
                </div>
                <span className={`text-xs font-semibold uppercase px-2.5 py-1 rounded-lg font-mono ${
                  item.quality_grade === 'Premium Heavy' ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                  item.quality_grade === 'Direct Reduced' ? 'bg-cyan-100 text-cyan-900 border border-cyan-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  {item.quality_grade || 'Standard'}
                </span>
              </div>

              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/70 space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Category:</span>
                  <span className="font-semibold text-slate-800">{item.scrap_category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Net Weight:</span>
                  <span className="font-bold text-[#B48F48]">{(item.scrap_rcv_kg / 1000).toFixed(2)} MT ({item.scrap_rcv_kg} kg)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span className="font-sans">Gross / Tare:</span>
                  <span>{item.gross_weight} kg / {item.value_tare} kg</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs font-mono pt-1">
                <div>
                  <span className="text-slate-400 font-sans block">Yard Bay:</span>
                  <p className="font-semibold text-slate-800">{item.yard_location}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 font-sans block">Total Value:</span>
                  <p className="font-bold text-emerald-700 text-sm">৳{item.total_cost.toLocaleString()}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs font-mono">
                <span className="text-slate-500">Rate: ৳{item.rate_per_kg}/kg</span>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-rose-500 hover:text-rose-700 font-semibold cursor-pointer"
                >
                  Remove Consignment
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ENTERPRISE GRID TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-sans border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Supplier Name</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Truck No</th>
                  <th className="px-4 py-3.5 text-right">Gross (kg)</th>
                  <th className="px-4 py-3.5 text-right">Tare (kg)</th>
                  <th className="px-4 py-3.5 text-right">Net Rcv (MT)</th>
                  <th className="px-4 py-3.5 text-right">Rate (৳/kg)</th>
                  <th className="px-4 py-3.5 text-right">Total Cost (৳)</th>
                  <th className="px-4 py-3.5">Yard Bay</th>
                  <th className="px-4 py-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs">
                {filteredData.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 text-slate-700">{item.date}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900 font-sans">{item.supplier_name}</td>
                    <td className="px-4 py-3 text-slate-600">{item.scrap_category}</td>
                    <td className="px-4 py-3 text-slate-500 font-semibold">{item.truck_no}</td>
                    <td className="px-4 py-3 text-right">{item.gross_weight.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-slate-400">{item.value_tare.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-bold text-[#B48F48]">{(item.scrap_rcv_kg / 1000).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">৳{item.rate_per_kg}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-700">৳{item.total_cost.toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-700 font-sans">{item.yard_location}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleDelete(item.id)} className="text-rose-500 hover:text-rose-700 font-bold p-1">✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: LOG NEW SCRAP INTAKE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-7 shadow-2xl border border-slate-200 animate-zoom-in space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-sans">Weighbridge Scrap Consignment Intake</h3>
                <p className="text-xs text-slate-500 mt-0.5">Record gross and tare weighbridge weights to compute net melt feedstock.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateScrap} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase font-mono">Intake Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans focus:outline-none focus:border-[#C5A059] focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase font-mono">Truck Registration No</label>
                  <input
                    type="text"
                    placeholder="e.g. DHAKA-METRO-15-1024"
                    value={formData.truck_no}
                    onChange={e => setFormData({ ...formData, truck_no: e.target.value })}
                    className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold uppercase focus:outline-none focus:border-[#C5A059] focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase font-mono">Supplier Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Metal Recyclers Corp"
                    value={formData.supplier_name}
                    onChange={e => setFormData({ ...formData, supplier_name: e.target.value })}
                    className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans focus:outline-none focus:border-[#C5A059] focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase font-mono">Scrap Category</label>
                  <select
                    value={formData.scrap_category}
                    onChange={e => setFormData({ ...formData, scrap_category: e.target.value })}
                    className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans focus:outline-none focus:border-[#C5A059] focus:bg-white"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase font-mono">Gross Wt (KG)</label>
                  <input
                    type="number"
                    placeholder="25000"
                    value={formData.gross_weight}
                    onChange={e => setFormData({ ...formData, gross_weight: e.target.value })}
                    className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold focus:outline-none focus:border-[#C5A059] focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase font-mono">Tare Wt (KG)</label>
                  <input
                    type="number"
                    placeholder="10000"
                    value={formData.value_tare}
                    onChange={e => setFormData({ ...formData, value_tare: e.target.value })}
                    className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold focus:outline-none focus:border-[#C5A059] focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase font-mono">Moisture Ded %</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0.5"
                    value={formData.moisture_deduction_pct}
                    onChange={e => setFormData({ ...formData, moisture_deduction_pct: e.target.value })}
                    className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-[#C5A059] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase font-mono">Rate (৳/kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.rate_per_kg}
                    onChange={e => setFormData({ ...formData, rate_per_kg: e.target.value })}
                    className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold focus:outline-none focus:border-[#C5A059] focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase font-mono">Yard Bay Allocation</label>
                  <select
                    value={formData.yard_location}
                    onChange={e => setFormData({ ...formData, yard_location: e.target.value })}
                    className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans focus:outline-none focus:border-[#C5A059] focus:bg-white"
                  >
                    {yardBays.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              {/* Real-time Dynamic Calculation Summary */}
              {rawNet > 0 && (
                <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 flex justify-between items-center text-xs font-mono">
                  <div>
                    <span className="text-slate-500 font-sans block">Net Calculated Weight:</span>
                    <strong className="text-base font-bold text-[#B48F48] font-mono">{netScrapCalculated.toLocaleString()} KG ({(netScrapCalculated/1000).toFixed(2)} MT)</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 font-sans block">Total Consignment Cost:</span>
                    <strong className="text-base font-bold text-emerald-700 font-mono">৳{totalCostCalculated.toLocaleString()}</strong>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-[#B48F48] to-[#C5A059] hover:from-[#a07e3d] hover:to-[#b5924d] text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
                >
                  Confirm & Log Consignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
