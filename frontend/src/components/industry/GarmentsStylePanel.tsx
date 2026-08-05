'use client';

import React, { useState, useEffect } from 'react';

type GarmentStyleItem = {
  id: string;
  styleCode: string;
  styleName: string;
  buyerName: string;
  colorSizeMatrix: string;
  cutQuantity: number;
  packedQuantity: number;
  packRatioPct: number;
};

export function GarmentsStylePanel() {
  const [styles, setStyles] = useState<GarmentStyleItem[]>([]);
  const [showCreateStyle, setShowCreateStyle] = useState(false);
  const [form, setForm] = useState({
    styleCode: '',
    styleName: '',
    buyerName: '',
    colorSizeMatrix: 'Red, Blue, Navy x S, M, L, XL',
    cutQuantity: '',
    packedQuantity: '',
  });

  useEffect(() => {
    loadStyles();
  }, []);

  const loadStyles = async () => {
    try {
      const res = await fetch('/api/v1/industry-templates/garments/styles', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setStyles(data.styles || []);
      }
    } catch {}
  };

  const handleStyleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/v1/industry-templates/garments/styles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...form,
          cutQuantity: Number(form.cutQuantity),
          packedQuantity: Number(form.packedQuantity),
        }),
      });
      setShowCreateStyle(false);
      setForm({ styleCode: '', styleName: '', buyerName: '', colorSizeMatrix: 'Red, Blue, Navy x S, M, L, XL', cutQuantity: '', packedQuantity: '' });
      await loadStyles();
    } catch (err: any) {
      alert(err.message || 'Failed to create garment style');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">👕 Garments & Apparel Style Master</h3>
          <p className="text-xs text-slate-500 mt-0.5">Color-Size Matrix, Cut-to-Pack efficiency ratio, and buyer style order tracking.</p>
        </div>

        <button
          onClick={() => setShowCreateStyle(true)}
          className="px-3.5 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-xs"
        >
          + Add Apparel Style Order
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 uppercase text-[11px] font-semibold text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Style Code</th>
              <th className="px-4 py-3">Style Name & Buyer</th>
              <th className="px-4 py-3">Color-Size Breakdown</th>
              <th className="px-4 py-3 text-right">Cut Quantity</th>
              <th className="px-4 py-3 text-right">Packed Quantity</th>
              <th className="px-4 py-3 text-right">Cut-to-Pack Ratio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {styles.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-bold text-indigo-600">{s.styleCode}</td>
                <td className="px-4 py-3 font-sans">
                  <p className="font-bold text-slate-900">{s.styleName}</p>
                  <p className="text-[11px] text-slate-500">Buyer: {s.buyerName}</p>
                </td>
                <td className="px-4 py-3 font-sans text-slate-600 text-[11px]">{s.colorSizeMatrix}</td>
                <td className="px-4 py-3 text-right text-slate-700">{s.cutQuantity.toLocaleString()} pcs</td>
                <td className="px-4 py-3 text-right font-bold text-slate-900">{s.packedQuantity.toLocaleString()} pcs</td>
                <td className="px-4 py-3 text-right font-bold text-emerald-600">{s.packRatioPct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreateStyle && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Add Garments Apparel Style Order</h3>
            <form onSubmit={handleStyleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Style Code</label>
                <input
                  type="text"
                  placeholder="e.g. STY-2026-POLO-99"
                  value={form.styleCode}
                  onChange={(e) => setForm({ ...form, styleCode: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Style Description Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mens Pique Polo Shirt"
                  value={form.styleName}
                  onChange={(e) => setForm({ ...form, styleName: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Buyer / Brand Name</label>
                <input
                  type="text"
                  placeholder="e.g. H&M Global"
                  value={form.buyerName}
                  onChange={(e) => setForm({ ...form, buyerName: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Color & Size Matrix Specification</label>
                <input
                  type="text"
                  value={form.colorSizeMatrix}
                  onChange={(e) => setForm({ ...form, colorSizeMatrix: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cut Quantity (Pcs)</label>
                  <input
                    type="number"
                    placeholder="e.g. 50000"
                    value={form.cutQuantity}
                    onChange={(e) => setForm({ ...form, cutQuantity: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Packed Quantity (Pcs)</label>
                  <input
                    type="number"
                    placeholder="e.g. 48200"
                    value={form.packedQuantity}
                    onChange={(e) => setForm({ ...form, packedQuantity: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateStyle(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-xs"
                >
                  Save Style Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
