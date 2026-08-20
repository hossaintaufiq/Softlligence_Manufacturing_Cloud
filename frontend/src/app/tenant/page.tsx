'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';

export default function TenantOverviewPage() {
  const { user } = useAuth();

  // Spacing presets based on density preference
  const isCompact = user?.preferences?.density === 'compact';
  const cardPadding = isCompact ? 'p-4' : 'p-5';
  const gridGap = isCompact ? 'gap-3.5' : 'gap-4 sm:gap-6';

  // Local datasets just for KPI calculations
  const merchStylesLength = 4;
  const sewingLinesLength = 3;
  const procurementPOsCost = 42000 + 38250 + 6400; // POs total cost
  const commercialsVal = 185000 + 320000; // LC total contract value

  return (
    <div className="space-y-8 animate-fade-in text-slate-800">
      <div className={`grid grid-cols-2 lg:grid-cols-4 ${gridGap}`}>
        
        <div className={`bg-white border border-slate-200/80 ${cardPadding} rounded-2xl shadow-sm`}>
          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Active Styles</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1.5 font-mono">{merchStylesLength}</h3>
          <p className="text-[9px] text-slate-400 font-bold mt-1 font-mono">PRODUCT CATALOG</p>
        </div>

        <div className={`bg-white border border-slate-200/80 ${cardPadding} rounded-2xl shadow-sm`}>
          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Sewing Lines</p>
          <h3 className="text-2xl font-extrabold text-indigo-600 mt-1.5 font-mono">{sewingLinesLength}</h3>
          <p className="text-[9px] text-slate-400 font-bold mt-1 font-mono">SHOP FLOOR</p>
        </div>

        <div className={`bg-white border border-slate-200/80 ${cardPadding} rounded-2xl shadow-sm`}>
          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Total POs Cost</p>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-1.5 font-mono">
            ${procurementPOsCost.toLocaleString()}
          </h3>
          <p className="text-[9px] text-slate-400 font-bold mt-1 font-mono">SOURCING BILLS</p>
        </div>

        <div className={`bg-white border border-slate-200/80 ${cardPadding} rounded-2xl shadow-sm`}>
          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">LC Contracts</p>
          <h3 className="text-2xl font-extrabold text-amber-600 mt-1.5 font-mono">
            ${commercialsVal.toLocaleString()}
          </h3>
          <p className="text-[9px] text-slate-400 font-bold mt-1 font-mono">EXPORT LEDGER</p>
        </div>
      </div>

      {/* Graphical Layout */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${gridGap}`}>
        <div className={`bg-white border border-slate-200 ${cardPadding} rounded-2xl space-y-4 shadow-sm`}>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">Shop floor melt yield</h3>
          <div className="h-32 flex items-end space-x-2.5 pb-2">
            <div className="w-full bg-[#FAF6EE] border border-[#C5A059]/25 h-[85%] rounded flex flex-col justify-end text-center pb-1"><span className="text-[9px] font-mono text-[#B48F48] font-bold">94.2%</span></div>
            <div className="w-full bg-[#FAF6EE] border border-[#C5A059]/25 h-[90%] rounded flex flex-col justify-end text-center pb-1"><span className="text-[9px] font-mono text-[#B48F48] font-bold">94.8%</span></div>
            <div className="w-full bg-[#FAF6EE] border border-[#C5A059]/25 h-[88%] rounded flex flex-col justify-end text-center pb-1"><span className="text-[9px] font-mono text-[#B48F48] font-bold">94.5%</span></div>
            <div className="w-full bg-[#FAF6EE] border border-[#C5A059]/25 h-[95%] rounded flex flex-col justify-end text-center pb-1"><span className="text-[9px] font-mono text-[#B48F48] font-bold">95.2%</span></div>
          </div>
          <p className="text-[9px] text-slate-400 font-bold text-center uppercase font-mono">LAST 4 MELTING RUNS</p>
        </div>

        <div className={`bg-white border border-slate-200 ${cardPadding} rounded-2xl space-y-4 shadow-sm flex flex-col justify-between`}>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">Active Workspaces Telemetry</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-slate-50 pb-2 gap-3">
              <span className="text-slate-500 font-medium">BOM explosion status</span>
              <span className="font-bold text-emerald-600 font-mono">OK (100% matched)</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-500 font-medium">Stock ledger sync status</span>
              <span className="font-bold text-[#B48F48] font-mono">SYNCED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
