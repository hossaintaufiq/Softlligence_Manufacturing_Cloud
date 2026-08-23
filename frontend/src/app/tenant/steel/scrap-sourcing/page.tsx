'use client';
import { exportToExcel } from '@/lib/excelExport';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface ScrapRow {
  id: number;
  date: string;
  supplier_name: string;
  scrap_category: string;
  scrap_rcv_kg: number;
  truck_no: string;
  gross_weight: number;
  value_tare: number;
  rate_per_kg: number;
  total_cost: number;
  yard_location: string;
}

export default function ScrapSourcingPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';

  // Local state with seed data
  const [data, setData] = useState<ScrapRow[]>([
    { id: 1, date: '2026-08-20', supplier_name: 'Metal Recyclers Corp', scrap_category: 'LC Scrap', scrap_rcv_kg: 15000, truck_no: 'TR-1024', gross_weight: 24500, value_tare: 9500, rate_per_kg: 42, total_cost: 630000, yard_location: 'Bay A' },
    { id: 2, date: '2026-08-21', supplier_name: 'Apex Scrap Suppliers', scrap_category: 'Rolling Kechi', scrap_rcv_kg: 12800, truck_no: 'TR-8812', gross_weight: 22000, value_tare: 9200, rate_per_kg: 44, total_cost: 563200, yard_location: 'Bay B' },
    { id: 3, date: '2026-08-22', supplier_name: 'Alpha Alloys', scrap_category: 'Plate Cutting', scrap_rcv_kg: 9500, truck_no: 'TR-5034', gross_weight: 18500, value_tare: 9000, rate_per_kg: 40, total_cost: 380000, yard_location: 'Bay A' }
  ]);

  // Sheet States
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortField, setSortField] = useState<keyof ScrapRow>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Visible Columns Toggle
  const [visibleCols, setVisibleCols] = useState({
    date: true,
    supplier_name: true,
    scrap_category: true,
    scrap_rcv_kg: true,
    truck_no: true,
    gross_weight: true,
    value_tare: true,
    rate_per_kg: true,
    total_cost: true,
    yard_location: true
  });
  const [showColMenu, setShowColMenu] = useState(false);

  // Inline Cell Editing State
  const [editingCell, setEditingCell] = useState<{ id: number; field: keyof ScrapRow } | null>(null);
  const [editValue, setEditValue] = useState('');

  // Multi-Row Modal Entry
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRows, setModalRows] = useState<any[]>([
    { date: new Date().toISOString().split('T')[0], supplier_name: '', scrap_category: 'LC Scrap', scrap_rcv_kg: '', truck_no: '', gross_weight: '', value_tare: '', rate_per_kg: '', yard_location: 'Bay A' }
  ]);
  const [validationError, setValidationError] = useState('');

  const cellPadding = isCompact ? 'px-3 py-1.5 text-[11px]' : 'px-4 py-2.5 text-xs';
  const categories = ['LC Scrap', 'Rolling Kechi', 'Tin Bundle', 'Plate Cutting', 'Heavy Melting', 'Others'];

  const handleSort = (field: keyof ScrapRow) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const startEdit = (id: number, field: keyof ScrapRow, currentVal: any) => {
    setEditingCell({ id, field });
    setEditValue(String(currentVal));
  };

  const saveInlineEdit = (id: number, field: keyof ScrapRow) => {
    const updatedRows = data.map(row => {
      if (row.id === id) {
        let val: any = editValue;
        if (field === 'scrap_rcv_kg' || field === 'gross_weight' || field === 'value_tare' || field === 'rate_per_kg') {
          val = parseFloat(editValue);
          if (isNaN(val)) val = row[field];
        }
        const gross = field === 'gross_weight' ? val : row.gross_weight;
        const tare = field === 'value_tare' ? val : row.value_tare;
        const rcv = (field === 'gross_weight' || field === 'value_tare') 
          ? Math.max(0, gross - tare) 
          : (field === 'scrap_rcv_kg' ? val : row.scrap_rcv_kg);
        const rate = field === 'rate_per_kg' ? val : row.rate_per_kg;
        const cost = rcv * rate;

        return { 
          ...row, 
          [field]: val, 
          scrap_rcv_kg: rcv,
          total_cost: cost 
        };
      }
      return row;
    });

    setData(updatedRows);
    setEditingCell(null);
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Supplier Name', 'Scrap Category', 'Scrap Received (kg)', 'Challan/Truck No', 'Gross Weight (kg)', 'Tare Weight (kg)', 'Rate/kg', 'Total Cost', 'Yard Location'];
    const rows = filteredData.map(r => [
      r.date, r.supplier_name, r.scrap_category, r.scrap_rcv_kg, r.truck_no, r.gross_weight, r.value_tare, r.rate_per_kg, r.total_cost, r.yard_location
    ]);
    exportToExcel(headers, rows, 'scrap_procurement_ledger');
  };

  const addModalRow = () => {
    setModalRows([
      ...modalRows,
      { date: new Date().toISOString().split('T')[0], supplier_name: '', scrap_category: 'LC Scrap', scrap_rcv_kg: '', truck_no: '', gross_weight: '', value_tare: '', rate_per_kg: '', yard_location: 'Bay A' }
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
      const rcv = parseFloat(row.scrap_rcv_kg);
      const gross = parseFloat(row.gross_weight);
      const tare = parseFloat(row.value_tare);
      const rate = parseFloat(row.rate_per_kg);

      if (!row.date) return setValidationError(`Row ${i + 1}: Date is required.`);
      if (!row.supplier_name.trim()) return setValidationError(`Row ${i + 1}: Supplier Name is required.`);
      if (!row.truck_no.trim()) return setValidationError(`Row ${i + 1}: Truck number is required.`);
      if (isNaN(rcv) || rcv <= 0) return setValidationError(`Row ${i + 1}: Scrap received weight must be positive.`);
      if (isNaN(gross) || gross <= 0) return setValidationError(`Row ${i + 1}: Gross weight must be positive.`);
      if (isNaN(tare) || tare < 0) return setValidationError(`Row ${i + 1}: Tare weight must be non-negative.`);
      if (gross <= tare) return setValidationError(`Row ${i + 1}: Gross weight must exceed Tare weight.`);
      if (isNaN(rate) || rate <= 0) return setValidationError(`Row ${i + 1}: Purchase rate must be positive.`);
    }

    const newEntries = modalRows.map((row, index) => {
      const rcv = parseFloat(row.scrap_rcv_kg);
      const rate = parseFloat(row.rate_per_kg);
      return {
        id: data.length + index + 1,
        date: row.date,
        supplier_name: row.supplier_name,
        scrap_category: row.scrap_category,
        scrap_rcv_kg: rcv,
        truck_no: row.truck_no,
        gross_weight: parseFloat(row.gross_weight),
        value_tare: parseFloat(row.value_tare),
        rate_per_kg: rate,
        total_cost: rcv * rate,
        yard_location: row.yard_location
      };
    });

    setData([...data, ...newEntries]);
    setIsModalOpen(false);
    setModalRows([{ date: new Date().toISOString().split('T')[0], supplier_name: '', scrap_category: 'LC Scrap', scrap_rcv_kg: '', truck_no: '', gross_weight: '', value_tare: '', rate_per_kg: '', yard_location: 'Bay A' }]);
  };

  const filteredData = data
    .filter(row => {
      const matchesSearch = row.supplier_name.toLowerCase().includes(search.toLowerCase()) ||
                            row.truck_no.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter ? row.scrap_category === categoryFilter : true;
      return matchesSearch && matchesCategory;
    })
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
          <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wider font-mono">Scrap Sourcing Ledger</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Logs inbound raw scrap party details, received weight compliance, rates, and unloading bay locations.</p>
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
            Export Excel
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
          placeholder="Filter by Supplier Name, or Challan/Truck No..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none"
        />
        <select 
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((c, idx) => <option key={idx} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Full-Screen Sheet Grid Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-150 text-[10px] uppercase font-mono text-slate-450">
                {visibleCols.date && (
                  <th className={`sticky left-0 bg-slate-50 z-10 border-r border-slate-100 ${cellPadding} cursor-pointer hover:bg-slate-100`} onClick={() => handleSort('date')}>
                    Date {sortField === 'date' && (sortDir === 'asc' ? '▲' : '▼')}
                  </th>
                )}
                {visibleCols.supplier_name && <th className={`${cellPadding} cursor-pointer hover:bg-slate-100`} onClick={() => handleSort('supplier_name')}>Supplier Name</th>}
                {visibleCols.scrap_category && <th className={`${cellPadding}`}>Scrap Category</th>}
                {visibleCols.scrap_rcv_kg && <th className={`${cellPadding} text-right`}>Rcv Weight (KG)</th>}
                {visibleCols.truck_no && <th className={`${cellPadding}`}>Challan/Truck No</th>}
                {visibleCols.gross_weight && <th className={`${cellPadding} text-right`}>Gross (KG)</th>}
                {visibleCols.value_tare && <th className={`${cellPadding} text-right`}>Tare (KG)</th>}
                {visibleCols.rate_per_kg && <th className={`${cellPadding} text-right`}>Rate/KG</th>}
                {visibleCols.total_cost && <th className={`${cellPadding} text-right`}>Total Cost</th>}
                {visibleCols.yard_location && <th className={`${cellPadding}`}>Yard Location</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-xs text-slate-400 font-mono">No records found.</td>
                </tr>
              ) : filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/40 transition-colors">
                  {visibleCols.date && (
                    <td className={`sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-150 ${cellPadding} font-bold text-slate-900`}>
                      {row.date}
                    </td>
                  )}
                  {visibleCols.supplier_name && (
                    <td className={cellPadding} onClick={() => startEdit(row.id, 'supplier_name', row.supplier_name)}>
                      {editingCell?.id === row.id && editingCell?.field === 'supplier_name' ? (
                        <input 
                          type="text" 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveInlineEdit(row.id, 'supplier_name')}
                          className="bg-slate-50 border border-slate-200 text-xs p-0.5 rounded focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.supplier_name}</span>
                      )}
                    </td>
                  )}
                  {visibleCols.scrap_category && (
                    <td className={cellPadding}>
                      <span className="px-2 py-0.5 text-[9px] font-bold border rounded-full bg-amber-50 text-[#B48F48] border-amber-250/20">
                        {row.scrap_category}
                      </span>
                    </td>
                  )}
                  {visibleCols.scrap_rcv_kg && (
                    <td className={`${cellPadding} text-right font-semibold`} onClick={() => startEdit(row.id, 'scrap_rcv_kg', row.scrap_rcv_kg)}>
                      {editingCell?.id === row.id && editingCell?.field === 'scrap_rcv_kg' ? (
                        <input 
                          type="number" 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveInlineEdit(row.id, 'scrap_rcv_kg')}
                          className="bg-slate-50 border border-slate-200 text-right text-xs p-0.5 rounded w-20 focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.scrap_rcv_kg.toLocaleString()}</span>
                      )}
                    </td>
                  )}
                  {visibleCols.truck_no && (
                    <td className={cellPadding} onClick={() => startEdit(row.id, 'truck_no', row.truck_no)}>
                      {editingCell?.id === row.id && editingCell?.field === 'truck_no' ? (
                        <input 
                          type="text" 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveInlineEdit(row.id, 'truck_no')}
                          className="bg-slate-50 border border-slate-200 text-xs p-0.5 rounded focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.truck_no}</span>
                      )}
                    </td>
                  )}
                  {visibleCols.gross_weight && (
                    <td className={`${cellPadding} text-right`} onClick={() => startEdit(row.id, 'gross_weight', row.gross_weight)}>
                      {editingCell?.id === row.id && editingCell?.field === 'gross_weight' ? (
                        <input 
                          type="number" 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveInlineEdit(row.id, 'gross_weight')}
                          className="bg-slate-50 border border-slate-200 text-right text-xs p-0.5 rounded w-20 focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.gross_weight.toLocaleString()}</span>
                      )}
                    </td>
                  )}
                  {visibleCols.value_tare && (
                    <td className={`${cellPadding} text-right`} onClick={() => startEdit(row.id, 'value_tare', row.value_tare)}>
                      {editingCell?.id === row.id && editingCell?.field === 'value_tare' ? (
                        <input 
                          type="number" 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveInlineEdit(row.id, 'value_tare')}
                          className="bg-slate-50 border border-slate-200 text-right text-xs p-0.5 rounded w-20 focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.value_tare.toLocaleString()}</span>
                      )}
                    </td>
                  )}
                  {visibleCols.rate_per_kg && (
                    <td className={`${cellPadding} text-right`} onClick={() => startEdit(row.id, 'rate_per_kg', row.rate_per_kg)}>
                      {editingCell?.id === row.id && editingCell?.field === 'rate_per_kg' ? (
                        <input 
                          type="number" 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveInlineEdit(row.id, 'rate_per_kg')}
                          className="bg-slate-50 border border-slate-200 text-right text-xs p-0.5 rounded w-20 focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">৳{row.rate_per_kg}</span>
                      )}
                    </td>
                  )}
                  {visibleCols.total_cost && (
                    <td className={`${cellPadding} text-right font-bold text-emerald-600`}>
                      ৳{row.total_cost.toLocaleString()}
                    </td>
                  )}
                  {visibleCols.yard_location && (
                    <td className={cellPadding} onClick={() => startEdit(row.id, 'yard_location', row.yard_location)}>
                      {editingCell?.id === row.id && editingCell?.field === 'yard_location' ? (
                        <input 
                          type="text" 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveInlineEdit(row.id, 'yard_location')}
                          className="bg-slate-50 border border-slate-200 text-xs p-0.5 rounded focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.yard_location}</span>
                      )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 p-4 md:p-6">
          <div className="bg-white border border-slate-250 p-6 rounded-2xl w-full max-w-5xl md:max-w-6xl shadow-2xl space-y-4 relative overflow-hidden border-t-4 border-t-[#C5A059] flex flex-col max-h-[90vh]">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-mono">Record Scrap Procurement</h3>
              <p className="text-[10px] text-slate-450 mt-1">Simultaneously log raw scrap truck arrivals, weights, purchase costs, and unloading locations.</p>
            </div>

            {validationError && (
              <div className="bg-rose-50 text-rose-800 p-3 rounded-xl border border-rose-100 text-[10px] font-bold font-mono">
                🚨 Error: {validationError}
              </div>
            )}

            <form onSubmit={handleMultiRowSubmit} className="space-y-4 flex-1 overflow-y-auto min-h-0">
              <div className="overflow-x-auto pb-3">
                <div className="space-y-3 min-w-[950px] pr-2">
                {modalRows.map((row, idx) => (
                  <div key={idx} className="flex gap-3 items-end border-b border-slate-100 pb-3 last:border-b-0">
                    <div className="w-28 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Date</label>
                      <input 
                        type="date" 
                        value={row.date}
                        onChange={(e) => handleModalRowChange(idx, 'date', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Supplier Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Metal Recyclers"
                        value={row.supplier_name}
                        onChange={(e) => handleModalRowChange(idx, 'supplier_name', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none font-mono"
                      />
                    </div>
                    <div className="w-32 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Category</label>
                      <select 
                        value={row.scrap_category}
                        onChange={(e) => handleModalRowChange(idx, 'scrap_category', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                      >
                        {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="w-24 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Rcv (KG)</label>
                      <input 
                        type="number" 
                        value={row.scrap_rcv_kg}
                        onChange={(e) => handleModalRowChange(idx, 'scrap_rcv_kg', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                      />
                    </div>
                    <div className="w-24 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Challan/Truck</label>
                      <input 
                        type="text" 
                        placeholder="TR-5032"
                        value={row.truck_no}
                        onChange={(e) => handleModalRowChange(idx, 'truck_no', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                      />
                    </div>
                    <div className="w-20 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Gross (kg)</label>
                      <input 
                        type="number" 
                        value={row.gross_weight}
                        onChange={(e) => handleModalRowChange(idx, 'gross_weight', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                      />
                    </div>
                    <div className="w-20 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Tare (kg)</label>
                      <input 
                        type="number" 
                        value={row.value_tare}
                        onChange={(e) => handleModalRowChange(idx, 'value_tare', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                      />
                    </div>
                    <div className="w-20 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Rate/KG</label>
                      <input 
                        type="number" 
                        value={row.rate_per_kg}
                        onChange={(e) => handleModalRowChange(idx, 'rate_per_kg', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                      />
                    </div>
                    <div className="w-24 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Yard Location</label>
                      <input 
                        type="text" 
                        placeholder="Bay A"
                        value={row.yard_location}
                        onChange={(e) => handleModalRowChange(idx, 'yard_location', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                      />
                    </div>
                    {modalRows.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeModalRow(idx)}
                        className="text-red-500 hover:text-red-750 pb-2.5 font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                </div>
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
                    Save Sourcing Logs
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
