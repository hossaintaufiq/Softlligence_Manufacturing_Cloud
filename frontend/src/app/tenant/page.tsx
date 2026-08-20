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

type TabType = 'overview' | 'work-orders' | 'inventory';

export default function TenantDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // Local state representing database queries
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
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
    if (!loading && (!user || user.role !== 'tenant-admin')) {
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
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] text-slate-400 font-mono text-xs">
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

  const SidebarContent = () => (
    <>
      <div className="flex flex-col">
        {/* Sidebar Header Brand */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-white to-slate-50/40">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-[#FAF6EE] border border-[#C5A059]/20 flex items-center justify-center text-sm shadow-xs">
              🏢
            </div>
            <div className="leading-none overflow-hidden max-w-[140px]">
              <h2 className="text-xs font-black text-slate-900 truncate">
                {user.tenantName || 'Workspace'}
              </h2>
              <p className="text-[8px] text-[#B48F48] font-mono tracking-wider uppercase font-extrabold mt-1">
                Workspace Node
              </p>
            </div>
          </div>
          {/* Close button for Mobile */}
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="block lg:hidden text-slate-400 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5 flex-1">
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest px-2.5 pb-2 font-mono">
            Manufacturing ERP
          </p>

          <button
            onClick={() => {
              setActiveTab('overview');
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'overview'
                ? 'bg-[#FAF6EE]/60 text-[#B48F48]'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            {activeTab === 'overview' && (
              <div className="absolute left-0 top-2.5 w-1 h-5 bg-[#C5A059] rounded-r" />
            )}
            <span>📊</span>
            <span>Workspace Overview</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('work-orders');
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'work-orders'
                ? 'bg-[#FAF6EE]/60 text-[#B48F48]'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            {activeTab === 'work-orders' && (
              <div className="absolute left-0 top-2.5 w-1 h-5 bg-[#C5A059] rounded-r" />
            )}
            <span>⚙️</span>
            <span>Work Orders List</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('inventory');
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'inventory'
                ? 'bg-[#FAF6EE]/60 text-[#B48F48]'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            {activeTab === 'inventory' && (
              <div className="absolute left-0 top-2.5 w-1 h-5 bg-[#C5A059] rounded-r" />
            )}
            <span>📦</span>
            <span>Stock Balances</span>
          </button>
        </nav>
      </div>

      {/* Sidebar Footer User Details */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FAF6EE] border border-[#C5A059]/30 flex items-center justify-center font-bold text-[10px] text-[#B48F48]">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="leading-tight">
              <p className="text-[10px] font-black text-slate-900">{user.name}</p>
              <span className="inline-flex px-1.5 py-0.2 bg-slate-100 text-[#B48F48] rounded text-[8px] font-bold uppercase tracking-wider font-mono">
                {user.role.split('-')[1]}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full py-2 bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-600 text-[10px] font-bold rounded-xl transition-all shadow-xs flex items-center justify-center space-x-1"
        >
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="h-screen w-screen flex bg-[#FAF9F6] text-slate-800 font-sans overflow-hidden relative">
      
      {/* DESKTOP SIDEBAR NAVIGATION (Visible on lg screens) */}
      <aside className="hidden lg:flex w-64 h-full bg-white border-r border-slate-200/80 flex-col justify-between flex-shrink-0 z-10">
        <SidebarContent />
      </aside>

      {/* MOBILE SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* MOBILE SIDEBAR SLIDE PANEL */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 w-64 bg-white border-r border-slate-200/80 z-50 flex flex-col justify-between transition-transform duration-300 transform lg:hidden ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* MAIN CONTENT AREA: Right Side */}
      <div className="flex-1 h-full flex flex-col overflow-hidden">
        
        {/* Top Header Breadcrumbs */}
        <header className="h-14 border-b border-slate-200/60 bg-white/50 backdrop-blur-xs flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="block lg:hidden p-1 text-slate-500 hover:bg-slate-100 rounded-lg focus:outline-none"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-2 text-[10px] font-semibold text-slate-400 font-mono">
              <span>SMC</span>
              <span>/</span>
              <span className="truncate max-w-[80px]">{(user.tenantName || 'Workspace').toUpperCase()}</span>
              <span>/</span>
              <span className="text-slate-800 capitalize font-bold">{activeTab}</span>
            </div>
          </div>
          <div className="text-[10px] font-bold text-slate-400 font-mono uppercase hidden sm:block">
            ROLE: {user.role.replace('-', ' ')}
          </div>
        </header>

        {/* Scrollable Dashboard View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8 bg-slate-50/50">
          
          {/* COMMON KPI PANEL for overview and stats reference */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                
                <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">
                    Total Work Orders
                  </p>
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-1.5 font-mono">{totalOrders}</h3>
                  <p className="text-[9px] text-slate-400 font-bold mt-1 font-mono">OPERATIONAL HIST</p>
                </div>

                <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">
                    Active Orders
                  </p>
                  <h3 className="text-2xl font-extrabold text-indigo-600 mt-1.5 font-mono">{activeOrders}</h3>
                  <p className="text-[9px] text-slate-400 font-bold mt-1 font-mono">ON SHOP FLOOR</p>
                </div>

                <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">
                    Completed Orders
                  </p>
                  <h3 className="text-2xl font-extrabold text-emerald-600 mt-1.5 font-mono">{completedOrders}</h3>
                  <p className="text-[9px] text-slate-400 font-bold mt-1 font-mono">SHIPPED & METED</p>
                </div>

                <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">
                    Raw Scrap Yard
                  </p>
                  <h3 className="text-2xl font-extrabold text-amber-600 mt-1.5 font-mono">
                    {rawMaterialTons.toLocaleString()} <span className="text-xs text-slate-450">MT</span>
                  </h3>
                  <p className="text-[9px] text-slate-400 font-bold mt-1 font-mono">CURRENT STOCK</p>
                </div>
              </div>

              {/* Sub-KPI Graph Mockups */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">Shop floor melt yield</h3>
                  <div className="h-32 flex items-end space-x-2.5 pb-2">
                    <div className="w-full bg-[#FAF6EE] border border-[#C5A059]/25 h-[85%] rounded flex flex-col justify-end text-center pb-1"><span className="text-[9px] font-mono text-[#B48F48] font-bold">94.2%</span></div>
                    <div className="w-full bg-[#FAF6EE] border border-[#C5A059]/25 h-[90%] rounded flex flex-col justify-end text-center pb-1"><span className="text-[9px] font-mono text-[#B48F48] font-bold">94.8%</span></div>
                    <div className="w-full bg-[#FAF6EE] border border-[#C5A059]/25 h-[88%] rounded flex flex-col justify-end text-center pb-1"><span className="text-[9px] font-mono text-[#B48F48] font-bold">94.5%</span></div>
                    <div className="w-full bg-[#FAF6EE] border border-[#C5A059]/25 h-[95%] rounded flex flex-col justify-end text-center pb-1"><span className="text-[9px] font-mono text-[#B48F48] font-bold">95.2%</span></div>
                  </div>
                  <p className="text-[9px] text-slate-400 font-bold text-center uppercase font-mono">LAST 4 MELTING RUNS</p>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-sm flex flex-col justify-between">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">Active Workspaces Telemetry</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-2 gap-3">
                      <span className="text-slate-500 font-medium">BOM explosion status</span>
                      <span className="font-bold text-emerald-600 font-mono">OK (100% matched)</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500 font-medium">Stock ledger sync status</span>
                      <span className="font-bold text-[#B48F48] font-mono">SYNCED</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'work-orders' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-3 gap-3">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Work Orders Ledger</h2>
                  <p className="text-[11px] text-slate-500">Track and dispatch manufacturing runs.</p>
                </div>
                <button
                  onClick={() => setShowWoModal(true)}
                  className="px-3.5 py-2 bg-[#C5A059] hover:bg-[#B48F48] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center"
                >
                  + Create WO
                </button>
              </div>

              {/* Work Orders Table */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200/85 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                        <th className="px-4 py-3.5">Doc No</th>
                        <th className="px-4 py-3.5">Item Master</th>
                        <th className="px-4 py-3.5 text-right">Planned (MT)</th>
                        <th className="px-4 py-3.5 text-right">Completed (MT)</th>
                        <th className="px-4 py-3.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                      {workOrders.map((wo) => (
                        <tr key={wo.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 text-indigo-600 font-mono font-bold">#{wo.docNo}</td>
                          <td className="px-4 py-3 text-slate-950 font-bold">{wo.item}</td>
                          <td className="px-4 py-3 text-right font-mono">{wo.qtyPlanned}</td>
                          <td className="px-4 py-3 text-right font-mono text-slate-450">{wo.qtyCompleted || '-'}</td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => cycleWoStatus(wo.id, wo.status)}
                              className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase font-mono tracking-wider border cursor-pointer select-none transition-all active:scale-95 ${
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
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-3 gap-3">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Stock Balances</h2>
                  <p className="text-[11px] text-slate-500">Real-time inventory levels.</p>
                </div>
                <button
                  onClick={() => setShowInvModal(true)}
                  className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center"
                >
                  + Receive / Adjust Stock
                </button>
              </div>

              {/* Inventory List Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {inventory.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 bg-white border border-slate-200/80 rounded-2xl flex flex-col justify-between shadow-xs space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-950">{inv.name}</h4>
                        <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-extrabold">
                          {inv.type}
                        </p>
                      </div>
                      <span className="text-lg">📦</span>
                    </div>
                    <div className="text-right border-t border-slate-50 pt-2.5">
                      <span className="text-base font-extrabold text-slate-900 font-mono">
                        {inv.qty.toLocaleString()}
                      </span>
                      <span className="text-[9px] font-extrabold text-slate-400 font-mono ml-1">
                        {inv.uom}
                      </span>
                    </div>
                  </div>
                ))}
                {inventory.length === 0 && (
                  <p className="text-center text-[10px] text-slate-400 font-mono py-8 bg-white border border-slate-200 rounded-2xl col-span-3">
                    No stock entries registered.
                  </p>
                )}
              </div>
            </div>
          )}

        </main>
      </div>

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
                  <label className="text-xs font-bold text-slate-550 font-mono uppercase tracking-wider">Unit of Measure (UoM)</label>
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
