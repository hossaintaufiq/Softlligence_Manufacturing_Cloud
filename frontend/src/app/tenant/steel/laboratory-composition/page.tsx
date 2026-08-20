'use client';
import React from 'react';
export default function LabPage() {
  return (
    <div className="space-y-5 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-extrabold text-slate-900">Spectrometer Composition Analysis</h2>
        <p className="text-[11px] text-slate-500">Spectrochemical testing of molten steel chemistry ratios (C, Mn, P, S).</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs text-xs font-mono text-slate-550">
        âœ“ Spec-Test active: Ladle Heat #202611 - C: 0.22%, Mn: 0.85%, P: 0.015%.
      </div>
    </div>
  );
}
