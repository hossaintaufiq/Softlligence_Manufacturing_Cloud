'use client';

import { useState, useEffect } from 'react';
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
import { KanbanBoard, type WorkOrderKanbanItem } from '@/components/enterprise/KanbanBoard';
import { BomTreeViewer } from '@/components/enterprise/BomTreeViewer';
import { VirtualDataTable, type ColumnDef } from '@/components/enterprise/VirtualDataTable';
import { GanttScheduler } from '@/components/mes/GanttScheduler';
import { MachineStateTracker } from '@/components/mes/MachineStateTracker';

export default function ManufacturingPage() {
  const [activeTab, setActiveTab] = useState<'kpis' | 'workOrders' | 'gantt' | 'machines' | 'boms'>('workOrders');
  const [woViewMode, setWoViewMode] = useState<'kanban' | 'table'>('kanban');
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
    if (!selectedWo || !executionMode) return;
    try {
      if (executionMode === 'issue') {
        await postMaterialIssueApi({
          warehouseId: postForm.warehouseId || warehouses[0]?.id,
          workOrderId: selectedWo.id,
          lines: [{ itemId: postForm.itemId || items[0]?.id, uomId: items[0]?.uomId || 'PCS', qtyIssued: Number(postForm.qty) }],
        });
      } else if (executionMode === 'output') {
        await postProductionOutputApi({
          warehouseId: postForm.warehouseId || warehouses[0]?.id,
          workOrderId: selectedWo.id,
          qtyProduced: Number(postForm.qty),
          uomId: (selectedWo as any).uomId || 'PCS',
        });
      }
      setExecutionMode(null);
      setSelectedWo(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Execution posting failed');
    }
  };

  const kanbanItems: WorkOrderKanbanItem[] = workOrders.map((wo, idx) => ({
    id: wo.id,
    docNo: wo.docNo,
    itemCode: wo.itemCode,
    itemName: wo.itemName,
    qtyPlanned: wo.qtyPlanned,
    qtyCompleted: wo.qtyCompleted,
    status: (wo.status as any) || 'draft',
    priority: idx % 3 === 0 ? 3 : idx % 2 === 0 ? 2 : 1,
    machineName: idx === 1 ? 'Furnace #1 (Induction)' : undefined,
    hasDowntimeAlert: idx === 1,
    downtimeReason: idx === 1 ? 'Cooling Jacket Sensor Warning' : undefined,
  }));

  const woTableColumns: ColumnDef<WorkOrderItem>[] = [
    {
      key: 'docNo',
      header: 'Doc No',
      accessor: (w) => <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{w.docNo}</span>,
      sortable: true,
      mono: true,
    },
    {
      key: 'itemName',
      header: 'Output Item',
      accessor: (w) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-slate-100">{w.itemName}</div>
          <div className="text-xs font-mono text-slate-400">{w.itemCode}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'qtyPlanned',
      header: 'Planned Qty',
      accessor: (w) => <span className="font-mono">{w.qtyPlanned} {w.itemUom}</span>,
      sortable: true,
      align: 'right',
      mono: true,
    },
    {
      key: 'qtyCompleted',
      header: 'Completed',
      accessor: (w) => {
        const percent = Math.min(100, Math.round((w.qtyCompleted / Math.max(1, w.qtyPlanned)) * 100));
        return (
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">{w.qtyCompleted} ({percent}%)</span>
            <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
              <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${percent}%` }} />
            </div>
          </div>
        );
      },
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (w) => (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
          {w.status}
        </span>
      ),
      sortable: true,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Manufacturing KPI Summary Cards */}
        {kpis && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Work Orders</p>
              <p className="mt-1 text-2xl font-bold font-mono text-slate-900">{kpis.totalOrders}</p>
              <p className="mt-1 text-xs text-indigo-600 font-semibold">{kpis.activeOrders} active / in-progress</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Yield %</p>
              <p className="mt-1 text-2xl font-bold font-mono text-emerald-600">{kpis.overallYield}%</p>
              <p className="mt-1 text-xs text-slate-500">Planned vs Output Ratio</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Produced (FG)</p>
              <p className="mt-1 text-2xl font-bold font-mono text-slate-900">{kpis.totalProduced} MT</p>
              <p className="mt-1 text-xs text-slate-500">From {kpis.completedOrders} completed WOs</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Energy & Scrap</p>
              <p className="mt-1 text-2xl font-bold font-mono text-amber-600">{kpis.totalEnergyKwh} kWh</p>
              <p className="mt-1 text-xs text-slate-500">{kpis.totalScrap} MT scrap logged</p>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex bg-slate-100 p-1 rounded-xl w-fit space-x-1 border border-slate-200">
                <button
                  onClick={() => setActiveTab('workOrders')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'workOrders'
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'
                  }`}
                >
                  Work Orders Board
                </button>
                <button
                  onClick={() => setActiveTab('gantt')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'gantt'
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'
                  }`}
                >
                  Gantt Capacity Scheduler (MES)
                </button>
                <button
                  onClick={() => setActiveTab('machines')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'machines'
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'
                  }`}
                >
                  Machine States & OEE (MES)
                </button>
                <button
                  onClick={() => setActiveTab('boms')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'boms'
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'
                  }`}
                >
                  BOM Hierarchy Explosion
                </button>
              </div>

              {/* View Mode Toggle for Work Orders */}
              {activeTab === 'workOrders' && (
                <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5">
                  <button
                    onClick={() => setWoViewMode('kanban')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded ${
                      woViewMode === 'kanban' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    📊 Kanban Scheduling
                  </button>
                  <button
                    onClick={() => setWoViewMode('table')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded ${
                      woViewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    ≡ Virtual Table
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowCreateWo(true)}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-xs"
            >
              + Create Work Order
            </button>
          </div>

          {activeTab === 'gantt' && <GanttScheduler />}

          {activeTab === 'machines' && <MachineStateTracker />}

          {loading && <p className="text-xs text-slate-500">Loading manufacturing records...</p>}
          {error && <p className="text-xs text-red-600">{error}</p>}

          {!loading && activeTab === 'workOrders' && (
            <>
              {woViewMode === 'kanban' ? (
                <KanbanBoard
                  items={kanbanItems}
                  onStatusChange={handleStatusChange}
                />
              ) : (
                <VirtualDataTable
                  title="Work Order Production Queue"
                  data={workOrders}
                  columns={woTableColumns}
                  exportFileName="work_orders"
                />
              )}
            </>
          )}

          {!loading && activeTab === 'boms' && (
            <div className="space-y-6">
              {boms.map((b) => (
                <BomTreeViewer
                  key={b.id}
                  targetQuantity={100}
                  bom={{
                    id: b.id,
                    parentItemCode: b.parentItemCode,
                    parentItemName: b.parentItemName,
                    version: b.version,
                    isActive: b.isActive,
                    components: b.lines.map((l, idx) => ({
                      id: l.id,
                      itemCode: l.componentItemCode,
                      itemName: l.componentItemName,
                      qty: l.qty,
                      uom: l.uomSymbol,
                      scrapPercent: idx % 2 === 0 ? 2.5 : 0,
                      sequence: l.sequence ?? 1,
                    })),
                  }}
                />
              ))}
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
