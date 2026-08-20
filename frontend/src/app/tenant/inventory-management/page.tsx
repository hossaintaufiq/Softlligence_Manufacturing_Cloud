'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';

type FabricStock = {
  itemId: string;
  name: string;
  type: string;
  qty: number;
  uom: string;
  loc: string;
};

export default function InventoryPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';
  const tableCellPadding = isCompact ? 'px-4 py-2 text-[11px]' : 'px-6 py-3.5 text-xs';
  const tableHeaderPadding = isCompact ? 'px-4 py-2.5 text-[8px]' : 'px-6 py-3.5 text-[9px]';

  const fabricStocks: FabricStock[] = [
    { itemId: 'FAB-001', name: 'Cotton Pique Knit (Navy)', type: 'Body Fabric', qty: 4500, uom: 'Kgs', loc: 'Warehouse A' },
    { itemId: 'FAB-002', name: 'Combed Cotton Jersey (White)', type: 'Body Fabric', qty: 8200, uom: 'Kgs', loc: 'Warehouse B' },
    { itemId: 'TRM-012', name: 'Polyester Sewing Thread (Grey)', type: 'Trims', qty: 1200, uom: 'Cones', loc: 'Trim Store' },
    { itemId: 'TRM-088', name: 'Acme Designer Buttons 12mm', type: 'Accessories', qty: 48000, uom: 'Pcs', loc: 'Trim Store' }
  ];

  return (
    <div className="space-y-5 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-extrabold text-slate-900">Inventory & Fabric Stock Ledger</h2>
        <p className="text-[11px] text-slate-500">Track physical raw fabric rolls, accessories, and trim bin locations.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/85 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                <th className={tableHeaderPadding}>Item ID</th>
                <th className={tableHeaderPadding}>Material Description</th>
                <th className={tableHeaderPadding}>Classification</th>
                <th className={`${tableHeaderPadding} text-right`}>Stock Balance</th>
                <th className={tableHeaderPadding}>Storage Bin Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {fabricStocks.map((stock, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className={`${tableCellPadding} text-indigo-600 font-mono font-bold`}>{stock.itemId}</td>
                  <td className={`${tableCellPadding} text-slate-950 font-bold`}>{stock.name}</td>
                  <td className={tableCellPadding}>{stock.type}</td>
                  <td className={`${tableCellPadding} text-right font-mono`}>{stock.qty.toLocaleString()} {stock.uom}</td>
                  <td className={`${tableCellPadding} font-mono text-[#B48F48]`}>{stock.loc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
