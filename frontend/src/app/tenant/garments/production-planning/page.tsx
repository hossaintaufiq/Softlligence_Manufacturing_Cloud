'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';

type ProductionPlan = {
  line: string;
  styleNo: string;
  plannedQty: number;
  startDate: string;
  endDate: string;
  efficiency: string;
};

export default function ProductionPlanningPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';
  const tableCellPadding = isCompact ? 'px-4 py-2 text-[11px]' : 'px-6 py-3.5 text-xs';
  const tableHeaderPadding = isCompact ? 'px-4 py-2.5 text-[8px]' : 'px-6 py-3.5 text-[9px]';

  const prodPlans: ProductionPlan[] = [
    { line: 'Sewing Line 1', styleNo: 'STYLE-2026-A92', plannedQty: 10000, startDate: '2026-08-20', endDate: '2026-08-27', efficiency: '92.5%' },
    { line: 'Sewing Line 2', styleNo: 'STYLE-2026-A92', plannedQty: 15000, startDate: '2026-08-21', endDate: '2026-08-29', efficiency: '88.3%' },
    { line: 'Sewing Line 3', styleNo: 'STYLE-2026-B12', plannedQty: 20000, startDate: '2026-08-25', endDate: '2026-09-02', efficiency: '95.0%' }
  ];

  return (
    <div className="space-y-5 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-extrabold text-slate-900">Line Scheduling & Planning</h2>
        <p className="text-[11px] text-slate-500">Allocate sewing lines, schedule starts, and assign target layouts.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/85 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                <th className={tableHeaderPadding}>Assigned Line</th>
                <th className={tableHeaderPadding}>Style No</th>
                <th className={`${tableHeaderPadding} text-right`}>Planned Qty</th>
                <th className={tableHeaderPadding}>Planned Start</th>
                <th className={tableHeaderPadding}>Planned End</th>
                <th className={`${tableHeaderPadding} text-center`}>Target Efficiency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {prodPlans.map((plan, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className={`${tableCellPadding} text-slate-900 font-bold`}>{plan.line}</td>
                  <td className={`${tableCellPadding} text-indigo-600 font-mono`}>{plan.styleNo}</td>
                  <td className={`${tableCellPadding} text-right font-mono`}>{plan.plannedQty.toLocaleString()} Pcs</td>
                  <td className={`${tableCellPadding} font-mono text-slate-500`}>{plan.startDate}</td>
                  <td className={`${tableCellPadding} font-mono text-slate-500`}>{plan.endDate}</td>
                  <td className={`${tableCellPadding} text-center font-bold font-mono text-emerald-600`}>{plan.efficiency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
