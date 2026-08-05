'use client';

import React, { useState, useEffect } from 'react';

type BinItem = {
  id: string;
  binCode: string;
  warehouseName: string;
  zone: string;
  capacityKg: number;
  currentKg: number;
  utilizationPct: number;
  allowedGradeCategory?: string;
};

export function BinLocationPanel() {
  const [bins, setBins] = useState<BinItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBins();
  }, []);

  const loadBins = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/wms/bins', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setBins(data.bins || []);
      }
    } catch {}
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">🏢 Multi-Bin Warehouse Management & Capacity Balances</h3>
          <p className="text-xs text-slate-500 mt-0.5">Bin location utilization, putaway rules, and rack level capacity allocation.</p>
        </div>

        <button
          onClick={loadBins}
          className="px-3.5 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-xs"
        >
          Refresh Bins
        </button>
      </div>

      {loading ? (
        <p className="text-xs text-slate-400">Loading warehouse bins...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {bins.map((b) => {
            const barColor = b.utilizationPct > 75 ? 'bg-amber-500' : 'bg-indigo-600';
            return (
              <div key={b.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] text-slate-400 font-bold uppercase">{b.zone}</span>
                    <h4 className="text-sm font-bold text-slate-900 font-mono">{b.binCode}</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                    {b.utilizationPct}% Full
                  </span>
                </div>

                <p className="text-xs text-slate-500 font-medium">{b.warehouseName}</p>

                {b.allowedGradeCategory && (
                  <p className="text-[11px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-semibold truncate">
                    {b.allowedGradeCategory}
                  </p>
                )}

                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px] font-mono text-slate-600">
                    <span>{b.currentKg.toLocaleString()} kg</span>
                    <span className="text-slate-400">Cap: {b.capacityKg.toLocaleString()} kg</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div style={{ width: `${b.utilizationPct}%` }} className={`h-full ${barColor} rounded-full`}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
