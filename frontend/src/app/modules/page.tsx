'use client';

import { useState } from 'react';
import { SessionPanel } from '../../components/auth/SessionPanel.js';
import { ModuleCatalogPanel } from '../../components/modules/ModuleCatalogPanel.js';
import { CustomFieldManagerPanel } from '../../components/modules/CustomFieldManagerPanel.js';

export default function ModulesPage() {
  const [activeTab, setActiveTab] = useState<'entitlements' | 'customFields'>('entitlements');

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <SessionPanel />

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex border-b border-slate-200 pb-4 mb-6">
            <button
              onClick={() => setActiveTab('entitlements')}
              className={`mr-4 pb-2 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'entitlements'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Module Entitlements & Features
            </button>
            <button
              onClick={() => setActiveTab('customFields')}
              className={`pb-2 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'customFields'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Tenant Custom Metadata Fields
            </button>
          </div>

          {activeTab === 'entitlements' ? <ModuleCatalogPanel /> : <CustomFieldManagerPanel />}
        </div>
      </div>
    </main>
  );
}
