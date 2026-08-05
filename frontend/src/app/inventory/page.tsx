'use client';

import { useState } from 'react';
import { SessionPanel } from '../../components/auth/SessionPanel.js';
import { ItemCatalogPanel } from '../../components/inventory/ItemCatalogPanel.js';
import { WarehousePanel } from '../../components/inventory/WarehousePanel.js';
import { StockBalancePanel } from '../../components/inventory/StockBalancePanel.js';
import { StockLedgerPanel } from '../../components/inventory/StockLedgerPanel.js';
import { StockMovementModal } from '../../components/inventory/StockMovementModal.js';

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'warehouses' | 'balances' | 'ledger'>('balances');
  const [modalMode, setModalMode] = useState<'transfer' | 'adjustment' | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <SessionPanel />

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex flex-wrap border-b sm:border-b-0 border-slate-200 gap-2">
              <button
                onClick={() => setActiveTab('balances')}
                className={`pb-2 px-1 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === 'balances'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                On-Hand Stock Balances
              </button>
              <button
                onClick={() => setActiveTab('catalog')}
                className={`pb-2 px-1 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === 'catalog'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Item Master Catalog
              </button>
              <button
                onClick={() => setActiveTab('warehouses')}
                className={`pb-2 px-1 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === 'warehouses'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Warehouses & UOMs
              </button>
              <button
                onClick={() => setActiveTab('ledger')}
                className={`pb-2 px-1 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === 'ledger'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
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
