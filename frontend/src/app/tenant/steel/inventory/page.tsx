'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface InventoryRow {
  raw_scrap_mt: number;
  billet_yard_mt: number;
  rebar_10mm_mt: number;
  rebar_12mm_mt: number;
  rebar_16mm_mt: number;
  rebar_20mm_mt: number;
  rebar_25mm_mt: number;
  rebar_32mm_mt: number;
  store_spares_qty: number;
}

export default function InventoryPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';
  
  // Data State
  const [data, setData] = useState<InventoryRow | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Edit Form Dialog State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [form, setForm] = useState({
    raw_scrap_mt: '',
    billet_yard_mt: '',
    rebar_10mm_mt: '',
    rebar_12mm_mt: '',
    rebar_16mm_mt: '',
    rebar_20mm_mt: '',
    rebar_25mm_mt: '',
    rebar_32mm_mt: '',
    store_spares_qty: ''
  });
  const [validationError, setValidationError] = useState('');

  async function loadData() {
    try {
      const res = await fetch('/api/inventory');
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

  const handleEditClick = () => {
    if (!data) return;
    setForm({
      raw_scrap_mt: String(data.raw_scrap_mt),
      billet_yard_mt: String(data.billet_yard_mt),
      rebar_10mm_mt: String(data.rebar_10mm_mt),
      rebar_12mm_mt: String(data.rebar_12mm_mt),
      rebar_16mm_mt: String(data.rebar_16mm_mt),
      rebar_20mm_mt: String(data.rebar_20mm_mt),
      rebar_25mm_mt: String(data.rebar_25mm_mt),
      rebar_32mm_mt: String(data.rebar_32mm_mt),
      store_spares_qty: String(data.store_spares_qty)
    });
    setValidationError('');
    setIsEditOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const raw = parseFloat(form.raw_scrap_mt);
    const billet = parseFloat(form.billet_yard_mt);
    const r10 = parseFloat(form.rebar_10mm_mt);
    const r12 = parseFloat(form.rebar_12mm_mt);
    const r16 = parseFloat(form.rebar_16mm_mt);
    const r20 = parseFloat(form.rebar_20mm_mt);
    const r25 = parseFloat(form.rebar_25mm_mt);
    const r32 = parseFloat(form.rebar_32mm_mt);
    const spares = parseInt(form.store_spares_qty, 10);

    // Inline validations
    if (
      isNaN(raw) || raw < 0 ||
      isNaN(billet) || billet < 0 ||
      isNaN(r10) || r10 < 0 ||
      isNaN(r12) || r12 < 0 ||
      isNaN(r16) || r16 < 0 ||
      isNaN(r20) || r20 < 0 ||
      isNaN(r25) || r25 < 0 ||
      isNaN(r32) || r32 < 0 ||
      isNaN(spares) || spares < 0
    ) {
      return setValidationError('All stock levels must be non-negative numbers.');
    }

    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const json = await res.json();
      if (json.success) {
        setIsEditOpen(false);
        loadData();
      } else {
        setValidationError(json.error || 'Server error occurred.');
      }
    } catch (err) {
      setValidationError('Failed to connect to database API.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-450  font-bold font-mono">LOADING STOCK BALANCES...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const yards = [
    { title: 'Raw Scrap Yard', key: 'raw_scrap_mt', unit: 'MT', val: data.raw_scrap_mt, max: 500, color: 'bg-slate-550', icon: '⛓️' },
    { title: 'Billet WIP Yard', key: 'billet_yard_mt', unit: 'MT', val: data.billet_yard_mt, max: 300, color: 'bg-[#C5A059]', icon: '🧱' },
    { title: 'Rebar Yard 10mm', key: 'rebar_10mm_mt', unit: 'MT', val: data.rebar_10mm_mt, max: 150, color: 'bg-emerald-650', icon: '🌀' },
    { title: 'Rebar Yard 12mm', key: 'rebar_12mm_mt', unit: 'MT', val: data.rebar_12mm_mt, max: 150, color: 'bg-emerald-650', icon: '🌀' },
    { title: 'Rebar Yard 16mm', key: 'rebar_16mm_mt', unit: 'MT', val: data.rebar_16mm_mt, max: 150, color: 'bg-emerald-650', icon: '🌀' },
    { title: 'Rebar Yard 20mm', key: 'rebar_20mm_mt', unit: 'MT', val: data.rebar_20mm_mt, max: 150, color: 'bg-emerald-650', icon: '🌀' },
    { title: 'Rebar Yard 25mm', key: 'rebar_25mm_mt', unit: 'MT', val: data.rebar_25mm_mt, max: 150, color: 'bg-emerald-650', icon: '🌀' },
    { title: 'Rebar Yard 32mm', key: 'rebar_32mm_mt', unit: 'MT', val: data.rebar_32mm_mt, max: 150, color: 'bg-emerald-650', icon: '🌀' }
  ];

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 ">
      
      {/* Title Bar */}
      <div className="flex justify-between items-center border-b border-slate-200  pb-3.5">
        <div>
          <h2 className="text-base font-extrabold text-slate-900  uppercase tracking-wider font-mono">Store & Multi-Yard Inventory</h2>
          <p className="text-[11px] text-slate-500  mt-0.5">Centralized inventory control ledger. Production modules auto-increment and decrement these values upon action submission.</p>
        </div>
        <button 
          onClick={handleEditClick}
          className="px-4 py-2 border border-slate-200  bg-white  hover:bg-slate-50  text-slate-750  font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
        >
          ✏️ Adjust Ledger Balances
        </button>
      </div>

      {/* Spares Block */}
      <div className="bg-white  border border-slate-200  p-5 rounded-2xl shadow-xs flex items-center justify-between transition-colors">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900  uppercase tracking-wider font-mono">Spare Parts & Stores</h3>
          <p className="text-xs text-slate-450  mt-0.5">Bearings, refractory liners, nozzles, filters, and safety gears.</p>
        </div>
        <div className="text-right">
          <h4 className="text-2xl font-black text-slate-900  font-mono">{data.store_spares_qty} items</h4>
          <p className="text-[9px] text-[#B48F48] font-bold font-mono mt-1">● WAREHOUSE SHELF BALANCES</p>
        </div>
      </div>

      {/* Multi-Yard Progress Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {yards.map((yard, idx) => {
          const percentage = Math.min(100, Math.round((yard.val / yard.max) * 100));
          return (
            <div key={idx} className="bg-white  border border-slate-200  p-5 rounded-2xl shadow-xs space-y-3 transition-colors">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-900  font-extrabold flex items-center space-x-2">
                  <span>{yard.icon}</span>
                  <span>{yard.title}</span>
                </span>
                <span className="font-mono text-slate-750 ">{yard.val} {yard.unit} / {yard.max} {yard.unit}</span>
              </div>
              <div className="w-full h-3 bg-slate-150  rounded-full overflow-hidden">
                <div className={`h-full ${yard.color} rounded-full`} style={{ width: `${percentage}%` }} />
              </div>
              <div className="flex justify-between text-[9px] font-mono text-slate-400">
                <span>Capacity Utilized</span>
                <span className="font-bold text-slate-700 ">{percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Dialog Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40  backdrop-blur-xs">
          <div className="bg-white  border border-slate-200  p-6 rounded-2xl w-full max-w-lg shadow-2xl space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900  uppercase tracking-wider font-mono">Adjust Yard Inventory Ledger</h3>
              <p className="text-[10px] text-slate-450  mt-1">Manual overrides for physical stock auditing. Saves balances immediately.</p>
            </div>
            
            {validationError && (
              <div className="bg-rose-50  text-rose-800  p-3 rounded-xl border border-rose-200/50 text-[10px] font-bold font-mono">
                🚨 Error: {validationError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-mono text-slate-450">Raw Scrap (MT)</label>
                  <input type="text" value={form.raw_scrap_mt} onChange={(e) => setForm({ ...form, raw_scrap_mt: e.target.value })} className="w-full bg-slate-50  border border-slate-200  text-xs p-1.5 rounded-lg focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-mono text-slate-450">Billet Yard (MT)</label>
                  <input type="text" value={form.billet_yard_mt} onChange={(e) => setForm({ ...form, billet_yard_mt: e.target.value })} className="w-full bg-slate-50  border border-slate-200  text-xs p-1.5 rounded-lg focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-mono text-slate-450">Store Spares (Qty)</label>
                  <input type="number" value={form.store_spares_qty} onChange={(e) => setForm({ ...form, store_spares_qty: e.target.value })} className="w-full bg-slate-50  border border-slate-200  text-xs p-1.5 rounded-lg focus:outline-none" />
                </div>
              </div>

              <div className="border border-slate-100  p-3 rounded-xl space-y-2">
                <p className="text-[9px] font-bold text-slate-450 uppercase tracking-wider font-mono">Finished Rebar Stock Yards (MT)</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-slate-450">10mm Rebar</label>
                    <input type="text" value={form.rebar_10mm_mt} onChange={(e) => setForm({ ...form, rebar_10mm_mt: e.target.value })} className="w-full bg-slate-50  border border-slate-200  text-xs p-1.5 rounded-lg focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-slate-450">12mm Rebar</label>
                    <input type="text" value={form.rebar_12mm_mt} onChange={(e) => setForm({ ...form, rebar_12mm_mt: e.target.value })} className="w-full bg-slate-50  border border-slate-200  text-xs p-1.5 rounded-lg focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-slate-450">16mm Rebar</label>
                    <input type="text" value={form.rebar_16mm_mt} onChange={(e) => setForm({ ...form, rebar_16mm_mt: e.target.value })} className="w-full bg-slate-50  border border-slate-200  text-xs p-1.5 rounded-lg focus:outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-slate-450">20mm Rebar</label>
                    <input type="text" value={form.rebar_20mm_mt} onChange={(e) => setForm({ ...form, rebar_20mm_mt: e.target.value })} className="w-full bg-slate-50  border border-slate-200  text-xs p-1.5 rounded-lg focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-slate-450">25mm Rebar</label>
                    <input type="text" value={form.rebar_25mm_mt} onChange={(e) => setForm({ ...form, rebar_25mm_mt: e.target.value })} className="w-full bg-slate-50  border border-slate-200  text-xs p-1.5 rounded-lg focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-slate-450">32mm Rebar</label>
                    <input type="text" value={form.rebar_32mm_mt} onChange={(e) => setForm({ ...form, rebar_32mm_mt: e.target.value })} className="w-full bg-slate-50  border border-slate-200  text-xs p-1.5 rounded-lg focus:outline-none" />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100  flex justify-end space-x-2">
                <button 
                  type="button" 
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 border border-slate-200  text-slate-650  text-xs font-bold rounded-xl hover:bg-slate-50 "
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-[#C5A059] hover:bg-[#B48F48] text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Save Adjustments
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
