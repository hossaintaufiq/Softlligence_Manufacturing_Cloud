'use client';

import { useEffect, useState } from 'react';
import { createItemApi, fetchItems, fetchUoms, type Item, type UnitOfMeasure } from '../../lib/api/inventory.js';

export function ItemCatalogPanel() {
  const [items, setItems] = useState<Item[]>([]);
  const [uoms, setUoms] = useState<UnitOfMeasure[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [itemType, setItemType] = useState('RM');
  const [uomId, setUomId] = useState('');
  const [valuationMethod, setValuationMethod] = useState('average');
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [itemList, uomList] = await Promise.all([
        fetchItems(filterType === 'all' ? undefined : filterType),
        fetchUoms(),
      ]);
      setItems(itemList);
      setUoms(uomList);
      if (uomList.length > 0 && !uomId) {
        setUomId(uomList[0].id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load items');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [filterType]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!uomId) {
      setError('Please select a unit of measure');
      return;
    }
    setCreating(true);
    setError(null);
    try {
      await createItemApi({
        code,
        name,
        itemType,
        uomId,
        valuationMethod,
      });
      setCode('');
      setName('');
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create item');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Item Master Catalog</h2>
          <p className="text-sm text-slate-500">Manage raw materials, WIP, finished goods, and spares.</p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-lg text-xs font-semibold text-slate-600">
          {['all', 'RM', 'WIP', 'FG', 'SPARE', 'CONSUMABLE'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-md transition-colors ${
                filterType === type ? 'bg-white text-indigo-700 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">{error}</div>}

      {/* Add Item Form */}
      <form onSubmit={handleCreate} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800">Add New Catalog Item</h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Item Code</label>
            <input
              type="text"
              required
              placeholder="e.g. RM-BILLET-150"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Item Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Steel Billet 150x150mm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Item Type</label>
            <select
              value={itemType}
              onChange={(e) => setItemType(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
            >
              <option value="RM">Raw Material (RM)</option>
              <option value="WIP">Work In Progress (WIP)</option>
              <option value="FG">Finished Goods (FG)</option>
              <option value="SPARE">Spare Parts</option>
              <option value="CONSUMABLE">Consumable</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Base UOM</label>
            <select
              value={uomId}
              onChange={(e) => setUomId(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
            >
              {uoms.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={creating || uoms.length === 0}
              className="w-full rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Item'}
            </button>
          </div>
        </div>
      </form>

      {/* Items Table */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
            <tr>
              <th className="px-4 py-2.5">Code</th>
              <th className="px-4 py-2.5">Name</th>
              <th className="px-4 py-2.5">Type</th>
              <th className="px-4 py-2.5">UOM</th>
              <th className="px-4 py-2.5">Valuation</th>
              <th className="px-4 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  Loading catalog items...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  No items found in catalog.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-mono font-semibold text-indigo-700">{item.code}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-900">{item.name}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        item.itemType === 'RM'
                          ? 'bg-blue-100 text-blue-800'
                          : item.itemType === 'FG'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.itemType}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-slate-600">{item.uom?.code || item.uomId}</td>
                  <td className="px-4 py-2.5 capitalize text-slate-500">{item.valuationMethod}</td>
                  <td className="px-4 py-2.5">
                    <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200">
                      {item.status}
                    </span>
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
