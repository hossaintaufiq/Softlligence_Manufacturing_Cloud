'use client';

import React, { useState, useEffect } from 'react';

type VehicleGatePass = {
  id: string;
  gatePassNo: string;
  vehicleNo: string;
  driverName: string;
  partyName: string;
  entryType: 'INBOUND_SCRAP' | 'OUTBOUND_REBAR';
  grossWeightKg: number;
  tareWeightKg: number;
  netWeightKg: number;
  status: 'GATE_IN' | 'WEIGHED' | 'DISPATCHED';
  enteredAt: string;
};

export function VehicleGateTracker() {
  const [passes, setPasses] = useState<VehicleGatePass[]>([]);
  const [showCreatePass, setShowCreatePass] = useState(false);
  const [form, setForm] = useState({
    gatePassNo: '',
    vehicleNo: '',
    driverName: '',
    partyName: '',
    entryType: 'INBOUND_SCRAP' as const,
    grossWeightKg: '',
    tareWeightKg: '',
  });

  useEffect(() => {
    loadPasses();
  }, []);

  const loadPasses = async () => {
    try {
      const res = await fetch('/api/v1/logistics/gate-passes', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setPasses(data.passes || []);
      }
    } catch {}
  };

  const handlePassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/v1/logistics/gate-passes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...form,
          grossWeightKg: Number(form.grossWeightKg),
          tareWeightKg: Number(form.tareWeightKg),
        }),
      });
      setShowCreatePass(false);
      setForm({ gatePassNo: '', vehicleNo: '', driverName: '', partyName: '', entryType: 'INBOUND_SCRAP', grossWeightKg: '', tareWeightKg: '' });
      await loadPasses();
    } catch (err: any) {
      alert(err.message || 'Failed to create gate pass');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">🚚 Freight Vehicle Gate & Weighbridge Log</h3>
          <p className="text-xs text-slate-500 mt-0.5">Inbound scrap truck weighbridge gross/tare/net balance logs and gate passes.</p>
        </div>

        <button
          onClick={() => setShowCreatePass(true)}
          className="px-3.5 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-xs"
        >
          + Issue Vehicle Gate Pass
        </button>
      </div>

      {/* Gate Passes Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 uppercase text-[11px] font-semibold text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Gate Pass No</th>
              <th className="px-4 py-3">Vehicle No</th>
              <th className="px-4 py-3">Driver & Party</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3 text-right">Gross Weight</th>
              <th className="px-4 py-3 text-right">Tare Weight</th>
              <th className="px-4 py-3 text-right">Net Weight (Payload)</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {passes.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-bold text-indigo-600">{p.gatePassNo}</td>
                <td className="px-4 py-3 font-bold text-slate-900">{p.vehicleNo}</td>
                <td className="px-4 py-3 font-sans">
                  <p className="font-semibold text-slate-800">{p.partyName}</p>
                  <p className="text-[11px] text-slate-500">Driver: {p.driverName}</p>
                </td>
                <td className="px-4 py-3 font-sans">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.entryType === 'INBOUND_SCRAP' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                    {p.entryType}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-slate-600">{p.grossWeightKg.toLocaleString()} kg</td>
                <td className="px-4 py-3 text-right text-slate-500">{p.tareWeightKg.toLocaleString()} kg</td>
                <td className="px-4 py-3 text-right font-bold text-slate-900">{p.netWeightKg.toLocaleString()} kg</td>
                <td className="px-4 py-3 font-sans">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Gate Pass Modal */}
      {showCreatePass && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Issue Freight Vehicle Gate Pass</h3>
            <form onSubmit={handlePassSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gate Pass No</label>
                <input
                  type="text"
                  placeholder="e.g. GATE-2026-099"
                  value={form.gatePassNo}
                  onChange={(e) => setForm({ ...form, gatePassNo: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vehicle Registration No</label>
                  <input
                    type="text"
                    placeholder="e.g. DHAKA-METRO-112"
                    value={form.vehicleNo}
                    onChange={(e) => setForm({ ...form, vehicleNo: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Driver Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Abul Hossain"
                    value={form.driverName}
                    onChange={(e) => setForm({ ...form, driverName: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Party / Supplier / Customer</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Scrap Suppliers Ltd"
                  value={form.partyName}
                  onChange={(e) => setForm({ ...form, partyName: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Weighbridge Gross (kg)</label>
                  <input
                    type="number"
                    placeholder="e.g. 42500"
                    value={form.grossWeightKg}
                    onChange={(e) => setForm({ ...form, grossWeightKg: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Truck Tare (kg)</label>
                  <input
                    type="number"
                    placeholder="e.g. 14200"
                    value={form.tareWeightKg}
                    onChange={(e) => setForm({ ...form, tareWeightKg: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreatePass(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-xs"
                >
                  Save Gate Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
