'use client';

import React, { useState, useEffect } from 'react';
import { VirtualDataTable, type ColumnDef } from '@/components/enterprise/VirtualDataTable';

type ExecutiveKpis = {
  oeeScorePct: number;
  oeeAvailabilityPct: number;
  oeePerformancePct: number;
  oeeQualityPct: number;
  meltYieldPct: number;
  rollingYieldPct: number;
  inventoryTurnoverRatio: number;
  onTimeDeliveryPct: number;
  totalProductionTon: number;
  activeWorkOrdersCount: number;
};

type ReportRow = {
  groupName: string;
  totalRecords: number;
  inputKg: number;
  outputKg: number;
  yieldPct: number;
  powerKwh: number;
};

export function AnalyticsPanel() {
  const [kpis, setKpis] = useState<ExecutiveKpis | null>(null);
  const [reportRows, setReportRows] = useState<ReportRow[]>([]);
  const [reportType, setReportType] = useState<'production_summary' | 'scrap_yield'>('production_summary');
  const [groupBy, setGroupBy] = useState<'shift' | 'furnaceNo'>('shift');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKpis();
    loadReport();
  }, []);

  const loadKpis = async () => {
    try {
      const res = await fetch('/api/v1/analytics/kpis', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setKpis(data);
      }
    } catch {}
  };

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/analytics/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reportType, groupBy }),
      });
      if (res.ok) {
        const data = await res.json();
        setReportRows(data.rows || []);
      }
    } catch {}
    setLoading(false);
  };

  const reportColumns: ColumnDef<ReportRow>[] = [
    { key: 'groupName', header: 'Group Name / Segment', accessor: (r) => <span className="font-bold text-slate-900">{r.groupName}</span>, sortable: true },
    { key: 'totalRecords', header: 'Batches / Heats', accessor: (r) => <span className="font-mono text-xs font-semibold">{r.totalRecords}</span>, sortable: true, align: 'right', mono: true },
    { key: 'inputKg', header: 'Input Weight (kg)', accessor: (r) => <span className="font-mono">{r.inputKg.toLocaleString()}</span>, sortable: true, align: 'right', mono: true },
    { key: 'outputKg', header: 'Output Weight (kg)', accessor: (r) => <span className="font-mono font-bold text-slate-900">{r.outputKg.toLocaleString()}</span>, sortable: true, align: 'right', mono: true },
    { key: 'yieldPct', header: 'Yield %', accessor: (r) => <span className="font-mono font-bold text-emerald-600">{r.yieldPct}%</span>, sortable: true, align: 'right', mono: true },
    { key: 'powerKwh', header: 'Energy (kWh)', accessor: (r) => <span className="font-mono text-slate-500">{r.powerKwh.toLocaleString()}</span>, sortable: true, align: 'right', mono: true },
  ];

  return (
    <div className="space-y-6">
      {/* Executive OEE & KPI Scorecards */}
      {kpis && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Equipment (OEE)</p>
            <p className="mt-1 text-2xl font-bold font-mono text-indigo-600">{kpis.oeeScorePct}%</p>
            <p className="mt-1 text-[11px] text-slate-500">
              Avail: {kpis.oeeAvailabilityPct}% | Perf: {kpis.oeePerformancePct}% | Qual: {kpis.oeeQualityPct}%
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Melting & Rolling Yield</p>
            <p className="mt-1 text-2xl font-bold font-mono text-emerald-600">{kpis.meltYieldPct}% / {kpis.rollingYieldPct}%</p>
            <p className="mt-1 text-[11px] text-slate-500">Induction Melt / Rolling Mill Yield</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">On-Time Delivery Rate</p>
            <p className="mt-1 text-2xl font-bold font-mono text-amber-600">{kpis.onTimeDeliveryPct}%</p>
            <p className="mt-1 text-[11px] text-slate-500">Commercial Sales Fulfillment</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inventory Turnover</p>
            <p className="mt-1 text-2xl font-bold font-mono text-slate-900">{kpis.inventoryTurnoverRatio}x</p>
            <p className="mt-1 text-[11px] text-slate-500">{kpis.totalProductionTon} MT Production Volume</p>
          </div>
        </div>
      )}

      {/* Dynamic Report Builder */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">📊 Executive Custom Report Builder</h3>
            <p className="text-xs text-slate-500 mt-0.5">Filter, group, and aggregate operational metrics across plant shifts.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700"
            >
              <option value="production_summary">Production Summary Report</option>
              <option value="scrap_yield">Raw Scrap & Yield Report</option>
            </select>

            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as any)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700"
            >
              <option value="shift">Group by Shift</option>
              <option value="furnaceNo">Group by Furnace Unit</option>
            </select>

            <button
              onClick={loadReport}
              className="px-3.5 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-xs"
            >
              Execute Query
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-xs text-slate-400">Aggregating analytical datasets...</p>
        ) : (
          <VirtualDataTable
            title="Analytical Report Output"
            data={reportRows}
            columns={reportColumns}
            exportFileName="executive_analytics_report"
          />
        )}
      </div>
    </div>
  );
}
