'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';

type PurchaseOrder = {
  poNo: string;
  supplier: string;
  rawMaterial: string;
  qty: number;
  uom: string;
  cost: number;
  status: string;
};

export default function ProcurementPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';
  const tableCellPadding = isCompact ? 'px-4 py-2 text-[11px]' : 'px-6 py-3.5 text-xs';
  const tableHeaderPadding = isCompact ? 'px-4 py-2.5 text-[8px]' : 'px-6 py-3.5 text-[9px]';

  const procurementPOs: PurchaseOrder[] = [
    { poNo: 'PO-YRN-001', supplier: 'Siam Spinner Co.', rawMaterial: 'Cotton Yarn (30s Combed)', qty: 15, uom: 'Tons', cost: 42000, status: 'In Transit' },
    { poNo: 'PO-FAB-012', supplier: 'Guangdong Knit Dye', rawMaterial: 'Elastane Blend Jersey Fabric', qty: 8500, uom: 'Kgs', cost: 38250, status: 'Received' },
    { poNo: 'PO-TRM-033', supplier: 'YKK Fasteners', rawMaterial: 'Concealed Metal Zippers 7in', qty: 20000, uom: 'Pcs', cost: 6400, status: 'Ordered' }
  ];

  return (
    <div className="space-y-5 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-extrabold text-slate-900">Procurement & Sourcing (POs)</h2>
        <p className="text-[11px] text-slate-500">Source raw materials, yarn lots, and accessories from global manufacturers.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/85 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                <th className={tableHeaderPadding}>PO No</th>
                <th className={tableHeaderPadding}>Supplier Vendor</th>
                <th className={tableHeaderPadding}>Material Details</th>
                <th className={`${tableHeaderPadding} text-right`}>Quantity</th>
                <th className={`${tableHeaderPadding} text-right`}>Contract Cost</th>
                <th className={`${tableHeaderPadding} text-center`}>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {procurementPOs.map((po, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className={`${tableCellPadding} text-indigo-600 font-mono font-bold`}>{po.poNo}</td>
                  <td className={`${tableCellPadding} text-slate-950 font-bold`}>{po.supplier}</td>
                  <td className={tableCellPadding}>{po.rawMaterial}</td>
                  <td className={`${tableCellPadding} text-right font-mono`}>{po.qty.toLocaleString()} {po.uom}</td>
                  <td className={`${tableCellPadding} text-right font-mono text-slate-950`}>${po.cost.toLocaleString()}</td>
                  <td className={`${tableCellPadding} text-center`}>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase font-mono tracking-wider ${
                      po.status === 'Received' ? 'bg-emerald-50 text-emerald-600 border border-emerald-500/20' : 'bg-amber-50 text-amber-600 border border-amber-500/20'
                    }`}>
                      {po.status}
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
