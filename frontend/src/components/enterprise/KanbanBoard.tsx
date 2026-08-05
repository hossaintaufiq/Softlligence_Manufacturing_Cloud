'use client';

import React, { useState } from 'react';

export type WorkOrderKanbanItem = {
  id: string;
  docNo: string;
  itemCode: string;
  itemName: string;
  qtyPlanned: number;
  qtyCompleted: number;
  status: 'draft' | 'released' | 'in_progress' | 'completed';
  priority: number; // 1 = low, 2 = normal, 3 = high
  plannedStart?: string;
  machineName?: string;
  hasDowntimeAlert?: boolean;
  downtimeReason?: string;
};

type KanbanBoardProps = {
  items: WorkOrderKanbanItem[];
  onStatusChange?: (id: string, newStatus: 'draft' | 'released' | 'in_progress' | 'completed') => void;
  onItemClick?: (item: WorkOrderKanbanItem) => void;
};

export function KanbanBoard({ items: initialItems, onStatusChange, onItemClick }: KanbanBoardProps) {
  const [items, setItems] = useState<WorkOrderKanbanItem[]>(initialItems);

  const columns: { key: 'draft' | 'released' | 'in_progress' | 'completed'; title: string; color: string; bg: string }[] = [
    { key: 'draft', title: 'Draft', color: 'border-slate-400 text-slate-700 dark:text-slate-300', bg: 'bg-slate-50 dark:bg-slate-900/50' },
    { key: 'released', title: 'Released / Scheduled', color: 'border-blue-500 text-blue-700 dark:text-blue-300', bg: 'bg-blue-50/40 dark:bg-blue-950/20' },
    { key: 'in_progress', title: 'In Production', color: 'border-amber-500 text-amber-700 dark:text-amber-300', bg: 'bg-amber-50/40 dark:bg-amber-950/20' },
    { key: 'completed', title: 'Completed', color: 'border-emerald-500 text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50/40 dark:bg-emerald-950/20' },
  ];

  const moveStatus = (id: string, newStatus: 'draft' | 'released' | 'in_progress' | 'completed') => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    if (onStatusChange) onStatusChange(id, newStatus);
  };

  const getPriorityBadge = (priority: number) => {
    if (priority >= 3) {
      return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">HIGH</span>;
    }
    if (priority === 2) {
      return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">NORMAL</span>;
    }
    return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">LOW</span>;
  };

  return (
    <div className="space-y-4">
      {/* Downtime Alert Banner Overlay */}
      {items.some((i) => i.hasDowntimeAlert) && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
          <div className="flex items-center space-x-2">
            <span className="animate-ping w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="font-bold">Machine Downtime Overlay Active:</span>
            <span>
              {items
                .filter((i) => i.hasDowntimeAlert)
                .map((i) => `${i.machineName || 'Machine'}: ${i.downtimeReason || 'Downtime'}`)
                .join(' | ')}
            </span>
          </div>
          <span className="font-mono text-[10px] bg-amber-500/20 px-2 py-0.5 rounded">REAL-TIME OEE FEED</span>
        </div>
      )}

      {/* Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colItems = items.filter((i) => i.status === col.key);
          return (
            <div
              key={col.key}
              className={`rounded-xl border border-slate-200 dark:border-slate-800 p-3 flex flex-col ${col.bg} min-h-[450px]`}
            >
              {/* Column Header */}
              <div className={`flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 ${col.color}`}>
                <h4 className="text-xs font-bold uppercase tracking-wider">{col.title}</h4>
                <span className="w-5 h-5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-mono font-bold flex items-center justify-center text-slate-800 dark:text-slate-200">
                  {colItems.length}
                </span>
              </div>

              {/* Column Cards Container */}
              <div className="flex-1 mt-3 space-y-3 overflow-y-auto">
                {colItems.length === 0 ? (
                  <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-slate-400 text-xs italic">
                    No Work Orders
                  </div>
                ) : (
                  colItems.map((item) => {
                    const progress = Math.min(100, Math.round((item.qtyCompleted / Math.max(1, item.qtyPlanned)) * 100));
                    return (
                      <div
                        key={item.id}
                        onClick={() => onItemClick && onItemClick(item)}
                        className={`bg-white dark:bg-slate-900 border ${
                          item.hasDowntimeAlert ? 'border-amber-500 dark:border-amber-500 shadow-amber-500/10' : 'border-slate-200 dark:border-slate-800'
                        } rounded-lg p-3.5 shadow-xs hover:shadow-md transition-all group space-y-2.5 cursor-pointer`}
                      >
                        {/* Card Top: DocNo + Priority */}
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            {item.docNo}
                          </span>
                          {getPriorityBadge(item.priority)}
                        </div>

                        {/* Card Body: Item Title */}
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {item.itemName}
                          </p>
                          <p className="text-[11px] font-mono text-slate-400 mt-0.5">Code: {item.itemCode}</p>
                        </div>

                        {/* Machine Overlay & Downtime warning */}
                        {item.hasDowntimeAlert && (
                          <div className="p-1.5 rounded bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-[10px] text-amber-800 dark:text-amber-300 font-medium flex items-center space-x-1">
                            <span>⚠️ {item.machineName}: {item.downtimeReason}</span>
                          </div>
                        )}

                        {/* Progress Bar */}
                        <div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mb-1">
                            <span>Qty: {item.qtyCompleted} / {item.qtyPlanned}</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                progress === 100 ? 'bg-emerald-500' : progress > 50 ? 'bg-indigo-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Card Actions: Advance / Revert Status Buttons */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                          {item.status !== 'draft' ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const prevStatus =
                                  item.status === 'completed'
                                    ? 'in_progress'
                                    : item.status === 'in_progress'
                                    ? 'released'
                                    : 'draft';
                                moveStatus(item.id, prevStatus);
                              }}
                              className="hover:text-slate-700 dark:hover:text-slate-200 font-semibold"
                            >
                              ← Revert
                            </button>
                          ) : (
                            <span></span>
                          )}

                          {item.status !== 'completed' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const nextStatus =
                                  item.status === 'draft'
                                    ? 'released'
                                    : item.status === 'released'
                                    ? 'in_progress'
                                    : 'completed';
                                moveStatus(item.id, nextStatus);
                              }}
                              className="hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-indigo-600 dark:text-indigo-400"
                            >
                              Advance →
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
