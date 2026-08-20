'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';

type ProductionOutput = {
  line: string;
  styleNo: string;
  target: number;
  actual: number;
  defects: number;
  supervisor: string;
};

export default function GarmentsProductionPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';
  const tableCellPadding = isCompact ? 'px-4 py-2 text-[11px]' : 'px-6 py-3.5 text-xs';
  const tableHeaderPadding = isCompact ? 'px-4 py-2.5 text-[8px]' : 'px-6 py-3.5 text-[9px]';

  const sewingOutputs: ProductionOutput[] = [
    { line: 'Sewing Line 1', styleNo: 'STYLE-2026-A92', target: 800, actual: 785, defects: 8, supervisor: 'Marcus Vance' },
    { line: 'Sewing Line 2', styleNo: 'STYLE-2026-A92', target: 600, actual: 612, defects: 12, supervisor: 'Rita Diaz' },
    { line: 'Sewing Line 3', styleNo: 'STYLE-2026-B12', target: 900, actual: 854, defects: 15, supervisor: 'Arthur Pendelton' }
  ];

  return (
    <div className="space-y-5 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-extrabold text-slate-900">Garments Sewing Floor Production</h2>
        <p className="text-[11px] text-slate-500">Monitor real-time assembly line output yields, daily targets, and defects.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/85 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                <th className={tableHeaderPadding}>Sewing Line</th>
                <th className={tableHeaderPadding}>Running Style</th>
                <th className={`${tableHeaderPadding} text-right`}>Daily Target</th>
                <th className={`${tableHeaderPadding} text-right`}>Actual Output</th>
                <th className={`${tableHeaderPadding} text-right`}>Defect Count</th>
                <th className={tableHeaderPadding}>Supervisor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {sewingOutputs.map((out, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className={`${tableCellPadding} text-slate-950 font-bold`}>{out.line}</td>
                  <td className={`${tableCellPadding} text-indigo-600 font-mono`}>{out.styleNo}</td>
                  <td className={`${tableCellPadding} text-right font-mono text-slate-400`}>{out.target.toLocaleString()} Pcs</td>
                  <td className={`${tableCellPadding} text-right font-mono font-bold text-slate-950`}>{out.actual.toLocaleString()} Pcs</td>
                  <td className={`${tableCellPadding} text-right font-mono text-rose-600 font-bold`}>{out.defects} Pcs</td>
                  <td className={tableCellPadding}>{out.supervisor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
