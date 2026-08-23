'use client';

import React from 'react';

export default function OverviewDashboard() {
  const todayStr = '2026-08-23';

  // Seed data sets matching individual pages
  const scrapData = [
    { date: '2026-08-20', supplier_name: 'Metal Recyclers Corp', scrap_category: 'LC Scrap', scrap_rcv_kg: 15000, truck_no: 'TR-1024' },
    { date: '2026-08-21', supplier_name: 'Apex Scrap Suppliers', scrap_category: 'Rolling Kechi', scrap_rcv_kg: 12800, truck_no: 'TR-8812' },
    { date: '2026-08-22', supplier_name: 'Alpha Alloys', scrap_category: 'Plate Cutting', scrap_rcv_kg: 9500, truck_no: 'TR-5034' },
    { date: '2026-08-23', supplier_name: 'Apex Scrap Suppliers', scrap_category: 'LC Scrap', scrap_rcv_kg: 16500, truck_no: 'TR-2041' }
  ];

  const billetData = [
    { date: '2026-08-20', billet_output_kg: 10500 },
    { date: '2026-08-21', billet_output_kg: 11100 },
    { date: '2026-08-22', billet_output_kg: 10200 },
    { date: '2026-08-23', billet_output_kg: 11000 }
  ];

  const rollingData = [
    { date: '2026-08-20', rod_production_kg: 9600 },
    { date: '2026-08-21', rod_production_kg: 10580 },
    { date: '2026-08-22', rod_production_kg: 9550 },
    { date: '2026-08-23', rod_production_kg: 10100 }
  ];

  const dispatchData = [
    { date: '2026-08-20', customer_name: 'Metro Infrastructures', dispatch_qty_kg: 8000, total_sales_value: 736000, payment_status: 'Paid', rod_size: '12MM', challan_no: 'CH-20A' },
    { date: '2026-08-21', customer_name: 'Bengal Housing Ltd', dispatch_qty_kg: 12000, total_sales_value: 1128000, payment_status: 'Partial', rod_size: '16MM', challan_no: 'CH-21A' },
    { date: '2026-08-22', customer_name: 'Sikder Builders', dispatch_qty_kg: 9500, total_sales_value: 874000, payment_status: 'Pending', rod_size: '20MM', challan_no: 'CH-22A' },
    { date: '2026-08-23', customer_name: 'Metro Infrastructures', dispatch_qty_kg: 10000, total_sales_value: 930000, payment_status: 'Paid', rod_size: '12MM', challan_no: 'CH-23A' }
  ];

  const downtimeData = [
    { date: '2026-08-20', billet_breakdown_min: 45, rolling_breakdown_min: 0, breakdown_category: 'Electrical' },
    { date: '2026-08-21', billet_breakdown_min: 0, rolling_breakdown_min: 90, breakdown_category: 'Roll Changing' },
    { date: '2026-08-22', billet_breakdown_min: 30, rolling_breakdown_min: 0, breakdown_category: 'Mechanical' }
  ];

  const energyData = [
    { date: '2026-08-20', total_production_kg: 20100, power_consumption_kw: 13500 },
    { date: '2026-08-21', total_production_kg: 22020, power_consumption_kw: 14200 },
    { date: '2026-08-22', total_production_kg: 19800, power_consumption_kw: 13100 }
  ];

  // Aggregations
  const totalScrapMt = (scrapData.reduce((sum, s) => sum + s.scrap_rcv_kg, 0) / 1000).toFixed(1);
  const totalBilletMt = (billetData.reduce((sum, b) => sum + b.billet_output_kg, 0) / 1000).toFixed(1);
  const totalRebarMt = (rollingData.reduce((sum, r) => sum + r.rod_production_kg, 0) / 1000).toFixed(1);
  const totalDispatchMt = (dispatchData.reduce((sum, d) => sum + d.dispatch_qty_kg, 0) / 1000).toFixed(1);

  // Specific power consumption ratio (kWh/MT of finished rods produced)
  const totalPowerKwh = energyData.reduce((sum, e) => sum + e.power_consumption_kw, 0);
  const specificPowerKwhMt = totalRebarMt !== '0.0'
    ? (totalPowerKwh / parseFloat(totalRebarMt)).toFixed(1)
    : '0';

  // Melt Shop vs Rolling Mill downtime minutes
  const meltShopDowntime = downtimeData.reduce((sum, d) => sum + d.billet_breakdown_min, 0);
  const rollingMillDowntime = downtimeData.reduce((sum, d) => sum + d.rolling_breakdown_min, 0);
  const totalDowntime = meltShopDowntime + rollingMillDowntime;

  const topDeliveries = [...dispatchData]
    .sort((a, b) => b.dispatch_qty_kg - a.dispatch_qty_kg)
    .slice(0, 4);

  const scrapInwardFeed = [...scrapData]
    .slice(0, 4);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in text-slate-800">
      
      {/* Title Bar */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <svg className="w-5 h-5 text-[#B48F48]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 21V9l-7-4-7 4v12M22 21h-2M4 21H2m10-7h.01M16 11h.01M16 16h.01M8 11h.01M8 16h.01" />
            </svg>
            <span>Hi Tech Steel Overview</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Real-time aggregated indicators of smelting heats, casting, and finished rebar dispatches.</p>
        </div>
        <div className="text-xs bg-[#FAF6EE] text-[#B48F48] border border-[#C5A059]/20 px-3 py-1.5 rounded-xl font-bold font-mono">
          System Date: {todayStr}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Scrap Inward */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-col justify-between h-32 hover:border-[#C5A059]/30 transition-all group">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Total Scrap Inward</p>
            <span className="text-[#B48F48] bg-[#FAF6EE] px-2 py-0.5 rounded text-[8px] font-bold font-mono uppercase">Scrap</span>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 font-mono leading-none">{totalScrapMt} MT</h3>
            <p className="text-[9px] text-emerald-600 font-bold font-mono mt-2.5">▲ COMPLIANT RAW FEED</p>
          </div>
        </div>

        {/* Billet Cast */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-col justify-between h-32 hover:border-[#C5A059]/30 transition-all group">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Billet Cast Total</p>
            <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded text-[8px] font-bold font-mono uppercase">Melt / CCM</span>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 font-mono leading-none">{totalBilletMt} MT</h3>
            <p className="text-[9px] text-[#B48F48] font-bold font-mono mt-2.5">GRADE 60 STRUCTURAL BILLETS</p>
          </div>
        </div>

        {/* Rebar Rolled */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-col justify-between h-32 hover:border-[#C5A059]/30 transition-all group">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Rebar Rolled Production</p>
            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[8px] font-bold font-mono uppercase">Re-Rolling</span>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 font-mono leading-none">{totalRebarMt} MT</h3>
            <p className="text-[9px] text-emerald-600 font-bold font-mono mt-2.5">FINISHED DEFORMED REBARS</p>
          </div>
        </div>

        {/* Finished Dispatches */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-col justify-between h-32 hover:border-[#C5A059]/30 transition-all group">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Total Sales Dispatches</p>
            <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[8px] font-bold font-mono uppercase">Logistics</span>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 font-mono leading-none">{totalDispatchMt} MT</h3>
            <p className="text-[9px] text-slate-400 font-bold font-mono mt-2.5">CHALLANS SIGNED & CLEARED</p>
          </div>
        </div>

      </div>

      {/* NEW: Production & Operational Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Daily Production & Dispatch Trends */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono">Daily Casting vs. Re-Rolling (MT)</h3>
            <div className="flex space-x-3 text-[9px] font-mono font-bold">
              <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 bg-[#C5A059] rounded-sm"></span> <span>Billet Cast</span></span>
              <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></span> <span>Finished Rod</span></span>
            </div>
          </div>
          <svg className="w-full h-48" viewBox="0 0 400 120" preserveAspectRatio="none">
            {/* Grid Lines */}
            <line x1="0" y1="20" x2="400" y2="20" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="0" y1="60" x2="400" y2="60" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="0" y1="100" x2="400" y2="100" stroke="#f1f5f9" strokeWidth="1" />
            
            {/* Area under line 1 (Billet Cast) */}
            <path d="M 0,120 L 50,75 L 150,65 L 250,85 L 350,60 Z" fill="url(#billetGrad)" />
            {/* Line 1 (Billet Cast) */}
            <path d="M 0,120 L 50,75 L 150,65 L 250,85 L 350,60" fill="none" stroke="#C5A059" strokeWidth="2.5" strokeLinecap="round" />
            
            {/* Line 2 (Finished Rod) */}
            <path d="M 0,120 L 50,85 L 150,70 L 250,90 L 350,75" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
            
            {/* Definition of Gradients */}
            <defs>
              <linearGradient id="billetGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C5A059" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#C5A059" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
          <div className="flex justify-between text-[8px] font-bold text-slate-400 font-mono px-1">
            <span>AUG 20 (10.5 MT)</span>
            <span>AUG 21 (11.1 MT)</span>
            <span>AUG 22 (10.2 MT)</span>
            <span>AUG 23 (11.0 MT)</span>
          </div>
        </div>

        {/* Chart 2: Monthly Summary Comparison */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono border-b border-slate-100 pb-3">Monthly Consolidated Intake & Output (MT)</h3>
          <div className="flex items-end justify-between h-44 pt-4 px-2">
            
            {/* Column 1: Scrap */}
            <div className="flex flex-col items-center flex-1 space-y-2">
              <span className="text-[10px] font-bold font-mono text-slate-900">{totalScrapMt}t</span>
              <div className="w-8 bg-slate-300 rounded-t-lg transition-all hover:bg-slate-400" style={{ height: '78px' }} />
              <span className="text-[8px] font-bold font-mono text-slate-400 uppercase">Scrap Intake</span>
            </div>

            {/* Column 2: Billets */}
            <div className="flex flex-col items-center flex-1 space-y-2">
              <span className="text-[10px] font-bold font-mono text-slate-900">{totalBilletMt}t</span>
              <div className="w-8 bg-[#C5A059] rounded-t-lg transition-all hover:bg-[#B48F48]" style={{ height: '62px' }} />
              <span className="text-[8px] font-bold font-mono text-slate-400 uppercase">Billets Cast</span>
            </div>

            {/* Column 3: Rods */}
            <div className="flex flex-col items-center flex-1 space-y-2">
              <span className="text-[10px] font-bold font-mono text-slate-900">{totalRebarMt}t</span>
              <div className="w-8 bg-emerald-500 rounded-t-lg transition-all hover:bg-emerald-600" style={{ height: '58px' }} />
              <span className="text-[8px] font-bold font-mono text-slate-400 uppercase">Rods Rolled</span>
            </div>

            {/* Column 4: Dispatch */}
            <div className="flex flex-col items-center flex-1 space-y-2">
              <span className="text-[10px] font-bold font-mono text-slate-900">{totalDispatchMt}t</span>
              <div className="w-8 bg-indigo-500 rounded-t-lg transition-all hover:bg-indigo-650" style={{ height: '56px' }} />
              <span className="text-[8px] font-bold font-mono text-slate-400 uppercase">Dispatch Out</span>
            </div>

          </div>
        </div>

      </div>

      {/* Ratios & Splits grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Downtime & Utilities Ratios */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Specific Power Consumption */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Specific Power Consumption</span>
              <span className="text-[#B48F48] font-mono text-[10px] font-bold">{specificPowerKwhMt} kWh/MT</span>
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span>Total Plant Utilities Load</span>
                <span className="font-mono font-bold">{totalPowerKwh.toLocaleString()} kWh</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#C5A059] rounded-full" style={{ width: `${Math.min(100, (parseFloat(specificPowerKwhMt) / 3000) * 100)}%` }} />
              </div>
              <p className="text-[10px] text-slate-450">Specific consumption is measured relative to total metric tonnage of deformed rods production.</p>
            </div>
          </div>

          {/* Downtime Ratio Chart */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono border-b border-slate-100 pb-3">
              Melt Shop vs Rolling Mill Downtime Ratio
            </h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                <p className="text-[10px] font-bold text-slate-400 uppercase font-mono">Billet Melt Shop / CCM</p>
                <h4 className="text-xl font-bold text-rose-600 font-mono mt-1">{meltShopDowntime} mins</h4>
                <p className="text-[8px] text-slate-450 mt-1">({totalDowntime > 0 ? Math.round((meltShopDowntime / totalDowntime) * 100) : 0}% of breakdown duration)</p>
              </div>
              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                <p className="text-[10px] font-bold text-slate-400 uppercase font-mono">Re-Rolling Mill</p>
                <h4 className="text-xl font-bold text-indigo-600 font-mono mt-1">{rollingMillDowntime} mins</h4>
                <p className="text-[8px] text-slate-450 mt-1">({totalDowntime > 0 ? Math.round((rollingMillDowntime / totalDowntime) * 100) : 0}% of breakdown duration)</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right: Active feed lists */}
        <div className="space-y-6">
          
          {/* Top Client Deliveries */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono border-b border-slate-100 pb-3">Top Client Deliveries</h4>
            <div className="space-y-3 pt-1 text-xs">
              {topDeliveries.map((del, idx) => (
                <div key={idx} className="flex justify-between items-center pb-2.5 border-b border-slate-50 last:border-0 last:pb-0">
                  <div>
                    <p className="font-bold text-slate-900">{del.customer_name}</p>
                    <p className="text-[9px] text-slate-440 font-mono">Challan: {del.challan_no} • {del.rod_size}</p>
                  </div>
                  <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100/50">
                    {(del.dispatch_qty_kg / 1000).toFixed(1)} MT
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Inbound Scrap Feed */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono border-b border-slate-100 pb-3">Scrap Arrivals Feed</h4>
            <div className="space-y-3 pt-1 text-xs">
              {scrapInwardFeed.map((s, idx) => (
                <div key={idx} className="flex justify-between items-center pb-2.5 border-b border-slate-50 last:border-0 last:pb-0">
                  <div>
                    <p className="font-bold text-slate-900">{s.supplier_name}</p>
                    <p className="text-[9px] text-slate-440 font-mono">Truck: {s.truck_no}</p>
                  </div>
                  <span className="font-mono font-bold text-[#B48F48] bg-[#FAF6EE] px-2 py-0.5 rounded border border-[#C5A059]/20">
                    {(s.scrap_rcv_kg / 1000).toFixed(1)} MT
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
