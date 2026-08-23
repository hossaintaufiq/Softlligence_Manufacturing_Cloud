'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface InventoryRow {
  id: number;
  item_code: string;
  item_description: string;
  item_category: 'Raw Scrap' | 'MS Billet' | 'Deformed Rod' | 'Store Consumable';
  uom: string;
  physical_stock: number;
  allocated_qty: number;
  available_qty: number;
  yard_bay_no: string;
  min_safety_stock: number;
}

export default function YardInventoryPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';

  // Local state with seed data
  const [data, setData] = useState<InventoryRow[]>([
    { id: 1, item_code: 'RM-SCRAP-001', item_description: 'Heavy Melting Scrap (HMS)', item_category: 'Raw Scrap', uom: 'MT', physical_stock: 250.8, allocated_qty: 45.0, available_qty: 205.8, yard_bay_no: 'Yard Bay A', min_safety_stock: 100.0 },
    { id: 2, item_code: 'SM-BILLET-100', item_description: '100x100mm Mild Steel Billet Grade 60', item_category: 'MS Billet', uom: 'MT', physical_stock: 145.2, allocated_qty: 22.0, available_qty: 123.2, yard_bay_no: 'Billet Yard North', min_safety_stock: 50.0 },
    { id: 3, item_code: 'FG-ROD-12MM', item_description: '12mm Deformed Reinforcing Bar Coil', item_category: 'Deformed Rod', uom: 'MT', physical_stock: 84.5, allocated_qty: 12.0, available_qty: 72.5, yard_bay_no: 'Finished Yard Bay C', min_safety_stock: 30.0 },
    { id: 4, item_code: 'FG-ROD-16MM', item_description: '16mm Deformed Reinforcing Bar Bundle', item_category: 'Deformed Rod', uom: 'MT', physical_stock: 96.3, allocated_qty: 15.0, available_qty: 81.3, yard_bay_no: 'Finished Yard Bay D', min_safety_stock: 30.0 },
    { id: 5, item_code: 'CN-POWDER-PATCH', item_description: 'Magnesite Furnace Patching Powder', item_category: 'Store Consumable', uom: 'KG', physical_stock: 4500, allocated_qty: 350, available_qty: 4150, yard_bay_no: 'Store A', min_safety_stock: 1000 }
  ]);

  // Sheet States
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortField, setSortField] = useState<keyof InventoryRow>('item_code');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Visible Columns Toggle
  const [visibleCols, setVisibleCols] = useState({
    item_code: true,
    item_description: true,
    item_category: true,
    uom: true,
    physical_stock: true,
    allocated_qty: true,
    available_qty: true,
    yard_bay_no: true,
    min_safety_stock: true
  });
  const [showColMenu, setShowColMenu] = useState(false);

  // Inline Cell Editing State
  const [editingCell, setEditingCell] = useState<{ id: number; field: keyof InventoryRow } | null>(null);
  const [editValue, setEditValue] = useState('');

  // Multi-Row Modal Entry
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRows, setModalRows] = useState<any[]>([
    { item_code: '', item_description: '', item_category: 'Raw Scrap', uom: 'MT', physical_stock: '', allocated_qty: '0', yard_bay_no: '', min_safety_stock: '10' }
  ]);
  const [validationError, setValidationError] = useState('');

  const cellPadding = isCompact ? 'px-3 py-1.5 text-[11px]' : 'px-4 py-2.5 text-xs';
  const categories = ['Raw Scrap', 'MS Billet', 'Deformed Rod', 'Store Consumable'];

  const handleSort = (field: keyof InventoryRow) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const startEdit = (id: number, field: keyof InventoryRow, currentVal: any) => {
    setEditingCell({ id, field });
    setEditValue(String(currentVal));
  };

  const saveInlineEdit = (id: number, field: keyof InventoryRow) => {
    const updatedRows = data.map(row => {
      if (row.id === id) {
        let val: any = editValue;
        if (field === 'physical_stock' || field === 'allocated_qty' || field === 'min_safety_stock') {
          val = parseFloat(editValue);
          if (isNaN(val)) val = row[field];
        }
        const physical = field === 'physical_stock' ? val : row.physical_stock;
        const allocated = field === 'allocated_qty' ? val : row.allocated_qty;
        const available = Math.max(0, physical - allocated);

        return { ...row, [field]: val, available_qty: available };
      }
      return row;
    });

    setData(updatedRows);
    setEditingCell(null);
  };

  const handleExportCSV = () => {
    const headers = ['Item Code', 'Description', 'Category', 'UOM', 'Physical Stock', 'Allocated', 'Available Stock', 'Yard/Bay No', 'Min Safety Stock'];
    const rows = filteredData.map(r => [
      r.item_code, r.item_description, r.item_category, r.uom, r.physical_stock, r.allocated_qty, r.available_qty, r.yard_bay_no, r.min_safety_stock
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `yard_inventory_ledger.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addModalRow = () => {
    setModalRows([
      ...modalRows,
      { item_code: '', item_description: '', item_category: 'Raw Scrap', uom: 'MT', physical_stock: '', allocated_qty: '0', yard_bay_no: '', min_safety_stock: '10' }
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
      const stock = parseFloat(row.physical_stock);
      const allocated = parseFloat(row.allocated_qty);
      const minStock = parseFloat(row.min_safety_stock);

      if (!row.item_code.trim()) return setValidationError(`Row ${i + 1}: Item Code is required.`);
      if (!row.item_description.trim()) return setValidationError(`Row ${i + 1}: Description is required.`);
      if (!row.yard_bay_no.trim()) return setValidationError(`Row ${i + 1}: Yard/Bay number is required.`);
      if (isNaN(stock) || stock < 0) return setValidationError(`Row ${i + 1}: Physical stock must be non-negative.`);
      if (isNaN(allocated) || allocated < 0) return setValidationError(`Row ${i + 1}: Allocated stock must be non-negative.`);
      if (isNaN(minStock) || minStock < 0) return setValidationError(`Row ${i + 1}: Min safety stock must be non-negative.`);
    }

    const newEntries = modalRows.map((row, index) => {
      const stock = parseFloat(row.physical_stock);
      const allocated = parseFloat(row.allocated_qty);
      return {
        id: data.length + index + 1,
        item_code: row.item_code,
        item_description: row.item_description,
        item_category: row.item_category,
        uom: row.uom,
        physical_stock: stock,
        allocated_qty: allocated,
        available_qty: stock - allocated,
        yard_bay_no: row.yard_bay_no,
        min_safety_stock: parseFloat(row.min_safety_stock)
      };
    });

    setData([...data, ...newEntries]);
    setIsModalOpen(false);
    setModalRows([{ item_code: '', item_description: '', item_category: 'Raw Scrap', uom: 'MT', physical_stock: '', allocated_qty: '0', yard_bay_no: '', min_safety_stock: '10' }]);
  };

  const filteredData = data
    .filter(row => {
      const matchesSearch = row.item_code.toLowerCase().includes(search.toLowerCase()) ||
                            row.item_description.toLowerCase().includes(search.toLowerCase()) ||
                            row.yard_bay_no.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter ? row.item_category === categoryFilter : true;
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
          <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wider font-mono">Yard Inventory Control</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Monitors raw scrap, cast steel billets, final reinforcing deformed bar coils, and warehouse consumables.</p>
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
          placeholder="Filter by Item Code, Description, or Bay location..." 
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
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-150 text-[10px] uppercase font-mono text-slate-450">
                {visibleCols.item_code && (
                  <th className={`sticky left-0 bg-slate-50 z-10 border-r border-slate-100 ${cellPadding} cursor-pointer hover:bg-slate-100`} onClick={() => handleSort('item_code')}>
                    Item Code {sortField === 'item_code' && (sortDir === 'asc' ? '▲' : '▼')}
                  </th>
                )}
                {visibleCols.item_description && <th className={`${cellPadding} cursor-pointer hover:bg-slate-100`} onClick={() => handleSort('item_description')}>Description</th>}
                {visibleCols.item_category && <th className={`${cellPadding}`}>Category</th>}
                {visibleCols.uom && <th className={`${cellPadding}`}>UOM</th>}
                {visibleCols.physical_stock && <th className={`${cellPadding} text-right`}>Physical Stock</th>}
                {visibleCols.allocated_qty && <th className={`${cellPadding} text-right`}>Allocated</th>}
                {visibleCols.available_qty && <th className={`${cellPadding} text-right`}>Available Qty</th>}
                {visibleCols.yard_bay_no && <th className={`${cellPadding}`}>Yard/Bay No</th>}
                {visibleCols.min_safety_stock && <th className={`${cellPadding} text-right`}>Safety Stock</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredData.map((row) => {
                const isUnderSafety = row.available_qty < row.min_safety_stock;
                return (
                  <tr key={row.id} className={`hover:bg-slate-50/40 transition-colors ${isUnderSafety ? 'bg-amber-55/5' : ''}`}>
                    {visibleCols.item_code && (
                      <td className={`sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-150 ${cellPadding} font-bold text-slate-900`}>
                        {row.item_code}
                      </td>
                    )}
                    {visibleCols.item_description && (
                      <td className={cellPadding} onClick={() => startEdit(row.id, 'item_description', row.item_description)}>
                        {editingCell?.id === row.id && editingCell?.field === 'item_description' ? (
                          <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'item_description')} className="bg-slate-50 border border-slate-200 p-0.5 rounded text-xs focus:outline-none" autoFocus />
                        ) : (
                          <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.item_description}</span>
                        )}
                      </td>
                    )}
                    {visibleCols.item_category && (
                      <td className={cellPadding}>
                        <span className="px-2 py-0.5 text-[9px] font-bold border rounded-full bg-slate-50 text-slate-700 border-slate-250/25">
                          {row.item_category}
                        </span>
                      </td>
                    )}
                    {visibleCols.uom && <td className={cellPadding}>{row.uom}</td>}
                    {visibleCols.physical_stock && (
                      <td className={`${cellPadding} text-right`} onClick={() => startEdit(row.id, 'physical_stock', row.physical_stock)}>
                        {editingCell?.id === row.id && editingCell?.field === 'physical_stock' ? (
                          <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'physical_stock')} className="bg-slate-50 border border-slate-200 text-right w-20 p-0.5 rounded text-xs focus:outline-none font-mono" autoFocus />
                        ) : (
                          <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.physical_stock.toLocaleString()}</span>
                        )}
                      </td>
                    )}
                    {visibleCols.allocated_qty && (
                      <td className={`${cellPadding} text-right`} onClick={() => startEdit(row.id, 'allocated_qty', row.allocated_qty)}>
                        {editingCell?.id === row.id && editingCell?.field === 'allocated_qty' ? (
                          <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'allocated_qty')} className="bg-slate-50 border border-slate-200 text-right w-20 p-0.5 rounded text-xs focus:outline-none font-mono" autoFocus />
                        ) : (
                          <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.allocated_qty.toLocaleString()}</span>
                        )}
                      </td>
                    )}
                    {visibleCols.available_qty && (
                      <td className={`${cellPadding} text-right font-black ${isUnderSafety ? 'text-rose-600' : 'text-[#B48F48]'}`}>
                        {row.available_qty.toLocaleString()} {row.uom}
                      </td>
                    )}
                    {visibleCols.yard_bay_no && (
                      <td className={cellPadding} onClick={() => startEdit(row.id, 'yard_bay_no', row.yard_bay_no)}>
                        {editingCell?.id === row.id && editingCell?.field === 'yard_bay_no' ? (
                          <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'yard_bay_no')} className="bg-slate-50 border border-slate-200 p-0.5 rounded text-xs focus:outline-none" autoFocus />
                        ) : (
                          <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.yard_bay_no}</span>
                        )}
                      </td>
                    )}
                    {visibleCols.min_safety_stock && (
                      <td className={`${cellPadding} text-right`} onClick={() => startEdit(row.id, 'min_safety_stock', row.min_safety_stock)}>
                        {editingCell?.id === row.id && editingCell?.field === 'min_safety_stock' ? (
                          <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => saveInlineEdit(row.id, 'min_safety_stock')} className="bg-slate-50 border border-slate-200 text-right w-20 p-0.5 rounded text-xs focus:outline-none font-mono" autoFocus />
                        ) : (
                          <span className="cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded">{row.min_safety_stock.toLocaleString()}</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Multi-Row Quick Modal Entry */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40">
          <div className="bg-white border border-slate-200/85 p-7 rounded-3xl w-full max-w-5xl shadow-2xl space-y-5 relative overflow-hidden border-t-4 border-t-[#C5A059] flex flex-col max-h-[85vh]">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider font-mono">Create Yard Stock Items</h3>
              <p className="text-[10px] text-slate-450 mt-1">Simultaneously log new stock ledger allocations, parts, or scrap types.</p>
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
                      <label className="text-[8px] font-bold font-mono text-slate-400">Item Code</label>
                      <input type="text" placeholder="FG-ROD-XX" value={row.item_code} onChange={(e) => handleModalRowChange(idx, 'item_code', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded focus:outline-none font-mono" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Description</label>
                      <input type="text" placeholder="Item description" value={row.item_description} onChange={(e) => handleModalRowChange(idx, 'item_description', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded focus:outline-none" />
                    </div>
                    <div className="w-32 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Category</label>
                      <select value={row.item_category} onChange={(e) => handleModalRowChange(idx, 'item_category', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded focus:outline-none">
                        {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="w-16 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">UOM</label>
                      <select value={row.uom} onChange={(e) => handleModalRowChange(idx, 'uom', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded focus:outline-none">
                        <option value="MT">MT</option>
                        <option value="KG">KG</option>
                        <option value="PCS">PCS</option>
                        <option value="Ltr">Ltr</option>
                      </select>
                    </div>
                    <div className="w-20 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Physical Stock</label>
                      <input type="number" placeholder="50" value={row.physical_stock} onChange={(e) => handleModalRowChange(idx, 'physical_stock', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded focus:outline-none" />
                    </div>
                    <div className="w-24 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Bay No</label>
                      <input type="text" placeholder="Bay A" value={row.yard_bay_no} onChange={(e) => handleModalRowChange(idx, 'yard_bay_no', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded focus:outline-none" />
                    </div>
                    <div className="w-20 space-y-1">
                      <label className="text-[8px] font-bold font-mono text-slate-400">Safety Min</label>
                      <input type="number" placeholder="10" value={row.min_safety_stock} onChange={(e) => handleModalRowChange(idx, 'min_safety_stock', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded focus:outline-none" />
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
                    Save Stock Items
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
