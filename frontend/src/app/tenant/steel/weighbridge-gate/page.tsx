'use client';
import { exportToExcel } from '@/lib/excelExport';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface WeighbridgeRow {
  id: number;
  ticket_no: string;
  date_time: string;
  vehicle_no: string;
  party_name: string;
  material_type: 'Raw Scrap Inward' | 'Finished Rod Outward';
  gross_weight_kg: number;
  tare_weight_kg: number;
  net_weight_kg: number;
  operator_signature: string;
}

export default function WeighbridgeGatePage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';

  // Local Demo Seed Data
  const [data, setData] = useState<WeighbridgeRow[]>([
    { id: 1, ticket_no: 'WB-260820-001', date_time: '2026-08-20 09:30', vehicle_no: 'TR-1024', party_name: 'Metal Recyclers Corp', material_type: 'Raw Scrap Inward', gross_weight_kg: 24500, tare_weight_kg: 9500, net_weight_kg: 15000, operator_signature: 'Masum Billah' },
    { id: 2, ticket_no: 'WB-260820-002', date_time: '2026-08-20 16:15', vehicle_no: 'TR-2005', party_name: 'Metro Infrastructures', material_type: 'Finished Rod Outward', gross_weight_kg: 16500, tare_weight_kg: 8500, net_weight_kg: 8000, operator_signature: 'Masum Billah' },
    { id: 3, ticket_no: 'WB-260821-001', date_time: '2026-08-21 10:45', vehicle_no: 'TR-8812', party_name: 'Apex Scrap Suppliers', material_type: 'Raw Scrap Inward', gross_weight_kg: 22000, tare_weight_kg: 9200, net_weight_kg: 12800, operator_signature: 'S. K. Dev' }
  ]);

  // Sheet States
  const [search, setSearch] = useState('');
  const [materialFilter, setMaterialFilter] = useState('');
  const [sortField, setSortField] = useState<keyof WeighbridgeRow>('ticket_no');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Visible Columns Toggle
  const [visibleCols, setVisibleCols] = useState({
    ticket_no: true,
    date_time: true,
    vehicle_no: true,
    party_name: true,
    material_type: true,
    gross_weight_kg: true,
    tare_weight_kg: true,
    net_weight_kg: true,
    operator_signature: true
  });
  const [showColMenu, setShowColMenu] = useState(false);

  // Inline Cell Editing State
  const [editingCell, setEditingCell] = useState<{ id: number; field: keyof WeighbridgeRow } | null>(null);
  const [editValue, setEditValue] = useState('');

  // Multi-Row Modal Entry
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRows, setModalRows] = useState<any[]>([
    { ticket_no: 'WB-260823-104', date_time: new Date().toISOString().slice(0, 16), vehicle_no: '', party_name: '', material_type: 'Raw Scrap Inward', gross_weight_kg: '', tare_weight_kg: '', operator_signature: user?.name || 'Operator' }
  ]);
  const [validationError, setValidationError] = useState('');

  const cellPadding = isCompact ? 'px-3 py-1.5 text-[11px]' : 'px-4 py-2.5 text-xs';

  const handleSort = (field: keyof WeighbridgeRow) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const startEdit = (id: number, field: keyof WeighbridgeRow, currentVal: any) => {
    setEditingCell({ id, field });
    setEditValue(String(currentVal));
  };

  const saveInlineEdit = (id: number, field: keyof WeighbridgeRow) => {
    const updatedRows = data.map(row => {
      if (row.id === id) {
        let val: any = editValue;
        if (field === 'gross_weight_kg' || field === 'tare_weight_kg') {
          val = parseFloat(editValue);
          if (isNaN(val)) val = row[field];
        }
        const gross = field === 'gross_weight_kg' ? val : row.gross_weight_kg;
        const tare = field === 'tare_weight_kg' ? val : row.tare_weight_kg;
        const net = Math.max(0, gross - tare);

        return { ...row, [field]: val, net_weight_kg: net };
      }
      return row;
    });

    setData(updatedRows);
    setEditingCell(null);
  };

  const handleExportCSV = () => {
    const headers = ['Ticket No', 'Date & Time', 'Vehicle Number', 'Party Name', 'Material Type', 'Gross Weight (kg)', 'Tare Weight (kg)', 'Net Weight (kg)', 'Operator'];
    const rows = filteredData.map(r => [
      r.ticket_no, r.date_time, r.vehicle_no, r.party_name, r.material_type, r.gross_weight_kg, r.tare_weight_kg, r.net_weight_kg, r.operator_signature
    ]);
    exportToExcel(headers, rows, 'weighbridge_ticket_logs');
  };

  const addModalRow = () => {
    const randomTicket = `WB-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
    setModalRows([
      ...modalRows,
      { ticket_no: randomTicket, date_time: new Date().toISOString().slice(0, 16), vehicle_no: '', party_name: '', material_type: 'Raw Scrap Inward', gross_weight_kg: '', tare_weight_kg: '', operator_signature: user?.name || 'Operator' }
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
      const gross = parseFloat(row.gross_weight_kg);
      const tare = parseFloat(row.tare_weight_kg);

      if (!row.ticket_no.trim()) return setValidationError(`Row ${i + 1}: Ticket number is required.`);
      if (!row.vehicle_no.trim()) return setValidationError(`Row ${i + 1}: Vehicle number is required.`);
      if (!row.party_name.trim()) return setValidationError(`Row ${i + 1}: Party Name is required.`);
      if (isNaN(gross) || gross <= 0) return setValidationError(`Row ${i + 1}: Gross weight must be positive.`);
      if (isNaN(tare) || tare < 0) return setValidationError(`Row ${i + 1}: Tare weight must be non-negative.`);
      if (gross <= tare) return setValidationError(`Row ${i + 1}: Gross weight must exceed Tare weight.`);
    }

    const newEntries = modalRows.map((row, index) => {
      const gross = parseFloat(row.gross_weight_kg);
      const tare = parseFloat(row.tare_weight_kg);
      return {
        id: data.length + index + 1,
        ticket_no: row.ticket_no,
        date_time: row.date_time.replace('T', ' '),
        vehicle_no: row.vehicle_no,
        party_name: row.party_name,
        material_type: row.material_type,
        gross_weight_kg: gross,
        tare_weight_kg: tare,
        net_weight_kg: gross - tare,
        operator_signature: row.operator_signature
      };
    });

    setData([...data, ...newEntries]);
    setIsModalOpen(false);
    setModalRows([{ ticket_no: `WB-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`, date_time: new Date().toISOString().slice(0, 16), vehicle_no: '', party_name: '', material_type: 'Raw Scrap Inward', gross_weight_kg: '', tare_weight_kg: '', operator_signature: user?.name || 'Operator' }]);
  };

  const filteredData = data
    .filter(row => {
      const matchesSearch = row.vehicle_no.toLowerCase().includes(search.toLowerCase()) ||
                            row.party_name.toLowerCase().includes(search.toLowerCase()) ||
                            row.ticket_no.toLowerCase().includes(search.toLowerCase());
      const matchesType = materialFilter ? row.material_type === materialFilter : true;
      return matchesSearch && matchesType;
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
          <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wider font-mono">Weighbridge Gate Control</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Logs plant gross-tare-net vehicle weighments for incoming raw scrap and outgoing deformed rod shipments.</p>
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
          placeholder="Filter by Ticket, Vehicle Number, or Party name..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-slate-50 border border-slate-250 text-xs px-3 py-2 rounded-xl focus:outline-none"
        />
        <select 
          value={materialFilter}
          onChange={(e) => setMaterialFilter(e.target.value)}
          className="bg-slate-50 border border-slate-250 text-xs px-3 py-2 rounded-xl focus:outline-none"
        >
          <option value="">All Materials</option>
          <option value="Raw Scrap Inward">Raw Scrap Inward</option>
          <option value="Finished Rod Outward">Finished Rod Outward</option>
        </select>
      </div>

      {/* Full-Screen Sheet Grid Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-150 text-[10px] uppercase font-mono text-slate-450">
                {visibleCols.ticket_no && (
                  <th className={`sticky left-0 bg-slate-50 z-10 border-r border-slate-100 ${cellPadding} cursor-pointer hover:bg-slate-100`} onClick={() => handleSort('ticket_no')}>
                    Ticket No {sortField === 'ticket_no' && (sortDir === 'asc' ? '▲' : '▼')}
                  </th>
                )}
                {visibleCols.date_time && <th className={`${cellPadding} cursor-pointer hover:bg-slate-100`} onClick={() => handleSort('date_time')}>Date & Time</th>}
                {visibleCols.vehicle_no && <th className={`${cellPadding} cursor-pointer hover:bg-slate-100`} onClick={() => handleSort('vehicle_no')}>Vehicle Number</th>}
                {visibleCols.party_name && <th className={`${cellPadding} cursor-pointer hover:bg-slate-100`} onClick={() => handleSort('party_name')}>Party Name</th>}
                {visibleCols.material_type && <th className={`${cellPadding}`}>Material Type</th>}
                {visibleCols.gross_weight_kg && <th className={`${cellPadding} text-right`}>Gross (KG)</th>}
                {visibleCols.tare_weight_kg && <th className={`${cellPadding} text-right`}>Tare (KG)</th>}
                {visibleCols.net_weight_kg && <th className={`${cellPadding} text-right`}>Net (KG)</th>}
                {visibleCols.operator_signature && <th className={`${cellPadding}`}>Operator Signature</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-xs text-slate-400 font-mono">No tickets found.</td>
                </tr>
              ) : filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/40 transition-colors">
                  {visibleCols.ticket_no && (
                    <td className={`sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-150 ${cellPadding} font-bold text-slate-900`}>
                      {row.ticket_no}
                    </td>
                  )}
                  {visibleCols.date_time && (
                    <td className={cellPadding} onClick={() => startEdit(row.id, 'date_time', row.date_time)}>
                      {editingCell?.id === row.id && editingCell?.field === 'date_time' ? (
                        <input 
                          type="text" 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveInlineEdit(row.id, 'date_time')}
                          className="bg-slate-50 border border-slate-200 text-xs p-0.5 rounded focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.date_time}</span>
                      )}
                    </td>
                  )}
                  {visibleCols.vehicle_no && (
                    <td className={cellPadding} onClick={() => startEdit(row.id, 'vehicle_no', row.vehicle_no)}>
                      {editingCell?.id === row.id && editingCell?.field === 'vehicle_no' ? (
                        <input 
                          type="text" 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveInlineEdit(row.id, 'vehicle_no')}
                          className="bg-slate-50 border border-slate-200 text-xs p-0.5 rounded focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.vehicle_no}</span>
                      )}
                    </td>
                  )}
                  {visibleCols.party_name && (
                    <td className={`${cellPadding} truncate max-w-[150px]`} onClick={() => startEdit(row.id, 'party_name', row.party_name)}>
                      {editingCell?.id === row.id && editingCell?.field === 'party_name' ? (
                        <input 
                          type="text" 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveInlineEdit(row.id, 'party_name')}
                          className="bg-slate-50 border border-slate-200 text-xs p-0.5 rounded focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded" title={row.party_name}>{row.party_name}</span>
                      )}
                    </td>
                  )}
                  {visibleCols.material_type && (
                    <td className={cellPadding}>
                      <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-full ${
                        row.material_type === 'Raw Scrap Inward' ? 'bg-amber-50 text-[#B48F48] border-amber-200/50' : 'bg-indigo-50 text-indigo-650 border-indigo-200/50'
                      }`}>
                        {row.material_type}
                      </span>
                    </td>
                  )}
                  {visibleCols.gross_weight_kg && (
                    <td className={`${cellPadding} text-right font-semibold`} onClick={() => startEdit(row.id, 'gross_weight_kg', row.gross_weight_kg)}>
                      {editingCell?.id === row.id && editingCell?.field === 'gross_weight_kg' ? (
                        <input 
                          type="number" 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveInlineEdit(row.id, 'gross_weight_kg')}
                          className="bg-slate-50 border border-slate-200 text-right text-xs p-0.5 rounded w-20 focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.gross_weight_kg.toLocaleString()}</span>
                      )}
                    </td>
                  )}
                  {visibleCols.tare_weight_kg && (
                    <td className={`${cellPadding} text-right`} onClick={() => startEdit(row.id, 'tare_weight_kg', row.tare_weight_kg)}>
                      {editingCell?.id === row.id && editingCell?.field === 'tare_weight_kg' ? (
                        <input 
                          type="number" 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveInlineEdit(row.id, 'tare_weight_kg')}
                          className="bg-slate-50 border border-slate-200 text-right text-xs p-0.5 rounded w-20 focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.tare_weight_kg.toLocaleString()}</span>
                      )}
                    </td>
                  )}
                  {visibleCols.net_weight_kg && (
                    <td className={`${cellPadding} text-right font-black text-[#B48F48]`}>
                      {row.net_weight_kg.toLocaleString()}
                    </td>
                  )}
                  {visibleCols.operator_signature && (
                    <td className={`${cellPadding} italic text-slate-500`}>
                      {row.operator_signature}
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
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-mono">Quick Multi-Row Weighments</h3>
              <p className="text-[10px] text-slate-450 mt-1">Simultaneously log multiple incoming scrap trucks and finished rebar dispatches.</p>
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
                      <div className="w-32 space-y-1">
                        <label className="text-[8px] font-bold font-mono text-slate-400">Ticket No</label>
                        <input 
                          type="text" 
                          value={row.ticket_no}
                          onChange={(e) => handleModalRowChange(idx, 'ticket_no', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                        />
                      </div>
                      <div className="w-40 space-y-1">
                        <label className="text-[8px] font-bold font-mono text-slate-400">Date & Time</label>
                        <input 
                          type="datetime-local" 
                          value={row.date_time}
                          onChange={(e) => handleModalRowChange(idx, 'date_time', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                        />
                      </div>
                      <div className="w-28 space-y-1">
                        <label className="text-[8px] font-bold font-mono text-slate-400">Vehicle Number</label>
                        <input 
                          type="text" 
                          placeholder="TR-1234"
                          value={row.vehicle_no}
                          onChange={(e) => handleModalRowChange(idx, 'vehicle_no', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <label className="text-[8px] font-bold font-mono text-slate-400">Party Name</label>
                        <input 
                          type="text" 
                          placeholder="Party/Vendor Name"
                          value={row.party_name}
                          onChange={(e) => handleModalRowChange(idx, 'party_name', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none font-mono"
                        />
                      </div>
                      <div className="w-36 space-y-1">
                        <label className="text-[8px] font-bold font-mono text-slate-400">Type</label>
                        <select 
                          value={row.material_type}
                          onChange={(e) => handleModalRowChange(idx, 'material_type', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                        >
                          <option value="Raw Scrap Inward">Raw Scrap Inward</option>
                          <option value="Finished Rod Outward">Finished Rod Outward</option>
                        </select>
                      </div>
                      <div className="w-20 space-y-1">
                        <label className="text-[8px] font-bold font-mono text-slate-400">Gross (kg)</label>
                        <input 
                          type="number" 
                          placeholder="24000"
                          value={row.gross_weight_kg}
                          onChange={(e) => handleModalRowChange(idx, 'gross_weight_kg', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                        />
                      </div>
                      <div className="w-20 space-y-1">
                        <label className="text-[8px] font-bold font-mono text-slate-400">Tare (kg)</label>
                        <input 
                          type="number" 
                          placeholder="9000"
                          value={row.tare_weight_kg}
                          onChange={(e) => handleModalRowChange(idx, 'tare_weight_kg', e.target.value)}
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
                    Save Weighments
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
