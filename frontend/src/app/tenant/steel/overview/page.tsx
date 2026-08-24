'use client';

import React, { useState, useEffect } from 'react';

// Seed data sets for fallbacks if localStorage is empty
const seedScrap = [
  { date: '2026-08-18', supplier_name: 'Metro Scrap Traders', scrap_category: 'LC Scrap', scrap_rcv_kg: 18500, truck_no: 'TR-1088', gross_weight: 28500, value_tare: 10000, rate_per_kg: 52 },
  { date: '2026-08-19', supplier_name: 'Apex Scrap Suppliers', scrap_category: 'Rolling Kechi', scrap_rcv_kg: 14200, truck_no: 'TR-4021', gross_weight: 24200, value_tare: 10000, rate_per_kg: 48 },
  { date: '2026-08-20', supplier_name: 'Metal Recyclers Corp', scrap_category: 'LC Scrap', scrap_rcv_kg: 15000, truck_no: 'TR-1024', gross_weight: 25000, value_tare: 10000, rate_per_kg: 53 },
  { date: '2026-08-21', supplier_name: 'Apex Scrap Suppliers', scrap_category: 'Rolling Kechi', scrap_rcv_kg: 12800, truck_no: 'TR-8812', gross_weight: 22800, value_tare: 10000, rate_per_kg: 49 },
  { date: '2026-08-22', supplier_name: 'Alpha Alloys', scrap_category: 'Plate Cutting', scrap_rcv_kg: 9500, truck_no: 'TR-5034', gross_weight: 19500, value_tare: 10000, rate_per_kg: 55 },
  { date: '2026-08-23', supplier_name: 'Apex Scrap Suppliers', scrap_category: 'LC Scrap', scrap_rcv_kg: 16500, truck_no: 'TR-2041', gross_weight: 26500, value_tare: 10000, rate_per_kg: 54 },
  { date: '2026-08-24', supplier_name: 'Metal Recyclers Corp', scrap_category: 'Plate Cutting', scrap_rcv_kg: 21000, truck_no: 'TR-9033', gross_weight: 31000, value_tare: 10000, rate_per_kg: 56 }
];

const seedFurnace = [
  { id: 1, heat_no: 'H-260818A', date: '2026-08-18', furnace_no: 'Furnace-1', shift_id: 'Day-A', scrap_input_kg: 18000, runtime_min: 155, liquid_steel_tapped_kg: 17200, yield_pct: 95.56, power_consumed_kwh: 10800 },
  { id: 2, heat_no: 'H-260819A', date: '2026-08-19', furnace_no: 'Furnace-2', shift_id: 'Night-B', scrap_input_kg: 14000, runtime_min: 140, liquid_steel_tapped_kg: 13350, yield_pct: 95.36, power_consumed_kwh: 8400 },
  { id: 3, heat_no: 'H-260820A', date: '2026-08-20', furnace_no: 'Furnace-1', shift_id: 'Day-A', scrap_input_kg: 15200, runtime_min: 145, liquid_steel_tapped_kg: 14500, yield_pct: 95.39, power_consumed_kwh: 9100 },
  { id: 4, heat_no: 'H-260821A', date: '2026-08-21', furnace_no: 'Furnace-2', shift_id: 'Night-B', scrap_input_kg: 13000, runtime_min: 135, liquid_steel_tapped_kg: 12450, yield_pct: 95.77, power_consumed_kwh: 7800 },
  { id: 5, heat_no: 'H-260822A', date: '2026-08-22', furnace_no: 'Furnace-1', shift_id: 'Day-A', scrap_input_kg: 10000, runtime_min: 110, liquid_steel_tapped_kg: 9550, yield_pct: 95.50, power_consumed_kwh: 6000 },
  { id: 6, heat_no: 'H-260823A', date: '2026-08-23', furnace_no: 'Furnace-2', shift_id: 'Night-B', scrap_input_kg: 16000, runtime_min: 160, liquid_steel_tapped_kg: 15280, yield_pct: 95.50, power_consumed_kwh: 9600 },
  { id: 7, heat_no: 'H-260824A', date: '2026-08-24', furnace_no: 'Furnace-1', shift_id: 'Day-A', scrap_input_kg: 20000, runtime_min: 180, liquid_steel_tapped_kg: 19150, yield_pct: 95.75, power_consumed_kwh: 12000 }
];

const seedBillet = [
  { id: 1, date: '2026-08-18', furnace_no: 'Furnace-1', heat_no: 'H-260818A', billet_size_section: '100x100', steel_tapped_input_kg: 17200, billet_output_kg: 16800, scull_loss_kg: 400, billet_yield_pct: 97.67 },
  { id: 2, date: '2026-08-19', furnace_no: 'Furnace-2', heat_no: 'H-260819A', billet_size_section: '125x125', steel_tapped_input_kg: 13350, billet_output_kg: 13000, scull_loss_kg: 350, billet_yield_pct: 97.38 },
  { id: 3, date: '2026-08-20', furnace_no: 'Furnace-1', heat_no: 'H-260820A', billet_size_section: '100x100', steel_tapped_input_kg: 14500, billet_output_kg: 14100, scull_loss_kg: 400, billet_yield_pct: 97.24 },
  { id: 4, date: '2026-08-21', furnace_no: 'Furnace-2', heat_no: 'H-260821A', billet_size_section: '125x125', steel_tapped_input_kg: 12450, billet_output_kg: 12150, scull_loss_kg: 300, billet_yield_pct: 97.59 },
  { id: 5, date: '2026-08-22', furnace_no: 'Furnace-1', heat_no: 'H-260822A', billet_size_section: '100x100', steel_tapped_input_kg: 9550, billet_output_kg: 9280, scull_loss_kg: 270, billet_yield_pct: 97.17 },
  { id: 6, date: '2026-08-23', furnace_no: 'Furnace-2', heat_no: 'H-260823A', billet_size_section: '125x125', steel_tapped_input_kg: 15280, billet_output_kg: 14900, scull_loss_kg: 380, billet_yield_pct: 97.51 },
  { id: 7, date: '2026-08-24', furnace_no: 'Furnace-1', heat_no: 'H-260824A', billet_size_section: '100x100', steel_tapped_input_kg: 19150, billet_output_kg: 18700, scull_loss_kg: 450, billet_yield_pct: 97.65 }
];

const seedRolling = [
  { id: 1, date: '2026-08-18', billet_input_kg: 16800, rod_size: '16MM', rod_production_kg: 16128, rod_loss_kg: 672, rod_yield_pct: 96.00, rod_stock_kg: 25000 },
  { id: 2, date: '2026-08-19', billet_input_kg: 13000, rod_size: '12MM', rod_production_kg: 12480, rod_loss_kg: 520, rod_yield_pct: 96.00, rod_stock_kg: 28000 },
  { id: 3, date: '2026-08-20', billet_input_kg: 14100, rod_size: '16MM', rod_production_kg: 13536, rod_loss_kg: 564, rod_yield_pct: 96.00, rod_stock_kg: 31000 },
  { id: 4, date: '2026-08-21', billet_input_kg: 12150, rod_size: '20MM', rod_production_kg: 11664, rod_loss_kg: 486, rod_yield_pct: 96.00, rod_stock_kg: 24000 },
  { id: 5, date: '2026-08-22', billet_input_kg: 9280, rod_size: '12MM', rod_production_kg: 8908, rod_loss_kg: 372, rod_yield_pct: 95.99, rod_stock_kg: 26000 },
  { id: 6, date: '2026-08-23', billet_input_kg: 14900, rod_size: '16MM', rod_production_kg: 14304, rod_loss_kg: 596, rod_yield_pct: 96.00, rod_stock_kg: 35000 },
  { id: 7, date: '2026-08-24', billet_input_kg: 18700, rod_size: '25MM', rod_production_kg: 17952, rod_loss_kg: 748, rod_yield_pct: 96.00, rod_stock_kg: 42000 }
];

const seedDispatch = [
  { id: 1, date: '2026-08-18', customer_name: 'Metro Infrastructures', dispatch_qty_kg: 12000, rate_per_kg: 92, total_sales_value: 1104000, payment_status: 'Paid', rod_size: '16MM', challan_no: 'CH-260818', contact_info: '01712-345678' },
  { id: 2, date: '2026-08-19', customer_name: 'Bengal Housing Ltd', dispatch_qty_kg: 10000, rate_per_kg: 94, total_sales_value: 940000, payment_status: 'Partial', rod_size: '12MM', challan_no: 'CH-260819', contact_info: '01819-234567' },
  { id: 3, date: '2026-08-20', customer_name: 'Metro Infrastructures', dispatch_qty_kg: 8000, rate_per_kg: 92, total_sales_value: 736000, payment_status: 'Paid', rod_size: '16MM', challan_no: 'CH-20A', contact_info: '01712-345678' },
  { id: 4, date: '2026-08-21', customer_name: 'Bengal Housing Ltd', dispatch_qty_kg: 12000, rate_per_kg: 94, total_sales_value: 1128000, payment_status: 'Partial', rod_size: '16MM', challan_no: 'CH-21A', contact_info: '01819-234567' },
  { id: 5, date: '2026-08-22', customer_name: 'Sikder Builders', dispatch_qty_kg: 9500, rate_per_kg: 92, total_sales_value: 874000, payment_status: 'Pending', rod_size: '20MM', challan_no: 'CH-22A', contact_info: '01911-345678' },
  { id: 6, date: '2026-08-23', customer_name: 'Metro Infrastructures', dispatch_qty_kg: 10000, rate_per_kg: 93, total_sales_value: 930000, payment_status: 'Paid', rod_size: '12MM', challan_no: 'CH-23A', contact_info: '01712-345678' },
  { id: 7, date: '2026-08-24', customer_name: 'Standard Contractors', dispatch_qty_kg: 15000, rate_per_kg: 91, total_sales_value: 1365000, payment_status: 'Paid', rod_size: '25MM', challan_no: 'CH-260824', contact_info: '01552-876543' }
];

const seedDowntime = [
  { id: 1, date: '2026-08-18', ticket_no: 'DT-1801', equipment: 'EAF Transformer', billet_breakdown_min: 0, rolling_breakdown_min: 40, breakdown_category: 'Electrical', root_cause_notes: 'Relay trip' },
  { id: 2, date: '2026-08-19', ticket_no: 'DT-1901', equipment: 'CCM Tundish Crane', billet_breakdown_min: 35, rolling_breakdown_min: 0, breakdown_category: 'Mechanical', root_cause_notes: 'Wire rope loose' },
  { id: 3, date: '2026-08-20', ticket_no: 'DT-2001', equipment: 'Water Cooling Tower', billet_breakdown_min: 45, rolling_breakdown_min: 0, breakdown_category: 'Electrical', root_cause_notes: 'Motor hot' },
  { id: 4, date: '2026-08-21', ticket_no: 'DT-2101', equipment: 'Mill Stands 1-4', billet_breakdown_min: 0, rolling_breakdown_min: 90, breakdown_category: 'Roll Changing', root_cause_notes: 'Roll change planned' },
  { id: 5, date: '2026-08-22', ticket_no: 'DT-2201', equipment: 'CCM Caster Nozzle', billet_breakdown_min: 30, rolling_breakdown_min: 0, breakdown_category: 'Mechanical', root_cause_notes: 'Nozzle clog' }
];

const seedQuality = [
  { date: '2026-08-18', sample_id: 'Q-18-001', rod_size: '16MM', grade: 'Grade-60', heat_no: 'H-260818A', pct_c: 0.22, pct_mn: 0.65, pct_si: 0.20, pct_s: 0.035, pct_p: 0.040, pct_ce: 0.328, bend_test_result: 'Passed' },
  { date: '2026-08-19', sample_id: 'Q-19-001', rod_size: '12MM', grade: 'Grade-40', heat_no: 'H-260819A', pct_c: 0.18, pct_mn: 0.58, pct_si: 0.18, pct_s: 0.032, pct_p: 0.038, pct_ce: 0.277, bend_test_result: 'Passed' },
  { date: '2026-08-20', sample_id: 'Q-20-001', rod_size: '16MM', grade: 'Grade-60', heat_no: 'H-260820A', pct_c: 0.23, pct_mn: 0.64, pct_si: 0.21, pct_s: 0.033, pct_p: 0.039, pct_ce: 0.337, bend_test_result: 'Passed' },
  { date: '2026-08-21', sample_id: 'Q-21-001', rod_size: '20MM', grade: 'Grade-60', heat_no: 'H-260821A', pct_c: 0.22, pct_mn: 0.66, pct_si: 0.20, pct_s: 0.034, pct_p: 0.042, pct_ce: 0.330, bend_test_result: 'Passed' },
  { date: '2026-08-22', sample_id: 'Q-22-001', rod_size: '12MM', grade: 'Grade-60', heat_no: 'H-260822A', pct_c: 0.21, pct_mn: 0.62, pct_si: 0.19, pct_s: 0.030, pct_p: 0.035, pct_ce: 0.313, bend_test_result: 'Passed' }
];

export default function OverviewDashboard() {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | 'all'>('all');
  const [selectedFurnace, setSelectedFurnace] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');

  // Real-time state data loaded dynamically from localStorage or fallbacks
  const [scrapData, setScrapData] = useState<any[]>(seedScrap);
  const [furnaceData, setFurnaceData] = useState<any[]>(seedFurnace);
  const [billetData, setBilletData] = useState<any[]>(seedBillet);
  const [rollingData, setRollingData] = useState<any[]>(seedRolling);
  const [dispatchData, setDispatchData] = useState<any[]>(seedDispatch);
  const [downtimeData, setDowntimeData] = useState<any[]>(seedDowntime);
  const [qualityData, setQualityData] = useState<any[]>(seedQuality);

  // Live Furnaces Status State for Plant Health Indicator
  const [furnaceStatuses, setFurnaceStatuses] = useState([
    { name: 'Furnace No. 1', heatNo: 'H-260824A', temp: 1565, status: 'Melting', efficiency: 94 },
    { name: 'Furnace No. 2', heatNo: 'H-260824B', temp: 1612, status: 'Tapping', efficiency: 97 },
    { name: 'CCM Caster A', heatNo: 'H-260824A', temp: 1140, status: 'Casting', efficiency: 98 }
  ]);

  // Load from Storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loadData = (key: string, setter: (val: any) => void, fallback: any) => {
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setter(parsed);
            }
          } catch {}
        }
      };

      loadData('steel_erp_scrap', setScrapData, seedScrap);
      loadData('steel_erp_furnace', setFurnaceData, seedFurnace);
      loadData('steel_erp_billet', setBilletData, seedBillet);
      loadData('steel_erp_rolling', setRollingData, seedRolling);
      loadData('steel_erp_sales', setDispatchData, seedDispatch);
      loadData('steel_erp_downtime', setDowntimeData, seedDowntime);
      loadData('steel_erp_quality', setQualityData, seedQuality);
    }
  }, []);

  // Live status updater simulation to create "premium dynamic look"
  useEffect(() => {
    const interval = setInterval(() => {
      setFurnaceStatuses(prev => prev.map(f => {
        let newTemp = f.temp + Math.floor(Math.random() * 9) - 4;
        if (f.status === 'Melting' && newTemp > 1600) {
          return { ...f, temp: 1510, status: 'Charging' };
        }
        if (f.status === 'Charging' && newTemp > 1520) {
          return { ...f, temp: 1530, status: 'Melting' };
        }
        if (f.status === 'Tapping') {
          newTemp = newTemp < 1580 ? 1625 : newTemp;
        }
        return { ...f, temp: newTemp };
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Filter handler
  const getFilteredData = (array: any[]) => {
    let result = [...array];
    if (timeframe === '7d') {
      result = result.slice(-7);
    } else if (timeframe === '30d') {
      result = result.slice(-30);
    }
    return result;
  };

  const filteredScrap = getFilteredData(scrapData);
  const filteredBillet = getFilteredData(billetData).filter(b => selectedFurnace === 'all' || b.furnace_no === selectedFurnace);
  const filteredFurnace = getFilteredData(furnaceData).filter(f => selectedFurnace === 'all' || f.furnace_no === selectedFurnace);
  const filteredRolling = getFilteredData(rollingData).filter(r => selectedSize === 'all' || r.rod_size === selectedSize);
  const filteredDispatch = getFilteredData(dispatchData).filter(d => 
    (selectedSize === 'all' || d.rod_size === selectedSize)
  );
  const filteredDowntime = getFilteredData(downtimeData);

  // Aggregations
  const scrapRcvKgTotal = filteredScrap.reduce((sum, r) => sum + Number(r.scrap_rcv_kg || 0), 0);
  const billetOutputKgTotal = filteredBillet.reduce((sum, r) => sum + Number(r.billet_output_kg || 0), 0);
  const rebarProductionKgTotal = filteredRolling.reduce((sum, r) => sum + Number(r.rod_production_kg || 0), 0);
  const salesQtyKgTotal = filteredDispatch.reduce((sum, r) => sum + Number(r.dispatch_qty_kg || 0), 0);
  const invoiceValueTotal = filteredDispatch.reduce((sum, r) => sum + Number(r.total_sales_value || 0), 0);

  const averageMeltingYield = filteredFurnace.length > 0
    ? (filteredFurnace.reduce((sum, f) => sum + Number(f.yield_pct || 0), 0) / filteredFurnace.length).toFixed(2)
    : '95.5';

  const averageCastingYield = filteredBillet.length > 0
    ? (filteredBillet.reduce((sum, b) => sum + Number(b.billet_yield_pct || 0), 0) / filteredBillet.length).toFixed(2)
    : '97.5';

  const averageRollingYield = filteredRolling.length > 0
    ? (filteredRolling.reduce((sum, r) => sum + Number(r.rod_yield_pct || 0), 0) / filteredRolling.length).toFixed(2)
    : '96.0';

  const meltShopDowntime = filteredDowntime.reduce((sum, d) => sum + Number(d.billet_breakdown_min || 0), 0);
  const rollingMillDowntime = filteredDowntime.reduce((sum, d) => sum + Number(d.rolling_breakdown_min || 0), 0);
  const totalDowntime = meltShopDowntime + rollingMillDowntime;

  // Specific power consumption logic (kWh/MT of Billets Cast)
  const totalPowerKwh = filteredFurnace.reduce((sum, f) => sum + Number(f.power_consumed_kwh || 0), 0);
  const specificPowerKwhMt = billetOutputKgTotal > 0
    ? ((totalPowerKwh / (billetOutputKgTotal / 1000))).toFixed(1)
    : '545.0';

  // Dynamic breakdown of scrap category input percentages
  const scrapCategories = Array.from(new Set(scrapData.map(s => s.scrap_category || 'LC Scrap')));
  const scrapSplit = scrapCategories.map(cat => {
    const totalForCat = scrapData
      .filter(s => s.scrap_category === cat)
      .reduce((sum, s) => sum + Number(s.scrap_rcv_kg || 0), 0);
    return {
      category: cat,
      amount: totalForCat,
      pct: scrapRcvKgTotal > 0 ? Math.round((totalForCat / scrapRcvKgTotal) * 100) : 33
    };
  }).sort((a, b) => b.amount - a.amount);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in text-slate-800 pb-12">
      
      {/* Title Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200/80 pb-6 gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="bg-gradient-to-tr from-[#B48F48] to-[#C5A059] p-2 rounded-xl text-white shadow-md shadow-[#C5A059]/25">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 21V9l-7-4-7 4v12M22 21h-2M4 21H2m10-7h.01M16 11h.01M16 16h.01M8 11h.01M8 16h.01" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Steel ERP Manufacturing Control Hub</h1>
              <p className="text-xs text-slate-500 mt-0.5">Real-time aggregated indicators of smelting heats, casting, and finished rebar dispatches.</p>
            </div>
          </div>
        </div>

        {/* Live System Date & Time indicator badge */}
        <div className="flex items-center space-x-3">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <div className="bg-[#FAF6EE] text-[#B48F48] border border-[#C5A059]/30 px-3.5 py-2 rounded-xl font-bold font-mono text-xs shadow-xs">
            System Live: 2026-08-24
          </div>
        </div>
      </div>

      {/* Advanced Premium Interactive Filters Bar */}
      <div className="bg-white/70 backdrop-blur-md border border-slate-200/80 p-4 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
          </svg>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Control Filters:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          
          {/* Timeframe Selector */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['7d', '30d', 'all'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  timeframe === t 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {t === '7d' ? 'Last 7 Days' : t === '30d' ? '30 Days' : 'All Data'}
              </button>
            ))}
          </div>

          {/* Furnace Filter dropdown */}
          <div className="relative">
            <select
              value={selectedFurnace}
              onChange={(e) => setSelectedFurnace(e.target.value)}
              className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#C5A059] transition-all cursor-pointer"
            >
              <option value="all">All Furnaces</option>
              <option value="Furnace-1">Furnace No. 1</option>
              <option value="Furnace-2">Furnace No. 2</option>
            </select>
          </div>

          {/* Size Filter dropdown */}
          <div className="relative">
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#C5A059] transition-all cursor-pointer"
            >
              <option value="all">All Finished Sizes</option>
              <option value="12MM">12MM Rebars</option>
              <option value="16MM">16MM Rebars</option>
              <option value="20MM">20MM Rebars</option>
              <option value="25MM">25MM Rebars</option>
            </select>
          </div>

        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* KPI 1: Scrap Feed Intake */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs flex flex-col justify-between h-36 hover:border-[#C5A059]/40 hover:shadow-md hover:shadow-amber-500/[0.02] transition-all group relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Raw Scrap Feed</p>
            <span className="text-[#B48F48] bg-[#FAF6EE] px-2.5 py-1 rounded-lg text-[9px] font-bold font-mono uppercase border border-[#C5A059]/10">Scrap</span>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 font-mono tracking-tight leading-none">
              {(scrapRcvKgTotal / 1000).toFixed(1)} MT
            </h3>
            <div className="flex justify-between items-center mt-3">
              <span className="text-[9px] text-emerald-600 font-bold font-mono flex items-center">
                <span className="mr-1">▲</span> YARD INBOUND READY
              </span>
              <span className="text-[9px] text-slate-400 font-mono">Tonnage Total</span>
            </div>
          </div>
          {/* Subtle bottom indicator line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#C5A059]/40"></div>
        </div>

        {/* KPI 2: Smelting Yield */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs flex flex-col justify-between h-36 hover:border-rose-300 hover:shadow-md hover:shadow-rose-500/[0.02] transition-all group relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">CCM Cast Tonnage</p>
            <span className="text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg text-[9px] font-bold font-mono uppercase border border-rose-100">CCM Cast</span>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 font-mono tracking-tight leading-none">
              {(billetOutputKgTotal / 1000).toFixed(1)} MT
            </h3>
            <div className="flex justify-between items-center mt-3">
              <span className="text-[9px] text-rose-600 font-bold font-mono flex items-center">
                <span>Avg Yield:</span> <span className="ml-1 text-rose-600 font-black">{averageCastingYield}%</span>
              </span>
              <span className="text-[9px] text-slate-400 font-mono">CCM Log</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500/40"></div>
        </div>

        {/* KPI 3: Rebar Rod Rolled */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs flex flex-col justify-between h-36 hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-500/[0.02] transition-all group relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Rolling Output</p>
            <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg text-[9px] font-bold font-mono uppercase border border-emerald-100">Rolling</span>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 font-mono tracking-tight leading-none">
              {(rebarProductionKgTotal / 1000).toFixed(1)} MT
            </h3>
            <div className="flex justify-between items-center mt-3">
              <span className="text-[9px] text-emerald-600 font-bold font-mono flex items-center">
                <span>Avg Yield:</span> <span className="ml-1 text-emerald-600 font-black">{averageRollingYield}%</span>
              </span>
              <span className="text-[9px] text-slate-400 font-mono">Rods Production</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500/40"></div>
        </div>

        {/* KPI 4: Financial Sales Dispatches */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs flex flex-col justify-between h-36 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-500/[0.02] transition-all group relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Invoice Value</p>
            <span className="text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg text-[9px] font-bold font-mono uppercase border border-indigo-100">Sales</span>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 font-mono tracking-tight leading-none text-indigo-650">
              ৳{(invoiceValueTotal / 100000).toFixed(1)} Lakh
            </h3>
            <div className="flex justify-between items-center mt-3">
              <span className="text-[9px] text-indigo-600 font-bold font-mono flex items-center">
                <span>Shipped:</span> <span className="ml-1 font-black">{(salesQtyKgTotal / 1000).toFixed(1)} MT</span>
              </span>
              <span className="text-[9px] text-slate-400 font-mono">Dispatched</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500/40"></div>
        </div>

      </div>

      {/* Production Trends & Scrap Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dynamic Responsive Multi-Line Graph */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs space-y-4 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 gap-2">
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider font-mono">Steel Manufacturing Output (MT)</h3>
              <p className="text-[10px] text-slate-400">Comparing casting outputs vs finished rebars over time.</p>
            </div>
            <div className="flex space-x-3 text-[9px] font-mono font-bold">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 bg-[#C5A059] rounded-sm"></span> 
                <span>CCM Billet</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></span> 
                <span>Finished Rods</span>
              </span>
            </div>
          </div>

          <div className="relative pt-2">
            <svg className="w-full h-56" viewBox="0 0 500 150" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="0" y1="25" x2="500" y2="25" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="125" x2="500" y2="125" stroke="#f1f5f9" strokeWidth="1" />
              
              {/* CCM Billet Area Gradient */}
              <path d="M 0,150 L 50,110 L 125,95 L 200,105 L 275,115 L 350,90 L 425,100 L 500,80 L 500,150 Z" fill="url(#billetGrad)" />
              
              {/* CCM Billet Line */}
              <path d="M 0,150 L 50,110 L 125,95 L 200,105 L 275,115 L 350,90 L 425,100 L 500,80" fill="none" stroke="#C5A059" strokeWidth="3" strokeLinecap="round" />
              
              {/* Finished Rod Line */}
              <path d="M 0,150 L 50,118 L 125,104 L 200,112 L 275,123 L 350,98 L 425,108 L 500,88" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />

              {/* Data Node Dots */}
              <circle cx="50" cy="110" r="3.5" fill="#C5A059" stroke="#fff" strokeWidth="1.5" />
              <circle cx="125" cy="95" r="3.5" fill="#C5A059" stroke="#fff" strokeWidth="1.5" />
              <circle cx="200" cy="105" r="3.5" fill="#C5A059" stroke="#fff" strokeWidth="1.5" />
              <circle cx="275" cy="115" r="3.5" fill="#C5A059" stroke="#fff" strokeWidth="1.5" />
              <circle cx="350" cy="90" r="3.5" fill="#C5A059" stroke="#fff" strokeWidth="1.5" />
              <circle cx="425" cy="100" r="3.5" fill="#C5A059" stroke="#fff" strokeWidth="1.5" />
              <circle cx="500" cy="80" r="3.5" fill="#C5A059" stroke="#fff" strokeWidth="1.5" />

              <circle cx="50" cy="118" r="3.5" fill="#10b981" stroke="#fff" strokeWidth="1.5" />
              <circle cx="125" cy="104" r="3.5" fill="#10b981" stroke="#fff" strokeWidth="1.5" />
              <circle cx="200" cy="112" r="3.5" fill="#10b981" stroke="#fff" strokeWidth="1.5" />
              <circle cx="275" cy="123" r="3.5" fill="#10b981" stroke="#fff" strokeWidth="1.5" />
              <circle cx="350" cy="98" r="3.5" fill="#10b981" stroke="#fff" strokeWidth="1.5" />
              <circle cx="425" cy="108" r="3.5" fill="#10b981" stroke="#fff" strokeWidth="1.5" />
              <circle cx="500" cy="88" r="3.5" fill="#10b981" stroke="#fff" strokeWidth="1.5" />

              {/* Definition of Gradients */}
              <defs>
                <linearGradient id="billetGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C5A059" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#C5A059" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="flex justify-between text-[8px] font-bold text-slate-400 font-mono px-1 border-t border-slate-50 pt-2">
            <span>AUG 18</span>
            <span>AUG 19</span>
            <span>AUG 20</span>
            <span>AUG 21</span>
            <span>AUG 22</span>
            <span>AUG 23</span>
            <span>AUG 24 (Live)</span>
          </div>
        </div>

        {/* Scrap Category Split Donut Chart */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs space-y-4">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider font-mono border-b border-slate-100 pb-3">Scrap Category Mix</h3>
          <div className="flex flex-col items-center justify-center py-2">
            
            {/* SVG Donut Circle */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg width="100%" height="100%" viewBox="0 0 42 42" className="donut">
                <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f1f5f9" strokeWidth="4"></circle>
                
                {/* Segment 1: LC Scrap (approx 45%) */}
                <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#B48F48" strokeWidth="4" strokeDasharray="45 55" strokeDashoffset="25"></circle>
                
                {/* Segment 2: Rolling Kechi (approx 35%) */}
                <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#10b981" strokeWidth="4" strokeDasharray="35 65" strokeDashoffset="80"></circle>
                
                {/* Segment 3: Plate Cutting (approx 20%) */}
                <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#6366f1" strokeWidth="4" strokeDasharray="20 80" strokeDashoffset="115"></circle>
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono">Total Rcv</span>
                <span className="text-sm font-black text-slate-800 font-mono">{(scrapRcvKgTotal / 1000).toFixed(0)}t</span>
              </div>
            </div>

            {/* Color Legend */}
            <div className="w-full space-y-2 mt-4 text-xs font-medium">
              {scrapSplit.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2.5 h-2.5 rounded-xs ${
                      s.category.toLowerCase().includes('lc') ? 'bg-[#B48F48]' :
                      s.category.toLowerCase().includes('rolling') || s.category.toLowerCase().includes('kechi') ? 'bg-emerald-500' : 'bg-indigo-500'
                    }`} />
                    <span className="text-slate-650 text-xs font-semibold">{s.category}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-400 font-mono text-[11px] font-bold">
                    <span>{(s.amount / 1000).toFixed(1)} MT</span>
                    <span className="text-slate-800">({s.pct}%)</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>

      {/* Live Plant Health & Downtime Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Plant Furnace Live Monitor */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider font-mono">Live Induction Furnaces & Caster Status</h3>
              <p className="text-[10px] text-slate-400">Simulating live temperature sensors and production tracking.</p>
            </div>
            <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 text-[8px] font-bold uppercase rounded-md tracking-wider border border-emerald-100 flex items-center">
              <span className="mr-1 h-1.5 w-1.5 bg-emerald-500 rounded-full inline-block animate-pulse"></span> Telemetry Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            {furnaceStatuses.map((f, idx) => (
              <div key={idx} className="border border-slate-150 rounded-2xl p-4 bg-slate-50/50 hover:bg-white hover:border-[#C5A059]/30 hover:shadow-xs transition-all duration-300">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-slate-800">{f.name}</span>
                  <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-sm ${
                    f.status === 'Tapping' ? 'bg-amber-100 text-amber-700' :
                    f.status === 'Melting' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>{f.status}</span>
                </div>
                <div className="mt-4">
                  <div className="text-lg font-black text-slate-900 font-mono">{f.temp}°C</div>
                  <p className="text-[9px] text-slate-400 font-mono mt-0.5">Active Heat: {f.heatNo}</p>
                </div>
                <div className="mt-4 space-y-1">
                  <div className="flex justify-between text-[9px] font-bold text-slate-400">
                    <span>Performance Efficiency</span>
                    <span>{f.efficiency}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${
                      f.efficiency > 95 ? 'bg-emerald-500' : 'bg-[#C5A059]'
                    }`} style={{ width: `${f.efficiency}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Plant Power Specific Consumption & Utilities */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs space-y-4">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider font-mono border-b border-slate-100 pb-3">Energy & Power Index</h3>
          <div className="space-y-4 pt-1">
            
            {/* Specific consumption gauge */}
            <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-650 font-semibold">Specific Electricity</span>
                <span className="text-[#B48F48] font-mono font-black">{specificPowerKwhMt} kWh/MT</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-[#C5A059] rounded-full" style={{ width: '74%' }} />
              </div>
              <div className="flex justify-between text-[8px] font-bold text-slate-400 font-mono">
                <span>Green Index (450)</span>
                <span>Normal (600)</span>
              </div>
            </div>

            {/* Additional parameters */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="border border-slate-150 rounded-xl p-3 bg-slate-50/20">
                <p className="text-[9px] font-bold text-slate-400 uppercase font-mono">Water Recycle</p>
                <h5 className="font-mono font-black text-slate-800 mt-1">320 m³/day</h5>
              </div>
              <div className="border border-slate-150 rounded-xl p-3 bg-slate-50/20">
                <p className="text-[9px] font-bold text-slate-400 uppercase font-mono">Oxygen Tonnage</p>
                <h5 className="font-mono font-black text-slate-800 mt-1">1.2k Nm³</h5>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Quality Spectro & Breakdown Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quality Lab Chemistry Check */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs space-y-4 lg:col-span-2">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider font-mono border-b border-slate-100 pb-3">Latest Quality Spectro Chemistry Audit</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-150 text-[10px] font-extrabold text-slate-400 uppercase font-mono">
                  <th className="py-2.5">Sample ID</th>
                  <th>Rod Size</th>
                  <th>Heat Link</th>
                  <th className="text-right">%C</th>
                  <th className="text-right">%Mn</th>
                  <th className="text-right">%Si</th>
                  <th className="text-right">%CE</th>
                  <th className="text-center">Carbon Equivalent Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {qualityData.slice(0, 4).map((q, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/40">
                    <td className="py-2.5 font-bold text-slate-850">{q.sample_id}</td>
                    <td>{q.rod_size}</td>
                    <td className="text-slate-450">{q.heat_no}</td>
                    <td className="text-right">{q.pct_c}%</td>
                    <td className="text-right">{q.pct_mn}%</td>
                    <td className="text-right">{q.pct_si}%</td>
                    <td className="text-right font-bold text-slate-800">{q.pct_ce}%</td>
                    <td className="text-center">
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100/50">
                        COMPLIANT
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Downtime Breakdown Tracker */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs space-y-4">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider font-mono border-b border-slate-100 pb-3">Downtime Breakdown (Mins)</h3>
          <div className="space-y-4 pt-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-650 font-semibold">Total Cumulative Downtime</span>
              <span className="font-mono font-bold text-rose-600">{totalDowntime} mins</span>
            </div>
            
            {/* Visual breakdown horizontal gauge */}
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-bold text-slate-400">
                  <span>Melt Shop Induction Furnaces</span>
                  <span>{meltShopDowntime} mins</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500" style={{ width: `${totalDowntime > 0 ? (meltShopDowntime / totalDowntime) * 100 : 50}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-bold text-slate-400">
                  <span>Rolling Mill Stands</span>
                  <span>{rollingMillDowntime} mins</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: `${totalDowntime > 0 ? (rollingMillDowntime / totalDowntime) * 100 : 50}%` }} />
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-440 pt-1 border-t border-slate-50">Downtime minutes are logged inline from operational breakdowns and roll-changing maintenance schedules.</p>
          </div>
        </div>

      </div>

    </div>
  );
}
