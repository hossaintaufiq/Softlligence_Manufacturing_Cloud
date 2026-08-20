'use client';
import React from 'react';
import { useAuth } from '@/context/AuthContext';

export default function StoreRatingsPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';
  const tableCellPadding = isCompact ? 'px-4 py-2.5 text-[11px]' : 'px-6 py-4 text-xs';

  const reviews = [
    { customer: 'Alice Baker', score: '⭐⭐⭐⭐⭐ 5.0', comment: 'Extremely fast shipping! The linen shirts were outstanding quality.', date: '2026-08-18', sentiment: 'POSITIVE' },
    { customer: 'John Miller', score: '⭐⭐⭐⭐⭐ 5.0', comment: 'Excellent storefront support. Return policy is simple.', date: '2026-08-19', sentiment: 'POSITIVE' },
    { customer: 'David Vance', score: '⭐⭐⭐ 3.0', comment: 'Catalog choice was clean, but checkout lines took 10 minutes.', date: '2026-08-20', sentiment: 'NEUTRAL' }
  ];

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-extrabold text-slate-900">Customer Ratings & Reviews Ledger</h2>
        <p className="text-[11px] text-slate-500">Audit customer feedback stars, comments, review dates, and automatic sentiment scores.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              <th className={tableCellPadding}>Customer</th>
              <th className={tableCellPadding}>Feedback Star Rating</th>
              <th className={tableCellPadding}>Review Comment Memos</th>
              <th className={tableCellPadding}>Assigned Date</th>
              <th className={`${tableCellPadding} text-center`}>Sentiment Class</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
            {reviews.map((r, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50">
                <td className={`${tableCellPadding} text-slate-900 font-bold`}>{r.customer}</td>
                <td className={`${tableCellPadding} font-mono font-bold text-slate-900`}>{r.score}</td>
                <td className={tableCellPadding}>{r.comment}</td>
                <td className={`${tableCellPadding} text-slate-500 font-mono`}>{r.date}</td>
                <td className={`${tableCellPadding} text-center`}>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold font-mono border uppercase ${
                    r.sentiment === 'POSITIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-250/20' : 'bg-amber-50 text-amber-600 border-amber-250/20'
                  }`}>
                    {r.sentiment}
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
