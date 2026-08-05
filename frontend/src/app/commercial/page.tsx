'use client';

import { useState, useEffect } from 'react';
import { SessionPanel } from '@/components/auth/SessionPanel';
import {
  fetchParties,
  fetchPurchaseOrders,
  fetchGrns,
  fetchSalesOrders,
  fetchDispatches,
  fetchCommercialKpis,
  createPartyApi,
  createPurchaseOrderApi,
  postGrnApi,
  createSalesOrderApi,
  postDispatchApi,
  type PartyItem,
  type PurchaseOrderItem,
  type GrnItem,
  type SalesOrderItem,
  type DispatchItem,
  type CommercialKpis,
} from '@/lib/api/commercial';
import { fetchItems, fetchWarehouses, type Item, type Warehouse } from '@/lib/api/inventory';

export default function CommercialPage() {
  const [activeTab, setActiveTab] = useState<'parties' | 'procurement' | 'sales'>('procurement');
  const [parties, setParties] = useState<PartyItem[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderItem[]>([]);
  const [grns, setGrns] = useState<GrnItem[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrderItem[]>([]);
  const [dispatches, setDispatches] = useState<DispatchItem[]>([]);
  const [kpis, setKpis] = useState<CommercialKpis | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal toggles
  const [showCreateParty, setShowCreateParty] = useState(false);
  const [showCreatePo, setShowCreatePo] = useState(false);
  const [showCreateGrn, setShowCreateGrn] = useState(false);
  const [showCreateSo, setShowCreateSo] = useState(false);
  const [showCreateDispatch, setShowCreateDispatch] = useState(false);

  // Forms
  const [partyForm, setPartyForm] = useState({ code: '', name: '', isCustomer: false, isSupplier: true, creditLimit: '', paymentTerms: 'NET30' });
  const [orderForm, setOrderForm] = useState({ partyId: '', itemId: '', qty: '', unitPrice: '' });
  const [receiptForm, setReceiptForm] = useState({ partyId: '', warehouseId: '', itemId: '', qty: '', unitCost: '', vehicleNo: '' });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [partyData, poData, grnData, soData, dispData, kpiData, itemData, whData] = await Promise.all([
        fetchParties(),
        fetchPurchaseOrders(),
        fetchGrns(),
        fetchSalesOrders(),
        fetchDispatches(),
        fetchCommercialKpis(),
        fetchItems(),
        fetchWarehouses(),
      ]);
      setParties(partyData);
      setPurchaseOrders(poData);
      setGrns(grnData);
      setSalesOrders(soData);
      setDispatches(dispData);
      setKpis(kpiData);
      setItems(itemData);
      setWarehouses(whData);
    } catch (err: any) {
      setError(err.message || 'Failed to load commercial data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePartySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPartyApi({
        code: partyForm.code,
        name: partyForm.name,
        isCustomer: partyForm.isCustomer,
        isSupplier: partyForm.isSupplier,
        creditLimit: partyForm.creditLimit ? Number(partyForm.creditLimit) : undefined,
        paymentTerms: partyForm.paymentTerms,
      });
      setShowCreateParty(false);
      setPartyForm({ code: '', name: '', isCustomer: false, isSupplier: true, creditLimit: '', paymentTerms: 'NET30' });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create party');
    }
  };

  const handleCreatePoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const companyId = warehouses[0]?.companyId || 'company-1';
      const targetItem = items.find((i) => i.id === orderForm.itemId) || items[0];
      await createPurchaseOrderApi({
        companyId,
        partyId: orderForm.partyId,
        lines: [
          {
            itemId: orderForm.itemId || targetItem.id,
            uomId: targetItem.uomId,
            qty: Number(orderForm.qty),
            unitPrice: Number(orderForm.unitPrice),
          },
        ],
      });
      setShowCreatePo(false);
      setOrderForm({ partyId: '', itemId: '', qty: '', unitPrice: '' });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create Purchase Order');
    }
  };

  const handlePostGrnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const companyId = warehouses[0]?.companyId || 'company-1';
      const targetItem = items.find((i) => i.id === receiptForm.itemId) || items[0];
      await postGrnApi({
        companyId,
        warehouseId: receiptForm.warehouseId || warehouses[0]?.id,
        partyId: receiptForm.partyId,
        vehicleNo: receiptForm.vehicleNo || undefined,
        lines: [
          {
            itemId: receiptForm.itemId || targetItem.id,
            uomId: targetItem.uomId,
            qtyReceived: Number(receiptForm.qty),
            unitCost: Number(receiptForm.unitCost),
          },
        ],
      });
      setShowCreateGrn(false);
      setReceiptForm({ partyId: '', warehouseId: '', itemId: '', qty: '', unitCost: '', vehicleNo: '' });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to post Goods Receipt Note');
    }
  };

  const handleCreateSoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const companyId = warehouses[0]?.companyId || 'company-1';
      const targetItem = items.find((i) => i.id === orderForm.itemId) || items[0];
      await createSalesOrderApi({
        companyId,
        partyId: orderForm.partyId,
        lines: [
          {
            itemId: orderForm.itemId || targetItem.id,
            uomId: targetItem.uomId,
            qty: Number(orderForm.qty),
            unitPrice: Number(orderForm.unitPrice),
          },
        ],
      });
      setShowCreateSo(false);
      setOrderForm({ partyId: '', itemId: '', qty: '', unitPrice: '' });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create Sales Order');
    }
  };

  const handlePostDispatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const companyId = warehouses[0]?.companyId || 'company-1';
      const targetItem = items.find((i) => i.id === receiptForm.itemId) || items[0];
      await postDispatchApi({
        companyId,
        warehouseId: receiptForm.warehouseId || warehouses[0]?.id,
        partyId: receiptForm.partyId,
        vehicleNo: receiptForm.vehicleNo || undefined,
        lines: [
          {
            itemId: receiptForm.itemId || targetItem.id,
            uomId: targetItem.uomId,
            qty: Number(receiptForm.qty),
            unitPrice: Number(receiptForm.unitCost),
          },
        ],
      });
      setShowCreateDispatch(false);
      setReceiptForm({ partyId: '', warehouseId: '', itemId: '', qty: '', unitCost: '', vehicleNo: '' });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to post Dispatch Challan');
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <SessionPanel />

        {/* Commercial KPI Cards */}
        {kpis && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Trading Parties</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{kpis.customerCount + kpis.supplierCount}</p>
              <p className="mt-1 text-xs text-indigo-600 font-semibold">{kpis.customerCount} Customers / {kpis.supplierCount} Suppliers</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Sales Volume</p>
              <p className="mt-1 text-2xl font-bold text-emerald-600">${kpis.totalSalesVal.toLocaleString()}</p>
              <p className="mt-1 text-xs text-slate-500">{kpis.totalSos} SOs / {kpis.dispatchCount} Dispatches</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Procurement</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">${kpis.totalProcurementVal.toLocaleString()}</p>
              <p className="mt-1 text-xs text-slate-500">{kpis.totalPos} POs / {kpis.grnCount} Receipts</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Open Orders</p>
              <p className="mt-1 text-2xl font-bold text-amber-600">{kpis.openPos + kpis.openSos}</p>
              <p className="mt-1 text-xs text-slate-500">{kpis.openPos} POs / {kpis.openSos} SOs pending</p>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex flex-wrap border-b sm:border-b-0 border-slate-200 gap-2">
              <button
                onClick={() => setActiveTab('procurement')}
                className={`pb-2 px-1 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === 'procurement'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Procurement (POs & GRNs)
              </button>
              <button
                onClick={() => setActiveTab('sales')}
                className={`pb-2 px-1 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === 'sales'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Sales & Dispatches (Challans)
              </button>
              <button
                onClick={() => setActiveTab('parties')}
                className={`pb-2 px-1 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === 'parties'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Customers & Suppliers Master
              </button>
            </div>

            <div className="flex items-center space-x-2">
              {activeTab === 'parties' && (
                <button
                  onClick={() => setShowCreateParty(true)}
                  className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  + Add Party
                </button>
              )}
              {activeTab === 'procurement' && (
                <>
                  <button
                    onClick={() => setShowCreatePo(true)}
                    className="rounded-md bg-indigo-50 border border-indigo-200 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                  >
                    + Create PO
                  </button>
                  <button
                    onClick={() => setShowCreateGrn(true)}
                    className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    + Post GRN (Receipt)
                  </button>
                </>
              )}
              {activeTab === 'sales' && (
                <>
                  <button
                    onClick={() => setShowCreateSo(true)}
                    className="rounded-md bg-indigo-50 border border-indigo-200 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                  >
                    + Create SO
                  </button>
                  <button
                    onClick={() => setShowCreateDispatch(true)}
                    className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    + Post Dispatch (Challan)
                  </button>
                </>
              )}
            </div>
          </div>

          {loading && <p className="text-sm text-slate-500">Loading commercial records...</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {!loading && activeTab === 'parties' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Party Name</th>
                    <th className="px-4 py-3">Role Type</th>
                    <th className="px-4 py-3">Payment Terms</th>
                    <th className="px-4 py-3">Credit Limit</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parties.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-semibold text-slate-900 font-mono">{p.code}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {p.isCustomer && <span className="px-2 py-0.5 rounded text-xs bg-emerald-100 text-emerald-800">Customer</span>}
                          {p.isSupplier && <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">Supplier</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{p.paymentTerms || 'NET30'}</td>
                      <td className="px-4 py-3 font-mono text-xs">${p.creditLimit ? p.creditLimit.toLocaleString() : 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 capitalize">{p.status}</span>
                      </td>
                    </tr>
                  ))}
                  {parties.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-slate-400">No parties found. Click "+ Add Party" to add one.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {!loading && activeTab === 'procurement' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Purchase Orders (POs)</h4>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">PO Number</th>
                        <th className="px-4 py-3">Supplier</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Total Amount</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {purchaseOrders.map((po) => (
                        <tr key={po.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-semibold text-slate-900 font-mono">{po.docNo}</td>
                          <td className="px-4 py-3">{po.supplierName} ({po.supplierCode})</td>
                          <td className="px-4 py-3 font-mono text-xs">{po.docDate}</td>
                          <td className="px-4 py-3 font-mono font-bold text-slate-900">${po.totalAmount.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${po.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                              {po.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Goods Receipts Notes (GRNs)</h4>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">GRN Doc No</th>
                        <th className="px-4 py-3">Supplier</th>
                        <th className="px-4 py-3">Target Warehouse</th>
                        <th className="px-4 py-3">Vehicle No</th>
                        <th className="px-4 py-3">Items Received</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {grns.map((g) => (
                        <tr key={g.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-semibold text-slate-900 font-mono">{g.docNo}</td>
                          <td className="px-4 py-3">{g.supplierName}</td>
                          <td className="px-4 py-3">{g.warehouseName}</td>
                          <td className="px-4 py-3 font-mono text-xs">{g.vehicleNo || 'N/A'}</td>
                          <td className="px-4 py-3">
                            {g.lines.map((l, idx) => (
                              <span key={idx} className="text-xs font-mono font-medium block">
                                {l.itemName}: {l.qtyReceived} {l.uomSymbol}
                              </span>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {!loading && activeTab === 'sales' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sales Orders (SOs)</h4>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">SO Number</th>
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Total Amount</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {salesOrders.map((so) => (
                        <tr key={so.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-semibold text-slate-900 font-mono">{so.docNo}</td>
                          <td className="px-4 py-3">{so.customerName} ({so.customerCode})</td>
                          <td className="px-4 py-3 font-mono text-xs">{so.docDate}</td>
                          <td className="px-4 py-3 font-mono font-bold text-slate-900">${so.totalAmount.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${so.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'}`}>
                              {so.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Dispatches / Delivery Challans</h4>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Challan No</th>
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3">Source Warehouse</th>
                        <th className="px-4 py-3">Vehicle No</th>
                        <th className="px-4 py-3">Dispatched Items</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {dispatches.map((d) => (
                        <tr key={d.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-semibold text-slate-900 font-mono">{d.docNo}</td>
                          <td className="px-4 py-3">{d.customerName}</td>
                          <td className="px-4 py-3">{d.warehouseName}</td>
                          <td className="px-4 py-3 font-mono text-xs">{d.vehicleNo || 'N/A'}</td>
                          <td className="px-4 py-3">
                            {d.lines.map((l, idx) => (
                              <span key={idx} className="text-xs font-mono font-medium block">
                                {l.itemName}: {l.qty} {l.uomSymbol}
                              </span>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Add Party */}
      {showCreateParty && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Add Customer / Supplier Party</h3>
            <form onSubmit={handleCreatePartySubmit} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Party Code</label>
                <input
                  type="text"
                  placeholder="e.g. CUST-002 or SUPP-002"
                  value={partyForm.code}
                  onChange={(e) => setPartyForm({ ...partyForm, code: e.target.value })}
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Party Name</label>
                <input
                  type="text"
                  placeholder="Legal Name"
                  value={partyForm.name}
                  onChange={(e) => setPartyForm({ ...partyForm, name: e.target.value })}
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={partyForm.isCustomer}
                    onChange={(e) => setPartyForm({ ...partyForm, isCustomer: e.target.checked })}
                  />
                  <span>Is Customer</span>
                </label>
                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={partyForm.isSupplier}
                    onChange={(e) => setPartyForm({ ...partyForm, isSupplier: e.target.checked })}
                  />
                  <span>Is Supplier</span>
                </label>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowCreateParty(false)} className="px-4 py-2 rounded-md border border-slate-300 text-xs font-semibold text-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-md bg-indigo-600 text-white text-xs font-semibold">Save Party</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Create PO / SO */}
      {(showCreatePo || showCreateSo) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">{showCreatePo ? 'Create Purchase Order' : 'Create Sales Order'}</h3>
            <form onSubmit={showCreatePo ? handleCreatePoSubmit : handleCreateSoSubmit} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">{showCreatePo ? 'Select Supplier' : 'Select Customer'}</label>
                <select
                  value={orderForm.partyId}
                  onChange={(e) => setOrderForm({ ...orderForm, partyId: e.target.value })}
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Select Party --</option>
                  {parties
                    .filter((p) => (showCreatePo ? p.isSupplier : p.isCustomer))
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Item</label>
                <select
                  value={orderForm.itemId}
                  onChange={(e) => setOrderForm({ ...orderForm, itemId: e.target.value })}
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Select Item --</option>
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Quantity</label>
                  <input
                    type="number"
                    step="any"
                    value={orderForm.qty}
                    onChange={(e) => setOrderForm({ ...orderForm, qty: e.target.value })}
                    required
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Unit Price ($)</label>
                  <input
                    type="number"
                    step="any"
                    value={orderForm.unitPrice}
                    onChange={(e) => setOrderForm({ ...orderForm, unitPrice: e.target.value })}
                    required
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => { setShowCreatePo(false); setShowCreateSo(false); }} className="px-4 py-2 rounded-md border border-slate-300 text-xs font-semibold text-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-md bg-indigo-600 text-white text-xs font-semibold">Save Order</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Post GRN / Dispatch */}
      {(showCreateGrn || showCreateDispatch) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">{showCreateGrn ? 'Post Goods Receipt (GRN)' : 'Post Dispatch (Challan)'}</h3>
            <form onSubmit={showCreateGrn ? handlePostGrnSubmit : handlePostDispatchSubmit} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">{showCreateGrn ? 'Select Supplier' : 'Select Customer'}</label>
                <select
                  value={receiptForm.partyId}
                  onChange={(e) => setReceiptForm({ ...receiptForm, partyId: e.target.value })}
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Select Party --</option>
                  {parties
                    .filter((p) => (showCreateGrn ? p.isSupplier : p.isCustomer))
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Target Warehouse</label>
                <select
                  value={receiptForm.warehouseId}
                  onChange={(e) => setReceiptForm({ ...receiptForm, warehouseId: e.target.value })}
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Select Warehouse --</option>
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.name} ({wh.code}) [{wh.type}]
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Item</label>
                <select
                  value={receiptForm.itemId}
                  onChange={(e) => setReceiptForm({ ...receiptForm, itemId: e.target.value })}
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Select Item --</option>
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Quantity</label>
                  <input
                    type="number"
                    step="any"
                    value={receiptForm.qty}
                    onChange={(e) => setReceiptForm({ ...receiptForm, qty: e.target.value })}
                    required
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Vehicle No (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. TRK-8812"
                    value={receiptForm.vehicleNo}
                    onChange={(e) => setReceiptForm({ ...receiptForm, vehicleNo: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => { setShowCreateGrn(false); setShowCreateDispatch(false); }} className="px-4 py-2 rounded-md border border-slate-300 text-xs font-semibold text-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-md bg-emerald-600 text-white text-xs font-semibold">Confirm Posting</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
