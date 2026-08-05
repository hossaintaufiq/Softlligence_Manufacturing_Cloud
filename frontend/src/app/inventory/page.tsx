'use client';

import React, { useState } from 'react';
import { ItemCatalogPanel } from '@/components/inventory/ItemCatalogPanel';
import { WarehousePanel } from '@/components/inventory/WarehousePanel';
import { StockBalancePanel } from '@/components/inventory/StockBalancePanel';
import { StockLedgerPanel } from '@/components/inventory/StockLedgerPanel';
import { StockMovementModal } from '@/components/inventory/StockMovementModal';
import { BinLocationPanel } from '@/components/wms/BinLocationPanel';
import { LotGenealogyViewer } from '@/components/wms/LotGenealogyViewer';

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'warehouses' | 'balances' | 'ledger' | 'bins' | 'genealogy'>('balances');
  const [modalMode, setModalMode] = useState<'transfer' | 'adjustment' | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Inventory & WMS Master</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage stock ledgers, bin configurations, and real-time lot genealogy.</p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setModalMode('transfer')}
            className="rounded-lg bg-indigo-50 border border-indigo-200 px-3.5 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors shadow-2xs"
          >
            + Stock Transfer
          </button>
          <button
            onClick={() => setModalMode('adjustment')}
            className="rounded-lg bg-slate-900 hover:bg-slate-800 px-3.5 py-2 text-xs font-bold text-white transition-colors shadow-sm"
          >
            + Stock Adjustment
          </button>
        </div>
      </div>

      {/* Tab Segmented Bar */}
      <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl w-fit space-x-1 border border-slate-200">
        <button
          onClick={() => setActiveTab('balances')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'balances'
              ? 'bg-white text-indigo-700 shadow-2xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'
          }`}
        >
          Stock Balances
        </button>
        <button
          onClick={() => setActiveTab('bins')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'bins'
              ? 'bg-white text-indigo-700 shadow-2xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'
          }`}
        >
          Bin Locations
        </button>
        <button
          onClick={() => setActiveTab('genealogy')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'genealogy'
              ? 'bg-white text-indigo-700 shadow-2xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'
          }`}
        >
          Lot Genealogy
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'catalog'
              ? 'bg-white text-indigo-700 shadow-2xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'
          }`}
        >
          Item Catalog
        </button>
        <button
          onClick={() => setActiveTab('warehouses')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'warehouses'
              ? 'bg-white text-indigo-700 shadow-2xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'
          }`}
        >
          Warehouses & UOMs
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'ledger'
              ? 'bg-white text-indigo-700 shadow-2xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'
          }`}
        >
          Ledger Audit Trail
        </button>
      </div>

      {/* Main Content Area Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs" key={refreshKey}>
        {activeTab === 'balances' && <StockBalancePanel />}
        {activeTab === 'bins' && <BinLocationPanel />}
        {activeTab === 'genealogy' && <LotGenealogyViewer />}
        {activeTab === 'catalog' && <ItemCatalogPanel />}
        {activeTab === 'warehouses' && <WarehousePanel />}
        {activeTab === 'ledger' && <StockLedgerPanel />}
      </div>

      {/* Stock Movement Modal */}
      {modalMode && (
        <StockMovementModal
          mode={modalMode}
          onClose={() => setModalMode(null)}
          onSuccess={() => setRefreshKey((prev) => prev + 1)}
        />
      )}
    </div>
  );
}
