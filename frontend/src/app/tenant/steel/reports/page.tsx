'use client';
import { exportToExcel } from '@/lib/excelExport';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';

// Core Seed Data (fully local for demo)
const initialScrapData = [
  { date: '2026-08-20', supplier_name: 'Metal Recyclers Corp', scrap_category: 'LC Scrap', scrap_rcv_kg: 15000, truck_no: 'TR-1024', gross_weight: 24500, value_tare: 9500, rate_per_kg: 42, total_cost: 630000, yard_location: 'Bay A' },
  { date: '2026-08-21', supplier_name: 'Apex Scrap Suppliers', scrap_category: 'Rolling Kechi', scrap_rcv_kg: 12800, truck_no: 'TR-8812', gross_weight: 22000, value_tare: 9200, rate_per_kg: 44, total_cost: 563200, yard_location: 'Bay B' },
  { date: '2026-08-22', supplier_name: 'Alpha Alloys', scrap_category: 'Plate Cutting', scrap_rcv_kg: 9500, truck_no: 'TR-5034', gross_weight: 18500, value_tare: 9000, rate_per_kg: 40, total_cost: 380000, yard_location: 'Bay A' },
  { date: '2026-08-23', supplier_name: 'Apex Scrap Suppliers', scrap_category: 'LC Scrap', scrap_rcv_kg: 16500, truck_no: 'TR-2041', gross_weight: 26000, value_tare: 9500, rate_per_kg: 42, total_cost: 693000, yard_location: 'Bay B' }
];

const initialFurnaceLogs = [
  { date: '2026-08-20', furnace_no: 'Furnace 01', heat_no: 'H-260820A', scrap_input_kg: 12000, runtime_min: 52, used_patching_powder_kg: 150, used_patching_forma_kg: 1, tapping_temp_c: 1540, liquid_steel_tapped_kg: 10800, power_consumed_kwh: 7200, shift_id: 'A', furnace_master: 'Kabir Ahmed', yield_pct: 90.0 },
  { date: '2026-08-21', furnace_no: 'Furnace 01', heat_no: 'H-260821A', scrap_input_kg: 13000, runtime_min: 55, used_patching_powder_kg: 180, used_patching_forma_kg: 1, tapping_temp_c: 1560, liquid_steel_tapped_kg: 11440, power_consumed_kwh: 7800, shift_id: 'B', furnace_master: 'Zahirul Haque', yield_pct: 88.0 },
  { date: '2026-08-22', furnace_no: 'Furnace 02', heat_no: 'H-260822A', scrap_input_kg: 11500, runtime_min: 48, used_patching_powder_kg: 120, used_patching_forma_kg: 0, tapping_temp_c: 1550, liquid_steel_tapped_kg: 10465, power_consumed_kwh: 6900, shift_id: 'C', furnace_master: 'Ataur Rahman', yield_pct: 91.0 },
  { date: '2026-08-23', furnace_no: 'Furnace 01', heat_no: 'H-260823A', scrap_input_kg: 12500, runtime_min: 50, used_patching_powder_kg: 140, used_patching_forma_kg: 1, tapping_temp_c: 1545, liquid_steel_tapped_kg: 11250, power_consumed_kwh: 7500, shift_id: 'A', furnace_master: 'Kabir Ahmed', yield_pct: 90.0 }
];

const initialBilletData = [
  { date: '2026-08-20', billet_size_section: '100x100mm x 6m', billet_output_kg: 10500, scull_loss_kg: 1500, billet_yield_pct: 87.5, billet_stock_kg: 50000, heat_no: 'H-260820A' },
  { date: '2026-08-21', billet_size_section: '130x130mm x 6m', billet_output_kg: 11100, scull_loss_kg: 1900, billet_yield_pct: 85.38, billet_stock_kg: 61100, heat_no: 'H-260821A' },
  { date: '2026-08-22', billet_size_section: '100x100mm x 6m', billet_output_kg: 10200, scull_loss_kg: 1300, billet_yield_pct: 88.7, billet_stock_kg: 71300, heat_no: 'H-260822A' },
  { date: '2026-08-23', billet_size_section: '100x100mm x 6m', billet_output_kg: 11000, scull_loss_kg: 1500, billet_yield_pct: 88.0, billet_stock_kg: 82300, heat_no: 'H-260823A' }
];

const initialRollingData = [
  { date: '2026-08-20', billet_input_kg: 10000, rod_size: '12MM', rod_production_kg: 9600, rod_loss_kg: 400, rod_yield_pct: 96, rod_stock_kg: 145000 },
  { date: '2026-08-21', billet_input_kg: 11000, rod_size: '16MM', rod_production_kg: 10580, rod_loss_kg: 420, rod_yield_pct: 96.18, rod_stock_kg: 155580 },
  { date: '2026-08-22', billet_input_kg: 10000, rod_size: '20MM', rod_production_kg: 9550, rod_loss_kg: 450, rod_yield_pct: 95.5, rod_stock_kg: 165130 },
  { date: '2026-08-23', billet_input_kg: 10500, rod_size: '12MM', rod_production_kg: 10100, rod_loss_kg: 400, rod_yield_pct: 96.19, rod_stock_kg: 175230 }
];

const initialDispatchData = [
  { date: '2026-08-20', customer_name: 'Metro Infrastructures', order_no: 'ORD-502', challan_no: 'CH-260820A', vehicle_no: 'TR-2005', dispatch_qty_kg: 8000, rate_per_kg: 92, total_sales_value: 736000, payment_status: 'Paid', rod_size: '12MM' },
  { date: '2026-08-21', customer_name: 'Bengal Housing Ltd', order_no: 'ORD-503', challan_no: 'CH-260821A', vehicle_no: 'TR-1049', dispatch_qty_kg: 12000, rate_per_kg: 94, total_sales_value: 1128000, payment_status: 'Partial', rod_size: '16MM' },
  { date: '2026-08-22', customer_name: 'Sikder Builders', order_no: 'ORD-504', challan_no: 'CH-260822A', vehicle_no: 'TR-7720', dispatch_qty_kg: 9500, rate_per_kg: 92, total_sales_value: 874000, payment_status: 'Pending', rod_size: '20MM' },
  { date: '2026-08-23', customer_name: 'Metro Infrastructures', order_no: 'ORD-505', challan_no: 'CH-260823A', vehicle_no: 'TR-3011', dispatch_qty_kg: 10000, rate_per_kg: 93, total_sales_value: 930000, payment_status: 'Paid', rod_size: '12MM' }
];

const initialDowntimeData = [
  { date: '2026-08-20', billet_breakdown_min: 45, rolling_breakdown_min: 0, breakdown_category: 'Electrical', root_cause_notes: 'CCM mold stirrer sensor replacement', shift_code: 'A', action_taken: 'Replaced inductive sensor' },
  { date: '2026-08-21', billet_breakdown_min: 0, rolling_breakdown_min: 90, breakdown_category: 'Roll Changing', root_cause_notes: 'Scheduled changeover to 16MM guide rolls', shift_code: 'B', action_taken: 'Replaced 12mm sizing blocks' },
  { date: '2026-08-22', billet_breakdown_min: 30, rolling_breakdown_min: 0, breakdown_category: 'Mechanical', root_cause_notes: 'Ladle slide-gate nozzle alignment checks', shift_code: 'C', action_taken: 'Re-aligned cylinder guides' }
];

const initialExpenseData = [
  { date: '2026-08-20', voucher_no: 'EXP-260820-01', expense_head: 'Furnace Refractory Consumables', amount: 154000, paid_to: 'Refractory Solutions Ltd', payment_mode: 'Bank Transfer', approved_by: 'B. H. Chowdhury' },
  { date: '2026-08-21', voucher_no: 'EXP-260821-01', expense_head: 'Electricity Utilities Billing', amount: 170400, paid_to: 'DPDC Power Authority', payment_mode: 'Bank Transfer', approved_by: 'B. H. Chowdhury' },
  { date: '2026-08-22', voucher_no: 'EXP-260822-01', expense_head: 'Office Stationary & Spares', amount: 12500, paid_to: 'Karim Stationery Store', payment_mode: 'Cash', approved_by: 'Masum Billah' }
];

export default function ReportsAndAnalyticsPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';

  // Filters State
  const [reportType, setReportType] = useState<string>('daily-production');
  const [dateRange, setDateRange] = useState<string>('this-month');
  const [startDate, setStartDate] = useState<string>('2026-08-01');
  const [endDate, setEndDate] = useState<string>('2026-08-31');
  const [viewMode, setViewMode] = useState<'table' | 'charts'>('table');

  const cellPadding = isCompact ? 'px-3 py-1.5 text-[11px]' : 'px-4 py-2.5 text-xs';

  // Quick Range Picker Handler
  const handleRangeChange = (range: string) => {
    setDateRange(range);
    const today = new Date('2026-08-23'); // Standard mock date reference
    if (range === 'today') {
      setStartDate('2026-08-23');
      setEndDate('2026-08-23');
    } else if (range === 'this-week') {
      setStartDate('2026-08-17'); // Mon
      setEndDate('2026-08-23');   // Sun
    } else if (range === 'this-month') {
      setStartDate('2026-08-01');
      setEndDate('2026-08-31');
    }
  };

  // Date Filtering Helper
  const filterByDates = (itemDate: string) => {
    return itemDate >= startDate && itemDate <= endDate;
  };

  // Dynamic Calculations for Reports
  const reportData = useMemo(() => {
    const scrap = initialScrapData.filter(d => filterByDates(d.date));
    const furnace = initialFurnaceLogs.filter(d => filterByDates(d.date));
    const billet = initialBilletData.filter(d => filterByDates(d.date));
    const rolling = initialRollingData.filter(d => filterByDates(d.date));
    const dispatch = initialDispatchData.filter(d => filterByDates(d.date));
    const downtime = initialDowntimeData.filter(d => filterByDates(d.date));
    const expenses = initialExpenseData.filter(d => filterByDates(d.date));

    // 1. Daily Production Sheet
    if (reportType === 'daily-production') {
      const dates = Array.from(new Set([
        ...scrap.map(d => d.date),
        ...furnace.map(d => d.date),
        ...billet.map(d => d.date),
        ...rolling.map(d => d.date),
        ...dispatch.map(d => d.date)
      ])).sort();

      return dates.map(dt => {
        const scQty = scrap.filter(s => s.date === dt).reduce((sum, s) => sum + s.scrap_rcv_kg, 0) / 1000;
        const fnHeats = furnace.filter(f => f.date === dt).length;
        const ccmQty = billet.filter(b => b.date === dt).reduce((sum, b) => sum + b.billet_output_kg, 0) / 1000;
        const rollQty = rolling.filter(r => r.date === dt).reduce((sum, r) => sum + r.rod_production_kg, 0) / 1000;
        const dsQty = dispatch.filter(d => d.date === dt).reduce((sum, d) => sum + d.dispatch_qty_kg, 0) / 1000;

        return {
          date: dt,
          scrap_rcv_mt: scQty,
          heats_count: fnHeats,
          billet_output_mt: ccmQty,
          rod_output_mt: rollQty,
          dispatch_mt: dsQty
        };
      });
    }

    // 2. Monthly Executive Summary
    if (reportType === 'monthly-executive') {
      // Month-wise group (mocking for August 2026)
      const totalScrap = scrap.reduce((sum, s) => sum + s.scrap_rcv_kg, 0) / 1000;
      const totalBillet = billet.reduce((sum, b) => sum + b.billet_output_kg, 0) / 1000;
      const totalRod = rolling.reduce((sum, r) => sum + r.rod_production_kg, 0) / 1000;
      const totalDispatch = dispatch.reduce((sum, d) => sum + d.dispatch_qty_kg, 0) / 1000;
      const totalExp = expenses.reduce((sum, e) => sum + e.amount, 0);

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
    if (reportType === 'party-customer') {
      const parties: { [key: string]: any } = {};
      dispatch.forEach(d => {
        if (!parties[d.customer_name]) {
          parties[d.customer_name] = { customer_name: d.customer_name, total_qty_mt: 0, total_sales: 0, paid: 0, pending: 0, challans: [] };
        }
        parties[d.customer_name].total_qty_mt += d.dispatch_qty_kg / 1000;
        parties[d.customer_name].total_sales += d.total_sales_value;
        if (d.payment_status === 'Paid') parties[d.customer_name].paid += d.total_sales_value;
        else if (d.payment_status === 'Partial') {
          parties[d.customer_name].paid += d.total_sales_value * 0.5;
          parties[d.customer_name].pending += d.total_sales_value * 0.5;
        } else {
          parties[d.customer_name].pending += d.total_sales_value;
        }
        parties[d.customer_name].challans.push(d.challan_no);
      });

      return Object.values(parties);
    }

    // 4. Supplier Scrap Summary
    if (reportType === 'supplier-scrap') {
      const suppliers: { [key: string]: any } = {};
      scrap.forEach(s => {
        const key = `${s.supplier_name}-${s.scrap_category}`;
        if (!suppliers[key]) {
          suppliers[key] = { supplier_name: s.supplier_name, scrap_category: s.scrap_category, total_qty_mt: 0, total_cost: 0 };
        }
        suppliers[key].total_qty_mt += s.scrap_rcv_kg / 1000;
        suppliers[key].total_cost += s.total_cost;
      });
      return Object.values(suppliers);
    }

    // 5. Size-Wise Rebar Production Report
    if (reportType === 'size-wise-rebar') {
      const sizes: { [key: string]: any } = {};
      rolling.forEach(r => {
        if (!sizes[r.rod_size]) {
          sizes[r.rod_size] = { rod_size: r.rod_size, billet_input_mt: 0, production_mt: 0, loss_mt: 0, avg_yield_pct: 0, runs: 0 };
        }
        sizes[r.rod_size].billet_input_mt += r.billet_input_kg / 1000;
        sizes[r.rod_size].production_mt += r.rod_production_kg / 1000;
        sizes[r.rod_size].loss_mt += r.rod_loss_kg / 1000;
        sizes[r.rod_size].avg_yield_pct += r.rod_yield_pct;
        sizes[r.rod_size].runs += 1;
      });

      return Object.values(sizes).map((s: any) => ({
        ...s,
        avg_yield_pct: parseFloat((s.avg_yield_pct / s.runs).toFixed(2))
      }));
    }

    // 6. Billet Casting & Heat Log Report
    if (reportType === 'billet-casting') {
      return billet.map(b => {
        const matchingHeat = furnace.find(f => f.heat_no === b.heat_no) || { scrap_input_kg: b.billet_output_kg + b.scull_loss_kg, yield_pct: b.billet_yield_pct };
        return {
          date: b.date,
          heat_no: b.heat_no,
          billet_size: b.billet_size_section,
          scrap_input_mt: (matchingHeat.scrap_input_kg / 1000).toFixed(1),
          billet_output_mt: (b.billet_output_kg / 1000).toFixed(1),
          scull_loss_mt: (b.scull_loss_kg / 1000).toFixed(1),
          casting_yield: b.billet_yield_pct
        };
      });
    }

    // 7. Plant Breakdown & Downtime Audit
    if (reportType === 'plant-breakdown') {
      const categories: { [key: string]: any } = {};
      downtime.forEach(d => {
        if (!categories[d.breakdown_category]) {
          categories[d.breakdown_category] = { category: d.breakdown_category, melt_shop_min: 0, rolling_mill_min: 0, incidents: 0 };
        }
        categories[d.breakdown_category].melt_shop_min += d.billet_breakdown_min;
        categories[d.breakdown_category].rolling_mill_min += d.rolling_breakdown_min;
        categories[d.breakdown_category].incidents += 1;
      });
      return Object.values(categories);
    }

    return [];
  }, [reportType, startDate, endDate]);

  // Export to Excel / CSV
  const handleExportExcel = () => {
    let headers: string[] = [];
    let rows: any[] = [];
    let filename = `report_${reportType}.csv`;

    if (reportType === 'daily-production') {
      headers = ['Date', 'Scrap Received (MT)', 'Heats Run count', 'Billet Output (MT)', 'Rod Production (MT)', 'Despatch (MT)'];
      rows = reportData.map((r: any) => [r.date, r.scrap_rcv_mt, r.heats_count, r.billet_output_mt, r.rod_output_mt, r.dispatch_mt]);
    } else if (reportType === 'monthly-executive') {
      headers = ['Month', 'Scrap Intake (MT)', 'Billet Smelted (MT)', 'Rod Production (MT)', 'Dispatch (MT)', 'Total Expenses (৳)'];
      rows = reportData.map((r: any) => [r.month, r.scrap_mt, r.billet_mt, r.rod_mt, r.dispatch_mt, r.expenses_val]);
    } else if (reportType === 'party-customer') {
      headers = ['Customer Name', 'Total Qty (MT)', 'Total Sales Value (৳)', 'Paid Value (৳)', 'Outstanding Bal (৳)', 'Associated Challans'];
      rows = reportData.map((r: any) => [r.customer_name, r.total_qty_mt, r.total_sales, r.paid, r.pending, r.challans.join('; ')]);
    } else if (reportType === 'supplier-scrap') {
      headers = ['Supplier Name', 'Scrap Category', 'Total Intake (MT)', 'Total Sourcing Cost (৳)'];
      rows = reportData.map((r: any) => [r.supplier_name, r.scrap_category, r.total_qty_mt, r.total_cost]);
    } else if (reportType === 'size-wise-rebar') {
      headers = ['Rod Size', 'Billet Charged (MT)', 'Rebar Output (MT)', 'Shearing Loss (MT)', 'Average Yield %'];
      rows = reportData.map((r: any) => [r.rod_size, r.billet_input_mt, r.production_mt, r.loss_mt, r.avg_yield_pct]);
    } else if (reportType === 'billet-casting') {
      headers = ['Date', 'Heat No', 'Billet Section Size', 'Scrap Charged (MT)', 'Billet Output (MT)', 'Scull Loss (MT)', 'Casting Yield %'];
      rows = reportData.map((r: any) => [r.date, r.heat_no, r.billet_size, r.scrap_input_mt, r.billet_output_mt, r.scull_loss_mt, r.casting_yield]);
    } else if (reportType === 'plant-breakdown') {
      headers = ['Breakdown Category', 'Melt Shop Minutes', 'Rolling Mill Minutes', 'Incidents Count'];
      rows = reportData.map((r: any) => [r.category, r.melt_shop_min, r.rolling_mill_min, r.incidents]);
    }

    exportToExcel(headers, rows, filename);
  };

  // PDF Trigger
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 print:bg-white print:text-black">
      
      {/* Printable Corporate Letterhead Header (Visible in print only) */}
      <div className="hidden print:block text-center border-b-2 border-slate-900 pb-5 mb-6 font-sans">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Hi-Tech Steel & Re-Rolling Mills Ltd.</h1>
        <p className="text-[10px] text-slate-600 font-mono tracking-widest mt-1">EXECUTIVE PRODUCTION MIS REPORT & COMPLIANCE LEDGER</p>
        <p className="text-[9px] text-slate-500 mt-0.5">Plot 14, Industrial Area, Chittagong, Bangladesh</p>
        <div className="flex justify-between text-[10px] font-mono mt-4 border-t border-slate-200 pt-3">
          <span>REPORT: <strong className="uppercase">{reportType.replace('-', ' ')}</strong></span>
          <span>DATE RANGE: <strong>{startDate} to {endDate}</strong></span>
          <span>GENERATED BY: <strong>{user?.name}</strong></span>
        </div>
      </div>

      {/* Title Bar (Hidden in print) */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-3 print:hidden">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wider font-mono">Reports & Analytics Console</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">One-click automated industrial reporting engine mapping all 7 original workbook production indicators.</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handleExportExcel}
            className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Export Excel
          </button>
          <button 
            onClick={handlePrintPDF}
            className="px-4 py-2 bg-[#C5A059] hover:bg-[#B48F48] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <span>Print / PDF Format</span> 🖨️
          </button>
        </div>
      </div>

      {/* Filtering Control Bar (Hidden in print) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs print:hidden">
        
        {/* Date Range Select */}
        <div className="space-y-1.5">
          <label className="text-[9px] uppercase font-bold text-slate-450 tracking-wider font-mono">Range</label>
          <select 
            value={dateRange}
            onChange={(e) => handleRangeChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-250 text-xs px-3 py-2 rounded-xl focus:outline-none"
          >
            <option value="this-month">This Month (Aug 2026)</option>
            <option value="this-week">This Week</option>
            <option value="today">Today</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {/* Custom Start Date */}
        <div className="space-y-1.5">
          <label className="text-[9px] uppercase font-bold text-slate-450 tracking-wider font-mono">Start Date</label>
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setDateRange('custom'); }}
            className="w-full bg-slate-50 border border-slate-250 text-xs px-3 py-2 rounded-xl focus:outline-none"
          />
        </div>

        {/* Custom End Date */}
        <div className="space-y-1.5">
          <label className="text-[9px] uppercase font-bold text-slate-450 tracking-wider font-mono">End Date</label>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setDateRange('custom'); }}
            className="w-full bg-slate-50 border border-slate-250 text-xs px-3 py-2 rounded-xl focus:outline-none"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="space-y-1.5">
          <label className="text-[9px] uppercase font-bold text-slate-450 tracking-wider font-mono">Analysis View</label>
          <div className="grid grid-cols-2 gap-1 bg-slate-50 border border-slate-250 p-0.5 rounded-xl">
            <button 
              onClick={() => setViewMode('table')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Grid Table
            </button>
            <button 
              onClick={() => setViewMode('charts')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${viewMode === 'charts' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
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
          <h3 className="px-3 text-[9px] uppercase tracking-widest font-extrabold text-slate-400 font-mono">PRE-CONFIGURED SHEETS</h3>
          
          <div className="space-y-1 bg-white border border-slate-200 p-2.5 rounded-2xl shadow-2xs">
            <button 
              onClick={() => setReportType('daily-production')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${reportType === 'daily-production' ? 'bg-[#FAF6EE] text-[#B48F48]' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              📋 Daily Production Sheet
            </button>
            <button 
              onClick={() => setReportType('monthly-executive')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${reportType === 'monthly-executive' ? 'bg-[#FAF6EE] text-[#B48F48]' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              📅 Monthly Executive Summary
            </button>
            <button 
              onClick={() => setReportType('party-customer')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${reportType === 'party-customer' ? 'bg-[#FAF6EE] text-[#B48F48]' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              🏢 Party-Wise Customer Ledger
            </button>
            <button 
              onClick={() => setReportType('supplier-scrap')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${reportType === 'supplier-scrap' ? 'bg-[#FAF6EE] text-[#B48F48]' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              🚛 Supplier Scrap Summary
            </button>
            <button 
              onClick={() => setReportType('size-wise-rebar')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${reportType === 'size-wise-rebar' ? 'bg-[#FAF6EE] text-[#B48F48]' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              📏 Size-Wise Rebar Report
            </button>
            <button 
              onClick={() => setReportType('billet-casting')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${reportType === 'billet-casting' ? 'bg-[#FAF6EE] text-[#B48F48]' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              🔥 Billet Casting Heat Log
            </button>
            <button 
              onClick={() => setReportType('plant-breakdown')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${reportType === 'plant-breakdown' ? 'bg-[#FAF6EE] text-[#B48F48]' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              ⚡ Plant Breakdown Audit
            </button>
          </div>
        </div>

        {/* Right Content Panel */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden print:border-0 print:shadow-none">
          
          {viewMode === 'table' ? (
            <div className="overflow-x-auto">
              
              {/* Daily Production Table */}
              {reportType === 'daily-production' && (
                <table className="w-full text-left border-collapse font-mono">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-150 text-[10px] uppercase font-mono text-slate-450">
                      <th className={cellPadding}>Date</th>
                      <th className={`${cellPadding} text-right`}>Scrap Received (MT)</th>
                      <th className={`${cellPadding} text-right`}>Heats run count</th>
                      <th className={`${cellPadding} text-right`}>Billet Output (MT)</th>
                      <th className={`${cellPadding} text-right`}>Rod Production (MT)</th>
                      <th className={`${cellPadding} text-right`}>Sales Despatched (MT)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-xs">
                    {reportData.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/40">
                        <td className={`${cellPadding} font-bold`}>{row.date}</td>
                        <td className={`${cellPadding} text-right`}>{row.scrap_rcv_mt.toFixed(1)}</td>
                        <td className={`${cellPadding} text-right`}>{row.heats_count}</td>
                        <td className={`${cellPadding} text-right`}>{row.billet_output_mt.toFixed(1)}</td>
                        <td className={`${cellPadding} text-right font-semibold text-emerald-600`}>{row.rod_output_mt.toFixed(1)}</td>
                        <td className={`${cellPadding} text-right font-bold text-[#B48F48]`}>{row.dispatch_mt.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Monthly Executive Summary */}
              {reportType === 'monthly-executive' && (
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
                        <td className={`${cellPadding} text-right`}>{row.scrap_mt.toFixed(1)}</td>
                        <td className={`${cellPadding} text-right`}>{row.billet_mt.toFixed(1)}</td>
                        <td className={`${cellPadding} text-right font-semibold text-emerald-600`}>{row.rod_mt.toFixed(1)}</td>
                        <td className={`${cellPadding} text-right`}>{row.dispatch_mt.toFixed(1)}</td>
                        <td className={`${cellPadding} text-right font-bold text-rose-650`}>৳{row.expenses_val.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Party-Wise Customer Ledger */}
              {reportType === 'party-customer' && (
                <table className="w-full text-left border-collapse font-mono">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-150 text-[10px] uppercase font-mono text-slate-450">
                      <th className={cellPadding}>Customer Name</th>
                      <th className={`${cellPadding} text-right`}>Total dispatch (MT)</th>
                      <th className={`${cellPadding} text-right`}>Invoice Value</th>
                      <th className={`${cellPadding} text-right`}>Paid Amt</th>
                      <th className={`${cellPadding} text-right`}>Outstanding Balance</th>
                      <th className={cellPadding}>Challan Histories</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-xs">
                    {reportData.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/40">
                        <td className={`${cellPadding} font-bold`}>{row.customer_name}</td>
                        <td className={`${cellPadding} text-right`}>{row.total_qty_mt.toFixed(1)}</td>
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
              {reportType === 'supplier-scrap' && (
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
                        <td className={`${cellPadding} text-right`}>{row.total_qty_mt.toFixed(1)}</td>
                        <td className={`${cellPadding} text-right font-bold text-emerald-600`}>৳{row.total_cost.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Size-Wise Rebar Production Report */}
              {reportType === 'size-wise-rebar' && (
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
                        <td className={`${cellPadding} text-right`}>{row.billet_input_mt.toFixed(1)}</td>
                        <td className={`${cellPadding} text-right font-semibold text-emerald-600`}>{row.production_mt.toFixed(1)}</td>
                        <td className={`${cellPadding} text-right`}>{row.loss_mt.toFixed(1)}</td>
                        <td className={`${cellPadding} text-right font-bold text-[#B48F48]`}>{row.avg_yield_pct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Billet Casting & Heat Log Report */}
              {reportType === 'billet-casting' && (
                <table className="w-full text-left border-collapse font-mono">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-150 text-[10px] uppercase font-mono text-slate-450">
                      <th className={cellPadding}>Date</th>
                      <th className={cellPadding}>Heat No</th>
                      <th className={cellPadding}>Billet Size</th>
                      <th className={`${cellPadding} text-right`}>Scrap Input (MT)</th>
                      <th className={`${cellPadding} text-right`}>Billet Output (MT)</th>
                      <th className={`${cellPadding} text-right`}>Scull/Refractory Loss (MT)</th>
                      <th className={`${cellPadding} text-right`}>Casting Yield</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-xs">
                    {reportData.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/40">
                        <td className={cellPadding}>{row.date}</td>
                        <td className={`${cellPadding} font-bold text-slate-900`}>{row.heat_no}</td>
                        <td className={cellPadding}>{row.billet_size}</td>
                        <td className={`${cellPadding} text-right`}>{row.scrap_input_mt}</td>
                        <td className={`${cellPadding} text-right font-semibold text-[#B48F48]`}>{row.billet_output_mt}</td>
                        <td className={`${cellPadding} text-right`}>{row.scull_loss_mt}</td>
                        <td className={`${cellPadding} text-right font-bold text-rose-600`}>{row.casting_yield}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Plant Breakdown & Downtime Audit */}
              {reportType === 'plant-breakdown' && (
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

            </div>
          ) : (
            <div className="p-8 space-y-6 flex flex-col items-center">
              
              {/* Dynamic SVG Visual Charts */}
              <div className="w-full max-w-lg bg-slate-50 border border-slate-150 p-5 rounded-2xl">
                <h4 className="text-xs font-bold text-slate-700 font-mono mb-4 text-center uppercase">
                  Analysis Chart: {reportType.replace('-', ' ')}
                </h4>
                
                {reportType === 'plant-breakdown' ? (
                  <div className="space-y-4">
                    <p className="text-[10px] text-slate-450 text-center font-mono">Breakdown minutes breakdown per category</p>
                    <div className="space-y-3">
                      {reportData.map((item: any, idx: number) => {
                        const totalMin = item.melt_shop_min + item.rolling_mill_min;
                        return (
                          <div key={idx} className="space-y-1 text-xs">
                            <div className="flex justify-between font-semibold">
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
