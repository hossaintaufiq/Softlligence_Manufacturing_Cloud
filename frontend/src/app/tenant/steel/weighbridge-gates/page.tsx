'use client';
import React from 'react';
export default function WeighbridgePage() {
  return (
    <div className="space-y-5 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-extrabold text-slate-900">Weighbridge Gate Control</h2>
        <p className="text-[11px] text-slate-500">Verify truck weighbridge inbound raw scrap weights and outbound shipment loads.</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs text-xs font-mono text-slate-500">
        ðŸš› Truck Gate Log: W-9921 (LIMESTONE - 42.1 Tons) Checked In.
      </div>
    </div>
  );
}
