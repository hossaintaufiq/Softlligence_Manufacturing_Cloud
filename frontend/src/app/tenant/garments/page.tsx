'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function GarmentsOverviewPage() {
  const { user } = useAuth();
  const [isTickerScrolling, setIsTickerScrolling] = React.useState(true);
  const [alerts, setAlerts] = React.useState<string[]>([]);
  
  React.useEffect(() => {
    const data = localStorage.getItem('smc_critical_alerts');
    if (data) {
      setAlerts(JSON.parse(data));
    }
  }, []);

  const marqueeText = alerts.join(" • ") + " • ";
  const isCompact = user?.preferences?.density === 'compact';
  const gridGap = isCompact ? 'gap-3' : 'gap-5';

  const activeStyles = [
    { styleNo: 'STYLE-2026-A92', buyer: 'Zara Group', item: 'Pique Cotton Polo', qty: 25000, status: 'In Sewing', pct: 75 },
    { styleNo: 'STYLE-2026-B12', buyer: 'Nordstrom', item: 'Crewneck Summer Tee', qty: 42000, status: 'Fabric Sourced', pct: 45 },
    { styleNo: 'STYLE-2026-C04', buyer: 'H&M', item: 'Fleece Pullover Hoodie', qty: 18000, status: 'Design Approved', pct: 20 }
  ];

  const sewingOutputs = [
    { line: 'Sewing Line 1', styleNo: 'STYLE-2026-A92', target: 800, actual: 785, defects: 8, efficiency: 92.5, supervisor: 'Marcus Vance' },
    { line: 'Sewing Line 2', styleNo: 'STYLE-2026-A92', target: 600, actual: 612, defects: 12, efficiency: 88.3, supervisor: 'Rita Diaz' },
    { line: 'Sewing Line 3', styleNo: 'STYLE-2026-B12', target: 900, actual: 854, defects: 15, efficiency: 95.0, supervisor: 'Arthur Pendelton' }
  ];

  const fabricStocks = [
    { name: 'Cotton Pique Knit (Navy)', type: 'Body Fabric', qty: 4500, max: 5000, color: 'bg-[#C5A059]' },
    { name: 'Combed Cotton Jersey (White)', type: 'Body Fabric', qty: 8200, max: 10000, color: 'bg-indigo-500' },
    { name: 'Polyester Thread (Grey)', type: 'Trims', qty: 1200, max: 2000, color: 'bg-slate-400' }
  ];

  const totalActualOutput = sewingOutputs.reduce((sum, line) => sum + line.actual, 0);
  const avgEfficiency = (sewingOutputs.reduce((sum, line) => sum + line.efficiency, 0) / sewingOutputs.length).toFixed(1);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in text-slate-800">
      
      {/* Title */}
      <div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
          <svg className="w-5 h-5 text-[#B48F48]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 21V9l-7-4-7 4v12M22 21h-2M4 21H2m10-7h.01M16 11h.01M16 16h.01M8 11h.01M8 16h.01" />
          </svg>
          <span>Overview</span>
        </h1>
        <p className="text-xs text-slate-450 mt-1">Here is the operational summary of your textile and garments facility for today.</p>
      </div>

      {/* Ticker */}
      {alerts.length > 0 && (
        <div className="relative overflow-hidden w-full bg-rose-50/70 border border-rose-200/50 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-rose-800 font-bold font-mono shadow-2xs">
          <style>{`
            @keyframes marquee {
              0% { transform: translateX(0%); }
              100% { transform: translateX(-50%); }
            }
            .marquee-content {
              display: inline-flex;
              white-space: nowrap;
              animation: marquee 25s linear infinite;
            }
          `}</style>
          
          <div className="flex items-center space-x-2 mr-4 bg-rose-50/10 z-10 pr-2 shrink-0">
            <span className="animate-pulse">🚨</span>
            <span className="text-[10px] uppercase font-black tracking-wider text-rose-900">CRITICAL TICKER:</span>
          </div>
          
          <div className="flex-1 overflow-hidden relative h-5 flex items-center">
            <div 
              className="marquee-content flex space-x-8"
              style={{ animationPlayState: isTickerScrolling ? 'running' : 'paused' }}
            >
              <span>{marqueeText}</span>
              <span>{marqueeText}</span>
            </div>
          </div>

          <button
            onClick={() => setIsTickerScrolling(!isTickerScrolling)}
            className="ml-4 px-2.5 py-1 bg-white border border-rose-200 hover:bg-rose-100/50 text-rose-700 text-[10px] font-black rounded-lg transition-all shrink-0 active:scale-95 shadow-2xs font-mono uppercase"
          >
            {isTickerScrolling ? 'Pause' : 'Start'}
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 ${gridGap}`}>
        <div className="bg-white border border-slate-200/85 p-5 rounded-2xl shadow-sm hover:border-[#C5A059]/30 transition-all flex flex-col justify-between h-32 group">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Active styles</p>
            <span className="text-[#C5A059] bg-[#FAF6EE] p-1.5 rounded-lg border border-[#C5A059]/10">👚</span>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-950 font-mono leading-none">{activeStyles.length}</h3>
            <p className="text-[9px] text-[#B48F48] font-bold font-mono mt-2.5 flex items-center space-x-1">
              <span>➔ VIEW DIRECTORY</span>
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/85 p-5 rounded-2xl shadow-sm hover:border-[#C5A059]/30 transition-all flex flex-col justify-between h-32 group">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Daily sewing output</p>
            <span className="text-indigo-650 bg-indigo-50 p-1.5 rounded-lg border border-indigo-200/20">🧵</span>
          </div>
          <div>
            <div className="flex items-baseline space-x-1">
              <h3 className="text-2xl font-extrabold text-slate-950 font-mono leading-none">{totalActualOutput.toLocaleString()}</h3>
              <span className="text-xs text-slate-450 font-semibold">Pcs</span>
            </div>
            <p className="text-[9px] text-emerald-600 font-bold font-mono mt-2.5 flex items-center space-x-1">
              <span>📈 {avgEfficiency}% AVERAGE EFFICIENCY</span>
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/85 p-5 rounded-2xl shadow-sm hover:border-[#C5A059]/30 transition-all flex flex-col justify-between h-32 group">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Fabric Stock Volume</p>
            <span className="text-emerald-600 bg-emerald-50 p-1.5 rounded-lg">📦</span>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-950 font-mono leading-none">13.9 Tons</h3>
            <p className="text-[9px] text-slate-450 font-bold font-mono mt-2.5">ACROSS WAREHOUSE DECKS</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/85 p-5 rounded-2xl shadow-sm hover:border-[#C5A059]/30 transition-all flex flex-col justify-between h-32 group">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Export Letter of Credits</p>
            <span className="text-amber-600 bg-amber-50 p-1.5 rounded-lg">🚢</span>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-950 font-mono leading-none">$505,000</h3>
            <p className="text-[9px] text-emerald-600 font-extrabold font-mono mt-2.5 flex items-center space-x-1">
              <span>✓ APPROVED & FULLY ADVISED</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono">Sewing Floor Outputs & Efficiency</h3>
              <Link href="/tenant/garments/garments-production" className="text-[9px] font-bold text-[#B48F48] hover:underline font-mono">VIEW LOGS →</Link>
            </div>

            <div className="space-y-4">
              {sewingOutputs.map((line, idx) => {
                const completionPct = Math.min(100, Math.round((line.actual / line.target) * 100));
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-900 font-extrabold">{line.line} ({line.styleNo})</span>
                      <span className="font-mono text-slate-900">{line.actual} / {line.target} Pcs</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative">
                      <div className="h-full bg-[#C5A059] rounded-full" style={{ width: `${completionPct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Graph */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono border-b border-slate-100 pb-3">7-Day Production Efficiency Trend</h3>
            <svg className="w-full h-36" viewBox="0 0 500 100" preserveAspectRatio="none">
              <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="#f1f5f9" strokeWidth="1" />
              <path d="M 0,100 L 0,82 L 80,72 L 160,78 L 240,48 L 320,53 L 400,28 L 480,33 L 500,33 L 500,100 Z" fill="url(#areaGradient)" />
              <path d="M 0,82 L 80,72 L 160,78 L 240,48 L 320,53 L 400,28 L 480,33 L 500,33" fill="none" stroke="#C5A059" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="80" cy="72" r="3.5" fill="#B48F48" stroke="#fff" strokeWidth="1.5" />
              <circle cx="160" cy="78" r="3.5" fill="#B48F48" stroke="#fff" strokeWidth="1.5" />
              <circle cx="240" cy="48" r="3.5" fill="#B48F48" stroke="#fff" strokeWidth="1.5" />
              <circle cx="320" cy="53" r="3.5" fill="#B48F48" stroke="#fff" strokeWidth="1.5" />
              <circle cx="400" cy="28" r="3.5" fill="#B48F48" stroke="#fff" strokeWidth="1.5" />
              <circle cx="480" cy="33" r="3.5" fill="#B48F48" stroke="#fff" strokeWidth="1.5" />
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C5A059" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#FAF6EE" stopOpacity="0.02" />
                </linearGradient>
              </defs>
            </svg>
            <div className="flex justify-between text-[8px] font-bold text-slate-400 font-mono pt-2 px-1">
              <span>MON (85%)</span>
              <span>TUE (87%)</span>
              <span>WED (86%)</span>
              <span>THU (91%)</span>
              <span>FRI (90%)</span>
              <span>SAT (94%)</span>
              <span>SUN (93%)</span>
            </div>
          </div>
        </div>

        {/* Warehouse Stocks */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono border-b border-slate-100 pb-3">Fabric Warehouse Stocks</h4>
            <div className="space-y-4 pt-1">
              {fabricStocks.map((stock, idx) => {
                const fillPct = Math.round((stock.qty / stock.max) * 100);
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 truncate">{stock.name}</span>
                      <span className="font-mono font-bold text-slate-800">{stock.qty} Kgs</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${stock.color}`} style={{ width: `${fillPct}%` }} />
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
