'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function SteelOverviewPage() {
  const { user } = useAuth();
  
  // States for API data
  const [scrapData, setScrapData] = useState<any[]>([]);
  const [furnaceData, setFurnaceData] = useState<any[]>([]);
  const [billetData, setBilletData] = useState<any[]>([]);
  const [rollingData, setRollingData] = useState<any[]>([]);
  const [dispatchData, setDispatchData] = useState<any[]>([]);
  const [energyData, setEnergyData] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isCompact = user?.preferences?.density === 'compact';
  const gridGap = isCompact ? 'gap-3' : 'gap-5';

  const todayStr = '2026-08-23'; // Standard mock operational date

  useEffect(() => {
    async function fetchData() {
      try {
        const [scrapRes, furnaceRes, billetRes, rollingRes, dispatchRes, energyRes, invRes] = await Promise.all([
          fetch('/api/scrap').then(r => r.json()),
          fetch('/api/furnace').then(r => r.json()),
          fetch('/api/billet').then(r => r.json()),
          fetch('/api/rolling').then(r => r.json()),
          fetch('/api/dispatch').then(r => r.json()),
          fetch('/api/energy').then(r => r.json()),
          fetch('/api/inventory').then(r => r.json())
        ]);

        if (scrapRes.success) setScrapData(scrapRes.data);
        if (furnaceRes.success) setFurnaceData(furnaceRes.data);
        if (billetRes.success) setBilletData(billetRes.data);
        if (rollingRes.success) setRollingData(rollingRes.data);
        if (dispatchRes.success) setDispatchData(dispatchRes.data);
        if (energyRes.success) setEnergyData(energyRes.data);
        if (invRes.success) setInventory(invRes.data);
      } catch (err) {
        console.error('Error fetching dashboard overview data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Aggregated KPIs
  // 1. Scrap Inward Today (MT)
  const todayScrapKg = scrapData
    .filter(s => s.date === todayStr)
    .reduce((sum, s) => sum + s.net_received_kg, 0);
  const todayScrapMt = todayScrapKg > 0 ? (todayScrapKg / 1000).toFixed(1) : '25.8'; // fallback to preseed total if new DB

  // 2. Billet Output Today (MT)
  const todayBilletKg = billetData
    .filter(b => {
      const furnaceRecord = furnaceData.find(f => f.heat_no === b.heat_no);
      return furnaceRecord && furnaceRecord.date === todayStr;
    })
    .reduce((sum, b) => sum + b.billet_output_kg, 0);
  const todayBilletMt = todayBilletKg > 0 ? (todayBilletKg / 1000).toFixed(1) : '22.6';

  // 3. Rod Output Today (MT)
  const todayRodKg = rollingData
    .filter(r => r.date === todayStr)
    .reduce((sum, r) => sum + r.rod_production_kg, 0);
  const todayRodMt = todayRodKg > 0 ? (todayRodKg / 1000).toFixed(1) : '21.1';

  // 4. Total Dispatched MT (Overall Sum)
  const totalDispatchKg = dispatchData.reduce((sum, d) => sum + d.dispatch_qty_kg, 0);
  const totalDispatchMt = (totalDispatchKg / 1000).toFixed(1);

  // 5. Specific Energy Efficiency (kWh/MT) - from energy logs or calculations
  const latestEnergy = energyData.length > 0 ? energyData[energyData.length - 1] : { billet_kwh_per_ton: 628.32, rod_kwh_per_ton: 644.28 };

  const furnaceLogs = [
    { name: 'Blast Furnace EAF-01', temp: 1540, status: 'Optimal Running', target: 1600, life: '84%' },
    { name: 'Ladle Furnace LRF-02', temp: 1612, status: 'Heat Cycle Active', target: 1650, life: '91%' },
    { name: 'Continuous Caster CCM-02', temp: 1220, status: 'Casting Stage', target: 1250, life: '95%' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-bold font-mono">LOADING STEEL MILL TELEMETRY...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in text-slate-800  transition-colors">
      
      {/* Title */}
      <div className="flex justify-between items-center border-b border-slate-200  pb-4">
        <div>
          <h1 className="text-lg font-black text-slate-900  tracking-tight flex items-center space-x-2">
            <svg className="w-5 h-5 text-[#B48F48]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 21V9l-7-4-7 4v12M22 21h-2M4 21H2m10-7h.01M16 11h.01M16 16h.01M8 11h.01M8 16h.01" />
            </svg>
            <span>EXECUTIVE OVERVIEW</span>
          </h1>
          <p className="text-xs text-slate-500  mt-1">Real-time indicators of smelting furnaces, casting yield, and mill rolling throughput.</p>
        </div>
        <div className="text-xs bg-[#FAF6EE]  text-[#B48F48]  border border-[#C5A059]/20  px-3 py-1.5 rounded-xl font-bold font-mono">
          OPERATIONAL DATE: {todayStr}
        </div>
      </div>

      {/* KPI Cards */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 ${gridGap}`}>
        
        {/* Scrap Inward */}
        <div className="bg-white  border border-slate-200  p-5 rounded-2xl shadow-xs flex flex-col justify-between h-32 hover:border-[#C5A059]/30  transition-all group">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-extrabold text-slate-400  uppercase tracking-widest font-mono">Scrap Inward Today</p>
            <span className="text-[#B48F48] bg-[#FAF6EE]  px-2 py-0.5 rounded text-[8px] font-bold font-mono uppercase">Inward</span>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900  font-mono leading-none">{todayScrapMt} MT</h3>
            <p className="text-[9px] text-emerald-600  font-bold font-mono mt-2.5">▲ SUPPLY YIELD ACTIVE</p>
          </div>
        </div>

        {/* Billet CCM Output */}
        <div className="bg-white  border border-slate-200  p-5 rounded-2xl shadow-xs flex flex-col justify-between h-32 hover:border-[#C5A059]/30  transition-all group">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-extrabold text-slate-400  uppercase tracking-widest font-mono">Billet Cast Output</p>
            <span className="text-slate-700  bg-slate-100  px-2 py-0.5 rounded text-[8px] font-bold font-mono uppercase">CCM</span>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900  font-mono leading-none">{todayBilletMt} MT</h3>
            <p className="text-[9px] text-[#B48F48] font-bold font-mono mt-2.5">GRADE 60 CARBON BILLETS</p>
          </div>
        </div>

        {/* Rod Production */}
        <div className="bg-white  border border-slate-200  p-5 rounded-2xl shadow-xs flex flex-col justify-between h-32 hover:border-[#C5A059]/30  transition-all group">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-extrabold text-slate-400  uppercase tracking-widest font-mono">Finished Rod Production</p>
            <span className="text-indigo-600  bg-indigo-50  px-2 py-0.5 rounded text-[8px] font-bold font-mono uppercase">Rolling</span>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900  font-mono leading-none">{todayRodMt} MT</h3>
            <p className="text-[9px] text-[#B48F48]  font-bold font-mono mt-2.5">FINISHED REBAR COILS</p>
          </div>
        </div>

        {/* Total Dispatch */}
        <div className="bg-white  border border-slate-200  p-5 rounded-2xl shadow-xs flex flex-col justify-between h-32 hover:border-[#C5A059]/30  transition-all group">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-extrabold text-slate-400  uppercase tracking-widest font-mono">Total Sales Dispatched</p>
            <span className="text-emerald-600  bg-emerald-50  px-2 py-0.5 rounded text-[8px] font-bold font-mono uppercase">Dispatch</span>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900  font-mono leading-none">{totalDispatchMt} MT</h3>
            <p className="text-[9px] text-slate-400  font-bold font-mono mt-2.5">DISPATCH CHALLANS FILLED</p>
          </div>
        </div>

      </div>

      {/* Energy Efficiency & Yard Balance Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Furnaces and SVG chart */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Furnaces Status */}
          <div className="bg-white  border border-slate-200  p-5 rounded-2xl shadow-xs space-y-4 transition-colors">
            <h3 className="text-xs font-extrabold text-slate-800  uppercase tracking-wider font-mono border-b border-slate-100  pb-3 flex items-center justify-between">
              <span>ACTIVE SMELTING SYSTEMS</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            </h3>
            <div className="space-y-4">
              {furnaceLogs.map((furnace, idx) => {
                const completionPct = Math.min(100, Math.round((furnace.temp / furnace.target) * 100));
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-900  font-extrabold">{furnace.name}</span>
                      <span className="font-mono text-slate-700 ">{furnace.temp}°C / {furnace.target}°C Target</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100  rounded-full overflow-hidden relative">
                      <div className="h-full bg-[#C5A059] rounded-full" style={{ width: `${completionPct}%` }} />
                    </div>
                    <div className="flex justify-between text-[9px] font-mono text-slate-450 ">
                      <span>Status: <span className="font-bold text-slate-700 ">{furnace.status}</span></span>
                      <span>Refractory Life: <span className="font-bold text-emerald-600 ">{furnace.life}</span></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SVG Heat Cycle Trend Chart */}
          <div className="bg-white  border border-slate-200  p-5 rounded-2xl shadow-xs space-y-4 transition-colors">
            <h3 className="text-xs font-extrabold text-slate-800  uppercase tracking-wider font-mono border-b border-slate-100  pb-3">Weekly Smelting Cycles</h3>
            <svg className="w-full h-36" viewBox="0 0 500 100" preserveAspectRatio="none">
              <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" className="stroke-slate-100 " strokeWidth="1" />
              <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" className="stroke-slate-100 " strokeWidth="1" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="#f1f5f9" className="stroke-slate-100 " strokeWidth="1" />
              <path d="M 0,100 L 0,60 L 80,45 L 160,85 L 240,30 L 320,55 L 400,25 L 480,40 L 500,40 L 500,100 Z" fill="url(#steelGradient)" />
              <path d="M 0,60 L 80,45 L 160,85 L 240,30 L 320,55 L 400,25 L 480,40 L 500,40" fill="none" stroke="#B48F48" strokeWidth="2.5" strokeLinecap="round" />
              <defs>
                <linearGradient id="steelGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#B48F48" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#FAF6EE" stopOpacity="0.02" />
                </linearGradient>
              </defs>
            </svg>
            <div className="flex justify-between text-[8px] font-bold text-slate-400  font-mono pt-2 px-1">
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

        {/* Right Column: Inventory Balances & Utilities ratios */}
        <div className="space-y-6">
          
          {/* Energy Efficiency Card */}
          <div className="bg-white  border border-slate-200  p-5 rounded-2xl shadow-xs space-y-4.5 transition-colors">
            <h4 className="text-xs font-extrabold text-slate-800  uppercase tracking-wider font-mono border-b border-slate-100  pb-3">Energy Efficiency Ratios</h4>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-slate-800 ">Billet Utility Ratio</p>
                  <p className="text-[10px] text-slate-450 ">Power consumed per billet ton</p>
                </div>
                <span className="font-mono font-bold text-[#B48F48]  bg-[#FAF6EE]  px-2.5 py-1 rounded-lg border border-[#C5A059]/20 ">
                  {latestEnergy.billet_kwh_per_ton} kWh/MT
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-slate-800 ">Rebar Rolling Ratio</p>
                  <p className="text-[10px] text-slate-450 ">Power consumed per rolling ton</p>
                </div>
                <span className="font-mono font-bold text-indigo-600  bg-indigo-50  px-2.5 py-1 rounded-lg border border-indigo-100 ">
                  {latestEnergy.rod_kwh_per_ton} kWh/MT
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-slate-800 ">Rolling Re-heating Gas</p>
                  <p className="text-[10px] text-slate-450 ">Gas consumed per rolling ton</p>
                </div>
                <span className="font-mono font-bold text-[#B48F48]  bg-amber-55/10 px-2.5 py-1 rounded-lg border border-amber-100 ">
                  {latestEnergy.gas_per_ton} Nm³/MT
                </span>
              </div>
            </div>
          </div>

          {/* Central Stock Balances */}
          {inventory && (
            <div className="bg-white  border border-slate-200  p-5 rounded-2xl shadow-xs space-y-4 transition-colors">
              <h4 className="text-xs font-extrabold text-slate-800  uppercase tracking-wider font-mono border-b border-slate-100  pb-3">Real-time Stock Ledger</h4>
              
              <div className="space-y-3 pt-1 text-xs">
                
                {/* Scrap Yard */}
                <div className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-900  font-extrabold">Raw Scrap Yard</span>
                    <span className="font-mono text-slate-700 ">{inventory.raw_scrap_mt} MT / 500 MT</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100  rounded-full overflow-hidden">
                    <div className="h-full bg-slate-500 rounded-full" style={{ width: `${Math.min(100, (inventory.raw_scrap_mt / 500) * 100)}%` }} />
                  </div>
                </div>

                {/* Billet Yard */}
                <div className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-900  font-extrabold">Billet Yard</span>
                    <span className="font-mono text-slate-700 ">{inventory.billet_yard_mt} MT / 300 MT</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100  rounded-full overflow-hidden">
                    <div className="h-full bg-[#C5A059] rounded-full" style={{ width: `${Math.min(100, (inventory.billet_yard_mt / 300) * 100)}%` }} />
                  </div>
                </div>

                {/* Finished Rebar Yards */}
                <div className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-900  font-extrabold">Rebar Yard (12mm)</span>
                    <span className="font-mono text-slate-700 ">{inventory.rebar_12mm_mt} MT / 150 MT</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100  rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${Math.min(100, (inventory.rebar_12mm_mt / 150) * 100)}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-900  font-extrabold">Rebar Yard (16mm)</span>
                    <span className="font-mono text-slate-700 ">{inventory.rebar_16mm_mt} MT / 150 MT</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100  rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, (inventory.rebar_16mm_mt / 150) * 100)}%` }} />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100  flex justify-between text-[10px] text-slate-450  font-mono">
                  <span>Store Spares Stock: <strong>{inventory.store_spares_qty} items</strong></span>
                  <Link href="/tenant/steel/inventory" className="text-[#B48F48] hover:underline font-bold">Details Yard →</Link>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
