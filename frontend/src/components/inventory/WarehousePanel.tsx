'use client';

import { useEffect, useState } from 'react';
import {
  createUomApi,
  createWarehouseApi,
  fetchUoms,
  fetchWarehouses,
  type UnitOfMeasure,
  type Warehouse,
} from '../../lib/api/inventory.js';
import { listCompanies, type Company } from '../../lib/api/org.js';

export function WarehousePanel() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [uoms, setUoms] = useState<UnitOfMeasure[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [whCompanyId, setWhCompanyId] = useState('');
  const [whCode, setWhCode] = useState('');
  const [whName, setWhName] = useState('');
  const [whType, setWhType] = useState('RM');
  const [creatingWh, setCreatingWh] = useState(false);

  const [uomCode, setUomCode] = useState('');
  const [uomName, setUomName] = useState('');
  const [uomSymbol, setUomSymbol] = useState('');
  const [creatingUom, setCreatingUom] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [whList, uomList, companyList] = await Promise.all([
        fetchWarehouses(),
        fetchUoms(),
        listCompanies(),
      ]);
      setWarehouses(whList);
      setUoms(uomList);
      setCompanies(companyList);
      if (companyList.length > 0 && !whCompanyId) {
        setWhCompanyId(companyList[0].id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load warehouses & UOMs');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreateWh(e: React.FormEvent) {
    e.preventDefault();
    if (!whCompanyId) {
      setError('Please select a company for warehouse creation');
      return;
    }
    setCreatingWh(true);
    setError(null);
    try {
      await createWarehouseApi({
        companyId: whCompanyId,
        code: whCode,
        name: whName,
        type: whType,
      });
      setWhCode('');
      setWhName('');
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create warehouse');
    } finally {
      setCreatingWh(false);
    }
  }

  async function handleCreateUom(e: React.FormEvent) {
    e.preventDefault();
    setCreatingUom(true);
    setError(null);
    try {
      await createUomApi({
        code: uomCode,
        name: uomName,
        symbol: uomSymbol,
      });
      setUomCode('');
      setUomName('');
      setUomSymbol('');
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create UOM');
    } finally {
      setCreatingUom(false);
    }
  }

  return (
    <div className="space-y-8">
      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">{error}</div>}

      {/* Warehouses Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Warehouses & Storage Locations</h2>
          <p className="text-sm text-slate-500">Configure physical raw material yards, WIP buffers, and FG warehouses.</p>
        </div>

        <form onSubmit={handleCreateWh} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Add New Warehouse</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Company</label>
              <select
                value={whCompanyId}
                onChange={(e) => setWhCompanyId(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Warehouse Code</label>
              <input
                type="text"
                required
                placeholder="e.g. WH-RM"
                value={whCode}
                onChange={(e) => setWhCode(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Warehouse Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Raw Material Storage Yard"
                value={whName}
                onChange={(e) => setWhName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Warehouse Type</label>
              <select
                value={whType}
                onChange={(e) => setWhType(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
              >
                <option value="RM">Raw Material (RM)</option>
                <option value="WIP">Work In Progress (WIP)</option>
                <option value="FG">Finished Goods (FG)</option>
                <option value="SPARE">Spares / Scrap</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={creatingWh || companies.length === 0}
                className="w-full rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {creatingWh ? 'Creating...' : 'Add Warehouse'}
              </button>
            </div>
          </div>
        </form>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
              <tr>
                <th className="px-4 py-2.5">Code</th>
                <th className="px-4 py-2.5">Name</th>
                <th className="px-4 py-2.5">Type</th>
                <th className="px-4 py-2.5">Company</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    Loading warehouses...
                  </td>
                </tr>
              ) : warehouses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    No warehouses created yet.
                  </td>
                </tr>
              ) : (
                warehouses.map((wh) => (
                  <tr key={wh.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-mono font-semibold text-indigo-700">{wh.code}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-900">{wh.name}</td>
                    <td className="px-4 py-2.5">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                        {wh.type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">{wh.company?.name || wh.companyId}</td>
                    <td className="px-4 py-2.5">
                      <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200">
                        {wh.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Units of Measure Section */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Units of Measure (UOM)</h2>
          <p className="text-xs text-slate-500">Standard units for inventory stock tracking.</p>
        </div>

        <form onSubmit={handleCreateUom} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">UOM Code</label>
              <input
                type="text"
                required
                placeholder="e.g. MT"
                value={uomCode}
                onChange={(e) => setUomCode(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Metric Ton"
                value={uomName}
                onChange={(e) => setUomName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Symbol (Optional)</label>
              <input
                type="text"
                placeholder="e.g. MT"
                value={uomSymbol}
                onChange={(e) => setUomSymbol(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={creatingUom}
                className="w-full rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-900 disabled:opacity-50"
              >
                {creatingUom ? 'Adding...' : 'Add UOM'}
              </button>
            </div>
          </div>
        </form>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {uoms.map((u) => (
            <div key={u.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm flex justify-between items-center">
              <div>
                <span className="font-mono text-sm font-bold text-slate-900">{u.code}</span>
                <p className="text-xs text-slate-500">{u.name}</p>
              </div>
              {u.symbol && <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{u.symbol}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
