'use client';
import { exportToExcel } from '@/lib/excelExport';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface RollingRow {
  id: number;
  date: string;
  billet_input_kg: number;
  rod_size: string;
  rod_production_kg: number;
  rod_loss_kg: number;
  rod_yield_pct: number;
  rod_stock_kg: number;
  grade?: string;
  finishing_speed?: number; // m/s
  cooling_temp?: number; // °C
  bundle_count?: number;
  shift?: string;
  customValues?: Record<string, string>;
}

const STORAGE_KEY = 'steel_erp_rolling';

const initialRollingData: RollingRow[] = [
  { id: 1, date: '2026-08-20', billet_input_kg: 10000, rod_size: '12MM', rod_production_kg: 9600, rod_loss_kg: 400, rod_yield_pct: 96.0, rod_stock_kg: 145000, grade: 'Grade 500W (TMT)', finishing_speed: 16.5, cooling_temp: 620, bundle_count: 48, shift: 'A' },
  { id: 2, date: '2026-08-21', billet_input_kg: 11000, rod_size: '16MM', rod_production_kg: 10580, rod_loss_kg: 420, rod_yield_pct: 96.18, rod_stock_kg: 155580, grade: 'Grade 550D (High Ductility)', finishing_speed: 14.0, cooling_temp: 640, bundle_count: 53, shift: 'B' },
  { id: 3, date: '2026-08-22', billet_input_kg: 10000, rod_size: '20MM', rod_production_kg: 9550, rod_loss_kg: 450, rod_yield_pct: 95.5, rod_stock_kg: 165130, grade: 'Grade 500W (TMT)', finishing_speed: 12.0, cooling_temp: 650, bundle_count: 38, shift: 'A' }
];

export default function RollingMillPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';

  const [data, setData] = useState<RollingRow[]>([]);
  const [customCols, setCustomCols] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [sortField, setSortField] = useState<keyof RollingRow>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'cards' | 'grid'>('cards');

  // Modal Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    billet_input_kg: '',
    rod_size: '12MM',
    rod_production_kg: '',
    rod_loss_kg: '',
    grade: 'Grade 500W (TMT)',
    finishing_speed: '16.5',
    cooling_temp: '630',
    bundle_count: '',
    shift: 'A'
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

  const cellPadding = isCompact ? 'px-3 py-1 text-[11px]' : 'px-4 py-2 text-xs';
  const sizes = ['8MM', '10MM', '12MM', '16MM', '20MM', '22MM', '25MM', '32MM'];
  const grades = ['Grade 500W (TMT)', 'Grade 550D (High Ductility)', 'Grade 400 (Commercial)', 'MS Wire Rod'];

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch {
        setData(initialRollingData);
      }
    } else {
      setData(initialRollingData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialRollingData));
    }

    const storedCols = localStorage.getItem(`${STORAGE_KEY}_cols`);
    if (storedCols) {
      try { setCustomCols(JSON.parse(storedCols)); } catch {}
    }
  }, []);

  const saveToStorage = (updated: RollingRow[], cols = customCols) => {
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

  const handleSort = (field: keyof RollingRow) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleAddRollingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inputKg = Number(formData.billet_input_kg) || 0;
    const outputKg = Number(formData.rod_production_kg) || 0;
    const lossKg = Number(formData.rod_loss_kg) || Math.max(0, inputKg - outputKg);
    const yieldPct = inputKg > 0 ? parseFloat(((outputKg / inputKg) * 100).toFixed(2)) : 0;
    const prevStock = data.length > 0 ? data[data.length - 1].rod_stock_kg : 140000;

    const newEntry: RollingRow = {
      id: Date.now(),
      date: formData.date || new Date().toISOString().split('T')[0],
      billet_input_kg: inputKg,
      rod_size: formData.rod_size,
      rod_production_kg: outputKg,
      rod_loss_kg: lossKg,
      rod_yield_pct: yieldPct,
      rod_stock_kg: prevStock + outputKg,
      grade: formData.grade,
      finishing_speed: Number(formData.finishing_speed) || 16.5,
      cooling_temp: Number(formData.cooling_temp) || 630,
      bundle_count: Number(formData.bundle_count) || Math.round(outputKg / 200),
      shift: formData.shift || 'A',
      customValues: {}
    };

    saveToStorage([newEntry, ...data]);
    setIsModalOpen(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      billet_input_kg: '',
      rod_size: '12MM',
      rod_production_kg: '',
      rod_loss_kg: '',
      grade: 'Grade 500W (TMT)',
      finishing_speed: '16.5',
      cooling_temp: '630',
      bundle_count: '',
      shift: 'A'
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
    const prevStock = data.length > 0 ? data[data.length - 1].rod_stock_kg : 120000;
    const newRow: RollingRow = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      billet_input_kg: 0,
      rod_size: '12MM',
      rod_production_kg: 0,
      rod_loss_kg: 0,
      rod_yield_pct: 0,
      rod_stock_kg: prevStock,
      grade: 'Grade 500W (TMT)',
      finishing_speed: 16.5,
      cooling_temp: 630,
      bundle_count: 0,
      shift: 'A',
      customValues: {}
    };
    saveToStorage([...data, newRow]);
  };

  const handleDeleteRow = (id: number) => {
    setDialog({
      type: 'confirm',
      title: 'Confirm Delete',
      message: 'Are you sure you want to permanently delete this rolling mill production record?',
      onConfirm: () => {
        saveToStorage(data.filter(r => r.id !== id));
      }
    });
  };

  const handleFillDown = (field: string, isCustom = false) => {
    if (data.length <= 1) return;
    const firstVal = isCustom 
      ? (data[0].customValues?.[field] || '') 
      : data[0][field as keyof RollingRow];

    const updated = data.map((row, idx) => {
      if (idx === 0) return row;
      if (isCustom) {
        return {
          ...row,
          customValues: { ...(row.customValues || {}), [field]: String(firstVal) }
        };
      } else {
        const baseRow = { ...row, [field]: firstVal };
        const input = Number(baseRow.billet_input_kg);
        const output = Number(baseRow.rod_production_kg);
        baseRow.rod_loss_kg = Math.max(0, input - output);
        baseRow.rod_yield_pct = input > 0 ? parseFloat(((output / input) * 100).toFixed(2)) : 0;
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
          if (['billet_input_kg', 'rod_production_kg', 'rod_loss_kg', 'rod_yield_pct', 'rod_stock_kg', 'finishing_speed', 'cooling_temp', 'bundle_count'].includes(field)) {
            val = Number(evaluated);
            if (isNaN(val)) val = (row as any)[field] || 0;
          }
          const baseRow = { ...row, [field]: val };
          const input = Number(baseRow.billet_input_kg);
          const output = Number(baseRow.rod_production_kg);
          baseRow.rod_loss_kg = Math.max(0, input - output);
          baseRow.rod_yield_pct = input > 0 ? parseFloat(((output / input) * 100).toFixed(2)) : 0;
          return baseRow;
        }
      }
      return row;
    });

    saveToStorage(updated);
    setEditingCell(null);
  };

  const handleExportExcel = () => {
    const headers = ['Date', 'Billet Input Charged (KG)', 'Rebar Size', 'Grade', 'Production Output (KG)', 'Shear/Scale Loss (KG)', 'Rolling Yield %', 'Finished Rod Stock (KG)', 'Speed (m/s)', 'Cooling Temp (°C)', 'Bundles', ...customCols];
    const rows = filteredData.map(r => [
      r.date, r.billet_input_kg, r.rod_size, r.grade || 'Grade 500W (TMT)', r.rod_production_kg, r.rod_loss_kg, r.rod_yield_pct, r.rod_stock_kg, r.finishing_speed || 16.5, r.cooling_temp || 630, r.bundle_count || 0,
      ...(customCols.map(col => r.customValues?.[col] || ''))
    ]);
    exportToExcel(headers, rows, 'rolling_mill_ledger');
  };

  const filteredData = data
    .filter(row => {
      const matchesSearch = row.rod_size.toLowerCase().includes(search.toLowerCase()) || 
                            (row.grade || '').toLowerCase().includes(search.toLowerCase());
      const matchesSize = sizeFilter ? row.rod_size === sizeFilter : true;
      return matchesSearch && matchesSize;
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

  // KPI Calculations
  const totalBilletCharged = filteredData.reduce((sum, r) => sum + (Number(r.billet_input_kg) || 0), 0);
  const totalProduction = filteredData.reduce((sum, r) => sum + (Number(r.rod_production_kg) || 0), 0);
  const totalScaleLoss = filteredData.reduce((sum, r) => sum + (Number(r.rod_loss_kg) || 0), 0);
  const avgRollingYield = totalBilletCharged > 0 ? parseFloat(((totalProduction / totalBilletCharged) * 100).toFixed(2)) : 0;
  const currentWarehouseStock = filteredData.length > 0 ? filteredData[0].rod_stock_kg : 0;

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      
      {/* Dialog */}
      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xl w-full max-w-md space-y-4 animate-scale-in">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-mono border-b border-slate-100 pb-2">
              {dialog.title}
            </h3>
            <p className="text-xs text-slate-600 font-sans leading-relaxed">
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

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity transform scale-105 transition-transform duration-1000"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent" />
        
        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider font-mono">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Hot Bar & Rebar Rolling Mill • High-Speed Finishing Line
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white font-sans">
              Rolling Mill Production & Rebar Finishing
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-sans leading-relaxed">
              Track billet reheating furnace charging, high-speed thermo-mechanical treatment (TMT), rebar dimension sizing (8MM-32MM), shearing & burning scale losses, and finished product bundling.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-[#C5A059] to-[#B48F48] hover:from-[#B48F48] hover:to-[#9E7A37] text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-900/30 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Log Rolling Run
            </button>
            <button 
              onClick={handleExportExcel}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-xl backdrop-blur-xs transition-all cursor-pointer flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        {/* Live Mill Telemetry Strip */}
        <div className="relative z-10 bg-slate-950/60 border-t border-white/10 px-6 py-3 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Finishing Block: 16.5 m/s (NOMINAL)
            </span>
            <span className="text-slate-400 hidden sm:inline">|</span>
            <span className="text-amber-400">Quenching Water: 18.2 Bar (TMT ACTIVE)</span>
            <span className="text-slate-400 hidden sm:inline">|</span>
            <span className="text-slate-300">Cooling Bed Exit: 620°C</span>
          </div>
          <div className="text-slate-400">
            Current Section: <span className="text-amber-300 font-bold">{data[0]?.rod_size || '12MM'} ({data[0]?.grade || '500W'})</span>
          </div>
        </div>
      </div>

      {/* 4 Mini-Dashboard Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Rolled Finished Production */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Rolled Production</p>
            <span className="p-2 rounded-xl bg-amber-50 text-[#B48F48]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 font-mono">
              {(totalProduction / 1000).toFixed(2)} <span className="text-sm font-semibold text-slate-500">MT</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>Billet Charged: {(totalBilletCharged / 1000).toFixed(2)} MT</span>
              <span className="text-emerald-600 font-bold">{filteredData.length} Batches</span>
            </div>
          </div>
        </div>

        {/* Card 2: Rolling Yield % */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Rolling Yield %</p>
            <span className={`p-2 rounded-xl ${avgRollingYield >= 96 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 font-mono">
              {avgRollingYield}%
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>Target Standard: 95.8%</span>
              <span className={avgRollingYield >= 96 ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                {avgRollingYield >= 96 ? '✓ Optimal Efficiency' : '⚠ Action Required'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Shearing & Scale Loss */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Scale & Shear Loss</p>
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-600 font-mono">
              {(totalScaleLoss / 1000).toFixed(2)} <span className="text-sm font-semibold text-slate-500">MT</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>Loss Rate: {totalBilletCharged > 0 ? ((totalScaleLoss / totalBilletCharged) * 100).toFixed(2) : 0}%</span>
              <span className="text-slate-400">Scale Pit Captured</span>
            </div>
          </div>
        </div>

        {/* Card 4: Finished Goods Warehouse Stock */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Finished Rod Stock</p>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 font-mono">
              {(currentWarehouseStock / 1000).toFixed(1)} <span className="text-sm font-semibold text-slate-500">MT</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>Dispatch Ready</span>
              <span className="text-emerald-600 font-bold">● High Inventory</span>
            </div>
          </div>
        </div>

      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        
        {/* Search & Size Filter */}
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <input 
              type="text" 
              placeholder="Search by Rebar Size or Grade (e.g. 12MM, 500W, 550D)..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs pl-9 pr-3 py-2.5 rounded-xl focus:outline-none focus:border-[#C5A059] font-sans"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <select 
            value={sizeFilter}
            onChange={(e) => setSizeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#C5A059] font-medium text-slate-700"
          >
            <option value="">All Finished Sizes</option>
            {sizes.map((s, idx) => <option key={idx} value={s}>{s}</option>)}
          </select>
        </div>

        {/* View Mode & Actions */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Batch Cards
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Data Ledger
            </button>
          </div>

          <button 
            onClick={handleAddColumn}
            className="px-3 py-2 border border-[#C5A059] text-[#B48F48] hover:bg-[#FAF6EE] text-xs font-bold rounded-xl transition-all cursor-pointer bg-white hidden sm:inline-flex items-center gap-1.5"
          >
            + Column
          </button>
          <button 
            onClick={handleAddRow}
            className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer bg-white"
          >
            + Row
          </button>
        </div>
      </div>

      {/* Main Content: Card View or Grid View */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredData.map((row) => (
            <div key={row.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
              
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-amber-500 text-slate-950 font-mono">
                      {row.rod_size}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {row.grade || 'Grade 500W (TMT)'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans mt-1">{row.date} • Shift {row.shift || 'A'}</p>
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

              {/* Rolling Stand Speed & Bundles Banner */}
              <div className="mb-4 bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">Finishing Speed</span>
                  <span className="text-xs font-black text-slate-800 font-mono">{row.finishing_speed || 16.5} m/s</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">Finished Bundles</span>
                  <span className="text-xs font-bold text-emerald-600 font-mono">{row.bundle_count || Math.round(row.rod_production_kg / 200)} Bundles</span>
                </div>
              </div>

              {/* Flow Weights */}
              <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 font-mono text-center">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Billet In</span>
                  <p className="text-xs font-bold text-slate-700 mt-0.5">{(row.billet_input_kg / 1000).toFixed(2)} MT</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Rebar Out</span>
                  <p className="text-xs font-bold text-emerald-600 mt-0.5">{(row.rod_production_kg / 1000).toFixed(2)} MT</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Scale Loss</span>
                  <p className="text-xs font-bold text-rose-500 mt-0.5">{row.rod_loss_kg} kg</p>
                </div>
              </div>

              {/* Yield Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-500">Rolling Yield</span>
                  <span className="font-bold text-emerald-600">{row.rod_yield_pct}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#C5A059] to-emerald-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, row.rod_yield_pct)}%` }}
                  />
                </div>
              </div>

              {/* Footer info */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Cooling Exit: {row.cooling_temp || 630}°C</span>
                <span>Stock: <strong className="text-slate-800 font-bold">{(row.rod_stock_kg / 1000).toFixed(1)} MT</strong></span>
              </div>

            </div>
          ))}
        </div>
      ) : (
        /* Full-Screen Sheet Grid Table */
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1100px] table-fixed">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-150 text-[10px] uppercase font-mono text-slate-400 select-none">
                  <th className={`w-14 text-center ${cellPadding}`}>Actions</th>
                  <th className={`w-32 ${cellPadding} cursor-pointer hover:bg-slate-100`} onClick={() => handleSort('date')}>
                    Date {sortField === 'date' && (sortDir === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className={`w-36 ${cellPadding} text-right`}>
                    Billet Input (KG) <button onClick={() => handleFillDown('billet_input_kg')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                  </th>
                  <th className={`w-32 ${cellPadding}`}>Rebar Size</th>
                  <th className={`w-44 ${cellPadding}`}>Grade</th>
                  <th className={`w-36 ${cellPadding} text-right`}>
                    Production (KG) <button onClick={() => handleFillDown('rod_production_kg')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                  </th>
                  <th className={`w-32 ${cellPadding} text-right text-rose-500`}>Scale Loss (KG)</th>
                  <th className={`w-28 ${cellPadding} text-right`}>Yield %</th>
                  <th className={`w-40 ${cellPadding} text-right`}>
                    Stock (KG) <button onClick={() => handleFillDown('rod_stock_kg')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                  </th>

                  {/* Dynamic Columns */}
                  {customCols.map(col => (
                    <th key={col} className={`w-32 ${cellPadding} text-slate-650 bg-amber-50/30`}>
                      {col} <button onClick={() => handleFillDown(col, true)} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs">
                {filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/40 transition-colors h-10">
                    
                    <td className="text-center py-1">
                      <button 
                        onClick={() => handleDeleteRow(row.id)}
                        className="text-red-500 hover:text-red-750 font-bold text-xs"
                      >
                        ✕
                      </button>
                    </td>

                    {/* Date */}
                    <td className={cellPadding}>
                      <div className="relative w-full h-7 flex items-center">
                        {editingCell?.id === row.id && editingCell?.field === 'date' ? (
                          <input 
                            type="date" 
                            value={editValue} 
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => saveInlineEdit(row.id, 'date')}
                            onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'date')}
                            className="absolute inset-0 w-full h-full bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10" 
                            autoFocus 
                          />
                        ) : (
                          <span className="w-full h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block select-none" onClick={() => startEdit(row.id, 'date', row.date)}>{row.date}</span>
                        )}
                      </div>
                    </td>

                    {/* Billet Input */}
                    <td className={cellPadding}>
                      <div className="relative w-full h-7 flex items-center justify-end text-right">
                        {editingCell?.id === row.id && editingCell?.field === 'billet_input_kg' ? (
                          <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'billet_input_kg')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'billet_input_kg')} className="absolute inset-0 w-full h-full text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10" autoFocus />
                        ) : (
                          <span className="w-full h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block select-none" onClick={() => startEdit(row.id, 'billet_input_kg', row.billet_input_kg)}>{row.billet_input_kg.toLocaleString()}</span>
                        )}
                      </div>
                    </td>

                    {/* Finished Size Select */}
                    <td className={cellPadding}>
                      <select
                        value={row.rod_size}
                        onChange={(e) => {
                          const updated = data.map(r => r.id === row.id ? { ...r, rod_size: e.target.value } : r);
                          saveToStorage(updated);
                        }}
                        className="w-full bg-transparent border-0 focus:outline-none py-0.5 text-xs font-sans text-amber-700 font-bold truncate"
                      >
                        {sizes.map((s, i) => <option key={i} value={s}>{s}</option>)}
                      </select>
                    </td>

                    {/* Grade Select */}
                    <td className={cellPadding}>
                      <select
                        value={row.grade || 'Grade 500W (TMT)'}
                        onChange={(e) => {
                          const updated = data.map(r => r.id === row.id ? { ...r, grade: e.target.value } : r);
                          saveToStorage(updated);
                        }}
                        className="w-full bg-transparent border-0 focus:outline-none py-0.5 text-xs font-sans text-slate-700 truncate"
                      >
                        {grades.map((g, i) => <option key={i} value={g}>{g}</option>)}
                      </select>
                    </td>

                    {/* Production Output */}
                    <td className={cellPadding}>
                      <div className="relative w-full h-7 flex items-center justify-end text-right">
                        {editingCell?.id === row.id && editingCell?.field === 'rod_production_kg' ? (
                          <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'rod_production_kg')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'rod_production_kg')} className="absolute inset-0 w-full h-full text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10" autoFocus />
                        ) : (
                          <span className="w-full h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block text-emerald-650 select-none font-semibold" onClick={() => startEdit(row.id, 'rod_production_kg', row.rod_production_kg)}>{row.rod_production_kg.toLocaleString()}</span>
                        )}
                      </div>
                    </td>

                    {/* Shearing Loss */}
                    <td className={`${cellPadding} text-right text-rose-600 font-bold bg-rose-50/20`}>
                      <span className="h-7 flex items-center justify-end px-1 select-none">{row.rod_loss_kg.toLocaleString()}</span>
                    </td>

                    {/* Yield Pct */}
                    <td className={`${cellPadding} text-right font-black text-emerald-600`}>
                      <span className="h-7 flex items-center justify-end px-1 select-none">{row.rod_yield_pct}%</span>
                    </td>

                    {/* Finished Stock */}
                    <td className={cellPadding}>
                      <div className="relative w-full h-7 flex items-center justify-end text-right">
                        {editingCell?.id === row.id && editingCell?.field === 'rod_stock_kg' ? (
                          <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'rod_stock_kg')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'rod_stock_kg')} className="absolute inset-0 w-full h-full text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10 font-black text-emerald-600" autoFocus />
                        ) : (
                          <span className="w-full h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block select-none font-black text-emerald-600" onClick={() => startEdit(row.id, 'rod_stock_kg', row.rod_stock_kg)}>{row.rod_stock_kg.toLocaleString()}</span>
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

              {/* Table Summary Footer */}
              <tfoot>
                <tr className="bg-slate-50 font-semibold border-t-2 border-slate-200 text-xs">
                  <td className={cellPadding} colSpan={2}>Totals & Averages</td>
                  <td className={`${cellPadding} text-right font-bold`}>{totalBilletCharged.toLocaleString()} kg</td>
                  <td colSpan={2}></td>
                  <td className={`${cellPadding} text-right font-bold text-emerald-600`}>{totalProduction.toLocaleString()} kg</td>
                  <td className={`${cellPadding} text-right font-bold text-rose-600 bg-rose-50/20`}>{totalScaleLoss.toLocaleString()} kg</td>
                  <td className={`${cellPadding} text-right font-black text-emerald-600`}>{avgRollingYield}%</td>
                  <td className={`${cellPadding} text-right font-black text-emerald-600`}>{currentWarehouseStock.toLocaleString()} kg</td>
                  <td colSpan={customCols.length}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Modern Log Rolling Run Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-scale-in">
            
            {/* Modal Header */}
            <div className="bg-slate-900 px-6 py-5 text-white flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold">Log Rolling Mill Production Run</h3>
                <p className="text-xs text-slate-300 mt-0.5">Record rebar rolling size, billet charged kg, production kg & shearing scale loss</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddRollingSubmit} className="p-6 space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">Date</label>
                  <input 
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">Shift</label>
                  <select
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                  >
                    <option value="A">Shift A (Morning 06:00 - 14:00)</option>
                    <option value="B">Shift B (Evening 14:00 - 22:00)</option>
                    <option value="C">Shift C (Night 22:00 - 06:00)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">Rebar Finished Size</label>
                  <select
                    value={formData.rod_size}
                    onChange={(e) => setFormData({ ...formData, rod_size: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-amber-700 focus:outline-none focus:border-[#C5A059]"
                  >
                    {sizes.map((s, idx) => <option key={idx} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">Steel Grade</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                  >
                    {grades.map((g, idx) => <option key={idx} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">Billet Input (KG)</label>
                  <input 
                    type="number"
                    required
                    placeholder="10000"
                    value={formData.billet_input_kg}
                    onChange={(e) => {
                      const input = Number(e.target.value);
                      const out = Number(formData.rod_production_kg);
                      setFormData({ 
                        ...formData, 
                        billet_input_kg: e.target.value,
                        rod_loss_kg: input && out ? String(Math.max(0, input - out)) : formData.rod_loss_kg 
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">Rebar Out (KG)</label>
                  <input 
                    type="number"
                    required
                    placeholder="9600"
                    value={formData.rod_production_kg}
                    onChange={(e) => {
                      const out = Number(e.target.value);
                      const input = Number(formData.billet_input_kg);
                      setFormData({ 
                        ...formData, 
                        rod_production_kg: e.target.value,
                        rod_loss_kg: input && out ? String(Math.max(0, input - out)) : formData.rod_loss_kg,
                        bundle_count: out ? String(Math.round(out / 200)) : formData.bundle_count
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">Scale Loss (KG)</label>
                  <input 
                    type="number"
                    placeholder="400"
                    value={formData.rod_loss_kg}
                    onChange={(e) => setFormData({ ...formData, rod_loss_kg: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">Mill Speed (m/s)</label>
                  <input 
                    type="number"
                    step="0.5"
                    value={formData.finishing_speed}
                    onChange={(e) => setFormData({ ...formData, finishing_speed: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">Cooling Exit (°C)</label>
                  <input 
                    type="number"
                    value={formData.cooling_temp}
                    onChange={(e) => setFormData({ ...formData, cooling_temp: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">Bundles Produced</label>
                  <input 
                    type="number"
                    placeholder="48"
                    value={formData.bundle_count}
                    onChange={(e) => setFormData({ ...formData, bundle_count: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              {/* Dynamic summary indicator */}
              {Number(formData.billet_input_kg) > 0 && Number(formData.rod_production_kg) > 0 && (
                <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-500 block">Computed Rolling Yield:</span>
                    <strong className="text-base font-black text-[#B48F48] font-mono">
                      {((Number(formData.rod_production_kg) / Number(formData.billet_input_kg)) * 100).toFixed(2)}%
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block">Burning & Scale Loss:</span>
                    <strong className="text-sm font-bold text-rose-600 font-mono">
                      {Math.max(0, Number(formData.billet_input_kg) - Number(formData.rod_production_kg))} KG
                    </strong>
                  </div>
                </div>
              )}

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-[#C5A059] to-[#B48F48] hover:from-[#B48F48] hover:to-[#9E7A37] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Submit & Log Rolling Run
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
