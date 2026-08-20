'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';

type IEOperation = {
  operationName: string;
  section: string;
  smv: number;
  machineUsed: string;
  targetPerHour: number;
};

export default function IndustrialEngineeringPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';
  const tableCellPadding = isCompact ? 'px-4 py-2 text-[11px]' : 'px-6 py-3.5 text-xs';
  const tableHeaderPadding = isCompact ? 'px-4 py-2.5 text-[8px]' : 'px-6 py-3.5 text-[9px]';

  const ieOperations: IEOperation[] = [
    { operationName: 'Neck rib attachments', section: 'Sewing Assembly', smv: 0.45, machineUsed: 'Overlock 4-Thread', targetPerHour: 133 },
    { operationName: 'Bottom hem stitch', section: 'Sewing Assembly', smv: 0.32, machineUsed: 'Flatlock Coverstitch', targetPerHour: 187 },
    { operationName: 'Main label joining', section: 'Sewing Prep', smv: 0.18, machineUsed: 'Single Needle Lockstitch', targetPerHour: 333 }
  ];

  return (
    <div className="space-y-5 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-extrabold text-slate-900">Industrial Engineering (IE) Operation Layout</h2>
        <p className="text-[11px] text-slate-500">Calculate sewing operations, standard minute values (SMV), and operator targets.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/85 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                <th className={tableHeaderPadding}>Operation Name</th>
                <th className={tableHeaderPadding}>Production Section</th>
                <th className={`${tableHeaderPadding} text-right`}>SMV (Minutes)</th>
                <th className={tableHeaderPadding}>Required Machine</th>
                <th className={`${tableHeaderPadding} text-right`}>Target / Hour</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {ieOperations.map((op, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className={`${tableCellPadding} text-slate-950 font-bold`}>{op.operationName}</td>
                  <td className={tableCellPadding}>{op.section}</td>
                  <td className={`${tableCellPadding} text-right font-mono text-indigo-600 font-bold`}>{op.smv.toFixed(2)} Min</td>
                  <td className={`${tableCellPadding} font-mono text-slate-500`}>{op.machineUsed}</td>
                  <td className={`${tableCellPadding} text-right font-mono font-bold text-slate-900`}>{op.targetPerHour} Pcs</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
