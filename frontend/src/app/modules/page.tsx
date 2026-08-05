'use client';

import { useState } from 'react';
import { ModuleCatalogPanel } from '@/components/modules/ModuleCatalogPanel';
import { CustomFieldManagerPanel } from '@/components/modules/CustomFieldManagerPanel';

import { GarmentsStylePanel } from '@/components/industry/GarmentsStylePanel';
import { DeveloperPlatformPanel } from '@/components/developer/DeveloperPlatformPanel';

export default function ModulesPage() {
  const [activeTab, setActiveTab] = useState<'entitlements' | 'customFields' | 'garments' | 'developer'>('entitlements');

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Dynamic Modules & Extensions</h1>
          <p className="text-xs text-slate-500 mt-0.5">Toggle system features, customize metadata fields, and integrate webhooks.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex bg-slate-100 p-1 rounded-xl w-fit space-x-1 border border-slate-200">
            <button
              onClick={() => setActiveTab('entitlements')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'entitlements'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'
              }`}
            >
              Module Entitlements & Features
            </button>
            <button
              onClick={() => setActiveTab('developer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'developer'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'
              }`}
            >
              Developer Platform & Webhooks
            </button>
            <button
              onClick={() => setActiveTab('garments')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'garments'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'
              }`}
            >
              Garments & Apparel Template
            </button>
            <button
              onClick={() => setActiveTab('customFields')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'customFields'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'
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
  );
}
