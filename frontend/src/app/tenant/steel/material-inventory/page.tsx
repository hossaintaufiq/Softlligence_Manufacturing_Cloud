'use client';
import React from 'react';
export default function MaterialPage() {
  return (
    <div className="space-y-5 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-extrabold text-slate-900">Billet & Coil Stockyard</h2>
        <p className="text-[11px] text-slate-500">Inspect grade-60 structural steel billets and hot-rolled coils inventory.</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs text-xs font-mono text-slate-500">
        ðŸ“Š Stockpile A: 340 Tons Cast Billets in warehouse storage bays.
      </div>
    </div>
  );
}
