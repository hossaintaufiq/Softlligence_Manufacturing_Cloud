'use client';
import React from 'react';
export default function QADataPage() {
  return (
    <div className="space-y-5 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-extrabold text-slate-900">Tensile Strength Quality Audits</h2>
        <p className="text-[11px] text-slate-500">Verify steel bar ductility, yield strength specs, and bundle QC tags.</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs text-xs font-mono text-slate-500">
        âœ“ QC Passed: Heat #4292 Rebar bundles (Grade 60 structural) passed tension test.
      </div>
    </div>
  );
}
