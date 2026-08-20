'use client';
import React from 'react';
import { useAuth } from '@/context/AuthContext';

export default function LabCompositionPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';
  const tableCellPadding = isCompact ? 'px-4 py-2.5 text-[11px]' : 'px-6 py-4 text-xs';

  const chemistryLogs = [
    { heatNo: 'HEAT-2026-9921', carbon: '0.22%', silicon: '0.18%', manganese: '0.85%', sulfur: '0.015%', phosphorus: '0.021%', result: 'PASSED' },
    { heatNo: 'HEAT-2026-9922', carbon: '0.42%', silicon: '0.25%', manganese: '1.20%', sulfur: '0.012%', phosphorus: '0.018%', result: 'PASSED' },
    { heatNo: 'HEAT-2026-9923', carbon: '0.18%', silicon: '0.15%', manganese: '0.70%', sulfur: '0.035%', phosphorus: '0.042%', result: 'REJECT (High S/P)' }
  ];

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-extrabold text-slate-900">Molten Steel Spectrochemical Analysis</h2>
        <p className="text-[11px] text-slate-500">Monitor spectrometry assays, metallurgy grades logs, and chemical ratio thresholds.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              <th className={tableCellPadding}>Heat Reference</th>
              <th className={tableCellPadding}>Carbon (C)</th>
              <th className={tableCellPadding}>Silicon (Si)</th>
              <th className={tableCellPadding}>Manganese (Mn)</th>
              <th className={tableCellPadding}>Sulfur (S)</th>
              <th className={tableCellPadding}>Phosphorus (P)</th>
              <th className={`${tableCellPadding} text-center`}>Assay Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
            {chemistryLogs.map((log, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50">
                <td className={`${tableCellPadding} text-orange-600 font-mono font-bold`}>{log.heatNo}</td>
                <td className={`${tableCellPadding} font-mono`}>{log.carbon}</td>
                <td className={`${tableCellPadding} font-mono`}>{log.silicon}</td>
                <td className={`${tableCellPadding} font-mono`}>{log.manganese}</td>
                <td className={`${tableCellPadding} font-mono`}>{log.sulfur}</td>
                <td className={`${tableCellPadding} font-mono`}>{log.phosphorus}</td>
                <td className={`${tableCellPadding} text-center`}>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold font-mono border uppercase ${
                    log.result.includes('PASSED') ? 'bg-emerald-50 text-emerald-600 border-emerald-250/20' : 'bg-rose-550/10 text-rose-600 border-rose-500/20'
                  }`}>
                    {log.result}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
