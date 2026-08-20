'use client';
import React from 'react';
export default function StaffShiftsPage() {
  return (
    <div className="space-y-5 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-extrabold text-slate-900">Cashier Shift Roster Scheduling</h2>
        <p className="text-[11px] text-slate-500">Manage store associates rosters, cashier shifts, and check-in hours logs.</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs text-xs font-mono text-slate-500">
        ðŸ‘¥ Shift Status: Register 1 cashier (Sarah L.) checked in.
      </div>
    </div>
  );
}
