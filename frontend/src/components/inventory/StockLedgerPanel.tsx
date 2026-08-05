'use client';

import { useEffect, useState } from 'react';
import { fetchStockLedger, fetchWarehouses, type StockLedgerEntry, type Warehouse } from '../../lib/api/inventory.js';

export function StockLedgerPanel() {
  const [ledger, setLedger] = useState<StockLedgerEntry[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWh, setSelectedWh] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [ledgerEntries, whList] = await Promise.all([
        fetchStockLedger(selectedWh === 'all' ? undefined : selectedWh),
        fetchWarehouses(),
      ]);
      setLedger(ledgerEntries);
      setWarehouses(whList);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load stock ledger');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [selectedWh]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Stock Ledger Audit Trail</h2>
          <p className="text-sm text-slate-500">Immutable transaction log of all stock movements (Receipts, Issues, Transfers, Adjustments).</p>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold text-slate-700">Warehouse Filter:</label>
          <select
            value={selectedWh}
            onChange={(e) => setSelectedWh(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:outline-none bg-white shadow-sm font-medium"
          >
            <option value="all">All Warehouses</option>
            {warehouses.map((wh) => (
              <option key={wh.id} value={wh.id}>
                {wh.name} ({wh.code})
              </option>
            ))}
          </select>
          <button
            onClick={load}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">{error}</div>}

      {/* Ledger Table */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
            <tr>
              <th className="px-4 py-2.5">Date / Time</th>
              <th className="px-4 py-2.5">Movement Type</th>
              <th className="px-4 py-2.5">Warehouse</th>
              <th className="px-4 py-2.5">Item Code</th>
              <th className="px-4 py-2.5 text-right">Qty In</th>
              <th className="px-4 py-2.5 text-right">Qty Out</th>
              <th className="px-4 py-2.5">UOM</th>
              <th className="px-4 py-2.5">Ref Doc</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-slate-400">
                  Loading ledger entries...
                </td>
              </tr>
            ) : ledger.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-slate-400">
                  No stock ledger entries recorded yet.
                </td>
              </tr>
            ) : (
              ledger.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 text-slate-500 font-mono">
                    {new Date(entry.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        entry.movementType.includes('IN') || entry.movementType === 'GRN'
                          ? 'bg-emerald-100 text-emerald-800'
                          : entry.movementType.includes('OUT') || entry.movementType === 'ISSUE'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {entry.movementType}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-medium text-slate-900">{entry.warehouse?.name || entry.warehouseId}</td>
                  <td className="px-4 py-2.5 font-mono font-semibold text-indigo-700">{entry.item?.code || entry.itemId}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-semibold text-emerald-600">
                    {entry.qtyIn > 0 ? `+${entry.qtyIn.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-semibold text-amber-600">
                    {entry.qtyOut > 0 ? `-${entry.qtyOut.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-slate-500">{entry.uom?.code || '—'}</td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-slate-500">{entry.refDocType || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
