'use client';

import React, { useState, useEffect } from 'react';

type LotGenealogyNode = {
  lotNo: string;
  itemCode: string;
  itemName: string;
  qty: number;
  uom: string;
  supplierName?: string;
  heatNoRef?: string;
  producedAt: string;
  children?: LotGenealogyNode[];
};

export function LotGenealogyViewer() {
  const [searchLotNo, setSearchLotNo] = useState('LOT-2026-8891');
  const [genealogy, setGenealogy] = useState<LotGenealogyNode | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGenealogy();
  }, []);

  const loadGenealogy = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/wms/traceability?lotNo=${searchLotNo}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setGenealogy(data.genealogy);
      }
    } catch {}
    setLoading(false);
  };

  const handlePrintBarcode = (node: LotGenealogyNode) => {
    alert(`[PRINT BARCODE] Printing 2D DataMatrix Label for Lot #${node.lotNo} (${node.itemCode} - Qty: ${node.qty} ${node.uom})`);
  };

  const renderNode = (node: LotGenealogyNode, depth = 0) => {
    return (
      <div key={node.lotNo} style={{ marginLeft: `${depth * 24}px` }} className="space-y-2 my-3">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2 max-w-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              <span className="font-mono font-bold text-sm text-indigo-600">{node.lotNo}</span>
              {node.heatNoRef && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                  Heat: {node.heatNoRef}
                </span>
              )}
            </div>
            <button
              onClick={() => handlePrintBarcode(node)}
              className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200 transition-colors"
            >
              🖨️ Print Label
            </button>
          </div>

          <div className="text-xs font-semibold text-slate-800">
            {node.itemCode} — {node.itemName}
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-500 pt-1 border-t border-slate-100">
            <span>Quantity: <strong className="text-slate-900">{node.qty.toLocaleString()} {node.uom}</strong></span>
            {node.supplierName && <span className="text-emerald-700 font-sans font-semibold">Supplier: {node.supplierName}</span>}
          </div>
        </div>

        {node.children && node.children.map((child) => renderNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">🌳 Serial & Batch Genealogy Traceability Tree</h3>
          <p className="text-xs text-slate-500 mt-0.5">Forward and backward material lineage from raw scrap to finished bundles.</p>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={searchLotNo}
            onChange={(e) => setSearchLotNo(e.target.value)}
            placeholder="Enter Lot or Heat No..."
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={loadGenealogy}
            className="px-3.5 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-xs"
          >
            Trace Lot
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-xs text-slate-400">Tracing lot genealogy tree...</p>
      ) : (
        genealogy && renderNode(genealogy)
      )}
    </div>
  );
}
