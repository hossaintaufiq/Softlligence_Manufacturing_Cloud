'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';

export default function DashboardPage() {
  const { user, tenant, activeFactory } = useWorkspace();
  const userName = user?.name?.split(' ')[0] || 'Jay';

  // Date states for time ranges
  const [opTimeRange, setOpTimeRange] = useState({ start: '2026-06-01', end: '2026-06-15' });
  const [forecastTimeRange, setForecastTimeRange] = useState({ start: '2026-06-01', end: '2026-06-15' });
  const [maintenanceTimeRange, setMaintenanceTimeRange] = useState({ start: '2026-06-01', end: '2026-06-16' });

  return (
    <main className="min-h-screen bg-slate-50 p-6 space-y-6 font-sans text-slate-800">
      
      {/* Top Banner / Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Hi {userName}! Lets {activeFactory?.code === 'MAIN' ? 'Melt' : 'Die-Cast'} something today
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active workspace context: {tenant?.name || 'Softlligence Workspace'} ({activeFactory?.name || 'Primary Plant'})
          </p>
        </div>
      </div>

      {/* SECTION 1: Operation Command Center */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Operation command center</h2>
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-500 font-semibold">Time range</span>
            <div className="flex items-center space-x-1 border border-slate-200 bg-white rounded-lg px-2 py-1 shadow-2xs">
              <input
                type="date"
                value={opTimeRange.start}
                onChange={(e) => setOpTimeRange({ ...opTimeRange, start: e.target.value })}
                className="bg-transparent focus:outline-none text-slate-700 cursor-pointer text-[11px]"
              />
              <span className="text-slate-400 font-medium">-</span>
              <input
                type="date"
                value={opTimeRange.end}
                onChange={(e) => setOpTimeRange({ ...opTimeRange, end: e.target.value })}
                className="bg-transparent focus:outline-none text-slate-700 cursor-pointer text-[11px]"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* OEE & Today's Prod */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Overall OEE Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Overall OEE</span>
                <button className="text-[10px] font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                  View detail &gt;
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center">
                <div className="sm:col-span-2 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
                  <span className="text-lg font-extrabold text-amber-600 block">Need attention</span>
                  <span className="text-[10px] text-slate-400 block leading-relaxed">OEE score below target 85% threshold.</span>
                </div>
                <div className="sm:col-span-3 h-24 flex items-end justify-between px-1">
                  {/* Custom SVG Bar Chart */}
                  <svg className="w-full h-full" viewBox="0 0 160 80">
                    <rect x="0" y="40" width="8" height="40" rx="2" fill="#3b82f6" />
                    <rect x="12" y="30" width="8" height="50" rx="2" fill="#3b82f6" />
                    <rect x="24" y="20" width="8" height="60" rx="2" fill="#3b82f6" />
                    <rect x="36" y="45" width="8" height="35" rx="2" fill="#3b82f6" />
                    <rect x="48" y="15" width="8" height="65" rx="2" fill="#3b82f6" />
                    <rect x="60" y="30" width="8" height="50" rx="2" fill="#3b82f6" />
                    <rect x="72" y="25" width="8" height="55" rx="2" fill="#3b82f6" />
                    <rect x="84" y="10" width="8" height="70" rx="2" fill="#3b82f6" />
                    <rect x="96" y="35" width="8" height="45" rx="2" fill="#3b82f6" />
                    <rect x="108" y="20" width="8" height="60" rx="2" fill="#3b82f6" />
                    <rect x="120" y="25" width="8" height="55" rx="2" fill="#3b82f6" />
                    <rect x="132" y="15" width="8" height="65" rx="2" fill="#3b82f6" />
                    <rect x="144" y="40" width="8" height="40" rx="2" fill="#3b82f6" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Small metric cards A and B */}
            <div className="grid grid-cols-2 gap-4">
              {/* Today's production */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Today's production</span>
                  <span className="text-base font-extrabold text-slate-900 mt-1 block">12.05M</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Model produced</span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-xl text-indigo-600">
                  🏭
                </div>
              </div>

              {/* Lines status */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lines status</span>
                  <span className="text-base font-extrabold text-emerald-600 mt-1 block">Normal</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Model produced</span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-xl text-indigo-600">
                  ⚙️
                </div>
              </div>
            </div>
          </div>

          {/* Actual vs Plan line chart */}
          <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Actual production/ plan production</span>
              <button className="text-[10px] font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                View detail &gt;
              </button>
            </div>

            {/* Legends */}
            <div className="flex flex-wrap gap-2 text-[9px] font-mono text-slate-400">
              <span className="flex items-center space-x-1"><span className="w-2 h-0.5 bg-blue-500 inline-block"></span> <span>Item 1</span></span>
              <span className="flex items-center space-x-1"><span className="w-2 h-0.5 bg-emerald-500 inline-block"></span> <span>Item 2</span></span>
              <span className="flex items-center space-x-1"><span className="w-2 h-0.5 bg-amber-500 inline-block"></span> <span>Item 3</span></span>
              <span className="flex items-center space-x-1"><span className="w-2 h-0.5 bg-indigo-500 inline-block"></span> <span>Item 4</span></span>
              <span className="flex items-center space-x-1"><span className="w-2 h-0.5 bg-rose-500 inline-block"></span> <span>Item 5</span></span>
              <span className="flex items-center space-x-1"><span className="w-2 h-0.5 bg-teal-500 inline-block"></span> <span>Item 6</span></span>
            </div>

            {/* Custom SVG Line Chart */}
            <div className="h-32 w-full">
              <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
                {/* Horizontal grid lines */}
                <line x1="0" y1="20" x2="200" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="50" x2="200" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="80" x2="200" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                
                {/* Solid actual line */}
                <path d="M 0 80 Q 25 70 50 85 T 100 50 T 150 85 T 200 40" fill="none" stroke="#2563eb" strokeWidth="2" />
                {/* Dashed plan line */}
                <path d="M 0 60 Q 25 35 50 50 T 100 80 T 150 40 T 200 30" fill="none" stroke="#0d9488" strokeWidth="2" strokeDasharray="3,3" />

                {/* X labels */}
                <text x="5" y="98" fill="#94a3b8" fontSize="8" fontFamily="monospace">06-06-2026</text>
                <text x="80" y="98" fill="#94a3b8" fontSize="8" fontFamily="monospace">10-06-2026</text>
                <text x="155" y="98" fill="#94a3b8" fontSize="8" fontFamily="monospace">15-06-2026</text>
              </svg>
            </div>
          </div>

          {/* Lines production multi-line chart */}
          <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Lines production</span>
            </div>

            {/* Legends */}
            <div className="flex flex-wrap gap-2 text-[9px] font-mono text-slate-400">
              <span className="flex items-center space-x-1"><span className="w-2 h-0.5 bg-blue-500 inline-block"></span> <span>Item 1</span></span>
              <span className="flex items-center space-x-1"><span className="w-2 h-0.5 bg-emerald-500 inline-block"></span> <span>Item 2</span></span>
              <span className="flex items-center space-x-1"><span className="w-2 h-0.5 bg-amber-500 inline-block"></span> <span>Item 3</span></span>
            </div>

            {/* Multi-line production chart */}
            <div className="h-32 w-full">
              <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
                <line x1="0" y1="20" x2="200" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="50" x2="200" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="80" x2="200" y2="80" stroke="#f1f5f9" strokeWidth="1" />

                <path d="M 0 90 Q 50 85 100 80 T 150 70 T 200 65" fill="none" stroke="#2563eb" strokeWidth="1.5" />
                <path d="M 0 85 Q 50 80 100 65 T 150 50 T 200 45" fill="none" stroke="#10b981" strokeWidth="1.5" />
                <path d="M 0 80 Q 50 70 100 55 T 150 40 T 200 35" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
                <path d="M 0 75 Q 50 65 100 45 T 150 35 T 200 25" fill="none" stroke="#a855f7" strokeWidth="1.5" />

                <text x="5" y="98" fill="#94a3b8" fontSize="8" fontFamily="monospace">06-06-2026</text>
                <text x="80" y="98" fill="#94a3b8" fontSize="8" fontFamily="monospace">10-06-2026</text>
                <text x="155" y="98" fill="#94a3b8" fontSize="8" fontFamily="monospace">15-06-2026</text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Forecast Summary */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Forecast summary</h2>
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-500 font-semibold">Time range</span>
            <div className="flex items-center space-x-1 border border-slate-200 bg-white rounded-lg px-2 py-1 shadow-2xs">
              <input
                type="date"
                value={forecastTimeRange.start}
                onChange={(e) => setForecastTimeRange({ ...forecastTimeRange, start: e.target.value })}
                className="bg-transparent focus:outline-none text-slate-700 cursor-pointer text-[11px]"
              />
              <span className="text-slate-400 font-medium">-</span>
              <input
                type="date"
                value={forecastTimeRange.end}
                onChange={(e) => setForecastTimeRange({ ...forecastTimeRange, end: e.target.value })}
                className="bg-transparent focus:outline-none text-slate-700 cursor-pointer text-[11px]"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Failure Summary Area Chart */}
          <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Failure Summary</span>
              <button className="text-[10px] font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                View detail &gt;
              </button>
            </div>

            {/* Legends */}
            <div className="flex flex-wrap gap-2 text-[9px] font-mono text-slate-400">
              <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 bg-orange-200 border border-orange-500 rounded inline-block"></span> <span>Production line</span></span>
              <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 bg-teal-100 border border-teal-500 rounded inline-block"></span> <span>Die/Mold</span></span>
              <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 bg-blue-100 border border-blue-500 rounded inline-block"></span> <span>Phenomenon</span></span>
            </div>

            {/* Area Chart */}
            <div className="h-44 w-full">
              <svg className="w-full h-full" viewBox="0 0 400 150" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="gradOrange" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="gradTeal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                <line x1="0" y1="30" x2="400" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="75" x2="400" y2="75" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="120" x2="400" y2="120" stroke="#f1f5f9" strokeWidth="1" />

                {/* Orange Area */}
                <path d="M 0 110 Q 50 120 100 80 T 200 110 T 300 70 T 400 100 L 400 135 L 0 135 Z" fill="url(#gradOrange)" />
                <path d="M 0 110 Q 50 120 100 80 T 200 110 T 300 70 T 400 100" fill="none" stroke="#ea580c" strokeWidth="2" />

                {/* Teal Area */}
                <path d="M 0 95 Q 50 75 100 95 T 200 120 T 300 85 T 400 65 L 400 135 L 0 135 Z" fill="url(#gradTeal)" />
                <path d="M 0 95 Q 50 75 100 95 T 200 120 T 300 85 T 400 65" fill="none" stroke="#0d9488" strokeWidth="2" />

                {/* Blue Area */}
                <path d="M 0 60 Q 50 90 100 110 T 200 90 T 300 45 T 400 115 L 400 135 L 0 135 Z" fill="url(#gradBlue)" />
                <path d="M 0 60 Q 50 90 100 110 T 200 90 T 300 45 T 400 115" fill="none" stroke="#2563eb" strokeWidth="2" />

                {/* X labels */}
                <text x="5" y="145" fill="#94a3b8" fontSize="8" fontFamily="monospace">01-06-2026</text>
                <text x="80" y="145" fill="#94a3b8" fontSize="8" fontFamily="monospace">03-06-2026</text>
                <text x="160" y="145" fill="#94a3b8" fontSize="8" fontFamily="monospace">05-06-2026</text>
                <text x="240" y="145" fill="#94a3b8" fontSize="8" fontFamily="monospace">08-06-2026</text>
                <text x="320" y="145" fill="#94a3b8" fontSize="8" fontFamily="monospace">11-06-2026</text>
              </svg>
            </div>
          </div>

          {/* Forecast stats on the right */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Parts low lifecycle */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Parts low life cycle</span>
                <span className="text-lg font-extrabold text-slate-900 mt-1 block">12.05M</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">Parts count</span>
                <button className="text-[9px] font-bold text-indigo-600 hover:text-indigo-500 mt-2 block">
                  View detail &gt;
                </button>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center text-2xl text-orange-600">
                🔧
              </div>
            </div>

            {/* Die affected */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Die affected</span>
              <span className="text-xl font-extrabold text-slate-900 mt-1 block">145</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">Molds cataloged</span>
            </div>

            {/* Parts Lifecycle Usage Distribution */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
              <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider block">Parts Lifecycle Usage Distribution</span>
              
              {/* Stacked Bar */}
              <div className="w-full h-3 rounded-full flex overflow-hidden">
                <div className="bg-rose-500 w-[15%]" title="Low life cycle" />
                <div className="bg-amber-400 w-[45%]" title="Need replacement plan" />
                <div className="bg-emerald-500 w-[40%]" title="Normal" />
              </div>

              {/* Legends */}
              <div className="grid grid-cols-3 gap-1 text-[8px] font-mono text-slate-400">
                <span className="flex items-center space-x-1"><span className="w-2 h-2 bg-rose-500 rounded-full inline-block"></span> <span>Low lifecycle</span></span>
                <span className="flex items-center space-x-1"><span className="w-2 h-2 bg-amber-400 rounded-full inline-block"></span> <span>Replacement</span></span>
                <span className="flex items-center space-x-1"><span className="w-2 h-2 bg-emerald-500 rounded-full inline-block"></span> <span>Normal</span></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Maintenance Type KPI Overview */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Maintenance type KPI overview</h2>
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-500 font-semibold">Time range</span>
            <div className="flex items-center space-x-1 border border-slate-200 bg-white rounded-lg px-2 py-1 shadow-2xs">
              <input
                type="date"
                value={maintenanceTimeRange.start}
                onChange={(e) => setMaintenanceTimeRange({ ...maintenanceTimeRange, start: e.target.value })}
                className="bg-transparent focus:outline-none text-slate-700 cursor-pointer text-[11px]"
              />
              <span className="text-slate-400 font-medium">-</span>
              <input
                type="date"
                value={maintenanceTimeRange.end}
                onChange={(e) => setMaintenanceTimeRange({ ...maintenanceTimeRange, end: e.target.value })}
                className="bg-transparent focus:outline-none text-slate-700 cursor-pointer text-[11px]"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Maintenance Case count */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Maintenance case count / BM rate</span>
              <button className="text-[10px] font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                View detail &gt;
              </button>
            </div>

            {/* Legends */}
            <div className="flex flex-wrap gap-2 text-[9px] font-mono text-slate-400">
              <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 bg-blue-500 rounded inline-block"></span> <span>Item 1</span></span>
              <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded inline-block"></span> <span>Item 2</span></span>
              <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 bg-amber-500 rounded inline-block"></span> <span>Item 3</span></span>
            </div>

            {/* Vertical Bar Chart */}
            <div className="h-36 w-full">
              <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                <line x1="0" y1="20" x2="300" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="50" x2="300" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="80" x2="300" y2="80" stroke="#f1f5f9" strokeWidth="1" />

                {/* Group 1 */}
                <rect x="20" y="40" width="8" height="50" rx="1" fill="#3b82f6" />
                <rect x="30" y="30" width="8" height="60" rx="1" fill="#10b981" />
                <rect x="40" y="55" width="8" height="35" rx="1" fill="#f59e0b" />

                {/* Group 2 */}
                <rect x="90" y="20" width="8" height="70" rx="1" fill="#3b82f6" />
                <rect x="100" y="45" width="8" height="45" rx="1" fill="#10b981" />
                <rect x="110" y="35" width="8" height="55" rx="1" fill="#f59e0b" />

                {/* Group 3 */}
                <rect x="160" y="50" width="8" height="40" rx="1" fill="#3b82f6" />
                <rect x="170" y="30" width="8" height="60" rx="1" fill="#10b981" />
                <rect x="180" y="25" width="8" height="65" rx="1" fill="#f59e0b" />

                {/* Group 4 */}
                <rect x="230" y="35" width="8" height="55" rx="1" fill="#3b82f6" />
                <rect x="240" y="15" width="8" height="75" rx="1" fill="#10b981" />
                <rect x="250" y="45" width="8" height="45" rx="1" fill="#f59e0b" />
              </svg>
            </div>
          </div>

          {/* Maintenance Man Hour */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Maintenance man-hour</span>
            </div>

            {/* Legends */}
            <div className="flex flex-wrap gap-2 text-[9px] font-mono text-slate-400">
              <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 bg-blue-500 rounded inline-block"></span> <span>Item 1</span></span>
              <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded inline-block"></span> <span>Item 2</span></span>
              <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 bg-amber-500 rounded inline-block"></span> <span>Item 3</span></span>
            </div>

            {/* Vertical Bar Chart */}
            <div className="h-36 w-full">
              <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                <line x1="0" y1="20" x2="300" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="50" x2="300" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="80" x2="300" y2="80" stroke="#f1f5f9" strokeWidth="1" />

                {/* Group 1 */}
                <rect x="20" y="30" width="8" height="60" rx="1" fill="#3b82f6" />
                <rect x="30" y="45" width="8" height="45" rx="1" fill="#10b981" />
                <rect x="40" y="20" width="8" height="70" rx="1" fill="#f59e0b" />

                {/* Group 2 */}
                <rect x="90" y="55" width="8" height="35" rx="1" fill="#3b82f6" />
                <rect x="100" y="30" width="8" height="60" rx="1" fill="#10b981" />
                <rect x="110" y="50" width="8" height="40" rx="1" fill="#f59e0b" />

                {/* Group 3 */}
                <rect x="160" y="15" width="8" height="75" rx="1" fill="#3b82f6" />
                <rect x="170" y="40" width="8" height="40" rx="1" fill="#10b981" />
                <rect x="180" y="35" width="8" height="55" rx="1" fill="#f59e0b" />

                {/* Group 4 */}
                <rect x="230" y="45" width="8" height="45" rx="1" fill="#3b82f6" />
                <rect x="240" y="25" width="8" height="65" rx="1" fill="#10b981" />
                <rect x="250" y="55" width="8" height="35" rx="1" fill="#f59e0b" />
              </svg>
            </div>
          </div>
        </div>
      </section>
      
    </main>
  );
}
