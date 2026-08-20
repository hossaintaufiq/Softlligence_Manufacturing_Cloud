'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

type WorkOrder = {
  id: string;
  docNo: string;
  tenantId: string;
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled';
  item: string;
  qtyPlanned: number;
  qtyCompleted: number;
  occurredAt: string;
};

type InventoryItem = {
  id: string;
  name: string;
  type: string;
  qty: number;
  uom: string;
  tenantId: string;
};

export default function TenantDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // Local state representing database queries
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  
  // Modals State
  const [showWoModal, setShowWoModal] = useState(false);
  const [showInvModal, setShowInvModal] = useState(false);

  // Form states
  const [woItem, setWoItem] = useState('');
  const [woQty, setWoQty] = useState('');
  const [woDocNo, setWoDocNo] = useState('');
  const [woError, setWoError] = useState<string | null>(null);

  const [invName, setInvName] = useState('');
  const [invType, setInvType] = useState('Raw Material');
  const [invQty, setInvQty] = useState('');
  const [invUom, setInvUom] = useState('MT');
  const [invError, setInvError] = useState<string | null>(null);

  // Security guard redirect if not authorized
  useEffect(() => {
    if (!loading && (!user || (user.role !== 'tenant-admin' && user.role !== 'tenant-operator'))) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  // Load tenant specific data
  const loadTenantData = () => {
    if (!user?.tenantId) return;

    const allWos = localStorage.getItem('smc_work_orders');
    if (allWos) {
      const parsed = JSON.parse(allWos) as WorkOrder[];
      setWorkOrders(parsed.filter((w) => w.tenantId === user.tenantId));
    }

    const allInv = localStorage.getItem('smc_inventory');
    if (allInv) {
      const parsed = JSON.parse(allInv) as InventoryItem[];
      setInventory(parsed.filter((i) => i.tenantId === user.tenantId));
    }
  };

  useEffect(() => {
    loadTenantData();
  }, [user]);

  if (loading || !user || !user.tenantId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-mono text-xs">
        Loading Corporate Workspace...
      </div>
    );
  }

  // Statistics
  const totalOrders = workOrders.length;
  const activeOrders = workOrders.filter((w) => w.status === 'in_progress').length;
  const completedOrders = workOrders.filter((w) => w.status === 'completed').length;
  const rawMaterialTons = inventory
    .filter((i) => i.type === 'Raw Material')
    .reduce((sum, item) => sum + item.qty, 0);

  // Handlers
  const handleAddWorkOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!woItem || !woQty || !woDocNo) {
      setWoError('Please fill in all fields.');
      return;
    }

    const allWos = JSON.parse(localStorage.getItem('smc_work_orders') || '[]') as WorkOrder[];
    const docExists = allWos.some((w) => w.docNo.trim().toLowerCase() === woDocNo.trim().toLowerCase() && w.tenantId === user.tenantId);
    if (docExists) {
      setWoError(`Work order number "${woDocNo}" already exists in your workspace.`);
      return;
    }

    const newWo: WorkOrder = {
      id: Math.random().toString(36).substr(2, 9),
      docNo: woDocNo.trim(),
      tenantId: user.tenantId!,
      status: 'draft',
      item: woItem,
      qtyPlanned: Number(woQty),
      qtyCompleted: 0,
      occurredAt: new Date().toISOString(),
    };

    const updated = [...allWos, newWo];
    localStorage.setItem('smc_work_orders', JSON.stringify(updated));
    setWorkOrders(updated.filter((w) => w.tenantId === user.tenantId));

    // Reset Form
    setWoItem('');
    setWoQty('');
    setWoDocNo('');
    setWoError(null);
    setShowWoModal(false);
  };

  const handleAddInventory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invName || !invQty || !invUom) {
      setInvError('Please fill in all required fields.');
      return;
    }

    const allInv = JSON.parse(localStorage.getItem('smc_inventory') || '[]') as InventoryItem[];
    const existing = allInv.find((i) => i.name.trim().toLowerCase() === invName.trim().toLowerCase() && i.tenantId === user.tenantId);

    let updated: InventoryItem[];
    if (existing) {
      updated = allInv.map((i) => {
        if (i.id === existing.id) {
          return { ...i, qty: i.qty + Number(invQty) };
        }
        return i;
      });
    } else {
      const newItem: InventoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        name: invName.trim(),
        type: invType,
        qty: Number(invQty),
        uom: invUom,
        tenantId: user.tenantId!,
      };
      updated = [...allInv, newItem];
    }

    localStorage.setItem('smc_inventory', JSON.stringify(updated));
    setInventory(updated.filter((i) => i.tenantId === user.tenantId));

    // Reset Form
    setInvName('');
    setInvQty('');
    setInvError(null);
    setShowInvModal(false);
  };

  const cycleWoStatus = (woId: string, currentStatus: WorkOrder['status']) => {
    const allStatusOrder: WorkOrder['status'][] = ['draft', 'in_progress', 'completed', 'cancelled'];
    const nextIndex = (allStatusOrder.indexOf(currentStatus) + 1) % allStatusOrder.length;
    const nextStatus = allStatusOrder[nextIndex];

    const allWos = JSON.parse(localStorage.getItem('smc_work_orders') || '[]') as WorkOrder[];
    const updated = allWos.map((w) => {
      if (w.id === woId) {
        const qtyCompleted = nextStatus === 'completed' ? Number((w.qtyPlanned * (0.95 + Math.random() * 0.08)).toFixed(1)) : w.qtyCompleted;
        return { ...w, status: nextStatus, qtyCompleted };
      }
      return w;
    });

    localStorage.setItem('smc_work_orders', JSON.stringify(updated));
    setWorkOrders(updated.filter((w) => w.tenantId === user.tenantId));
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-800 flex flex-col font-sans">
      {/* Header Banner */}
      <header className="bg-white/85 backdrop-blur-md border-b border-slate-200/60 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <div className="flex items-center space-x-3">
          <span className="text-xl">🏢</span>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 leading-none">
              {user.tenantName}
            </h1>
            <p className="text-[9px] text-[#B48F48] font-mono tracking-wider uppercase mt-1.5 font-bold">
              Workspace Core Module / {user.role === 'tenant-admin' ? 'Admin Mode' : 'Operator Mode'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900">
              {user.name} <span className="text-[9px] bg-slate-100 text-[#B48F48] border border-slate-200/60 px-1.5 py-0.5 rounded font-mono font-bold ml-1 capitalize">{user.role.split('-')[1]}</span>
            </p>
            <p className="text-[10px] text-slate-500 font-mono font-medium">{user.email}</p>
          </div>
          <button
            onClick={logout}
            className="px-3.5 py-1.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-600 text-xs font-bold rounded-xl transition-all shadow-xs"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
        
        {/* KPI Panel */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">
              Total Work Orders
            </p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1.5 font-mono">{totalOrders}</h3>
            <p className="text-[9px] text-slate-400 font-bold mt-1 font-mono">OPERATIONAL HIST</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">
              Active Orders
            </p>
            <h3 className="text-2xl font-extrabold text-indigo-600 mt-1.5 font-mono">{activeOrders}</h3>
            <p className="text-[9px] text-slate-400 font-bold mt-1 font-mono">ON SHOP FLOOR</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">
              Completed Orders
            </p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1.5 font-mono">{completedOrders}</h3>
            <p className="text-[9px] text-slate-400 font-bold mt-1 font-mono">SHIPPED & METED</p>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">
              Raw Scrap Yard
            </p>
            <h3 className="text-2xl font-extrabold text-amber-600 mt-1.5 font-mono">
              {rawMaterialTons.toLocaleString()} <span className="text-xs text-slate-400">MT</span>
            </h3>
            <p className="text-[9px] text-slate-400 font-bold mt-1 font-mono">CURRENT STOCK</p>
          </div>
        </div>

        {/* Dynamic Dual Module Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Work Orders Module (Takes 7/12) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Work Orders</h2>
                <p className="text-[10px] text-slate-500">Track and dispatch manufacturing runs.</p>
              </div>
              <button
                onClick={() => setShowWoModal(true)}
                className="px-3.5 py-1.5 bg-[#C5A059] hover:bg-[#B48F48] text-white text-xs font-bold rounded-xl transition-all shadow-md"
              >
                + Create WO
              </button>
            </div>

            {/* Work Orders Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200/85 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                      <th className="px-4 py-3">Doc No</th>
                      <th className="px-4 py-3">Item Master</th>
                      <th className="px-4 py-3 text-right">Planned (MT)</th>
                      <th className="px-4 py-3 text-right">Completed (MT)</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    {workOrders.map((wo) => (
                      <tr key={wo.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 text-indigo-600 font-mono font-bold">{wo.docNo}</td>
                        <td className="px-4 py-3 text-slate-950 font-bold">{wo.item}</td>
                        <td className="px-4 py-3 text-right font-mono">{wo.qtyPlanned}</td>
                        <td className="px-4 py-3 text-right font-mono text-slate-400">{wo.qtyCompleted || '-'}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => cycleWoStatus(wo.id, wo.status)}
                            className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase font-mono tracking-wider border cursor-pointer select-none transition-all active:scale-95 ${
                              wo.status === 'completed'
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                : wo.status === 'in_progress'
                                ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'
                                : wo.status === 'cancelled'
                                ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                                : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                            }`}
                          >
                            {wo.status.replace('_', ' ')}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {workOrders.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-[10px] text-slate-400 font-mono">
                          No work orders cataloged.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Inventory Core Module (Takes 5/12) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Stock Balances</h2>
                <p className="text-[10px] text-slate-500">Real-time inventory levels.</p>
              </div>
              <button
                onClick={() => setShowInvModal(true)}
                className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-xs"
              >
                + Update Stock
              </button>
            </div>

            {/* Inventory List Cards */}
            <div className="space-y-3.5">
              {inventory.map((inv) => (
                <div
                  key={inv.id}
                  className="p-4 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-between shadow-xs"
                >
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-950">{inv.name}</h4>
                    <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-extrabold">
                      {inv.type}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-slate-900 font-mono">
                      {inv.qty.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-extrabold text-slate-400 font-mono ml-1">
                      {inv.uom}
                    </span>
                  </div>
                </div>
              ))}
              {inventory.length === 0 && (
                <p className="text-center text-[10px] text-slate-400 font-mono py-8 bg-white border border-slate-200 rounded-2xl">
                  No stock entries registered.
                </p>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* WO Create Modal */}
      {showWoModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-2xl max-w-md w-full space-y-6 animate-zoom-in text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Issue Production Run (WO)</h3>
              <button
                onClick={() => {
                  setShowWoModal(false);
                  setWoError(null);
                }}
                className="text-slate-400 hover:text-slate-800 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {woError && (
              <div className="p-3 bg-rose-500/5 border border-rose-500/20 text-rose-700 text-xs font-bold rounded-xl">
                {woError}
              </div>
            )}

            <form onSubmit={handleAddWorkOrder} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-550 font-mono uppercase tracking-wider">Work Order No</label>
                <input
                  type="text"
                  placeholder="e.g. WO-2026-092"
                  value={woDocNo}
                  onChange={(e) => setWoDocNo(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] text-sm font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-550 font-mono uppercase tracking-wider">Item Name / Specification</label>
                <input
                  type="text"
                  placeholder="e.g. 12mm Deformed Steel Bar"
                  value={woItem}
                  onChange={(e) => setWoItem(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] text-sm font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-550 font-mono uppercase tracking-wider">Planned Target Quantity (MT)</label>
                <input
                  type="number"
                  placeholder="e.g. 150"
                  value={woQty}
                  onChange={(e) => setWoQty(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] text-sm font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#C5A059] hover:bg-[#B48F48] text-white font-bold rounded-xl transition-all text-sm shadow-md"
              >
                Log to Manufacturing Ledger
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Inventory Create Modal */}
      {showInvModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-2xl max-w-md w-full space-y-6 animate-zoom-in text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Receive / Adjust Stock</h3>
              <button
                onClick={() => {
                  setShowInvModal(false);
                  setInvError(null);
                }}
                className="text-slate-400 hover:text-slate-800 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {invError && (
              <div className="p-3 bg-rose-500/5 border border-rose-500/20 text-rose-700 text-xs font-bold rounded-xl">
                {invError}
              </div>
            )}

            <form onSubmit={handleAddInventory} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-550 font-mono uppercase tracking-wider">Item Name</label>
                <input
                  type="text"
                  placeholder="e.g. Heavy Melting Scrap"
                  value={invName}
                  onChange={(e) => setInvName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] text-sm font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-550 font-mono uppercase tracking-wider">Category Type</label>
                <select
                  value={invType}
                  onChange={(e) => setInvType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-[#C5A059] text-sm font-medium"
                >
                  <option value="Raw Material">Raw Material</option>
                  <option value="WIP">WIP (Work In Progress)</option>
                  <option value="Finished Good">Finished Good</option>
                  <option value="Spare Part">Spare Part / Consumable</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-550 font-mono uppercase tracking-wider">Weight / Qty</label>
                  <input
                    type="number"
                    placeholder="e.g. 50"
                    value={invQty}
                    onChange={(e) => setInvQty(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] text-sm font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#FAF9F6] font-mono uppercase tracking-wider">Unit of Measure (UoM)</label>
                  <select
                    value={invUom}
                    onChange={(e) => setInvUom(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-[#C5A059] text-sm font-medium"
                  >
                    <option value="MT">MT (Metric Ton)</option>
                    <option value="KG">KG (Kilograms)</option>
                    <option value="PCS">PCS (Pieces)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#C5A059] hover:bg-[#B48F48] text-white font-bold rounded-xl transition-all text-sm shadow-md"
              >
                Record Entry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
