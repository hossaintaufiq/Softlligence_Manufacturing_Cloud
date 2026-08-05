'use client';

import { useEffect, useState } from 'react';
import { fetchStockBalances, fetchWarehouses, type StockBalance, type Warehouse } from '../../lib/api/inventory.js';

export function StockBalancePanel() {
  const [balances, setBalances] = useState<StockBalance[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWh, setSelectedWh] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [balList, whList] = await Promise.all([
        fetchStockBalances(selectedWh === 'all' ? undefined : selectedWh),
        fetchWarehouses(),
      ]);
      setBalances(balList);
      setWarehouses(whList);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load stock balances');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [selectedWh]);

  const totalItemsWithStock = balances.filter((b) => b.qtyOnHand > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Live On-Hand Stock Balances</h2>
          <p className="text-sm text-slate-500">Real-time inventory levels across storage locations.</p>
        </div>

        {/* Warehouse Filter */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold text-slate-700">Filter Warehouse:</label>
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Warehouses</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{warehouses.length}</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">SKUs with Positive Stock</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{totalItemsWithStock}</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tracked Balances</span>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{balances.length}</p>
        </div>
      </div>

      {/* Balances Table */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
            <tr>
              <th className="px-4 py-2.5">Warehouse</th>
              <th className="px-4 py-2.5">Item Code</th>
              <th className="px-4 py-2.5">Item Name</th>
              <th className="px-4 py-2.5 text-right">Qty On-Hand</th>
              <th className="px-4 py-2.5">UOM</th>
              <th className="px-4 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  Loading stock balances...
                </td>
              </tr>
            ) : balances.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  No stock balance records found for this view.
                </td>
              </tr>
            ) : (
              balances.map((bal) => (
                <tr key={bal.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-medium text-slate-900">{bal.warehouse?.name || bal.warehouseId}</td>
                  <td className="px-4 py-2.5 font-mono font-semibold text-indigo-700">{bal.item?.code || bal.itemId}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-800">{bal.item?.name || '—'}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900 text-sm">
                    {bal.qtyOnHand.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-slate-600">{bal.item?.uom?.code || '—'}</td>
                  <td className="px-4 py-2.5">
                    {bal.qtyOnHand > 0 ? (
                      <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                        In Stock
                      </span>
                    ) : (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                        Zero Stock
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
