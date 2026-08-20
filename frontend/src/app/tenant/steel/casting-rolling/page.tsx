'use client';
import React from 'react';
import { useAuth } from '@/context/AuthContext';

export default function CastingRollingPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';
  const tableCellPadding = isCompact ? 'px-4 py-2.5 text-[11px]' : 'px-6 py-4 text-xs';

  const castingStrands = [
    { strand: 'Strand A (Billet 120mm)', speed: '1.8 m/min', coolingTemp: '1,220°C', yield: '98.4%', status: 'Active', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    { strand: 'Strand B (Billet 150mm)', speed: '1.2 m/min', coolingTemp: '1,280°C', yield: '99.1%', status: 'Active', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    { strand: 'Bar Mill 1 (12mm Rebar)', speed: '4.5 m/min', coolingTemp: '950°C', yield: '97.2%', status: 'Operational', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' }
  ];

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-extrabold text-slate-900">Billet Casting & Rolling Mills</h2>
        <p className="text-[11px] text-slate-500">Track molten steel caster speed rates, water cooling jackets, and wire/rebar output bundles.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-550 border-b border-slate-200 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              <th className={tableCellPadding}>Casting / Rolling Line</th>
              <th className={tableCellPadding}>Feed Speed</th>
              <th className={tableCellPadding}>Cooling Temperature</th>
              <th className={tableCellPadding}>Quality Yield %</th>
              <th className={`${tableCellPadding} text-center`}>Operational State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
            {castingStrands.map((s, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50">
                <td className={`${tableCellPadding} text-slate-900 font-bold`}>{s.strand}</td>
                <td className={`${tableCellPadding} font-mono`}>{s.speed}</td>
                <td className={`${tableCellPadding} font-mono`}>{s.coolingTemp}</td>
                <td className={`${tableCellPadding} font-mono text-[#B48F48]`}>{s.yield}</td>
                <td className={`${tableCellPadding} text-center`}>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold font-mono border uppercase ` + s.color}>
                    {s.status}
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
