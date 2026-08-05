'use client';

import React, { useState, useEffect } from 'react';

type MachineItem = {
  id: string;
  name: string;
  code: string;
  status: 'RUNNING' | 'IDLE' | 'DOWNTIME' | 'MAINTENANCE';
  oeeScorePct: number;
  currentWorkOrderNo?: string;
  downtimeMin: number;
  lastDowntimeReason?: string;
};

export function MachineStateTracker() {
  const [machines, setMachines] = useState<MachineItem[]>([]);
  const [showDowntimeModal, setShowDowntimeModal] = useState(false);
  const [selectedMachineId, setSelectedMachineId] = useState('');
  const [downtimeMin, setDowntimeMin] = useState('30');
  const [reason, setReason] = useState('MECHANICAL_OVERLOAD');

  useEffect(() => {
    loadMachines();
  }, []);

  const loadMachines = async () => {
    try {
      const res = await fetch('/api/v1/mes/machines', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setMachines(data.machines || []);
      }
    } catch {}
  };

  const handleDowntimeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/v1/mes/downtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          machineId: selectedMachineId,
          downtimeMin: Number(downtimeMin),
          reason,
        }),
      });
      setShowDowntimeModal(false);
      await loadMachines();
    } catch (err: any) {
      alert(err.message || 'Failed to log downtime');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">⚡ Shop Floor Machine State & OEE Tracker</h3>
          <p className="text-xs text-slate-500 mt-0.5">Real-time workstation status, downtime minutes, and machine OEE metrics.</p>
        </div>

        <button
          onClick={() => {
            if (machines.length > 0) setSelectedMachineId(machines[0].id);
            setShowDowntimeModal(true);
          }}
          className="px-3.5 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors shadow-xs"
        >
          + Log Machine Downtime Event
        </button>
      </div>

      {/* Machines Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {machines.map((m) => {
          const statusBg =
            m.status === 'RUNNING'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : m.status === 'DOWNTIME'
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-amber-50 text-amber-700 border-amber-200';

          return (
            <div key={m.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-[10px] text-slate-400 font-bold uppercase">{m.code}</span>
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">{m.name}</h4>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusBg}`}>
                  {m.status}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">OEE Score:</span>
                <span className="font-bold text-indigo-600">{m.oeeScorePct}%</span>
              </div>

              {m.currentWorkOrderNo && (
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">Active WO:</span>
                  <span className="font-bold text-slate-800">{m.currentWorkOrderNo}</span>
                </div>
              )}

              {m.downtimeMin > 0 && (
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/80 text-[11px] space-y-0.5">
                  <p className="text-rose-600 font-bold">Downtime: {m.downtimeMin} mins</p>
                  <p className="text-slate-500 truncate">{m.lastDowntimeReason}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Log Downtime Modal */}
      {showDowntimeModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Log Workstation Downtime Event</h3>
            <form onSubmit={handleDowntimeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Machine Workstation</label>
                <select
                  value={selectedMachineId}
                  onChange={(e) => setSelectedMachineId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                >
                  {machines.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Downtime Duration (Minutes)</label>
                <input
                  type="number"
                  value={downtimeMin}
                  onChange={(e) => setDowntimeMin(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason Description</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  placeholder="e.g. Motor thermal trip, Hydraulic line leak"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowDowntimeModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg shadow-xs"
                >
                  Save Downtime Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
