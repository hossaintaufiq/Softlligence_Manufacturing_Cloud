'use client';
import React from 'react';
import { useAuth } from '@/context/AuthContext';

export default function CustomerCRMPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';
  const tableCellPadding = isCompact ? 'px-4 py-2.5 text-[11px]' : 'px-6 py-4 text-xs';

  const customers = [
    { name: 'Sarah Jenkins', email: 'sarah@gmail.com', phone: '+1 555-0192', points: '1,250 pts', tier: 'VIP MEMBER', since: '2025-04-12' },
    { name: 'John Miller', email: 'john.miller@yahoo.com', phone: '+1 555-3891', points: '420 pts', tier: 'GOLD STANDARD', since: '2025-08-15' },
    { name: 'Robert Vance', email: 'rvance@vance.com', phone: '+1 555-8821', points: '80 pts', tier: 'REGISTERED MEMBER', since: '2026-02-18' }
  ];

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-extrabold text-slate-900">Customer Loyalty (CRM) Profiles</h2>
        <p className="text-[11px] text-slate-500">Oversee customer directory, accumulated loyalty points, and tier metrics.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              <th className={tableCellPadding}>Customer Name</th>
              <th className={tableCellPadding}>Email Address</th>
              <th className={tableCellPadding}>Contact Phone</th>
              <th className={tableCellPadding}>Loyalty Points</th>
              <th className={tableCellPadding}>Membership Tier</th>
              <th className={tableCellPadding}>Enrollment Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
            {customers.map((c, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50">
                <td className={`${tableCellPadding} text-slate-900 font-bold`}>{c.name}</td>
                <td className={tableCellPadding}>{c.email}</td>
                <td className={`${tableCellPadding} font-mono`}>{c.phone}</td>
                <td className={`${tableCellPadding} font-mono font-bold text-slate-850`}>{c.points}</td>
                <td className={tableCellPadding}>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase font-mono ${
                    c.tier.includes('VIP') ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' : 'bg-slate-100 text-slate-650'
                  }`}>
                    {c.tier}
                  </span>
                </td>
                <td className={`${tableCellPadding} text-slate-500 font-mono`}>{c.since}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
