'use client';
import React from 'react';
export default function LogisticsPage() {
  return (
    <div className="space-y-5 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-extrabold text-slate-900">Store Logistics & Intake</h2>
        <p className="text-[11px] text-slate-500">Monitor bulk carrier trucks dispatch and stock intakes.</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs text-xs font-mono text-slate-500">
        âœ“ Intake: 4 cartons of Apparel catalog checked into loading deck.
      </div>
    </div>
  );
}
