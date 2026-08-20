'use client';

import React from 'react';

export default function DatabaseTelemetryPage() {
  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-3">
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-mono">Database Pools & Telemetry</h3>
        <p className="text-xs text-slate-500 mt-0.5">Prisma Client connections to cloud Supabase instance.</p>
      </div>

      <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-sm max-w-xl">
        <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2 gap-3">
          <span className="text-slate-500 font-medium">Database connection limit</span>
          <span className="font-bold text-slate-800 font-mono">10 Connections (Max)</span>
        </div>
        <div className="flex items-center justify-between text-xs gap-3">
          <span className="text-slate-500 font-medium">Active query pools</span>
          <span className="font-bold text-emerald-600 font-mono">3 / 10 active</span>
        </div>
      </div>
    </div>
  );
}
