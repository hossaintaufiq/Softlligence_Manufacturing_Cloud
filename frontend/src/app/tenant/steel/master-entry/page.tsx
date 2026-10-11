'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { exportToExcel } from '@/lib/excelExport';
import { useAuth } from '@/context/AuthContext';

// Types for all steel mill operational sections
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
  total_cost?: number;
}

interface FurnaceRow {
  id: number;
  heat_no: string;
  date: string;
  furnace_no: string;
  shift_id: string;
  scrap_input_kg: number;
  runtime_min: number;
  used_patching_powder_kg?: number;
  used_patching_forma_kg?: number;
  tapping_temp_c: number;
  liquid_steel_tapped_kg: number;
  power_consumed_kwh: number;
  furnace_master?: string;
  yield_pct?: number;
}

interface BilletRow {
  id: number;
  date: string;
  furnace_no: string;
  heat_no: string;
  billet_size_section: string;
  steel_tapped_input_kg?: number;
  billet_output_kg: number;
  scull_loss_kg: number;
  billet_yield_pct?: number;
  billet_stock_kg: number;
}

interface RollingRow {
  id: number;
  date: string;
  billet_input_kg: number;
  rod_size: string;
  rod_production_kg: number;
  rod_loss_kg: number;
  rod_yield_pct?: number;
  rod_stock_kg: number;
  grade?: string;
}

interface DispatchRow {
  id: number;
  date: string;
  customer_name: string;
  contact_info?: string;
  order_no: string;
  challan_no: string;
  vehicle_no: string;
  dispatch_qty_kg: number;
  rate_per_kg: number;
  total_sales_value: number;
  payment_status: 'Paid' | 'Partial' | 'Pending';
  rod_size: string;
}

interface DowntimeRow {
  id: number;
  date: string;
  ticket_no: string;
  equipment: string;
  billet_breakdown_min: number;
  rolling_breakdown_min: number;
  breakdown_category: string;
  root_cause_notes: string;
  shift_code?: string;
  action_taken?: string;
}

interface ExpenseRow {
  id: number;
  date: string;
  voucher_no: string;
  expense_head: string;
  amount: number;
  paid_to: string;
  payment_mode: string;
  remarks: string;
  approved_by?: string;
}

interface QualityRow {
  id?: number;
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
  yield_strength_n_mm2?: number;
  tensile_strength_n_mm2?: number;
  elongation_pct?: number;
  bend_test_result: string;
  nominal_mass_g_m?: number;
}

// Initial Seeds
const initialScrap: ScrapRow[] = [
  { id: 1, date: '2026-08-24', supplier_name: 'Metro Scrap Traders', scrap_category: 'HMS-1 (Heavy Melting)', scrap_rcv_kg: 24500, truck_no: 'TR-1024', gross_weight: 34500, value_tare: 10000, rate_per_kg: 52.5, total_cost: 1286250 },
  { id: 2, date: '2026-08-24', supplier_name: 'Apex Scrap Suppliers', scrap_category: 'Rolling Kechi / End Cuts', scrap_rcv_kg: 18200, truck_no: 'TR-8812', gross_weight: 28200, value_tare: 10000, rate_per_kg: 49.0, total_cost: 891800 }
];

const initialFurnace: FurnaceRow[] = [
  { id: 1, heat_no: 'H-260824A', date: '2026-08-24', furnace_no: 'Furnace 01', shift_id: 'A', scrap_input_kg: 24000, runtime_min: 145, used_patching_powder_kg: 150, used_patching_forma_kg: 1, tapping_temp_c: 1610, liquid_steel_tapped_kg: 22200, power_consumed_kwh: 12800, furnace_master: 'Kabir Ahmed', yield_pct: 92.5 }
];

const initialBillet: BilletRow[] = [
  { id: 1, date: '2026-08-24', furnace_no: 'Furnace 01', heat_no: 'H-260824A', billet_size_section: '100x100mm x 6m', steel_tapped_input_kg: 22200, billet_output_kg: 21600, scull_loss_kg: 600, billet_yield_pct: 97.3, billet_stock_kg: 64000 }
];

const initialRolling: RollingRow[] = [
  { id: 1, date: '2026-08-24', billet_input_kg: 21600, rod_size: '16MM', rod_production_kg: 20736, rod_loss_kg: 864, rod_yield_pct: 96.0, rod_stock_kg: 145000, grade: '500W' }
];

const initialDispatch: DispatchRow[] = [
  { id: 1, date: '2026-08-24', customer_name: 'Metro Infrastructures', contact_info: '01712-334455', order_no: 'ORD-502', challan_no: 'CH-260824A', vehicle_no: 'TR-2005', dispatch_qty_kg: 8000, rate_per_kg: 92, total_sales_value: 736000, payment_status: 'Paid', rod_size: '16MM' }
];

const initialDowntime: DowntimeRow[] = [
  { id: 1, date: '2026-08-24', ticket_no: 'DT-2401', equipment: 'Induction Furnace #1 Crucible Tilt', billet_breakdown_min: 25, rolling_breakdown_min: 0, breakdown_category: 'Hydraulics', root_cause_notes: 'Hydraulic cylinder pressure seal replacement', shift_code: 'A', action_taken: 'Replaced O-ring seal' }
];

const initialExpenses: ExpenseRow[] = [
  { id: 1, date: '2026-08-24', voucher_no: 'EXP-2401', expense_head: 'Refractory Patching Consumables', amount: 154000, paid_to: 'Refractory Solutions Ltd', payment_mode: 'Bank Transfer', remarks: 'Patching powder bulk delivery', approved_by: 'Kabir Ahmed' }
];

const initialQuality: QualityRow[] = [
  { id: 1, sample_id: 'SPL-24A-1', rod_size: '16MM', grade: '500W', heat_no: 'H-260824A', testing_date: '2026-08-24', pct_c: 0.22, pct_mn: 0.88, pct_si: 0.24, pct_s: 0.032, pct_p: 0.036, pct_ce: 0.367, yield_strength_n_mm2: 528, tensile_strength_n_mm2: 642, elongation_pct: 18.5, bend_test_result: 'Approved', nominal_mass_g_m: 1.580 }
];

export default function MasterDataEntryPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';
  const cellPadding = isCompact ? 'px-2.5 py-1 text-[11px]' : 'px-3.5 py-1.5 text-xs';

  // Active section tab & filters
  const [activeTab, setActiveTab] = useState<'all' | 'furnace' | 'billet' | 'rolling' | 'dispatch' | 'scrap' | 'downtime' | 'expenses' | 'quality'>('all');
  const [targetDate, setTargetDate] = useState<string>('2026-08-24');
  const [dateFilterMode, setDateFilterMode] = useState<'single' | 'all'>('single');
  const [activeShift, setActiveShift] = useState<string>('A');
  const [shiftMaster, setShiftMaster] = useState<string>('Kabir Ahmed');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Datasets
  const [scrapData, setScrapData] = useState<ScrapRow[]>([]);
  const [furnaceData, setFurnaceData] = useState<FurnaceRow[]>([]);
  const [billetData, setBilletData] = useState<BilletRow[]>([]);
  const [rollingData, setRollingData] = useState<RollingRow[]>([]);
  const [dispatchData, setDispatchData] = useState<DispatchRow[]>([]);
  const [downtimeData, setDowntimeData] = useState<DowntimeRow[]>([]);
  const [expenseData, setExpenseData] = useState<ExpenseRow[]>([]);
  const [qualityData, setQualityData] = useState<QualityRow[]>([]);

  // Inline Cell Editing State
  const [editingCell, setEditingCell] = useState<{ section: string; id: number; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load datasets on mount
  useEffect(() => {
    const loadStore = (key: string, fallback: any[]) => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) return parsed;
          } catch {}
        }
      }
      return fallback;
    };

    setScrapData(loadStore('steel_erp_scrap', initialScrap));
    setFurnaceData(loadStore('steel_erp_furnace', initialFurnace));
    setBilletData(loadStore('steel_erp_billet', initialBillet));
    setRollingData(loadStore('steel_erp_rolling', initialRolling));
    setDispatchData(loadStore('steel_erp_dispatch', initialDispatch));
    setDowntimeData(loadStore('steel_erp_downtime', initialDowntime));
    setExpenseData(loadStore('steel_erp_expenses', initialExpenses));
    setQualityData(loadStore('steel_erp_quality', initialQuality));
  }, []);

  // Save specific dataset to localStorage
  const saveSection = (key: string, data: any[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  };

  // Safe Math Evaluator
  const evaluateMath = (val: string): number | string => {
    const clean = val.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;
    if (clean.startsWith('=')) {
      const expr = clean.substring(1).trim();
      if (/^[0-9.+\-*/()\s]+$/.test(expr)) {
        try {
          const res = new Function(`return (${expr})`)();
          if (typeof res === 'number' && !isNaN(res) && isFinite(res)) return parseFloat(res.toFixed(2));
        } catch {}
      }
    }
    const num = Number(clean);
    return isNaN(num) || clean === '' ? clean : num;
  };

  // Inline Cell Start
  const startEdit = (section: string, id: number, field: string, currentVal: any) => {
    setEditingCell({ section, id, field });
    setEditValue(String(currentVal ?? ''));
  };

  // Inline Cell Save
  const saveInlineEdit = (section: string, id: number, field: string, forcedValue?: string) => {
    const val = evaluateMath(forcedValue !== undefined ? forcedValue : editValue);

    if (section === 'scrap') {
      const updated = scrapData.map(r => {
        if (r.id === id) {
          const row = { ...r, [field]: val };
          const qty = Number(row.scrap_rcv_kg) || (Number(row.gross_weight || 0) - Number(row.value_tare || 0));
          const rate = Number(row.rate_per_kg) || 0;
          row.scrap_rcv_kg = qty;
          row.total_cost = qty * rate;
          return row;
        }
        return r;
      });
      setScrapData(updated);
      saveSection('steel_erp_scrap', updated);
    } else if (section === 'furnace') {
      const updated = furnaceData.map(r => {
        if (r.id === id) {
          const row = { ...r, [field]: val };
          const inp = Number(row.scrap_input_kg) || 0;
          const out = Number(row.liquid_steel_tapped_kg) || 0;
          row.yield_pct = inp > 0 ? parseFloat(((out / inp) * 100).toFixed(2)) : 0;
          return row;
        }
        return r;
      });
      setFurnaceData(updated);
      saveSection('steel_erp_furnace', updated);
    } else if (section === 'billet') {
      const updated = billetData.map(r => {
        if (r.id === id) {
          const row = { ...r, [field]: val };
          const inp = Number(row.steel_tapped_input_kg) || 0;
          const out = Number(row.billet_output_kg) || 0;
          row.billet_yield_pct = inp > 0 ? parseFloat(((out / inp) * 100).toFixed(2)) : 0;
          row.scull_loss_kg = Math.max(0, inp - out);
          return row;
        }
        return r;
      });
      setBilletData(updated);
      saveSection('steel_erp_billet', updated);
    } else if (section === 'rolling') {
      const updated = rollingData.map(r => {
        if (r.id === id) {
          const row = { ...r, [field]: val };
          const inp = Number(row.billet_input_kg) || 0;
          const out = Number(row.rod_production_kg) || 0;
          row.rod_yield_pct = inp > 0 ? parseFloat(((out / inp) * 100).toFixed(2)) : 0;
          row.rod_loss_kg = Math.max(0, inp - out);
          return row;
        }
        return r;
      });
      setRollingData(updated);
      saveSection('steel_erp_rolling', updated);
    } else if (section === 'dispatch') {
      const updated = dispatchData.map(r => {
        if (r.id === id) {
          const row = { ...r, [field]: val };
          const qty = Number(row.dispatch_qty_kg) || 0;
          const rate = Number(row.rate_per_kg) || 0;
          row.total_sales_value = qty * rate;
          return row;
        }
        return r;
      });
      setDispatchData(updated);
      saveSection('steel_erp_dispatch', updated);
    } else if (section === 'downtime') {
      const updated = downtimeData.map(r => r.id === id ? { ...r, [field]: val } : r);
      setDowntimeData(updated);
      saveSection('steel_erp_downtime', updated);
    } else if (section === 'expenses') {
      const updated = expenseData.map(r => r.id === id ? { ...r, [field]: val } : r);
      setExpenseData(updated);
      saveSection('steel_erp_expenses', updated);
    } else if (section === 'quality') {
      const updated = qualityData.map(r => {
        if (r.id === id) {
          const row: any = { ...r, [field]: val };
          const c = Number(row.pct_c) || 0;
          const mn = Number(row.pct_mn) || 0;
          const si = Number(row.pct_si) || 0;
          row.pct_ce = parseFloat((c + mn / 6 + (si / 24)).toFixed(3));
          return row;
        }
        return r;
      });
      setQualityData(updated);
      saveSection('steel_erp_quality', updated);
    }

    setEditingCell(null);
  };

  // Add Row to Any Section
  const handleAddRow = (section: string) => {
    const nextId = Date.now();
    const date = targetDate;

    if (section === 'scrap') {
      const newRow: ScrapRow = { id: nextId, date, supplier_name: 'New Scrap Supplier Ltd', scrap_category: 'HMS-1 (Heavy Melting)', scrap_rcv_kg: 20000, truck_no: 'TR-' + Math.floor(1000 + Math.random() * 9000), gross_weight: 30000, value_tare: 10000, rate_per_kg: 52, total_cost: 1040000 };
      const updated = [...scrapData, newRow];
      setScrapData(updated);
      saveSection('steel_erp_scrap', updated);
    } else if (section === 'furnace') {
      const nextHeat = `H-260824${String.fromCharCode(65 + (furnaceData.length % 26))}`;
      const newRow: FurnaceRow = { id: nextId, heat_no: nextHeat, date, furnace_no: 'Furnace 01', shift_id: activeShift, scrap_input_kg: 25000, runtime_min: 140, used_patching_powder_kg: 140, used_patching_forma_kg: 1, tapping_temp_c: 1615, liquid_steel_tapped_kg: 23200, power_consumed_kwh: 13000, furnace_master: shiftMaster, yield_pct: 92.8 };
      const updated = [...furnaceData, newRow];
      setFurnaceData(updated);
      saveSection('steel_erp_furnace', updated);
    } else if (section === 'billet') {
      const newRow: BilletRow = { id: nextId, date, furnace_no: 'Furnace 01', heat_no: furnaceData[furnaceData.length - 1]?.heat_no || 'H-260824A', billet_size_section: '100x100mm x 6m', steel_tapped_input_kg: 23200, billet_output_kg: 22600, scull_loss_kg: 600, billet_yield_pct: 97.4, billet_stock_kg: 85000 };
      const updated = [...billetData, newRow];
      setBilletData(updated);
      saveSection('steel_erp_billet', updated);
    } else if (section === 'rolling') {
      const newRow: RollingRow = { id: nextId, date, billet_input_kg: 22000, rod_size: '16MM', rod_production_kg: 21120, rod_loss_kg: 880, rod_yield_pct: 96.0, rod_stock_kg: 168000, grade: '500W' };
      const updated = [...rollingData, newRow];
      setRollingData(updated);
      saveSection('steel_erp_rolling', updated);
    } else if (section === 'dispatch') {
      const nextNum = Math.floor(100 + Math.random() * 900);
      const newRow: DispatchRow = { id: nextId, date, customer_name: 'Metro Infrastructures', contact_info: '01712-334455', order_no: `ORD-${nextNum}`, challan_no: `CH-2608${nextNum}`, vehicle_no: 'TR-' + nextNum, dispatch_qty_kg: 10000, rate_per_kg: 94, total_sales_value: 940000, payment_status: 'Paid', rod_size: '16MM' };
      const updated = [...dispatchData, newRow];
      setDispatchData(updated);
      saveSection('steel_erp_dispatch', updated);
    } else if (section === 'downtime') {
      const nextNum = Math.floor(10 + Math.random() * 90);
      const newRow: DowntimeRow = { id: nextId, date, ticket_no: `DT-${nextNum}`, equipment: 'Mill Stand 4 Pinion', billet_breakdown_min: 0, rolling_breakdown_min: 30, breakdown_category: 'Mechanical', root_cause_notes: 'Guide roller alignment', shift_code: activeShift, action_taken: 'Realigned guides' };
      const updated = [...downtimeData, newRow];
      setDowntimeData(updated);
      saveSection('steel_erp_downtime', updated);
    } else if (section === 'expenses') {
      const nextNum = Math.floor(10 + Math.random() * 90);
      const newRow: ExpenseRow = { id: nextId, date, voucher_no: `EXP-${nextNum}`, expense_head: 'Factory Electrical Maintenance', amount: 35000, paid_to: 'Power Solutions Ltd', payment_mode: 'Bank Transfer', remarks: 'Transformer maintenance', approved_by: shiftMaster };
      const updated = [...expenseData, newRow];
      setExpenseData(updated);
      saveSection('steel_erp_expenses', updated);
    } else if (section === 'quality') {
      const newRow: QualityRow = { id: nextId, sample_id: `SPL-24A-${qualityData.length + 1}`, rod_size: '16MM', grade: '500W', heat_no: 'H-260824A', testing_date: date, pct_c: 0.22, pct_mn: 0.88, pct_si: 0.24, pct_s: 0.032, pct_p: 0.036, pct_ce: 0.367, yield_strength_n_mm2: 530, tensile_strength_n_mm2: 645, elongation_pct: 18.0, bend_test_result: 'Approved', nominal_mass_g_m: 1.580 };
      const updated = [...qualityData, newRow];
      setQualityData(updated);
      saveSection('steel_erp_quality', updated);
    }

    showToast(`✓ Added new row to ${section.toUpperCase()} sheet`);
  };

  // Delete Row
  const handleDeleteRow = (section: string, id: number) => {
    if (section === 'scrap') {
      const u = scrapData.filter(r => r.id !== id); setScrapData(u); saveSection('steel_erp_scrap', u);
    } else if (section === 'furnace') {
      const u = furnaceData.filter(r => r.id !== id); setFurnaceData(u); saveSection('steel_erp_furnace', u);
    } else if (section === 'billet') {
      const u = billetData.filter(r => r.id !== id); setBilletData(u); saveSection('steel_erp_billet', u);
    } else if (section === 'rolling') {
      const u = rollingData.filter(r => r.id !== id); setRollingData(u); saveSection('steel_erp_rolling', u);
    } else if (section === 'dispatch') {
      const u = dispatchData.filter(r => r.id !== id); setDispatchData(u); saveSection('steel_erp_dispatch', u);
    } else if (section === 'downtime') {
      const u = downtimeData.filter(r => r.id !== id); setDowntimeData(u); saveSection('steel_erp_downtime', u);
    } else if (section === 'expenses') {
      const u = expenseData.filter(r => r.id !== id); setExpenseData(u); saveSection('steel_erp_expenses', u);
    } else if (section === 'quality') {
      const u = qualityData.filter(r => r.id !== id); setQualityData(u); saveSection('steel_erp_quality', u);
    }
    showToast(`Deleted row from ${section.toUpperCase()}`);
  };

  // Sync All Sections & Cloud Push
  const handleSaveAll = () => {
    saveSection('steel_erp_scrap', scrapData);
    saveSection('steel_erp_furnace', furnaceData);
    saveSection('steel_erp_billet', billetData);
    saveSection('steel_erp_rolling', rollingData);
    saveSection('steel_erp_dispatch', dispatchData);
    saveSection('steel_erp_downtime', downtimeData);
    saveSection('steel_erp_expenses', expenseData);
    saveSection('steel_erp_quality', qualityData);
    showToast('✓ All 8 plant data sheets saved and synchronized across the entire ERP!');
  };

  // Filter Helper
  const filterByDate = (dateStr: string) => {
    if (dateFilterMode === 'all') return true;
    return dateStr === targetDate;
  };

  // Section filtered data
  const filteredScrap = useMemo(() => scrapData.filter(r => filterByDate(r.date)), [scrapData, targetDate, dateFilterMode]);
  const filteredFurnace = useMemo(() => furnaceData.filter(r => filterByDate(r.date)), [furnaceData, targetDate, dateFilterMode]);
  const filteredBillet = useMemo(() => billetData.filter(r => filterByDate(r.date)), [billetData, targetDate, dateFilterMode]);
  const filteredRolling = useMemo(() => rollingData.filter(r => filterByDate(r.date)), [rollingData, targetDate, dateFilterMode]);
  const filteredDispatch = useMemo(() => dispatchData.filter(r => filterByDate(r.date)), [dispatchData, targetDate, dateFilterMode]);
  const filteredDowntime = useMemo(() => downtimeData.filter(r => filterByDate(r.date)), [downtimeData, targetDate, dateFilterMode]);
  const filteredExpenses = useMemo(() => expenseData.filter(r => filterByDate(r.date)), [expenseData, targetDate, dateFilterMode]);
  const filteredQuality = useMemo(() => qualityData.filter(r => filterByDate(r.testing_date)), [qualityData, targetDate, dateFilterMode]);

  // Overall Mass Balance Summary for current date
  const totalScrapChargedKg = filteredFurnace.reduce((sum, r) => sum + (Number(r.scrap_input_kg) || 0), 0);
  const totalLiquidSteelKg = filteredFurnace.reduce((sum, r) => sum + (Number(r.liquid_steel_tapped_kg) || 0), 0);
  const totalBilletCastKg = filteredBillet.reduce((sum, r) => sum + (Number(r.billet_output_kg) || 0), 0);
  const totalRebarRolledKg = filteredRolling.reduce((sum, r) => sum + (Number(r.rod_production_kg) || 0), 0);
  const totalDispatchKg = filteredDispatch.reduce((sum, r) => sum + (Number(r.dispatch_qty_kg) || 0), 0);
  const totalRevenueBdt = filteredDispatch.reduce((sum, r) => sum + (Number(r.total_sales_value) || 0), 0);
  const totalDowntimeMin = filteredDowntime.reduce((sum, r) => sum + (Number(r.billet_breakdown_min) || 0) + (Number(r.rolling_breakdown_min) || 0), 0);
  const totalExpensesBdt = filteredExpenses.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  // Export Daily Master Log to Excel
  const handleExportDailyExcel = () => {
    const headers = ['Category', 'Date', 'Identifier', 'Sub-Metric 1', 'Sub-Metric 2', 'Sub-Metric 3', 'Total Value (KG / ৳)'];
    const rows: any[] = [];

    filteredFurnace.forEach(f => {
      rows.push(['Furnace Melting', f.date, f.heat_no, f.furnace_no, `Runtime: ${f.runtime_min}m`, `Yield: ${f.yield_pct}%`, `${f.liquid_steel_tapped_kg} KG`]);
    });
    filteredBillet.forEach(b => {
      rows.push(['Billet CCM', b.date, b.heat_no, b.billet_size_section, `Scull: ${b.scull_loss_kg}kg`, `Yield: ${b.billet_yield_pct}%`, `${b.billet_output_kg} KG`]);
    });
    filteredRolling.forEach(r => {
      rows.push(['Hot Rolling', r.date, r.rod_size, r.grade || '500W', `Loss: ${r.rod_loss_kg}kg`, `Yield: ${r.rod_yield_pct}%`, `${r.rod_production_kg} KG`]);
    });
    filteredDispatch.forEach(d => {
      rows.push(['Sales Dispatch', d.date, d.customer_name, d.challan_no, d.rod_size, `Status: ${d.payment_status}`, `৳${d.total_sales_value}`]);
    });

    exportToExcel(headers, rows, `Daily_Master_Log_${targetDate}.csv`);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 pb-16 font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#B48F48]/40 flex items-center space-x-3 animate-zoom-in font-mono text-xs font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Corporate Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-5 print:hidden">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#B48F48] uppercase tracking-wider font-mono mb-1.5">
            <span>Plant Operations Master Sheet</span>
            <span>•</span>
            <span>Unified Cross-Departmental Input</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">All-in-One Master Data Entry</h1>
          <p className="text-sm text-slate-500 font-sans mt-0.5">
            Single centralized worksheet to enter and audit Furnace Heats, CCM Billets, Rebar Rolling, Scrap Inbound, Dispatch, Outages, and Factory Expenses in one place.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <button
            onClick={handleExportDailyExcel}
            className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export Master Sheet</span>
          </button>
          
          <button
            onClick={handleSaveAll}
            className="flex-1 md:flex-none px-5 py-2.5 bg-[#B48F48] hover:bg-[#9E7A37] text-white text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>Save & Sync All Sections</span>
          </button>
        </div>
      </div>

      {/* Date & Shift Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 bg-white border border-slate-200/90 p-4 rounded-2xl shadow-xs">
        
        {/* Date Scope Mode */}
        <div className="space-y-1.5 col-span-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Date View Scope</label>
          <select
            value={dateFilterMode}
            onChange={(e: any) => setDateFilterMode(e.target.value)}
            className="w-full bg-white border border-slate-300 text-sm px-3.5 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059] font-sans text-slate-900"
          >
            <option value="single">Single Target Date</option>
            <option value="all">Show All Date Entries</option>
          </select>
        </div>

        {/* Target Date Picker */}
        <div className="space-y-1.5 col-span-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#B48F48] font-mono">Active Target Date</label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full bg-amber-500/5 border border-[#B48F48]/40 text-sm px-3.5 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059] font-mono font-bold text-slate-900"
          />
        </div>

        {/* Shift Code */}
        <div className="space-y-1.5 col-span-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Default Shift</label>
          <select
            value={activeShift}
            onChange={(e) => setActiveShift(e.target.value)}
            className="w-full bg-white border border-slate-300 text-sm px-3.5 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059] font-sans text-slate-900"
          >
            <option value="A">Shift A (Morning 06:00 - 14:00)</option>
            <option value="B">Shift B (Evening 14:00 - 22:00)</option>
            <option value="C">Shift C (Night 22:00 - 06:00)</option>
          </select>
        </div>

        {/* Master on Duty */}
        <div className="space-y-1.5 col-span-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Shift In-Charge</label>
          <input
            type="text"
            value={shiftMaster}
            onChange={(e) => setShiftMaster(e.target.value)}
            className="w-full bg-white border border-slate-300 text-sm px-3.5 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059] font-sans text-slate-900"
          />
        </div>

        {/* Quick Save Indicator */}
        <div className="space-y-1.5 col-span-1 flex flex-col justify-end">
          <div className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-center">
            <span className="text-[11px] font-mono font-bold text-emerald-600 flex items-center justify-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Auto-Sync Active</span>
            </span>
          </div>
        </div>

      </div>

      {/* Mass Balance Quick Summary Strip for Current Date */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-2xs">
          <span className="text-[9px] font-mono uppercase text-slate-400 font-bold">Scrap Charged</span>
          <p className="text-sm font-black text-slate-900 font-mono">{(totalScrapChargedKg / 1000).toFixed(1)} MT</p>
        </div>
        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-2xs">
          <span className="text-[9px] font-mono uppercase text-slate-400 font-bold">Liquid Steel</span>
          <p className="text-sm font-black text-amber-700 font-mono">{(totalLiquidSteelKg / 1000).toFixed(1)} MT</p>
        </div>
        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-2xs">
          <span className="text-[9px] font-mono uppercase text-slate-400 font-bold">Billet Cast</span>
          <p className="text-sm font-black text-indigo-700 font-mono">{(totalBilletCastKg / 1000).toFixed(1)} MT</p>
        </div>
        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-2xs">
          <span className="text-[9px] font-mono uppercase text-slate-400 font-bold">Rebar Rolled</span>
          <p className="text-sm font-black text-emerald-700 font-mono">{(totalRebarRolledKg / 1000).toFixed(1)} MT</p>
        </div>
        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-2xs">
          <span className="text-[9px] font-mono uppercase text-slate-400 font-bold">Dispatched</span>
          <p className="text-sm font-black text-cyan-700 font-mono">{(totalDispatchKg / 1000).toFixed(1)} MT</p>
        </div>
        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-2xs">
          <span className="text-[9px] font-mono uppercase text-slate-400 font-bold">Total Invoiced</span>
          <p className="text-sm font-black text-slate-900 font-mono">৳{(totalRevenueBdt / 100000).toFixed(1)}L</p>
        </div>
        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-2xs">
          <span className="text-[9px] font-mono uppercase text-slate-400 font-bold">Downtime</span>
          <p className="text-sm font-black text-rose-600 font-mono">{totalDowntimeMin} mins</p>
        </div>
      </div>

      {/* Section Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Plant Sections' },
          { id: 'furnace', label: '1. Furnace Melting Log' },
          { id: 'billet', label: '2. Billet CCM Casting' },
          { id: 'rolling', label: '3. Hot Rolling Mill' },
          { id: 'dispatch', label: '4. Sales & Dispatch' },
          { id: 'scrap', label: '5. Scrap Sourcing' },
          { id: 'downtime', label: '6. Downtime & Outages' },
          { id: 'expenses', label: '7. Cost & Expenses' },
          { id: 'quality', label: '8. Spectro QA Lab' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#B48F48] text-white shadow-xs font-bold'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: FURNACE MELTING LOG */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'furnace') && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden space-y-3 p-5">
          <div className="flex items-center justify-between border-b border-slate-150 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <h3 className="text-sm font-bold text-slate-900 font-mono uppercase">1. Induction Furnace Melting Log</h3>
              <span className="text-xs text-slate-400 font-mono">({filteredFurnace.length} Heats Logged)</span>
            </div>
            <button
              onClick={() => handleAddRow('furnace')}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-[#B48F48] border border-[#B48F48]/30 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center space-x-1"
            >
              <span>+ Add Heat</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase font-mono text-slate-500 border-b border-slate-200">
                  <th className={cellPadding}>Date</th>
                  <th className={cellPadding}>Heat No</th>
                  <th className={cellPadding}>Furnace</th>
                  <th className={cellPadding}>Shift</th>
                  <th className={`${cellPadding} text-right`}>Scrap Input (KG)</th>
                  <th className={`${cellPadding} text-right`}>Runtime (Min)</th>
                  <th className={`${cellPadding} text-right`}>Powder (KG)</th>
                  <th className={`${cellPadding} text-right`}>Forma (Qty)</th>
                  <th className={`${cellPadding} text-right`}>Temp (°C)</th>
                  <th className={`${cellPadding} text-right font-bold text-amber-800`}>Steel Tapped (KG)</th>
                  <th className={`${cellPadding} text-right`}>Power (kWh)</th>
                  <th className={`${cellPadding} text-right font-bold text-emerald-700`}>Yield %</th>
                  <th className={`${cellPadding} text-center`}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFurnace.length === 0 ? (
                  <tr><td colSpan={13} className="text-center py-4 text-slate-400">No furnace heat logs on this date. Click "+ Add Heat" to insert.</td></tr>
                ) : (
                  filteredFurnace.map(row => (
                    <tr key={row.id} className="hover:bg-slate-50/50">
                      <td className={`${cellPadding} font-bold`}>{row.date}</td>
                      <td className={`${cellPadding} font-bold text-[#B48F48]`}>
                        {editingCell?.section === 'furnace' && editingCell.id === row.id && editingCell.field === 'heat_no' ? (
                          <input autoFocus value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={() => saveInlineEdit('furnace', row.id, 'heat_no')} className="bg-white border border-[#B48F48] px-1 py-0.5 rounded text-xs" />
                        ) : (
                          <span onClick={() => startEdit('furnace', row.id, 'heat_no', row.heat_no)} className="cursor-pointer hover:underline">{row.heat_no}</span>
                        )}
                      </td>
                      <td className={cellPadding}>{row.furnace_no}</td>
                      <td className={cellPadding}>{row.shift_id}</td>
                      <td className={`${cellPadding} text-right`}>
                        {editingCell?.section === 'furnace' && editingCell.id === row.id && editingCell.field === 'scrap_input_kg' ? (
                          <input autoFocus value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={() => saveInlineEdit('furnace', row.id, 'scrap_input_kg')} className="bg-white border border-[#B48F48] px-1 py-0.5 rounded text-xs text-right w-20" />
                        ) : (
                          <span onClick={() => startEdit('furnace', row.id, 'scrap_input_kg', row.scrap_input_kg)} className="cursor-pointer hover:underline">{row.scrap_input_kg.toLocaleString()}</span>
                        )}
                      </td>
                      <td className={`${cellPadding} text-right`}>{row.runtime_min}m</td>
                      <td className={`${cellPadding} text-right`}>{row.used_patching_powder_kg || 0}</td>
                      <td className={`${cellPadding} text-right`}>{row.used_patching_forma_kg || 0}</td>
                      <td className={`${cellPadding} text-right`}>{row.tapping_temp_c}°C</td>
                      <td className={`${cellPadding} text-right font-bold text-amber-700`}>
                        {editingCell?.section === 'furnace' && editingCell.id === row.id && editingCell.field === 'liquid_steel_tapped_kg' ? (
                          <input autoFocus value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={() => saveInlineEdit('furnace', row.id, 'liquid_steel_tapped_kg')} className="bg-white border border-[#B48F48] px-1 py-0.5 rounded text-xs text-right w-20" />
                        ) : (
                          <span onClick={() => startEdit('furnace', row.id, 'liquid_steel_tapped_kg', row.liquid_steel_tapped_kg)} className="cursor-pointer hover:underline">{row.liquid_steel_tapped_kg.toLocaleString()}</span>
                        )}
                      </td>
                      <td className={`${cellPadding} text-right`}>{row.power_consumed_kwh.toLocaleString()}</td>
                      <td className={`${cellPadding} text-right font-bold text-emerald-700`}>{row.yield_pct || 92.5}%</td>
                      <td className={`${cellPadding} text-center`}>
                        <button onClick={() => handleDeleteRow('furnace', row.id)} className="text-rose-500 hover:text-rose-700 text-xs font-bold cursor-pointer">✕</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: BILLET CCM CONTINUOUS CASTING */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'billet') && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden space-y-3 p-5">
          <div className="flex items-center justify-between border-b border-slate-150 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              <h3 className="text-sm font-bold text-slate-900 font-mono uppercase">2. Billet CCM Continuous Casting</h3>
              <span className="text-xs text-slate-400 font-mono">({filteredBillet.length} Billets Cast)</span>
            </div>
            <button
              onClick={() => handleAddRow('billet')}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center space-x-1"
            >
              <span>+ Add Billet Cast</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase font-mono text-slate-500 border-b border-slate-200">
                  <th className={cellPadding}>Date</th>
                  <th className={cellPadding}>Furnace</th>
                  <th className={cellPadding}>Heat No</th>
                  <th className={cellPadding}>Section Size</th>
                  <th className={`${cellPadding} text-right`}>Steel Input (KG)</th>
                  <th className={`${cellPadding} text-right font-bold text-indigo-700`}>Billet Output (KG)</th>
                  <th className={`${cellPadding} text-right`}>Skull Loss (KG)</th>
                  <th className={`${cellPadding} text-right font-bold text-emerald-700`}>Casting Yield</th>
                  <th className={`${cellPadding} text-right`}>Billet Yard Stock</th>
                  <th className={`${cellPadding} text-center`}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBillet.length === 0 ? (
                  <tr><td colSpan={10} className="text-center py-4 text-slate-400">No billet CCM records on this date. Click "+ Add Billet Cast" to insert.</td></tr>
                ) : (
                  filteredBillet.map(row => (
                    <tr key={row.id} className="hover:bg-slate-50/50">
                      <td className={`${cellPadding} font-bold`}>{row.date}</td>
                      <td className={cellPadding}>{row.furnace_no}</td>
                      <td className={`${cellPadding} font-bold text-slate-900`}>{row.heat_no}</td>
                      <td className={cellPadding}>
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold">
                          {row.billet_size_section}
                        </span>
                      </td>
                      <td className={`${cellPadding} text-right`}>{(row.steel_tapped_input_kg || row.billet_output_kg + row.scull_loss_kg).toLocaleString()}</td>
                      <td className={`${cellPadding} text-right font-bold text-indigo-700`}>
                        {editingCell?.section === 'billet' && editingCell.id === row.id && editingCell.field === 'billet_output_kg' ? (
                          <input autoFocus value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={() => saveInlineEdit('billet', row.id, 'billet_output_kg')} className="bg-white border border-[#B48F48] px-1 py-0.5 rounded text-xs text-right w-20" />
                        ) : (
                          <span onClick={() => startEdit('billet', row.id, 'billet_output_kg', row.billet_output_kg)} className="cursor-pointer hover:underline">{row.billet_output_kg.toLocaleString()}</span>
                        )}
                      </td>
                      <td className={`${cellPadding} text-right text-rose-600`}>{row.scull_loss_kg.toLocaleString()}</td>
                      <td className={`${cellPadding} text-right font-bold text-emerald-700`}>{row.billet_yield_pct || 97.4}%</td>
                      <td className={`${cellPadding} text-right`}>{row.billet_stock_kg.toLocaleString()} KG</td>
                      <td className={`${cellPadding} text-center`}>
                        <button onClick={() => handleDeleteRow('billet', row.id)} className="text-rose-500 hover:text-rose-700 text-xs font-bold cursor-pointer">✕</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: HOT ROLLING MILL PRODUCTION */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'rolling') && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden space-y-3 p-5">
          <div className="flex items-center justify-between border-b border-slate-150 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <h3 className="text-sm font-bold text-slate-900 font-mono uppercase">3. Hot Rebar Rolling Mill Production</h3>
              <span className="text-xs text-slate-400 font-mono">({filteredRolling.length} Roll Runs)</span>
            </div>
            <button
              onClick={() => handleAddRow('rolling')}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center space-x-1"
            >
              <span>+ Add Rolling Run</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase font-mono text-slate-500 border-b border-slate-200">
                  <th className={cellPadding}>Date</th>
                  <th className={cellPadding}>Rod Diameter</th>
                  <th className={cellPadding}>Grade</th>
                  <th className={`${cellPadding} text-right`}>Billet Charged (KG)</th>
                  <th className={`${cellPadding} text-right font-bold text-emerald-700`}>Rebar Produced (KG)</th>
                  <th className={`${cellPadding} text-right`}>Scale/Loss (KG)</th>
                  <th className={`${cellPadding} text-right font-bold text-emerald-700`}>Rolling Yield</th>
                  <th className={`${cellPadding} text-right`}>Finished Stock (KG)</th>
                  <th className={`${cellPadding} text-center`}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRolling.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-4 text-slate-400">No rolling production entries on this date. Click "+ Add Rolling Run" to insert.</td></tr>
                ) : (
                  filteredRolling.map(row => (
                    <tr key={row.id} className="hover:bg-slate-50/50">
                      <td className={`${cellPadding} font-bold`}>{row.date}</td>
                      <td className={cellPadding}>
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          {row.rod_size}
                        </span>
                      </td>
                      <td className={cellPadding}>{row.grade || '500W'}</td>
                      <td className={`${cellPadding} text-right`}>{row.billet_input_kg.toLocaleString()}</td>
                      <td className={`${cellPadding} text-right font-bold text-emerald-700`}>
                        {editingCell?.section === 'rolling' && editingCell.id === row.id && editingCell.field === 'rod_production_kg' ? (
                          <input autoFocus value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={() => saveInlineEdit('rolling', row.id, 'rod_production_kg')} className="bg-white border border-[#B48F48] px-1 py-0.5 rounded text-xs text-right w-20" />
                        ) : (
                          <span onClick={() => startEdit('rolling', row.id, 'rod_production_kg', row.rod_production_kg)} className="cursor-pointer hover:underline">{row.rod_production_kg.toLocaleString()}</span>
                        )}
                      </td>
                      <td className={`${cellPadding} text-right text-rose-600`}>{row.rod_loss_kg.toLocaleString()}</td>
                      <td className={`${cellPadding} text-right font-bold text-emerald-700`}>{row.rod_yield_pct || 96.0}%</td>
                      <td className={`${cellPadding} text-right font-bold text-slate-800`}>{row.rod_stock_kg.toLocaleString()}</td>
                      <td className={`${cellPadding} text-center`}>
                        <button onClick={() => handleDeleteRow('rolling', row.id)} className="text-rose-500 hover:text-rose-700 text-xs font-bold cursor-pointer">✕</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: SALES DISPATCH & CHALLANS */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'dispatch') && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden space-y-3 p-5">
          <div className="flex items-center justify-between border-b border-slate-150 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
              <h3 className="text-sm font-bold text-slate-900 font-mono uppercase">4. Sales Dispatch & Customer Orders</h3>
              <span className="text-xs text-slate-400 font-mono">({filteredDispatch.length} Shipments)</span>
            </div>
            <button
              onClick={() => handleAddRow('dispatch')}
              className="px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center space-x-1"
            >
              <span>+ Add Delivery Order</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase font-mono text-slate-500 border-b border-slate-200">
                  <th className={cellPadding}>Date</th>
                  <th className={cellPadding}>Customer</th>
                  <th className={cellPadding}>Order No</th>
                  <th className={cellPadding}>Challan No</th>
                  <th className={cellPadding}>Vehicle No</th>
                  <th className={cellPadding}>Rod Size</th>
                  <th className={`${cellPadding} text-right`}>Dispatch Qty (KG)</th>
                  <th className={`${cellPadding} text-right`}>Rate/KG</th>
                  <th className={`${cellPadding} text-right font-bold text-slate-900`}>Total Amount (৳)</th>
                  <th className={`${cellPadding} text-center`}>Status</th>
                  <th className={`${cellPadding} text-center`}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDispatch.length === 0 ? (
                  <tr><td colSpan={11} className="text-center py-4 text-slate-400">No dispatch orders on this date. Click "+ Add Delivery Order" to insert.</td></tr>
                ) : (
                  filteredDispatch.map(row => (
                    <tr key={row.id} className="hover:bg-slate-50/50">
                      <td className={`${cellPadding} font-bold`}>{row.date}</td>
                      <td className={`${cellPadding} font-bold text-slate-850`}>
                        {editingCell?.section === 'dispatch' && editingCell.id === row.id && editingCell.field === 'customer_name' ? (
                          <input autoFocus value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={() => saveInlineEdit('dispatch', row.id, 'customer_name')} className="bg-white border border-[#B48F48] px-1 py-0.5 rounded text-xs" />
                        ) : (
                          <span onClick={() => startEdit('dispatch', row.id, 'customer_name', row.customer_name)} className="cursor-pointer hover:underline">{row.customer_name}</span>
                        )}
                      </td>
                      <td className={`${cellPadding} text-[#B48F48] font-bold`}>{row.order_no}</td>
                      <td className={cellPadding}>{row.challan_no}</td>
                      <td className={cellPadding}>{row.vehicle_no}</td>
                      <td className={cellPadding}>{row.rod_size}</td>
                      <td className={`${cellPadding} text-right font-bold`}>{row.dispatch_qty_kg.toLocaleString()}</td>
                      <td className={`${cellPadding} text-right`}>৳{row.rate_per_kg}</td>
                      <td className={`${cellPadding} text-right font-bold text-slate-900`}>৳{row.total_sales_value.toLocaleString()}</td>
                      <td className={`${cellPadding} text-center`}>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                          row.payment_status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          row.payment_status === 'Partial' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {row.payment_status}
                        </span>
                      </td>
                      <td className={`${cellPadding} text-center`}>
                        <button onClick={() => handleDeleteRow('dispatch', row.id)} className="text-rose-500 hover:text-rose-700 text-xs font-bold cursor-pointer">✕</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 5: RAW SCRAP SOURCING & INBOUND */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'scrap') && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden space-y-3 p-5">
          <div className="flex items-center justify-between border-b border-slate-150 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
              <h3 className="text-sm font-bold text-slate-900 font-mono uppercase">5. Raw Scrap Sourcing & Inbound Intake</h3>
              <span className="text-xs text-slate-400 font-mono">({filteredScrap.length} Inbound Trucks)</span>
            </div>
            <button
              onClick={() => handleAddRow('scrap')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center space-x-1"
            >
              <span>+ Add Scrap Truck</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase font-mono text-slate-500 border-b border-slate-200">
                  <th className={cellPadding}>Date</th>
                  <th className={cellPadding}>Supplier Name</th>
                  <th className={cellPadding}>Scrap Grade</th>
                  <th className={cellPadding}>Truck No</th>
                  <th className={`${cellPadding} text-right`}>Gross Wt</th>
                  <th className={`${cellPadding} text-right`}>Tare Wt</th>
                  <th className={`${cellPadding} text-right font-bold text-slate-900`}>Net Scrap (KG)</th>
                  <th className={`${cellPadding} text-right`}>Rate/KG</th>
                  <th className={`${cellPadding} text-right font-bold text-slate-900`}>Total Cost (৳)</th>
                  <th className={`${cellPadding} text-center`}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredScrap.length === 0 ? (
                  <tr><td colSpan={10} className="text-center py-4 text-slate-400">No scrap inbound records on this date. Click "+ Add Scrap Truck" to insert.</td></tr>
                ) : (
                  filteredScrap.map(row => (
                    <tr key={row.id} className="hover:bg-slate-50/50">
                      <td className={`${cellPadding} font-bold`}>{row.date}</td>
                      <td className={`${cellPadding} font-bold text-slate-850`}>{row.supplier_name}</td>
                      <td className={cellPadding}>{row.scrap_category}</td>
                      <td className={cellPadding}>{row.truck_no}</td>
                      <td className={`${cellPadding} text-right`}>{row.gross_weight?.toLocaleString()}</td>
                      <td className={`${cellPadding} text-right`}>{row.value_tare?.toLocaleString()}</td>
                      <td className={`${cellPadding} text-right font-bold text-slate-900`}>{row.scrap_rcv_kg.toLocaleString()}</td>
                      <td className={`${cellPadding} text-right`}>৳{row.rate_per_kg}</td>
                      <td className={`${cellPadding} text-right font-bold text-slate-900`}>৳{(row.total_cost || row.scrap_rcv_kg * row.rate_per_kg).toLocaleString()}</td>
                      <td className={`${cellPadding} text-center`}>
                        <button onClick={() => handleDeleteRow('scrap', row.id)} className="text-rose-500 hover:text-rose-700 text-xs font-bold cursor-pointer">✕</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 6: DOWNTIME & BREAKDOWN INCIDENTS */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'downtime') && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden space-y-3 p-5">
          <div className="flex items-center justify-between border-b border-slate-150 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <h3 className="text-sm font-bold text-slate-900 font-mono uppercase">6. Downtime & Outage Incidents</h3>
              <span className="text-xs text-slate-400 font-mono">({filteredDowntime.length} Stoppage Events)</span>
            </div>
            <button
              onClick={() => handleAddRow('downtime')}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center space-x-1"
            >
              <span>+ Add Downtime</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase font-mono text-slate-500 border-b border-slate-200">
                  <th className={cellPadding}>Date</th>
                  <th className={cellPadding}>Ticket No</th>
                  <th className={cellPadding}>Equipment / Machine</th>
                  <th className={cellPadding}>Category</th>
                  <th className={`${cellPadding} text-right`}>Melt Shop (Min)</th>
                  <th className={`${cellPadding} text-right`}>Rolling Mill (Min)</th>
                  <th className={cellPadding}>Root Cause</th>
                  <th className={cellPadding}>Action Taken</th>
                  <th className={`${cellPadding} text-center`}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDowntime.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-4 text-slate-400">No downtime recorded on this date. Click "+ Add Downtime" to insert.</td></tr>
                ) : (
                  filteredDowntime.map(row => (
                    <tr key={row.id} className="hover:bg-slate-50/50">
                      <td className={`${cellPadding} font-bold`}>{row.date}</td>
                      <td className={`${cellPadding} font-bold text-rose-600`}>{row.ticket_no}</td>
                      <td className={`${cellPadding} font-bold text-slate-800`}>{row.equipment}</td>
                      <td className={cellPadding}>{row.breakdown_category}</td>
                      <td className={`${cellPadding} text-right text-rose-600 font-bold`}>{row.billet_breakdown_min}m</td>
                      <td className={`${cellPadding} text-right text-indigo-600 font-bold`}>{row.rolling_breakdown_min}m</td>
                      <td className={cellPadding}>{row.root_cause_notes}</td>
                      <td className={cellPadding}>{row.action_taken || 'Inspected & Rectified'}</td>
                      <td className={`${cellPadding} text-center`}>
                        <button onClick={() => handleDeleteRow('downtime', row.id)} className="text-rose-500 hover:text-rose-700 text-xs font-bold cursor-pointer">✕</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 7: FACTORY EXPENSES & VOUCHERS */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'expenses') && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden space-y-3 p-5">
          <div className="flex items-center justify-between border-b border-slate-150 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span>
              <h3 className="text-sm font-bold text-slate-900 font-mono uppercase">7. Factory Daily Cost & Expenses</h3>
              <span className="text-xs text-slate-400 font-mono">({filteredExpenses.length} Vouchers)</span>
            </div>
            <button
              onClick={() => handleAddRow('expenses')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center space-x-1"
            >
              <span>+ Add Expense Voucher</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase font-mono text-slate-500 border-b border-slate-200">
                  <th className={cellPadding}>Date</th>
                  <th className={cellPadding}>Voucher No</th>
                  <th className={cellPadding}>Expense Head</th>
                  <th className={cellPadding}>Paid To</th>
                  <th className={`${cellPadding} text-right font-bold text-rose-700`}>Amount (৳)</th>
                  <th className={cellPadding}>Mode</th>
                  <th className={cellPadding}>Remarks</th>
                  <th className={`${cellPadding} text-center`}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-4 text-slate-400">No expense vouchers on this date. Click "+ Add Expense Voucher" to insert.</td></tr>
                ) : (
                  filteredExpenses.map(row => (
                    <tr key={row.id} className="hover:bg-slate-50/50">
                      <td className={`${cellPadding} font-bold`}>{row.date}</td>
                      <td className={`${cellPadding} font-bold text-[#B48F48]`}>{row.voucher_no}</td>
                      <td className={`${cellPadding} font-bold text-slate-800`}>{row.expense_head}</td>
                      <td className={cellPadding}>{row.paid_to}</td>
                      <td className={`${cellPadding} text-right font-bold text-rose-700`}>৳{row.amount.toLocaleString()}</td>
                      <td className={cellPadding}>{row.payment_mode}</td>
                      <td className={cellPadding}>{row.remarks}</td>
                      <td className={`${cellPadding} text-center`}>
                        <button onClick={() => handleDeleteRow('expenses', row.id)} className="text-rose-500 hover:text-rose-700 text-xs font-bold cursor-pointer">✕</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 8: OES SPECTROMETER LAB TESTS */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'quality') && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden space-y-3 p-5">
          <div className="flex items-center justify-between border-b border-slate-150 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <h3 className="text-sm font-bold text-slate-900 font-mono uppercase">8. OES Spectrometer Chemistry & QA Testing</h3>
              <span className="text-xs text-slate-400 font-mono">({filteredQuality.length} Samples)</span>
            </div>
            <button
              onClick={() => handleAddRow('quality')}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center space-x-1"
            >
              <span>+ Add QA Sample</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase font-mono text-slate-500 border-b border-slate-200">
                  <th className={cellPadding}>Testing Date</th>
                  <th className={cellPadding}>Sample ID</th>
                  <th className={cellPadding}>Heat Link</th>
                  <th className={cellPadding}>Rod Size</th>
                  <th className={`${cellPadding} text-right`}>%C (&lt;0.25)</th>
                  <th className={`${cellPadding} text-right`}>%Mn (&lt;1.0)</th>
                  <th className={`${cellPadding} text-right`}>%Si (&lt;0.30)</th>
                  <th className={`${cellPadding} text-right font-bold text-emerald-700`}>Carbon Eq (CE)</th>
                  <th className={`${cellPadding} text-center`}>Bend Test</th>
                  <th className={`${cellPadding} text-center`}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQuality.length === 0 ? (
                  <tr><td colSpan={10} className="text-center py-4 text-slate-400">No QA lab samples tested on this date. Click "+ Add QA Sample" to insert.</td></tr>
                ) : (
                  filteredQuality.map(row => (
                    <tr key={row.sample_id} className="hover:bg-slate-50/50">
                      <td className={`${cellPadding} font-bold`}>{row.testing_date}</td>
                      <td className={`${cellPadding} font-bold text-slate-900`}>{row.sample_id}</td>
                      <td className={cellPadding}>{row.heat_no}</td>
                      <td className={cellPadding}>{row.rod_size}</td>
                      <td className={`${cellPadding} text-right`}>{row.pct_c}%</td>
                      <td className={`${cellPadding} text-right`}>{row.pct_mn}%</td>
                      <td className={`${cellPadding} text-right`}>{row.pct_si}%</td>
                      <td className={`${cellPadding} text-right font-bold text-emerald-700`}>{row.pct_ce}%</td>
                      <td className={`${cellPadding} text-center`}>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {row.bend_test_result}
                        </span>
                      </td>
                      <td className={`${cellPadding} text-center`}>
                        <button onClick={() => handleDeleteRow('quality', Number(row.id || 0))} className="text-rose-500 hover:text-rose-700 text-xs font-bold cursor-pointer">✕</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
