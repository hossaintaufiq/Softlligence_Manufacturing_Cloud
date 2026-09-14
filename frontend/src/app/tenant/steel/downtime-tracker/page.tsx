'use client';
import { exportToExcel } from '@/lib/excelExport';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface DowntimeRow {
  id: number;
  date: string;
  ticket_no: string;
  equipment: string;
  billet_breakdown_min: number;
  rolling_breakdown_min: number;
  breakdown_category: string;
  root_cause_notes: string;
  shift_code: string;
  action_taken: string;
  severity?: 'Critical' | 'Medium' | 'Minor';
  technician?: string;
  customValues?: Record<string, string>;
}

const STORAGE_KEY = 'steel_erp_downtime';

const initialDowntimeData: DowntimeRow[] = [
  { id: 1, date: '2026-08-20', ticket_no: 'TKT-2608-01', equipment: 'CCM Mold Stirrer', billet_breakdown_min: 45, rolling_breakdown_min: 0, breakdown_category: 'Electrical', root_cause_notes: 'CCM mold stirrer sensor replacement & calibration', shift_code: 'A', action_taken: 'Replaced inductive sensor and verified signal loop', severity: 'Medium', technician: 'Eng. Farhan' },
  { id: 2, date: '2026-08-21', ticket_no: 'TKT-2608-02', equipment: 'Sizing Blocks & Guides', billet_breakdown_min: 0, rolling_breakdown_min: 90, breakdown_category: 'Roll Changing', root_cause_notes: 'Scheduled changeover to 16MM high-speed guide rolls', shift_code: 'B', action_taken: 'Replaced 12mm sizing blocks and aligned roll gap', severity: 'Minor', technician: 'Mill Supervisor Karim' },
  { id: 3, date: '2026-08-22', ticket_no: 'TKT-2608-03', equipment: 'Ladle Slide Gate Nozzle', billet_breakdown_min: 30, rolling_breakdown_min: 0, breakdown_category: 'Mechanical', root_cause_notes: 'Ladle slide-gate nozzle alignment check & hydraulic seal', shift_code: 'C', action_taken: 'Re-aligned cylinder guides and pressure-tested oil lines', severity: 'Critical', technician: 'Eng. Tareq' }
];

export default function DowntimeTrackerPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';

  const [data, setData] = useState<DowntimeRow[]>([]);
  const [customCols, setCustomCols] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortField, setSortField] = useState<keyof DowntimeRow>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'cards' | 'grid'>('cards');

  // Modal Incident Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    ticket_no: `TKT-2608-${Math.floor(100 + Math.random() * 900)}`,
    equipment: 'Induction Furnace Coil #1',
    breakdown_category: 'Mechanical',
    billet_breakdown_min: '0',
    rolling_breakdown_min: '0',
    shift_code: 'A',
    root_cause_notes: '',
    action_taken: '',
    severity: 'Medium' as 'Critical' | 'Medium' | 'Minor',
    technician: 'Eng. Maintenance Lead'
  });

  // Cell Editing
  const [editingCell, setEditingCell] = useState<{ id: number; field: string; isCustom: boolean } | null>(null);
  const [editValue, setEditValue] = useState('');

  // Custom Modal Dialog box
  const [dialog, setDialog] = useState<{
    type: 'confirm' | 'prompt';
    title: string;
    message: string;
    value?: string;
    onConfirm: (val?: string) => void;
  } | null>(null);

  const cellPadding = isCompact ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm';
  const categories = ['Mechanical', 'Electrical', 'Furnace Refractory', 'CCM Mold', 'Roll Changing', 'Hydraulics', 'Power Grid Failure', 'No Billet Stock', 'Others'];
  const shifts = ['A', 'B', 'C', 'General'];
  const equipmentOptions = [
    'Induction Furnace Coil #1',
    'Induction Furnace Coil #2',
    'CCM Mold Stirrer',
    'CCM Oscillation Motor',
    'Ladle Slide Gate Nozzle',
    'Reheating Furnace Pusher',
    'Roughing Mill Stand #1',
    'Intermediate Stand #4',
    'Sizing Blocks & Guides',
    'TMT Quenching Water Pump',
    'Flying Shear Machine',
    'Cooling Bed Rake System',
    'Overhead Magnet Crane #2'
  ];

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch {
        setData(initialDowntimeData);
      }
    } else {
      setData(initialDowntimeData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDowntimeData));
    }

    const storedCols = localStorage.getItem(`${STORAGE_KEY}_cols`);
    if (storedCols) {
      try { setCustomCols(JSON.parse(storedCols)); } catch {}
    }
  }, []);

  const saveToStorage = (updated: DowntimeRow[], cols = customCols) => {
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

  const handleSort = (field: keyof DowntimeRow) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleAddIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: DowntimeRow = {
      id: Date.now(),
      date: formData.date || new Date().toISOString().split('T')[0],
      ticket_no: formData.ticket_no || `TKT-2608-${Math.floor(100 + Math.random() * 900)}`,
      equipment: formData.equipment,
      billet_breakdown_min: Number(formData.billet_breakdown_min) || 0,
      rolling_breakdown_min: Number(formData.rolling_breakdown_min) || 0,
      breakdown_category: formData.breakdown_category,
      root_cause_notes: formData.root_cause_notes || 'Pending root cause investigation',
      shift_code: formData.shift_code || 'A',
      action_taken: formData.action_taken || 'Routine inspection completed',
      severity: formData.severity,
      technician: formData.technician,
      customValues: {}
    };

    saveToStorage([newEntry, ...data]);
    setIsModalOpen(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      ticket_no: `TKT-2608-${Math.floor(100 + Math.random() * 900)}`,
      equipment: 'Induction Furnace Coil #1',
      breakdown_category: 'Mechanical',
      billet_breakdown_min: '0',
      rolling_breakdown_min: '0',
      shift_code: 'A',
      root_cause_notes: '',
      action_taken: '',
      severity: 'Medium',
      technician: 'Eng. Maintenance Lead'
    });
  };

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

  const handleAddRow = () => {
    const nextNum = Math.floor(1000 + Math.random() * 9000);
    const newRow: DowntimeRow = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      ticket_no: `TKT-2608-${nextNum}`,
      equipment: 'General Mechanical Area',
      billet_breakdown_min: 0,
      rolling_breakdown_min: 0,
      breakdown_category: 'Mechanical',
      root_cause_notes: '',
      shift_code: 'A',
      action_taken: '',
      severity: 'Minor',
      technician: 'Duty Officer',
      customValues: {}
    };
    saveToStorage([...data, newRow]);
  };

  const handleDeleteRow = (id: number) => {
    setDialog({
      type: 'confirm',
      title: 'Confirm Delete',
      message: 'Are you sure you want to permanently delete this downtime record?',
      onConfirm: () => {
        saveToStorage(data.filter(r => r.id !== id));
      }
    });
  };

  const handleFillDown = (field: string, isCustom = false) => {
    if (data.length <= 1) return;
    const firstVal = isCustom 
      ? (data[0].customValues?.[field] || '') 
      : data[0][field as keyof DowntimeRow];

    const updated = data.map((row, idx) => {
      if (idx === 0) return row;
      if (isCustom) {
        return {
          ...row,
          customValues: { ...(row.customValues || {}), [field]: String(firstVal) }
        };
      } else {
        return { ...row, [field]: firstVal };
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
          if (field === 'billet_breakdown_min' || field === 'rolling_breakdown_min') {
            val = Number(evaluated);
            if (isNaN(val)) val = (row as any)[field] || 0;
          }
          return { ...row, [field]: val };
        }
      }
      return row;
    });

    saveToStorage(updated);
    setEditingCell(null);
  };

  const handleExportExcel = () => {
    const headers = ['Date', 'Ticket No', 'Equipment', 'Melt Shop (Min)', 'Rolling Mill (Min)', 'Category', 'Severity', 'Root Cause Notes', 'Shift', 'Action Taken', 'Technician', ...customCols];
    const rows = filteredData.map(r => [
      r.date, r.ticket_no, r.equipment, r.billet_breakdown_min, r.rolling_breakdown_min, r.breakdown_category, r.severity || 'Medium', r.root_cause_notes, r.shift_code, r.action_taken, r.technician || 'Plant Staff',
      ...(customCols.map(col => r.customValues?.[col] || ''))
    ]);
    exportToExcel(headers, rows, 'downtime_breakdown_ledger');
  };

  const filteredData = data
    .filter(row => {
      const matchesSearch = row.equipment.toLowerCase().includes(search.toLowerCase()) ||
                            row.ticket_no.toLowerCase().includes(search.toLowerCase()) ||
                            row.root_cause_notes.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter ? row.breakdown_category === categoryFilter : true;
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
          ? (Number(valA) || 0) - (Number(valB) || 0)
          : (Number(valB) || 0) - (Number(valA) || 0);
      }
    });

  // KPI calculations
  const totalBilletDown = filteredData.reduce((sum, r) => sum + (Number(r.billet_breakdown_min) || 0), 0);
  const totalRollingDown = filteredData.reduce((sum, r) => sum + (Number(r.rolling_breakdown_min) || 0), 0);
  const totalDowntimeMin = totalBilletDown + totalRollingDown;
  const criticalCount = filteredData.filter(r => r.severity === 'Critical').length;
  const avgMTTR = filteredData.length > 0 ? Math.round(totalDowntimeMin / filteredData.length) : 0;

  return (
    <div className="space-y-7 animate-fade-in text-slate-800 pb-16">
      
      {/* Custom Modal Dialog Box */}
      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 p-7 rounded-3xl shadow-2xl w-full max-w-md space-y-4 animate-scale-in">
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider font-mono border-b border-slate-100 pb-2">
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
                className="w-full bg-slate-50 border border-slate-200 text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#C5A059] font-sans"
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
            <div className="flex justify-end space-x-3 pt-3">
              <button 
                onClick={() => setDialog(null)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-xs font-semibold rounded-xl transition-all cursor-pointer bg-white"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  dialog.onConfirm(dialog.value);
                  setDialog(null);
                }}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLEAN ENTERPRISE HEADER BAR */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#B48F48] uppercase tracking-wider font-mono mb-1.5">
            <span>Steel Production</span>
            <span className="text-slate-300">/</span>
            <span>Plant Reliability</span>
            <span className="text-slate-300">/</span>
            <span className="bg-amber-100/70 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-mono text-[11px]">Maintenance & Reliability</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
            Downtime & Breakdown Incident Tracker
          </h1>
          <p className="text-sm text-slate-500 font-sans mt-0.5">
            Track factory outages, mechanical & electrical disruptions, roll-changing intervals, and mean-time-to-recovery (MTTR).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleExportExcel}
            className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl transition-all cursor-pointer shadow-2xs flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 md:flex-none px-5 py-2.5 bg-[#B48F48] hover:bg-[#9E7A37] text-white font-semibold text-sm rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Log Breakdown Ticket</span>
          </button>
        </div>
      </div>

      {/* 4 Mini-Dashboard Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Downtime */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between h-36">
          <div className="flex justify-between items-center text-xs font-semibold uppercase text-slate-500 font-mono">
            <span>Total Downtime</span>
            <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 text-[11px] font-bold">Total Stoppage</span>
          </div>
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl font-bold text-rose-600 font-mono tracking-tight">{totalDowntimeMin}</span>
              <span className="text-sm font-semibold text-slate-500 font-mono">Mins</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>{(totalDowntimeMin / 60).toFixed(1)} Total Hours</span>
              <span className="text-slate-700 font-semibold">{filteredData.length} Incident Logs</span>
            </div>
          </div>
        </div>

        {/* Card 2: Meltshop Breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between h-36">
          <div className="flex justify-between items-center text-xs font-semibold uppercase text-slate-500 font-mono">
            <span>Meltshop Outages</span>
            <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[11px] font-bold">Furnace / CCM</span>
          </div>
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl font-bold text-slate-900 font-mono tracking-tight">{totalBilletDown}</span>
              <span className="text-sm font-semibold text-slate-500 font-mono">Mins</span>
            </div>
            <p className="text-xs text-amber-700 font-mono mt-1 font-semibold">{totalDowntimeMin > 0 ? Math.round((totalBilletDown / totalDowntimeMin) * 100) : 0}% of total stoppage</p>
          </div>
        </div>

        {/* Card 3: Rolling Mill Breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between h-36">
          <div className="flex justify-between items-center text-xs font-semibold uppercase text-slate-500 font-mono">
            <span>Rolling Mill Outages</span>
            <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 text-[11px] font-bold">Stands & Rolls</span>
          </div>
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl font-bold text-slate-900 font-mono tracking-tight">{totalRollingDown}</span>
              <span className="text-sm font-semibold text-slate-500 font-mono">Mins</span>
            </div>
            <p className="text-xs text-indigo-700 font-mono mt-1 font-semibold">{totalDowntimeMin > 0 ? Math.round((totalRollingDown / totalDowntimeMin) * 100) : 0}% of total stoppage</p>
          </div>
        </div>

        {/* Card 4: Critical Tickets & MTTR */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between h-36">
          <div className="flex justify-between items-center text-xs font-semibold uppercase text-slate-500 font-mono">
            <span>Mean Time to Repair</span>
            <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 text-[11px] font-bold">MTTR</span>
          </div>
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl font-bold text-slate-900 font-mono tracking-tight">{avgMTTR}</span>
              <span className="text-sm font-semibold text-slate-500 font-mono">Mins</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>Critical Issues: {criticalCount}</span>
              <span className="text-emerald-600 font-semibold">100% Resolved</span>
            </div>
          </div>
        </div>

      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        
        {/* Search & Category Filter */}
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <input 
              type="text" 
              placeholder="Search by Ticket No, Equipment, or Root Cause Notes..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-sm pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-[#C5A059] focus:bg-white font-sans transition-all"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#C5A059] font-sans text-slate-700"
          >
            <option value="">All Breakdown Categories</option>
            {categories.map((c, idx) => <option key={idx} value={c}>{c}</option>)}
          </select>
        </div>

        {/* View Mode & Actions */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1 font-sans text-xs">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3.5 py-2 font-semibold rounded-lg transition-all ${viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Ticket Cards
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3.5 py-2 font-semibold rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Data Ledger
            </button>
          </div>

          <button 
            onClick={handleAddColumn}
            className="px-3.5 py-2 border border-[#C5A059] text-[#B48F48] hover:bg-[#FAF6EE] text-xs font-semibold rounded-xl transition-all cursor-pointer bg-white hidden sm:inline-flex items-center gap-1.5"
          >
            + Column
          </button>
          <button 
            onClick={handleAddRow}
            className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer bg-white"
          >
            + Row
          </button>
        </div>
      </div>

      {/* Main Content: Card View or Grid View */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredData.map((row) => (
            <div key={row.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-[#C5A059]/40 transition-all relative overflow-hidden group flex flex-col justify-between space-y-4">
              
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                        {row.ticket_no}
                      </span>
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-md font-mono ${
                        row.severity === 'Critical' ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                        row.severity === 'Minor' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                        'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}>
                        {row.severity || 'Medium'}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 font-sans mt-2">{row.equipment}</h4>
                    <p className="text-xs text-slate-400 font-sans">{row.date} • Shift {row.shift_code} • {row.breakdown_category}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteRow(row.id)}
                    className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                    title="Delete Entry"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Duration Meter */}
                <div className="mb-4 grid grid-cols-2 gap-2 bg-slate-50 border border-slate-200/70 rounded-xl p-3.5 font-mono">
                  <div>
                    <span className="text-xs uppercase text-slate-400 font-semibold block font-sans">Melt Shop Down</span>
                    <span className={`text-sm font-bold ${row.billet_breakdown_min > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                      {row.billet_breakdown_min} mins
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs uppercase text-slate-400 font-semibold block font-sans">Rolling Mill Down</span>
                    <span className={`text-sm font-bold ${row.rolling_breakdown_min > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>
                      {row.rolling_breakdown_min} mins
                    </span>
                  </div>
                </div>

                {/* Root Cause Note */}
                <div className="space-y-2.5 text-xs font-sans">
                  <div>
                    <span className="text-xs uppercase font-semibold text-slate-500 font-mono block">Root Cause Analysis</span>
                    <p className="text-slate-700 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 text-xs leading-relaxed">
                      {row.root_cause_notes || 'No root cause notes logged.'}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs uppercase font-semibold text-slate-500 font-mono block">Resolution Action</span>
                    <p className="text-emerald-900 bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100 text-xs leading-relaxed">
                      {row.action_taken || 'No action notes logged.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
                <span>By: {row.technician || 'Eng. Maintenance Lead'}</span>
                <span className="text-emerald-600 font-bold">✓ RESOLVED</span>
              </div>

            </div>
          ))}
        </div>
      ) : (
        /* Full-Screen Sheet Grid Table */
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1150px] table-fixed text-sm font-sans">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase font-mono text-slate-500 font-semibold select-none">
                  <th className={`w-14 text-center ${cellPadding}`}>Actions</th>
                  <th className={`w-32 ${cellPadding} cursor-pointer hover:bg-slate-100`} onClick={() => handleSort('date')}>
                    Date {sortField === 'date' && (sortDir === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className={`w-28 ${cellPadding}`}>
                    Ticket No <button onClick={() => handleFillDown('ticket_no')} title="Fill Down" className="text-xs ml-1 text-[#B48F48] hover:underline">⬇️</button>
                  </th>
                  <th className={`w-44 ${cellPadding}`}>
                    Equipment <button onClick={() => handleFillDown('equipment')} title="Fill Down" className="text-xs ml-1 text-[#B48F48] hover:underline">⬇️</button>
                  </th>
                  <th className={`w-36 ${cellPadding}`}>Category</th>
                  <th className={`w-52 ${cellPadding}`}>
                    Root Cause <button onClick={() => handleFillDown('root_cause_notes')} title="Fill Down" className="text-xs ml-1 text-[#B48F48] hover:underline">⬇️</button>
                  </th>
                  <th className={`w-20 ${cellPadding}`}>Shift</th>
                  <th className={`w-48 ${cellPadding}`}>
                    Action Taken <button onClick={() => handleFillDown('action_taken')} title="Fill Down" className="text-xs ml-1 text-[#B48F48] hover:underline">⬇️</button>
                  </th>
                  <th className={`w-28 ${cellPadding} text-right`}>
                    Melt Shop (Min) <button onClick={() => handleFillDown('billet_breakdown_min')} title="Fill Down" className="text-xs ml-1 text-[#B48F48] hover:underline">⬇️</button>
                  </th>
                  <th className={`w-28 ${cellPadding} text-right`}>
                    Rolling Mill (Min) <button onClick={() => handleFillDown('rolling_breakdown_min')} title="Fill Down" className="text-xs ml-1 text-[#B48F48] hover:underline">⬇️</button>
                  </th>

                  {/* Dynamic Columns */}
                  {customCols.map(col => (
                    <th key={col} className={`w-32 ${cellPadding} text-slate-600 bg-amber-50/30`}>
                      {col} <button onClick={() => handleFillDown(col, true)} title="Fill Down" className="text-xs ml-1 text-[#B48F48] hover:underline">⬇️</button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs">
                {filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/40 transition-colors h-11">
                    
                    <td className="text-center py-1">
                      <button 
                        onClick={() => handleDeleteRow(row.id)}
                        className="text-red-500 hover:text-red-700 font-bold text-xs p-1"
                      >
                        ✕
                      </button>
                    </td>

                    {/* Date */}
                    <td className={cellPadding}>
                      <div className="relative w-full h-8 flex items-center">
                        {editingCell?.id === row.id && editingCell?.field === 'date' ? (
                          <input 
                            type="date" 
                            value={editValue} 
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => saveInlineEdit(row.id, 'date')}
                            onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'date')}
                            className="absolute inset-0 w-full h-full bg-slate-50 border border-[#C5A059] rounded-lg px-2 focus:outline-none font-sans text-xs z-10" 
                            autoFocus 
                          />
                        ) : (
                          <span className="w-full h-8 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block select-none text-slate-700" onClick={() => startEdit(row.id, 'date', row.date)}>{row.date}</span>
                        )}
                      </div>
                    </td>

                    {/* Ticket No */}
                    <td className={cellPadding}>
                      <div className="relative w-full h-8 flex items-center">
                        {editingCell?.id === row.id && editingCell?.field === 'ticket_no' ? (
                          <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'ticket_no')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'ticket_no')} className="absolute inset-0 w-full h-full bg-slate-50 border border-[#C5A059] rounded-lg px-2 focus:outline-none font-sans text-xs z-10 font-bold" autoFocus />
                        ) : (
                          <span className="w-full h-8 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block select-none font-bold text-slate-900" onClick={() => startEdit(row.id, 'ticket_no', row.ticket_no)}>{row.ticket_no}</span>
                        )}
                      </div>
                    </td>

                    {/* Equipment */}
                    <td className={cellPadding}>
                      <div className="relative w-full h-8 flex items-center">
                        {editingCell?.id === row.id && editingCell?.field === 'equipment' ? (
                          <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'equipment')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'equipment')} className="absolute inset-0 w-full h-full bg-slate-50 border border-[#C5A059] rounded-lg px-2 focus:outline-none font-sans text-xs z-10" autoFocus />
                        ) : (
                          <span className="w-full h-8 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block select-none truncate font-semibold font-sans text-slate-900" onClick={() => startEdit(row.id, 'equipment', row.equipment)}>{row.equipment}</span>
                        )}
                      </div>
                    </td>

                    {/* Category Select */}
                    <td className={cellPadding}>
                      <select
                        value={row.breakdown_category}
                        onChange={(e) => {
                          const updated = data.map(r => r.id === row.id ? { ...r, breakdown_category: e.target.value } : r);
                          saveToStorage(updated);
                        }}
                        className="w-full bg-transparent border-0 focus:outline-none py-1 text-xs font-sans font-semibold text-indigo-700 truncate"
                      >
                        {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
                      </select>
                    </td>

                    {/* Root Cause Notes */}
                    <td className={cellPadding}>
                      <div className="relative w-full h-8 flex items-center">
                        {editingCell?.id === row.id && editingCell?.field === 'root_cause_notes' ? (
                          <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'root_cause_notes')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'root_cause_notes')} className="absolute inset-0 w-full h-full bg-slate-50 border border-[#C5A059] rounded-lg px-2 focus:outline-none font-sans text-xs z-10" autoFocus />
                        ) : (
                          <span className="w-full h-8 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block truncate select-none text-slate-600 font-sans" title={row.root_cause_notes} onClick={() => startEdit(row.id, 'root_cause_notes', row.root_cause_notes)}>{row.root_cause_notes || 'Add root cause'}</span>
                        )}
                      </div>
                    </td>

                    {/* Shift Code select */}
                    <td className={cellPadding}>
                      <select
                        value={row.shift_code}
                        onChange={(e) => {
                          const updated = data.map(r => r.id === row.id ? { ...r, shift_code: e.target.value } : r);
                          saveToStorage(updated);
                        }}
                        className="w-full bg-transparent border-0 focus:outline-none py-1 text-xs font-sans text-slate-700 truncate font-semibold"
                      >
                        {shifts.map((s, i) => <option key={i} value={s}>{s}</option>)}
                      </select>
                    </td>

                    {/* Action Taken */}
                    <td className={cellPadding}>
                      <div className="relative w-full h-8 flex items-center">
                        {editingCell?.id === row.id && editingCell?.field === 'action_taken' ? (
                          <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'action_taken')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'action_taken')} className="absolute inset-0 w-full h-full bg-slate-50 border border-[#C5A059] rounded-lg px-2 focus:outline-none font-sans text-xs z-10" autoFocus />
                        ) : (
                          <span className="w-full h-8 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block truncate select-none text-emerald-700 font-sans font-medium" title={row.action_taken} onClick={() => startEdit(row.id, 'action_taken', row.action_taken)}>{row.action_taken || 'Add action taken'}</span>
                        )}
                      </div>
                    </td>

                    {/* Billet Breakdown Min */}
                    <td className={cellPadding}>
                      <div className="relative w-full h-8 flex items-center justify-end text-right">
                        {editingCell?.id === row.id && editingCell?.field === 'billet_breakdown_min' ? (
                          <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'billet_breakdown_min')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'billet_breakdown_min')} className="absolute inset-0 w-full h-full text-right bg-slate-50 border border-[#C5A059] rounded-lg px-2 focus:outline-none font-sans text-xs z-10 text-amber-600 font-bold" autoFocus />
                        ) : (
                          <span className="w-full h-8 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block select-none text-amber-600 font-bold" onClick={() => startEdit(row.id, 'billet_breakdown_min', row.billet_breakdown_min)}>{row.billet_breakdown_min} min</span>
                        )}
                      </div>
                    </td>

                    {/* Rolling Breakdown Min */}
                    <td className={cellPadding}>
                      <div className="relative w-full h-8 flex items-center justify-end text-right">
                        {editingCell?.id === row.id && editingCell?.field === 'rolling_breakdown_min' ? (
                          <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'rolling_breakdown_min')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'rolling_breakdown_min')} className="absolute inset-0 w-full h-full text-right bg-slate-50 border border-[#C5A059] rounded-lg px-2 focus:outline-none font-sans text-xs z-10 text-indigo-600 font-bold" autoFocus />
                        ) : (
                          <span className="w-full h-8 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block select-none text-indigo-600 font-bold" onClick={() => startEdit(row.id, 'rolling_breakdown_min', row.rolling_breakdown_min)}>{row.rolling_breakdown_min} min</span>
                        )}
                      </div>
                    </td>

                    {/* Dynamic Columns */}
                    {customCols.map(col => (
                      <td key={col} className={`${cellPadding} bg-amber-50/10`}>
                        <div className="relative w-full h-8 flex items-center">
                          {editingCell?.id === row.id && editingCell?.field === col && editingCell?.isCustom ? (
                            <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, col, true)} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, col, true)} className="absolute inset-0 w-full h-full bg-slate-50 border border-[#C5A059] rounded-lg px-2 focus:outline-none font-sans text-xs z-10" autoFocus />
                          ) : (
                            <span className="w-full h-8 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block min-h-[1.2rem] select-none" onClick={() => startEdit(row.id, col, row.customValues?.[col] || '', true)}>{row.customValues?.[col] || ''}</span>
                          )}
                        </div>
                      </td>
                    ))}

                  </tr>
                ))}
              </tbody>

              {/* Summary Footer */}
              <tfoot>
                <tr className="bg-slate-50 font-semibold border-t-2 border-slate-200 text-xs">
                  <td className={cellPadding} colSpan={8}>Totals</td>
                  <td className={`${cellPadding} text-right font-bold text-amber-600`}>{totalBilletDown} mins</td>
                  <td className={`${cellPadding} text-right font-bold text-indigo-600`}>{totalRollingDown} mins</td>
                  <td colSpan={customCols.length}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Modern Log Breakdown Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200/90 overflow-hidden animate-zoom-in my-8">
            
            {/* Modal Header */}
            <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-sans">Log Breakdown & Maintenance Ticket</h3>
                <p className="text-xs text-slate-500 mt-0.5">Record machinery shutdown, outage duration, root cause diagnosis & repairs</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddIncidentSubmit} className="p-7 space-y-4 text-xs font-sans">
              
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 font-mono">Date</label>
                  <input 
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-sans text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 font-mono">Ticket No</label>
                  <input 
                    type="text"
                    required
                    value={formData.ticket_no}
                    onChange={(e) => setFormData({ ...formData, ticket_no: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 font-mono">Shift</label>
                  <select
                    value={formData.shift_code}
                    onChange={(e) => setFormData({ ...formData, shift_code: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-sans text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059]"
                  >
                    <option value="A">Shift A (Morning)</option>
                    <option value="B">Shift B (Evening)</option>
                    <option value="C">Shift C (Night)</option>
                    <option value="General">General Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 font-mono">Equipment / Asset</label>
                  <select
                    value={formData.equipment}
                    onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-sans text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059]"
                  >
                    {equipmentOptions.map((eq, idx) => <option key={idx} value={eq}>{eq}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 font-mono">Breakdown Category</label>
                  <select
                    value={formData.breakdown_category}
                    onChange={(e) => setFormData({ ...formData, breakdown_category: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-indigo-700 font-sans focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059]"
                  >
                    {categories.map((c, idx) => <option key={idx} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 font-mono">Melt Shop (Min)</label>
                  <input 
                    type="number"
                    placeholder="0"
                    value={formData.billet_breakdown_min}
                    onChange={(e) => setFormData({ ...formData, billet_breakdown_min: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 font-mono">Rolling Mill (Min)</label>
                  <input 
                    type="number"
                    placeholder="0"
                    value={formData.rolling_breakdown_min}
                    onChange={(e) => setFormData({ ...formData, rolling_breakdown_min: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 font-mono">Severity</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold font-sans text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059]"
                  >
                    <option value="Minor">Minor (Routine/Quick)</option>
                    <option value="Medium">Medium (Line Pause)</option>
                    <option value="Critical">Critical (Shutdown)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 font-mono">Root Cause Diagnosis</label>
                <textarea 
                  rows={2}
                  placeholder="Describe failure symptom, sensor error code, or mechanical jam..."
                  value={formData.root_cause_notes}
                  onChange={(e) => setFormData({ ...formData, root_cause_notes: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-sans text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 font-mono">Action Taken / Resolution</label>
                <textarea 
                  rows={2}
                  placeholder="Action taken to restore line (part replaced, recalibration, roll alignment)..."
                  value={formData.action_taken}
                  onChange={(e) => setFormData({ ...formData, action_taken: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-sans text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059]"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#B48F48] hover:bg-[#9E7A37] text-white font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Submit & Log Ticket
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
