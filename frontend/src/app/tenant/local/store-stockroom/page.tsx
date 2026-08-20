'use client';
import React from 'react';
import { useAuth } from '@/context/AuthContext';

export default function StockroomPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';
  const tableCellPadding = isCompact ? 'px-4 py-2.5 text-[11px]' : 'px-6 py-4 text-xs';

  const stockroomLogs = [
    { sku: 'SKU-APP-1001', category: 'Ready Apparel', aisle: 'Aisle B - Rack 3', current: 450, trigger: 100, status: 'OPTIMAL' },
    { sku: 'SKU-FOT-2004', category: 'Footwear & Boots', aisle: 'Aisle C - Rack 1', current: 120, trigger: 150, status: 'RESTOCK SOON' },
    { sku: 'SKU-TEX-5002', category: 'Home Textile Decors', aisle: 'Aisle A - Rack 2', current: 280, trigger: 50, status: 'OPTIMAL' }
  ];

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-extrabold text-slate-900">Stockroom Storage Registry</h2>
        <p className="text-[11px] text-slate-500">Perform stockroom audits, check storage rack locations, and review restock triggers.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              <th className={tableCellPadding}>SKU ID</th>
              <th className={tableCellPadding}>Category</th>
              <th className={tableCellPadding}>Aisle Location</th>
              <th className={tableCellPadding}>Current Stock</th>
              <th className={tableCellPadding}>Restock Threshold</th>
              <th className={`${tableCellPadding} text-center`}>Capacity State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
            {stockroomLogs.map((log, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50">
                <td className={`${tableCellPadding} text-indigo-650 font-mono font-bold`}>{log.sku}</td>
                <td className={tableCellPadding}>{log.category}</td>
                <td className={tableCellPadding}>{log.aisle}</td>
                <td className={`${tableCellPadding} font-mono font-bold text-slate-850`}>{log.current} units</td>
                <td className={`${tableCellPadding} font-mono text-slate-450`}>{log.trigger} units</td>
                <td className={`${tableCellPadding} text-center`}>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold font-mono border uppercase ${
                    log.status === 'OPTIMAL' ? 'bg-emerald-50 text-emerald-600 border-emerald-250/20' : 'bg-amber-50 text-amber-600 border-amber-250/20'
                  }`}>
                    {log.status}
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
