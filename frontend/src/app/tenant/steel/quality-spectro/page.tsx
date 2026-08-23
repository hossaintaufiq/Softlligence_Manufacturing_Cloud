'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface QualityRow {
  id: number;
  heat_no: string;
  testing_date: string;
  pct_c: number;
  pct_mn: number;
  pct_si: number;
  pct_s: number;
  pct_p: number;
  pct_ce: number;
  yield_strength_n_mm2: number;
  tensile_strength_n_mm2: number;
  elongation_pct: number;
  bend_test_result: 'Approved' | 'Rejected';
  nominal_mass_g_m: number;
}

export default function QualitySpectroPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';

  // Local state with seed data
  const [data, setData] = useState<QualityRow[]>([
    { id: 1, heat_no: 'H-260820A', testing_date: '2026-08-20', pct_c: 0.22, pct_mn: 0.85, pct_si: 0.24, pct_s: 0.035, pct_p: 0.038, pct_ce: 0.37, yield_strength_n_mm2: 520, tensile_strength_n_mm2: 635, elongation_pct: 18, bend_test_result: 'Approved', nominal_mass_g_m: 0.888 },
    { id: 2, heat_no: 'H-260821A', testing_date: '2026-08-21', pct_c: 0.24, pct_mn: 0.90, pct_si: 0.26, pct_s: 0.040, pct_p: 0.042, pct_ce: 0.40, yield_strength_n_mm2: 535, tensile_strength_n_mm2: 650, elongation_pct: 17, bend_test_result: 'Approved', nominal_mass_g_m: 1.580 },
    { id: 3, heat_no: 'H-260822A', testing_date: '2026-08-22', pct_c: 0.21, pct_mn: 0.82, pct_si: 0.22, pct_s: 0.030, pct_p: 0.032, pct_ce: 0.35, yield_strength_n_mm2: 512, tensile_strength_n_mm2: 622, elongation_pct: 19, bend_test_result: 'Approved', nominal_mass_g_m: 2.470 }
  ]);

  // Sheet States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState<keyof QualityRow>('testing_date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Visible Columns Toggle
  const [visibleCols, setVisibleCols] = useState({
    heat_no: true,
    testing_date: true,
    pct_c: true,
    pct_mn: true,
    pct_si: true,
    pct_s: true,
    pct_p: true,
    pct_ce: true,
    yield_strength_n_mm2: true,
    tensile_strength_n_mm2: true,
    elongation_pct: true,
    bend_test_result: true,
    nominal_mass_g_m: true
  });
  const [showColMenu, setShowColMenu] = useState(false);

  // Inline Cell Editing State
  const [editingCell, setEditingCell] = useState<{ id: number; field: keyof QualityRow } | null>(null);
  const [editValue, setEditValue] = useState('');

  // Multi-Row Modal Entry
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRows, setModalRows] = useState<any[]>([
    { heat_no: '', testing_date: new Date().toISOString().split('T')[0], pct_c: '0.22', pct_mn: '0.85', pct_si: '0.24', pct_s: '0.035', pct_p: '0.038', yield_strength_n_mm2: '500', tensile_strength_n_mm2: '620', elongation_pct: '18', bend_test_result: 'Approved', nominal_mass_g_m: '0.888' }
  ]);
  const [validationError, setValidationError] = useState('');

  const cellPadding = isCompact ? 'px-2 py-1 text-[10px]' : 'px-3 py-2 text-xs';

  const handleSort = (field: keyof QualityRow) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const startEdit = (id: number, field: keyof QualityRow, currentVal: any) => {
    setEditingCell({ id, field });
    setEditValue(String(currentVal));
  };

  const saveInlineEdit = (id: number, field: keyof QualityRow) => {
    const updatedRows = data.map(row => {
      if (row.id === id) {
        let val: any = editValue;
        if (field !== 'heat_no' && field !== 'testing_date' && field !== 'bend_test_result') {
          val = parseFloat(editValue);
          if (isNaN(val)) val = row[field];
        }
        
        let targetRow = { ...row, [field]: val };
        if (field === 'pct_c' || field === 'pct_mn' || field === 'pct_si') {
          targetRow.pct_ce = parseFloat((targetRow.pct_c + targetRow.pct_mn / 6 + targetRow.pct_si / 24).toFixed(3));
        }
        return targetRow;
      }
      return row;
    });

    setData(updatedRows);
    setEditingCell(null);
  };

  const handleExportCSV = () => {
    const headers = ['Heat No', 'Testing Date', '%C', '%Mn', '%Si', '%S', '%P', '%CE', 'Yield Str (N/mm2)', 'Tensile Str (N/mm2)', '% Elongation', 'Bend Test', 'Nominal Mass (kg/m)'];
    const rows = filteredData.map(r => [
      r.heat_no, r.testing_date, r.pct_c, r.pct_mn, r.pct_si, r.pct_s, r.pct_p, r.pct_ce, r.yield_strength_n_mm2, r.tensile_strength_n_mm2, r.elongation_pct, r.bend_test_result, r.nominal_mass_g_m
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `spectrometer_chemistry_reports.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addModalRow = () => {
    setModalRows([
      ...modalRows,
      { heat_no: '', testing_date: new Date().toISOString().split('T')[0], pct_c: '0.22', pct_mn: '0.85', pct_si: '0.24', pct_s: '0.035', pct_p: '0.038', yield_strength_n_mm2: '500', tensile_strength_n_mm2: '620', elongation_pct: '18', bend_test_result: 'Approved', nominal_mass_g_m: '0.888' }
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
      const c = parseFloat(row.pct_c);
      const mn = parseFloat(row.pct_mn);
      const si = parseFloat(row.pct_si);
      const s = parseFloat(row.pct_s);
      const p = parseFloat(row.pct_p);
      const yield_str = parseFloat(row.yield_strength_n_mm2);
      const tensile = parseFloat(row.tensile_strength_n_mm2);
      const elongation = parseFloat(row.elongation_pct);
      const mass = parseFloat(row.nominal_mass_g_m);

      if (!row.heat_no.trim()) return setValidationError(`Row ${i + 1}: Heat reference is required.`);
      if (!row.testing_date) return setValidationError(`Row ${i + 1}: Testing date is required.`);
      if (isNaN(c) || c < 0 || c > 100) return setValidationError(`Row ${i + 1}: Carbon % must be 0-100.`);
      if (isNaN(mn) || mn < 0 || mn > 100) return setValidationError(`Row ${i + 1}: Manganese % must be 0-100.`);
      if (isNaN(si) || si < 0 || si > 100) return setValidationError(`Row ${i + 1}: Silicon % must be 0-100.`);
      if (isNaN(s) || s < 0 || s > 100) return setValidationError(`Row ${i + 1}: Sulfur % must be 0-100.`);
      if (isNaN(p) || p < 0 || p > 100) return setValidationError(`Row ${i + 1}: Phosphorous % must be 0-100.`);
      if (isNaN(yield_str) || yield_str <= 0) return setValidationError(`Row ${i + 1}: Yield Strength must be positive.`);
      if (isNaN(tensile) || tensile <= 0) return setValidationError(`Row ${i + 1}: Tensile Strength must be positive.`);
      if (yield_str >= tensile) return setValidationError(`Row ${i + 1}: Tensile Strength must exceed Yield Strength.`);
      if (isNaN(elongation) || elongation < 0 || elongation > 100) return setValidationError(`Row ${i + 1}: Elongation % must be 0-100.`);
      if (isNaN(mass) || mass <= 0) return setValidationError(`Row ${i + 1}: Nominal mass must be positive.`);
    }

    const newEntries = modalRows.map((row, index) => {
      const c = parseFloat(row.pct_c);
      const mn = parseFloat(row.pct_mn);
      const si = parseFloat(row.pct_si);
      return {
        id: data.length + index + 1,
        heat_no: row.heat_no,
        testing_date: row.testing_date,
        pct_c: c,
        pct_mn: mn,
        pct_si: si,
        pct_s: parseFloat(row.pct_s),
        pct_p: parseFloat(row.pct_p),
        pct_ce: parseFloat((c + mn / 6 + si / 24).toFixed(3)),
        yield_strength_n_mm2: parseFloat(row.yield_strength_n_mm2),
        tensile_strength_n_mm2: parseFloat(row.tensile_strength_n_mm2),
        elongation_pct: parseFloat(row.elongation_pct),
        bend_test_result: row.bend_test_result,
        nominal_mass_g_m: parseFloat(row.nominal_mass_g_m)
      };
    });

    setData([...data, ...newEntries]);
    setIsModalOpen(false);
    setModalRows([{ heat_no: '', testing_date: new Date().toISOString().split('T')[0], pct_c: '0.22', pct_mn: '0.85', pct_si: '0.24', pct_s: '0.035', pct_p: '0.038', yield_strength_n_mm2: '500', tensile_strength_n_mm2: '620', elongation_pct: '18', bend_test_result: 'Approved', nominal_mass_g_m: '0.888' }]);
  };

  const filteredData = data
    .filter(row => {
      const matchesSearch = row.heat_no.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter ? row.bend_test_result === statusFilter : true;
      return matchesSearch && matchesStatus;
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
          <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wider font-mono">Spectrometer Chemistry & QA</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Logs heat-wise spectrometry analysis, Carbon Equivalents (CE), yield strengths, elongations, and bend tests.</p>
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
          placeholder="Filter by Heat No..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none"
        />
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none"
        >
          <option value="">All QA Outcomes</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Full-Screen Sheet Grid Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1300px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-150 text-[10px] uppercase font-mono text-slate-450">
                {visibleCols.heat_no && (
                  <th className={`sticky left-0 bg-slate-50 z-10 border-r border-slate-100 ${cellPadding} cursor-pointer hover:bg-slate-100`} onClick={() => handleSort('heat_no')}>
                    Heat No {sortField === 'heat_no' && (sortDir === 'asc' ? '▲' : '▼')}
                  </th>
                )}
                {visibleCols.testing_date && <th className={`${cellPadding} cursor-pointer hover:bg-slate-100`} onClick={() => handleSort('testing_date')}>Testing Date</th>}
                {visibleCols.pct_c && <th className={`${cellPadding} text-right`}>%C</th>}
                {visibleCols.pct_mn && <th className={`${cellPadding} text-right`}>%Mn</th>}
                {visibleCols.pct_si && <th className={`${cellPadding} text-right`}>%Si</th>}
                {visibleCols.pct_s && <th className={`${cellPadding} text-right`}>%S</th>}
                {visibleCols.pct_p && <th className={`${cellPadding} text-right`}>%P</th>}
                {visibleCols.pct_ce && <th className={`${cellPadding} text-right`}>%CE</th>}
                {visibleCols.yield_strength_n_mm2 && <th className={`${cellPadding} text-right`}>Yield Strength (N/mm²)</th>}
                {visibleCols.tensile_strength_n_mm2 && <th className={`${cellPadding} text-right`}>Tensile Strength (N/mm²)</th>}
                {visibleCols.elongation_pct && <th className={`${cellPadding} text-right`}>% Elongation</th>}
                {visibleCols.bend_test_result && <th className={`${cellPadding}`}>180° Bend Test</th>}
                {visibleCols.nominal_mass_g_m && <th className={`${cellPadding} text-right`}>Nominal Mass (kg/m)</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/40 transition-colors">
                  {visibleCols.heat_no && (
                    <td className={`sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-150 ${cellPadding} font-bold text-slate-900`}>
                      {row.heat_no}
                    </td>
                  )}
                  {visibleCols.testing_date && <td className={cellPadding}>{row.testing_date}</td>}
                  {visibleCols.pct_c && (
                    <td className={`${cellPadding} text-right`} onClick={() => startEdit(row.id, 'pct_c', row.pct_c)}>
                      {editingCell?.id === row.id && editingCell?.field === 'pct_c' ? (
                        <input type="number" step="0.01" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'pct_c')} className="bg-slate-50 border border-slate-200 text-right w-16 p-0.5 rounded text-xs focus:outline-none font-mono" autoFocus />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 rounded">{row.pct_c}%</span>
                      )}
                    </td>
                  )}
                  {visibleCols.pct_mn && (
                    <td className={`${cellPadding} text-right`} onClick={() => startEdit(row.id, 'pct_mn', row.pct_mn)}>
                      {editingCell?.id === row.id && editingCell?.field === 'pct_mn' ? (
                        <input type="number" step="0.01" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'pct_mn')} className="bg-slate-50 border border-slate-200 text-right w-16 p-0.5 rounded text-xs focus:outline-none font-mono" autoFocus />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 rounded">{row.pct_mn}%</span>
                      )}
                    </td>
                  )}
                  {visibleCols.pct_si && (
                    <td className={`${cellPadding} text-right`} onClick={() => startEdit(row.id, 'pct_si', row.pct_si)}>
                      {editingCell?.id === row.id && editingCell?.field === 'pct_si' ? (
                        <input type="number" step="0.01" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'pct_si')} className="bg-slate-50 border border-slate-200 text-right w-16 p-0.5 rounded text-xs focus:outline-none font-mono" autoFocus />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 rounded">{row.pct_si}%</span>
                      )}
                    </td>
                  )}
                  {visibleCols.pct_s && (
                    <td className={`${cellPadding} text-right`} onClick={() => startEdit(row.id, 'pct_s', row.pct_s)}>
                      {editingCell?.id === row.id && editingCell?.field === 'pct_s' ? (
                        <input type="number" step="0.001" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'pct_s')} className="bg-slate-50 border border-slate-200 text-right w-16 p-0.5 rounded text-xs focus:outline-none font-mono" autoFocus />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 rounded">{row.pct_s}%</span>
                      )}
                    </td>
                  )}
                  {visibleCols.pct_p && (
                    <td className={`${cellPadding} text-right`} onClick={() => startEdit(row.id, 'pct_p', row.pct_p)}>
                      {editingCell?.id === row.id && editingCell?.field === 'pct_p' ? (
                        <input type="number" step="0.001" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'pct_p')} className="bg-slate-50 border border-slate-200 text-right w-16 p-0.5 rounded text-xs focus:outline-none font-mono" autoFocus />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 rounded">{row.pct_p}%</span>
                      )}
                    </td>
                  )}
                  {visibleCols.pct_ce && (
                    <td className={`${cellPadding} text-right font-semibold text-rose-600`}>
                      {row.pct_ce}%
                    </td>
                  )}
                  {visibleCols.yield_strength_n_mm2 && (
                    <td className={`${cellPadding} text-right`} onClick={() => startEdit(row.id, 'yield_strength_n_mm2', row.yield_strength_n_mm2)}>
                      {editingCell?.id === row.id && editingCell?.field === 'yield_strength_n_mm2' ? (
                        <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'yield_strength_n_mm2')} className="bg-slate-50 border border-slate-200 text-right w-20 p-0.5 rounded text-xs focus:outline-none font-mono" autoFocus />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 rounded">{row.yield_strength_n_mm2} N/mm²</span>
                      )}
                    </td>
                  )}
                  {visibleCols.tensile_strength_n_mm2 && (
                    <td className={`${cellPadding} text-right`} onClick={() => startEdit(row.id, 'tensile_strength_n_mm2', row.tensile_strength_n_mm2)}>
                      {editingCell?.id === row.id && editingCell?.field === 'tensile_strength_n_mm2' ? (
                        <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'tensile_strength_n_mm2')} className="bg-slate-50 border border-slate-200 text-right w-20 p-0.5 rounded text-xs focus:outline-none font-mono" autoFocus />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 rounded">{row.tensile_strength_n_mm2} N/mm²</span>
                      )}
                    </td>
                  )}
                  {visibleCols.elongation_pct && (
                    <td className={`${cellPadding} text-right`} onClick={() => startEdit(row.id, 'elongation_pct', row.elongation_pct)}>
                      {editingCell?.id === row.id && editingCell?.field === 'elongation_pct' ? (
                        <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'elongation_pct')} className="bg-slate-50 border border-slate-200 text-right w-16 p-0.5 rounded text-xs focus:outline-none font-mono" autoFocus />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 rounded">{row.elongation_pct}%</span>
                      )}
                    </td>
                  )}
                  {visibleCols.bend_test_result && (
                    <td className={cellPadding}>
                      <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-full ${
                        row.bend_test_result === 'Approved' ? 'bg-emerald-50 text-emerald-650 border-emerald-250/20' : 'bg-rose-50 text-rose-650 border-rose-250/20'
                      }`}>
                        {row.bend_test_result}
                      </span>
                    </td>
                  )}
                  {visibleCols.nominal_mass_g_m && (
                    <td className={`${cellPadding} text-right`} onClick={() => startEdit(row.id, 'nominal_mass_g_m', row.nominal_mass_g_m)}>
                      {editingCell?.id === row.id && editingCell?.field === 'nominal_mass_g_m' ? (
                        <input type="number" step="0.001" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'nominal_mass_g_m')} className="bg-slate-50 border border-slate-200 text-right w-20 p-0.5 rounded text-xs focus:outline-none font-mono" autoFocus />
                      ) : (
                        <span className="cursor-pointer hover:bg-slate-100 px-1 rounded">{row.nominal_mass_g_m} kg/m</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40">
          <div className="bg-white border border-slate-200/85 p-7 rounded-3xl w-full max-w-6xl shadow-2xl space-y-5 relative overflow-hidden border-t-4 border-t-[#C5A059] flex flex-col max-h-[85vh]">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-mono">Record Spectrometry QA Logs</h3>
              <p className="text-[10px] text-slate-450 mt-1">Simultaneously log heat-wise chemistry breakdowns and physical mechanical checks.</p>
            </div>

            {validationError && (
              <div className="bg-rose-50 text-rose-800 p-3 rounded-xl border border-rose-100 text-[10px] font-bold font-mono">
                🚨 Error: {validationError}
              </div>
            )}

            <form onSubmit={handleMultiRowSubmit} className="space-y-4 flex-1 overflow-y-auto min-h-0">
              <div className="space-y-3">
                {modalRows.map((row, idx) => (
                  <div key={idx} className="flex gap-2 items-end border-b border-slate-100 pb-3 last:border-b-0">
                    <div className="w-24 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Heat No</label>
                      <input type="text" value={row.heat_no} onChange={(e) => handleModalRowChange(idx, 'heat_no', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2 py-1 rounded focus:outline-none font-mono" />
                    </div>
                    <div className="w-24 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Date</label>
                      <input type="date" value={row.testing_date} onChange={(e) => handleModalRowChange(idx, 'testing_date', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2 py-1 rounded focus:outline-none" />
                    </div>
                    <div className="w-12 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">%C</label>
                      <input type="number" step="0.01" value={row.pct_c} onChange={(e) => handleModalRowChange(idx, 'pct_c', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2 py-1 rounded focus:outline-none font-mono" />
                    </div>
                    <div className="w-12 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">%Mn</label>
                      <input type="number" step="0.01" value={row.pct_mn} onChange={(e) => handleModalRowChange(idx, 'pct_mn', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2 py-1 rounded focus:outline-none font-mono" />
                    </div>
                    <div className="w-12 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">%Si</label>
                      <input type="number" step="0.01" value={row.pct_si} onChange={(e) => handleModalRowChange(idx, 'pct_si', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2 py-1 rounded focus:outline-none font-mono" />
                    </div>
                    <div className="w-12 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">%S</label>
                      <input type="number" step="0.001" value={row.pct_s} onChange={(e) => handleModalRowChange(idx, 'pct_s', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2 py-1 rounded focus:outline-none font-mono" />
                    </div>
                    <div className="w-12 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">%P</label>
                      <input type="number" step="0.001" value={row.pct_p} onChange={(e) => handleModalRowChange(idx, 'pct_p', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2 py-1 rounded focus:outline-none font-mono" />
                    </div>
                    <div className="w-20 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Yield Str</label>
                      <input type="number" value={row.yield_strength_n_mm2} onChange={(e) => handleModalRowChange(idx, 'yield_strength_n_mm2', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2 py-1 rounded focus:outline-none font-mono" />
                    </div>
                    <div className="w-20 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Tensile Str</label>
                      <input type="number" value={row.tensile_strength_n_mm2} onChange={(e) => handleModalRowChange(idx, 'tensile_strength_n_mm2', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2 py-1 rounded focus:outline-none font-mono" />
                    </div>
                    <div className="w-16 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">% Elong</label>
                      <input type="number" value={row.elongation_pct} onChange={(e) => handleModalRowChange(idx, 'elongation_pct', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2 py-1 rounded focus:outline-none font-mono" />
                    </div>
                    <div className="w-24 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Bend Test</label>
                      <select value={row.bend_test_result} onChange={(e) => handleModalRowChange(idx, 'bend_test_result', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2 py-1 rounded focus:outline-none">
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                    <div className="w-20 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Mass (kg/m)</label>
                      <input type="number" step="0.001" value={row.nominal_mass_g_m} onChange={(e) => handleModalRowChange(idx, 'nominal_mass_g_m', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2 py-1 rounded focus:outline-none font-mono" />
                    </div>
                    {modalRows.length > 1 && (
                      <button type="button" onClick={() => removeModalRow(idx)} className="text-red-500 hover:text-red-750 pb-1 font-bold cursor-pointer">✕</button>
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
                    Save QA logs
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
