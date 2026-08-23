'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface WeighbridgeRow {
  id: number;
  ticket_no: string;
  date: string;
  vehicle_no: string;
  material_type: string;
  gross_weight_kg: number;
  tare_weight_kg: number;
  net_weight_kg: number;
  status: 'Pending' | 'Completed';
}

export default function WeighbridgePage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';
  
  // Data State
  const [data, setData] = useState<WeighbridgeRow[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Search
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortField, setSortField] = useState<keyof WeighbridgeRow>('ticket_no');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  
  // Dialog Form
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({
    ticket_no: '',
    date: new Date().toISOString().split('T')[0],
    vehicle_no: '',
    material_type: 'Incoming Scrap',
    gross_weight_kg: '',
    tare_weight_kg: '',
    status: 'Completed' as const
  });
  const [validationError, setValidationError] = useState('');
  const [simulatedWeightMsg, setSimulatedWeightMsg] = useState('');

  const cellPadding = isCompact ? 'px-4 py-2 text-[11px]' : 'px-5 py-3 text-xs';

  const types = ['Incoming Scrap', 'Outgoing Finished Rods'];

  async function loadData() {
    try {
      const res = await fetch('/api/weighbridge');
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
    generateTicketNo();
  }, []);

  const generateTicketNo = () => {
    const random = Math.floor(100 + Math.random() * 900);
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '').slice(2);
    setForm(prev => ({ ...prev, ticket_no: `WB-${dateStr}-${random}` }));
  };

  const handleSort = (field: keyof WeighbridgeRow) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Ticket No', 'Date', 'Vehicle No', 'Material Type', 'Gross (kg)', 'Tare (kg)', 'Net (kg)', 'Status'];
    const rows = filteredData.map(r => [
      r.id, r.ticket_no, r.date, r.vehicle_no, r.material_type, r.gross_weight_kg, r.tare_weight_kg, r.net_weight_kg, r.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `weighbridge_gate_tickets_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Automatic Weight Capture Simulator
  const handleAutoWeigh = () => {
    setSimulatedWeightMsg('Establishing connection to serial weight indicator COM3...');
    setTimeout(() => {
      // Simulate capturing weights randomly but logically
      const isScrap = form.material_type === 'Incoming Scrap';
      const capturedGross = isScrap ? Math.floor(18000 + Math.random() * 10000) : Math.floor(15000 + Math.random() * 6000);
      const capturedTare = Math.floor(8000 + Math.random() * 2000);
      
      setForm(prev => ({
        ...prev,
        gross_weight_kg: String(capturedGross),
        tare_weight_kg: String(capturedTare)
      }));
      setSimulatedWeightMsg(`Captured weighment: Gross = ${capturedGross} kg, Tare = ${capturedTare} kg. (Net = ${capturedGross - capturedTare} kg)`);
    }, 800);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const gross = parseFloat(form.gross_weight_kg);
    const tare = parseFloat(form.tare_weight_kg);

    // Inline Validation
    if (!form.ticket_no.trim()) return setValidationError('Ticket Number is required.');
    if (!form.vehicle_no.trim()) return setValidationError('Vehicle license number is required.');
    if (isNaN(gross) || gross <= 0) return setValidationError('Gross weight must be positive.');
    if (isNaN(tare) || tare <= 0) return setValidationError('Tare weight must be positive.');
    if (gross < tare) return setValidationError('Gross weight cannot be less than Tare weight.');

    try {
      const res = await fetch('/api/weighbridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const json = await res.json();
      if (json.success) {
        setIsAddOpen(false);
        setSimulatedWeightMsg('');
        loadData();
        generateTicketNo();
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
      const matchSearch = r.ticket_no.toLowerCase().includes(search.toLowerCase()) || 
                          r.vehicle_no.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter ? r.material_type === typeFilter : true;
      return matchSearch && matchType;
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
          <h2 className="text-base font-extrabold text-slate-900  uppercase tracking-wider font-mono">Weighbridge Gate Control</h2>
          <p className="text-[11px] text-slate-500  mt-0.5">Integrate live truck scale readings, log vehicle registration numbers, configure inbound material categories, and print weight tickets.</p>
        </div>
        <button 
          onClick={() => {
            setIsAddOpen(true);
            generateTicketNo();
          }}
          className="px-4 py-2 bg-[#C5A059] hover:bg-[#B48F48] text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          + Log Weighbridge Entry
        </button>
      </div>

      {/* Connection Indicator banner */}
      <div className="bg-emerald-50  border border-emerald-200/50  p-3.5 rounded-2xl flex items-center justify-between text-xs text-emerald-800  font-bold shadow-2xs font-mono">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>WEIGH SCALE HARDWARE STATUS: <strong>CONNECTED (COM3 Indicator Controller)</strong></span>
        </div>
        <span className="text-[10px] bg-emerald-100  px-2 py-0.5 rounded border border-emerald-250  uppercase font-extrabold tracking-wider font-mono">API ACTIVE</span>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white  border border-slate-200  p-4 rounded-2xl shadow-2xs">
        <input 
          type="text" 
          placeholder="Search by ticket or vehicle plate..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-slate-50  border border-slate-200  text-xs px-3 py-2 rounded-xl focus:outline-none"
        />
        <select 
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-slate-50  border border-slate-200  text-xs px-3 py-2 rounded-xl focus:outline-none"
        >
          <option value="">All Materials</option>
          {types.map((type, idx) => <option key={idx} value={type}>{type}</option>)}
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
                <th className={`${cellPadding} cursor-pointer hover:text-slate-800`} onClick={() => handleSort('ticket_no')}>Ticket Number {sortField === 'ticket_no' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                <th className={`${cellPadding} cursor-pointer hover:text-slate-800`} onClick={() => handleSort('date')}>Date</th>
                <th className={`${cellPadding} cursor-pointer hover:text-slate-800`} onClick={() => handleSort('vehicle_no')}>Vehicle Plate</th>
                <th className={`${cellPadding} cursor-pointer hover:text-slate-800`} onClick={() => handleSort('material_type')}>Material Intake/Outtake</th>
                <th className={`${cellPadding} text-right`}>Gross weight (kg)</th>
                <th className={`${cellPadding} text-right`}>Tare weight (kg)</th>
                <th className={`${cellPadding} text-right`}>Net weight (kg)</th>
                <th className={`${cellPadding} text-center`}>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 ">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-xs text-slate-400  font-mono">Loading gate weighments...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-xs text-slate-400  font-mono">No scale records found.</td>
                </tr>
              ) : filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50  transition-colors">
                  <td className={`${cellPadding} font-black font-mono`}>{row.ticket_no}</td>
                  <td className={`${cellPadding} font-mono text-slate-500`}>{row.date}</td>
                  <td className={`${cellPadding} font-bold font-mono text-slate-900 `}>{row.vehicle_no}</td>
                  <td className={cellPadding}>
                    <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-full ${
                      row.material_type === 'Incoming Scrap' ? 'bg-[#FAF6EE]  text-[#B48F48] border-[#C5A059]/20' : 'bg-emerald-50  text-emerald-600 border-emerald-200/50'
                    }`}>
                      {row.material_type}
                    </span>
                  </td>
                  <td className={`${cellPadding} text-right font-mono text-slate-450`}>{row.gross_weight_kg.toLocaleString()} kg</td>
                  <td className={`${cellPadding} text-right font-mono text-slate-450`}>{row.tare_weight_kg.toLocaleString()} kg</td>
                  <td className={`${cellPadding} text-right font-mono font-bold text-slate-900 `}>{row.net_weight_kg.toLocaleString()} kg</td>
                  <td className={`${cellPadding} text-center`}>
                    <span className="px-1.5 py-0.2 bg-emerald-100  text-emerald-800  text-[9px] rounded font-bold uppercase tracking-wider font-mono border border-emerald-250 ">
                      {row.status}
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
          <div className="bg-white/95 border border-slate-200/85 p-7 rounded-3xl w-full max-w-md shadow-2xl space-y-5 relative overflow-hidden border-t-4 border-t-[#C5A059] flex flex-col">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900  uppercase tracking-wider font-mono">Weighbridge Gate Intake</h3>
              <p className="text-[10px] text-slate-450  mt-1">Capture live serial data from electronic loadcells or input manually.</p>
            </div>
            
            {validationError && (
              <div className="bg-rose-50  text-rose-800  p-3 rounded-xl border border-rose-200/50 text-[10px] font-bold font-mono">
                🚨 Error: {validationError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500 font-mono">Ticket ID</label>
                  <input 
                    type="text" 
                    value={form.ticket_no}
                    readOnly
                    className="w-full bg-slate-100  border border-slate-200  text-xs px-2.5 py-1.5 rounded-lg font-mono font-bold focus:outline-none cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500 font-mono">Date</label>
                  <input 
                    type="date" 
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#B48F48] font-medium placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500 font-mono">Vehicle Plate No</label>
                  <input 
                    type="text" 
                    placeholder="TR-5022"
                    value={form.vehicle_no}
                    onChange={(e) => setForm({ ...form, vehicle_no: e.target.value })}
                    className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#B48F48] font-medium placeholder-slate-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500 font-mono">Material Type</label>
                  <select 
                    value={form.material_type}
                    onChange={(e) => setForm({ ...form, material_type: e.target.value })}
                    className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#B48F48] font-medium placeholder-slate-400"
                  >
                    {types.map((type, idx) => <option key={idx} value={type}>{type}</option>)}
                  </select>
                </div>
              </div>

              {/* Automatic Weight Simulator triggers */}
              <div className="border border-dashed border-[#C5A059]/30  p-3.5 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase font-mono">Loadcell Serial Scale (COM3)</span>
                  <button 
                    type="button" 
                    onClick={handleAutoWeigh}
                    className="px-2.5 py-1 bg-[#FAF6EE]  hover:bg-[#C5A059]  border border-[#C5A059]/30  text-[#B48F48] hover:text-white  text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                  >
                    Simulate Auto Weighment
                  </button>
                </div>
                {simulatedWeightMsg && (
                  <p className="text-[9px] font-mono text-emerald-650  font-semibold animate-pulse leading-normal">{simulatedWeightMsg}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500 font-mono">Gross Weight (kg)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 24000"
                    value={form.gross_weight_kg}
                    onChange={(e) => setForm({ ...form, gross_weight_kg: e.target.value })}
                    className="w-full bg-slate-50  border border-slate-200  text-xs px-2.5 py-1.5 rounded-lg focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500 font-mono">Tare Weight (kg)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 9000"
                    value={form.tare_weight_kg}
                    onChange={(e) => setForm({ ...form,  tare_weight_kg: e.target.value })}
                    className="w-full bg-slate-50  border border-slate-200  text-xs px-2.5 py-1.5 rounded-lg focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100  flex justify-end space-x-2">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsAddOpen(false);
                    setSimulatedWeightMsg('');
                  }}
                  className="px-4 py-2 border border-slate-200  text-slate-650  text-xs font-bold rounded-xl hover:bg-slate-50 "
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-gradient-to-r from-[#B48F48] to-[#C5A059] hover:from-[#C5A059] hover:to-[#B48F48] text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Log Gate Weighment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
