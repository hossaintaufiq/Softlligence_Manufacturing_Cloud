'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';

export default function LocalOverviewPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';
  const gridGap = isCompact ? 'gap-3.5' : 'gap-4 sm:gap-6';

  const businessMetrics = [
    { category: 'Ready Apparel Store sales', share: 45, value: 2439, color: 'bg-emerald-500' },
    { category: 'Customer Footwear & Accessories', share: 30, value: 1626, color: 'bg-[#C5A059]' },
    { category: 'Home Textile Decors', share: 25, value: 1355, color: 'bg-indigo-500' }
  ];

  const salesLedger = [
    { ref: 'TRX-2026-9921', customer: 'John Miller', amt: 120.50, status: 'Completed', time: '14:21' },
    { ref: 'TRX-2026-9922', customer: 'Alice Baker', amt: 42.00, status: 'Completed', time: '14:38' },
    { ref: 'TRX-2026-9923', customer: 'David Vance', amt: 285.00, status: 'Processing', time: '14:52' }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in text-slate-800">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 21V9l-7-4-7 4v12M22 21h-2M4 21H2m10-7h.01M16 11h.01M16 16h.01M8 11h.01M8 16h.01" />
            </svg>
            <span>Store Dashboard</span>
          </h1>
          <p className="text-xs text-slate-450 mt-1">Real-time storefront checkout volume and customer traffic analysis.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 ${gridGap}`}>
        <div className="bg-white border border-slate-200/85 p-5 rounded-2xl shadow-sm hover:border-[#C5A059]/30 transition-all flex flex-col justify-between h-32 group">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Daily Store Sales</p>
            <span className="text-emerald-600 bg-emerald-50 p-1.5 rounded-lg">💰</span>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-955 font-mono leading-none">$5,420</h3>
            <p className="text-[9px] text-emerald-600 font-bold font-mono mt-2.5">📈 +14.2% VS YESTERDAY</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/85 p-5 rounded-2xl shadow-sm hover:border-[#C5A059]/30 transition-all flex flex-col justify-between h-32 group">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Store Foot Traffic</p>
            <span className="text-[#C5A059] bg-[#FAF6EE] p-1.5 rounded-lg">👥</span>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-955 font-mono leading-none">342 Visitors</h3>
            <p className="text-[9px] text-slate-400 font-bold font-mono mt-2.5">PEAK DURATION: 14:00 - 16:00</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/85 p-5 rounded-2xl shadow-sm hover:border-[#C5A059]/30 transition-all flex flex-col justify-between h-32 group">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Active Products</p>
            <span className="text-indigo-600 bg-indigo-50 p-1.5 rounded-lg">🏷️</span>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-955 font-mono leading-none">85 SKUs</h3>
            <p className="text-[9px] text-slate-450 font-bold font-mono mt-2.5">FULL CATALOG IN STOCK</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/85 p-5 rounded-2xl shadow-sm hover:border-[#C5A059]/30 transition-all flex flex-col justify-between h-32 group">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Feedback Rating</p>
            <span className="text-amber-500 bg-amber-50 p-1.5 rounded-lg">⭐</span>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-955 font-mono leading-none">4.85 / 5.00</h3>
            <p className="text-[9px] text-emerald-600 font-bold font-mono mt-2.5">✓ EXCELLENT LOCAL REVIEWS</p>
          </div>
        </div>
      </div>

      {/* Split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono border-b border-slate-100 pb-3">Daily Retail Transactions</h3>
            <div className="space-y-3.5">
              {salesLedger.map((trx, idx) => (
                <div key={idx} className="flex items-start justify-between border-b border-slate-50 pb-2.5 last:border-0 last:pb-0">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{trx.customer}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{trx.ref} • Time: {trx.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-extrabold text-slate-900 font-mono">${trx.amt.toFixed(2)}</p>
                    <span className="text-[8px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-1.5 py-0.2 rounded font-bold font-mono uppercase">{trx.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono border-b border-slate-100 pb-3">Hourly Visitor Curve</h3>
            <svg className="w-full h-32" viewBox="0 0 500 100" preserveAspectRatio="none">
              <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="#f1f5f9" strokeWidth="1" />
              <path d="M 0,100 L 0,90 L 80,80 L 160,40 L 240,20 L 320,15 L 400,60 L 480,85 L 500,85 L 500,100 Z" fill="url(#localGradient)" />
              <path d="M 0,90 L 80,80 L 160,40 L 240,20 L 320,15 L 400,60 L 480,85 L 500,85" fill="none" stroke="#C5A059" strokeWidth="2.5" strokeLinecap="round" />
              <defs>
                <linearGradient id="localGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C5A059" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#FAF6EE" stopOpacity="0.02" />
                </linearGradient>
              </defs>
            </svg>
            <div className="flex justify-between text-[8px] font-bold text-slate-400 font-mono pt-2 px-1">
              <span>08:00 (12)</span>
              <span>10:00 (45)</span>
              <span>12:00 (150)</span>
              <span>14:00 (230)</span>
              <span>16:00 (280)</span>
              <span>18:00 (120)</span>
              <span>20:00 (45)</span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono border-b border-slate-100 pb-3">Best Selling Categories</h4>
            <div className="space-y-4 pt-1">
              {businessMetrics.map((cat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-900 truncate">{cat.category}</span>
                    <span className="font-mono text-slate-850 font-bold">${cat.value.toLocaleString()} ({cat.share}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${cat.color}`} style={{ width: `${cat.share}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
