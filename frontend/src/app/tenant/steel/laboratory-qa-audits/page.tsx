'use client';
import React from 'react';
import { useAuth } from '@/context/AuthContext';

export default function LaboratoryQAPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';
  const tableCellPadding = isCompact ? 'px-4 py-2.5 text-[11px]' : 'px-6 py-4 text-xs';

  const tensileTests = [
    { testId: 'TS-2026-A1', batchId: 'BAT-120mm-99', yieldPoint: '415 MPa', tensileLimit: '620 MPa', elongation: '14.5%', standard: 'ASTM A615 Grade 60', status: 'CERTIFIED' },
    { testId: 'TS-2026-A2', batchId: 'BAT-120mm-10', yieldPoint: '425 MPa', tensileLimit: '635 MPa', elongation: '13.8%', standard: 'ASTM A615 Grade 60', status: 'CERTIFIED' },
    { testId: 'TS-2026-A3', batchId: 'BAT-150mm-04', yieldPoint: '390 MPa', tensileLimit: '580 MPa', elongation: '11.2%', standard: 'ASTM A615 Grade 40', status: 'QC RETEST' }
  ];

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-extrabold text-slate-900">Tensile Strength Certifications</h2>
        <p className="text-[11px] text-slate-500">Conduct mechanical strength audits, yield point limits tests, and elongation checks.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              <th className={tableCellPadding}>Audit ID</th>
              <th className={tableCellPadding}>Billet Batch</th>
              <th className={tableCellPadding}>Yield Point (Re)</th>
              <th className={tableCellPadding}>Tensile Strength (Rm)</th>
              <th className={tableCellPadding}>Elongation (A5)</th>
              <th className={tableCellPadding}>Test Standard</th>
              <th className={`${tableCellPadding} text-center`}>Release Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
            {tensileTests.map((t, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50">
                <td className={`${tableCellPadding} text-indigo-600 font-mono font-bold`}>{t.testId}</td>
                <td className={`${tableCellPadding} font-mono`}>{t.batchId}</td>
                <td className={`${tableCellPadding} font-mono`}>{t.yieldPoint}</td>
                <td className={`${tableCellPadding} font-mono`}>{t.tensileLimit}</td>
                <td className={`${tableCellPadding} font-mono`}>{t.elongation}</td>
                <td className={tableCellPadding}>{t.standard}</td>
                <td className={`${tableCellPadding} text-center`}>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold font-mono border uppercase ${
                    t.status === 'CERTIFIED' ? 'bg-emerald-50 text-emerald-600 border-emerald-250/20' : 'bg-amber-50 text-amber-600 border-amber-250/20'
                  }`}>
                    {t.status}
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
