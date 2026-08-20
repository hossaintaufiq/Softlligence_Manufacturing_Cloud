'use client';
import React from 'react';
import { useAuth } from '@/context/AuthContext';

export default function FurnaceSmeltingPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';
  const tableCellPadding = isCompact ? 'px-4 py-2.5 text-[11px]' : 'px-6 py-4 text-xs';

  const furnaces = [
    { id: 'EAF-01', name: 'Electric Arc Furnace 1', temp: 1540, state: 'Melting', duration: '42 mins', target: 1600, tag: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    { id: 'LRF-02', name: 'Ladle Refining Furnace A', temp: 1612, state: 'Refining', duration: '18 mins', target: 1650, tag: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' },
    { id: 'EAF-03', name: 'Electric Arc Furnace 2', temp: 250, state: 'Tapped / Cooling', duration: '5 mins', target: 1600, tag: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' }
  ];

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-extrabold text-slate-900">EAF & Ladle Furnace Operations</h2>
        <p className="text-[11px] text-slate-500">Monitor EAF melting heat cycles, power consumption, and steel alloy chemistry.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {furnaces.map((f, idx) => {
          const pct = Math.round((f.temp / f.target) * 100);
          return (
            <div key={idx} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold text-slate-400 font-mono tracking-wider">{f.id}</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold font-mono border uppercase ` + f.tag}>{f.state}</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{f.name}</h4>
                <p className="text-[10px] text-slate-450 font-mono mt-1">Refractory Heat Life: 84%</p>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono font-bold">
                  <span>Temp: {f.temp}°C</span>
                  <span className="text-slate-450">Target: {f.target}°C</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: `${Math.min(100, pct)}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
