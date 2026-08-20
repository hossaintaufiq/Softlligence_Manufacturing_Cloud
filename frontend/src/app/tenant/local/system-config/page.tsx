'use client';
import React, { useState, useEffect } from 'react';
export default function SystemConfigPage() {
  const [alerts, setAlerts] = useState<string[]>([]);
  const [newAlert, setNewAlert] = useState('');

  useEffect(() => {
    const data = localStorage.getItem('smc_critical_alerts');
    if (data) setAlerts(JSON.parse(data));
  }, []);

  const saveAlerts = (updated: string[]) => {
    setAlerts(updated);
    localStorage.setItem('smc_critical_alerts', JSON.stringify(updated));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlert.trim()) return;
    const updated = [...alerts, newAlert.trim()];
    saveAlerts(updated);
    setNewAlert('');
  };

  const handleRemove = (idx: number) => {
    const updated = alerts.filter((_, i) => i !== idx);
    saveAlerts(updated);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-extrabold text-slate-900">Store Alerts & System Configuration</h2>
        <p className="text-[11px] text-slate-500">Add or remove alerts shown on the rolling ticker.</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <form onSubmit={handleAdd} className="flex space-x-2">
          <input
            type="text"
            placeholder="e.g. Clearance sale promo banner..."
            value={newAlert}
            onChange={(e) => setNewAlert(e.target.value)}
            className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs"
          />
          <button type="submit" className="px-4 py-2 bg-indigo-650 text-white rounded-xl text-xs font-bold font-mono">ADD ALERT</button>
        </form>
        <div className="space-y-2">
          {alerts.map((alert, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-mono">
              <span className="truncate">{alert}</span>
              <button onClick={() => handleRemove(idx)} className="text-rose-600 font-bold ml-2">âœ•</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
