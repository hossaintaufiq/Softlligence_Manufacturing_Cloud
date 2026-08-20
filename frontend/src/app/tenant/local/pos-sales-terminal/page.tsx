'use client';
import React from 'react';
import { useAuth } from '@/context/AuthContext';

export default function PosTerminalPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';
  const tableCellPadding = isCompact ? 'px-4 py-2.5 text-[11px]' : 'px-6 py-4 text-xs';

  const terminals = [
    { lane: 'Register Lane 1 (Cashier)', operator: 'Sarah Jenkins', drawerCash: '$450.50', cardTotal: '$1,280.00', count: 42, status: 'OPEN', color: 'bg-emerald-50 text-emerald-600 border-emerald-500/20' },
    { lane: 'Register Lane 2 (Self-Checkout)', operator: 'Automated POS A', drawerCash: '$120.00', cardTotal: '$2,350.00', count: 85, status: 'OPEN', color: 'bg-emerald-50 text-emerald-600 border-emerald-500/20' },
    { lane: 'Register Lane 3 (Customer Service)', operator: 'David Miller', drawerCash: '$850.00', cardTotal: '$420.00', count: 12, status: 'LOCKED', color: 'bg-slate-100 text-slate-500 border-slate-200' }
  ];

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-extrabold text-slate-900">POS Checkout Registers</h2>
        <p className="text-[11px] text-slate-500">Monitor active cashier registers, cash drawer balances, and checkout quantities.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              <th className={tableCellPadding}>Register Terminal</th>
              <th className={tableCellPadding}>Logged Cashier</th>
              <th className={tableCellPadding}>Drawer Cash Balance</th>
              <th className={tableCellPadding}>Card Payments</th>
              <th className={tableCellPadding}>Trans count</th>
              <th className={`${tableCellPadding} text-center`}>Register Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
            {terminals.map((t, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50">
                <td className={`${tableCellPadding} text-slate-900 font-bold`}>{t.lane}</td>
                <td className={tableCellPadding}>{t.operator}</td>
                <td className={`${tableCellPadding} font-mono font-bold text-slate-850`}>{t.drawerCash}</td>
                <td className={`${tableCellPadding} font-mono text-emerald-650 font-bold`}>{t.cardTotal}</td>
                <td className={`${tableCellPadding} font-mono`}>{t.count} orders</td>
                <td className={`${tableCellPadding} text-center`}>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold font-mono border uppercase ` + t.color}>
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
