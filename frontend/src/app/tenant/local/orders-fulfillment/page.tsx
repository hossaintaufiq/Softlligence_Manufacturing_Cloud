'use client';
import React from 'react';
import { useAuth } from '@/context/AuthContext';

export default function OrdersFulfillmentPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';
  const tableCellPadding = isCompact ? 'px-4 py-2.5 text-[11px]' : 'px-6 py-4 text-xs';

  const orderShipments = [
    { orderId: 'ORD-2026-9921', customer: 'Alice Baker', carrier: 'FedEx SmartPost', tracking: 'FX-39029-A', amount: '$120.50', status: 'IN TRANSIT' },
    { orderId: 'ORD-2026-9922', customer: 'John Miller', carrier: 'Local Courier Service', tracking: 'LCS-889', amount: '$42.00', status: 'DELIVERED' },
    { orderId: 'ORD-2026-9923', customer: 'Robert Vance', carrier: 'DHL Express', tracking: 'DHL-48902', amount: '$285.00', status: 'DISPATCHED' }
  ];

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-extrabold text-slate-900">E-Commerce & Retail Deliveries</h2>
        <p className="text-[11px] text-slate-500">Oversee customer local deliveries, courier tracking numbers, and fulfillment invoice volumes.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              <th className={tableCellPadding}>Order Ref ID</th>
              <th className={tableCellPadding}>Client Name</th>
              <th className={tableCellPadding}>Delivery Carrier</th>
              <th className={tableCellPadding}>Tracking Reference</th>
              <th className={tableCellPadding}>Total Amount</th>
              <th className={`${tableCellPadding} text-center`}>Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
            {orderShipments.map((order, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50">
                <td className={`${tableCellPadding} text-indigo-650 font-mono font-bold`}>{order.orderId}</td>
                <td className={`${tableCellPadding} text-slate-900 font-bold`}>{order.customer}</td>
                <td className={tableCellPadding}>{order.carrier}</td>
                <td className={`${tableCellPadding} font-mono text-slate-500`}>{order.tracking}</td>
                <td className={`${tableCellPadding} font-mono font-bold text-slate-950`}>{order.amount}</td>
                <td className={`${tableCellPadding} text-center`}>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold font-mono border uppercase ${
                    order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600 border-emerald-250/20' : 'bg-amber-50 text-amber-600 border-amber-250/20'
                  }`}>
                    {order.status}
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
