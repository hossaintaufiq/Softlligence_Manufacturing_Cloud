'use client';

import React from 'react';

type GanttTask = {
  id: string;
  machineName: string;
  workOrderNo: string;
  itemSpec: string;
  startHour: number; // 0 to 24
  durationHours: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED';
};

const mockTasks: GanttTask[] = [
  { id: 't1', machineName: 'Induction Furnace #1', workOrderNo: 'WO-2026-001', itemSpec: 'Melt Billet Grade 60', startHour: 6, durationHours: 6, status: 'COMPLETED' },
  { id: 't2', machineName: 'Induction Furnace #1', workOrderNo: 'WO-2026-003', itemSpec: 'Melt Billet Grade 40', startHour: 12, durationHours: 7, status: 'IN_PROGRESS' },
  { id: 't3', machineName: 'CCM Billet Caster', workOrderNo: 'WO-2026-001', itemSpec: '100x100mm Billets', startHour: 7, durationHours: 6, status: 'COMPLETED' },
  { id: 't4', machineName: 'Steel Rolling Mill Stand #1', workOrderNo: 'WO-2026-002', itemSpec: '12mm Rebar Bundles', startHour: 8, durationHours: 10, status: 'IN_PROGRESS' },
  { id: 't5', machineName: 'Cooling Bed & Shear', workOrderNo: 'WO-2026-002', itemSpec: 'Bundling & Tagging', startHour: 10, durationHours: 8, status: 'SCHEDULED' },
];

export function GanttScheduler() {
  const hours = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 11 PM

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">📅 Finite Capacity Gantt Workstation Scheduler</h3>
          <p className="text-xs text-slate-500 mt-0.5">Shop floor workstation loading timeline & machine queue visualizer.</p>
        </div>

        <div className="flex items-center space-x-4 text-xs font-semibold">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500"></span>
            <span className="text-slate-600">Completed</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-sm bg-indigo-600"></span>
            <span className="text-slate-600">In Production</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-sm bg-amber-400"></span>
            <span className="text-slate-600">Scheduled</span>
          </div>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[750px] space-y-4">
          {/* Header Hours Bar */}
          <div className="grid grid-cols-19 gap-1 text-[11px] font-mono text-slate-400 border-b border-slate-100 pb-2">
            <div className="col-span-4 font-sans font-bold text-slate-700">Workstation Machine</div>
            {hours.map((h) => (
              <div key={h} className="text-center">{h}:00</div>
            ))}
          </div>

          {/* Machine Rows */}
          {['Induction Furnace #1', 'CCM Billet Caster', 'Steel Rolling Mill Stand #1', 'Cooling Bed & Shear'].map((machine) => {
            const machineTasks = mockTasks.filter((t) => t.machineName === machine);
            return (
              <div key={machine} className="grid grid-cols-19 gap-1 items-center py-2 border-b border-slate-100/80 text-xs">
                <div className="col-span-4 font-bold text-slate-800 truncate pr-2">{machine}</div>

                <div className="col-span-15 relative h-9 bg-slate-50 rounded-lg border border-slate-200/80">
                  {machineTasks.map((t) => {
                    const leftPct = ((t.startHour - 6) / 18) * 100;
                    const widthPct = (t.durationHours / 18) * 100;
                    const colorClass =
                      t.status === 'COMPLETED'
                        ? 'bg-emerald-500 text-white'
                        : t.status === 'IN_PROGRESS'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-amber-400 text-slate-900';

                    return (
                      <div
                        key={t.id}
                        style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                        className={`absolute top-1 bottom-1 rounded-md px-2 flex items-center justify-between text-[11px] font-bold overflow-hidden cursor-pointer hover:brightness-110 transition-all ${colorClass}`}
                        title={`${t.workOrderNo}: ${t.itemSpec}`}
                      >
                        <span className="truncate">{t.workOrderNo}</span>
                        <span className="font-mono text-[10px] opacity-80 font-normal hidden sm:inline">{t.durationHours}h</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
