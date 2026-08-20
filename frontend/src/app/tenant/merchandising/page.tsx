'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';

type MerchStyle = {
  styleNo: string;
  buyer: string;
  item: string;
  qty: number;
  shipmentDate: string;
  status: string;
};

export default function MerchandisingPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';
  const tableCellPadding = isCompact ? 'px-4 py-2 text-[11px]' : 'px-6 py-3.5 text-xs';
  const tableHeaderPadding = isCompact ? 'px-4 py-2.5 text-[8px]' : 'px-6 py-3.5 text-[9px]';

  const merchStyles: MerchStyle[] = [
    { styleNo: 'STYLE-2026-A92', buyer: 'Zara Group', item: 'Pique Cotton Polo', qty: 25000, shipmentDate: '2026-09-12', status: 'In Sewing' },
    { styleNo: 'STYLE-2026-B12', buyer: 'Nordstrom', item: 'Crewneck Summer Tee', qty: 42000, shipmentDate: '2026-09-25', status: 'Fabric Sourced' },
    { styleNo: 'STYLE-2026-C04', buyer: 'H&M', item: 'Fleece Pullover Hoodie', qty: 18000, shipmentDate: '2026-10-05', status: 'Design Approved' },
    { styleNo: 'STYLE-2026-D88', buyer: 'Target Corp', item: 'Linen Shorts Set', qty: 35000, shipmentDate: '2026-10-18', status: 'Fabric Sourcing' }
  ];

  return (
    <div className="space-y-5 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-extrabold text-slate-900">Merchandising Orders Board</h2>
        <p className="text-[11px] text-slate-500">Oversee active apparel styles, client catalogs, and design parameters.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/85 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                <th className={tableHeaderPadding}>Style No</th>
                <th className={tableHeaderPadding}>Buyer / Client</th>
                <th className={tableHeaderPadding}>Garment Item</th>
                <th className={`${tableHeaderPadding} text-right`}>Ordered Qty</th>
                <th className={tableHeaderPadding}>Shipment Date</th>
                <th className={`${tableHeaderPadding} text-center`}>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {merchStyles.map((style, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className={`${tableCellPadding} text-indigo-600 font-mono font-bold`}>{style.styleNo}</td>
                  <td className={`${tableCellPadding} text-slate-900 font-bold`}>{style.buyer}</td>
                  <td className={tableCellPadding}>{style.item}</td>
                  <td className={`${tableCellPadding} text-right font-mono`}>{style.qty.toLocaleString()} Pcs</td>
                  <td className={`${tableCellPadding} text-slate-500 font-mono`}>{style.shipmentDate}</td>
                  <td className={`${tableCellPadding} text-center`}>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase font-mono tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-200/30">
                      {style.status}
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
