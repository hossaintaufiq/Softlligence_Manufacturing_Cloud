'use client';
import React from 'react';
export default function SmeltingPage() {
  return (
    <div className="space-y-5 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-extrabold text-slate-900">Furnace Smelting Telemetry</h2>
        <p className="text-[11px] text-slate-500">Monitor electric arc furnaces and ladle refining temperatures.</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs font-mono text-xs">
        <p className="text-slate-500">âš¡ Status: Ladle A cycle completed. Blast Furnace 1 running at optimal heat profile.</p>
      </div>
    </div>
  );
}
