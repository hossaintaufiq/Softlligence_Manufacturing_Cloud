'use client';
import React from 'react';
export default function CampaignsPage() {
  return (
    <div className="space-y-5 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-extrabold text-slate-900">Campaigns & Coupon Promos</h2>
        <p className="text-[11px] text-slate-500">Launch marketing campaigns and manage store discount codes.</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs text-xs font-mono text-slate-500">
        ðŸŽ« Active Promo: SUMMER26 (15% Off store catalog) - 240 redemptions.
      </div>
    </div>
  );
}
