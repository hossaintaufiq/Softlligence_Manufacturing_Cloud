'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';

type CommercialContract = {
  lcNo: string;
  buyer: string;
  contractVal: number;
  lcStatus: string;
  customsClearance: string;
  shipmentPort: string;
};

export default function CommercialPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';
  const tableCellPadding = isCompact ? 'px-4 py-2 text-[11px]' : 'px-6 py-3.5 text-xs';
  const tableHeaderPadding = isCompact ? 'px-4 py-2.5 text-[8px]' : 'px-6 py-3.5 text-[9px]';

  const commercials: CommercialContract[] = [
    { lcNo: 'LC-2026-9921', buyer: 'Zara Group', contractVal: 185000, lcStatus: 'Fully Advised', customsClearance: 'Pending Gate II', shipmentPort: 'Port of Chittagong' },
    { lcNo: 'LC-2026-8802', buyer: 'Nordstrom', contractVal: 320000, lcStatus: 'Approved & Active', customsClearance: 'Passed Gate I', shipmentPort: 'Shanghai Port' }
  ];

  return (
    <div className="space-y-5 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-extrabold text-slate-900">Commercial Letters of Credit (LC) & Customs</h2>
        <p className="text-[11px] text-slate-500">Oversee active export banking contracts, custom clearance checkpoints, and shipping logistics.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/85 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                <th className={tableHeaderPadding}>LC Reference No</th>
                <th className={tableHeaderPadding}>Buyer / Client</th>
                <th className={`${tableHeaderPadding} text-right`}>LC Contract Value</th>
                <th className={tableHeaderPadding}>LC Advised Status</th>
                <th className={tableHeaderPadding}>Customs Clearance Gate</th>
                <th className={tableHeaderPadding}>Destination Port</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {commercials.map((lc, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className={`${tableCellPadding} text-indigo-600 font-mono font-bold`}>{lc.lcNo}</td>
                  <td className={`${tableCellPadding} text-slate-950 font-bold`}>{lc.buyer}</td>
                  <td className={`${tableCellPadding} text-right font-mono font-bold text-slate-950`}>${lc.contractVal.toLocaleString()}</td>
                  <td className={tableCellPadding}>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-250/20 rounded font-mono text-[9px] font-extrabold">
                      {lc.lcStatus}
                    </span>
                  </td>
                  <td className={`${tableCellPadding} font-mono text-amber-600`}>{lc.customsClearance}</td>
                  <td className={`${tableCellPadding} text-slate-500 font-medium`}>{lc.shipmentPort}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
