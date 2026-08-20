'use client';
import React from 'react';
import { useAuth } from '@/context/AuthContext';

export default function WeighbridgePage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';
  const tableCellPadding = isCompact ? 'px-4 py-2.5 text-[11px]' : 'px-6 py-4 text-xs';

  const truckLogs = [
    { ticketNo: 'TKT-2026-0091', plateNo: 'TX-492-AA', material: 'Heavy Melting Scrap', gross: '42.5 Tons', tare: '12.2 Tons', net: '30.3 Tons', carrier: 'Steel logistics Ltd', time: '14:21' },
    { ticketNo: 'TKT-2026-0092', plateNo: 'CA-102-ZX', material: 'Bulk Sintering Coke', gross: '38.0 Tons', tare: '11.8 Tons', net: '26.2 Tons', carrier: 'Apex Carriers', time: '14:38' },
    { ticketNo: 'TKT-2026-0093', plateNo: 'NY-882-BC', material: 'Finished Deformed Rebars', gross: '45.2 Tons', tare: '12.0 Tons', net: '33.2 Tons', carrier: 'SMC Logistics', time: '14:52' }
  ];

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-extrabold text-slate-900">Weighbridge Gate Truck Logs</h2>
        <p className="text-[11px] text-slate-500">Track raw alloy inputs weigh-ins, finished coils dispatch, and carrier records.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              <th className={tableCellPadding}>Ticket No</th>
              <th className={tableCellPadding}>Truck Plate</th>
              <th className={tableCellPadding}>Material Class</th>
              <th className={tableCellPadding}>Gross Weight</th>
              <th className={tableCellPadding}>Tare weight</th>
              <th className={tableCellPadding}>Net Payload</th>
              <th className={tableCellPadding}>Carrier Driver</th>
              <th className={tableCellPadding}>Weigh-in Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
            {truckLogs.map((truck, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50">
                <td className={`${tableCellPadding} text-orange-600 font-mono font-bold`}>{truck.ticketNo}</td>
                <td className={`${tableCellPadding} font-mono`}>{truck.plateNo}</td>
                <td className={`${tableCellPadding} text-slate-900 font-bold`}>{truck.material}</td>
                <td className={`${tableCellPadding} font-mono`}>{truck.gross}</td>
                <td className={`${tableCellPadding} font-mono`}>{truck.tare}</td>
                <td className={`${tableCellPadding} font-mono text-emerald-650 font-bold`}>{truck.net}</td>
                <td className={tableCellPadding}>{truck.carrier}</td>
                <td className={`${tableCellPadding} text-slate-500 font-mono`}>{truck.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
