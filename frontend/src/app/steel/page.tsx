'use client';

import { useState, useEffect } from 'react';
import { SessionPanel } from '@/components/auth/SessionPanel';
import {
  fetchScrapReceipts,
  fetchHeatLogs,
  fetchRollingLogs,
  fetchSteelKpis,
  createScrapReceiptApi,
  createHeatLogApi,
  createRollingLogApi,
  importSteelBatchApi,
  type SteelScrapReceiptItem,
  type SteelHeatLogItem,
  type SteelRollingLogItem,
  type SteelKpis,
} from '@/lib/api/steel';
import { fetchParties, type PartyItem } from '@/lib/api/commercial';
import { fetchWarehouses, type Warehouse } from '@/lib/api/inventory';

import { VirtualDataTable, type ColumnDef } from '@/components/enterprise/VirtualDataTable';

export default function SteelPage() {
  const [activeTab, setActiveTab] = useState<'heats' | 'rolling' | 'scrap' | 'import'>('heats');
  const [heats, setHeats] = useState<SteelHeatLogItem[]>([]);
  const [rollingLogs, setRollingLogs] = useState<SteelRollingLogItem[]>([]);
  const [scrapReceipts, setScrapReceipts] = useState<SteelScrapReceiptItem[]>([]);
  const [kpis, setKpis] = useState<SteelKpis | null>(null);
  const [parties, setParties] = useState<PartyItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [showCreateHeat, setShowCreateHeat] = useState(false);
  const [showCreateRolling, setShowCreateRolling] = useState(false);
  const [showCreateScrap, setShowCreateScrap] = useState(false);

  // Forms
  const [heatForm, setHeatForm] = useState({ heatNo: '', furnaceNo: 'Furnace-1', scrapInputKg: '', billetOutputKg: '', powerKwh: '', shift: 'Shift-A' });
  const [rollingForm, setRollingForm] = useState({ heatRef: '', billetInputKg: '', rodOutputKg: '', burningLossKg: '', rodSizeSpec: '12mm Grade 60', shift: 'Shift-A' });
  const [scrapForm, setScrapForm] = useState({ partyId: '', warehouseId: '', gradeCategory: 'Heavy Melting Scrap', receivedKg: '', vehicleNo: '', expenses: '' });

  // Import wizard state
  const [importText, setImportText] = useState('');
  const [importResult, setImportResult] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [hData, rData, sData, kData, partyData, whData] = await Promise.all([
        fetchHeatLogs(),
        fetchRollingLogs(),
        fetchScrapReceipts(),
        fetchSteelKpis(),
        fetchParties('supplier'),
        fetchWarehouses(),
      ]);
      setHeats(hData);
      setRollingLogs(rData);
      setScrapReceipts(sData);
      setKpis(kData);
      setParties(partyData);
      setWarehouses(whData);
    } catch (err: any) {
      setError(err.message || 'Failed to load steel vertical data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateHeatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const companyId = warehouses[0]?.companyId || 'company-1';
      const factoryId = warehouses[0]?.factoryId || 'factory-1';
      await createHeatLogApi({
        companyId,
        factoryId,
        heatNo: heatForm.heatNo,
        furnaceNo: heatForm.furnaceNo,
        scrapInputKg: Number(heatForm.scrapInputKg),
        billetOutputKg: Number(heatForm.billetOutputKg),
        powerKwh: Number(heatForm.powerKwh || 0),
        shift: heatForm.shift,
      });
      setShowCreateHeat(false);
      setHeatForm({ heatNo: '', furnaceNo: 'Furnace-1', scrapInputKg: '', billetOutputKg: '', powerKwh: '', shift: 'Shift-A' });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to log heat');
    }
  };

  const handleCreateRollingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const companyId = warehouses[0]?.companyId || 'company-1';
      const factoryId = warehouses[0]?.factoryId || 'factory-1';
      await createRollingLogApi({
        companyId,
        factoryId,
        heatRef: rollingForm.heatRef || undefined,
        billetInputKg: Number(rollingForm.billetInputKg),
        rodOutputKg: Number(rollingForm.rodOutputKg),
        burningLossKg: Number(rollingForm.burningLossKg || 0),
        rodSizeSpec: rollingForm.rodSizeSpec,
        shift: rollingForm.shift,
      });
      setShowCreateRolling(false);
      setRollingForm({ heatRef: '', billetInputKg: '', rodOutputKg: '', burningLossKg: '', rodSizeSpec: '12mm Grade 60', shift: 'Shift-A' });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to log rolling batch');
    }
  };

  const handleCreateScrapSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const companyId = warehouses[0]?.companyId || 'company-1';
      await createScrapReceiptApi({
        companyId,
        warehouseId: scrapForm.warehouseId || warehouses[0]?.id,
        partyId: scrapForm.partyId,
        gradeCategory: scrapForm.gradeCategory,
        receivedKg: Number(scrapForm.receivedKg),
        vehicleNo: scrapForm.vehicleNo || undefined,
        expenses: Number(scrapForm.expenses || 0),
      });
      setShowCreateScrap(false);
      setScrapForm({ partyId: '', warehouseId: '', gradeCategory: 'Heavy Melting Scrap', receivedKg: '', vehicleNo: '', expenses: '' });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to log scrap receipt');
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setImportResult(null);
      const companyId = warehouses[0]?.companyId || 'company-1';
      const factoryId = warehouses[0]?.factoryId || 'factory-1';

      const lines = importText.trim().split('\n');
      const records: Array<{ type: 'heat'; heatNo: string; scrapInputKg: number; billetOutputKg: number; powerKwh: number }> = [];

      for (const line of lines) {
        const parts = line.split(',').map((p) => p.trim());
        if (parts.length >= 3 && parts[0] && !isNaN(Number(parts[1])) && !isNaN(Number(parts[2]))) {
          records.push({
            type: 'heat',
            heatNo: parts[0],
            scrapInputKg: Number(parts[1]),
            billetOutputKg: Number(parts[2]),
            powerKwh: Number(parts[3] || 0),
          });
        }
      }

      if (records.length === 0) {
        alert('No valid CSV rows parsed. Format: HeatNo, ScrapKg, BilletKg, PowerKwh');
        return;
      }

      const res = await importSteelBatchApi({ companyId, factoryId, records });
      setImportResult(`Successfully imported ${res.importedHeats} Heat logs!`);
      setImportText('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Import failed');
    }
  };

  const heatColumns: ColumnDef<SteelHeatLogItem>[] = [
    { key: 'heatNo', header: 'Heat No', accessor: (h) => <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{h.heatNo}</span>, sortable: true, mono: true },
    { key: 'furnaceNo', header: 'Furnace', accessor: (h) => <span className="font-semibold">{h.furnaceNo}</span>, sortable: true },
    { key: 'scrapInputKg', header: 'Scrap Input (kg)', accessor: (h) => <span className="font-mono">{h.scrapInputKg.toLocaleString()}</span>, sortable: true, align: 'right', mono: true },
    { key: 'billetOutputKg', header: 'Billet Output (kg)', accessor: (h) => <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{h.billetOutputKg.toLocaleString()}</span>, sortable: true, align: 'right', mono: true },
    { key: 'yieldPct', header: 'Melt Yield', accessor: (h) => <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{h.yieldPct}%</span>, sortable: true, align: 'right', mono: true },
    { key: 'powerKwh', header: 'Power (kWh)', accessor: (h) => <span className="font-mono text-slate-500">{h.powerKwh.toLocaleString()}</span>, sortable: true, align: 'right', mono: true },
    { key: 'shift', header: 'Shift', accessor: (h) => <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-medium">{h.shift}</span>, sortable: true },
  ];

  const rollingColumns: ColumnDef<SteelRollingLogItem>[] = [
    { key: 'heatRef', header: 'Heat Ref', accessor: (r) => <span className="font-mono text-xs">{r.heatRef || 'N/A'}</span>, sortable: true, mono: true },
    { key: 'rodSizeSpec', header: 'Rod Specification', accessor: (r) => <span className="font-bold text-slate-900 dark:text-slate-100">{r.rodSizeSpec}</span>, sortable: true },
    { key: 'billetInputKg', header: 'Billet Input (kg)', accessor: (r) => <span className="font-mono">{r.billetInputKg.toLocaleString()}</span>, sortable: true, align: 'right', mono: true },
    { key: 'rodOutputKg', header: 'Rod Output (kg)', accessor: (r) => <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{r.rodOutputKg.toLocaleString()}</span>, sortable: true, align: 'right', mono: true },
    { key: 'burningLossKg', header: 'Burning Loss', accessor: (r) => <span className="font-mono text-amber-600">{r.burningLossKg} kg ({r.burningLossPct}%)</span>, sortable: true, align: 'right', mono: true },
    { key: 'rollingYieldPct', header: 'Rolling Yield', accessor: (r) => <span className="font-mono font-bold text-emerald-600">{r.rollingYieldPct}%</span>, sortable: true, align: 'right', mono: true },
  ];

  const scrapColumns: ColumnDef<SteelScrapReceiptItem>[] = [
    { key: 'supplierName', header: 'Supplier', accessor: (s) => <span className="font-semibold">{s.supplierName}</span>, sortable: true },
    { key: 'warehouseName', header: 'Yard Warehouse', accessor: (s) => <span>{s.warehouseName}</span>, sortable: true },
    { key: 'gradeCategory', header: 'Scrap Grade', accessor: (s) => <span className="font-mono text-xs">{s.gradeCategory}</span>, sortable: true },
    { key: 'receivedKg', header: 'Received Weight', accessor: (s) => <span className="font-mono font-bold">{s.receivedKg.toLocaleString()} kg</span>, sortable: true, align: 'right', mono: true },
    { key: 'vehicleNo', header: 'Vehicle No', accessor: (s) => <span className="font-mono text-xs">{s.vehicleNo || 'N/A'}</span>, sortable: true },
  ];

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <SessionPanel />

        {/* Steel KPI Summary Cards */}
        {kpis && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Furnace Melting Yield</p>
              <p className="mt-1 text-2xl font-bold font-mono text-indigo-600">{kpis.meltYieldPct}%</p>
              <p className="mt-1 text-xs text-slate-500">{kpis.totalHeatsCount} Heats logged ({kpis.totalBilletProducedKg.toLocaleString()} kg Billets)</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rolling Mill Yield</p>
              <p className="mt-1 text-2xl font-bold font-mono text-emerald-600">{kpis.rollingYieldPct}%</p>
              <p className="mt-1 text-xs text-slate-500">{kpis.totalRodProducedKg.toLocaleString()} kg Rods ({kpis.totalBurningLossKg.toLocaleString()} kg loss)</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Energy Specific Cost</p>
              <p className="mt-1 text-2xl font-bold font-mono text-amber-600">{kpis.kwhPerBilletTon} kWh</p>
              <p className="mt-1 text-xs text-slate-500">Per Metric Ton Billet Melted</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scrap Inventory Inflow</p>
              <p className="mt-1 text-2xl font-bold font-mono text-slate-900">{(kpis.totalScrapReceivedKg / 1000).toLocaleString()} MT</p>
              <p className="mt-1 text-xs text-slate-500">Total Raw Scrap Received</p>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex flex-wrap border-b sm:border-b-0 border-slate-200 gap-2">
              <button
                onClick={() => setActiveTab('heats')}
                className={`pb-2 px-1 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === 'heats'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Furnace Heat Logs (Melting)
              </button>
              <button
                onClick={() => setActiveTab('rolling')}
                className={`pb-2 px-1 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === 'rolling'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Rolling Mill Logs (Rebar Rods)
              </button>
              <button
                onClick={() => setActiveTab('scrap')}
                className={`pb-2 px-1 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === 'scrap'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Scrap Receiving Yard
              </button>
              <button
                onClick={() => setActiveTab('import')}
                className={`pb-2 px-1 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === 'import'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Steel Excel / CSV Import Wizard
              </button>
            </div>

            <div className="flex items-center space-x-2">
              {activeTab === 'heats' && (
                <button
                  onClick={() => setShowCreateHeat(true)}
                  className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 shadow-xs transition-colors"
                >
                  + Log Heat
                </button>
              )}
              {activeTab === 'rolling' && (
                <button
                  onClick={() => setShowCreateRolling(true)}
                  className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition-colors"
                >
                  + Log Rolling Batch
                </button>
              )}
              {activeTab === 'scrap' && (
                <button
                  onClick={() => setShowCreateScrap(true)}
                  className="rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-amber-700 shadow-xs transition-colors"
                >
                  + Receive Scrap
                </button>
              )}
            </div>
          </div>

          {loading && <p className="text-xs text-slate-500">Loading steel vertical operations...</p>}
          {error && <p className="text-xs text-red-600">{error}</p>}

          {!loading && activeTab === 'heats' && (
            <VirtualDataTable
              title="Induction Furnace Heat Logs"
              data={heats}
              columns={heatColumns}
              exportFileName="steel_heat_logs"
            />
          )}

          {!loading && activeTab === 'rolling' && (
            <VirtualDataTable
              title="Steel Rolling Mill Logs"
              data={rollingLogs}
              columns={rollingColumns}
              exportFileName="steel_rolling_logs"
            />
          )}

          {!loading && activeTab === 'scrap' && (
            <VirtualDataTable
              title="Scrap Yard Receipts"
              data={scrapReceipts}
              columns={scrapColumns}
              exportFileName="steel_scrap_receipts"
            />
          )}

          {!loading && activeTab === 'import' && (
            <div className="space-y-4 max-w-xl">
              <h3 className="text-sm font-bold text-slate-900">Batch Heat Log Data Import Wizard (FRM-STL-06)</h3>
              <p className="text-xs text-slate-500">Paste your CSV rows containing furnace logs. Format: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">HeatNo, ScrapKg, BilletKg, PowerKwh</code></p>

              <form onSubmit={handleImportSubmit} className="space-y-3">
                <textarea
                  rows={6}
                  placeholder="HEAT-2026-101, 15000, 13800, 9500&#10;HEAT-2026-102, 16000, 14720, 10100"
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="w-full rounded-md border border-slate-300 p-3 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700">
                  Run Batch Import
                </button>
              </form>

              {importResult && (
                <div className="rounded-md bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800">
                  {importResult}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Log Heat */}
      {showCreateHeat && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Log Furnace Heat (Melting)</h3>
            <form onSubmit={handleCreateHeatSubmit} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Heat Number</label>
                <input
                  type="text"
                  placeholder="e.g. H-2026-085"
                  value={heatForm.heatNo}
                  onChange={(e) => setHeatForm({ ...heatForm, heatNo: e.target.value })}
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Scrap Input (kg)</label>
                  <input
                    type="number"
                    value={heatForm.scrapInputKg}
                    onChange={(e) => setHeatForm({ ...heatForm, scrapInputKg: e.target.value })}
                    required
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Billet Output (kg)</label>
                  <input
                    type="number"
                    value={heatForm.billetOutputKg}
                    onChange={(e) => setHeatForm({ ...heatForm, billetOutputKg: e.target.value })}
                    required
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Power (kWh)</label>
                  <input
                    type="number"
                    value={heatForm.powerKwh}
                    onChange={(e) => setHeatForm({ ...heatForm, powerKwh: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Shift</label>
                  <select
                    value={heatForm.shift}
                    onChange={(e) => setHeatForm({ ...heatForm, shift: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Shift-A">Shift-A</option>
                    <option value="Shift-B">Shift-B</option>
                    <option value="Shift-C">Shift-C</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowCreateHeat(false)} className="px-4 py-2 rounded-md border border-slate-300 text-xs font-semibold text-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-md bg-indigo-600 text-white text-xs font-semibold">Save Heat Log</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Log Rolling */}
      {showCreateRolling && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Log Rolling Mill Batch</h3>
            <form onSubmit={handleCreateRollingSubmit} className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Billet Input (kg)</label>
                  <input
                    type="number"
                    value={rollingForm.billetInputKg}
                    onChange={(e) => setRollingForm({ ...rollingForm, billetInputKg: e.target.value })}
                    required
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Rod Output (kg)</label>
                  <input
                    type="number"
                    value={rollingForm.rodOutputKg}
                    onChange={(e) => setRollingForm({ ...rollingForm, rodOutputKg: e.target.value })}
                    required
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Burning Loss (kg)</label>
                  <input
                    type="number"
                    value={rollingForm.burningLossKg}
                    onChange={(e) => setRollingForm({ ...rollingForm, burningLossKg: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Spec / Size</label>
                  <input
                    type="text"
                    value={rollingForm.rodSizeSpec}
                    onChange={(e) => setRollingForm({ ...rollingForm, rodSizeSpec: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowCreateRolling(false)} className="px-4 py-2 rounded-md border border-slate-300 text-xs font-semibold text-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-md bg-emerald-600 text-white text-xs font-semibold">Save Rolling Log</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Log Scrap */}
      {showCreateScrap && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Receive Raw Scrap (Yard)</h3>
            <form onSubmit={handleCreateScrapSubmit} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Supplier</label>
                <select
                  value={scrapForm.partyId}
                  onChange={(e) => setScrapForm({ ...scrapForm, partyId: e.target.value })}
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Select Supplier --</option>
                  {parties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Target Warehouse</label>
                <select
                  value={scrapForm.warehouseId}
                  onChange={(e) => setScrapForm({ ...scrapForm, warehouseId: e.target.value })}
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Select Warehouse --</option>
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.name} ({wh.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={scrapForm.receivedKg}
                    onChange={(e) => setScrapForm({ ...scrapForm, receivedKg: e.target.value })}
                    required
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Vehicle No</label>
                  <input
                    type="text"
                    placeholder="e.g. TRK-8812"
                    value={scrapForm.vehicleNo}
                    onChange={(e) => setScrapForm({ ...scrapForm, vehicleNo: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowCreateScrap(false)} className="px-4 py-2 rounded-md border border-slate-300 text-xs font-semibold text-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-md bg-amber-600 text-white text-xs font-semibold">Confirm Receipt</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
