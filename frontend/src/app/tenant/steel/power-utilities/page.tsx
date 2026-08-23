'use client';

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
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

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
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `utility_power_logs.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      
      {/* Title Bar */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wider font-mono">Power & Utilities Ledger</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Tracks daily electrical energy loads (kWh), peak demand loads (kVA), furnace gas meters, and specific energy efficiency ratios.</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowColMenu(!showColMenu)}
            className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all relative cursor-pointer"
          >
            Column visibility ⚙️
            {showColMenu && (
              <div className="absolute right-0 top-10 z-30 bg-white border border-slate-250 p-3 rounded-xl shadow-xl w-48 text-left space-y-1.5 font-sans font-normal text-xs text-slate-700">
                {Object.keys(visibleCols).map(col => (
                  <label key={col} className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={visibleCols[col as keyof typeof visibleCols]} 
                      onChange={() => setVisibleCols({ ...visibleCols, [col]: !visibleCols[col as keyof typeof visibleCols] })}
                    />
                    <span className="capitalize">{col.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            )}
          </button>
          <button 
            onClick={handleExportCSV}
            className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Export Sheet
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-[#C5A059] hover:bg-[#B48F48] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            + Multi-Row Log Entry
          </button>
        </div>
      </div>

      {/* Spreadsheet Control Search */}
      <div className="flex gap-3 bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs">
        <input 
          type="text" 
          placeholder="Filter by Date (YYYY-MM-DD)..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none"
        />
      </div>

      {/* Full-Screen Sheet Grid Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-150 text-[10px] uppercase font-mono text-slate-450">
                {visibleCols.date && (
                  <th className={`sticky left-0 bg-slate-50 z-10 border-r border-slate-100 ${cellPadding} cursor-pointer hover:bg-slate-100`} onClick={() => handleSort('date')}>
                    Date {sortField === 'date' && (sortDir === 'asc' ? '▲' : '▼')}
                  </th>
                )}
                {visibleCols.total_production_kg && <th className={`${cellPadding} text-right`}>Today Production (KG)</th>}
                {visibleCols.power_consumption_kw && <th className={`${cellPadding} text-right`}>Power Consumed (kWh)</th>}
                {visibleCols.gas_consumption_nm3 && <th className={`${cellPadding} text-right`}>Gas Consumed (Nm³)</th>}
                {visibleCols.peak_demand_kva && <th className={`${cellPadding} text-right`}>Peak Demand (kVA)</th>}
                {visibleCols.power_cost && <th className={`${cellPadding} text-right`}>Est Power Cost (৳)</th>}
                {visibleCols.gas_cost && <th className={`${cellPadding} text-right`}>Est Gas Cost (৳)</th>}
                {visibleCols.sec_kwh_kg && <th className={`${cellPadding} text-right`}>SEC (kWh/kg)</th>}
                {visibleCols.sec_nm3_kg && <th className={`${cellPadding} text-right`}>SEC (Nm³/kg)</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
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
                        <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'total_production_kg')} className="bg-slate-50 border border-slate-200 text-right w-20 p-0.5 rounded text-xs focus:outline-none font-mono" autoFocus />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.total_production_kg.toLocaleString()}</span>
                      )}
                    </td>
                  )}
                  {visibleCols.power_consumption_kw && (
                    <td className={`${cellPadding} text-right font-semibold`} onClick={() => startEdit(row.id, 'power_consumption_kw', row.power_consumption_kw)}>
                      {editingCell?.id === row.id && editingCell?.field === 'power_consumption_kw' ? (
                        <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'power_consumption_kw')} className="bg-slate-50 border border-slate-200 text-right w-24 p-0.5 rounded text-xs focus:outline-none font-mono" autoFocus />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.power_consumption_kw.toLocaleString()}</span>
                      )}
                    </td>
                  )}
                  {visibleCols.gas_consumption_nm3 && (
                    <td className={`${cellPadding} text-right font-semibold`} onClick={() => startEdit(row.id, 'gas_consumption_nm3', row.gas_consumption_nm3)}>
                      {editingCell?.id === row.id && editingCell?.field === 'gas_consumption_nm3' ? (
                        <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'gas_consumption_nm3')} className="bg-slate-50 border border-slate-200 text-right w-20 p-0.5 rounded text-xs focus:outline-none font-mono" autoFocus />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.gas_consumption_nm3.toLocaleString()}</span>
                      )}
                    </td>
                  )}
                  {visibleCols.peak_demand_kva && (
                    <td className={`${cellPadding} text-right`} onClick={() => startEdit(row.id, 'peak_demand_kva', row.peak_demand_kva)}>
                      {editingCell?.id === row.id && editingCell?.field === 'peak_demand_kva' ? (
                        <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'peak_demand_kva')} className="bg-slate-50 border border-slate-200 text-right w-20 p-0.5 rounded text-xs focus:outline-none font-mono" autoFocus />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.peak_demand_kva.toLocaleString()}</span>
                      )}
                    </td>
                  )}
                  {visibleCols.power_cost && (
                    <td className={`${cellPadding} text-right font-semibold text-rose-600`}>
                      ৳{row.power_cost.toLocaleString()}
                    </td>
                  )}
                  {visibleCols.gas_cost && (
                    <td className={`${cellPadding} text-right font-semibold text-[#B48F48]`}>
                      ৳{row.gas_cost.toLocaleString()}
                    </td>
                  )}
                  {visibleCols.sec_kwh_kg && (
                    <td className={`${cellPadding} text-right text-indigo-650 font-bold`}>
                      {row.sec_kwh_kg} kWh
                    </td>
                  )}
                  {visibleCols.sec_nm3_kg && (
                    <td className={`${cellPadding} text-right text-amber-650 font-bold`}>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40">
          <div className="bg-white border border-slate-200/85 p-7 rounded-3xl w-full max-w-4xl shadow-2xl space-y-5 relative overflow-hidden border-t-4 border-t-[#C5A059] flex flex-col max-h-[85vh]">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-mono">Log Daily Power Utility Meters</h3>
              <p className="text-[10px] text-slate-450 mt-1">Simultaneously log multiple dates of factory peak demand levels and electricity/gas billing units.</p>
            </div>

            {validationError && (
              <div className="bg-rose-50 text-rose-800 p-3 rounded-xl border border-rose-100 text-[10px] font-bold font-mono">
                🚨 Error: {validationError}
              </div>
            )}

            <form onSubmit={handleMultiRowSubmit} className="space-y-4 flex-1 overflow-y-auto min-h-0">
              <div className="space-y-3">
                {modalRows.map((row, idx) => (
                  <div key={idx} className="flex gap-3 items-end border-b border-slate-100 pb-3 last:border-b-0">
                    <div className="w-32 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Date</label>
                      <input type="date" value={row.date} onChange={(e) => handleModalRowChange(idx, 'date', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded focus:outline-none" />
                    </div>
                    <div className="w-36 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Today Production (KG)</label>
                      <input type="number" placeholder="20000" value={row.total_production_kg} onChange={(e) => handleModalRowChange(idx, 'total_production_kg', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded focus:outline-none font-mono" />
                    </div>
                    <div className="w-36 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Power Consumed (kWh)</label>
                      <input type="number" placeholder="13000" value={row.power_consumption_kw} onChange={(e) => handleModalRowChange(idx, 'power_consumption_kw', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded focus:outline-none font-mono" />
                    </div>
                    <div className="w-32 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Gas Consumed (Nm3)</label>
                      <input type="number" placeholder="1600" value={row.gas_consumption_nm3} onChange={(e) => handleModalRowChange(idx, 'gas_consumption_nm3', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded focus:outline-none font-mono" />
                    </div>
                    <div className="w-32 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Peak Demand (kVA)</label>
                      <input type="number" placeholder="2800" value={row.peak_demand_kva} onChange={(e) => handleModalRowChange(idx, 'peak_demand_kva', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded focus:outline-none font-mono" />
                    </div>
                    {modalRows.length > 1 && (
                      <button type="button" onClick={() => removeModalRow(idx)} className="text-red-500 hover:text-red-750 pb-2.5 font-bold cursor-pointer">✕</button>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-3 flex justify-between">
                <button 
                  type="button" 
                  onClick={addModalRow}
                  className="px-3.5 py-2 border border-[#C5A059] text-[#B48F48] hover:bg-[#FAF6EE] text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  + Add Row
                </button>
                <div className="flex space-x-2">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-4.5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2.5 bg-gradient-to-r from-[#B48F48] to-[#C5A059] hover:from-[#C5A059] hover:to-[#B48F48] text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    Save Meter Logs
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
