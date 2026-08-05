'use client';

import { useState } from 'react';
import { ModuleCatalogPanel } from '@/components/modules/ModuleCatalogPanel';
import { CustomFieldManagerPanel } from '@/components/modules/CustomFieldManagerPanel';

import { GarmentsStylePanel } from '@/components/industry/GarmentsStylePanel';
import { DeveloperPlatformPanel } from '@/components/developer/DeveloperPlatformPanel';

export default function ModulesPage() {
  const [activeTab, setActiveTab] = useState<'entitlements' | 'customFields' | 'garments' | 'developer'>('entitlements');

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex border-b border-slate-200 pb-4">
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
              onClick={() => setActiveTab('developer')}
              className={`mr-4 pb-2 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'developer'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Developer Platform & Webhooks
            </button>
            <button
              onClick={() => setActiveTab('garments')}
              className={`mr-4 pb-2 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'garments'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Garments & Apparel Template
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

          {activeTab === 'entitlements' && <ModuleCatalogPanel />}
          {activeTab === 'developer' && <DeveloperPlatformPanel />}
          {activeTab === 'garments' && <GarmentsStylePanel />}
          {activeTab === 'customFields' && <CustomFieldManagerPanel />}
        </div>
      </div>
    </main>
  );
}
