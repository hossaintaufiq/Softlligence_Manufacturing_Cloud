'use client';

import React from 'react';

export default function OverviewDashboard() {
  const todayStr = '2026-08-23';

  // Seed data sets matching individual pages
  const scrapData = [
    { date: '2026-08-20', supplier_name: 'Metal Recyclers Corp', scrap_category: 'LC Scrap', scrap_rcv_kg: 15000, truck_no: 'TR-1024' },
    { date: '2026-08-21', supplier_name: 'Apex Scrap Suppliers', scrap_category: 'Rolling Kechi', scrap_rcv_kg: 12800, truck_no: 'TR-8812' },
    { date: '2026-08-22', supplier_name: 'Alpha Alloys', scrap_category: 'Plate Cutting', scrap_rcv_kg: 9500, truck_no: 'TR-5034' }
  ];

  const billetData = [
    { date: '2026-08-20', billet_size_section: '100x100mm x 6m', billet_output_kg: 10500, scull_loss_kg: 1500, heat_no: 'H-260820A' },
    { date: '2026-08-21', billet_size_section: '130x130mm x 6m', billet_output_kg: 11100, scull_loss_kg: 1900, heat_no: 'H-260821A' },
    { date: '2026-08-22', billet_size_section: '100x100mm x 6m', billet_output_kg: 10200, scull_loss_kg: 1300, heat_no: 'H-260822A' }
  ];

  const rollingData = [
    { date: '2026-08-20', billet_input_kg: 10000, rod_size: '12MM', rod_production_kg: 9600, rod_loss_kg: 400 },
    { date: '2026-08-21', billet_input_kg: 11000, rod_size: '16MM', rod_production_kg: 10580, rod_loss_kg: 420 },
    { date: '2026-08-22', billet_input_kg: 10000, rod_size: '20MM', rod_production_kg: 9550, rod_loss_kg: 450 }
  ];

  const dispatchData = [
    { date: '2026-08-20', customer_name: 'Metro Infrastructures', order_no: 'ORD-502', challan_no: 'CH-260820A', vehicle_no: 'TR-2005', dispatch_qty_kg: 8000, rod_size: '12MM' },
    { date: '2026-08-21', customer_name: 'Bengal Housing Ltd', order_no: 'ORD-503', challan_no: 'CH-260821A', vehicle_no: 'TR-1049', dispatch_qty_kg: 12000, rod_size: '16MM' },
    { date: '2026-08-22', customer_name: 'Sikder Builders', order_no: 'ORD-504', challan_no: 'CH-260822A', vehicle_no: 'TR-7720', dispatch_qty_kg: 9500, rod_size: '20MM' }
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

  // Melt Shop vs Rolling Mill breakdown minutes
  const meltShopDowntime = downtimeData.reduce((sum, d) => sum + d.billet_breakdown_min, 0);
  const rollingMillDowntime = downtimeData.reduce((sum, d) => sum + d.rolling_breakdown_min, 0);
  const totalDowntime = meltShopDowntime + rollingMillDowntime;

  const topDeliveries = [...dispatchData]
    .sort((a, b) => b.dispatch_qty_kg - a.dispatch_qty_kg)
    .slice(0, 5);

  const scrapInwardFeed = [...scrapData]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

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
                    <p className="text-[9px] text-slate-440 font-mono">{s.scrap_category} • Truck: {s.truck_no}</p>
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
