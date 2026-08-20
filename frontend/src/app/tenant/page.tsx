'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function TenantOverviewPage() {
  const { user } = useAuth();
  const [isTickerScrolling, setIsTickerScrolling] = React.useState(true);
  const [alerts, setAlerts] = React.useState<string[]>([]);
  
  React.useEffect(() => {
    const data = localStorage.getItem('smc_critical_alerts');
    if (data) {
      setAlerts(JSON.parse(data));
    } else {
      const defaults = [
        "⚠️ CRITICAL: Siam Spinner PO-YRN-001 (Cotton Yarn) delayed in transit.",
        "⚠️ ALARM: Sewing Line 3 defect rate spike detected (2.8% actual vs 1.5% target).",
        "⚠️ ALERT: Dye Vat 01 pressure approaching safety limit (3.2 Bar)."
      ];
      localStorage.setItem('smc_critical_alerts', JSON.stringify(defaults));
      setAlerts(defaults);
    }
  }, []);

  const marqueeText = alerts.join(" • ") + " • ";

  // Spacing presets based on density preference
  const isCompact = user?.preferences?.density === 'compact';
  const cardPadding = isCompact ? 'p-3.5' : 'p-5';
  const gridGap = isCompact ? 'gap-3' : 'gap-5';

  // Summaries from existing modules
  const activeStyles = [
    { styleNo: 'STYLE-2026-A92', buyer: 'Zara Group', item: 'Pique Cotton Polo', qty: 25000, status: 'In Sewing', pct: 75 },
    { styleNo: 'STYLE-2026-B12', buyer: 'Nordstrom', item: 'Crewneck Summer Tee', qty: 42000, status: 'Fabric Sourced', pct: 45 },
    { styleNo: 'STYLE-2026-C04', buyer: 'H&M', item: 'Fleece Pullover Hoodie', qty: 18000, status: 'Design Approved', pct: 20 },
    { styleNo: 'STYLE-2026-D88', buyer: 'Target Corp', item: 'Linen Shorts Set', qty: 35000, status: 'Fabric Sourcing', pct: 10 }
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

  const recentPOs = [
    { poNo: 'PO-YRN-001', supplier: 'Siam Spinner Co.', item: 'Cotton Yarn', cost: 42000, status: 'In Transit' },
    { poNo: 'PO-FAB-012', supplier: 'Guangdong Knit Dye', item: 'Elastane Jersey', cost: 38250, status: 'Received' }
  ];

  const qaAudits = [
    { styleNo: 'STYLE-2026-A92', stage: 'Inline Audit', defects: 16, decision: 'Passed (AQL 2.5)', pass: true },
    { styleNo: 'STYLE-2026-B12', stage: 'Pre-Final Audit', defects: 37, decision: 'Rejected (AQL Limit)', pass: false }
  ];

  // Calculations
  const totalActualOutput = sewingOutputs.reduce((sum, line) => sum + line.actual, 0);
  const avgEfficiency = (sewingOutputs.reduce((sum, line) => sum + line.efficiency, 0) / sewingOutputs.length).toFixed(1);
  const totalPOCost = recentPOs.reduce((sum, po) => sum + po.cost, 0);
  const totalLCValue = 185000 + 320000;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in text-slate-800">
      
      {/* Page Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <svg className="w-5 h-5 text-[#B48F48]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 21V9l-7-4-7 4v12M22 21h-2M4 21H2m10-7h.01M16 11h.01M16 16h.01M8 11h.01M8 16h.01" />
            </svg>
            <span>Overview</span>
          </h1>
          <p className="text-xs text-slate-450 mt-1">Here is the operational summary of your textile and garments facility for today.</p>
        </div>
      </div>

      {/* Critical Alerts Scrolling Ticker */}
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

      {/* KPI Panel Grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 ${gridGap}`}>
        
        {/* Card 1: Active Styles */}
        <div className="bg-white border border-slate-200/85 p-5 rounded-2xl shadow-sm hover:border-[#C5A059]/30 transition-all flex flex-col justify-between h-32 group">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Active styles</p>
            <span className="text-[#C5A059] bg-[#FAF6EE] p-1.5 rounded-lg border border-[#C5A059]/10">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v16M8 7l4-4 4 4M4 10l8 4 8-4" />
              </svg>
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-955 font-mono leading-none">{activeStyles.length}</h3>
            <p className="text-[9px] text-[#B48F48] font-bold font-mono mt-2.5 flex items-center space-x-1">
              <span>➔ VIEW DIRECTORY</span>
            </p>
          </div>
        </div>

        {/* Card 2: Sewing Yield */}
        <div className="bg-white border border-slate-200/85 p-5 rounded-2xl shadow-sm hover:border-[#C5A059]/30 transition-all flex flex-col justify-between h-32 group">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Daily sewing output</p>
            <span className="text-indigo-600 bg-indigo-50 p-1.5 rounded-lg border border-indigo-200/20">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2" />
              </svg>
            </span>
          </div>
          <div>
            <div className="flex items-baseline space-x-1">
              <h3 className="text-2xl font-extrabold text-slate-955 font-mono leading-none">{totalActualOutput.toLocaleString()}</h3>
              <span className="text-xs text-slate-450 font-semibold">Pcs</span>
            </div>
            <p className="text-[9px] text-emerald-600 font-bold font-mono mt-2.5 flex items-center space-x-1">
              <span>📈 {avgEfficiency}% AVERAGE EFFICIENCY</span>
            </p>
          </div>
        </div>

        {/* Card 3: Sourcing Commitments */}
        <div className="bg-white border border-slate-200/85 p-5 rounded-2xl shadow-sm hover:border-[#C5A059]/30 transition-all flex flex-col justify-between h-32 group">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Procurement Commitments</p>
            <span className="text-emerald-600 bg-emerald-50 p-1.5 rounded-lg border border-emerald-250/20">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-955 font-mono leading-none">${totalPOCost.toLocaleString()}</h3>
            <p className="text-[9px] text-slate-450 font-bold font-mono mt-2.5">
              ACROSS ACTIVE SUPPLIER POs
            </p>
          </div>
        </div>

        {/* Card 4: Commercial Contract Value */}
        <div className="bg-white border border-slate-200/85 p-5 rounded-2xl shadow-sm hover:border-[#C5A059]/30 transition-all flex flex-col justify-between h-32 group">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Export Letter of Credits</p>
            <span className="text-amber-600 bg-amber-50 p-1.5 rounded-lg border border-amber-250/20">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-955 font-mono leading-none">${totalLCValue.toLocaleString()}</h3>
            <p className="text-[9px] text-emerald-600 font-extrabold font-mono mt-2.5 flex items-center space-x-1">
              <span>✓ APPROVED & FULLY ADVISED</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Analysis Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Spans 2/3 on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Sewing Lines Status (Planning + Garments) */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-[#B48F48]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono">Sewing Floor Outputs & Efficiency</h3>
              </div>
              <Link href="/tenant/garments-production" className="text-[9px] font-bold text-[#B48F48] hover:underline font-mono">
                VIEW SEWING LOGS →
              </Link>
            </div>

            <div className="space-y-4">
              {sewingOutputs.map((line, idx) => {
                const completionPct = Math.min(100, Math.round((line.actual / line.target) * 100));
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-900 font-extrabold">{line.line}</span>
                        <span className="text-[9px] font-bold font-mono text-indigo-650 bg-indigo-50 px-1.5 py-0.2 rounded">
                          {line.styleNo}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-slate-550">
                        <span className="font-mono text-slate-900">{line.actual}</span>
                        <span className="text-slate-350">/</span>
                        <span className="font-mono text-slate-400">{line.target} Pcs</span>
                        <span className={`text-[10px] font-extrabold font-mono px-2 py-0.5 rounded-full ${
                          line.efficiency >= 90 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                        }`}>
                          {line.efficiency}% Eff.
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar Component */}
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden relative border border-slate-200/20">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          line.efficiency >= 92 ? 'bg-[#C5A059]' : line.efficiency >= 89 ? 'bg-indigo-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${completionPct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                      <span>Supervisor: <span className="font-bold text-slate-700">{line.supervisor}</span></span>
                      <span>Target yield: <span className="font-bold text-slate-700">{completionPct}% met</span></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Line & Area Chart representing 7-Day Efficiency Trend */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-[#B48F48]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono">7-Day Production Efficiency Trend</h3>
              </div>
              <span className="text-[9px] bg-[#FAF6EE] text-[#B48F48] border border-[#C5A059]/20 px-2 py-0.5 rounded font-mono font-bold">
                WEEKLY REPORT
              </span>
            </div>

            {/* SVG Line Graph */}
            <div className="pt-2 relative">
              <svg className="w-full h-36" viewBox="0 0 500 100" preserveAspectRatio="none">
                {/* Horizontal Grid lines */}
                <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="80" x2="500" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                
                {/* Area under curve gradient */}
                <path d="M 0,100 L 0,82 L 80,72 L 160,78 L 240,48 L 320,53 L 400,28 L 480,33 L 500,33 L 500,100 Z" fill="url(#areaGradient)" />
                
                {/* Trend line */}
                <path d="M 0,82 L 80,72 L 160,78 L 240,48 L 320,53 L 400,28 L 480,33 L 500,33" fill="none" stroke="#C5A059" strokeWidth="2.5" strokeLinecap="round" />
                
                {/* Data Points */}
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
              
              {/* X Axis Labels */}
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

          {/* Sourcing & Material Availability Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Fabric Stock Levels */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-[#B48F48]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono">Fabric Warehouse Stocks</h4>
                </div>
                <Link href="/tenant/inventory-management" className="text-[9px] font-bold text-[#B48F48] hover:underline font-mono">
                  MANAGE STOCK
                </Link>
              </div>

              <div className="space-y-4.5 pt-1">
                {fabricStocks.map((stock, idx) => {
                  const fillPct = Math.round((stock.qty / stock.max) * 100);
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 truncate max-w-[140px]">{stock.name}</span>
                        <span className="font-mono font-bold text-slate-800">{stock.qty.toLocaleString()} {stock.qty > 50 ? 'Kgs' : 'Cones'}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/10">
                        <div className={`h-full rounded-full ${stock.color}`} style={{ width: `${fillPct}%` }} />
                      </div>
                      <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                        <span>Type: {stock.type}</span>
                        <span>Capacity: {fillPct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sourcing Commitments pipeline */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-[#B48F48]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono">Recent Sourcing Orders</h4>
                </div>
                <Link href="/tenant/procurement-management" className="text-[9px] font-bold text-[#B48F48] hover:underline font-mono">
                  LOG POs
                </Link>
              </div>

              <div className="space-y-3.5">
                {recentPOs.map((po, idx) => (
                  <div key={idx} className="flex items-start justify-between border-b border-slate-50 pb-2.5 last:border-0 last:pb-0">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900">{po.supplier}</p>
                      <p className="text-[10px] text-slate-450 font-mono">{po.poNo} • {po.item}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-xs font-extrabold text-slate-900 font-mono">${po.cost.toLocaleString()}</p>
                      <span className={`inline-flex px-1.5 py-0.2 rounded text-[8px] font-bold uppercase tracking-wider font-mono ${
                        po.status === 'Received'
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                      }`}>
                        {po.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Spans 1/3 on desktop) */}
        <div className="space-y-6">
          
          {/* Active Style Pipeline Progress */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-[#B48F48]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v16M8 7l4-4 4 4M4 10l8 4 8-4" />
                </svg>
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono">Apparel Style Pipeline</h4>
              </div>
              <Link href="/tenant/merchandising" className="text-[9px] font-bold text-[#B48F48] hover:underline font-mono">
                CATALOG
              </Link>
            </div>

            <div className="space-y-3.5">
              {activeStyles.map((style, idx) => (
                <div key={idx} className="space-y-1 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-900 truncate max-w-[130px]">{style.item}</span>
                    <span className="font-mono text-indigo-650 font-bold">{style.styleNo}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-450 mt-1">
                    <span>Buyer: <span className="font-bold text-slate-700">{style.buyer}</span></span>
                    <span className="font-mono bg-[#FAF6EE] text-[#B48F48] px-1.5 py-0.2 rounded font-extrabold border border-[#C5A059]/10">
                      {style.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quality Verdict Audit Results */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-[#B48F48]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono">Recent QC Audits</h4>
              </div>
              <Link href="/tenant/quality-management" className="text-[9px] font-bold text-[#B48F48] hover:underline font-mono">
                QA BOARD
              </Link>
            </div>

            <div className="space-y-3.5">
              {qaAudits.map((audit, idx) => (
                <div key={idx} className="flex items-start justify-between border-b border-slate-50 pb-2.5 last:border-0 last:pb-0">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-955">{audit.styleNo}</p>
                    <p className="text-[10px] text-slate-450 font-mono">{audit.stage} • {audit.defects} Defects</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase font-mono tracking-wider ${
                      audit.pass 
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                    }`}>
                      {audit.decision.split(' ')[0]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
