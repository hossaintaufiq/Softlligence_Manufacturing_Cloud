'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface EnergyRow {
  id: number;
  date: string;
  meter_reading_kw: number;
  power_consumed_kwh: number;
  gas_consumed_nm3: number;
  billet_kwh_per_ton: number;
  rod_kwh_per_ton: number;
  gas_per_ton: number;
}

export default function EnergyPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';
  
  // Data State
  const [data, setData] = useState<EnergyRow[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Search
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<keyof EnergyRow>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  
  // Dialog Form
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    meter_reading_kw: '',
    power_consumed_kwh: '',
    gas_consumed_nm3: ''
  });
  const [validationError, setValidationError] = useState('');

  const cellPadding = isCompact ? 'px-4 py-2 text-[11px]' : 'px-5 py-3 text-xs';

  async function loadData() {
    try {
      const res = await fetch('/api/energy');
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

  const handleSort = (field: keyof EnergyRow) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Meter Reading (kW)', 'Power Consumed (kWh)', 'Gas Consumed (nm3)', 'Billet Ratio (kWh/t)', 'Rod Ratio (kWh/t)', 'Gas Ratio (nm3/t)'];
    const rows = filteredData.map(r => [
      r.id, r.date, r.meter_reading_kw, r.power_consumed_kwh, r.gas_consumed_nm3, r.billet_kwh_per_ton, r.rod_kwh_per_ton, r.gas_per_ton
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `energy_utilities_efficiency_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const reading = parseFloat(form.meter_reading_kw);
    const power = parseFloat(form.power_consumed_kwh);
    const gas = parseFloat(form.gas_consumed_nm3);

    // Inline Validation
    if (isNaN(reading) || reading <= 0) return setValidationError('Meter reading must be positive.');
    if (isNaN(power) || power <= 0) return setValidationError('Power consumed must be positive.');
    if (isNaN(gas) || gas <= 0) return setValidationError('Gas consumed must be positive.');

    try {
      const res = await fetch('/api/energy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const json = await res.json();
      if (json.success) {
        setIsAddOpen(false);
        setForm({
          date: new Date().toISOString().split('T')[0],
          meter_reading_kw: '',
          power_consumed_kwh: '',
          gas_consumed_nm3: ''
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
    .filter(r => r.date.toLowerCase().includes(search.toLowerCase()))
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

  const totalKwh = filteredData.reduce((sum, r) => sum + r.power_consumed_kwh, 0);
  const totalGas = filteredData.reduce((sum, r) => sum + r.gas_consumed_nm3, 0);

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 ">
      
      {/* Title Bar */}
      <div className="flex justify-between items-center border-b border-slate-200  pb-3.5">
        <div>
          <h2 className="text-base font-extrabold text-slate-900  uppercase tracking-wider font-mono">Power & Energy Utilities</h2>
          <p className="text-[11px] text-slate-500  mt-0.5">Monitor heavy power loads, natural gas consumption, and calculate electricity/gas consumption indexes per metric ton of billet and rebar.</p>
        </div>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 bg-[#C5A059] hover:bg-[#B48F48] text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          + Log Daily Readings
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white  border border-slate-200  p-4 rounded-xl shadow-2xs">
          <p className="text-[9px] text-slate-400  font-bold uppercase font-mono">Total Power Consumed</p>
          <h4 className="text-xl font-black text-slate-900  font-mono mt-1">{totalKwh.toLocaleString()} kWh</h4>
          <p className="text-[8px] text-emerald-600  font-bold font-mono mt-1">● GRID SUBSTATION INTAKE</p>
        </div>
        <div className="bg-white  border border-slate-200  p-4 rounded-xl shadow-2xs">
          <p className="text-[9px] text-slate-400  font-bold uppercase font-mono">Total Gas Consumed</p>
          <h4 className="text-xl font-black text-slate-900  font-mono mt-1">{totalGas.toLocaleString()} Nm³</h4>
          <p className="text-[8px] text-[#B48F48]  font-bold font-mono mt-1">● REHEATING FURNACE SUPPLY</p>
        </div>
        <div className="bg-white  border border-slate-200  p-4 rounded-xl shadow-2xs">
          <p className="text-[9px] text-slate-400  font-bold uppercase font-mono">Avg Power Factor Target</p>
          <h4 className="text-xl font-black text-slate-900  font-mono mt-1">0.96 Pf</h4>
          <p className="text-[8px] text-indigo-600  font-bold font-mono mt-1">● COMPENSATOR CAPACITORS ACTIVE</p>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white  border border-slate-200  p-4 rounded-2xl shadow-2xs">
        <input 
          type="text" 
          placeholder="Filter by date (YYYY-MM-DD)..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-slate-50  border border-slate-200  text-xs px-3 py-2 rounded-xl focus:outline-none"
        />
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
                <th className={`${cellPadding} text-right cursor-pointer hover:text-slate-800`} onClick={() => handleSort('meter_reading_kw')}>Meter Reading (kw)</th>
                <th className={`${cellPadding} text-right cursor-pointer hover:text-slate-800`} onClick={() => handleSort('power_consumed_kwh')}>Daily Power (kwh)</th>
                <th className={`${cellPadding} text-right cursor-pointer hover:text-slate-800`} onClick={() => handleSort('gas_consumed_nm3')}>Daily Gas (nm3)</th>
                <th className={`${cellPadding} text-right`}>Billet Ratio (kwh/MT)</th>
                <th className={`${cellPadding} text-right`}>Rebar Ratio (kwh/MT)</th>
                <th className={`${cellPadding} text-right`}>Gas Ratio (nm3/MT)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 ">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-xs text-slate-400  font-mono">Fetching daily utility reports...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-xs text-slate-400  font-mono">No utility readings found.</td>
                </tr>
              ) : filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50  transition-colors">
                  <td className={`${cellPadding} font-mono font-semibold`}>{row.date}</td>
                  <td className={`${cellPadding} text-right font-mono text-slate-500`}>{row.meter_reading_kw.toLocaleString()} kw</td>
                  <td className={`${cellPadding} text-right font-mono text-indigo-650  font-bold`}>{row.power_consumed_kwh.toLocaleString()} kwh</td>
                  <td className={`${cellPadding} text-right font-mono text-[#B48F48] `}>{row.gas_consumed_nm3.toLocaleString()} nm³</td>
                  <td className={`${cellPadding} text-right font-mono text-slate-800  font-bold`}>{row.billet_kwh_per_ton}</td>
                  <td className={`${cellPadding} text-right font-mono text-slate-800  font-bold`}>{row.rod_kwh_per_ton}</td>
                  <td className={`${cellPadding} text-right font-mono text-slate-800  font-bold`}>{row.gas_per_ton}</td>
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
              <h3 className="text-sm font-extrabold text-slate-900  uppercase tracking-wider font-mono">Log Daily Energy Meter</h3>
              <p className="text-[10px] text-slate-450  mt-1">Saves meter telemetry and calculates production consumption ratios automatically.</p>
            </div>
            
            {validationError && (
              <div className="bg-rose-50  text-rose-800  p-3 rounded-xl border border-rose-200/50 text-[10px] font-bold font-mono">
                🚨 Error: {validationError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
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
                <label className="text-[9px] uppercase tracking-wider font-extrabold text-slate-450 ">Substation Meter Reading (kW)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 235000"
                  value={form.meter_reading_kw}
                  onChange={(e) => setForm({ ...form, meter_reading_kw: e.target.value })}
                  className="w-full bg-slate-50  border border-slate-200  text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-extrabold text-slate-450 ">Daily Power Consumed (kWh)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 13500"
                    value={form.power_consumed_kwh}
                    onChange={(e) => setForm({ ...form, power_consumed_kwh: e.target.value })}
                    className="w-full bg-slate-50  border border-slate-200  text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-extrabold text-slate-450 ">Daily Gas Consumed (Nm³)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 2100"
                    value={form.gas_consumed_nm3}
                    onChange={(e) => setForm({ ...form, gas_consumed_nm3: e.target.value })}
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
                  Log Telemetry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
