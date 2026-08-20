'use client';
import React from 'react';
export default function SinteringPage() {
  return (
    <div className="space-y-5 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-extrabold text-slate-900">Iron Ore Sintering Plant</h2>
        <p className="text-[11px] text-slate-500">Track sinter mix calculations, suction windbox pressure, and yield ratios.</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs font-mono text-xs text-slate-500">
        âœ“ Sintering line 1: Yielding 85% sinter cake at 850 MT feed rate.
      </div>
    </div>
  );
}
