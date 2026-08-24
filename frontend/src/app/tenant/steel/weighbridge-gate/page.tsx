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
      setSortDir('desc');
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
    const newRow: WeighbridgeRow = {
      id: Date.now(),
      ticket_no: `WB-2608-${nextNum}`,
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
    setEditingCell({ id, field, isCustom });
    setEditValue(String(currentVal));
  };

  const saveInlineEdit = (id: number, field: string, isCustom = false) => {
    const evaluated = evaluateMath(editValue);
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
      
      {/* Custom Modal Dialog Box (Unifying confirm & alert prompts) */}
      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xl w-full max-w-md space-y-4 animate-scale-in">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-mono border-b border-slate-100 pb-2">
              {dialog.title}
            </h3>
            <p className="text-xs text-slate-650 font-sans leading-relaxed">
              {dialog.message}
            </p>
            {dialog.type === 'prompt' && (
              <input 
                type="text" 
                value={dialog.value || ''}
                onChange={(e) => setDialog({ ...dialog, value: e.target.value })}
                className="w-full bg-slate-50 border border-slate-250 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-[#C5A059] font-sans"
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
            <div className="flex justify-end space-x-2 pt-2">
              <button 
                onClick={() => setDialog(null)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all cursor-pointer bg-white"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  dialog.onConfirm(dialog.value);
                  setDialog(null);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Title Bar */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wider font-mono">Weighbridge Gate Control</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Logs plant gross-tare-net vehicle weighments for incoming raw scrap and outgoing finished rod shipments.</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handleAddColumn}
            className="px-3 py-2 border border-[#C5A059] text-[#B48F48] hover:bg-[#FAF6EE] text-xs font-bold rounded-xl transition-all cursor-pointer bg-white"
          >
            + Add Column
          </button>
          <button 
            onClick={handleExportExcel}
            className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all cursor-pointer bg-white"
          >
            Export Excel
          </button>
          <button 
            onClick={handleAddRow}
            className="px-4 py-2 bg-[#C5A059] hover:bg-[#B48F48] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            + Add Row
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
              <tr className="bg-slate-50/70 border-b border-slate-150 text-[10px] uppercase font-mono text-slate-450 select-none">
                <th className={`w-14 text-center ${cellPadding}`}>Actions</th>
                <th className={`${cellPadding} cursor-pointer hover:bg-slate-100`} onClick={() => handleSort('ticket_no')}>
                  Ticket No {sortField === 'ticket_no' && (sortDir === 'asc' ? '▲' : '▼')}
                </th>
                <th className={`${cellPadding}`}>
                  Date & Time <button onClick={() => handleFillDown('date_time')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                </th>
                <th className={`${cellPadding}`}>
                  Vehicle Number <button onClick={() => handleFillDown('vehicle_no')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                </th>
                <th className={`${cellPadding}`}>
                  Party Name <button onClick={() => handleFillDown('party_name')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                </th>
                <th className={`${cellPadding}`}>Material Type</th>
                <th className={`${cellPadding} text-right`}>
                  Gross (KG) <button onClick={() => handleFillDown('gross_weight_kg')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                </th>
                <th className={`${cellPadding} text-right`}>
                  Mock Tare (KG) <button onClick={() => handleFillDown('tare_weight_kg')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                </th>
                <th className={`${cellPadding} text-right text-[#B48F48]`}>Net (KG)</th>
                <th className={`${cellPadding}`}>
                  Operator Signature <button onClick={() => handleFillDown('operator_signature')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                </th>

                {/* Dynamic Columns */}
                {customCols.map(col => (
                  <th key={col} className={`${cellPadding} text-slate-600 bg-amber-50/30`}>
                    {col} <button onClick={() => handleFillDown(col, true)} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
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
                  <td className={cellPadding} onClick={() => startEdit(row.id, 'ticket_no', row.ticket_no)}>
                    {editingCell?.id === row.id && editingCell?.field === 'ticket_no' ? (
                      <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'ticket_no')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'ticket_no')} className="h-7 w-full bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans" autoFocus />
                    ) : (
                      <span className="h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block font-bold text-slate-900 select-none">{row.ticket_no}</span>
                    )}
                  </td>

                  {/* Date & Time */}
                  <td className={cellPadding} onClick={() => startEdit(row.id, 'date_time', row.date_time)}>
                    {editingCell?.id === row.id && editingCell?.field === 'date_time' ? (
                      <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'date_time')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'date_time')} className="h-7 w-36 bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans" autoFocus />
                    ) : (
                      <span className="h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block select-none">{row.date_time}</span>
                    )}
                  </td>

                  {/* Vehicle Number */}
                  <td className={cellPadding} onClick={() => startEdit(row.id, 'vehicle_no', row.vehicle_no)}>
                    {editingCell?.id === row.id && editingCell?.field === 'vehicle_no' ? (
                      <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'vehicle_no')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'vehicle_no')} className="h-7 w-24 bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans" autoFocus />
                    ) : (
                      <span className="h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block select-none">{row.vehicle_no}</span>
                    )}
                  </td>

                  {/* Party Name */}
                  <td className={cellPadding} onClick={() => startEdit(row.id, 'party_name', row.party_name)}>
                    {editingCell?.id === row.id && editingCell?.field === 'party_name' ? (
                      <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'party_name')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'party_name')} className="h-7 w-full bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans" autoFocus />
                    ) : (
                      <span className="h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block truncate max-w-[200px] select-none" title={row.party_name}>{row.party_name}</span>
                    )}
                  </td>

                  {/* Material Type select */}
                  <td className={cellPadding}>
                    <select
                      value={row.material_type}
                      onChange={(e) => {
                        const updated = data.map(r => r.id === row.id ? { ...r, material_type: e.target.value as any } : r);
                        saveToStorage(updated);
                      }}
                      className="bg-transparent border-0 focus:outline-none py-0.5 text-xs font-sans font-bold"
                    >
                      {materialTypes.map((m, i) => <option key={i} value={m}>{m}</option>)}
                    </select>
                  </td>

                  {/* Gross Weight */}
                  <td className={`${cellPadding} text-right font-semibold`} onClick={() => startEdit(row.id, 'gross_weight_kg', row.gross_weight_kg)}>
                    {editingCell?.id === row.id && editingCell?.field === 'gross_weight_kg' ? (
                      <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'gross_weight_kg')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'gross_weight_kg')} className="h-7 w-20 text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans" autoFocus />
                    ) : (
                      <span className="h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block select-none">{row.gross_weight_kg.toLocaleString()}</span>
                    )}
                  </td>

                  {/* Tare Weight */}
                  <td className={`${cellPadding} text-right`} onClick={() => startEdit(row.id, 'tare_weight_kg', row.tare_weight_kg)}>
                    {editingCell?.id === row.id && editingCell?.field === 'tare_weight_kg' ? (
                      <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'tare_weight_kg')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'tare_weight_kg')} className="h-7 w-20 text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans" autoFocus />
                    ) : (
                      <span className="h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block select-none">{row.tare_weight_kg.toLocaleString()}</span>
                    )}
                  </td>

                  {/* Net Weight (Calculated) */}
                  <td className={`${cellPadding} text-right font-black text-[#B48F48]`}>
                    <span className="h-7 flex items-center justify-end px-1 select-none">{row.net_weight_kg.toLocaleString()}</span>
                  </td>

                  {/* Operator Signature */}
                  <td className={cellPadding} onClick={() => startEdit(row.id, 'operator_signature', row.operator_signature)}>
                    {editingCell?.id === row.id && editingCell?.field === 'operator_signature' ? (
                      <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'operator_signature')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'operator_signature')} className="h-7 w-28 bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans" autoFocus />
                    ) : (
                      <span className="h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block italic text-slate-500 select-none">{row.operator_signature}</span>
                    )}
                  </td>

                  {/* Dynamic Columns */}
                  {customCols.map(col => (
                    <td key={col} className={`${cellPadding} bg-amber-50/10`} onClick={() => startEdit(row.id, col, row.customValues?.[col] || '', true)}>
                      {editingCell?.id === row.id && editingCell?.field === col && editingCell?.isCustom ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, col, true)} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, col, true)} className="h-7 w-20 bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans" autoFocus />
                      ) : (
                        <span className="h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block min-h-[1.2rem] select-none">{row.customValues?.[col] || ''}</span>
                      )}
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
