'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { exportToExcel } from '@/lib/excelExport';

interface FurnaceRow {
  id: number;
  date: string;
  furnace_no: string;
  heat_no: string;
  scrap_input_kg: number;
  runtime_min: number;
  used_patching_powder_kg?: number;
  used_patching_forma_kg?: number;
  tapping_temp_c: number;
  liquid_steel_tapped_kg: number;
  power_consumed_kwh: number;
  shift_id: string;
  furnace_master: string;
  yield_pct: number;
  fe_si_alloy_kg?: number;
  fe_mn_alloy_kg?: number;
}

const STORAGE_KEY = 'steel_erp_furnace';

const initialFurnaceLogs: FurnaceRow[] = [
  { id: 1, date: '2026-08-20', furnace_no: 'Furnace 01', heat_no: 'H-260820A', scrap_input_kg: 21500, runtime_min: 140, used_patching_powder_kg: 150, used_patching_forma_kg: 1, tapping_temp_c: 1610, liquid_steel_tapped_kg: 19900, power_consumed_kwh: 11400, shift_id: 'A', furnace_master: 'Kabir Ahmed', yield_pct: 92.56, fe_si_alloy_kg: 45, fe_mn_alloy_kg: 60 },
  { id: 2, date: '2026-08-21', furnace_no: 'Furnace 02', heat_no: 'H-260821A', scrap_input_kg: 20000, runtime_min: 135, used_patching_powder_kg: 120, used_patching_forma_kg: 0, tapping_temp_c: 1618, liquid_steel_tapped_kg: 18560, power_consumed_kwh: 10600, shift_id: 'B', furnace_master: 'Zahirul Haque', yield_pct: 92.80, fe_si_alloy_kg: 40, fe_mn_alloy_kg: 55 },
  { id: 3, date: '2026-08-22', furnace_no: 'Furnace 01', heat_no: 'H-260822A', scrap_input_kg: 16000, runtime_min: 115, used_patching_powder_kg: 100, used_patching_forma_kg: 0, tapping_temp_c: 1595, liquid_steel_tapped_kg: 14800, power_consumed_kwh: 8500, shift_id: 'C', furnace_master: 'Ataur Rahman', yield_pct: 92.50, fe_si_alloy_kg: 35, fe_mn_alloy_kg: 45 },
  { id: 4, date: '2026-08-23', furnace_no: 'Furnace 02', heat_no: 'H-260823A', scrap_input_kg: 25500, runtime_min: 150, used_patching_powder_kg: 180, used_patching_forma_kg: 1, tapping_temp_c: 1620, liquid_steel_tapped_kg: 23660, power_consumed_kwh: 13500, shift_id: 'A', furnace_master: 'Kabir Ahmed', yield_pct: 92.78, fe_si_alloy_kg: 50, fe_mn_alloy_kg: 70 },
  { id: 5, date: '2026-08-24', furnace_no: 'Furnace 01', heat_no: 'H-260824A', scrap_input_kg: 28000, runtime_min: 160, used_patching_powder_kg: 190, used_patching_forma_kg: 1, tapping_temp_c: 1630, liquid_steel_tapped_kg: 26040, power_consumed_kwh: 14800, shift_id: 'A', furnace_master: 'Kabir Ahmed', yield_pct: 93.00, fe_si_alloy_kg: 55, fe_mn_alloy_kg: 80 }
];

export default function FurnaceLogPage() {
  const [data, setData] = useState<FurnaceRow[]>([]);
  const [search, setSearch] = useState('');
  const [furnaceFilter, setFurnaceFilter] = useState('');
  const [shiftFilter, setShiftFilter] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    furnace_no: 'Furnace 01',
    heat_no: '',
    scrap_input_kg: '',
    runtime_min: '130',
    used_patching_powder_kg: '120',
    used_patching_forma_kg: '0',
    tapping_temp_c: '1615',
    liquid_steel_tapped_kg: '',
    power_consumed_kwh: '',
    shift_id: 'A',
    furnace_master: 'Kabir Ahmed',
    fe_si_alloy_kg: '45',
    fe_mn_alloy_kg: '65'
  });

  const furnaceMasters = ['Kabir Ahmed', 'Zahirul Haque', 'Ataur Rahman', 'Shahidul Islam'];

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch {
        setData(initialFurnaceLogs);
      }
    } else {
      setData(initialFurnaceLogs);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialFurnaceLogs));
    }
  }, []);

  const saveToStorage = (updated: FurnaceRow[]) => {
    setData(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Auto Calculations
  const scrapInKg = Number(formData.scrap_input_kg) || 0;
  const liquidOutKg = Number(formData.liquid_steel_tapped_kg) || 0;
  const computedYield = scrapInKg > 0 ? parseFloat(((liquidOutKg / scrapInKg) * 100).toFixed(2)) : 0;
  const powerKwh = Number(formData.power_consumed_kwh) || 0;
  const computedSec = liquidOutKg > 0 ? Math.round(powerKwh / (liquidOutKg / 1000)) : 0;

  const handleCreateHeat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.heat_no || scrapInKg <= 0 || liquidOutKg <= 0) {
      showToast('Please provide valid heat number and weights.');
      return;
    }

    const newRow: FurnaceRow = {
      id: Date.now(),
      date: formData.date,
      furnace_no: formData.furnace_no,
      heat_no: formData.heat_no.trim().toUpperCase(),
      scrap_input_kg: scrapInKg,
      runtime_min: Number(formData.runtime_min) || 120,
      used_patching_powder_kg: Number(formData.used_patching_powder_kg) || 0,
      used_patching_forma_kg: Number(formData.used_patching_forma_kg) || 0,
      tapping_temp_c: Number(formData.tapping_temp_c) || 1615,
      liquid_steel_tapped_kg: liquidOutKg,
      power_consumed_kwh: powerKwh,
      shift_id: formData.shift_id,
      furnace_master: formData.furnace_master,
      yield_pct: computedYield,
      fe_si_alloy_kg: Number(formData.fe_si_alloy_kg) || 0,
      fe_mn_alloy_kg: Number(formData.fe_mn_alloy_kg) || 0
    };

    const updated = [newRow, ...data];
    saveToStorage(updated);
    setIsModalOpen(false);
    showToast(`Heat ${newRow.heat_no} recorded (${liquidOutKg.toLocaleString()} kg tapped, yield ${computedYield}%)`);

    // Reset Form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      furnace_no: 'Furnace 01',
      heat_no: '',
      scrap_input_kg: '',
      runtime_min: '130',
      used_patching_powder_kg: '120',
      used_patching_forma_kg: '0',
      tapping_temp_c: '1615',
      liquid_steel_tapped_kg: '',
      power_consumed_kwh: '',
      shift_id: 'A',
      furnace_master: 'Kabir Ahmed',
      fe_si_alloy_kg: '45',
      fe_mn_alloy_kg: '65'
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this furnace heat log?')) {
      const updated = data.filter(d => d.id !== id);
      saveToStorage(updated);
      showToast('Heat record deleted');
    }
  };

  // Filtered dataset
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = 
        item.heat_no.toLowerCase().includes(search.toLowerCase()) ||
        item.furnace_master.toLowerCase().includes(search.toLowerCase()) ||
        item.furnace_no.toLowerCase().includes(search.toLowerCase());
      const matchesFurnace = !furnaceFilter || item.furnace_no === furnaceFilter;
      const matchesShift = !shiftFilter || item.shift_id === shiftFilter;
      return matchesSearch && matchesFurnace && matchesShift;
    });
  }, [data, search, furnaceFilter, shiftFilter]);

  // Aggregated KPIs
  const totalHeats = filteredData.length;
  const totalScrapChargedKg = filteredData.reduce((sum, d) => sum + Number(d.scrap_input_kg || 0), 0);
  const totalLiquidTappedKg = filteredData.reduce((sum, d) => sum + Number(d.liquid_steel_tapped_kg || 0), 0);
  const totalPowerKwh = filteredData.reduce((sum, d) => sum + Number(d.power_consumed_kwh || 0), 0);
  const avgYield = totalScrapChargedKg > 0 ? ((totalLiquidTappedKg / totalScrapChargedKg) * 100).toFixed(2) : '92.70';
  const avgSec = totalLiquidTappedKg > 0 ? (totalPowerKwh / (totalLiquidTappedKg / 1000)).toFixed(0) : '545';

  const handleExportExcel = () => {
    const headers = ['Date', 'Shift', 'Furnace No', 'Heat No', 'Scrap Charged (KG)', 'Liquid Tapped (KG)', 'Melting Yield (%)', 'Power Consumed (kWh)', 'Specific Power (kWh/MT)', 'Tapping Temp (°C)', 'Runtime (Min)', 'Furnace Master', 'Alloy FeSi (KG)', 'Alloy FeMn (KG)'];
    const rows = filteredData.map(r => {
      const liquidMt = (r.liquid_steel_tapped_kg || 1) / 1000;
      const sec = Math.round((r.power_consumed_kwh || 0) / liquidMt);
      return [
        r.date, r.shift_id, r.furnace_no, r.heat_no, r.scrap_input_kg, r.liquid_steel_tapped_kg, r.yield_pct, r.power_consumed_kwh, sec, r.tapping_temp_c, r.runtime_min, r.furnace_master, r.fe_si_alloy_kg || 0, r.fe_mn_alloy_kg || 0
      ];
    });
    exportToExcel(headers, rows, 'furnace_heat_log');
  };

  return (
    <div className="space-y-7 animate-fade-in text-slate-800 pb-16">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-amber-500/40 flex items-center space-x-3 animate-zoom-in">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs font-semibold font-mono tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* CLEAN ENTERPRISE HEADER BAR */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#B48F48] uppercase tracking-wider font-mono mb-1.5">
            <span>Steel Production</span>
            <span className="text-slate-300">/</span>
            <span>Stage 02</span>
            <span className="text-slate-300">/</span>
            <span className="bg-amber-100/70 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-mono text-[11px]">Induction Smelting & Refining</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
            Induction Furnace Heat & Smelting Log
          </h1>
          <p className="text-sm text-slate-500 font-sans mt-0.5">
            Track crucible batch heats, ferro-alloy deoxidation (FeSi / FeMn), tapping temperatures, and power consumption.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleExportExcel}
            className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl transition-all cursor-pointer shadow-2xs flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export Heat Book</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 md:flex-none px-5 py-2.5 bg-[#B48F48] hover:bg-[#9E7A37] text-white font-semibold text-sm rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Record Tapped Heat</span>
          </button>
        </div>
      </div>

      {/* 4 KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs flex flex-col justify-between h-36">
          <div className="flex justify-between items-center text-xs font-semibold uppercase text-slate-500 font-mono">
            <span>Liquid Steel Output</span>
            <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[11px] font-bold">Tapped</span>
          </div>
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl font-bold text-slate-900 font-mono tracking-tight">{(totalLiquidTappedKg / 1000).toFixed(1)}</span>
              <span className="text-sm font-semibold text-slate-500 font-mono">MT</span>
            </div>
            <p className="text-xs text-emerald-600 font-semibold font-mono mt-1">▲ {totalHeats} Total Heats Logged</p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs flex flex-col justify-between h-36">
          <div className="flex justify-between items-center text-xs font-semibold uppercase text-slate-500 font-mono">
            <span>Melting Yield Efficiency</span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px] font-bold">Yield</span>
          </div>
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl font-bold text-slate-900 font-mono tracking-tight">{avgYield}</span>
              <span className="text-sm font-semibold text-slate-500 font-mono">%</span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-1">Burning/Slag Loss: {(100 - Number(avgYield)).toFixed(2)}%</p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs flex flex-col justify-between h-36">
          <div className="flex justify-between items-center text-xs font-semibold uppercase text-slate-500 font-mono">
            <span>Specific Power (SEC)</span>
            <span className="text-[#B48F48] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[11px] font-bold">Electricity</span>
          </div>
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl font-bold text-slate-900 font-mono tracking-tight">{avgSec}</span>
              <span className="text-sm font-semibold text-slate-500 font-mono">kWh / MT</span>
            </div>
            <p className="text-xs text-emerald-600 font-semibold font-mono mt-1">Target Ceiling: 560 kWh/MT</p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs flex flex-col justify-between h-36">
          <div className="flex justify-between items-center text-xs font-semibold uppercase text-slate-500 font-mono">
            <span>Thermal Index</span>
            <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 text-[11px] font-bold">Bath Temp</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono">1618°C Average</div>
            <p className="text-xs text-slate-500 font-mono mt-1">Ladle Superheat: +45°C</p>
          </div>
        </div>

      </div>

      {/* FILTER & VIEW CONTROLS */}
      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3 flex-1 min-w-[260px]">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search Heat No, Master, Furnace..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans focus:outline-none focus:border-[#C5A059] focus:bg-white transition-all"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <select
            value={furnaceFilter}
            onChange={e => setFurnaceFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-sans text-slate-700 focus:outline-none focus:border-[#C5A059]"
          >
            <option value="">All Furnaces</option>
            <option value="Furnace 01">Furnace 01 (15T)</option>
            <option value="Furnace 02">Furnace 02 (15T)</option>
          </select>

          <select
            value={shiftFilter}
            onChange={e => setShiftFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-sans text-slate-700 focus:outline-none focus:border-[#C5A059]"
          >
            <option value="">All Shifts</option>
            <option value="A">Shift A (Morning)</option>
            <option value="B">Shift B (Evening)</option>
            <option value="C">Shift C (Night)</option>
          </select>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl gap-1 font-sans text-xs">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3.5 py-2 rounded-lg font-semibold transition-all ${viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Heat Cards
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3.5 py-2 rounded-lg font-semibold transition-all ${viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Log Grid
          </button>
        </div>
      </div>

      {/* HEAT CARDS VIEW */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredData.map(item => (
            <div key={item.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-[#C5A059]/40 hover:shadow-md transition-all space-y-4 relative group">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400 font-mono uppercase">{item.date} • Shift {item.shift_id}</span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{item.heat_no}</h3>
                </div>
                <span className="text-xs font-semibold uppercase px-2.5 py-1 rounded-lg font-mono bg-amber-100 text-amber-900 border border-amber-200">
                  {item.furnace_no}
                </span>
              </div>

              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/70 space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Scrap Input:</span>
                  <span className="font-semibold text-slate-800">{(item.scrap_input_kg / 1000).toFixed(2)} MT ({item.scrap_input_kg} kg)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Liquid Steel Tapped:</span>
                  <span className="font-bold text-amber-700">{(item.liquid_steel_tapped_kg / 1000).toFixed(2)} MT ({item.liquid_steel_tapped_kg} kg)</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span className="font-sans">Power Consumption:</span>
                  <span>{item.power_consumed_kwh.toLocaleString()} kWh</span>
                </div>
              </div>

              {/* Yield Progress Bar */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-500 font-sans">Melting Yield:</span>
                  <span className="font-bold text-emerald-600">{item.yield_pct}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, item.yield_pct)}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs font-mono pt-1">
                <div>
                  <span className="text-slate-400 font-sans block">Tapping Temp:</span>
                  <p className="font-semibold text-rose-600">{item.tapping_temp_c}°C</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 font-sans block">Furnace Master:</span>
                  <p className="font-semibold text-slate-800 font-sans">{item.furnace_master}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs font-mono">
                <span className="text-slate-500 font-sans">Heat Runtime: {item.runtime_min} mins</span>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-rose-500 hover:text-rose-700 font-semibold cursor-pointer"
                >
                  Delete Log
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ENTERPRISE GRID TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-sans border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Shift</th>
                  <th className="px-4 py-3.5">Furnace</th>
                  <th className="px-4 py-3.5">Heat No</th>
                  <th className="px-4 py-3.5 text-right">Scrap In (kg)</th>
                  <th className="px-4 py-3.5 text-right">Liquid Out (kg)</th>
                  <th className="px-4 py-3.5 text-right">Yield %</th>
                  <th className="px-4 py-3.5 text-right">Power (kWh)</th>
                  <th className="px-4 py-3.5 text-right">Temp (°C)</th>
                  <th className="px-4 py-3.5">Master</th>
                  <th className="px-4 py-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs">
                {filteredData.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 text-slate-700">{item.date}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900 font-sans">{item.shift_id}</td>
                    <td className="px-4 py-3 text-slate-600 font-sans">{item.furnace_no}</td>
                    <td className="px-4 py-3 text-slate-900 font-bold">{item.heat_no}</td>
                    <td className="px-4 py-3 text-right">{item.scrap_input_kg.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-bold text-amber-700">{item.liquid_steel_tapped_kg.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600">{item.yield_pct}%</td>
                    <td className="px-4 py-3 text-right">{item.power_consumed_kwh.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-rose-600 font-semibold">{item.tapping_temp_c}°C</td>
                    <td className="px-4 py-3 text-slate-800 font-sans">{item.furnace_master}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleDelete(item.id)} className="text-rose-500 hover:text-rose-700 font-bold p-1">✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: LOG NEW HEAT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200/90 overflow-hidden animate-zoom-in my-8">
            
            {/* Header */}
            <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-sans">Record Tapped Furnace Heat</h3>
                <p className="text-xs text-slate-500 mt-0.5">Log crucible inputs, tapping temperature, and electricity consumption.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateHeat} className="p-7 space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase font-mono">Heat Log Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full mt-1.5 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-sans text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059]"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase font-mono">Furnace Unit</label>
                  <select
                    value={formData.furnace_no}
                    onChange={e => setFormData({ ...formData, furnace_no: e.target.value })}
                    className="w-full mt-1.5 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-sans text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059]"
                  >
                    <option value="Furnace 01">Furnace 01 (15 Ton)</option>
                    <option value="Furnace 02">Furnace 02 (15 Ton)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase font-mono">Heat Serial Number</label>
                  <input
                    type="text"
                    placeholder="e.g. H-260825A"
                    value={formData.heat_no}
                    onChange={e => setFormData({ ...formData, heat_no: e.target.value })}
                    className="w-full mt-1.5 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059]"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase font-mono">Shift & Master</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={formData.shift_id}
                      onChange={e => setFormData({ ...formData, shift_id: e.target.value })}
                      className="mt-1.5 px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-sans text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059]"
                    >
                      <option value="A">Shift A</option>
                      <option value="B">Shift B</option>
                      <option value="C">Shift C</option>
                    </select>
                    <select
                      value={formData.furnace_master}
                      onChange={e => setFormData({ ...formData, furnace_master: e.target.value })}
                      className="mt-1.5 px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-sans text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059]"
                    >
                      {furnaceMasters.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase font-mono">Scrap Input (KG)</label>
                  <input
                    type="number"
                    placeholder="22000"
                    value={formData.scrap_input_kg}
                    onChange={e => setFormData({ ...formData, scrap_input_kg: e.target.value })}
                    className="w-full mt-1.5 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059]"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase font-mono">Liquid Steel (KG)</label>
                  <input
                    type="number"
                    placeholder="20400"
                    value={formData.liquid_steel_tapped_kg}
                    onChange={e => setFormData({ ...formData, liquid_steel_tapped_kg: e.target.value })}
                    className="w-full mt-1.5 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059]"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase font-mono">Power (kWh)</label>
                  <input
                    type="number"
                    placeholder="11500"
                    value={formData.power_consumed_kwh}
                    onChange={e => setFormData({ ...formData, power_consumed_kwh: e.target.value })}
                    className="w-full mt-1.5 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase font-mono">Tapping Temp (°C)</label>
                  <input
                    type="number"
                    value={formData.tapping_temp_c}
                    onChange={e => setFormData({ ...formData, tapping_temp_c: e.target.value })}
                    className="w-full mt-1.5 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase font-mono">FeSi Alloy (KG)</label>
                  <input
                    type="number"
                    value={formData.fe_si_alloy_kg}
                    onChange={e => setFormData({ ...formData, fe_si_alloy_kg: e.target.value })}
                    className="w-full mt-1.5 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase font-mono">FeMn Alloy (KG)</label>
                  <input
                    type="number"
                    value={formData.fe_mn_alloy_kg}
                    onChange={e => setFormData({ ...formData, fe_mn_alloy_kg: e.target.value })}
                    className="w-full mt-1.5 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059]"
                  />
                </div>
              </div>

              {/* Dynamic Calculation Result */}
              {scrapInKg > 0 && liquidOutKg > 0 && (
                <div className="bg-amber-50/70 border border-amber-200/90 rounded-xl p-4 flex justify-between items-center text-xs font-mono">
                  <div>
                    <span className="text-slate-600 font-sans block">Computed Melting Yield:</span>
                    <strong className="text-base font-bold text-emerald-700 font-mono">{computedYield}%</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-600 font-sans block">Specific Power Consumption:</span>
                    <strong className="text-base font-bold text-[#B48F48] font-mono">{computedSec} kWh/MT</strong>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#B48F48] hover:bg-[#9E7A37] text-white font-semibold rounded-xl text-xs shadow-sm transition-all cursor-pointer"
                >
                  Save & Log Smelt Heat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
