'use client';

import { useState } from 'react';
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
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl space-y-6">

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl w-fit space-x-1 border border-slate-200">
              <button
                onClick={() => setActiveTab('balances')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'balances'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'
                }`}
              >
                On-Hand Stock Balances
              </button>
              <button
                onClick={() => setActiveTab('bins')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'bins'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'
                }`}
              >
                Multi-Bin Locations (WMS)
              </button>
              <button
                onClick={() => setActiveTab('genealogy')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'genealogy'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'
                }`}
              >
                Lot Genealogy Trace (WMS)
              </button>
              <button
                onClick={() => setActiveTab('catalog')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'catalog'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'
                }`}
              >
                Item Master Catalog
              </button>
              <button
                onClick={() => setActiveTab('warehouses')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'warehouses'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'
                }`}
              >
                Warehouses & UOMs
              </button>
              <button
                onClick={() => setActiveTab('ledger')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'ledger'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'
                }`}
              >
                Stock Ledger Audit Trail
              </button>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setModalMode('transfer')}
                className="rounded-md bg-indigo-50 border border-indigo-200 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                + Stock Transfer
              </button>
              <button
                onClick={() => setModalMode('adjustment')}
                className="rounded-md bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-900 transition-colors shadow-sm"
              >
                + Stock Adjustment
              </button>
            </div>
          </div>

          {/* Active Tab Panel */}
          <div key={refreshKey}>
            {activeTab === 'balances' && <StockBalancePanel />}
            {activeTab === 'bins' && <BinLocationPanel />}
            {activeTab === 'genealogy' && <LotGenealogyViewer />}
            {activeTab === 'catalog' && <ItemCatalogPanel />}
            {activeTab === 'warehouses' && <WarehousePanel />}
            {activeTab === 'ledger' && <StockLedgerPanel />}
          </div>
        </div>
      </div>

      {/* Stock Movement Modal */}
      {modalMode && (
        <StockMovementModal
          mode={modalMode}
          onClose={() => setModalMode(null)}
          onSuccess={() => setRefreshKey((prev) => prev + 1)}
        />
      )}
    </main>
  );
}
