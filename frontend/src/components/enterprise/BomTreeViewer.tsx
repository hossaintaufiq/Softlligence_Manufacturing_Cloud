'use client';

import React, { useState } from 'react';

export type BomComponentNode = {
  id: string;
  itemCode: string;
  itemName: string;
  qty: number;
  uom: string;
  scrapPercent: number;
  sequence: number;
  children?: BomComponentNode[];
};

export type BomHeaderData = {
  id: string;
  parentItemCode: string;
  parentItemName: string;
  version: string;
  isActive: boolean;
  components: BomComponentNode[];
};

type BomTreeViewerProps = {
  bom: BomHeaderData;
  targetQuantity?: number;
};

function TreeNode({
  node,
  level = 0,
  targetQuantity = 1,
}: {
  node: BomComponentNode;
  level?: number;
  targetQuantity?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const totalRequired = (node.qty * targetQuantity * (1 + node.scrapPercent / 100)).toFixed(3);

  return (
    <div className="space-y-1">
      <div
        className={`flex flex-wrap items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all`}
        style={{ marginLeft: `${level * 1.5}rem` }}
      >
        <div className="flex items-center space-x-2">
          {hasChildren ? (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center justify-center hover:bg-slate-200"
            >
              {isExpanded ? '−' : '+'}
            </button>
          ) : (
            <span className="w-5 h-5 flex items-center justify-center text-slate-300 dark:text-slate-700 text-xs">└</span>
          )}

          <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{node.itemCode}</span>
          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{node.itemName}</span>
        </div>

        <div className="flex items-center space-x-4 text-xs">
          <span className="text-slate-500">
            Seq: <strong className="font-mono">{node.sequence}</strong>
          </span>
          <span className="text-slate-500">
            Per Unit Qty: <strong className="font-mono text-slate-900 dark:text-slate-100">{node.qty} {node.uom}</strong>
          </span>
          {node.scrapPercent > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
              Scrap: +{node.scrapPercent}%
            </span>
          )}
          <span className="font-mono font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            Required: {totalRequired} {node.uom}
          </span>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="space-y-1">
          {node.children!.map((childNode) => (
            <TreeNode key={childNode.id} node={childNode} level={level + 1} targetQuantity={targetQuantity} />
          ))}
        </div>
      )}
    </div>
  );
}

export function BomTreeViewer({ bom, targetQuantity: initialTargetQty = 1 }: BomTreeViewerProps) {
  const [targetQty, setTargetQty] = useState(initialTargetQty);

  return (
    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4">
      {/* BOM Header Summary */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 text-xs font-mono font-bold bg-indigo-600 text-white rounded">
              BOM {bom.version}
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {bom.parentItemName} <span className="font-mono text-xs text-slate-400">({bom.parentItemCode})</span>
            </h3>
            {bom.isActive && (
              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-900">
                ACTIVE
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Multi-level hierarchy Bill of Materials explosion with scrap loss calculations.
          </p>
        </div>

        {/* Target Quantity Explosion Calculator */}
        <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Explode for Output Qty:</label>
          <input
            type="number"
            min="1"
            value={targetQty}
            onChange={(e) => setTargetQty(Math.max(1, Number(e.target.value)))}
            className="w-20 px-2 py-1 text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded focus:outline-none"
          />
        </div>
      </div>

      {/* Component Nodes Explosion Tree */}
      <div className="space-y-2">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Components Breakdown Tree</p>
        {bom.components.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No component lines configured for this BOM.</p>
        ) : (
          bom.components.map((comp) => (
            <TreeNode key={comp.id} node={comp} level={0} targetQuantity={targetQty} />
          ))
        )}
      </div>
    </div>
  );
}
