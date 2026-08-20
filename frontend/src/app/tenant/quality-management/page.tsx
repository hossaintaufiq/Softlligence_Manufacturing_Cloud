'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';

type QAInspection = {
  styleNo: string;
  stage: string;
  inspectedQty: number;
  minorDefects: number;
  majorDefects: number;
  decision: string;
};

export default function QualityManagementPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';
  const tableCellPadding = isCompact ? 'px-4 py-2 text-[11px]' : 'px-6 py-3.5 text-xs';
  const tableHeaderPadding = isCompact ? 'px-4 py-2.5 text-[8px]' : 'px-6 py-3.5 text-[9px]';

  const qaInspections: QAInspection[] = [
    { styleNo: 'STYLE-2026-A92', stage: 'Inline Inspection', inspectedQty: 250, minorDefects: 14, majorDefects: 2, decision: 'Passed (AQL 2.5)' },
    { styleNo: 'STYLE-2026-B12', stage: 'Pre-Final Audit', inspectedQty: 500, minorDefects: 28, majorDefects: 9, decision: 'Rejected (AQL Violation)' }
  ];

  return (
    <div className="space-y-5 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-extrabold text-slate-900">Quality Management & Inspections (AQL)</h2>
        <p className="text-[11px] text-slate-500">Record hourly quality audits, minor/major defect rates, and final cargo release pass checks.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/85 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                <th className={tableHeaderPadding}>Inspected Style</th>
                <th className={tableHeaderPadding}>Audit Stage</th>
                <th className={`${tableHeaderPadding} text-right`}>Inspected Qty</th>
                <th className={`${tableHeaderPadding} text-right`}>Minor Defects</th>
                <th className={`${tableHeaderPadding} text-right`}>Major Defects</th>
                <th className={`${tableHeaderPadding} text-center`}>Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {qaInspections.map((qa, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className={`${tableCellPadding} text-indigo-600 font-mono font-bold`}>{qa.styleNo}</td>
                  <td className={tableCellPadding}>{qa.stage}</td>
                  <td className={`${tableCellPadding} text-right font-mono`}>{qa.inspectedQty} Pcs</td>
                  <td className={`${tableCellPadding} text-right font-mono text-amber-600`}>{qa.minorDefects}</td>
                  <td className={`${tableCellPadding} text-right font-mono text-rose-600`}>{qa.majorDefects}</td>
                  <td className={`${tableCellPadding} text-center`}>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase font-mono tracking-wider ${
                      qa.decision.includes('Passed')
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-500/20'
                        : 'bg-rose-50 text-rose-600 border border-rose-500/20'
                    }`}>
                      {qa.decision}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
