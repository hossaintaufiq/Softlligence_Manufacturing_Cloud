'use client';

import { useState, useEffect } from 'react';
import { SessionPanel } from '@/components/auth/SessionPanel';
import {
  fetchWorkOrders,
  fetchBoms,
  fetchManufacturingKpis,
  createWorkOrderApi,
  updateWorkOrderStatusApi,
  postMaterialIssueApi,
  postProductionOutputApi,
  postScrapLogApi,
  postEnergyLogApi,
  type WorkOrderItem,
  type BomItem,
  type ManufacturingKpis,
} from '@/lib/api/manufacturing';
import { fetchItems, fetchWarehouses, type Item, type Warehouse } from '@/lib/api/inventory';

export default function ManufacturingPage() {
  const [activeTab, setActiveTab] = useState<'kpis' | 'workOrders' | 'boms'>('workOrders');
  const [workOrders, setWorkOrders] = useState<WorkOrderItem[]>([]);
  const [boms, setBoms] = useState<BomItem[]>([]);
  const [kpis, setKpis] = useState<ManufacturingKpis | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [showCreateWo, setShowCreateWo] = useState(false);
  const [selectedWo, setSelectedWo] = useState<WorkOrderItem | null>(null);
  const [executionMode, setExecutionMode] = useState<'issue' | 'output' | 'scrap' | 'energy' | null>(null);

  // Form states
  const [newWoForm, setNewWoForm] = useState({
    docNo: '',
    itemId: '',
    qtyPlanned: '',
    bomHeaderId: '',
  });

  const [postForm, setPostForm] = useState({
    warehouseId: '',
    itemId: '',
    uomId: '',
    qty: '',
    reasonCode: 'SCRAP_DEFECT',
    utilityType: 'electricity',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [woData, bomData, kpiData, itemData, whData] = await Promise.all([
        fetchWorkOrders(),
        fetchBoms(),
        fetchManufacturingKpis(),
        fetchItems(),
        fetchWarehouses(),
      ]);
      setWorkOrders(woData);
      setBoms(bomData);
      setKpis(kpiData);
      setItems(itemData);
      setWarehouses(whData);
    } catch (err: any) {
      setError(err.message || 'Failed to load manufacturing data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateWoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Pick first company and factory defaults
      const companyId = (items[0] as any)?.companyId || warehouses[0]?.companyId || 'company-1';
      const factoryId = warehouses[0]?.factoryId || 'factory-1';

      await createWorkOrderApi({
        companyId,
        factoryId,
        docNo: newWoForm.docNo || undefined,
        itemId: newWoForm.itemId,
        qtyPlanned: Number(newWoForm.qtyPlanned),
        bomHeaderId: newWoForm.bomHeaderId || undefined,
      });

      setShowCreateWo(false);
      setNewWoForm({ docNo: '', itemId: '', qtyPlanned: '', bomHeaderId: '' });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create work order');
    }
  };

  const handleStatusChange = async (woId: string, nextStatus: string) => {
    try {
      await updateWorkOrderStatusApi(woId, nextStatus);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleExecutionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWo) return;

    try {
      if (executionMode === 'issue') {
        const rawItem = items.find((i) => i.id === postForm.itemId) || items[0];
        await postMaterialIssueApi({
          workOrderId: selectedWo.id,
          warehouseId: postForm.warehouseId || warehouses[0]?.id,
          lines: [
            {
              itemId: postForm.itemId || rawItem.id,
              uomId: rawItem.uomId,
              qtyIssued: Number(postForm.qty),
            },
          ],
        });
      } else if (executionMode === 'output') {
        await postProductionOutputApi({
          workOrderId: selectedWo.id,
          warehouseId: postForm.warehouseId || warehouses[0]?.id,
          qtyProduced: Number(postForm.qty),
          uomId: selectedWo.bomLines[0]?.uomSymbol ? selectedWo.bomLines[0].componentItemId : items[0]?.uomId,
        });
      } else if (executionMode === 'scrap') {
        await postScrapLogApi({
          workOrderId: selectedWo.id,
          qtyScrapped: Number(postForm.qty),
          uomId: items[0]?.uomId,
          reasonCode: postForm.reasonCode,
        });
      } else if (executionMode === 'energy') {
        await postEnergyLogApi({
          factoryId: selectedWo.factoryId,
          workOrderId: selectedWo.id,
          utilityType: postForm.utilityType,
          quantity: Number(postForm.qty),
        });
      }

      setExecutionMode(null);
      setSelectedWo(null);
      setPostForm({ warehouseId: '', itemId: '', uomId: '', qty: '', reasonCode: 'SCRAP_DEFECT', utilityType: 'electricity' });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Execution error');
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <SessionPanel />

        {/* Manufacturing KPI Summary Cards */}
        {kpis && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Work Orders</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{kpis.totalOrders}</p>
              <p className="mt-1 text-xs text-indigo-600 font-semibold">{kpis.activeOrders} active / in-progress</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Overall Yield %</p>
              <p className="mt-1 text-2xl font-bold text-emerald-600">{kpis.overallYield}%</p>
              <p className="mt-1 text-xs text-slate-500">Planned vs Output Ratio</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Produced (FG)</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{kpis.totalProduced} MT</p>
              <p className="mt-1 text-xs text-slate-500">From {kpis.completedOrders} completed WOs</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Energy & Scrap</p>
              <p className="mt-1 text-2xl font-bold text-amber-600">{kpis.totalEnergyKwh} kWh</p>
              <p className="mt-1 text-xs text-slate-500">{kpis.totalScrap} MT scrap logged</p>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex flex-wrap border-b sm:border-b-0 border-slate-200 gap-2">
              <button
                onClick={() => setActiveTab('workOrders')}
                className={`pb-2 px-1 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === 'workOrders'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Work Orders List
              </button>
              <button
                onClick={() => setActiveTab('boms')}
                className={`pb-2 px-1 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === 'boms'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Bill of Materials (BOM) Catalog
              </button>
            </div>

            <button
              onClick={() => setShowCreateWo(true)}
              className="rounded-md bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
            >
              + Create Work Order
            </button>
          </div>

          {loading && <p className="text-sm text-slate-500">Loading manufacturing records...</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {!loading && activeTab === 'workOrders' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Doc No</th>
                    <th className="px-4 py-3">Item / Product</th>
                    <th className="px-4 py-3">Planned Qty</th>
                    <th className="px-4 py-3">Completed</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions / Executions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {workOrders.map((wo) => {
                    const percent = Math.min(100, Math.round((wo.qtyCompleted / wo.qtyPlanned) * 100));
                    return (
                      <tr key={wo.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-semibold text-slate-900">{wo.docNo}</td>
                        <td className="px-4 py-3">
                          <div>{wo.itemName}</div>
                          <div className="text-xs text-slate-400 font-mono">{wo.itemCode}</div>
                        </td>
                        <td className="px-4 py-3 font-mono font-medium">{wo.qtyPlanned} {wo.itemUom}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-bold text-slate-800">{wo.qtyCompleted} ({percent}%)</span>
                            <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${percent}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase ${
                              wo.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : wo.status === 'in_progress'
                                ? 'bg-indigo-100 text-indigo-800'
                                : wo.status === 'released'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {wo.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-1">
                          {wo.status === 'draft' && (
                            <button
                              onClick={() => handleStatusChange(wo.id, 'released')}
                              className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded text-xs font-semibold hover:bg-amber-100"
                            >
                              Release
                            </button>
                          )}
                          {['released', 'in_progress'].includes(wo.status) && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedWo(wo);
                                  setExecutionMode('issue');
                                }}
                                className="px-2 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-xs font-semibold hover:bg-indigo-100"
                              >
                                + Issue Raw Material
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedWo(wo);
                                  setExecutionMode('output');
                                }}
                                className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-semibold hover:bg-emerald-100"
                              >
                                + Post Output
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {workOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                        No work orders found. Click "+ Create Work Order" to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {!loading && activeTab === 'boms' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {boms.map((bom) => (
                  <div key={bom.id} className="rounded-lg border border-slate-200 p-4 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div>
                        <h4 className="font-bold text-slate-900">{bom.parentItemName}</h4>
                        <p className="text-xs text-slate-500 font-mono">Code: {bom.parentItemCode} | Version: {bom.version}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-500 uppercase">Components / Recipe Lines</p>
                      <ul className="divide-y divide-slate-200 text-xs text-slate-700">
                        {bom.lines.map((line) => (
                          <li key={line.id} className="py-1.5 flex justify-between">
                            <span>{line.componentItemName} ({line.componentItemCode})</span>
                            <span className="font-mono font-bold text-slate-900">{line.qty} {line.uomSymbol}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Work Order Modal */}
      {showCreateWo && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Create New Work Order</h3>
            <form onSubmit={handleCreateWoSubmit} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Doc / WO Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. WO-2026-002"
                  value={newWoForm.docNo}
                  onChange={(e) => setNewWoForm({ ...newWoForm, docNo: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Finished Goods Output Item</label>
                <select
                  value={newWoForm.itemId}
                  onChange={(e) => setNewWoForm({ ...newWoForm, itemId: e.target.value })}
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Select Output Item --</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Planned Quantity</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 100"
                  value={newWoForm.qtyPlanned}
                  onChange={(e) => setNewWoForm({ ...newWoForm, qtyPlanned: e.target.value })}
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateWo(false)}
                  className="px-4 py-2 rounded-md border border-slate-300 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
                >
                  Save Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Execution Post Modal */}
      {executionMode && selectedWo && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 capitalize">
              {executionMode === 'issue' ? 'Issue Raw Material to WO' : 'Post Production Output Receipt'}
            </h3>
            <p className="text-xs text-slate-500">Target Work Order: <span className="font-mono font-semibold text-slate-800">{selectedWo.docNo}</span></p>

            <form onSubmit={handleExecutionSubmit} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Select Warehouse</label>
                <select
                  value={postForm.warehouseId}
                  onChange={(e) => setPostForm({ ...postForm, warehouseId: e.target.value })}
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Select Storage Warehouse --</option>
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.name} ({wh.code}) [{wh.type}]
                    </option>
                  ))}
                </select>
              </div>

              {executionMode === 'issue' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Raw Material Component Item</label>
                  <select
                    value={postForm.itemId}
                    onChange={(e) => setPostForm({ ...postForm, itemId: e.target.value })}
                    required
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Select Raw Material --</option>
                    {items.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name} ({i.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Quantity</label>
                <input
                  type="number"
                  step="any"
                  placeholder="Quantity to post"
                  value={postForm.qty}
                  onChange={(e) => setPostForm({ ...postForm, qty: e.target.value })}
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setExecutionMode(null);
                    setSelectedWo(null);
                  }}
                  className="px-4 py-2 rounded-md border border-slate-300 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
                >
                  Confirm Posting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
