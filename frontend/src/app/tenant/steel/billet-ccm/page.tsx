'use client';
import { exportToExcel } from '@/lib/excelExport';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface BilletRow {
  id: number;
  date: string;
  furnace_no: string;
  heat_no: string;
  billet_size_section: string;
  steel_tapped_input_kg: number;
  billet_output_kg: number;
  scull_loss_kg: number;
  billet_yield_pct: number;
  billet_stock_kg: number;
  casting_speed?: number; // m/min
  tundish_temp?: number; // °C
  strand_count?: number;
  quality_grade?: string;
  customValues?: Record<string, string>;
}

const STORAGE_KEY = 'steel_erp_billet';

const initialBilletData: BilletRow[] = [
  { id: 1, date: '2026-08-20', furnace_no: 'Furnace 01', heat_no: 'H-260820A', billet_size_section: '100x100mm x 6m', steel_tapped_input_kg: 10800, billet_output_kg: 10500, scull_loss_kg: 300, billet_yield_pct: 97.22, billet_stock_kg: 50000, casting_speed: 1.85, tundish_temp: 1535, strand_count: 2, quality_grade: 'Prime 500W' },
  { id: 2, date: '2026-08-21', furnace_no: 'Furnace 01', heat_no: 'H-260821A', billet_size_section: '130x130mm x 6m', steel_tapped_input_kg: 11440, billet_output_kg: 11100, scull_loss_kg: 340, billet_yield_pct: 97.03, billet_stock_kg: 61100, casting_speed: 1.70, tundish_temp: 1540, strand_count: 2, quality_grade: 'Prime 550D' },
  { id: 3, date: '2026-08-22', furnace_no: 'Furnace 02', heat_no: 'H-260822A', billet_size_section: '100x100mm x 6m', steel_tapped_input_kg: 10465, billet_output_kg: 10200, scull_loss_kg: 265, billet_yield_pct: 97.47, billet_stock_kg: 71300, casting_speed: 1.90, tundish_temp: 1530, strand_count: 2, quality_grade: 'Prime 500W' }
];

export default function BilletCCMPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';

  const [data, setData] = useState<BilletRow[]>([]);
  const [customCols, setCustomCols] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [sortField, setSortField] = useState<keyof BilletRow>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'cards' | 'grid'>('cards');

  // Modal Cast Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    furnace_no: 'Furnace 01',
    heat_no: '',
    billet_size_section: '100x100mm x 6m',
    steel_tapped_input_kg: '',
    billet_output_kg: '',
    scull_loss_kg: '',
    casting_speed: '1.85',
    tundish_temp: '1535',
    strand_count: '2',
    quality_grade: 'Prime 500W',
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
  const sizes = ['100x100mm x 6m', '125x125mm x 6m', '130x130mm x 6m', '150x150mm x 6m'];

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch {
        setData(initialBilletData);
      }
    } else {
      setData(initialBilletData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialBilletData));
    }

    const storedCols = localStorage.getItem(`${STORAGE_KEY}_cols`);
    if (storedCols) {
      try { setCustomCols(JSON.parse(storedCols)); } catch {}
    }
  }, []);

  const saveToStorage = (updated: BilletRow[], cols = customCols) => {
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

  const handleSort = (field: keyof BilletRow) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  // Helper to lookup furnace log details automatically based on heat_no
  const lookupFurnaceLog = (heatNo: string) => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('steel_erp_furnace');
      if (stored) {
        try {
          const furnaceData = JSON.parse(stored);
          const found = furnaceData.find((f: any) => (f.heat_no || '').toLowerCase().trim() === heatNo.toLowerCase().trim());
          if (found) {
            return {
              furnace_no: found.furnace_no,
              steel_tapped_input_kg: Number(found.liquid_steel_tapped_kg)
            };
          }
        } catch {}
      }
    }
    return null;
  };

  const handleHeatNoChange = (heat: string) => {
    setFormData(prev => {
      const updated = { ...prev, heat_no: heat };
      const lookup = lookupFurnaceLog(heat);
      if (lookup) {
        updated.furnace_no = lookup.furnace_no;
        updated.steel_tapped_input_kg = String(lookup.steel_tapped_input_kg);
        const estOutput = Math.round(lookup.steel_tapped_input_kg * 0.972);
        updated.billet_output_kg = String(estOutput);
        updated.scull_loss_kg = String(lookup.steel_tapped_input_kg - estOutput);
      }
      return updated;
    });
  };

  const handleAddCastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inputKg = Number(formData.steel_tapped_input_kg) || 0;
    const outputKg = Number(formData.billet_output_kg) || 0;
    const scullKg = Number(formData.scull_loss_kg) || Math.max(0, inputKg - outputKg);
    const yieldPct = inputKg > 0 ? parseFloat(((outputKg / inputKg) * 100).toFixed(2)) : 0;
    const prevStock = data.length > 0 ? data[data.length - 1].billet_stock_kg : 50000;

    const newEntry: BilletRow = {
      id: Date.now(),
      date: formData.date || new Date().toISOString().split('T')[0],
      furnace_no: formData.furnace_no || 'Furnace 01',
      heat_no: formData.heat_no || `H-2608${String.fromCharCode(65 + (data.length % 26))}A`,
      billet_size_section: formData.billet_size_section,
      steel_tapped_input_kg: inputKg,
      billet_output_kg: outputKg,
      scull_loss_kg: scullKg,
      billet_yield_pct: yieldPct,
      billet_stock_kg: prevStock + outputKg,
      casting_speed: Number(formData.casting_speed) || 1.85,
      tundish_temp: Number(formData.tundish_temp) || 1535,
      strand_count: Number(formData.strand_count) || 2,
      quality_grade: formData.quality_grade || 'Prime 500W',
      customValues: {}
    };

    saveToStorage([newEntry, ...data]);
    setIsModalOpen(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      furnace_no: 'Furnace 01',
      heat_no: '',
      billet_size_section: '100x100mm x 6m',
      steel_tapped_input_kg: '',
      billet_output_kg: '',
      scull_loss_kg: '',
      casting_speed: '1.85',
      tundish_temp: '1535',
      strand_count: '2',
      quality_grade: 'Prime 500W',
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
    const prevStock = data.length > 0 ? data[data.length - 1].billet_stock_kg : 40000;
    const newRow: BilletRow = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      furnace_no: 'Furnace 01',
      heat_no: 'H-2608' + String.fromCharCode(65 + (data.length % 26)) + 'A',
      billet_size_section: '100x100mm x 6m',
      steel_tapped_input_kg: 0,
      billet_output_kg: 0,
      scull_loss_kg: 0,
      billet_yield_pct: 0,
      billet_stock_kg: prevStock,
      casting_speed: 1.85,
      tundish_temp: 1535,
      strand_count: 2,
      quality_grade: 'Prime 500W',
      customValues: {}
    };
    saveToStorage([...data, newRow]);
  };

  const handleDeleteRow = (id: number) => {
    setDialog({
      type: 'confirm',
      title: 'Confirm Delete',
      message: 'Are you sure you want to permanently delete this billet CCM casting record?',
      onConfirm: () => {
        saveToStorage(data.filter(r => r.id !== id));
      }
    });
  };

  const handleFillDown = (field: string, isCustom = false) => {
    if (data.length <= 1) return;
    const firstVal = isCustom 
      ? (data[0].customValues?.[field] || '') 
      : data[0][field as keyof BilletRow];

    const updated = data.map((row, idx) => {
      if (idx === 0) return row;
      if (isCustom) {
        return {
          ...row,
          customValues: { ...(row.customValues || {}), [field]: String(firstVal) }
        };
      } else {
        const baseRow = { ...row, [field]: firstVal };
        if (field === 'heat_no') {
          const resolved = lookupFurnaceLog(String(firstVal));
          if (resolved) {
            baseRow.furnace_no = resolved.furnace_no;
            baseRow.steel_tapped_input_kg = resolved.steel_tapped_input_kg;
          }
        }
        const input = Number(baseRow.steel_tapped_input_kg);
        const output = Number(baseRow.billet_output_kg);
        baseRow.scull_loss_kg = Math.max(0, input - output);
        baseRow.billet_yield_pct = input > 0 ? parseFloat(((output / input) * 100).toFixed(2)) : 0;
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
          if (['steel_tapped_input_kg', 'billet_output_kg', 'scull_loss_kg', 'billet_yield_pct', 'billet_stock_kg', 'casting_speed', 'tundish_temp', 'strand_count'].includes(field)) {
            val = Number(evaluated);
            if (isNaN(val)) val = (row as any)[field] || 0;
          }
          const baseRow = { ...row, [field]: val };
          if (field === 'heat_no') {
            const resolved = lookupFurnaceLog(String(evaluated));
            if (resolved) {
              baseRow.furnace_no = resolved.furnace_no;
              baseRow.steel_tapped_input_kg = resolved.steel_tapped_input_kg;
            }
          }
          const input = Number(baseRow.steel_tapped_input_kg);
          const output = Number(baseRow.billet_output_kg);
          baseRow.scull_loss_kg = Math.max(0, input - output);
          baseRow.billet_yield_pct = input > 0 ? parseFloat(((output / input) * 100).toFixed(2)) : 0;
          return baseRow;
        }
      }
      return row;
    });

    saveToStorage(updated);
    setEditingCell(null);
  };

  const handleExportExcel = () => {
    const headers = ['Date', 'Furnace No', 'Heat No', 'Billet Size', 'Steel Input (KG)', 'Billet Output (KG)', 'Scull Loss (KG)', 'Billet Yield (%)', 'Stock (KG)', 'Casting Speed (m/min)', 'Tundish Temp (°C)', 'Grade', ...customCols];
    const rows = filteredData.map(r => [
      r.date, r.furnace_no, r.heat_no, r.billet_size_section, r.steel_tapped_input_kg, r.billet_output_kg, r.scull_loss_kg, r.billet_yield_pct, r.billet_stock_kg, r.casting_speed || 1.85, r.tundish_temp || 1535, r.quality_grade || 'Prime 500W',
      ...(customCols.map(col => r.customValues?.[col] || ''))
    ]);
    exportToExcel(headers, rows, 'ccm_billet_ledger');
  };

  const filteredData = data
    .filter(row => {
      const matchesSearch = row.heat_no.toLowerCase().includes(search.toLowerCase()) || (row.quality_grade || '').toLowerCase().includes(search.toLowerCase());
      const matchesSize = sizeFilter ? row.billet_size_section === sizeFilter : true;
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

  // KPIs
  const totalInputKg = filteredData.reduce((sum, r) => sum + (Number(r.steel_tapped_input_kg) || 0), 0);
  const totalOutputKg = filteredData.reduce((sum, r) => sum + (Number(r.billet_output_kg) || 0), 0);
  const totalScullKg = filteredData.reduce((sum, r) => sum + (Number(r.scull_loss_kg) || 0), 0);
  const avgYield = totalInputKg > 0 ? parseFloat(((totalOutputKg / totalInputKg) * 100).toFixed(2)) : 0;
  const latestStockKg = filteredData.length > 0 ? filteredData[0].billet_stock_kg : 0;

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
                placeholder="Type column header..."
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

      {/* Modern Hero Banner with Image & Diagnostics */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity transform scale-105 transition-transform duration-1000"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent" />
        
        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider font-mono">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Continuous Casting Machine • 2-Strand Billet CCM
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white font-sans">
              Billet CCM Casting Operations
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-sans leading-relaxed">
              Real-time monitoring of liquid steel casting into square billets, mold lubrication parameters, tundish superheats, cropping scull loss, and automated mill feed inventory.
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
              Log Cast Heat
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

        {/* Status Bar */}
        <div className="relative z-10 bg-slate-950/60 border-t border-white/10 px-6 py-3 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> CCM Strand #1 & #2: ACTIVE (1.85 m/min)
            </span>
            <span className="text-slate-400 hidden sm:inline">|</span>
            <span className="text-amber-400">Tundish Superheat: +32°C (Optimal)</span>
            <span className="text-slate-400 hidden sm:inline">|</span>
            <span className="text-slate-300">Mold Level Control: Auto-Radiometric</span>
          </div>
          <div className="text-slate-400">
            Last Heat Cast: <span className="text-white font-bold">{data[0]?.heat_no || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* 4 Mini-Dashboard Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Billets Produced */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Billet Cast Total</p>
            <span className="p-2 rounded-xl bg-amber-50 text-[#B48F48]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 font-mono">
              {(totalOutputKg / 1000).toFixed(2)} <span className="text-sm font-semibold text-slate-500">MT</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>Charged: {(totalInputKg / 1000).toFixed(2)} MT</span>
              <span className="text-emerald-600 font-bold">{filteredData.length} Heats Cast</span>
            </div>
          </div>
        </div>

        {/* Card 2: Casting Yield */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">CCM Casting Yield</p>
            <span className={`p-2 rounded-xl ${avgYield >= 97 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 font-mono">
              {avgYield}%
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>Benchmark: 97.0%</span>
              <span className={avgYield >= 97 ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                {avgYield >= 97 ? '✓ Above Target' : '⚠ Below Target'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Scull & Cropping Loss */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Scull & Crop Loss</p>
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-600 font-mono">
              {(totalScullKg / 1000).toFixed(2)} <span className="text-sm font-semibold text-slate-500">MT</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>Loss Rate: {totalInputKg > 0 ? ((totalScullKg / totalInputKg) * 100).toFixed(2) : 0}%</span>
              <span className="text-slate-400">Recycled to Scrap</span>
            </div>
          </div>
        </div>

        {/* Card 4: Billet Yard Buffer */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Running Billet Stock</p>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 font-mono">
              {(latestStockKg / 1000).toFixed(1)} <span className="text-sm font-semibold text-slate-500">MT</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>Rolling Buffer: Ready</span>
              <span className="text-emerald-600 font-bold">● High Capacity</span>
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
              placeholder="Search by Heat No or Grade (e.g. H-260820A, Prime 500W)..." 
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
            <option value="">All Billet Sizes</option>
            {sizes.map((s, idx) => <option key={idx} value={s}>{s}</option>)}
          </select>
        </div>

        {/* View Toggle & Actions */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Cast Cards
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
                    <span className="font-mono text-base font-black text-slate-900">{row.heat_no}</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-50 text-[#B48F48] border border-amber-200/60 font-mono">
                      {row.furnace_no}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans mt-0.5">{row.date} • {row.quality_grade || 'Prime 500W'}</p>
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

              {/* Billet Size Badge */}
              <div className="mb-4 bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">Section Size</span>
                  <span className="text-xs font-black text-slate-800">{row.billet_size_section}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">Tundish Superheat</span>
                  <span className="text-xs font-bold text-amber-600 font-mono">{row.tundish_temp || 1535}°C</span>
                </div>
              </div>

              {/* Flow Weights */}
              <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 font-mono text-center">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Tapped In</span>
                  <p className="text-xs font-bold text-slate-700 mt-0.5">{(row.steel_tapped_input_kg / 1000).toFixed(2)} MT</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Billet Out</span>
                  <p className="text-xs font-bold text-emerald-600 mt-0.5">{(row.billet_output_kg / 1000).toFixed(2)} MT</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Scull Loss</span>
                  <p className="text-xs font-bold text-rose-500 mt-0.5">{row.scull_loss_kg} kg</p>
                </div>
              </div>

              {/* Yield Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-500">Casting Yield</span>
                  <span className="font-bold text-emerald-600">{row.billet_yield_pct}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#C5A059] to-emerald-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, row.billet_yield_pct)}%` }}
                  />
                </div>
              </div>

              {/* Footer info */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Speed: {row.casting_speed || 1.85} m/min</span>
                <span>Stock: <strong className="text-slate-800 font-bold">{(row.billet_stock_kg / 1000).toFixed(1)} MT</strong></span>
              </div>

            </div>
          ))}
        </div>
      ) : (
        /* Full-Screen Sheet Grid Table */
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1150px] table-fixed">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-150 text-[10px] uppercase font-mono text-slate-400 select-none">
                  <th className={`w-14 text-center ${cellPadding}`}>Actions</th>
                  <th className={`w-32 ${cellPadding} cursor-pointer hover:bg-slate-100`} onClick={() => handleSort('date')}>
                    Date {sortField === 'date' && (sortDir === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className={`w-32 ${cellPadding}`}>
                    Furnace <button onClick={() => handleFillDown('furnace_no')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                  </th>
                  <th className={`w-36 ${cellPadding} cursor-pointer hover:bg-slate-100`} onClick={() => handleSort('heat_no')}>
                    Heat No <button onClick={() => handleFillDown('heat_no')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                  </th>
                  <th className={`w-40 ${cellPadding}`}>Billet Size</th>
                  <th className={`w-32 ${cellPadding} text-right`}>
                    Input (KG) <button onClick={() => handleFillDown('steel_tapped_input_kg')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                  </th>
                  <th className={`w-32 ${cellPadding} text-right`}>
                    Output (KG) <button onClick={() => handleFillDown('billet_output_kg')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                  </th>
                  <th className={`w-28 ${cellPadding} text-right text-rose-500`}>Scull (KG)</th>
                  <th className={`w-24 ${cellPadding} text-right`}>Yield %</th>
                  <th className={`w-28 ${cellPadding} text-right`}>Tundish °C</th>
                  <th className={`w-36 ${cellPadding} text-right`}>
                    Stock (KG) <button onClick={() => handleFillDown('billet_stock_kg')} title="Fill Down" className="text-[10px] ml-1 text-[#B48F48] hover:underline">⬇️</button>
                  </th>

                  {/* Dynamic Columns */}
                  {customCols.map(col => (
                    <th key={col} className={`w-32 ${cellPadding} text-slate-600 bg-amber-50/30`}>
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
                        className="text-red-500 hover:text-red-700 font-bold text-xs"
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

                    {/* Furnace No */}
                    <td className={cellPadding}>
                      <div className="relative w-full h-7 flex items-center">
                        {editingCell?.id === row.id && editingCell?.field === 'furnace_no' ? (
                          <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'furnace_no')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'furnace_no')} className="absolute inset-0 w-full h-full bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10" autoFocus />
                        ) : (
                          <span className="w-full h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block select-none" onClick={() => startEdit(row.id, 'furnace_no', row.furnace_no)}>{row.furnace_no}</span>
                        )}
                      </div>
                    </td>

                    {/* Heat No */}
                    <td className={cellPadding}>
                      <div className="relative w-full h-7 flex items-center">
                        {editingCell?.id === row.id && editingCell?.field === 'heat_no' ? (
                          <input 
                            type="text" 
                            value={editValue} 
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => saveInlineEdit(row.id, 'heat_no')} 
                            onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'heat_no')} 
                            className="absolute inset-0 w-full h-full bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10 font-bold" 
                            autoFocus 
                          />
                        ) : (
                          <span className="w-full h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block font-bold text-slate-900 select-none" onClick={() => startEdit(row.id, 'heat_no', row.heat_no)}>{row.heat_no}</span>
                        )}
                      </div>
                    </td>

                    {/* Billet Size Select */}
                    <td className={cellPadding}>
                      <select
                        value={row.billet_size_section}
                        onChange={(e) => {
                          const updated = data.map(r => r.id === row.id ? { ...r, billet_size_section: e.target.value } : r);
                          saveToStorage(updated);
                        }}
                        className="w-full bg-transparent border-0 focus:outline-none py-0.5 text-xs font-sans truncate font-medium text-slate-700"
                      >
                        {sizes.map((s, i) => <option key={i} value={s}>{s}</option>)}
                      </select>
                    </td>

                    {/* Steel Input */}
                    <td className={cellPadding}>
                      <div className="relative w-full h-7 flex items-center justify-end text-right">
                        {editingCell?.id === row.id && editingCell?.field === 'steel_tapped_input_kg' ? (
                          <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'steel_tapped_input_kg')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'steel_tapped_input_kg')} className="absolute inset-0 w-full h-full text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10" autoFocus />
                        ) : (
                          <span className="w-full h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block select-none" onClick={() => startEdit(row.id, 'steel_tapped_input_kg', row.steel_tapped_input_kg)}>{row.steel_tapped_input_kg.toLocaleString()}</span>
                        )}
                      </div>
                    </td>

                    {/* Production Output */}
                    <td className={cellPadding}>
                      <div className="relative w-full h-7 flex items-center justify-end text-right">
                        {editingCell?.id === row.id && editingCell?.field === 'billet_output_kg' ? (
                          <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'billet_output_kg')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'billet_output_kg')} className="absolute inset-0 w-full h-full text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10" autoFocus />
                        ) : (
                          <span className="w-full h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block text-[#B48F48] select-none font-semibold" onClick={() => startEdit(row.id, 'billet_output_kg', row.billet_output_kg)}>{row.billet_output_kg.toLocaleString()}</span>
                        )}
                      </div>
                    </td>

                    {/* Scull Loss */}
                    <td className={`${cellPadding} text-right text-rose-600 font-bold bg-rose-50/20`}>
                      <span className="h-7 flex items-center justify-end px-1 select-none">{row.scull_loss_kg.toLocaleString()}</span>
                    </td>

                    {/* Yield */}
                    <td className={`${cellPadding} text-right font-black text-emerald-600`}>
                      <span className="h-7 flex items-center justify-end px-1 select-none">{row.billet_yield_pct}%</span>
                    </td>

                    {/* Tundish Temp */}
                    <td className={cellPadding}>
                      <div className="relative w-full h-7 flex items-center justify-end text-right">
                        {editingCell?.id === row.id && editingCell?.field === 'tundish_temp' ? (
                          <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'tundish_temp')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'tundish_temp')} className="absolute inset-0 w-full h-full text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10" autoFocus />
                        ) : (
                          <span className="w-full h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block select-none text-amber-600 font-bold" onClick={() => startEdit(row.id, 'tundish_temp', row.tundish_temp || 1535)}>{row.tundish_temp || 1535}°C</span>
                        )}
                      </div>
                    </td>

                    {/* Running Stock */}
                    <td className={cellPadding}>
                      <div className="relative w-full h-7 flex items-center justify-end text-right">
                        {editingCell?.id === row.id && editingCell?.field === 'billet_stock_kg' ? (
                          <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'billet_stock_kg')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'billet_stock_kg')} className="absolute inset-0 w-full h-full text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10 font-black text-emerald-600" autoFocus />
                        ) : (
                          <span className="w-full h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block select-none font-black text-emerald-600" onClick={() => startEdit(row.id, 'billet_stock_kg', row.billet_stock_kg)}>{row.billet_stock_kg.toLocaleString()}</span>
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

              {/* Summary Footer */}
              <tfoot>
                <tr className="bg-slate-50 font-semibold border-t-2 border-slate-200 text-xs">
                  <td className={cellPadding} colSpan={5}>Totals & Averages</td>
                  <td className={`${cellPadding} text-right font-bold`}>{totalInputKg.toLocaleString()} kg</td>
                  <td className={`${cellPadding} text-right font-bold text-emerald-600`}>{totalOutputKg.toLocaleString()} kg</td>
                  <td className={`${cellPadding} text-right font-bold text-rose-600 bg-rose-50/20`}>{totalScullKg.toLocaleString()} kg</td>
                  <td className={`${cellPadding} text-right font-black text-emerald-600`}>{avgYield}%</td>
                  <td className={`${cellPadding} text-right text-slate-400`}>-</td>
                  <td className={`${cellPadding} text-right font-black text-emerald-600`}>{latestStockKg.toLocaleString()} kg</td>
                  <td colSpan={customCols.length}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Modern Log Cast Heat Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-scale-in">
            
            {/* Modal Header */}
            <div className="bg-slate-900 px-6 py-5 text-white flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold">Log CCM Heat Casting Run</h3>
                <p className="text-xs text-slate-300 mt-0.5">Record continuous casting parameters, billet length tonnage & losses</p>
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
            <form onSubmit={handleAddCastSubmit} className="p-6 space-y-4">
              
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
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">Furnace Unit</label>
                  <select
                    value={formData.furnace_no}
                    onChange={(e) => setFormData({ ...formData, furnace_no: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                  >
                    <option value="Furnace 01">Furnace 01 (15 Ton IF)</option>
                    <option value="Furnace 02">Furnace 02 (15 Ton IF)</option>
                    <option value="Furnace 03">Furnace 03 (25 Ton EAF)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">
                    Heat No <span className="text-[#B48F48] text-[10px] font-normal lowercase">(auto lookup)</span>
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. H-260820A"
                    value={formData.heat_no}
                    onChange={(e) => handleHeatNoChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">Billet Section</label>
                  <select
                    value={formData.billet_size_section}
                    onChange={(e) => setFormData({ ...formData, billet_size_section: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                  >
                    {sizes.map((s, idx) => <option key={idx} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">Steel Input (KG)</label>
                  <input 
                    type="number"
                    required
                    placeholder="10800"
                    value={formData.steel_tapped_input_kg}
                    onChange={(e) => {
                      const input = Number(e.target.value);
                      const out = Number(formData.billet_output_kg);
                      setFormData({ 
                        ...formData, 
                        steel_tapped_input_kg: e.target.value,
                        scull_loss_kg: input && out ? String(Math.max(0, input - out)) : formData.scull_loss_kg 
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">Billet Out (KG)</label>
                  <input 
                    type="number"
                    required
                    placeholder="10500"
                    value={formData.billet_output_kg}
                    onChange={(e) => {
                      const out = Number(e.target.value);
                      const input = Number(formData.steel_tapped_input_kg);
                      setFormData({ 
                        ...formData, 
                        billet_output_kg: e.target.value,
                        scull_loss_kg: input && out ? String(Math.max(0, input - out)) : formData.scull_loss_kg
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">Scull Loss (KG)</label>
                  <input 
                    type="number"
                    placeholder="300"
                    value={formData.scull_loss_kg}
                    onChange={(e) => setFormData({ ...formData, scull_loss_kg: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">Cast Speed (m/min)</label>
                  <input 
                    type="number"
                    step="0.05"
                    value={formData.casting_speed}
                    onChange={(e) => setFormData({ ...formData, casting_speed: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">Tundish Temp (°C)</label>
                  <input 
                    type="number"
                    value={formData.tundish_temp}
                    onChange={(e) => setFormData({ ...formData, tundish_temp: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">Quality Grade</label>
                  <select
                    value={formData.quality_grade}
                    onChange={(e) => setFormData({ ...formData, quality_grade: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                  >
                    <option value="Prime 500W">Prime 500W</option>
                    <option value="Prime 550D">Prime 550D</option>
                    <option value="Commercial 400">Commercial 400</option>
                  </select>
                </div>
              </div>

              {/* Real-time Computed Summary */}
              {Number(formData.steel_tapped_input_kg) > 0 && Number(formData.billet_output_kg) > 0 && (
                <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-500 block">Computed Casting Yield:</span>
                    <strong className="text-base font-black text-[#B48F48] font-mono">
                      {((Number(formData.billet_output_kg) / Number(formData.steel_tapped_input_kg)) * 100).toFixed(2)}%
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block">Est. Scull Residue:</span>
                    <strong className="text-sm font-bold text-rose-600 font-mono">
                      {Math.max(0, Number(formData.steel_tapped_input_kg) - Number(formData.billet_output_kg))} KG
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
                  Submit & Log Casting
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
