'use client';
import { exportToExcel } from '@/lib/excelExport';

import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

// Core Seed Data (fully local for fallback)
const initialScrapData = [
  { id: 1, date: '2026-08-20', supplier_name: 'Metal Recyclers Corp', scrap_category: 'LC Scrap', scrap_rcv_kg: 15000, truck_no: 'TR-1024', gross_weight: 24500, value_tare: 9500, rate_per_kg: 42, total_cost: 630000, yard_location: 'Bay A' },
  { id: 2, date: '2026-08-21', supplier_name: 'Apex Scrap Suppliers', scrap_category: 'Rolling Kechi', scrap_rcv_kg: 12800, truck_no: 'TR-8812', gross_weight: 22000, value_tare: 9200, rate_per_kg: 44, total_cost: 563200, yard_location: 'Bay B' },
  { id: 3, date: '2026-08-22', supplier_name: 'Alpha Alloys', scrap_category: 'Plate Cutting', scrap_rcv_kg: 9500, truck_no: 'TR-5034', gross_weight: 18500, value_tare: 9000, rate_per_kg: 40, total_cost: 380000, yard_location: 'Bay A' },
  { id: 4, date: '2026-08-23', supplier_name: 'Apex Scrap Suppliers', scrap_category: 'LC Scrap', scrap_rcv_kg: 16500, truck_no: 'TR-2041', gross_weight: 26000, value_tare: 9500, rate_per_kg: 42, total_cost: 693000, yard_location: 'Bay B' }
];

const initialFurnaceLogs = [
  { id: 1, date: '2026-08-20', furnace_no: 'Furnace 01', heat_no: 'H-260820A', scrap_input_kg: 12000, runtime_min: 52, used_patching_powder_kg: 150, used_patching_forma_kg: 1, tapping_temp_c: 1540, liquid_steel_tapped_kg: 10800, power_consumed_kwh: 7200, shift_id: 'A', furnace_master: 'Kabir Ahmed', yield_pct: 90.0 },
  { id: 2, date: '2026-08-21', furnace_no: 'Furnace 01', heat_no: 'H-260821A', scrap_input_kg: 13000, runtime_min: 55, used_patching_powder_kg: 180, used_patching_forma_kg: 1, tapping_temp_c: 1560, liquid_steel_tapped_kg: 11440, power_consumed_kwh: 7800, shift_id: 'B', furnace_master: 'Zahirul Haque', yield_pct: 88.0 },
  { id: 3, date: '2026-08-22', furnace_no: 'Furnace 02', heat_no: 'H-260822A', scrap_input_kg: 11500, runtime_min: 48, used_patching_powder_kg: 120, used_patching_forma_kg: 0, tapping_temp_c: 1550, liquid_steel_tapped_kg: 10465, power_consumed_kwh: 6900, shift_id: 'C', furnace_master: 'Ataur Rahman', yield_pct: 91.0 },
  { id: 4, date: '2026-08-23', furnace_no: 'Furnace 01', heat_no: 'H-260823A', scrap_input_kg: 12500, runtime_min: 50, used_patching_powder_kg: 140, used_patching_forma_kg: 1, tapping_temp_c: 1545, liquid_steel_tapped_kg: 11250, power_consumed_kwh: 7500, shift_id: 'A', furnace_master: 'Kabir Ahmed', yield_pct: 90.0 }
];

const initialBilletData = [
  { id: 1, date: '2026-08-20', billet_size_section: '100x100mm x 6m', billet_output_kg: 10500, scull_loss_kg: 1500, billet_yield_pct: 87.5, billet_stock_kg: 50000, heat_no: 'H-260820A' },
  { id: 2, date: '2026-08-21', billet_size_section: '130x130mm x 6m', billet_output_kg: 11100, scull_loss_kg: 1900, billet_yield_pct: 85.38, billet_stock_kg: 61100, heat_no: 'H-260821A' },
  { id: 3, date: '2026-08-22', billet_size_section: '100x100mm x 6m', billet_output_kg: 10200, scull_loss_kg: 1300, billet_yield_pct: 88.7, billet_stock_kg: 71300, heat_no: 'H-260822A' },
  { id: 4, date: '2026-08-23', billet_size_section: '100x100mm x 6m', billet_output_kg: 11000, scull_loss_kg: 1500, billet_yield_pct: 88.0, billet_stock_kg: 82300, heat_no: 'H-260823A' }
];

const initialRollingData = [
  { id: 1, date: '2026-08-20', billet_input_kg: 10000, rod_size: '12MM', rod_production_kg: 9600, rod_loss_kg: 400, rod_yield_pct: 96, rod_stock_kg: 145000 },
  { id: 2, date: '2026-08-21', billet_input_kg: 11000, rod_size: '16MM', rod_production_kg: 10580, rod_loss_kg: 420, rod_yield_pct: 96.18, rod_stock_kg: 155580 },
  { id: 3, date: '2026-08-22', billet_input_kg: 10000, rod_size: '20MM', rod_production_kg: 9550, rod_loss_kg: 450, rod_yield_pct: 95.5, rod_stock_kg: 165130 },
  { id: 4, date: '2026-08-23', billet_input_kg: 10500, rod_size: '12MM', rod_production_kg: 10100, rod_loss_kg: 400, rod_yield_pct: 96.19, rod_stock_kg: 175230 }
];

const initialDispatchData = [
  { id: 1, date: '2026-08-20', customer_name: 'Metro Infrastructures', contact_info: '01712-334455', order_no: 'ORD-502', challan_no: 'CH-260820A', vehicle_no: 'TR-2005', dispatch_qty_kg: 8000, rate_per_kg: 92, total_sales_value: 736000, payment_status: 'Paid', rod_size: '12MM' },
  { id: 2, date: '2026-08-21', customer_name: 'Bengal Housing Ltd', contact_info: '01715-667788', order_no: 'ORD-503', challan_no: 'CH-260821A', vehicle_no: 'TR-1049', dispatch_qty_kg: 12000, rate_per_kg: 94, total_sales_value: 1128000, payment_status: 'Partial', rod_size: '16MM' },
  { id: 3, date: '2026-08-22', customer_name: 'Sikder Builders', contact_info: '01819-223344', order_no: 'ORD-504', challan_no: 'CH-260822A', vehicle_no: 'TR-7720', dispatch_qty_kg: 9500, rate_per_kg: 92, total_sales_value: 874000, payment_status: 'Pending', rod_size: '20MM' },
  { id: 4, date: '2026-08-23', customer_name: 'Metro Infrastructures', contact_info: '01712-334455', order_no: 'ORD-505', challan_no: 'CH-260823A', vehicle_no: 'TR-3011', dispatch_qty_kg: 10000, rate_per_kg: 93, total_sales_value: 930000, payment_status: 'Paid', rod_size: '12MM' }
];

const initialDowntimeData = [
  { id: 1, date: '2026-08-20', ticket_no: 'TKT-2608-01', equipment: 'CCM Mold Stirrer', billet_breakdown_min: 45, rolling_breakdown_min: 0, breakdown_category: 'Electrical', root_cause_notes: 'CCM mold stirrer sensor replacement', shift_code: 'A', action_taken: 'Replaced inductive sensor' },
  { id: 2, date: '2026-08-21', ticket_no: 'TKT-2608-02', equipment: 'Sizing Blocks', billet_breakdown_min: 0, rolling_breakdown_min: 90, breakdown_category: 'Roll Changing', root_cause_notes: 'Scheduled changeover to 16MM guide rolls', shift_code: 'B', action_taken: 'Replaced 12mm sizing blocks' },
  { id: 3, date: '2026-08-22', ticket_no: 'TKT-2608-03', equipment: 'Ladle Nozzle', billet_breakdown_min: 30, rolling_breakdown_min: 0, breakdown_category: 'Mechanical', root_cause_notes: 'Ladle slide-gate nozzle alignment checks', shift_code: 'C', action_taken: 'Re-aligned cylinder guides' }
];

const initialExpenseData = [
  { id: 1, date: '2026-08-20', voucher_no: 'EXP-260820-01', expense_head: 'Furnace Refractory Consumables', amount: 154000, paid_to: 'Refractory Solutions Ltd', payment_mode: 'Bank Transfer', remarks: 'Patching powder shipment payment', approved_by: 'B. H. Chowdhury' },
  { id: 2, date: '2026-08-21', voucher_no: 'EXP-260821-01', expense_head: 'Electricity Utilities Billing', amount: 170400, paid_to: 'DPDC Power Authority', payment_mode: 'Bank Transfer', remarks: 'Daily factory power charge clearance', approved_by: 'B. H. Chowdhury' },
  { id: 3, date: '2026-08-22', voucher_no: 'EXP-260822-01', expense_head: 'Office Stationary & Spares', amount: 12500, paid_to: 'Karim Stationery Store', payment_mode: 'Cash', remarks: 'Control room paper and logbooks purchase', approved_by: 'Masum Billah' }
];

const initialQualityData = [
  { id: 1, sample_id: 'SPL-20A', rod_size: '12MM', grade: '500W', heat_no: 'H-260820A', testing_date: '2026-08-20', pct_c: 0.22, pct_mn: 0.85, pct_si: 0.24, pct_s: 0.035, pct_p: 0.038, pct_ce: 0.37, yield_strength_n_mm2: 520, tensile_strength_n_mm2: 635, elongation_pct: 18, bend_test_result: 'Approved', nominal_mass_g_m: 0.888 },
  { id: 2, sample_id: 'SPL-21A', rod_size: '16MM', grade: '500W', heat_no: 'H-260821A', testing_date: '2026-08-21', pct_c: 0.24, pct_mn: 0.90, pct_si: 0.26, pct_s: 0.040, pct_p: 0.042, pct_ce: 0.40, yield_strength_n_mm2: 535, tensile_strength_n_mm2: 650, elongation_pct: 17, bend_test_result: 'Approved', nominal_mass_g_m: 1.580 },
  { id: 3, sample_id: 'SPL-22A', rod_size: '20MM', grade: '500W', heat_no: 'H-260822A', testing_date: '2026-08-22', pct_c: 0.21, pct_mn: 0.82, pct_si: 0.22, pct_s: 0.030, pct_p: 0.032, pct_ce: 0.35, yield_strength_n_mm2: 512, tensile_strength_n_mm2: 622, elongation_pct: 19, bend_test_result: 'Approved', nominal_mass_g_m: 2.470 }
];

export default function ReportsAndAnalyticsPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';

  // Local state datasets initialized dynamically from localStorage
  const [scrapData, setScrapData] = useState<any[]>([]);
  const [furnaceLogs, setFurnaceLogs] = useState<any[]>([]);
  const [billetData, setBilletData] = useState<any[]>([]);
  const [rollingData, setRollingData] = useState<any[]>([]);
  const [dispatchData, setDispatchData] = useState<any[]>([]);
  const [downtimeData, setDowntimeData] = useState<any[]>([]);
  const [expenseData, setExpenseData] = useState<any[]>([]);
  const [qualityData, setQualityData] = useState<any[]>([]);

  // Selected Filters State
  const [selectedReportType, setSelectedReportType] = useState<string>('daily-production');
  const [dateRange, setDateRange] = useState<string>('this-month');
  const [startDate, setStartDate] = useState<string>('2026-08-01');
  const [endDate, setEndDate] = useState<string>('2026-08-31');
  const [viewMode, setViewMode] = useState<'table' | 'charts'>('table');

  // Custom Builder State
  const [customSources, setCustomSources] = useState<string[]>([]);
  const [customColumns, setCustomColumns] = useState<string[]>([]);

  // Active generation states - automatically derived from selection state
  const activeReportType = selectedReportType;
  const activeStartDate = startDate;
  const activeEndDate = endDate;

  const cellPadding = isCompact ? 'px-3 py-1.5 text-[11px]' : 'px-4 py-2.5 text-xs';

  // Load from localStorage on mount
  useEffect(() => {
    const loadStore = (key: string, seed: any) => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            return JSON.parse(stored);
          } catch {
            return seed;
          }
        }
      }
      return seed;
    };
    setScrapData(loadStore('steel_erp_scrap', initialScrapData));
    setFurnaceLogs(loadStore('steel_erp_furnace', initialFurnaceLogs));
    setBilletData(loadStore('steel_erp_billet', initialBilletData));
    setRollingData(loadStore('steel_erp_rolling', initialRollingData));
    setDispatchData(loadStore('steel_erp_dispatch', initialDispatchData));
    setDowntimeData(loadStore('steel_erp_downtime', initialDowntimeData));
    setExpenseData(loadStore('steel_erp_expenses', initialExpenseData));
    setQualityData(loadStore('steel_erp_quality', initialQualityData));
  }, []);

  // Quick Range Picker Handler
  const handleRangeChange = (range: string) => {
    setDateRange(range);
    if (range === 'today') {
      setStartDate('2026-08-23');
      setEndDate('2026-08-23');
    } else if (range === 'this-week') {
      setStartDate('2026-08-17');
      setEndDate('2026-08-23');
    } else if (range === 'this-month') {
      setStartDate('2026-08-01');
      setEndDate('2026-08-31');
    }
  };



  // Date Filtering Helper
  const filterByDates = (itemDate: string) => {
    return itemDate >= activeStartDate && itemDate <= activeEndDate;
  };

  // Dynamic Calculations for Reports
  const reportData = useMemo(() => {
    const scrap = scrapData.filter(d => filterByDates(d.date));
    const furnace = furnaceLogs.filter(d => filterByDates(d.date));
    const billet = billetData.filter(d => filterByDates(d.date));
    const rolling = rollingData.filter(d => filterByDates(d.date));
    const dispatch = dispatchData.filter(d => filterByDates(d.date));
    const downtime = downtimeData.filter(d => filterByDates(d.date));
    const expenses = expenseData.filter(d => filterByDates(d.date));
    const quality = qualityData.filter(d => filterByDates(d.testing_date));

    // 1. Daily Production Sheet
    if (activeReportType === 'daily-production') {
      const dates = Array.from(new Set([
        ...scrap.map(d => d.date),
        ...furnace.map(d => d.date),
        ...billet.map(d => d.date),
        ...rolling.map(d => d.date),
        ...dispatch.map(d => d.date)
      ])).sort();

      return dates.map(dt => {
        const scQty = scrap.filter(s => s.date === dt).reduce((sum, s) => sum + (s.scrap_rcv_kg || 0), 0) / 1000;
        const scInput = furnace.filter(f => f.date === dt).reduce((sum, f) => sum + (f.scrap_input_kg || 0), 0) / 1000;
        const fnHeats = furnace.filter(f => f.date === dt).length;
        const runtimeHours = furnace.filter(f => f.date === dt).reduce((sum, f) => sum + (f.runtime_min || 0), 0) / 60;
        const ccmQty = billet.filter(b => b.date === dt).reduce((sum, b) => sum + (b.billet_output_kg || 0), 0) / 1000;
        const scrapLoss = Math.max(0, scInput - ccmQty);
        const billetYield = scInput > 0 ? (ccmQty / scInput) * 100 : 0;
        const rollQty = rolling.filter(r => r.date === dt).reduce((sum, r) => sum + (r.rod_production_kg || 0), 0) / 1000;
        const rodLoss = Math.max(0, ccmQty - rollQty);
        const rodYield = ccmQty > 0 ? (rollQty / ccmQty) * 100 : 0;
        const dsQty = dispatch.filter(d => d.date === dt).reduce((sum, d) => sum + (d.dispatch_qty_kg || 0), 0) / 1000;

        return {
          date: dt,
          scrap_rcv_mt: scQty,
          scrap_input_mt: scInput,
          heats_count: fnHeats,
          runtime_hours: runtimeHours,
          billet_output_mt: ccmQty,
          scrap_loss_mt: scrapLoss,
          billet_yield_pct: billetYield,
          rod_output_mt: rollQty,
          rod_loss_mt: rodLoss,
          rod_yield_pct: rodYield,
          dispatch_mt: dsQty
        };
      }).filter(r => r.date >= activeStartDate && r.date <= activeEndDate);
    }

    // 2. Monthly Executive Summary
    if (activeReportType === 'monthly-executive') {
      const totalScrap = scrap.reduce((sum, s) => sum + (s.scrap_rcv_kg || 0), 0) / 1000;
      const totalBillet = billet.reduce((sum, b) => sum + (b.billet_output_kg || 0), 0) / 1000;
      const totalRod = rolling.reduce((sum, r) => sum + (r.rod_production_kg || 0), 0) / 1000;
      const totalDispatch = dispatch.reduce((sum, d) => sum + (d.dispatch_qty_kg || 0), 0) / 1000;
      const totalExp = expenses.reduce((sum, e) => sum + (e.amount_bdt || e.amount || e.expenses || 0), 0);

      return [{
        month: 'August 2026',
        scrap_mt: totalScrap,
        billet_mt: totalBillet,
        rod_mt: totalRod,
        dispatch_mt: totalDispatch,
        expenses_val: totalExp
      }];
    }

    // 3. Party-Wise Customer Ledger
    if (activeReportType === 'party-customer') {
      const parties: { [key: string]: any } = {};
      dispatch.forEach(d => {
        if (!parties[d.customer_name]) {
          parties[d.customer_name] = { 
            customer_name: d.customer_name, 
            contact_info: d.contact_info || 'N/A',
            total_qty_mt: 0, 
            total_sales: 0, 
            paid: 0, 
            pending: 0, 
            challans: [] 
          };
        }
        parties[d.customer_name].total_qty_mt += (d.dispatch_qty_kg || 0) / 1000;
        parties[d.customer_name].total_sales += d.total_sales_value || (d.dispatch_qty_kg * d.rate_per_kg) || 0;
        
        // Paid Amount sum
        if (d.payment_status === 'Paid') {
          parties[d.customer_name].paid += d.total_sales_value || 0;
        } else if (d.payment_status === 'Partial') {
          parties[d.customer_name].paid += (d.total_sales_value || 0) * 0.5;
          parties[d.customer_name].pending += (d.total_sales_value || 0) * 0.5;
        } else {
          parties[d.customer_name].pending += d.total_sales_value || 0;
        }
        if (d.challan_no && !parties[d.customer_name].challans.includes(d.challan_no)) {
          parties[d.customer_name].challans.push(d.challan_no);
        }
      });

      return Object.values(parties);
    }

    // 4. Supplier Scrap Summary
    if (activeReportType === 'supplier-scrap') {
      const suppliers: { [key: string]: any } = {};
      scrap.forEach(s => {
        const key = `${s.supplier_name}-${s.scrap_category}`;
        if (!suppliers[key]) {
          suppliers[key] = { supplier_name: s.supplier_name, scrap_category: s.scrap_category, total_qty_mt: 0, total_cost: 0 };
        }
        suppliers[key].total_qty_mt += (s.scrap_rcv_kg || 0) / 1000;
        suppliers[key].total_cost += s.total_cost || 0;
      });
      return Object.values(suppliers);
    }

    // 5. Size-Wise Rebar Production Report
    if (activeReportType === 'size-wise-rebar') {
      const sizes: { [key: string]: any } = {};
      rolling.forEach(r => {
        if (!sizes[r.rod_size]) {
          sizes[r.rod_size] = { rod_size: r.rod_size, billet_input_mt: 0, production_mt: 0, loss_mt: 0, avg_yield_pct: 0, runs: 0 };
        }
        sizes[r.rod_size].billet_input_mt += (r.billet_input_kg || 0) / 1000;
        sizes[r.rod_size].production_mt += (r.rod_production_kg || 0) / 1000;
        sizes[r.rod_size].loss_mt += (r.rod_loss_kg || 0) / 1000;
        sizes[r.rod_size].avg_yield_pct += r.rod_yield_pct || 0;
        sizes[r.rod_size].runs += 1;
      });

      return Object.values(sizes).map((s: any) => ({
        ...s,
        avg_yield_pct: parseFloat((s.avg_yield_pct / s.runs).toFixed(2))
      }));
    }

    // 6. Billet Casting Heat Log
    if (activeReportType === 'billet-casting') {
      return billet.map(b => {
        const bHeat = (b.heat_no || '').toLowerCase().trim();
        const matchingHeat = furnaceLogs.find(f => (f.heat_no || '').toLowerCase().trim() === bHeat) || { furnace_no: 'N/A', scrap_input_kg: b.billet_output_kg + b.scull_loss_kg, runtime_min: 0 };
        const scrapInputMt = (matchingHeat.scrap_input_kg || 0) / 1000;
        const billetOutputMt = (b.billet_output_kg || 0) / 1000;
        return {
          date: b.date,
          furnace_no: matchingHeat.furnace_no,
          heat_no: b.heat_no,
          billet_size: b.billet_size_section,
          scrap_input_mt: scrapInputMt,
          runtime_min: matchingHeat.runtime_min,
          billet_output_mt: billetOutputMt,
          production_loss_mt: Math.max(0, scrapInputMt - billetOutputMt),
          casting_yield: b.billet_yield_pct || (scrapInputMt > 0 ? (billetOutputMt / scrapInputMt) * 100 : 0)
        };
      });
    }

    // 7. Furnace Melting Log
    if (activeReportType === 'furnace-melting') {
      return furnace.map(f => {
        const scrapInput = f.scrap_input_kg || 0;
        const steelTapped = f.liquid_steel_tapped_kg || 0;
        return {
          heat_no: f.heat_no,
          date: f.date,
          furnace_no: f.furnace_no,
          shift_id: f.shift_id,
          scrap_input_kg: scrapInput,
          runtime_min: f.runtime_min,
          powder_kg: f.used_patching_powder_kg,
          forma_qty: f.used_patching_forma_kg,
          temp_c: f.tapping_temp_c,
          steel_tapped_kg: steelTapped,
          scrap_loss_kg: Math.max(0, scrapInput - steelTapped),
          power_kwh: f.power_consumed_kwh,
          yield_pct: f.yield_pct || (scrapInput > 0 ? (steelTapped / scrapInput) * 100 : 0)
        };
      });
    }

    // 8. Billet CCM Casting Ledger
    if (activeReportType === 'billet-ccm-ledger') {
      return billet.map(b => {
        const matchingHeat = furnaceLogs.find(f => f.heat_no === b.heat_no) || { furnace_no: 'N/A', liquid_steel_tapped_kg: b.billet_output_kg + b.scull_loss_kg };
        const steelTappedInput = matchingHeat.liquid_steel_tapped_kg || 0;
        const productionOutput = b.billet_output_kg || 0;
        return {
          date: b.date,
          furnace_no: matchingHeat.furnace_no,
          heat_no: b.heat_no,
          billet_size: b.billet_size_section,
          steel_tapped_input_kg: steelTappedInput,
          production_output_kg: productionOutput,
          scrap_skull_loss_kg: Math.max(0, steelTappedInput - productionOutput),
          billet_yield_pct: b.billet_yield_pct || (steelTappedInput > 0 ? (productionOutput / steelTappedInput) * 100 : 0),
          running_billet_stock_kg: b.billet_stock_kg
        };
      });
    }

    // 9. Downtime & Breakdown Tracker
    if (activeReportType === 'downtime-breakdown-tracker') {
      return downtime.map(d => ({
        date: d.date,
        ticket_no: d.ticket_no || 'TKT-N/A',
        equipment: d.equipment || 'N/A',
        breakdown_category: d.breakdown_category,
        root_cause_notes: d.root_cause_notes,
        shift_code: d.shift_code,
        action_taken: d.action_taken,
        billet_breakdown_min: d.billet_breakdown_min,
        rolling_breakdown_min: d.rolling_breakdown_min
      }));
    }

    // 10. Spectrometer Chemistry & QA
    if (activeReportType === 'spectrometer-qa') {
      return quality.map(q => ({
        sample_id: q.sample_id || 'SPL-N/A',
        rod_size: q.rod_size || 'N/A',
        grade: q.grade || 'N/A',
        heat_no: q.heat_no,
        testing_date: q.testing_date,
        pct_c: q.pct_c,
        pct_mn: q.pct_mn,
        pct_si: q.pct_si,
        pct_s: q.pct_s,
        pct_p: q.pct_p,
        pct_ce: q.pct_ce,
        yield_strength: q.yield_strength_n_mm2,
        tensile_strength: q.tensile_strength_n_mm2,
        elongation: q.elongation_pct,
        bend_test: q.bend_test_result,
        nominal_mass: q.nominal_mass_g_m
      }));
    }

    // 11. Plant Breakdown Audit
    if (activeReportType === 'plant-breakdown') {
      const categories: { [key: string]: any } = {};
      downtime.forEach(d => {
        if (!categories[d.breakdown_category]) {
          categories[d.breakdown_category] = { category: d.breakdown_category, melt_shop_min: 0, rolling_mill_min: 0, incidents: 0 };
        }
        categories[d.breakdown_category].melt_shop_min += d.billet_breakdown_min || 0;
        categories[d.breakdown_category].rolling_mill_min += d.rolling_breakdown_min || 0;
        categories[d.breakdown_category].incidents += 1;
      });
      return Object.values(categories);
    }

    if (activeReportType === 'custom-builder' && customSources.length > 0) {
      let combinedData: any[] = [];
      if (customSources.includes('scrap')) combinedData = [...combinedData, ...scrap];
      if (customSources.includes('furnace')) combinedData = [...combinedData, ...furnace];
      if (customSources.includes('billet')) combinedData = [...combinedData, ...billet];
      if (customSources.includes('rolling')) combinedData = [...combinedData, ...rolling];
      if (customSources.includes('dispatch')) combinedData = [...combinedData, ...dispatch];
      if (customSources.includes('downtime')) combinedData = [...combinedData, ...downtime];
      if (customSources.includes('expenses')) combinedData = [...combinedData, ...expenses];
      if (customSources.includes('quality')) combinedData = [...combinedData, ...quality];

      return combinedData.map(row => {
        const customRow: any = {};
        customColumns.forEach(col => {
          customRow[col] = row[col];
        });
        return customRow;
      });
    }

    return [];
  }, [selectedReportType, startDate, endDate, scrapData, furnaceLogs, billetData, rollingData, dispatchData, downtimeData, expenseData, qualityData, customSources, customColumns]);

  // Export to Excel
  const handleExportExcel = () => {
    let headers: string[] = [];
    let rows: any[] = [];
    let filename = `report_${activeReportType}.csv`;

    if (activeReportType === 'daily-production') {
      headers = ['Date', 'Scrap Received (MT)', 'Scrap Input (MT)', 'Heats Run', 'Runtime (Hours)', 'Billet Output (MT)', 'Scrap Loss (MT)', 'Billet Yield (%)', 'Rod Production (MT)', 'Rod Loss (MT)', 'Rod Yield (%)', 'Sales Despatched (MT)'];
      rows = reportData.map((r: any) => [r.date, r.scrap_rcv_mt.toFixed(2), r.scrap_input_mt.toFixed(2), r.heats_count, r.runtime_hours.toFixed(1), r.billet_output_mt.toFixed(2), r.scrap_loss_mt.toFixed(2), r.billet_yield_pct.toFixed(2), r.rod_output_mt.toFixed(2), r.rod_loss_mt.toFixed(2), r.rod_yield_pct.toFixed(2), r.dispatch_mt.toFixed(2)]);
    } else if (activeReportType === 'monthly-executive') {
      headers = ['Month', 'Scrap Intake (MT)', 'Billet Smelted (MT)', 'Rod Production (MT)', 'Dispatch (MT)', 'Total Expenses (৳)'];
      rows = reportData.map((r: any) => [r.month, r.scrap_mt.toFixed(2), r.billet_mt.toFixed(2), r.rod_mt.toFixed(2), r.dispatch_mt.toFixed(2), r.expenses_val]);
    } else if (activeReportType === 'party-customer') {
      headers = ['Customer Name', 'Contact Info', 'Total Dispatch (MT)', 'Invoice Value (৳)', 'Paid Amount (৳)', 'Outstanding Balance (৳)', 'Challan Histories'];
      rows = reportData.map((r: any) => [r.customer_name, r.contact_info, r.total_qty_mt.toFixed(2), r.total_sales, r.paid, r.pending, r.challans.join('; ')]);
    } else if (activeReportType === 'supplier-scrap') {
      headers = ['Supplier Name', 'Scrap Category', 'Total Intake (MT)', 'Total Sourcing Cost (৳)'];
      rows = reportData.map((r: any) => [r.supplier_name, r.scrap_category, r.total_qty_mt.toFixed(2), r.total_cost]);
    } else if (activeReportType === 'size-wise-rebar') {
      headers = ['Rod Size', 'Billet Charged (MT)', 'Rebar Output (MT)', 'Shearing Loss (MT)', 'Average Yield %'];
      rows = reportData.map((r: any) => [r.rod_size, r.billet_input_mt.toFixed(2), r.production_mt.toFixed(2), r.loss_mt.toFixed(2), r.avg_yield_pct]);
    } else if (activeReportType === 'billet-casting') {
      headers = ['Date', 'Furnace No', 'Heat No', 'Billet Size', 'Scrap Input (MT)', 'Runtime (Min)', 'Billet Output (MT)', 'Production Loss (MT)', 'Casting Yield (%)'];
      rows = reportData.map((r: any) => [r.date, r.furnace_no, r.heat_no, r.billet_size, r.scrap_input_mt.toFixed(2), r.runtime_min, r.billet_output_mt.toFixed(2), r.production_loss_mt.toFixed(2), r.casting_yield.toFixed(2)]);
    } else if (activeReportType === 'furnace-melting') {
      headers = ['Heat No', 'Date', 'Furnace No', 'Shift ID', 'Scrap Input (KG)', 'Runtime (Min)', 'Powder (KG)', 'Forma (Qty)', 'Temp (°C)', 'Steel Tapped (KG)', 'Scrap Loss (KG)', 'Power (kWh)', 'Yield (%)'];
      rows = reportData.map((r: any) => [r.heat_no, r.date, r.furnace_no, r.shift_id, r.scrap_input_kg, r.runtime_min, r.powder_kg, r.forma_qty, r.temp_c, r.steel_tapped_kg, r.scrap_loss_kg, r.power_kwh, r.yield_pct.toFixed(2)]);
    } else if (activeReportType === 'billet-ccm-ledger') {
      headers = ['Date', 'Furnace No', 'Heat No', 'Billet Size', 'Steel Tapped/Input (KG)', 'Production Output (KG)', 'Scrap/Skull Loss (KG)', 'Billet Yield (%)', 'Running Billet Stock (KG)'];
      rows = reportData.map((r: any) => [r.date, r.furnace_no, r.heat_no, r.billet_size, r.steel_tapped_input_kg, r.production_output_kg, r.scrap_skull_loss_kg, r.billet_yield_pct.toFixed(2), r.running_billet_stock_kg]);
    } else if (activeReportType === 'downtime-breakdown-tracker') {
      headers = ['Date', 'Ticket No', 'Equipment', 'Category', 'Root Cause Notes', 'Shift Code', 'Action Taken', 'Melt Shop (Min)', 'Rolling Mill (Min)'];
      rows = reportData.map((r: any) => [r.date, r.ticket_no, r.equipment, r.breakdown_category, r.root_cause_notes, r.shift_code, r.action_taken, r.billet_breakdown_min, r.rolling_breakdown_min]);
    } else if (activeReportType === 'spectrometer-qa') {
      headers = ['Sample ID', 'Rod Size', 'Grade', 'Heat No', 'Testing Date', '%C', '%Mn', '%Si', '%S', '%P', '%CE', 'Yield Str (N/mm2)', 'Tensile Str (N/mm2)', 'Elongation %', 'Bend Test', 'Nominal Mass (kg/m)'];
      rows = reportData.map((r: any) => [r.sample_id, r.rod_size, r.grade, r.heat_no, r.testing_date, r.pct_c, r.pct_mn, r.pct_si, r.pct_s, r.pct_p, r.pct_ce, r.yield_strength, r.tensile_strength, r.elongation, r.bend_test, r.nominal_mass]);
    } else if (activeReportType === 'plant-breakdown') {
      headers = ['Breakdown Category', 'Melt Shop Minutes', 'Rolling Mill Minutes', 'Incidents Count'];
      rows = reportData.map((r: any) => [r.category, r.melt_shop_min, r.rolling_mill_min, r.incidents]);
    } else if (activeReportType === 'custom-builder') {
      headers = customColumns.map(c => c.replace(/_/g, ' ').toUpperCase());
      rows = reportData.map((r: any) => customColumns.map(c => r[c]));
    }

    exportToExcel(headers, rows, filename);
  };

  // PDF Trigger
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 print:bg-white print:text-black">
      
      {/* Dynamic Native Print CSS Overrides */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          html, body, #__next, [class*="h-screen"], [class*="overflow-hidden"], main, .flex-1 {
            height: auto !important;
            min-height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            position: static !important;
            background: white !important;
            color: black !important;
          }
          aside, header, button, select, input, label, .print-hide, .no-print {
            display: none !important;
          }
          .print-container {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
          table {
            page-break-inside: avoid;
            width: 100% !important;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }
      `}} />

      {/* Printable Corporate Letterhead Header (Visible in print only) */}
      <div className="hidden print:block text-center border-b-2 border-slate-900 pb-4 mb-5 font-sans">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Hi-Tech Steel & Re-Rolling Mills Ltd.</h1>
        <p className="text-[10px] text-slate-600 font-mono tracking-widest mt-1">EXECUTIVE PRODUCTION MIS REPORT & COMPLIANCE LEDGER</p>
        <p className="text-[9px] text-slate-500 mt-0.5">Plot 14, Industrial Area, Chittagong, Bangladesh</p>
        <div className="flex flex-wrap justify-between gap-4 text-[10px] font-mono mt-4 border-t border-slate-200 pt-3">
          <span>REPORT: <strong className="uppercase">{activeReportType.replace(/-/g, ' ')}</strong></span>
          <span>DATE RANGE: <strong>{activeStartDate} to {activeEndDate}</strong></span>
          <span>GENERATED BY: <strong>{user?.name}</strong></span>
        </div>
      </div>
      {/* Enterprise Header Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap flex-col md:flex-row justify-between items-start md:items-center gap-5 print:hidden">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#B48F48] uppercase tracking-wider font-mono mb-1.5">
            <span>Executive Business Intelligence</span>
            <span>•</span>
            <span>Plant MIS & Operational Analytics</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">Reports & Analytics Hub</h1>
          <p className="text-sm text-slate-500 font-sans mt-0.5">Comprehensive metallurgical audit trails, production reconciliation, mass balance, and financial realization summaries.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleExportExcel}
            className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer flex flex-wrap items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export Excel</span>
          </button>
          <button 
            onClick={handlePrintPDF}
            className="flex-1 md:flex-none px-5 py-2.5 bg-[#B48F48] hover:bg-[#9E7A37] text-white text-sm font-semibold rounded-xl shadow-sm transition-all cursor-pointer flex flex-wrap items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Print PDF Report</span>
          </button>
        </div>
      </div>

      {/* Filtering Control Bar (Hidden in print) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white border border-slate-200/90 p-4 rounded-2xl shadow-xs print:hidden">
        
        {/* Date Range Select */}
        <div className="space-y-1.5 col-span-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Date Preset</label>
          <select 
            value={dateRange}
            onChange={(e) => handleRangeChange(e.target.value)}
            className="w-full bg-white border border-slate-300 text-sm px-3.5 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059] font-sans text-slate-900"
          >
            <option value="this-month">This Month (Aug 2026)</option>
            <option value="this-week">This Week</option>
            <option value="today">Today</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {/* Custom Start Date */}
        <div className="space-y-1.5 col-span-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Start Date</label>
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setDateRange('custom'); }}
            className="w-full bg-white border border-slate-300 text-sm px-3.5 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059] font-mono text-slate-900"
          />
        </div>

        {/* Custom End Date */}
        <div className="space-y-1.5 col-span-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">End Date</label>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setDateRange('custom'); }}
            className="w-full bg-white border border-slate-300 text-sm px-3.5 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059] font-mono text-slate-900"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="space-y-1.5 col-span-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Analysis Mode</label>
          <div className="grid grid-cols-2 gap-1.5 bg-slate-100/80 border border-slate-200 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('table')}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Grid Table
            </button>
            <button 
              onClick={() => setViewMode('charts')}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${viewMode === 'charts' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              SVG Chart
            </button>
          </div>
        </div>

      </div>

      {/* Main Grid: Left Selector tabs & Right Content Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left selector menu list (Hidden in print) */}
        <div className="space-y-2 lg:col-span-1 print:hidden">
          <h3 className="px-3 text-xs uppercase tracking-wider font-bold text-slate-400 font-mono">Analytical Modules</h3>
          
          <div className="space-y-1 bg-white border border-slate-200/90 p-2.5 rounded-2xl shadow-xs">
            {[
              { id: 'daily-production', label: 'Daily Production Sheet' },
              { id: 'monthly-executive', label: 'Monthly Executive Summary' },
              { id: 'party-customer', label: 'Party-Wise Customer Ledger' },
              { id: 'supplier-scrap', label: 'Supplier Scrap Summary' },
              { id: 'size-wise-rebar', label: 'Size-Wise Rebar Report' },
              { id: 'billet-casting', label: 'Billet Casting Heat Log' },
              { id: 'furnace-melting', label: 'Furnace Melting Log' },
              { id: 'billet-ccm-ledger', label: 'Billet CCM Casting Ledger' },
              { id: 'downtime-breakdown-tracker', label: 'Downtime & Breakdown Log' },
              { id: 'spectrometer-qa', label: 'Spectrometer Chemistry & QA' },
              { id: 'plant-breakdown', label: 'Plant Breakdown Audit' },
              { id: 'custom-builder', label: 'Custom Report Builder (New)' }
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => setSelectedReportType(item.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-sans transition-all flex items-center justify-between ${
                  selectedReportType === item.id 
                    ? 'bg-amber-500/10 text-amber-900 font-semibold border border-amber-500/20 shadow-2xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                }`}
              >
                <span>{item.label}</span>
                {selectedReportType === item.id && <span className="w-1.5 h-1.5 rounded-full bg-[#B48F48]" />}
              </button>
            ))}
          </div>
        </div>

        {/* Right Content Panel */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden print:border-0 print:shadow-none print-container">
          
          {viewMode === 'table' ? (
            <div className="overflow-x-auto">
              
              {/* Daily Production Table */}
              {activeReportType === 'daily-production' && (
                <table className="w-full text-left border-collapse font-mono">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-150 text-[10px] uppercase font-mono text-slate-400">
                      <th className={cellPadding}>Date</th>
                      <th className={`${cellPadding} text-right`}>Scrap Received (MT)</th>
                      <th className={`${cellPadding} text-right`}>Scrap Input (MT)</th>
                      <th className={`${cellPadding} text-right`}>Heats Run</th>
                      <th className={`${cellPadding} text-right`}>Runtime (Hours)</th>
                      <th className={`${cellPadding} text-right`}>Billet Output (MT)</th>
                      <th className={`${cellPadding} text-right`}>Scrap Loss (MT)</th>
                      <th className={`${cellPadding} text-right`}>Billet Yield (%)</th>
                      <th className={`${cellPadding} text-right`}>Rod Production (MT)</th>
                      <th className={`${cellPadding} text-right`}>Rod Loss (MT)</th>
                      <th className={`${cellPadding} text-right`}>Rod Yield (%)</th>
                      <th className={`${cellPadding} text-right`}>Sales Despatched (MT)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-xs">
                    {reportData.length === 0 ? (
                      <tr>
                        <td colSpan={12} className="text-center py-8 text-slate-400">No data generated in this range. Select and click Generate Report.</td>
                      </tr>
                    ) : reportData.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/40">
                        <td className={`${cellPadding} font-bold`}>{row.date}</td>
                        <td className={`${cellPadding} text-right`}>{row.scrap_rcv_mt.toFixed(2)}</td>
                        <td className={`${cellPadding} text-right`}>{row.scrap_input_mt.toFixed(2)}</td>
                        <td className={`${cellPadding} text-right`}>{row.heats_count}</td>
                        <td className={`${cellPadding} text-right`}>{row.runtime_hours.toFixed(1)}</td>
                        <td className={`${cellPadding} text-right`}>{row.billet_output_mt.toFixed(2)}</td>
                        <td className={`${cellPadding} text-right`}>{row.scrap_loss_mt.toFixed(2)}</td>
                        <td className={`${cellPadding} text-right`}>{row.billet_yield_pct.toFixed(1)}%</td>
                        <td className={`${cellPadding} text-right font-semibold text-emerald-600`}>{row.rod_output_mt.toFixed(2)}</td>
                        <td className={`${cellPadding} text-right`}>{row.rod_loss_mt.toFixed(2)}</td>
                        <td className={`${cellPadding} text-right`}>{row.rod_yield_pct.toFixed(1)}%</td>
                        <td className={`${cellPadding} text-right font-bold text-[#B48F48]`}>{row.dispatch_mt.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Monthly Executive Summary */}
              {activeReportType === 'monthly-executive' && (
                <table className="w-full text-left border-collapse font-mono">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-150 text-[10px] uppercase font-mono text-slate-450">
                      <th className={cellPadding}>Month</th>
                      <th className={`${cellPadding} text-right`}>Scrap Intake (MT)</th>
                      <th className={`${cellPadding} text-right`}>Billet Smelted (MT)</th>
                      <th className={`${cellPadding} text-right`}>Rod Production (MT)</th>
                      <th className={`${cellPadding} text-right`}>Despatch (MT)</th>
                      <th className={`${cellPadding} text-right`}>Expenses Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-xs">
                    {reportData.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/40">
                        <td className={`${cellPadding} font-bold`}>{row.month}</td>
                        <td className={`${cellPadding} text-right`}>{row.scrap_mt.toFixed(2)}</td>
                        <td className={`${cellPadding} text-right`}>{row.billet_mt.toFixed(2)}</td>
                        <td className={`${cellPadding} text-right font-semibold text-emerald-600`}>{row.rod_mt.toFixed(2)}</td>
                        <td className={`${cellPadding} text-right`}>{row.dispatch_mt.toFixed(2)}</td>
                        <td className={`${cellPadding} text-right font-bold text-rose-650`}>৳{row.expenses_val.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Party-Wise Customer Ledger */}
              {activeReportType === 'party-customer' && (
                <table className="w-full text-left border-collapse font-mono">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-150 text-[10px] uppercase font-mono text-slate-450">
                      <th className={cellPadding}>Customer Name</th>
                      <th className={cellPadding}>Contact Info</th>
                      <th className={`${cellPadding} text-right`}>Total dispatch (MT)</th>
                      <th className={`${cellPadding} text-right`}>Invoice Value</th>
                      <th className={`${cellPadding} text-right`}>Paid Amount</th>
                      <th className={`${cellPadding} text-right`}>Outstanding Balance</th>
                      <th className={cellPadding}>Challan Histories</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-xs">
                    {reportData.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-slate-450">No customer ledger records.</td>
                      </tr>
                    ) : reportData.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/40">
                        <td className={`${cellPadding} font-bold`}>{row.customer_name}</td>
                        <td className={cellPadding}>{row.contact_info}</td>
                        <td className={`${cellPadding} text-right`}>{row.total_qty_mt.toFixed(2)}</td>
                        <td className={`${cellPadding} text-right font-semibold`}>৳{row.total_sales.toLocaleString()}</td>
                        <td className={`${cellPadding} text-right text-emerald-600`}>৳{row.paid.toLocaleString()}</td>
                        <td className={`${cellPadding} text-right text-rose-650 font-bold`}>৳{row.pending.toLocaleString()}</td>
                        <td className={`${cellPadding} text-[10px] truncate max-w-[150px]`} title={row.challans.join(', ')}>{row.challans.join(', ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Supplier Scrap Summary */}
              {activeReportType === 'supplier-scrap' && (
                <table className="w-full text-left border-collapse font-mono">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-150 text-[10px] uppercase font-mono text-slate-450">
                      <th className={cellPadding}>Supplier Name</th>
                      <th className={cellPadding}>Scrap Category</th>
                      <th className={`${cellPadding} text-right`}>Total Intake (MT)</th>
                      <th className={`${cellPadding} text-right`}>Total Sourcing Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-xs">
                    {reportData.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/40">
                        <td className={`${cellPadding} font-bold`}>{row.supplier_name}</td>
                        <td className={cellPadding}>
                          <span className="px-2 py-0.5 text-[9px] font-bold border rounded-full bg-amber-50 text-[#B48F48] border-amber-250/20">
                            {row.scrap_category}
                          </span>
                        </td>
                        <td className={`${cellPadding} text-right`}>{row.total_qty_mt.toFixed(2)}</td>
                        <td className={`${cellPadding} text-right font-bold text-emerald-600`}>৳{row.total_cost.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Size-Wise Rebar Production Report */}
              {activeReportType === 'size-wise-rebar' && (
                <table className="w-full text-left border-collapse font-mono">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-150 text-[10px] uppercase font-mono text-slate-450">
                      <th className={cellPadding}>Diameter Size</th>
                      <th className={`${cellPadding} text-right`}>Billet Charged (MT)</th>
                      <th className={`${cellPadding} text-right`}>Rebar Output (MT)</th>
                      <th className={`${cellPadding} text-right`}>Shearing Loss (MT)</th>
                      <th className={`${cellPadding} text-right`}>Average Yield %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-xs">
                    {reportData.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/40">
                        <td className={`${cellPadding} font-bold`}>{row.rod_size}</td>
                        <td className={`${cellPadding} text-right`}>{row.billet_input_mt.toFixed(2)}</td>
                        <td className={`${cellPadding} text-right font-semibold text-emerald-600`}>{row.production_mt.toFixed(2)}</td>
                        <td className={`${cellPadding} text-right`}>{row.loss_mt.toFixed(2)}</td>
                        <td className={`${cellPadding} text-right font-bold text-[#B48F48]`}>{row.avg_yield_pct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Billet Casting Heat Log */}
              {activeReportType === 'billet-casting' && (
                <table className="w-full text-left border-collapse font-mono">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-150 text-[10px] uppercase font-mono text-slate-450">
                      <th className={cellPadding}>Date</th>
                      <th className={cellPadding}>Furnace No.</th>
                      <th className={cellPadding}>Heat No</th>
                      <th className={cellPadding}>Billet Size</th>
                      <th className={`${cellPadding} text-right`}>Scrap Input (MT)</th>
                      <th className={`${cellPadding} text-right`}>Runtime (Min)</th>
                      <th className={`${cellPadding} text-right`}>Billet Output (MT)</th>
                      <th className={`${cellPadding} text-right`}>Production Loss (MT)</th>
                      <th className={`${cellPadding} text-right`}>Casting Yield (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-xs">
                    {reportData.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/40">
                        <td className={cellPadding}>{row.date}</td>
                        <td className={cellPadding}>{row.furnace_no}</td>
                        <td className={`${cellPadding} font-bold text-slate-900`}>{row.heat_no}</td>
                        <td className={cellPadding}>{row.billet_size}</td>
                        <td className={`${cellPadding} text-right`}>{row.scrap_input_mt.toFixed(2)}</td>
                        <td className={`${cellPadding} text-right`}>{row.runtime_min}</td>
                        <td className={`${cellPadding} text-right font-semibold text-[#B48F48]`}>{row.billet_output_mt.toFixed(2)}</td>
                        <td className={`${cellPadding} text-right`}>{row.production_loss_mt.toFixed(2)}</td>
                        <td className={`${cellPadding} text-right font-bold text-rose-600`}>{row.casting_yield.toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Furnace Melting Log */}
              {activeReportType === 'furnace-melting' && (
                <table className="w-full text-left border-collapse font-mono">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-150 text-[10px] uppercase font-mono text-slate-450">
                      <th className={cellPadding}>Heat No.</th>
                      <th className={cellPadding}>Date</th>
                      <th className={cellPadding}>Furnace No.</th>
                      <th className={cellPadding}>Shift ID</th>
                      <th className={`${cellPadding} text-right`}>Scrap Input (KG)</th>
                      <th className={`${cellPadding} text-right`}>Runtime (Min)</th>
                      <th className={`${cellPadding} text-right`}>Powder (KG)</th>
                      <th className={`${cellPadding} text-right`}>Forma (Qty)</th>
                      <th className={`${cellPadding} text-right`}>Temp (°C)</th>
                      <th className={`${cellPadding} text-right`}>Steel Tapped (KG)</th>
                      <th className={`${cellPadding} text-right`}>Scrap Loss (KG)</th>
                      <th className={`${cellPadding} text-right`}>Power (kWh)</th>
                      <th className={`${cellPadding} text-right`}>Yield (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-xs">
                    {reportData.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/40">
                        <td className={`${cellPadding} font-bold text-slate-900`}>{row.heat_no}</td>
                        <td className={cellPadding}>{row.date}</td>
                        <td className={cellPadding}>{row.furnace_no}</td>
                        <td className={cellPadding}>{row.shift_id}</td>
                        <td className={`${cellPadding} text-right`}>{row.scrap_input_kg.toLocaleString()}</td>
                        <td className={`${cellPadding} text-right`}>{row.runtime_min}</td>
                        <td className={`${cellPadding} text-right`}>{row.powder_kg}</td>
                        <td className={`${cellPadding} text-right`}>{row.forma_qty}</td>
                        <td className={`${cellPadding} text-right`}>{row.temp_c}°C</td>
                        <td className={`${cellPadding} text-right font-semibold text-emerald-600`}>{row.steel_tapped_kg.toLocaleString()}</td>
                        <td className={`${cellPadding} text-right text-rose-650`}>{row.scrap_loss_kg.toLocaleString()}</td>
                        <td className={`${cellPadding} text-right`}>{row.power_kwh.toLocaleString()}</td>
                        <td className={`${cellPadding} text-right font-bold text-[#B48F48]`}>{row.yield_pct.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Billet CCM Casting Ledger */}
              {activeReportType === 'billet-ccm-ledger' && (
                <table className="w-full text-left border-collapse font-mono">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-150 text-[10px] uppercase font-mono text-slate-450">
                      <th className={cellPadding}>Date</th>
                      <th className={cellPadding}>Furnace No.</th>
                      <th className={cellPadding}>Heat No.</th>
                      <th className={cellPadding}>Billet Size</th>
                      <th className={`${cellPadding} text-right`}>Steel Tapped/Input (KG)</th>
                      <th className={`${cellPadding} text-right`}>Production Output (KG)</th>
                      <th className={`${cellPadding} text-right`}>Scrap/Skull Loss (KG)</th>
                      <th className={`${cellPadding} text-right`}>Billet Yield (%)</th>
                      <th className={`${cellPadding} text-right`}>Running Billet Stock (KG)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-xs">
                    {reportData.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/40">
                        <td className={cellPadding}>{row.date}</td>
                        <td className={cellPadding}>{row.furnace_no}</td>
                        <td className={`${cellPadding} font-bold text-slate-900`}>{row.heat_no}</td>
                        <td className={cellPadding}>{row.billet_size}</td>
                        <td className={`${cellPadding} text-right`}>{row.steel_tapped_input_kg.toLocaleString()}</td>
                        <td className={`${cellPadding} text-right font-semibold text-emerald-600`}>{row.production_output_kg.toLocaleString()}</td>
                        <td className={`${cellPadding} text-right text-rose-650`}>{row.scrap_skull_loss_kg.toLocaleString()}</td>
                        <td className={`${cellPadding} text-right font-bold`}>{row.billet_yield_pct.toFixed(2)}%</td>
                        <td className={`${cellPadding} text-right text-[#B48F48] font-bold`}>{row.running_billet_stock_kg.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Downtime & Breakdown Tracker */}
              {activeReportType === 'downtime-breakdown-tracker' && (
                <table className="w-full text-left border-collapse font-mono">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-150 text-[10px] uppercase font-mono text-slate-450">
                      <th className={cellPadding}>Date</th>
                      <th className={cellPadding}>Ticket No.</th>
                      <th className={cellPadding}>Equipment</th>
                      <th className={cellPadding}>Category</th>
                      <th className={cellPadding}>Root Cause Notes</th>
                      <th className={cellPadding}>Shift Code</th>
                      <th className={cellPadding}>Action Taken</th>
                      <th className={`${cellPadding} text-right`}>Melt (Min)</th>
                      <th className={`${cellPadding} text-right`}>Rolling (Min)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-xs">
                    {reportData.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/40">
                        <td className={cellPadding}>{row.date}</td>
                        <td className={`${cellPadding} font-bold`}>{row.ticket_no}</td>
                        <td className={cellPadding}>{row.equipment}</td>
                        <td className={cellPadding}>{row.breakdown_category}</td>
                        <td className={cellPadding} title={row.root_cause_notes}>{row.root_cause_notes}</td>
                        <td className={cellPadding}>{row.shift_code}</td>
                        <td className={cellPadding}>{row.action_taken}</td>
                        <td className={`${cellPadding} text-right`}>{row.billet_breakdown_min}</td>
                        <td className={`${cellPadding} text-right`}>{row.rolling_breakdown_min}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Spectrometer Chemistry & QA */}
              {activeReportType === 'spectrometer-qa' && (
                <table className="w-full text-left border-collapse font-mono">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-150 text-[9px] uppercase font-mono text-slate-450">
                      <th className={cellPadding}>Sample ID</th>
                      <th className={cellPadding}>Rod Size</th>
                      <th className={cellPadding}>Grade</th>
                      <th className={cellPadding}>Heat No.</th>
                      <th className={cellPadding}>Date</th>
                      <th className={`${cellPadding} text-right`}>%C</th>
                      <th className={`${cellPadding} text-right`}>%Mn</th>
                      <th className={`${cellPadding} text-right`}>%Si</th>
                      <th className={`${cellPadding} text-right`}>%S</th>
                      <th className={`${cellPadding} text-right`}>%P</th>
                      <th className={`${cellPadding} text-right`}>%CE</th>
                      <th className={`${cellPadding} text-right`}>Yield (N/mm²)</th>
                      <th className={`${cellPadding} text-right`}>Tensile (N/mm²)</th>
                      <th className={`${cellPadding} text-right`}>Elongation %</th>
                      <th className={cellPadding}>Bend Test</th>
                      <th className={`${cellPadding} text-right`}>Mass (kg/m)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {reportData.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/40">
                        <td className={`${cellPadding} font-bold`}>{row.sample_id}</td>
                        <td className={cellPadding}>{row.rod_size}</td>
                        <td className={cellPadding}>{row.grade}</td>
                        <td className={cellPadding}>{row.heat_no}</td>
                        <td className={cellPadding}>{row.testing_date}</td>
                        <td className={`${cellPadding} text-right`}>{row.pct_c}%</td>
                        <td className={`${cellPadding} text-right`}>{row.pct_mn}%</td>
                        <td className={`${cellPadding} text-right`}>{row.pct_si}%</td>
                        <td className={`${cellPadding} text-right`}>{row.pct_s}%</td>
                        <td className={`${cellPadding} text-right`}>{row.pct_p}%</td>
                        <td className={`${cellPadding} text-right text-rose-600 font-semibold`}>{row.pct_ce}%</td>
                        <td className={`${cellPadding} text-right`}>{row.yield_strength}</td>
                        <td className={`${cellPadding} text-right`}>{row.tensile_strength}</td>
                        <td className={`${cellPadding} text-right`}>{row.elongation}%</td>
                        <td className={cellPadding}>
                          <span className={`px-1.5 py-0.2 text-[8px] font-bold border rounded-full ${
                            row.bend_test === 'Approved' ? 'bg-emerald-50 text-emerald-650 border-emerald-250/20' : 'bg-rose-50 text-rose-650 border-rose-250/20'
                          }`}>
                            {row.bend_test}
                          </span>
                        </td>
                        <td className={`${cellPadding} text-right`}>{row.nominal_mass}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Plant Breakdown Audit */}
              {activeReportType === 'plant-breakdown' && (
                <table className="w-full text-left border-collapse font-mono">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-150 text-[10px] uppercase font-mono text-slate-450">
                      <th className={cellPadding}>Breakdown Category</th>
                      <th className={`${cellPadding} text-right`}>Melt Shop Downtime (Min)</th>
                      <th className={`${cellPadding} text-right`}>Rolling Mill Downtime (Min)</th>
                      <th className={`${cellPadding} text-right`}>Incidents Count</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-xs">
                    {reportData.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/40">
                        <td className={`${cellPadding} font-bold`}>{row.category}</td>
                        <td className={`${cellPadding} text-right text-rose-600`}>{row.melt_shop_min} mins</td>
                        <td className={`${cellPadding} text-right text-indigo-600`}>{row.rolling_mill_min} mins</td>
                        <td className={`${cellPadding} text-right font-semibold`}>{row.incidents}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Custom Report Builder */}
              {activeReportType === 'custom-builder' && (
                <div className="p-4 bg-white rounded-xl space-y-4 font-sans text-sm border border-slate-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold text-slate-800 mb-2">1. Select Data Sources</h4>
                      <select
                        className="w-full bg-white border border-slate-300 px-3 py-2 rounded-lg"
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val && !customSources.includes(val)) {
                            setCustomSources([...customSources, val]);
                          }
                          e.target.value = '';
                        }}
                      >
                        <option value="">-- Add Data Source --</option>
                        <option value="scrap">Scrap Sourcing</option>
                        <option value="furnace">Furnace Melting</option>
                        <option value="billet">Billet CCM</option>
                        <option value="rolling">Rolling Mill</option>
                        <option value="dispatch">Sales Dispatch</option>
                        <option value="downtime">Downtime Tracker</option>
                        <option value="expenses">Expenses Ledger</option>
                        <option value="quality">Spectrometer QA</option>
                      </select>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        {customSources.map(src => {
                          const labels: Record<string, string> = { scrap: 'Scrap Sourcing', furnace: 'Furnace Melting', billet: 'Billet CCM', rolling: 'Rolling Mill', dispatch: 'Sales Dispatch', downtime: 'Downtime Tracker', expenses: 'Expenses Ledger', quality: 'Spectrometer QA' };
                          return (
                            <span key={src} className="px-2.5 py-1 bg-[#B48F48] text-white text-xs font-semibold rounded-lg flex flex-wrap items-center gap-1 shadow-sm">
                              <span>{labels[src]}</span>
                              <button onClick={() => setCustomSources(customSources.filter(s => s !== src))} className="hover:text-red-200 font-bold ml-1.5 transition-colors cursor-pointer">✕</button>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    {customSources.length > 0 && (
                      <div>
                        {(() => {
                          let availableCols = new Set<string>();
                          if (customSources.includes('scrap') && scrapData.length) Object.keys(scrapData[0]).forEach(k => availableCols.add(k));
                          if (customSources.includes('furnace') && furnaceLogs.length) Object.keys(furnaceLogs[0]).forEach(k => availableCols.add(k));
                          if (customSources.includes('billet') && billetData.length) Object.keys(billetData[0]).forEach(k => availableCols.add(k));
                          if (customSources.includes('rolling') && rollingData.length) Object.keys(rollingData[0]).forEach(k => availableCols.add(k));
                          if (customSources.includes('dispatch') && dispatchData.length) Object.keys(dispatchData[0]).forEach(k => availableCols.add(k));
                          if (customSources.includes('downtime') && downtimeData.length) Object.keys(downtimeData[0]).forEach(k => availableCols.add(k));
                          if (customSources.includes('expenses') && expenseData.length) Object.keys(expenseData[0]).forEach(k => availableCols.add(k));
                          if (customSources.includes('quality') && qualityData.length) Object.keys(qualityData[0]).forEach(k => availableCols.add(k));
                          
                          const allCols = Array.from(availableCols);
                          const isAllSelected = allCols.length > 0 && allCols.every(c => customColumns.includes(c));

                          return (
                            <>
                              <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                                <h4 className="font-bold text-slate-800">2. Select Columns</h4>
                                <button 
                                  onClick={() => setCustomColumns(isAllSelected ? [] : allCols)}
                                  className="text-xs font-semibold text-[#B48F48] hover:text-[#9E7A37] bg-amber-50 px-2.5 py-1 rounded-md transition-colors cursor-pointer border border-[#B48F48]/20"
                                >
                                  {isAllSelected ? 'Deselect All' : 'Select All'}
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-lg">
                                {allCols.map(col => (
                                  <label key={col} className="flex flex-wrap items-center gap-2 text-xs">
                                    <input 
                                      type="checkbox" 
                                      checked={customColumns.includes(col)}
                                      onChange={(e) => {
                                        if (e.target.checked) setCustomColumns([...customColumns, col]);
                                        else setCustomColumns(customColumns.filter(c => c !== col));
                                      }}
                                      className="accent-[#B48F48] cursor-pointer"
                                    />
                                    <span>{col}</span>
                                  </label>
                                ))}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                  
                  {customColumns.length > 0 && (
                    <div className="overflow-x-auto mt-6">
                      <table className="w-full text-left border-collapse font-mono">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-mono text-slate-500">
                            {customColumns.map(col => (
                              <th key={col} className={cellPadding}>{col.replace(/_/g, ' ')}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono text-xs">
                          {reportData.length === 0 ? (
                            <tr>
                              <td colSpan={customColumns.length} className="text-center py-4 text-slate-400">No data generated in this range.</td>
                            </tr>
                          ) : reportData.map((row: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50/40">
                              {customColumns.map(col => (
                                <td key={col} className={cellPadding}>{row[col]}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            <div className="p-8 space-y-6 flex flex-col items-center">
              
              {/* Dynamic SVG Visual Charts */}
              <div className="w-full max-w-lg bg-slate-50 border border-slate-150 p-5 rounded-2xl">
                <h4 className="text-xs font-bold text-slate-700 font-mono mb-4 text-center uppercase">
                  Analysis Chart: {activeReportType.replace(/-/g, ' ')}
                </h4>
                
                {activeReportType === 'plant-breakdown' ? (
                  <div className="space-y-4">
                    <p className="text-[10px] text-slate-450 text-center font-mono">Breakdown minutes breakdown per category</p>
                    <div className="space-y-3">
                      {reportData.map((item: any, idx: number) => {
                        const totalMin = item.melt_shop_min + item.rolling_mill_min;
                        return (
                          <div key={idx} className="space-y-1 text-xs">
                            <div className="flex flex-wrap justify-between gap-4 font-semibold">
                              <span>{item.category}</span>
                              <span className="font-mono">{totalMin} mins</span>
                            </div>
                            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
                              <div className="h-full bg-rose-500" style={{ width: `${totalMin > 0 ? (item.melt_shop_min / totalMin) * 100 : 0}%` }} title="Melt shop" />
                              <div className="h-full bg-indigo-500" style={{ width: `${totalMin > 0 ? (item.rolling_mill_min / totalMin) * 100 : 0}%` }} title="Rolling mill" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <svg className="w-full h-48" viewBox="0 0 400 120" preserveAspectRatio="none">
                    <line x1="0" y1="20" x2="400" y2="20" stroke="#e2e8f0" strokeWidth="1" />
                    <line x1="0" y1="60" x2="400" y2="60" stroke="#e2e8f0" strokeWidth="1" />
                    <line x1="0" y1="100" x2="400" y2="100" stroke="#e2e8f0" strokeWidth="1" />
                    
                    <path d="M 0,120 L 50,80 L 150,90 L 250,40 L 350,60 L 400,60" fill="none" stroke="#B48F48" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="50" cy="80" r="4" fill="#C5A059" />
                    <circle cx="150" cy="90" r="4" fill="#C5A059" />
                    <circle cx="250" cy="40" r="4" fill="#C5A059" />
                    <circle cx="350" cy="60" r="4" fill="#C5A059" />
                  </svg>
                )}
                
                <p className="text-[9px] text-slate-400 font-mono text-center mt-4">X-Axis: Operation date logs • Y-Axis: Metric Tons/Minutes</p>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
