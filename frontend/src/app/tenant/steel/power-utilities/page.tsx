'use client';
import { exportToExcel } from '@/lib/excelExport';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface PowerRow {
  id: number;
  date: string;
  total_production_kg: number;
  power_consumption_kw: number;
  gas_consumption_nm3: number;
  peak_demand_kva: number;
  power_cost: number;
  gas_cost: number;
  sec_kwh_kg: number;
  sec_nm3_kg: number;
}

export default function PowerUtilitiesPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';

  // Local state with seed data
  const [data, setData] = useState<PowerRow[]>([
    { id: 1, date: '2026-08-20', total_production_kg: 20100, power_consumption_kw: 13500, gas_consumption_nm3: 1650, peak_demand_kva: 2800, power_cost: 162000, gas_cost: 82500, sec_kwh_kg: 0.67, sec_nm3_kg: 0.08 },
    { id: 2, date: '2026-08-21', total_production_kg: 22020, power_consumption_kw: 14200, gas_consumption_nm3: 1780, peak_demand_kva: 2950, power_cost: 170400, gas_cost: 89000, sec_kwh_kg: 0.64, sec_nm3_kg: 0.08 },
    { id: 3, date: '2026-08-22', total_production_kg: 19800, power_consumption_kw: 13100, gas_consumption_nm3: 1590, peak_demand_kva: 2750, power_cost: 157200, gas_cost: 79500, sec_kwh_kg: 0.66, sec_nm3_kg: 0.08 }
  ]);

  // Sheet States
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<keyof PowerRow>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Visible Columns Toggle
  const [visibleCols, setVisibleCols] = useState({
    date: true,
    total_production_kg: true,
    power_consumption_kw: true,
    gas_consumption_nm3: true,
    peak_demand_kva: true,
    power_cost: true,
    gas_cost: true,
    sec_kwh_kg: true,
    sec_nm3_kg: true
  });
  const [showColMenu, setShowColMenu] = useState(false);

  // Inline Cell Editing State
  const [editingCell, setEditingCell] = useState<{ id: number; field: keyof PowerRow } | null>(null);
  const [editValue, setEditValue] = useState('');

  // Multi-Row Modal Entry
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRows, setModalRows] = useState<any[]>([
    { date: new Date().toISOString().split('T')[0], total_production_kg: '', power_consumption_kw: '', gas_consumption_nm3: '', peak_demand_kva: '2800' }
  ]);
  const [validationError, setValidationError] = useState('');

  const cellPadding = isCompact ? 'px-3 py-1.5 text-[11px]' : 'px-4 py-2.5 text-xs';

  const handleSort = (field: keyof PowerRow) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const startEdit = (id: number, field: keyof PowerRow, currentVal: any) => {
    setEditingCell({ id, field });
    setEditValue(String(currentVal));
  };

  const saveInlineEdit = (id: number, field: keyof PowerRow) => {
    const updatedRows = data.map(row => {
      if (row.id === id) {
        let val: any = editValue;
        val = parseFloat(editValue);
        if (isNaN(val)) val = row[field];

        const updated = { ...row, [field]: val };
        
        // Recalculate specific consumption ratios and costs (assuming static tariff rates)
        updated.power_cost = updated.power_consumption_kw * 12; // ৳12 per kWh tariff
        updated.gas_cost = updated.gas_consumption_nm3 * 50;    // ৳50 per Nm3 tariff
        updated.sec_kwh_kg = parseFloat((updated.power_consumption_kw / updated.total_production_kg).toFixed(3));
        updated.sec_nm3_kg = parseFloat((updated.gas_consumption_nm3 / updated.total_production_kg).toFixed(3));

        return updated;
      }
      return row;
    });

    setData(updatedRows);
    setEditingCell(null);
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Production (KG)', 'Power (kWh)', 'Gas (Nm3)', 'Peak Demand (kVA)', 'Power Cost (৳)', 'Gas Cost (৳)', 'SEC (kWh/kg)', 'SEC (Nm3/kg)'];
    const rows = filteredData.map(r => [
      r.date, r.total_production_kg, r.power_consumption_kw, r.gas_consumption_nm3, r.peak_demand_kva, r.power_cost, r.gas_cost, r.sec_kwh_kg, r.sec_nm3_kg
    ]);
    exportToExcel(headers, rows, 'utility_power_logs');
  };

  const addModalRow = () => {
    setModalRows([
      ...modalRows,
      { date: new Date().toISOString().split('T')[0], total_production_kg: '', power_consumption_kw: '', gas_consumption_nm3: '', peak_demand_kva: '2800' }
    ]);
  };

  const removeModalRow = (idx: number) => {
    setModalRows(modalRows.filter((_, i) => i !== idx));
  };

  const handleModalRowChange = (idx: number, field: string, val: string) => {
    const updated = [...modalRows];
    updated[idx][field] = val;
    setModalRows(updated);
  };

  const handleMultiRowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    for (let i = 0; i < modalRows.length; i++) {
      const row = modalRows[i];
      const prod = parseFloat(row.total_production_kg);
      const power = parseFloat(row.power_consumption_kw);
      const gas = parseFloat(row.gas_consumption_nm3);
      const peak = parseFloat(row.peak_demand_kva);

      if (!row.date) return setValidationError(`Row ${i + 1}: Date is required.`);
      if (isNaN(prod) || prod <= 0) return setValidationError(`Row ${i + 1}: Production must be positive.`);
      if (isNaN(power) || power <= 0) return setValidationError(`Row ${i + 1}: Power consumption must be positive.`);
      if (isNaN(gas) || gas < 0) return setValidationError(`Row ${i + 1}: Gas consumption must be non-negative.`);
      if (isNaN(peak) || peak <= 0) return setValidationError(`Row ${i + 1}: Peak demand kVA must be positive.`);
    }

    const newEntries = modalRows.map((row, index) => {
      const prod = parseFloat(row.total_production_kg);
      const power = parseFloat(row.power_consumption_kw);
      const gas = parseFloat(row.gas_consumption_nm3);
      return {
        id: data.length + index + 1,
        date: row.date,
        total_production_kg: prod,
        power_consumption_kw: power,
        gas_consumption_nm3: gas,
        peak_demand_kva: parseFloat(row.peak_demand_kva),
        power_cost: power * 12,
        gas_cost: gas * 50,
        sec_kwh_kg: parseFloat((power / prod).toFixed(3)),
        sec_nm3_kg: parseFloat((gas / prod).toFixed(3))
      };
    });

    setData([...data, ...newEntries]);
    setIsModalOpen(false);
    setModalRows([{ date: new Date().toISOString().split('T')[0], total_production_kg: '', power_consumption_kw: '', gas_consumption_nm3: '', peak_demand_kva: '2800' }]);
  };

  const filteredData = data
    .filter(row => row.date.includes(search))
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') {
        return sortDir === 'asc' 
          ? (valA as string).localeCompare(valB as string)
          : (valB as string).localeCompare(valA as string);
      } else {
        return sortDir === 'asc' 
          ? (valA as number) - (valB as number)
          : (valB as number) - (valA as number);
      }
    });

  // Calculate summary KPI stats
  const totalPower = filteredData.reduce((sum, r) => sum + Number(r.power_consumption_kw || 0), 0);
  const totalGas = filteredData.reduce((sum, r) => sum + Number(r.gas_consumption_nm3 || 0), 0);
  const totalCost = filteredData.reduce((sum, r) => sum + Number(r.power_cost || 0) + Number(r.gas_cost || 0), 0);
  const avgSEC = filteredData.length > 0 ? (filteredData.reduce((sum, r) => sum + Number(r.sec_kwh_kg || 0), 0) / filteredData.length * 1000).toFixed(0) : '540';

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      
      {/* Enterprise Header Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#B48F48] uppercase tracking-wider font-mono mb-1.5">
            <span>Energy Management</span>
            <span>•</span>
            <span>33kV Substation & Gas Manifold</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">Power Grid & Energy Utilities</h1>
          <p className="text-sm text-slate-500 font-sans mt-0.5">Continuous telemetry monitoring for 33kV high-voltage substation feeds, peak load kVA, specific energy consumption (SEC), and natural gas combustion.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleExportCSV}
            className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer flex flex-wrap items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export XLS</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 md:flex-none px-5 py-2.5 bg-[#B48F48] hover:bg-[#9E7A37] text-white text-sm font-semibold rounded-xl shadow-sm transition-all cursor-pointer flex flex-wrap items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>+ Log Utility Meter</span>
          </button>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Total Power Consumed</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-amber-50 text-amber-700 border border-amber-200">Substation</span>
          </div>
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-4">
            <span className="text-3xl font-bold font-mono tracking-tight text-slate-900">{totalPower.toLocaleString()}</span>
            <span className="text-xs text-slate-400 font-mono">kWh Units</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Specific Power (SEC)</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">Efficiency</span>
          </div>
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-4">
            <span className="text-3xl font-bold font-mono tracking-tight text-slate-900">{avgSEC}</span>
            <span className="text-xs text-emerald-600 font-mono font-medium">kWh / MT</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Gas Consumption</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-blue-50 text-blue-700 border border-blue-200">Reheating</span>
          </div>
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-4">
            <span className="text-3xl font-bold font-mono tracking-tight text-slate-900">{totalGas.toLocaleString()}</span>
            <span className="text-xs text-slate-400 font-mono">Nm³ Normal</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Est Utility Cost</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-rose-50 text-rose-700 border border-rose-200">Power + Gas</span>
          </div>
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-4">
            <span className="text-3xl font-bold font-mono tracking-tight text-slate-900">৳{(totalCost / 1000).toFixed(0)}k</span>
            <span className="text-xs text-rose-600 font-mono font-medium">BDT Total</span>
          </div>
        </div>
      </div>

      {/* Spreadsheet Control Search */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white border border-slate-200/90 p-4 rounded-2xl shadow-xs">
        <input 
          type="text" 
          placeholder="Filter by Date (YYYY-MM-DD)..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-white border border-slate-300 text-sm px-3.5 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059] font-sans text-slate-900"
        />
      </div>

      {/* Full-Screen Sheet Grid Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase font-mono text-slate-500 select-none">
                {visibleCols.date && (
                  <th className={`sticky left-0 bg-slate-50/90 z-10 border-r border-slate-200 ${cellPadding} cursor-pointer hover:text-slate-900 transition-colors`} onClick={() => handleSort('date')}>
                    Date {sortField === 'date' && (sortDir === 'asc' ? '↑' : '↓')}
                  </th>
                )}
                {visibleCols.total_production_kg && <th className={`${cellPadding} text-right`}>Output (KG)</th>}
                {visibleCols.power_consumption_kw && <th className={`${cellPadding} text-right`}>Power (kWh)</th>}
                {visibleCols.gas_consumption_nm3 && <th className={`${cellPadding} text-right`}>Gas (Nm³)</th>}
                {visibleCols.peak_demand_kva && <th className={`${cellPadding} text-right`}>Peak Demand (kVA)</th>}
                {visibleCols.power_cost && <th className={`${cellPadding} text-right`}>Power Cost (৳)</th>}
                {visibleCols.gas_cost && <th className={`${cellPadding} text-right`}>Gas Cost (৳)</th>}
                {visibleCols.sec_kwh_kg && <th className={`${cellPadding} text-right text-amber-700 font-bold`}>SEC (kWh/kg)</th>}
                {visibleCols.sec_nm3_kg && <th className={`${cellPadding} text-right`}>SEC (Nm³/kg)</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/40 transition-colors">
                  {visibleCols.date && (
                    <td className={`sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-150 ${cellPadding} font-bold text-slate-900`}>
                      {row.date}
                    </td>
                  )}
                  {visibleCols.total_production_kg && (
                    <td className={`${cellPadding} text-right`} onClick={() => startEdit(row.id, 'total_production_kg', row.total_production_kg)}>
                      {editingCell?.id === row.id && editingCell?.field === 'total_production_kg' ? (
                        <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'total_production_kg')} className="bg-white border border-[#C5A059] rounded px-1 text-right w-24 focus:outline-none font-mono text-xs" autoFocus />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.total_production_kg.toLocaleString()}</span>
                      )}
                    </td>
                  )}
                  {visibleCols.power_consumption_kw && (
                    <td className={`${cellPadding} text-right font-semibold text-slate-900`} onClick={() => startEdit(row.id, 'power_consumption_kw', row.power_consumption_kw)}>
                      {editingCell?.id === row.id && editingCell?.field === 'power_consumption_kw' ? (
                        <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'power_consumption_kw')} className="bg-white border border-[#C5A059] rounded px-1 text-right w-24 focus:outline-none font-mono text-xs" autoFocus />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.power_consumption_kw.toLocaleString()}</span>
                      )}
                    </td>
                  )}
                  {visibleCols.gas_consumption_nm3 && (
                    <td className={`${cellPadding} text-right font-semibold text-slate-900`} onClick={() => startEdit(row.id, 'gas_consumption_nm3', row.gas_consumption_nm3)}>
                      {editingCell?.id === row.id && editingCell?.field === 'gas_consumption_nm3' ? (
                        <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'gas_consumption_nm3')} className="bg-white border border-[#C5A059] rounded px-1 text-right w-20 focus:outline-none font-mono text-xs" autoFocus />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.gas_consumption_nm3.toLocaleString()}</span>
                      )}
                    </td>
                  )}
                  {visibleCols.peak_demand_kva && (
                    <td className={`${cellPadding} text-right`} onClick={() => startEdit(row.id, 'peak_demand_kva', row.peak_demand_kva)}>
                      {editingCell?.id === row.id && editingCell?.field === 'peak_demand_kva' ? (
                        <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'peak_demand_kva')} className="bg-white border border-[#C5A059] rounded px-1 text-right w-20 focus:outline-none font-mono text-xs" autoFocus />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.peak_demand_kva.toLocaleString()}</span>
                      )}
                    </td>
                  )}
                  {visibleCols.power_cost && (
                    <td className={`${cellPadding} text-right font-semibold text-slate-900`}>
                      ৳{row.power_cost.toLocaleString()}
                    </td>
                  )}
                  {visibleCols.gas_cost && (
                    <td className={`${cellPadding} text-right font-semibold text-slate-900`}>
                      ৳{row.gas_cost.toLocaleString()}
                    </td>
                  )}
                  {visibleCols.sec_kwh_kg && (
                    <td className={`${cellPadding} text-right text-amber-700 font-bold`}>
                      {row.sec_kwh_kg} kWh
                    </td>
                  )}
                  {visibleCols.sec_nm3_kg && (
                    <td className={`${cellPadding} text-right text-slate-600`}>
                      {row.sec_nm3_kg} m³
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Multi-Row Quick Modal Entry */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200/90 p-6 rounded-2xl w-full max-w-4xl shadow-2xl space-y-4 relative overflow-hidden flex flex-col max-h-[90vh] my-8 animate-zoom-in">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-sans">Log Energy & Utility Meters</h3>
                <p className="text-xs text-slate-500 font-sans mt-0.5">Record electrical kilowatt-hours and natural gas units for unit cost analysis.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {validationError && (
              <div className="bg-rose-50 text-rose-800 p-3 rounded-xl border border-rose-200 text-xs font-bold font-mono">
                Error: {validationError}
              </div>
            )}

            <form onSubmit={handleMultiRowSubmit} className="space-y-4 flex-1 overflow-y-auto min-h-0">
              <div className="overflow-x-auto pb-3">
                <div className="space-y-3 min-w-[700px] pr-2">
                {modalRows.map((row, idx) => (
                  <div key={idx} className="flex gap-3 items-end border-b border-slate-100 pb-3 last:border-b-0">
                    <div className="w-36 space-y-1">
                      <label className="text-xs font-semibold text-slate-600 uppercase font-mono">Date</label>
                      <input type="date" value={row.date} onChange={(e) => handleModalRowChange(idx, 'date', e.target.value)} className="w-full bg-white border border-slate-300 text-sm px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059] font-mono text-slate-900" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-xs font-semibold text-slate-600 uppercase font-mono">Production Output (KG)</label>
                      <input type="number" placeholder="20000" value={row.total_production_kg} onChange={(e) => handleModalRowChange(idx, 'total_production_kg', e.target.value)} className="w-full bg-white border border-slate-300 text-sm px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059] font-mono text-slate-900" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-xs font-semibold text-slate-600 uppercase font-mono">Power Consumed (kWh)</label>
                      <input type="number" placeholder="13500" value={row.power_consumption_kw} onChange={(e) => handleModalRowChange(idx, 'power_consumption_kw', e.target.value)} className="w-full bg-white border border-slate-300 text-sm px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059] font-mono text-slate-900" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-xs font-semibold text-slate-600 uppercase font-mono">Gas Consumed (Nm³)</label>
                      <input type="number" placeholder="1650" value={row.gas_consumption_nm3} onChange={(e) => handleModalRowChange(idx, 'gas_consumption_nm3', e.target.value)} className="w-full bg-white border border-slate-300 text-sm px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059] font-mono text-slate-900" />
                    </div>
                    <div className="w-28 space-y-1">
                      <label className="text-xs font-semibold text-slate-600 uppercase font-mono">Peak kVA</label>
                      <input type="number" placeholder="2800" value={row.peak_demand_kva} onChange={(e) => handleModalRowChange(idx, 'peak_demand_kva', e.target.value)} className="w-full bg-white border border-slate-300 text-sm px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059] font-mono text-slate-900" />
                    </div>
                    {modalRows.length > 1 && (
                      <button type="button" onClick={() => removeModalRow(idx)} className="text-rose-550 hover:text-rose-700 font-bold text-xs p-2">✕</button>
                    )}
                  </div>
                ))}
                </div>
              </div>

              <div className="flex flex-wrap justify-between gap-4 items-center pt-3 border-t border-slate-100">
                <button type="button" onClick={addModalRow} className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition-all cursor-pointer">
                  + Add Date
                </button>
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition-all cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 bg-[#B48F48] hover:bg-[#9E7A37] text-white text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer">
                    Save Readings
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
