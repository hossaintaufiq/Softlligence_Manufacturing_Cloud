'use client';

import React from 'react';
import { AnalyticsPanel } from '@/components/analytics/AnalyticsPanel';

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen bg-slate-100 p-6 space-y-6">
      <div className="mx-auto max-w-6xl space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Analytics & KPI Reporting</h1>
            <p className="text-xs text-slate-500 mt-1">
              Overall Equipment Effectiveness (OEE), Melt Yields, Stock Turnover Ratios, and Dynamic Report Engine.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              SECTION 15 ACTIVE
            </span>
          </div>
        </div>

        <AnalyticsPanel />
      </div>
    </main>
  );
}
