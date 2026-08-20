'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';

export default function SteelOverviewPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';
  const gridGap = isCompact ? 'gap-3.5' : 'gap-4 sm:gap-6';

  const steelStocks = [
    { name: 'Heavy Melting Scrap (HM-01)', type: 'Raw Material', qty: 1250.4, max: 2000, color: 'bg-slate-650' },
    { name: 'Grade 60 Cast Steel Billets', type: 'WIP Material', qty: 340.2, max: 500, color: 'bg-orange-500' },
    { name: 'Deformed Rebars (12mm)', type: 'Finished Goods', qty: 850.5, max: 1000, color: 'bg-emerald-600' }
  ];

  const furnaceLogs = [
    { name: 'Blast Furnace 1', temp: 1540, status: 'Optimal Running', target: 1600 },
    { name: 'Ladle Furnace A', temp: 1612, status: 'Heat Cycle Active', target: 1650 },
    { name: 'Continuous Caster 2', temp: 1220, status: 'Cooling Stage', target: 1250 }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in text-slate-800">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 21V9l-7-4-7 4v12M22 21h-2M4 21H2m10-7h.01M16 11h.01M16 16h.01M8 11h.01M8 16h.01" />
            </svg>
            <span>Overview</span>
          </h1>
          <p className="text-xs text-slate-450 mt-1">Real-time status of smelting blast furnaces and billet cast yield.</p>
        </div>
      </div>

      {/* KPI Dials */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 ${gridGap}`}>
        <div className="bg-white border border-slate-200/85 p-5 rounded-2xl shadow-sm hover:border-orange-500/30 transition-all flex flex-col justify-between h-32 group">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Blast Furnace 1</p>
            <span className="text-orange-500 bg-orange-50 p-1.5 rounded-lg border border-orange-200/20">🔥</span>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-955 font-mono leading-none">1,540°C</h3>
            <p className="text-[9px] text-emerald-600 font-bold font-mono mt-2.5">OPTIMAL LIQUID TEMPERATURE</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/85 p-5 rounded-2xl shadow-sm hover:border-orange-500/30 transition-all flex flex-col justify-between h-32 group">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Daily Melt Yield</p>
            <span className="text-slate-700 bg-slate-150 p-1.5 rounded-lg">⚙️</span>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-955 font-mono leading-none">145.2 Tons</h3>
            <p className="text-[9px] text-[#B48F48] font-bold font-mono mt-2.5">GRADE 60 STRUCTURAL ALLOY</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/85 p-5 rounded-2xl shadow-sm hover:border-orange-500/30 transition-all flex flex-col justify-between h-32 group">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Scrap Steel Stockpile</p>
            <span className="text-indigo-600 bg-indigo-50 p-1.5 rounded-lg">⛓️</span>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-955 font-mono leading-none">1,250 MT</h3>
            <p className="text-[9px] text-slate-400 font-bold font-mono mt-2.5">HEAVY MELTING SCRAP IN STORE</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/85 p-5 rounded-2xl shadow-sm hover:border-orange-500/30 transition-all flex flex-col justify-between h-32 group">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Heat Cycles Completed</p>
            <span className="text-amber-600 bg-amber-50 p-1.5 rounded-lg">🔄</span>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-955 font-mono leading-none">8 Cycles</h3>
            <p className="text-[9px] text-emerald-600 font-bold font-mono mt-2.5">100% CASTING SLOT EFFICIENCY</p>
          </div>
        </div>
      </div>

      {/* Furnace details split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono border-b border-slate-100 pb-3">Smelting Furnace Status</h3>
            <div className="space-y-4">
              {furnaceLogs.map((furnace, idx) => {
                const completionPct = Math.min(100, Math.round((furnace.temp / furnace.target) * 100));
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-900 font-extrabold">{furnace.name}</span>
                      <span className="font-mono text-slate-955">{furnace.temp}°C / {furnace.target}°C Target</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden relative">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: `${completionPct}%` }} />
                    </div>
                    <div className="flex justify-between text-[9px] font-mono text-slate-400">
                      <span>Status: <span className="font-bold text-slate-700">{furnace.status}</span></span>
                      <span>Capacity: {completionPct}% reached</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono border-b border-slate-100 pb-3">Smelting Heat Cycles (Mon-Sun)</h3>
            <svg className="w-full h-32" viewBox="0 0 500 100" preserveAspectRatio="none">
              <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="#f1f5f9" strokeWidth="1" />
              <path d="M 0,100 L 0,60 L 80,45 L 160,85 L 240,30 L 320,55 L 400,25 L 480,40 L 500,40 L 500,100 Z" fill="url(#steelGradient)" />
              <path d="M 0,60 L 80,45 L 160,85 L 240,30 L 320,55 L 400,25 L 480,40 L 500,40" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
              <defs>
                <linearGradient id="steelGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#FAF6EE" stopOpacity="0.02" />
                </linearGradient>
              </defs>
            </svg>
            <div className="flex justify-between text-[8px] font-bold text-slate-400 font-mono pt-2 px-1">
              <span>MON (6 Cycles)</span>
              <span>TUE (7 Cycles)</span>
              <span>WED (5 Cycles)</span>
              <span>THU (9 Cycles)</span>
              <span>FRI (8 Cycles)</span>
              <span>SAT (10 Cycles)</span>
              <span>SUN (9 Cycles)</span>
            </div>
          </div>
        </div>

        {/* Sidebar Stocks */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono border-b border-slate-100 pb-3">Iron Ore & Scrap Stocks</h4>
            <div className="space-y-4.5 pt-1">
              {steelStocks.map((stock, idx) => {
                const fillPct = Math.round((stock.qty / stock.max) * 100);
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 truncate">{stock.name}</span>
                      <span className="font-mono font-bold text-slate-850">{stock.qty.toLocaleString()} MT</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${stock.color}`} style={{ width: `${fillPct}%` }} />
                    </div>
                    <div className="flex justify-between text-[8px] text-slate-400 font-mono">
                      <span>Capacity: {fillPct}%</span>
                      <span>Max Cap: {stock.max} MT</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
