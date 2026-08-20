'use client';
import React from 'react';
export default function ShiftsPage() {
  return (
    <div className="space-y-5 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-extrabold text-slate-900">Steelworkers Shift Roster Logs</h2>
        <p className="text-[11px] text-slate-500">Schedule furnace melters, weighbridge workers, and casting supervisors.</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs text-xs font-mono text-slate-500">
        ðŸ‘¥ Shift Status: Morning Casting Crew (C1) active on Line 2.
      </div>
    </div>
  );
}
