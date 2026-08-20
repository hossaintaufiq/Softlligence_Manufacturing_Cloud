'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';

type TextileMachine = {
  machineId: string;
  type: string;
  status: 'knitting' | 'dyeing' | 'idle' | 'maintenance';
  output: number;
  tempPressure: string;
};

export default function TextileManufacturingPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';
  const tableCellPadding = isCompact ? 'px-4 py-2 text-[11px]' : 'px-6 py-3.5 text-xs';
  const tableHeaderPadding = isCompact ? 'px-4 py-2.5 text-[8px]' : 'px-6 py-3.5 text-[9px]';

  const textileMachines: TextileMachine[] = [
    { machineId: 'KNIT-M01', type: 'Circular Knitting Machine', status: 'knitting', output: 340, tempPressure: 'N/A' },
    { machineId: 'DYEVAT-01', type: 'Dyeing Jet Vat (500kg)', status: 'dyeing', output: 500, tempPressure: 'Temp: 98C / 3.2 Bar' },
    { machineId: 'DYEVAT-02', type: 'Dyeing Jet Vat (250kg)', status: 'idle', output: 0, tempPressure: 'Ambient / 0 Bar' }
  ];

  return (
    <div className="space-y-5 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-extrabold text-slate-900">Textile Manufacturing Floor (Knitting & Dyeing)</h2>
        <p className="text-[11px] text-slate-500">Track circular knitting outputs, Jet Vat temperatures, and autoclave pressures.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/85 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                <th className={tableHeaderPadding}>Machine ID</th>
                <th className={tableHeaderPadding}>Machine Type</th>
                <th className={`${tableHeaderPadding} text-center`}>Status</th>
                <th className={`${tableHeaderPadding} text-right`}>Daily Output</th>
                <th className={tableHeaderPadding}>Autoclave Telemetry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {textileMachines.map((mach, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className={`${tableCellPadding} text-indigo-600 font-mono font-bold`}>{mach.machineId}</td>
                  <td className={`${tableCellPadding} text-slate-900 font-bold`}>{mach.type}</td>
                  <td className={`${tableCellPadding} text-center`}>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase font-mono tracking-wider ${
                      mach.status === 'knitting' || mach.status === 'dyeing'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-500/20'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {mach.status}
                    </span>
                  </td>
                  <td className={`${tableCellPadding} text-right font-mono`}>{mach.output.toLocaleString()} Kgs</td>
                  <td className={`${tableCellPadding} text-slate-500 font-mono`}>{mach.tempPressure}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
