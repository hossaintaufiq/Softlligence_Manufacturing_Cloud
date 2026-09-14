'use client';
import { exportToExcel } from '@/lib/excelExport';

import React, { useState, useEffect } from 'react';
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
  customValues?: Record<string, string>;
}

const STORAGE_KEY = 'steel_erp_weighbridge';

const initialWeighbridgeData: WeighbridgeRow[] = [
  { id: 1, ticket_no: 'WB-260820-001', date_time: '2026-08-20 09:30', vehicle_no: 'TR-1024', party_name: 'Metal Recyclers Corp', material_type: 'Raw Scrap Inward', gross_weight_kg: 24500, tare_weight_kg: 9500, net_weight_kg: 15000, operator_signature: 'Masum Billah' },
  { id: 2, ticket_no: 'WB-260820-002', date_time: '2026-08-20 16:15', vehicle_no: 'TR-2005', party_name: 'Metro Infrastructures', material_type: 'Finished Rod Outward', gross_weight_kg: 16500, tare_weight_kg: 8500, net_weight_kg: 8000, operator_signature: 'Masum Billah' },
  { id: 3, ticket_no: 'WB-260821-001', date_time: '2026-08-21 10:45', vehicle_no: 'TR-8812', party_name: 'Apex Scrap Suppliers', material_type: 'Raw Scrap Inward', gross_weight_kg: 22000, tare_weight_kg: 9200, net_weight_kg: 12800, operator_signature: 'S. K. Dev' }
];

export default function WeighbridgeGatePage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';

  const [data, setData] = useState<WeighbridgeRow[]>([]);
  const [customCols, setCustomCols] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [materialFilter, setMaterialFilter] = useState('');
  const [sortField, setSortField] = useState<keyof WeighbridgeRow>('ticket_no');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Cell Editing
  const [editingCell, setEditingCell] = useState<{ id: number; field: string; isCustom: boolean } | null>(null);
  const [editValue, setEditValue] = useState('');

  // Custom Modal Dialog Window State
  const [dialog, setDialog] = useState<{
    type: 'confirm' | 'prompt';
    title: string;
    message: string;
    value?: string;
    onConfirm: (val?: string) => void;
  } | null>(null);

  const cellPadding = isCompact ? 'px-3 py-1 text-[11px]' : 'px-4 py-1.5 text-xs';
  const materialTypes = ['Raw Scrap Inward', 'Finished Rod Outward'];

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch {
        setData(initialWeighbridgeData);
      }
    } else {
      setData(initialWeighbridgeData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialWeighbridgeData));
    }

    const storedCols = localStorage.getItem(`${STORAGE_KEY}_cols`);
    if (storedCols) {
      try { setCustomCols(JSON.parse(storedCols)); } catch {}
    }
  }, []);

  const saveToStorage = (updated: WeighbridgeRow[], cols = customCols) => {
    setData(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem(`${STORAGE_KEY}_cols`, JSON.stringify(cols));
  };

  // Safe Math Evaluator
  const evaluateMath = (val: string): number | string => {
    let clean = val.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
      return clean;
    }
    if (clean.startsWith('=')) {
      clean = clean.substring(1).trim();
    }
    if (/^[0-9.+\-*/()\s]+$/.test(clean)) {
      try {
        const result = new Function(`return (${clean})`)();
        if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
          return parseFloat(result.toFixed(2));
        }
      } catch {}
    }
    return val;
  };

  const handleSort = (field: keyof WeighbridgeRow) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  // Add Dynamic Column via Custom Modal
  const handleAddColumn = () => {
    setDialog({
      type: 'prompt',
      title: 'Add Custom Column',
      message: 'Enter the header name for your new dynamic column:',
      value: '',
      onConfirm: (val) => {
        if (val && val.trim()) {
          const updatedCols = [...customCols, val.trim()];
          setCustomCols(updatedCols);
          saveToStorage(data, updatedCols);
        }
      }
    });
  };

  // Add Row Directly Inline
  const handleAddRow = () => {
    const nextNum = Math.floor(100 + Math.random() * 900);
    const yymmdd = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const newRow: WeighbridgeRow = {
      id: Date.now(),
      ticket_no: `WB-${yymmdd}-${nextNum}`,
      date_time: new Date().toISOString().slice(0, 10) + ' 10:00',
      vehicle_no: 'TR-' + nextNum,
      party_name: 'New Metal Vendor',
      material_type: 'Raw Scrap Inward',
      gross_weight_kg: 0,
      tare_weight_kg: 0,
      net_weight_kg: 0,
      operator_signature: user?.name || 'Masum Billah',
      customValues: {}
    };
    saveToStorage([...data, newRow]);
  };

  // Delete Row directly via Custom Modal Confirm
  const handleDeleteRow = (id: number) => {
    setDialog({
      type: 'confirm',
      title: 'Confirm Delete',
      message: 'Are you sure you want to permanently delete this weighbridge record?',
      onConfirm: () => {
        saveToStorage(data.filter(r => r.id !== id));
      }
    });
  };

  // Excel Copy Down (Fill Down)
  const handleFillDown = (field: string, isCustom = false) => {
    if (data.length <= 1) return;
    const firstVal = isCustom 
      ? (data[0].customValues?.[field] || '') 
      : data[0][field as keyof WeighbridgeRow];

    const updated = data.map((row, idx) => {
      if (idx === 0) return row;
      if (isCustom) {
        return {
          ...row,
          customValues: { ...(row.customValues || {}), [field]: String(firstVal) }
        };
      } else {
        const baseRow = { ...row, [field]: firstVal };
        const gross = Number(baseRow.gross_weight_kg);
        const tare = Number(baseRow.tare_weight_kg);
        baseRow.net_weight_kg = Math.max(0, gross - tare);
        return baseRow;
      }
    });
    saveToStorage(updated);
  };

  const startEdit = (id: number, field: string, currentVal: any, isCustom = false) => {
    if (editingCell) {
      saveInlineEdit(editingCell.id, editingCell.field, editingCell.isCustom, editValue);
    }
    setEditingCell({ id, field, isCustom });
    setEditValue(String(currentVal));
  };

  const saveInlineEdit = (id: number, field: string, isCustom = false, forcedValue?: string) => {
    const valToSave = forcedValue !== undefined ? forcedValue : editValue;
    const evaluated = evaluateMath(valToSave);
    const updated = data.map(row => {
      if (row.id === id) {
        if (isCustom) {
          return {
            ...row,
            customValues: { ...(row.customValues || {}), [field]: String(evaluated) }
          };
        } else {
          let val: any = evaluated;
          if (field === 'gross_weight_kg' || field === 'tare_weight_kg' || field === 'net_weight_kg') {
            val = Number(evaluated);
            if (isNaN(val)) val = row[field as keyof WeighbridgeRow] || 0;
          }
          const baseRow = { ...row, [field]: val };
          const gross = Number(baseRow.gross_weight_kg);
          const tare = Number(baseRow.tare_weight_kg);
          baseRow.net_weight_kg = Math.max(0, gross - tare);
          return baseRow;
        }
      }
      return row;
    });

    saveToStorage(updated);
    setEditingCell(null);
  };

  const handleExportExcel = () => {
    const customHeaders = customCols;
    const headers = ['Ticket No', 'Date & Time', 'Vehicle Number', 'Party Name', 'Material Type', 'Gross Weight (kg)', 'Tare Weight (kg)', 'Net Weight (kg)', 'Operator', ...customHeaders];
    
    const rows = filteredData.map(r => [
      r.ticket_no, r.date_time, r.vehicle_no, r.party_name, r.material_type, r.gross_weight_kg, r.tare_weight_kg, r.net_weight_kg, r.operator_signature,
      ...(customCols.map(col => r.customValues?.[col] || ''))
    ]);
    exportToExcel(headers, rows, 'weighbridge_gate_ledger');
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
      
      {/* Custom Modal Dialog Box */}
      {dialog && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200/90 p-6 rounded-2xl shadow-2xl w-full max-w-md space-y-4 animate-zoom-in my-8">
            <h3 className="text-base font-bold text-slate-900 font-sans border-b border-slate-100 pb-2.5">
              {dialog.title}
            </h3>
            <p className="text-sm text-slate-600 font-sans leading-relaxed">
              {dialog.message}
            </p>
            {dialog.type === 'prompt' && (
              <input 
                type="text" 
                value={dialog.value || ''}
                onChange={(e) => setDialog({ ...dialog, value: e.target.value })}
                className="w-full bg-white border border-slate-300 text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059] font-sans text-slate-900"
                placeholder="Type dynamic column name..."
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    dialog.onConfirm(dialog.value);
                    setDialog(null);
                  }
                }}
              />
            )}
            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <button 
                onClick={() => setDialog(null)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition-all cursor-pointer bg-white"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  dialog.onConfirm(dialog.value);
                  setDialog(null);
                }}
                className="px-5 py-2 bg-[#B48F48] hover:bg-[#9E7A37] text-white font-semibold text-sm rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enterprise Header Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#B48F48] uppercase tracking-wider font-mono mb-1.5">
            <span>Plant Gate Operations</span>
            <span>•</span>
            <span>Weighbridge Terminal 01</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">Weighbridge Gate Control</h1>
          <p className="text-sm text-slate-500 font-sans mt-0.5">Automated gross-tare-net weight tracking for incoming scrap loads and outgoing rebar consignments.</p>
        </div>
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <button 
            onClick={handleAddColumn}
            className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center space-x-2"
          >
            <span>+ Add Column</span>
          </button>
          <button 
            onClick={handleExportExcel}
            className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export XLS</span>
          </button>
          <button 
            onClick={handleAddRow}
            className="flex-1 md:flex-none px-5 py-2.5 bg-[#B48F48] hover:bg-[#9E7A37] text-white text-sm font-semibold rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>+ Log Ticket</span>
          </button>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Total Tickets</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-amber-50 text-amber-700 border border-amber-200">24h Shift</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono tracking-tight text-slate-900">{data.length}</span>
            <span className="text-xs text-slate-400 font-mono">Vehicles</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Inward Scrap Net</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">Raw In</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono tracking-tight text-slate-900">
              {(data.filter(r => r.material_type === 'Raw Scrap Inward').reduce((acc, r) => acc + (Number(r.net_weight_kg) || 0), 0) / 1000).toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 font-mono">Metric Tons</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Outward Rebar Net</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-blue-50 text-blue-700 border border-blue-200">Sales Out</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono tracking-tight text-slate-900">
              {(data.filter(r => r.material_type === 'Finished Rod Outward').reduce((acc, r) => acc + (Number(r.net_weight_kg) || 0), 0) / 1000).toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 font-mono">Metric Tons</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Scale Calibration</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">Verified</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono tracking-tight text-slate-900">±0.02%</span>
            <span className="text-xs text-emerald-600 font-mono font-medium">Certified 60T</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Strip */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white border border-slate-200/90 p-4 rounded-2xl shadow-xs">
        <input 
          type="text" 
          placeholder="Search by ticket number, vehicle plate, or party name..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-white border border-slate-300 text-sm px-3.5 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059] font-sans text-slate-900"
        />
        <select 
          value={materialFilter}
          onChange={(e) => setMaterialFilter(e.target.value)}
          className="bg-white border border-slate-300 text-sm px-3.5 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059] font-sans text-slate-900"
        >
          <option value="">All Material Types</option>
          <option value="Raw Scrap Inward">Raw Scrap Inward</option>
          <option value="Finished Rod Outward">Finished Rod Outward</option>
        </select>
      </div>

      {/* Enterprise Data Grid Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px] table-fixed">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase font-mono text-slate-500 select-none">
                <th className={`w-14 text-center ${cellPadding}`}>Actions</th>
                <th className={`w-36 ${cellPadding} cursor-pointer hover:text-slate-900 transition-colors`} onClick={() => handleSort('ticket_no')}>
                  Ticket No {sortField === 'ticket_no' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th className={`w-40 ${cellPadding}`}>
                  Date & Time
                </th>
                <th className={`w-32 ${cellPadding}`}>
                  Vehicle Number
                </th>
                <th className={`w-52 ${cellPadding}`}>
                  Party Name
                </th>
                <th className={`w-44 ${cellPadding}`}>Material Type</th>
                <th className={`w-28 ${cellPadding} text-right`}>
                  Gross (KG)
                </th>
                <th className={`w-28 ${cellPadding} text-right`}>
                  Tare (KG)
                </th>
                <th className={`w-28 ${cellPadding} text-right text-[#B48F48] font-bold`}>Net (KG)</th>
                <th className={`w-36 ${cellPadding}`}>
                  Operator
                </th>

                {/* Dynamic Columns */}
                {customCols.map(col => (
                  <th key={col} className={`w-32 ${cellPadding} text-amber-900 bg-amber-50/60 font-semibold`}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/40 transition-colors h-9">
                  
                  {/* Delete Row */}
                  <td className="text-center py-1">
                    <button 
                      onClick={() => handleDeleteRow(row.id)}
                      className="text-red-500 hover:text-red-750 font-bold text-xs"
                    >
                      ✕
                    </button>
                  </td>

                  {/* Ticket No */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center">
                      {editingCell?.id === row.id && editingCell?.field === 'ticket_no' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'ticket_no')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'ticket_no')} className="absolute inset-0 w-full h-full bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10" autoFocus />
                      ) : (
                        <span className="w-full h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block font-bold text-slate-900 select-none" onClick={() => startEdit(row.id, 'ticket_no', row.ticket_no)}>{row.ticket_no}</span>
                      )}
                    </div>
                  </td>

                  {/* Date & Time */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center">
                      {editingCell?.id === row.id && editingCell?.field === 'date_time' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'date_time')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'date_time')} className="absolute inset-0 w-full h-full bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10" autoFocus />
                      ) : (
                        <span className="w-full h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block select-none" onClick={() => startEdit(row.id, 'date_time', row.date_time)}>{row.date_time}</span>
                      )}
                    </div>
                  </td>

                  {/* Vehicle Number */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center">
                      {editingCell?.id === row.id && editingCell?.field === 'vehicle_no' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'vehicle_no')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'vehicle_no')} className="absolute inset-0 w-full h-full bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10" autoFocus />
                      ) : (
                        <span className="w-full h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block select-none" onClick={() => startEdit(row.id, 'vehicle_no', row.vehicle_no)}>{row.vehicle_no}</span>
                      )}
                    </div>
                  </td>

                  {/* Party Name */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center">
                      {editingCell?.id === row.id && editingCell?.field === 'party_name' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'party_name')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'party_name')} className="absolute inset-0 w-full h-full bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10" autoFocus />
                      ) : (
                        <span className="w-full h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block truncate select-none" title={row.party_name} onClick={() => startEdit(row.id, 'party_name', row.party_name)}>{row.party_name}</span>
                      )}
                    </div>
                  </td>

                  {/* Material Type select */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center">
                      <select
                        value={row.material_type}
                        onChange={(e) => {
                          const updated = data.map(r => r.id === row.id ? { ...r, material_type: e.target.value as any } : r);
                          saveToStorage(updated);
                        }}
                        className="w-full bg-transparent border-0 focus:outline-none py-0.5 text-xs font-sans font-bold truncate text-[#B48F48]"
                      >
                        {materialTypes.map((m, i) => <option key={i} value={m}>{m}</option>)}
                      </select>
                    </div>
                  </td>

                  {/* Gross Weight */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center justify-end text-right">
                      {editingCell?.id === row.id && editingCell?.field === 'gross_weight_kg' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'gross_weight_kg')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'gross_weight_kg')} className="absolute inset-0 w-full h-full text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10" autoFocus />
                      ) : (
                        <span className="w-full h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block select-none font-semibold" onClick={() => startEdit(row.id, 'gross_weight_kg', row.gross_weight_kg)}>{row.gross_weight_kg.toLocaleString()}</span>
                      )}
                    </div>
                  </td>

                  {/* Tare Weight */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center justify-end text-right">
                      {editingCell?.id === row.id && editingCell?.field === 'tare_weight_kg' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'tare_weight_kg')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'tare_weight_kg')} className="absolute inset-0 w-full h-full text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10" autoFocus />
                      ) : (
                        <span className="w-full h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block select-none" onClick={() => startEdit(row.id, 'tare_weight_kg', row.tare_weight_kg)}>{row.tare_weight_kg.toLocaleString()}</span>
                      )}
                    </div>
                  </td>

                  {/* Net Weight (Calculated) */}
                  <td className={`${cellPadding} text-right font-black text-[#B48F48]`}>
                    <span className="h-7 flex items-center justify-end px-1 select-none">{row.net_weight_kg.toLocaleString()}</span>
                  </td>

                  {/* Operator Signature */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center">
                      {editingCell?.id === row.id && editingCell?.field === 'operator_signature' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'operator_signature')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'operator_signature')} className="absolute inset-0 w-full h-full bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10" autoFocus />
                      ) : (
                        <span className="w-full h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block italic text-slate-500 select-none" onClick={() => startEdit(row.id, 'operator_signature', row.operator_signature)}>{row.operator_signature}</span>
                      )}
                    </div>
                  </td>

                  {/* Dynamic Columns */}
                  {customCols.map(col => (
                    <td key={col} className={`${cellPadding} bg-amber-50/10`}>
                      <div className="relative w-full h-7 flex items-center">
                        {editingCell?.id === row.id && editingCell?.field === col && editingCell?.isCustom ? (
                          <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, col, true)} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, col, true)} className="absolute inset-0 w-full h-full bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10" autoFocus />
                        ) : (
                          <span className="w-full h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block min-h-[1.2rem] select-none" onClick={() => startEdit(row.id, col, row.customValues?.[col] || '', true)}>{row.customValues?.[col] || ''}</span>
                        )}
                      </div>
                    </td>
                  ))}

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
