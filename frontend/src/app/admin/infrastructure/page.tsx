'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';

export default function InfrastructurePage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';
  const gridGap = isCompact ? 'gap-3.5' : 'gap-4 sm:gap-6';

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-3">
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-mono">API Load Balancer Status</h3>
        <p className="text-xs text-slate-500 mt-0.5">Real-time performance metrics of the Softlligence Gateway Cluster.</p>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 ${gridGap}`}>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-sm">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">Node load levels</h4>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
            <div className="w-[45%] bg-[#C5A059] h-full" title="Node A" />
            <div className="w-[30%] bg-[#B48F48] h-full" title="Node B" />
            <div className="w-[15%] bg-slate-350 h-full" title="Node C" />
          </div>
          <div className="grid grid-cols-3 gap-2.5 text-xs text-slate-600">
            <div>
              <p className="text-[8px] font-bold text-slate-400 tracking-widest font-mono">Node A</p>
              <p className="font-extrabold text-slate-900 mt-0.5">45%</p>
            </div>
            <div>
              <p className="text-[8px] font-bold text-slate-400 tracking-widest font-mono">Node B</p>
              <p className="font-extrabold text-slate-900 mt-0.5">30%</p>
            </div>
            <div>
              <p className="text-[8px] font-bold text-slate-400 tracking-widest font-mono">Node C</p>
              <p className="font-extrabold text-slate-900 mt-0.5">15%</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-sm flex flex-col justify-between">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">SLA & Latency</h4>
          <div className="flex items-center justify-between text-xs gap-3">
            <span className="text-slate-500 font-medium">Gateway Latency</span>
            <span className="font-extrabold text-[#B48F48] font-mono">14ms (Optimal)</span>
          </div>
          <div className="flex items-center justify-between text-xs gap-3">
            <span className="text-slate-500 font-medium">Monthly SLA target</span>
            <span className="font-extrabold text-emerald-600 font-mono">99.99%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
