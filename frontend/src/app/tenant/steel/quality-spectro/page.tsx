'use client';
import { exportToExcel } from '@/lib/excelExport';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface QualityRow {
  id: number;
  sample_id: string;
  rod_size: string;
  grade: string;
  heat_no: string;
  testing_date: string;
  pct_c: number;
  pct_mn: number;
  pct_si: number;
  pct_s: number;
  pct_p: number;
  pct_ce: number;
  yield_strength_n_mm2: number;
  customValues?: Record<string, string>;
  tensile_strength_n_mm2: number;
  elongation_pct: number;
  bend_test_result: 'Approved' | 'Failed';
  nominal_mass_g_m: number;
}

const STORAGE_KEY = 'steel_erp_quality';

const initialQualityData: QualityRow[] = [
  { id: 1, sample_id: 'SPL-20A', rod_size: '12MM', grade: '500W', heat_no: 'H-260820A', testing_date: '2026-08-20', pct_c: 0.22, pct_mn: 0.85, pct_si: 0.24, pct_s: 0.035, pct_p: 0.038, pct_ce: 0.36, yield_strength_n_mm2: 520, tensile_strength_n_mm2: 635, elongation_pct: 18, bend_test_result: 'Approved', nominal_mass_g_m: 0.888 },
  { id: 2, sample_id: 'SPL-21A', rod_size: '16MM', grade: '500W', heat_no: 'H-260821A', testing_date: '2026-08-21', pct_c: 0.24, pct_mn: 0.90, pct_si: 0.26, pct_s: 0.040, pct_p: 0.042, pct_ce: 0.39, yield_strength_n_mm2: 535, tensile_strength_n_mm2: 650, elongation_pct: 17, bend_test_result: 'Approved', nominal_mass_g_m: 1.580 },
  { id: 3, sample_id: 'SPL-22A', rod_size: '20MM', grade: '500W', heat_no: 'H-260822A', testing_date: '2026-08-22', pct_c: 0.21, pct_mn: 0.82, pct_si: 0.22, pct_s: 0.030, pct_p: 0.032, pct_ce: 0.35, yield_strength_n_mm2: 512, tensile_strength_n_mm2: 622, elongation_pct: 19, bend_test_result: 'Approved', nominal_mass_g_m: 2.470 }
];

export default function QualitySpectroPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';

  const [data, setData] = useState<QualityRow[]>([]);
  const [customCols, setCustomCols] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [sortField, setSortField] = useState<keyof QualityRow>('sample_id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

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

  const cellPadding = isCompact ? 'px-3 py-1 text-[11px]' : 'px-4 py-1.5 text-xs';
  const sizes = ['8MM', '10MM', '12MM', '16MM', '20MM', '22MM', '25MM', '32MM'];
  const grades = ['400W', '500W', '500CR', '550D', '600D'];
  const bendStatuses = ['Approved', 'Failed'];

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch {
        setData(initialQualityData);
      }
    } else {
      setData(initialQualityData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialQualityData));
    }

    const storedCols = localStorage.getItem(`${STORAGE_KEY}_cols`);
    if (storedCols) {
      try { setCustomCols(JSON.parse(storedCols)); } catch {}
    }
  }, []);

  const saveToStorage = (updated: QualityRow[], cols = customCols) => {
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
          return parseFloat(result.toFixed(3));
        }
      } catch {}
    }
    return val;
  };

  const handleSort = (field: keyof QualityRow) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  // Add Dynamic Column via Custom Modal Dialog
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
    const nextNum = Math.floor(10 + Math.random() * 90);
    const newRow: QualityRow = {
      id: Date.now(),
      sample_id: `SPL-2608-${nextNum}A`,
      rod_size: '12MM',
      grade: '500W',
      heat_no: `H-2608${nextNum}A`,
      testing_date: new Date().toISOString().split('T')[0],
      pct_c: 0.22,
      pct_mn: 0.85,
      pct_si: 0.24,
      pct_s: 0.035,
      pct_p: 0.038,
      pct_ce: 0.36,
      yield_strength_n_mm2: 520,
      tensile_strength_n_mm2: 630,
      elongation_pct: 18,
      bend_test_result: 'Approved',
      nominal_mass_g_m: 0.888,
      customValues: {}
    };
    saveToStorage([...data, newRow]);
  };

  // Delete Row via Custom Modal Confirm Dialog
  const handleDeleteRow = (id: number) => {
    setDialog({
      type: 'confirm',
      title: 'Confirm Delete',
      message: 'Are you sure you want to permanently delete this QA spectrometer record?',
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
      : data[0][field as keyof QualityRow];

    const updated = data.map((row, idx) => {
      if (idx === 0) return row;
      if (isCustom) {
        return {
          ...row,
          customValues: { ...(row.customValues || {}), [field]: String(firstVal) }
        };
      } else {
        const baseRow = { ...row, [field]: firstVal };
        const c = Number(baseRow.pct_c);
        const mn = Number(baseRow.pct_mn);
        baseRow.pct_ce = parseFloat((c + mn / 6).toFixed(3));
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
          if (['pct_c', 'pct_mn', 'pct_si', 'pct_s', 'pct_p', 'pct_ce', 'yield_strength_n_mm2', 'tensile_strength_n_mm2', 'elongation_pct', 'nominal_mass_g_m'].includes(field)) {
            val = Number(evaluated);
            if (isNaN(val)) val = row[field as keyof QualityRow] || 0;
          }
          const baseRow = { ...row, [field]: val };
          const c = Number(baseRow.pct_c);
          const mn = Number(baseRow.pct_mn);
          baseRow.pct_ce = parseFloat((c + mn / 6).toFixed(3));
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
    const headers = ['Sample ID', 'Rod Size', 'Grade', 'Heat No', 'Testing Date', '%C', '%Mn', '%Si', '%S', '%P', '%CE', 'Yield Str (N/mm2)', 'Tensile Str (N/mm2)', 'Elongation %', 'Bend Test', 'Nominal Mass (kg/m)', ...customHeaders];
    
    const rows = filteredData.map(r => [
      r.sample_id, r.rod_size, r.grade, r.heat_no, r.testing_date, r.pct_c, r.pct_mn, r.pct_si, r.pct_s, r.pct_p, r.pct_ce, r.yield_strength_n_mm2, r.tensile_strength_n_mm2, r.elongation_pct, r.bend_test_result, r.nominal_mass_g_m,
      ...(customCols.map(col => r.customValues?.[col] || ''))
    ]);
    exportToExcel(headers, rows, 'quality_assurance_spectro');
  };

  const filteredData = data
    .filter(row => {
      const matchesSearch = row.sample_id.toLowerCase().includes(search.toLowerCase()) ||
                            row.heat_no.toLowerCase().includes(search.toLowerCase());
      const matchesGrade = gradeFilter ? row.grade === gradeFilter : true;
      return matchesSearch && matchesGrade;
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
            <span>Quality Assurance & Lab</span>
            <span>•</span>
            <span>OES Spectrometer & UTM Testing</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">Spectrometer Chemistry & QA Testing</h1>
          <p className="text-sm text-slate-500 font-sans mt-0.5">Chemical composition analysis (%C, %Mn, %Si, %S, %P, %CE) and mechanical strength certifications (BDS ISO 6935-2 / ASTM A615).</p>
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
            <span>+ Log Lab Sample</span>
          </button>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Samples Tested</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-amber-50 text-amber-700 border border-amber-200">24h Shift</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono tracking-tight text-slate-900">{data.length}</span>
            <span className="text-xs text-slate-400 font-mono">Spectro Samples</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Avg Carbon Eq (%CE)</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">≤ 0.42% Spec</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono tracking-tight text-slate-900">
              {data.length > 0 ? (data.reduce((acc, r) => acc + (Number(r.pct_ce) || 0), 0) / data.length).toFixed(2) : '0.37'}%
            </span>
            <span className="text-xs text-emerald-600 font-mono font-medium">Optimum Weldability</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Yield Strength</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-blue-50 text-blue-700 border border-blue-200">500W Grade</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono tracking-tight text-slate-900">
              {data.length > 0 ? Math.round(data.reduce((acc, r) => acc + (Number(r.yield_strength_n_mm2) || 0), 0) / data.length) : 520}
            </span>
            <span className="text-xs text-slate-400 font-mono">N/mm² (MPa)</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Bend Test Result</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">180° Cold Bend</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono tracking-tight text-emerald-600">100%</span>
            <span className="text-xs text-emerald-600 font-mono font-medium">Approved No Cracks</span>
          </div>
        </div>
      </div>

      {/* Spreadsheet Control Search */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white border border-slate-200/90 p-4 rounded-2xl shadow-xs">
        <input 
          type="text" 
          placeholder="Filter by Sample ID, or Heat No..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-white border border-slate-300 text-sm px-3.5 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059] font-sans text-slate-900"
        />
        <select 
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
          className="bg-white border border-slate-300 text-sm px-3.5 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059] font-sans text-slate-900"
        >
          <option value="">All Steel Grades</option>
          {grades.map((g, idx) => <option key={idx} value={g}>{g}</option>)}
        </select>
      </div>

      {/* Full-Screen Sheet Grid Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1350px] table-fixed">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase font-mono text-slate-500 select-none">
                <th className={`w-14 text-center ${cellPadding}`}>Actions</th>
                <th className={`w-36 ${cellPadding} cursor-pointer hover:text-slate-900 transition-colors`} onClick={() => handleSort('sample_id')}>
                  Sample ID {sortField === 'sample_id' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th className={`w-28 ${cellPadding}`}>Rebar Size</th>
                <th className={`w-28 ${cellPadding}`}>Steel Grade</th>
                <th className={`w-32 ${cellPadding}`}>
                  Heat No
                </th>
                <th className={`w-32 ${cellPadding}`}>Date</th>
                <th className={`w-24 ${cellPadding} text-right`}>
                  %C
                </th>
                <th className={`w-24 ${cellPadding} text-right`}>
                  %Mn
                </th>
                <th className={`w-24 ${cellPadding} text-right`}>
                  %Si
                </th>
                <th className={`w-24 ${cellPadding} text-right`}>
                  %S
                </th>
                <th className={`w-24 ${cellPadding} text-right`}>
                  %P
                </th>
                <th className={`w-24 ${cellPadding} text-right text-amber-700 font-bold`}>%CE</th>
                <th className={`w-28 ${cellPadding} text-right`}>
                  Yield (N/mm²)
                </th>
                <th className={`w-28 ${cellPadding} text-right`}>
                  Tensile (N/mm²)
                </th>
                <th className={`w-28 ${cellPadding} text-right`}>
                  Elongation %
                </th>
                <th className={`w-32 ${cellPadding}`}>Bend Test</th>
                <th className={`w-32 ${cellPadding} text-right`}>
                  Mass (kg/m)
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
                  
                  {/* Delete row */}
                  <td className="text-center py-1">
                    <button 
                      onClick={() => handleDeleteRow(row.id)}
                      className="text-red-500 hover:text-red-750 font-bold text-xs"
                    >
                      ✕
                    </button>
                  </td>

                  {/* Sample ID */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center">
                      {editingCell?.id === row.id && editingCell?.field === 'sample_id' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'sample_id')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'sample_id')} className="absolute inset-0 w-full h-full bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10 font-bold" autoFocus />
                      ) : (
                        <span className="w-full h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block select-none font-bold text-slate-900" onClick={() => startEdit(row.id, 'sample_id', row.sample_id)}>{row.sample_id}</span>
                      )}
                    </div>
                  </td>

                  {/* Rod Size select */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center">
                      <select
                        value={row.rod_size}
                        onChange={(e) => {
                          const updated = data.map(r => r.id === row.id ? { ...r, rod_size: e.target.value } : r);
                          saveToStorage(updated);
                        }}
                        className="w-full bg-transparent border-0 focus:outline-none py-0.5 text-xs font-sans text-[#B48F48] truncate font-bold"
                      >
                        {sizes.map((s, i) => <option key={i} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </td>

                  {/* Grade select */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center">
                      <select
                        value={row.grade}
                        onChange={(e) => {
                          const updated = data.map(r => r.id === row.id ? { ...r, grade: e.target.value } : r);
                          saveToStorage(updated);
                        }}
                        className="w-full bg-transparent border-0 focus:outline-none py-0.5 text-xs font-sans text-indigo-650 truncate font-bold"
                      >
                        {grades.map((g, i) => <option key={i} value={g}>{g}</option>)}
                      </select>
                    </div>
                  </td>

                  {/* Heat No */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center">
                      {editingCell?.id === row.id && editingCell?.field === 'heat_no' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'heat_no')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'heat_no')} className="absolute inset-0 w-full h-full bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10" autoFocus />
                      ) : (
                        <span className="w-full h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block select-none" onClick={() => startEdit(row.id, 'heat_no', row.heat_no)}>{row.heat_no}</span>
                      )}
                    </div>
                  </td>

                  {/* Testing Date */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center">
                      {editingCell?.id === row.id && editingCell?.field === 'testing_date' ? (
                        <input 
                          type="date" 
                          value={editValue} 
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditValue(val);
                            if (val && val.length === 10) {
                              saveInlineEdit(row.id, 'testing_date', false, val);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              saveInlineEdit(row.id, 'testing_date', false, editValue);
                            } else if (e.key === 'Escape') {
                              setEditingCell(null);
                            }
                          }}
                          className="absolute inset-0 w-full h-full bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10" 
                          autoFocus 
                        />
                      ) : (
                        <span className="w-full h-7 flex items-center px-1 cursor-pointer hover:bg-slate-100 rounded block select-none" onClick={() => startEdit(row.id, 'testing_date', row.testing_date)}>{row.testing_date}</span>
                      )}
                    </div>
                  </td>

                  {/* %C */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center justify-end text-right">
                      {editingCell?.id === row.id && editingCell?.field === 'pct_c' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'pct_c')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'pct_c')} className="absolute inset-0 w-full h-full text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10" autoFocus />
                      ) : (
                        <span className="w-full h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block select-none" onClick={() => startEdit(row.id, 'pct_c', row.pct_c)}>{row.pct_c}%</span>
                      )}
                    </div>
                  </td>

                  {/* %Mn */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center justify-end text-right">
                      {editingCell?.id === row.id && editingCell?.field === 'pct_mn' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'pct_mn')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'pct_mn')} className="absolute inset-0 w-full h-full text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10" autoFocus />
                      ) : (
                        <span className="w-full h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block select-none" onClick={() => startEdit(row.id, 'pct_mn', row.pct_mn)}>{row.pct_mn}%</span>
                      )}
                    </div>
                  </td>

                  {/* %Si */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center justify-end text-right">
                      {editingCell?.id === row.id && editingCell?.field === 'pct_si' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'pct_si')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'pct_si')} className="absolute inset-0 w-full h-full text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10" autoFocus />
                      ) : (
                        <span className="w-full h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block select-none" onClick={() => startEdit(row.id, 'pct_si', row.pct_si)}>{row.pct_si}%</span>
                      )}
                    </div>
                  </td>

                  {/* %S */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center justify-end text-right">
                      {editingCell?.id === row.id && editingCell?.field === 'pct_s' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'pct_s')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'pct_s')} className="absolute inset-0 w-full h-full text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10" autoFocus />
                      ) : (
                        <span className="w-full h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block select-none" onClick={() => startEdit(row.id, 'pct_s', row.pct_s)}>{row.pct_s}%</span>
                      )}
                    </div>
                  </td>

                  {/* %P */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center justify-end text-right">
                      {editingCell?.id === row.id && editingCell?.field === 'pct_p' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'pct_p')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'pct_p')} className="absolute inset-0 w-full h-full text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10" autoFocus />
                      ) : (
                        <span className="w-full h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block select-none" onClick={() => startEdit(row.id, 'pct_p', row.pct_p)}>{row.pct_p}%</span>
                      )}
                    </div>
                  </td>

                  {/* %CE (Calculated) */}
                  <td className={`${cellPadding} text-right font-bold text-rose-655 bg-rose-50/20`}>
                    <span className="h-7 flex items-center justify-end px-1 select-none">{row.pct_ce}%</span>
                  </td>

                  {/* Yield strength */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center justify-end text-right">
                      {editingCell?.id === row.id && editingCell?.field === 'yield_strength_n_mm2' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'yield_strength_n_mm2')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'yield_strength_n_mm2')} className="absolute inset-0 w-full h-full text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10" autoFocus />
                      ) : (
                        <span className="w-full h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block select-none" onClick={() => startEdit(row.id, 'yield_strength_n_mm2', row.yield_strength_n_mm2)}>{row.yield_strength_n_mm2}</span>
                      )}
                    </div>
                  </td>

                  {/* Tensile strength */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center justify-end text-right">
                      {editingCell?.id === row.id && editingCell?.field === 'tensile_strength_n_mm2' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'tensile_strength_n_mm2')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'tensile_strength_n_mm2')} className="absolute inset-0 w-full h-full text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10" autoFocus />
                      ) : (
                        <span className="w-full h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block select-none" onClick={() => startEdit(row.id, 'tensile_strength_n_mm2', row.tensile_strength_n_mm2)}>{row.tensile_strength_n_mm2}</span>
                      )}
                    </div>
                  </td>

                  {/* Elongation */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center justify-end text-right">
                      {editingCell?.id === row.id && editingCell?.field === 'elongation_pct' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'elongation_pct')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'elongation_pct')} className="absolute inset-0 w-full h-full text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10" autoFocus />
                      ) : (
                        <span className="w-full h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block select-none" onClick={() => startEdit(row.id, 'elongation_pct', row.elongation_pct)}>{row.elongation_pct}%</span>
                      )}
                    </div>
                  </td>

                  {/* Bend Test Select */}
                  <td className={cellPadding}>
                    <select
                      value={row.bend_test_result}
                      onChange={(e) => {
                        const updated = data.map(r => r.id === row.id ? { ...r, bend_test_result: e.target.value as any } : r);
                        saveToStorage(updated);
                      }}
                      className="bg-transparent border-0 focus:outline-none py-0.5 text-xs font-sans font-bold text-emerald-650"
                    >
                      {bendStatuses.map((s, i) => <option key={i} value={s}>{s}</option>)}
                    </select>
                  </td>

                  {/* Nominal Mass */}
                  <td className={cellPadding}>
                    <div className="relative w-full h-7 flex items-center justify-end text-right">
                      {editingCell?.id === row.id && editingCell?.field === 'nominal_mass_g_m' ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'nominal_mass_g_m')} onKeyDown={(e) => e.key === 'Enter' && saveInlineEdit(row.id, 'nominal_mass_g_m')} className="absolute inset-0 w-full h-full text-right bg-slate-50 border border-[#C5A059] rounded px-1.5 focus:outline-none font-sans text-xs z-10" autoFocus />
                      ) : (
                        <span className="w-full h-7 flex items-center justify-end px-1 cursor-pointer hover:bg-slate-100 rounded block select-none" onClick={() => startEdit(row.id, 'nominal_mass_g_m', row.nominal_mass_g_m)}>{row.nominal_mass_g_m} kg/m</span>
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
