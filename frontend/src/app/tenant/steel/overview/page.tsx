'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

// Types representing steel manufacturing records
interface ScrapRecord {
  date: string;
  supplier_name: string;
  scrap_category: string;
  scrap_rcv_kg: number;
  truck_no: string;
  gross_weight: number;
  value_tare: number;
  rate_per_kg: number;
}

interface FurnaceRecord {
  id: number;
  heat_no: string;
  date: string;
  furnace_no: string;
  shift_id: string;
  scrap_input_kg: number;
  runtime_min: number;
  tapping_temp_c?: number;
  liquid_steel_tapped_kg: number;
  yield_pct: number;
  power_consumed_kwh: number;
  furnace_master?: string;
}

interface BilletRecord {
  id: number;
  date: string;
  furnace_no: string;
  heat_no: string;
  billet_size_section: string;
  steel_tapped_input_kg: number;
  billet_output_kg: number;
  scull_loss_kg: number;
  billet_yield_pct: number;
  billet_stock_kg?: number;
}

interface RollingRecord {
  id: number;
  date: string;
  billet_input_kg: number;
  rod_size: string;
  rod_production_kg: number;
  rod_loss_kg: number;
  rod_yield_pct: number;
  rod_stock_kg: number;
  grade?: string;
}

interface DispatchRecord {
  id: number;
  date: string;
  customer_name: string;
  dispatch_qty_kg: number;
  rate_per_kg: number;
  total_sales_value: number;
  payment_status: 'Paid' | 'Partial' | 'Pending';
  rod_size: string;
  challan_no: string;
  contact_info?: string;
  vehicle_no?: string;
}

interface DowntimeRecord {
  id: number;
  date: string;
  ticket_no: string;
  equipment: string;
  billet_breakdown_min: number;
  rolling_breakdown_min: number;
  breakdown_category: string;
  root_cause_notes: string;
}

interface QualityRecord {
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

// Seed data with rich realistic steel mill records
const seedScrap: ScrapRecord[] = [
  { date: '2026-08-18', supplier_name: 'Metro Scrap Traders', scrap_category: 'HMS-1 (Heavy Melting)', scrap_rcv_kg: 24500, truck_no: 'DHAKA-METRO-11-2041', gross_weight: 34500, value_tare: 10000, rate_per_kg: 52.5 },
  { date: '2026-08-19', supplier_name: 'Apex Scrap Suppliers', scrap_category: 'Rolling Kechi / End Cuts', scrap_rcv_kg: 18200, truck_no: 'CTG-METRO-14-8812', gross_weight: 28200, value_tare: 10000, rate_per_kg: 49.0 },
  { date: '2026-08-20', supplier_name: 'Metal Recyclers Corp', scrap_category: 'HMS-2 & Bundle Scrap', scrap_rcv_kg: 21000, truck_no: 'DHAKA-METRO-15-1024', gross_weight: 31000, value_tare: 10000, rate_per_kg: 51.0 },
  { date: '2026-08-21', supplier_name: 'Apex Scrap Suppliers', scrap_category: 'Ship Breaking Plate Cutting', scrap_rcv_kg: 19800, truck_no: 'CTG-METRO-12-5034', gross_weight: 29800, value_tare: 10000, rate_per_kg: 54.5 },
  { date: '2026-08-22', supplier_name: 'Alpha Alloys Sourcing', scrap_category: 'Direct Reduced Iron (DRI / Sponge)', scrap_rcv_kg: 15500, truck_no: 'DHAKA-METRO-19-9033', gross_weight: 25500, value_tare: 10000, rate_per_kg: 56.0 },
  { date: '2026-08-23', supplier_name: 'Apex Scrap Suppliers', scrap_category: 'HMS-1 (Heavy Melting)', scrap_rcv_kg: 26000, truck_no: 'DHAKA-METRO-14-2041', gross_weight: 36000, value_tare: 10000, rate_per_kg: 53.0 },
  { date: '2026-08-24', supplier_name: 'Metal Recyclers Corp', scrap_category: 'Ship Breaking Plate Cutting', scrap_rcv_kg: 28500, truck_no: 'CTG-METRO-18-4021', gross_weight: 38500, value_tare: 10000, rate_per_kg: 55.0 }
];

const seedFurnace: FurnaceRecord[] = [
  { id: 1, heat_no: 'H-260818A', date: '2026-08-18', furnace_no: 'Furnace 01', shift_id: 'A', scrap_input_kg: 24000, runtime_min: 145, tapping_temp_c: 1610, liquid_steel_tapped_kg: 22200, yield_pct: 92.50, power_consumed_kwh: 12800, furnace_master: 'Kabir Ahmed' },
  { id: 2, heat_no: 'H-260819A', date: '2026-08-19', furnace_no: 'Furnace 02', shift_id: 'B', scrap_input_kg: 18500, runtime_min: 130, tapping_temp_c: 1625, liquid_steel_tapped_kg: 17150, yield_pct: 92.70, power_consumed_kwh: 9800, furnace_master: 'Zahirul Haque' },
  { id: 3, heat_no: 'H-260820A', date: '2026-08-20', furnace_no: 'Furnace 01', shift_id: 'A', scrap_input_kg: 21500, runtime_min: 140, tapping_temp_c: 1605, liquid_steel_tapped_kg: 19900, yield_pct: 92.56, power_consumed_kwh: 11400, furnace_master: 'Kabir Ahmed' },
  { id: 4, heat_no: 'H-260821A', date: '2026-08-21', furnace_no: 'Furnace 02', shift_id: 'B', scrap_input_kg: 20000, runtime_min: 135, tapping_temp_c: 1618, liquid_steel_tapped_kg: 18560, yield_pct: 92.80, power_consumed_kwh: 10600, furnace_master: 'Ataur Rahman' },
  { id: 5, heat_no: 'H-260822A', date: '2026-08-22', furnace_no: 'Furnace 01', shift_id: 'C', scrap_input_kg: 16000, runtime_min: 115, tapping_temp_c: 1595, liquid_steel_tapped_kg: 14800, yield_pct: 92.50, power_consumed_kwh: 8500, furnace_master: 'Kabir Ahmed' },
  { id: 6, heat_no: 'H-260823A', date: '2026-08-23', furnace_no: 'Furnace 02', shift_id: 'A', scrap_input_kg: 25500, runtime_min: 150, tapping_temp_c: 1620, liquid_steel_tapped_kg: 23660, yield_pct: 92.78, power_consumed_kwh: 13500, furnace_master: 'Zahirul Haque' },
  { id: 7, heat_no: 'H-260824A', date: '2026-08-24', furnace_no: 'Furnace 01', shift_id: 'A', scrap_input_kg: 28000, runtime_min: 160, tapping_temp_c: 1630, liquid_steel_tapped_kg: 26040, yield_pct: 93.00, power_consumed_kwh: 14800, furnace_master: 'Kabir Ahmed' }
];

const seedBillet: BilletRecord[] = [
  { id: 1, date: '2026-08-18', furnace_no: 'Furnace 01', heat_no: 'H-260818A', billet_size_section: '100x100mm x 6m', steel_tapped_input_kg: 22200, billet_output_kg: 21600, scull_loss_kg: 600, billet_yield_pct: 97.30, billet_stock_kg: 64000 },
  { id: 2, date: '2026-08-19', furnace_no: 'Furnace 02', heat_no: 'H-260819A', billet_size_section: '125x125mm x 6m', steel_tapped_input_kg: 17150, billet_output_kg: 16700, scull_loss_kg: 450, billet_yield_pct: 97.38, billet_stock_kg: 72000 },
  { id: 3, date: '2026-08-20', furnace_no: 'Furnace 01', heat_no: 'H-260820A', billet_size_section: '100x100mm x 6m', steel_tapped_input_kg: 19900, billet_output_kg: 19380, scull_loss_kg: 520, billet_yield_pct: 97.39, billet_stock_kg: 81000 },
  { id: 4, date: '2026-08-21', furnace_no: 'Furnace 02', heat_no: 'H-260821A', billet_size_section: '130x130mm x 6m', steel_tapped_input_kg: 18560, billet_output_kg: 18080, scull_loss_kg: 480, billet_yield_pct: 97.41, billet_stock_kg: 89000 },
  { id: 5, date: '2026-08-22', furnace_no: 'Furnace 01', heat_no: 'H-260822A', billet_size_section: '100x100mm x 6m', steel_tapped_input_kg: 14800, billet_output_kg: 14420, scull_loss_kg: 380, billet_yield_pct: 97.43, billet_stock_kg: 95000 },
  { id: 6, date: '2026-08-23', furnace_no: 'Furnace 02', heat_no: 'H-260823A', billet_size_section: '125x125mm x 6m', steel_tapped_input_kg: 23660, billet_output_kg: 23070, scull_loss_kg: 590, billet_yield_pct: 97.51, billet_stock_kg: 108000 },
  { id: 7, date: '2026-08-24', furnace_no: 'Furnace 01', heat_no: 'H-260824A', billet_size_section: '100x100mm x 6m', steel_tapped_input_kg: 26040, billet_output_kg: 25410, scull_loss_kg: 630, billet_yield_pct: 97.58, billet_stock_kg: 122000 }
];

const seedRolling: RollingRecord[] = [
  { id: 1, date: '2026-08-18', billet_input_kg: 21600, rod_size: '16MM', rod_production_kg: 20736, rod_loss_kg: 864, rod_yield_pct: 96.00, rod_stock_kg: 145000, grade: '500W' },
  { id: 2, date: '2026-08-19', billet_input_kg: 16700, rod_size: '12MM', rod_production_kg: 16032, rod_loss_kg: 668, rod_yield_pct: 96.00, rod_stock_kg: 153000, grade: '500W' },
  { id: 3, date: '2026-08-20', billet_input_kg: 19380, rod_size: '16MM', rod_production_kg: 18605, rod_loss_kg: 775, rod_yield_pct: 96.00, rod_stock_kg: 162000, grade: '500W' },
  { id: 4, date: '2026-08-21', billet_input_kg: 18080, rod_size: '20MM', rod_production_kg: 17357, rod_loss_kg: 723, rod_yield_pct: 96.00, rod_stock_kg: 168000, grade: '550D' },
  { id: 5, date: '2026-08-22', billet_input_kg: 14420, rod_size: '10MM', rod_production_kg: 13843, rod_loss_kg: 577, rod_yield_pct: 96.00, rod_stock_kg: 174000, grade: '500W' },
  { id: 6, date: '2026-08-23', billet_input_kg: 23070, rod_size: '16MM', rod_production_kg: 22147, rod_loss_kg: 923, rod_yield_pct: 96.00, rod_stock_kg: 185000, grade: '500W' },
  { id: 7, date: '2026-08-24', billet_input_kg: 25410, rod_size: '25MM', rod_production_kg: 24394, rod_loss_kg: 1016, rod_yield_pct: 96.00, rod_stock_kg: 198000, grade: '500W' }
];

const seedDispatch: DispatchRecord[] = [
  { id: 1, date: '2026-08-18', customer_name: 'Metro Rail Megaproject Corp', dispatch_qty_kg: 18000, rate_per_kg: 94.0, total_sales_value: 1692000, payment_status: 'Paid', rod_size: '16MM', challan_no: 'CH-260818-A', vehicle_no: 'DM-TR-9021' },
  { id: 2, date: '2026-08-19', customer_name: 'Bengal Housing & Infra Ltd', dispatch_qty_kg: 14000, rate_per_kg: 95.5, total_sales_value: 1337000, payment_status: 'Partial', rod_size: '12MM', challan_no: 'CH-260819-B', vehicle_no: 'CTG-TR-4422' },
  { id: 3, date: '2026-08-20', customer_name: 'Standard Builders & Engineers', dispatch_qty_kg: 16500, rate_per_kg: 94.0, total_sales_value: 1551000, payment_status: 'Paid', rod_size: '16MM', challan_no: 'CH-260820-A', vehicle_no: 'DM-TR-1088' },
  { id: 4, date: '2026-08-21', customer_name: 'Elevated Expressway Joint Venture', dispatch_qty_kg: 15000, rate_per_kg: 96.0, total_sales_value: 1440000, payment_status: 'Partial', rod_size: '20MM', challan_no: 'CH-260821-C', vehicle_no: 'DM-TR-5034' },
  { id: 5, date: '2026-08-22', customer_name: 'Sikder Real Estate Ltd', dispatch_qty_kg: 12000, rate_per_kg: 95.0, total_sales_value: 1140000, payment_status: 'Pending', rod_size: '10MM', challan_no: 'CH-260822-A', vehicle_no: 'CTG-TR-1024' },
  { id: 6, date: '2026-08-23', customer_name: 'Metro Rail Megaproject Corp', dispatch_qty_kg: 20000, rate_per_kg: 94.5, total_sales_value: 1890000, payment_status: 'Paid', rod_size: '16MM', challan_no: 'CH-260823-A', vehicle_no: 'DM-TR-8812' },
  { id: 7, date: '2026-08-24', customer_name: 'Padma Bridge Rail Link Hub', dispatch_qty_kg: 22000, rate_per_kg: 93.5, total_sales_value: 2057000, payment_status: 'Paid', rod_size: '25MM', challan_no: 'CH-260824-A', vehicle_no: 'DM-TR-7720' }
];

const seedDowntime: DowntimeRecord[] = [
  { id: 1, date: '2026-08-18', ticket_no: 'DT-1801', equipment: 'Induction Furnace #1 Crucible Tilt', billet_breakdown_min: 25, rolling_breakdown_min: 0, breakdown_category: 'Hydraulics', root_cause_notes: 'Hydraulic cylinder pressure seal leak' },
  { id: 2, date: '2026-08-19', ticket_no: 'DT-1901', equipment: 'CCM Tundish Turret Crane', billet_breakdown_min: 35, rolling_breakdown_min: 0, breakdown_category: 'Mechanical', root_cause_notes: 'Wire rope guide misalignment' },
  { id: 3, date: '2026-08-20', ticket_no: 'DT-2001', equipment: 'Mill Stand 3 Pinion Gearbox', billet_breakdown_min: 0, rolling_breakdown_min: 45, breakdown_category: 'Mechanical', root_cause_notes: 'Bearing temperature high alarm trip' },
  { id: 4, date: '2026-08-21', ticket_no: 'DT-2101', equipment: 'Finishing Block Roll Change', billet_breakdown_min: 0, rolling_breakdown_min: 60, breakdown_category: 'Roll Changing', root_cause_notes: 'Scheduled pass groove changeover to 20MM' },
  { id: 5, date: '2026-08-22', ticket_no: 'DT-2201', equipment: 'Cooling Bed Flying Shear Blade', billet_breakdown_min: 0, rolling_breakdown_min: 20, breakdown_category: 'Electrical', root_cause_notes: 'Optical sensor dust accumulation' },
  { id: 6, date: '2026-08-23', ticket_no: 'DT-2301', equipment: 'Transformer Primary Tap Switch', billet_breakdown_min: 15, rolling_breakdown_min: 0, breakdown_category: 'Electrical', root_cause_notes: 'Overcurrent relay test reset' }
];

const seedQuality: QualityRecord[] = [
  { sample_id: 'SPL-24A-1', rod_size: '25MM', grade: '500W', heat_no: 'H-260824A', testing_date: '2026-08-24', pct_c: 0.22, pct_mn: 0.88, pct_si: 0.24, pct_s: 0.032, pct_p: 0.036, pct_ce: 0.367, yield_strength_n_mm2: 528, tensile_strength_n_mm2: 642, elongation_pct: 18.5, bend_test_result: 'Approved', nominal_mass_g_m: 3.853 },
  { sample_id: 'SPL-23A-1', rod_size: '16MM', grade: '500W', heat_no: 'H-260823A', testing_date: '2026-08-23', pct_c: 0.23, pct_mn: 0.90, pct_si: 0.25, pct_s: 0.034, pct_p: 0.038, pct_ce: 0.380, yield_strength_n_mm2: 535, tensile_strength_n_mm2: 650, elongation_pct: 17.8, bend_test_result: 'Approved', nominal_mass_g_m: 1.580 },
  { sample_id: 'SPL-22A-1', rod_size: '10MM', grade: '500W', heat_no: 'H-260822A', testing_date: '2026-08-22', pct_c: 0.21, pct_mn: 0.82, pct_si: 0.22, pct_s: 0.029, pct_p: 0.031, pct_ce: 0.347, yield_strength_n_mm2: 515, tensile_strength_n_mm2: 625, elongation_pct: 19.2, bend_test_result: 'Approved', nominal_mass_g_m: 0.617 },
  { sample_id: 'SPL-21A-1', rod_size: '20MM', grade: '550D', heat_no: 'H-260821A', testing_date: '2026-08-21', pct_c: 0.24, pct_mn: 0.95, pct_si: 0.26, pct_s: 0.030, pct_p: 0.033, pct_ce: 0.398, yield_strength_n_mm2: 565, tensile_strength_n_mm2: 685, elongation_pct: 16.5, bend_test_result: 'Approved', nominal_mass_g_m: 2.470 },
  { sample_id: 'SPL-20A-1', rod_size: '16MM', grade: '500W', heat_no: 'H-260820A', testing_date: '2026-08-20', pct_c: 0.22, pct_mn: 0.85, pct_si: 0.24, pct_s: 0.035, pct_p: 0.038, pct_ce: 0.362, yield_strength_n_mm2: 520, tensile_strength_n_mm2: 635, elongation_pct: 18.0, bend_test_result: 'Approved', nominal_mass_g_m: 1.580 }
];

export default function SteelOverviewDashboard() {
  // Filters and Metric Toggles
  const [timeframe, setTimeframe] = useState<'7d' | '14d' | '30d' | 'all'>('7d');
  const [selectedFurnace, setSelectedFurnace] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [chartMetric, setChartMetric] = useState<'tonnage' | 'yield' | 'sec' | 'revenue'>('tonnage');
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);
  const [activePipelineStage, setActivePipelineStage] = useState<string>('all');
  const [isLiveSimulating, setIsLiveSimulating] = useState<boolean>(true);
  const [isQuickHeatModalOpen, setIsQuickHeatModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick Heat Form State
  const [newHeat, setNewHeat] = useState({
    furnace_no: 'Furnace 01',
    heat_no: `H-260824B`,
    scrap_input_kg: 25000,
    liquid_steel_tapped_kg: 23250,
    runtime_min: 145,
    tapping_temp_c: 1625,
    power_consumed_kwh: 13200,
    shift_id: 'B',
    furnace_master: 'Kabir Ahmed',
    billet_size: '100x100mm x 6m'
  });

  // State loaded from localStorage or fallbacks
  const [scrapData, setScrapData] = useState<ScrapRecord[]>(seedScrap);
  const [furnaceData, setFurnaceData] = useState<FurnaceRecord[]>(seedFurnace);
  const [billetData, setBilletData] = useState<BilletRecord[]>(seedBillet);
  const [rollingData, setRollingData] = useState<RollingRecord[]>(seedRolling);
  const [dispatchData, setDispatchData] = useState<DispatchRecord[]>(seedDispatch);
  const [downtimeData, setDowntimeData] = useState<DowntimeRecord[]>(seedDowntime);
  const [qualityData, setQualityData] = useState<QualityRecord[]>(seedQuality);

  // Strongly typed Live Digital Twin Equipment
  const [furnace1, setFurnace1] = useState({
    name: 'Induction Furnace 01',
    heatNo: 'H-260824A',
    temp: 1628,
    powerKw: 4850,
    status: 'Refining & Tapping',
    liningHeats: 48,
    maxLiningHeats: 70
  });

  const [furnace2, setFurnace2] = useState({
    name: 'Induction Furnace 02',
    heatNo: 'H-260824B',
    temp: 1545,
    powerKw: 5200,
    status: 'Melting Heavy Scrap',
    liningHeats: 22,
    maxLiningHeats: 70
  });

  const [ccmCaster, setCcmCaster] = useState({
    name: 'CCM Continuous Caster',
    temp: 1525,
    speedMpm: 2.8,
    billetSection: '100x100mm',
    status: 'Casting'
  });

  const [rollingMill, setRollingMill] = useState({
    name: 'Rebar Bar Rolling Mill',
    hourlyTph: 28.5,
    speedMps: 18.5,
    activeSize: '16MM TMT',
    status: 'Rolling Active'
  });

  // Load from Storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loadStore = (key: string, setter: (val: any) => void, fallback: any) => {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setter(parsed);
              return;
            }
          }
        } catch {}
        setter(fallback);
      };

      loadStore('steel_erp_scrap', setScrapData, seedScrap);
      loadStore('steel_erp_furnace', setFurnaceData, seedFurnace);
      loadStore('steel_erp_billet', setBilletData, seedBillet);
      loadStore('steel_erp_rolling', setRollingData, seedRolling);
      loadStore('steel_erp_dispatch', setDispatchData, seedDispatch);
      loadStore('steel_erp_downtime', setDowntimeData, seedDowntime);
      loadStore('steel_erp_quality', setQualityData, seedQuality);
    }
  }, []);

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Live Telemetry Simulation Timer
  useEffect(() => {
    if (!isLiveSimulating) return;
    const interval = setInterval(() => {
      setFurnace1(prev => {
        let newTemp = prev.temp + (Math.floor(Math.random() * 7) - 3);
        let newStatus = prev.status;
        if (newTemp >= 1635) {
          newStatus = 'Tapping to Ladle';
        } else if (newTemp < 1560) {
          newStatus = 'Melting & Deoxidizing';
        }
        return { ...prev, temp: newTemp, status: newStatus, powerKw: 4800 + Math.floor(Math.random() * 150) };
      });

      setFurnace2(prev => {
        let newTemp = prev.temp + 2;
        if (newTemp > 1625) newTemp = 1520;
        return { ...prev, temp: newTemp, powerKw: 5100 + Math.floor(Math.random() * 200) };
      });

      setCcmCaster(prev => {
        let newTemp = prev.temp + (Math.floor(Math.random() * 5) - 2);
        return { ...prev, temp: newTemp, speedMpm: +(2.7 + Math.random() * 0.2).toFixed(2) };
      });

      setRollingMill(prev => {
        return { ...prev, hourlyTph: +(27.5 + Math.random() * 2.0).toFixed(1) };
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [isLiveSimulating]);

  // Filter application
  const filteredData = useMemo(() => {
    const sliceCount = timeframe === '7d' ? 7 : timeframe === '14d' ? 14 : timeframe === '30d' ? 30 : 999;
    
    const scrap = scrapData.slice(-sliceCount);
    const furnace = furnaceData
      .slice(-sliceCount)
      .filter(f => selectedFurnace === 'all' || f.furnace_no === selectedFurnace);
    const billet = billetData
      .slice(-sliceCount)
      .filter(b => selectedFurnace === 'all' || b.furnace_no === selectedFurnace);
    const rolling = rollingData
      .slice(-sliceCount)
      .filter(r => selectedSize === 'all' || r.rod_size === selectedSize);
    const dispatch = dispatchData
      .slice(-sliceCount)
      .filter(d => selectedSize === 'all' || d.rod_size === selectedSize);
    const downtime = downtimeData.slice(-sliceCount);

    return { scrap, furnace, billet, rolling, dispatch, downtime };
  }, [timeframe, selectedFurnace, selectedSize, scrapData, furnaceData, billetData, rollingData, dispatchData, downtimeData]);

  // Aggregated Totals & Mass Balance Metrics
  const totalScrapKg = filteredData.scrap.reduce((sum, r) => sum + Number(r.scrap_rcv_kg || 0), 0);
  const totalLiquidSteelKg = filteredData.furnace.reduce((sum, r) => sum + Number(r.liquid_steel_tapped_kg || 0), 0);
  const totalBilletKg = filteredData.billet.reduce((sum, r) => sum + Number(r.billet_output_kg || 0), 0);
  const totalRebarKg = filteredData.rolling.reduce((sum, r) => sum + Number(r.rod_production_kg || 0), 0);
  const totalDispatchKg = filteredData.dispatch.reduce((sum, r) => sum + Number(r.dispatch_qty_kg || 0), 0);
  const totalRevenueBdt = filteredData.dispatch.reduce((sum, r) => sum + Number(r.total_sales_value || 0), 0);
  const totalPowerKwh = filteredData.furnace.reduce((sum, r) => sum + Number(r.power_consumed_kwh || 0), 0);

  // Yield percentages
  const avgMeltingYield = filteredData.furnace.length > 0
    ? (filteredData.furnace.reduce((sum, f) => sum + Number(f.yield_pct || 0), 0) / filteredData.furnace.length).toFixed(2)
    : '92.60';
  const avgBilletYield = filteredData.billet.length > 0
    ? (filteredData.billet.reduce((sum, b) => sum + Number(b.billet_yield_pct || 0), 0) / filteredData.billet.length).toFixed(2)
    : '97.40';
  const avgRollingYield = filteredData.rolling.length > 0
    ? (filteredData.rolling.reduce((sum, r) => sum + Number(r.rod_yield_pct || 0), 0) / filteredData.rolling.length).toFixed(2)
    : '96.00';

  // Overall Mass Balance Conversion Efficiency (Scrap in -> Rebar out)
  const overallMassBalancePct = totalScrapKg > 0 ? ((totalRebarKg / totalScrapKg) * 100).toFixed(1) : '91.8';

  // Specific Energy Consumption (SEC in kWh / MT of Billet Cast)
  const secKwhMt = totalBilletKg > 0
    ? ((totalPowerKwh / (totalBilletKg / 1000))).toFixed(1)
    : '538.5';

  // Average Realization Price per KG
  const avgRealizationBdtKg = totalDispatchKg > 0 ? (totalRevenueBdt / totalDispatchKg).toFixed(2) : '94.50';

  // Downtime Analysis
  const totalMeltDowntime = filteredData.downtime.reduce((sum, d) => sum + Number(d.billet_breakdown_min || 0), 0);
  const totalMillDowntime = filteredData.downtime.reduce((sum, d) => sum + Number(d.rolling_breakdown_min || 0), 0);
  const totalDowntimeMin = totalMeltDowntime + totalMillDowntime;

  // Plant OEE Approximation (Availability * Performance * Quality)
  const totalPlannedMinutes = filteredData.furnace.length * 24 * 60;
  const availabilityPct = totalPlannedMinutes > 0 ? Math.max(88, Math.min(98, 100 - (totalDowntimeMin / totalPlannedMinutes) * 100)).toFixed(1) : '94.2';
  const performancePct = '96.4';
  const qualityRatePct = '99.2';
  const oeeScore = ((Number(availabilityPct) * Number(performancePct) * Number(qualityRatePct)) / 10000).toFixed(1);

  // Finished Rebar Size Breakdown
  const rebarSizeBreakdown = useMemo(() => {
    const sizes: Record<string, { kg: number; grade: string }> = {
      '10MM': { kg: 0, grade: '500W' },
      '12MM': { kg: 0, grade: '500W' },
      '16MM': { kg: 0, grade: '500W' },
      '20MM': { kg: 0, grade: '550D' },
      '25MM': { kg: 0, grade: '500W' }
    };
    filteredData.rolling.forEach(r => {
      const sz = r.rod_size || '16MM';
      if (!sizes[sz]) sizes[sz] = { kg: 0, grade: r.grade || '500W' };
      sizes[sz].kg += Number(r.rod_production_kg || 0);
    });
    const total = Object.values(sizes).reduce((a, b) => a + b.kg, 0);
    return Object.entries(sizes).map(([size, item]) => ({
      size,
      kg: item.kg,
      grade: item.grade,
      pct: total > 0 ? Math.round((item.kg / total) * 100) : 0
    })).sort((a, b) => b.kg - a.kg);
  }, [filteredData.rolling]);

  // Time-Series Array for Interactive SVG Chart
  const timeSeries = useMemo(() => {
    const dateMap: Record<string, {
      date: string;
      scrapKg: number;
      liquidKg: number;
      billetKg: number;
      rebarKg: number;
      dispatchKg: number;
      powerKwh: number;
      revenueBdt: number;
      meltingYield: number;
      heats: number;
    }> = {};

    filteredData.furnace.forEach(f => {
      if (!dateMap[f.date]) {
        dateMap[f.date] = { date: f.date, scrapKg: 0, liquidKg: 0, billetKg: 0, rebarKg: 0, dispatchKg: 0, powerKwh: 0, revenueBdt: 0, meltingYield: 0, heats: 0 };
      }
      dateMap[f.date].scrapKg += Number(f.scrap_input_kg || 0);
      dateMap[f.date].liquidKg += Number(f.liquid_steel_tapped_kg || 0);
      dateMap[f.date].powerKwh += Number(f.power_consumed_kwh || 0);
      dateMap[f.date].meltingYield = Number(f.yield_pct || 92.5);
      dateMap[f.date].heats += 1;
    });

    filteredData.billet.forEach(b => {
      if (!dateMap[b.date]) {
        dateMap[b.date] = { date: b.date, scrapKg: 0, liquidKg: 0, billetKg: 0, rebarKg: 0, dispatchKg: 0, powerKwh: 0, revenueBdt: 0, meltingYield: 92.5, heats: 1 };
      }
      dateMap[b.date].billetKg += Number(b.billet_output_kg || 0);
    });

    filteredData.rolling.forEach(r => {
      if (!dateMap[r.date]) {
        dateMap[r.date] = { date: r.date, scrapKg: 0, liquidKg: 0, billetKg: 0, rebarKg: 0, dispatchKg: 0, powerKwh: 0, revenueBdt: 0, meltingYield: 92.5, heats: 1 };
      }
      dateMap[r.date].rebarKg += Number(r.rod_production_kg || 0);
    });

    filteredData.dispatch.forEach(d => {
      if (!dateMap[d.date]) {
        dateMap[d.date] = { date: d.date, scrapKg: 0, liquidKg: 0, billetKg: 0, rebarKg: 0, dispatchKg: 0, powerKwh: 0, revenueBdt: 0, meltingYield: 92.5, heats: 1 };
      }
      dateMap[d.date].dispatchKg += Number(d.dispatch_qty_kg || 0);
      dateMap[d.date].revenueBdt += Number(d.total_sales_value || 0);
    });

    return Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredData]);

  // Handle Quick Heat Submission
  const handleAddQuickHeat = (e: React.FormEvent) => {
    e.preventDefault();
    const yieldPct = +( (newHeat.liquid_steel_tapped_kg / newHeat.scrap_input_kg) * 100 ).toFixed(2);
    const newFurnaceEntry: FurnaceRecord = {
      id: Date.now(),
      heat_no: newHeat.heat_no,
      date: '2026-08-24',
      furnace_no: newHeat.furnace_no,
      shift_id: newHeat.shift_id,
      scrap_input_kg: Number(newHeat.scrap_input_kg),
      runtime_min: Number(newHeat.runtime_min),
      tapping_temp_c: Number(newHeat.tapping_temp_c),
      liquid_steel_tapped_kg: Number(newHeat.liquid_steel_tapped_kg),
      yield_pct: yieldPct,
      power_consumed_kwh: Number(newHeat.power_consumed_kwh),
      furnace_master: newHeat.furnace_master
    };

    const newBilletEntry: BilletRecord = {
      id: Date.now() + 1,
      date: '2026-08-24',
      furnace_no: newHeat.furnace_no,
      heat_no: newHeat.heat_no,
      billet_size_section: newHeat.billet_size,
      steel_tapped_input_kg: Number(newHeat.liquid_steel_tapped_kg),
      billet_output_kg: Math.round(Number(newHeat.liquid_steel_tapped_kg) * 0.974),
      scull_loss_kg: Math.round(Number(newHeat.liquid_steel_tapped_kg) * 0.026),
      billet_yield_pct: 97.40,
      billet_stock_kg: 135000
    };

    const updatedFurnace = [...furnaceData, newFurnaceEntry];
    const updatedBillet = [...billetData, newBilletEntry];

    setFurnaceData(updatedFurnace);
    setBilletData(updatedBillet);

    if (typeof window !== 'undefined') {
      localStorage.setItem('steel_erp_furnace', JSON.stringify(updatedFurnace));
      localStorage.setItem('steel_erp_billet', JSON.stringify(updatedBillet));
    }

    setIsQuickHeatModalOpen(false);
    showToast(`✓ Successfully logged Heat ${newHeat.heat_no} (${(newHeat.liquid_steel_tapped_kg/1000).toFixed(1)} MT)`);
  };

  // SVG Chart Calculations
  const chartWidth = 720;
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 25;
  const graphInnerW = chartWidth - paddingX * 2;
  const graphInnerH = chartHeight - paddingY * 2;

  // Compute Max Values for dynamic scaling
  const maxTonnage = Math.max(...timeSeries.map(p => Math.max(p.liquidKg, p.billetKg, p.rebarKg) / 1000), 30);
  const maxYield = 100;
  const maxSec = 650;
  const maxRev = Math.max(...timeSeries.map(p => p.revenueBdt / 100000), 25);

  const getCoordinates = (idx: number, val: number, maxVal: number) => {
    if (timeSeries.length <= 1) return { x: paddingX + graphInnerW / 2, y: chartHeight - paddingY - (val / maxVal) * graphInnerH };
    const x = paddingX + (idx / (timeSeries.length - 1)) * graphInnerW;
    const y = chartHeight - paddingY - Math.min(1, Math.max(0, val / maxVal)) * graphInnerH;
    return { x, y };
  };

  // Generate SVG Path
  const makePath = (extractor: (p: typeof timeSeries[0]) => number, maxVal: number) => {
    if (timeSeries.length === 0) return '';
    const points = timeSeries.map((p, idx) => getCoordinates(idx, extractor(p), maxVal));
    if (points.length === 1) return `M ${points[0].x} ${points[0].y} L ${points[0].x + 1} ${points[0].y}`;
    return points.reduce((acc, pt, i) => i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`, '');
  };

  const makeAreaPath = (extractor: (p: typeof timeSeries[0]) => number, maxVal: number) => {
    if (timeSeries.length === 0) return '';
    const points = timeSeries.map((p, idx) => getCoordinates(idx, extractor(p), maxVal));
    const first = points[0];
    const last = points[points.length - 1];
    const linePath = points.reduce((acc, pt, i) => i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`, '');
    return `${linePath} L ${last.x} ${chartHeight - paddingY} L ${first.x} ${chartHeight - paddingY} Z`;
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 pb-16">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#C5A059]/40 flex flex-wrap items-center gap-3 animate-zoom-in">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs font-bold font-mono tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER: Plant Identity, Live Shift Ticker & Quick Controls */}
      <div className="flex flex-wrap flex-col lg:flex-row justify-between items-start lg:items-center bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-750 gap-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#B48F48] to-[#C5A059] p-0.5 shadow-lg shadow-[#C5A059]/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950/40 rounded-[14px] flex items-center justify-center backdrop-blur-xs">
              <svg className="w-7 h-7 text-[#F5E6C8]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 21V9l-7-4-7 4v12M22 21h-2M4 21H2m10-7h.01M16 11h.01M16 16h.01M8 11h.01M8 16h.01" />
              </svg>
            </div>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">Hi-Tech Steel Manufacturing Hub</h1>
              <span className="bg-[#FAF6EE]/15 text-[#F5E6C8] border border-[#C5A059]/30 text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-widest font-mono">
                500W / 550D TMT
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-2 font-mono">
              <span>Integrated EAF/IF Smelting</span>
              <span>•</span>
              <span>2-Strand CCM Billet Caster</span>
              <span>•</span>
              <span>Continuous Bar Rolling Mill</span>
            </p>
          </div>
        </div>

        {/* Live Status Bar & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Active Shift Ticker */}
          <div className="bg-slate-800/80 border border-slate-700/80 px-4 py-2.5 rounded-2xl flex flex-wrap items-center gap-3">
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 font-extrabold font-mono uppercase tracking-widest">Active Shift</span>
              <span className="text-xs font-black text-[#F5E6C8] font-mono">Shift A (06:00 - 14:00)</span>
            </div>
            <div className="h-6 w-px bg-slate-700"></div>
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 font-extrabold font-mono uppercase tracking-widest">Master On Duty</span>
              <span className="text-xs font-bold text-white font-mono">Kabir Ahmed</span>
            </div>
          </div>

          {/* Live Telemetry Pulse Button */}
          <button
            onClick={() => {
              setIsLiveSimulating(!isLiveSimulating);
              showToast(isLiveSimulating ? '⏸ Telemetry paused' : '▶ Telemetry resumed');
            }}
            className={`px-3.5 py-2.5 rounded-2xl font-mono text-xs font-bold flex items-center space-x-2 transition-all border ${
              isLiveSimulating
                ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${isLiveSimulating ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`}></span>
            <span>{isLiveSimulating ? 'Live Telemetry Active' : 'Telemetry Paused'}</span>
          </button>

          {/* Quick Heat Entry Modal Trigger */}
          <button
            onClick={() => setIsQuickHeatModalOpen(true)}
            className="bg-gradient-to-r from-[#B48F48] to-[#C5A059] hover:from-[#a07e3d] hover:to-[#b5924d] text-slate-950 font-black px-4 py-2.5 rounded-2xl text-xs flex flex-wrap items-center gap-2 shadow-lg shadow-[#C5A059]/25 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Log Tapped Heat</span>
          </button>
        </div>
      </div>

      {/* MASS BALANCE & STEEL PIPELINE FLOW */}
      <div className="bg-white border border-slate-200/80 p-5 sm:p-6 rounded-3xl shadow-xs space-y-4">
        <div className="flex flex-wrap flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 gap-2">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#C5A059] rounded-full"></span>
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest font-mono">Steel Manufacturing Mass Balance Pipeline</h2>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">End-to-end metallurgical conversion flow from raw scrap to certified finished deformed rebars.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <span className="text-slate-400">Plant Conversion Yield:</span>
            <span className="bg-[#FAF6EE] text-[#B48F48] border border-[#C5A059]/30 px-2.5 py-1 rounded-xl font-black text-xs">
              {overallMassBalancePct}% Overall Yield
            </span>
          </div>
        </div>

        {/* 5-Stage Interactive Process Pipeline Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-1">
          
          {/* Stage 1: Scrap Yard Inbound */}
          <Link
            href="/tenant/steel/scrap-sourcing"
            className={`p-4 rounded-2xl border transition-all relative overflow-hidden group cursor-pointer ${
              activePipelineStage === 'scrap' ? 'border-[#C5A059] bg-[#FAF6EE]/70 shadow-md' : 'border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-[#C5A059]/40 hover:shadow-xs'
            }`}
            onClick={() => setActivePipelineStage('scrap')}
          >
            <div className="flex flex-wrap items-center justify-between gap-4 text-[10px] font-black text-slate-400 font-mono uppercase tracking-wider">
              <span>01. Sourcing</span>
              <span className="text-[#B48F48] bg-white px-2 py-0.5 rounded-md border border-[#C5A059]/20">Yard Ready</span>
            </div>
            <h4 className="text-xs font-bold text-slate-800 mt-2">Scrap Yard Intake</h4>
            <div className="mt-3">
              <span className="text-xl font-black text-slate-900 font-mono">{(totalScrapKg / 1000).toFixed(1)} MT</span>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">HMS-1, Shredded, DRI</p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex flex-wrap justify-between gap-4 items-center text-[10px] font-mono">
              <span className="text-slate-500">Avg Cost:</span>
              <span className="font-bold text-slate-700">৳53.2/kg</span>
            </div>
            <div className="absolute top-0 right-0 w-12 h-12 bg-[#C5A059]/5 rounded-bl-3xl"></div>
          </Link>

          {/* Stage 2: Induction Smelting & Slag Loss */}
          <Link
            href="/tenant/steel/furnace-log"
            className={`p-4 rounded-2xl border transition-all relative overflow-hidden group cursor-pointer ${
              activePipelineStage === 'furnace' ? 'border-amber-500 bg-amber-50/50 shadow-md' : 'border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-amber-300 hover:shadow-xs'
            }`}
            onClick={() => setActivePipelineStage('furnace')}
          >
            <div className="flex flex-wrap items-center justify-between gap-4 text-[10px] font-black text-slate-400 font-mono uppercase tracking-wider">
              <span>02. Smelting</span>
              <span className="text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-md border border-amber-200">1620°C Liquid</span>
            </div>
            <h4 className="text-xs font-bold text-slate-800 mt-2">IF/EAF Liquid Steel</h4>
            <div className="mt-3">
              <span className="text-xl font-black text-amber-700 font-mono">{(totalLiquidSteelKg / 1000).toFixed(1)} MT</span>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Melting Yield: {avgMeltingYield}%</p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex flex-wrap justify-between gap-4 items-center text-[10px] font-mono">
              <span className="text-amber-600 font-medium">Slag/Burning Loss:</span>
              <span className="font-bold text-rose-600">-{((totalScrapKg - totalLiquidSteelKg)/1000).toFixed(1)}t</span>
            </div>
          </Link>

          {/* Stage 3: CCM Billet Continuous Casting */}
          <Link
            href="/tenant/steel/billet-ccm"
            className={`p-4 rounded-2xl border transition-all relative overflow-hidden group cursor-pointer ${
              activePipelineStage === 'ccm' ? 'border-indigo-500 bg-indigo-50/50 shadow-md' : 'border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-indigo-300 hover:shadow-xs'
            }`}
            onClick={() => setActivePipelineStage('ccm')}
          >
            <div className="flex flex-wrap items-center justify-between gap-4 text-[10px] font-black text-slate-400 font-mono uppercase tracking-wider">
              <span>03. Casting</span>
              <span className="text-indigo-700 bg-indigo-100/60 px-2 py-0.5 rounded-md border border-indigo-200">CCM Strands</span>
            </div>
            <h4 className="text-xs font-bold text-slate-800 mt-2">Prime Cast Billets</h4>
            <div className="mt-3">
              <span className="text-xl font-black text-indigo-700 font-mono">{(totalBilletKg / 1000).toFixed(1)} MT</span>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Casting Yield: {avgBilletYield}%</p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex flex-wrap justify-between gap-4 items-center text-[10px] font-mono">
              <span className="text-indigo-600 font-medium">Scull & End Cut:</span>
              <span className="font-bold text-slate-700">-{((totalLiquidSteelKg - totalBilletKg)/1000).toFixed(1)}t</span>
            </div>
          </Link>

          {/* Stage 4: Hot Rebar Rolling Mill */}
          <Link
            href="/tenant/steel/rolling-mill"
            className={`p-4 rounded-2xl border transition-all relative overflow-hidden group cursor-pointer ${
              activePipelineStage === 'rolling' ? 'border-emerald-500 bg-emerald-50/50 shadow-md' : 'border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-emerald-300 hover:shadow-xs'
            }`}
            onClick={() => setActivePipelineStage('rolling')}
          >
            <div className="flex flex-wrap items-center justify-between gap-4 text-[10px] font-black text-slate-400 font-mono uppercase tracking-wider">
              <span>04. Rolling</span>
              <span className="text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md border border-emerald-200">10-25mm</span>
            </div>
            <h4 className="text-xs font-bold text-slate-800 mt-2">Deformed Rebars Rolled</h4>
            <div className="mt-3">
              <span className="text-xl font-black text-emerald-700 font-mono">{(totalRebarKg / 1000).toFixed(1)} MT</span>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Rolling Yield: {avgRollingYield}%</p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex flex-wrap justify-between gap-4 items-center text-[10px] font-mono">
              <span className="text-emerald-600 font-medium">Scale & Cobble Loss:</span>
              <span className="font-bold text-slate-700">-{((totalBilletKg - totalRebarKg)/1000).toFixed(1)}t</span>
            </div>
          </Link>

          {/* Stage 5: Finished Goods & Dispatches */}
          <Link
            href="/tenant/steel/sales-dispatch"
            className={`p-4 rounded-2xl border transition-all relative overflow-hidden group cursor-pointer ${
              activePipelineStage === 'dispatch' ? 'border-cyan-500 bg-cyan-50/50 shadow-md' : 'border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-cyan-300 hover:shadow-xs'
            }`}
            onClick={() => setActivePipelineStage('dispatch')}
          >
            <div className="flex flex-wrap items-center justify-between gap-4 text-[10px] font-black text-slate-400 font-mono uppercase tracking-wider">
              <span>05. Dispatch</span>
              <span className="text-cyan-700 bg-cyan-100/60 px-2 py-0.5 rounded-md border border-cyan-200">Challans</span>
            </div>
            <h4 className="text-xs font-bold text-slate-800 mt-2">Shipped to Projects</h4>
            <div className="mt-3">
              <span className="text-xl font-black text-cyan-700 font-mono">{(totalDispatchKg / 1000).toFixed(1)} MT</span>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Total Revenue Invoiced</p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex flex-wrap justify-between gap-4 items-center text-[10px] font-mono">
              <span className="text-slate-500">Value:</span>
              <span className="font-black text-cyan-800">৳{(totalRevenueBdt / 100000).toFixed(1)} Lakh</span>
            </div>
          </Link>

        </div>
      </div>

      {/* FILTER & METRIC CONTROLS BAR */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 p-4 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
          <span className="text-xs font-black text-slate-600 uppercase tracking-wider font-mono">Dashboard Scope:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          
          {/* Timeframe Selector */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['7d', '14d', '30d', 'all'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                  timeframe === t 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t === '7d' ? '7 Days' : t === '14d' ? '14 Days' : t === '30d' ? '30 Days' : 'All Data'}
              </button>
            ))}
          </div>

          {/* Furnace Dropdown */}
          <select
            value={selectedFurnace}
            onChange={(e) => setSelectedFurnace(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#C5A059] transition-all cursor-pointer font-mono"
          >
            <option value="all">All Induction Furnaces</option>
            <option value="Furnace 01">Furnace No. 01 (15T)</option>
            <option value="Furnace 02">Furnace No. 02 (15T)</option>
          </select>

          {/* Size Dropdown */}
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#C5A059] transition-all cursor-pointer font-mono"
          >
            <option value="all">All Finished Rebar Diameters</option>
            <option value="10MM">10MM TMT Rebar</option>
            <option value="12MM">12MM TMT Rebar</option>
            <option value="16MM">16MM TMT Rebar</option>
            <option value="20MM">20MM TMT Rebar</option>
            <option value="25MM">25MM TMT Rebar</option>
          </select>

        </div>
      </div>

      {/* CORE STEEL KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* KPI 1: Liquid Steel Smelted */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs flex flex-wrap flex-col justify-between gap-4 h-40 hover:border-[#C5A059]/40 hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Liquid Steel Melted</p>
            <span className="text-[#B48F48] bg-[#FAF6EE] px-2.5 py-1 rounded-lg text-[10px] font-black font-mono uppercase border border-[#C5A059]/20">
              {filteredData.furnace.length} Heats
            </span>
          </div>
          <div>
            <div className="flex flex-wrap items-baseline gap-2">
              <h3 className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                {(totalLiquidSteelKg / 1000).toFixed(1)}
              </h3>
              <span className="text-xs font-bold text-slate-400 font-mono">MT</span>
            </div>
            <div className="flex flex-wrap justify-between gap-4 items-center mt-3 pt-2 border-t border-slate-100">
              <span className="text-[10px] text-emerald-600 font-bold font-mono flex items-center">
                <span className="mr-1">▲</span> Melting Yield: {avgMeltingYield}%
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Avg Temp: 1618°C</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#C5A059]"></div>
        </div>

        {/* KPI 2: Specific Power Consumption (SEC) */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs flex flex-wrap flex-col justify-between gap-4 h-40 hover:border-amber-400 hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Specific Power (SEC)</p>
            <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg text-[10px] font-black font-mono uppercase border border-emerald-200">
              Optimal
            </span>
          </div>
          <div>
            <div className="flex flex-wrap items-baseline gap-2">
              <h3 className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                {secKwhMt}
              </h3>
              <span className="text-xs font-bold text-slate-400 font-mono">kWh / MT</span>
            </div>
            <div className="flex flex-wrap justify-between gap-4 items-center mt-3 pt-2 border-t border-slate-100">
              <span className="text-[10px] text-emerald-600 font-bold font-mono flex items-center">
                Target: &lt;550 kWh/MT
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{(totalPowerKwh/1000).toFixed(1)} MWh Total</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-amber-500"></div>
        </div>

        {/* KPI 3: Finished Rebar Rolled */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs flex flex-wrap flex-col justify-between gap-4 h-40 hover:border-emerald-400 hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Rebar Rolled Output</p>
            <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg text-[10px] font-black font-mono uppercase border border-emerald-200">
              Grade 500W
            </span>
          </div>
          <div>
            <div className="flex flex-wrap items-baseline gap-2">
              <h3 className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                {(totalRebarKg / 1000).toFixed(1)}
              </h3>
              <span className="text-xs font-bold text-slate-400 font-mono">MT</span>
            </div>
            <div className="flex flex-wrap justify-between gap-4 items-center mt-3 pt-2 border-t border-slate-100">
              <span className="text-[10px] text-emerald-600 font-bold font-mono flex items-center">
                <span className="mr-1">▲</span> Rolling Yield: {avgRollingYield}%
              </span>
              <span className="text-[10px] text-slate-400 font-mono">198 MT Yard Stock</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-emerald-500"></div>
        </div>

        {/* KPI 4: Dispatches & Revenue Realization */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs flex flex-wrap flex-col justify-between gap-4 h-40 hover:border-cyan-400 hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Invoiced Revenue</p>
            <span className="text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-lg text-[10px] font-black font-mono uppercase border border-cyan-200">
              Sales Hub
            </span>
          </div>
          <div>
            <div className="flex flex-wrap items-baseline gap-2">
              <h3 className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                ৳{(totalRevenueBdt / 100000).toFixed(1)}
              </h3>
              <span className="text-xs font-bold text-slate-400 font-mono">Lakh</span>
            </div>
            <div className="flex flex-wrap justify-between gap-4 items-center mt-3 pt-2 border-t border-slate-100">
              <span className="text-[10px] text-cyan-600 font-bold font-mono flex items-center">
                Shipped: {(totalDispatchKg / 1000).toFixed(1)} MT
              </span>
              <span className="text-[10px] text-slate-400 font-mono">৳{avgRealizationBdtKg}/kg</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-cyan-500"></div>
        </div>

      </div>

      {/* DYNAMIC INTERACTIVE PRODUCTION & SPECIFIC ENERGY MULTI-CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Interactive SVG Chart */}
        <div className="bg-white border border-slate-200/80 p-5 sm:p-6 rounded-3xl shadow-xs space-y-4 lg:col-span-2">
          <div className="flex flex-wrap flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#C5A059] rounded-full"></span>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider font-mono">
                  {chartMetric === 'tonnage' && 'Steel Manufacturing Throughput Trend (Metric Tonnes)'}
                  {chartMetric === 'yield' && 'Process Yield Efficiency (% Conversion)'}
                  {chartMetric === 'sec' && 'Specific Energy Consumption Index (kWh / MT)'}
                  {chartMetric === 'revenue' && 'Sales Invoiced Revenue (৳ Lakhs)'}
                </h3>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Interactive multi-stage comparison with precision tooltips.</p>
            </div>

            {/* Metric Mode Switcher */}
            <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-xl gap-1">
              <button
                onClick={() => setChartMetric('tonnage')}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all font-mono ${
                  chartMetric === 'tonnage' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Tonnage (MT)
              </button>
              <button
                onClick={() => setChartMetric('yield')}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all font-mono ${
                  chartMetric === 'yield' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Yield (%)
              </button>
              <button
                onClick={() => setChartMetric('sec')}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all font-mono ${
                  chartMetric === 'sec' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Power SEC
              </button>
              <button
                onClick={() => setChartMetric('revenue')}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all font-mono ${
                  chartMetric === 'revenue' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Revenue
              </button>
            </div>
          </div>

          {/* Interactive Legend */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-[10px] font-mono font-bold text-slate-500 px-1">
            {chartMetric === 'tonnage' && (
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex flex-wrap items-center gap-1.5">
                  <span className="w-3 h-1 bg-[#C5A059] rounded-full"></span>
                  <span className="text-slate-800">Liquid Steel (MT)</span>
                </span>
                <span className="flex flex-wrap items-center gap-1.5">
                  <span className="w-3 h-1 bg-indigo-500 rounded-full"></span>
                  <span className="text-slate-800">CCM Billets (MT)</span>
                </span>
                <span className="flex flex-wrap items-center gap-1.5">
                  <span className="w-3 h-1 bg-emerald-500 rounded-full"></span>
                  <span className="text-slate-800">Finished Rebars (MT)</span>
                </span>
              </div>
            )}
            {chartMetric === 'yield' && (
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex flex-wrap items-center gap-1.5">
                  <span className="w-3 h-1 bg-amber-500 rounded-full"></span>
                  <span className="text-slate-800">Melting Yield (%)</span>
                </span>
                <span className="flex flex-wrap items-center gap-1.5">
                  <span className="w-3 h-1 bg-emerald-500 rounded-full"></span>
                  <span className="text-slate-800">Rolling Yield (%)</span>
                </span>
              </div>
            )}
            {chartMetric === 'sec' && (
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex flex-wrap items-center gap-1.5">
                  <span className="w-3 h-1 bg-amber-500 rounded-full"></span>
                  <span className="text-slate-800">Electricity SEC (kWh/MT)</span>
                </span>
                <span className="flex flex-wrap items-center gap-1.5">
                  <span className="w-3 h-0.5 border-t border-dashed border-rose-400"></span>
                  <span className="text-rose-500">Benchmark Ceiling (560 kWh/MT)</span>
                </span>
              </div>
            )}
            {chartMetric === 'revenue' && (
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex flex-wrap items-center gap-1.5">
                  <span className="w-3 h-1 bg-cyan-500 rounded-full"></span>
                  <span className="text-slate-800">Invoice Dispatches (৳ Lakh)</span>
                </span>
              </div>
            )}

            <span className="text-slate-400">Hover nodes for heat specs</span>
          </div>

          {/* SVG Graph Drawing Container */}
          <div className="relative pt-2">
            <svg
              className="w-full h-56 overflow-visible cursor-crosshair"
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              preserveAspectRatio="none"
              onMouseLeave={() => setHoveredPointIdx(null)}
            >
              {/* Horizontal Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = chartHeight - paddingY - ratio * graphInnerH;
                return (
                  <g key={i}>
                    <line x1={paddingX} y1={y} x2={chartWidth - paddingX} y2={y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                  </g>
                );
              })}

              {/* Tonnage Mode Paths */}
              {chartMetric === 'tonnage' && (
                <>
                  <path d={makeAreaPath(p => p.liquidKg / 1000, maxTonnage)} fill="url(#liquidGrad)" />
                  <path d={makePath(p => p.liquidKg / 1000, maxTonnage)} fill="none" stroke="#C5A059" strokeWidth="2.5" strokeLinecap="round" />
                  <path d={makePath(p => p.billetKg / 1000, maxTonnage)} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 2" />
                  <path d={makePath(p => p.rebarKg / 1000, maxTonnage)} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                </>
              )}

              {/* Yield Mode Paths */}
              {chartMetric === 'yield' && (
                <>
                  <path d={makeAreaPath(p => p.meltingYield, maxYield)} fill="url(#yieldGrad)" />
                  <path d={makePath(p => p.meltingYield, maxYield)} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                </>
              )}

              {/* SEC Power Mode Paths */}
              {chartMetric === 'sec' && (
                <>
                  <line x1={paddingX} y1={chartHeight - paddingY - (560 / maxSec) * graphInnerH} x2={chartWidth - paddingX} y2={chartHeight - paddingY - (560 / maxSec) * graphInnerH} stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4 4" />
                  <path d={makeAreaPath(p => p.billetKg > 0 ? p.powerKwh / (p.billetKg / 1000) : 540, maxSec)} fill="url(#secGrad)" />
                  <path d={makePath(p => p.billetKg > 0 ? p.powerKwh / (p.billetKg / 1000) : 540, maxSec)} fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
                </>
              )}

              {/* Revenue Mode Paths */}
              {chartMetric === 'revenue' && (
                <>
                  <path d={makeAreaPath(p => p.revenueBdt / 100000, maxRev)} fill="url(#revGrad)" />
                  <path d={makePath(p => p.revenueBdt / 100000, maxRev)} fill="none" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" />
                </>
              )}

              {/* Data Node Points & Hover Targets */}
              {timeSeries.map((pt, idx) => {
                const metricVal = chartMetric === 'tonnage' ? pt.rebarKg / 1000 :
                                  chartMetric === 'yield' ? pt.meltingYield :
                                  chartMetric === 'sec' ? (pt.billetKg > 0 ? pt.powerKwh / (pt.billetKg / 1000) : 540) :
                                  pt.revenueBdt / 100000;
                const maxVal = chartMetric === 'tonnage' ? maxTonnage : chartMetric === 'yield' ? maxYield : chartMetric === 'sec' ? maxSec : maxRev;
                const coords = getCoordinates(idx, metricVal, maxVal);

                const isHovered = hoveredPointIdx === idx;

                return (
                  <g key={idx} onMouseEnter={() => setHoveredPointIdx(idx)} className="cursor-pointer">
                    {/* Hover vertical bar */}
                    {isHovered && (
                      <line x1={coords.x} y1={paddingY} x2={coords.x} y2={chartHeight - paddingY} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />
                    )}
                    {/* Node Circle */}
                    <circle
                      cx={coords.x}
                      cy={coords.y}
                      r={isHovered ? 6 : 4}
                      fill={chartMetric === 'tonnage' ? '#10b981' : chartMetric === 'yield' ? '#f59e0b' : chartMetric === 'sec' ? '#f59e0b' : '#06b6d4'}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  </g>
                );
              })}

              {/* Gradient Definitions */}
              <defs>
                <linearGradient id="liquidGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C5A059" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#C5A059" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="yieldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="secGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            {/* Dynamic Floating Tooltip */}
            {hoveredPointIdx !== null && timeSeries[hoveredPointIdx] && (
              <div
                className="absolute z-20 bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 pointer-events-none text-xs font-mono backdrop-blur-md"
                style={{
                  left: `${Math.min(75, Math.max(5, (hoveredPointIdx / (timeSeries.length - 1 || 1)) * 100))}%`,
                  top: '-10px',
                  transform: 'translateX(-50%)'
                }}
              >
                <div className="flex flex-wrap justify-between items-center border-b border-slate-700 pb-1.5 mb-2 gap-4">
                  <span className="font-black text-[#F5E6C8]">{timeSeries[hoveredPointIdx].date}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">{timeSeries[hoveredPointIdx].heats} Heats Logged</span>
                </div>
                <div className="space-y-1 text-[11px]">
                  <div className="flex flex-wrap justify-between gap-4">
                    <span className="text-slate-400">Liquid Steel:</span>
                    <span className="font-bold text-[#C5A059]">{(timeSeries[hoveredPointIdx].liquidKg / 1000).toFixed(1)} MT</span>
                  </div>
                  <div className="flex flex-wrap justify-between gap-4">
                    <span className="text-slate-400">Billet Cast:</span>
                    <span className="font-bold text-indigo-400">{(timeSeries[hoveredPointIdx].billetKg / 1000).toFixed(1)} MT</span>
                  </div>
                  <div className="flex flex-wrap justify-between gap-4">
                    <span className="text-slate-400">Rebar Rolled:</span>
                    <span className="font-bold text-emerald-400">{(timeSeries[hoveredPointIdx].rebarKg / 1000).toFixed(1)} MT</span>
                  </div>
                  <div className="flex flex-wrap justify-between gap-4 pt-1 border-t border-slate-800">
                    <span className="text-slate-400">Specific SEC:</span>
                    <span className="font-bold text-amber-400">
                      {timeSeries[hoveredPointIdx].billetKg > 0 ? (timeSeries[hoveredPointIdx].powerKwh / (timeSeries[hoveredPointIdx].billetKg / 1000)).toFixed(0) : 540} kWh/MT
                    </span>
                  </div>
                  <div className="flex flex-wrap justify-between gap-4">
                    <span className="text-slate-400">Dispatches:</span>
                    <span className="font-bold text-cyan-400">৳{(timeSeries[hoveredPointIdx].revenueBdt / 100000).toFixed(1)} Lakh</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Date Ticks on Bottom */}
          <div className="flex flex-wrap justify-between gap-4 text-[9px] font-bold text-slate-400 font-mono px-2 pt-2 border-t border-slate-100">
            {timeSeries.map((p, idx) => (
              <span key={idx} className={hoveredPointIdx === idx ? 'text-[#B48F48] font-black' : ''}>
                {p.date.slice(5)}
              </span>
            ))}
          </div>
        </div>

        {/* Finished Rebar Size & Grade Production Matrix */}
        <div className="bg-white border border-slate-200/80 p-5 sm:p-6 rounded-3xl shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider font-mono">Rebar Diameter Mix</h3>
              <p className="text-[10px] text-slate-400">Production distribution by finished rod size.</p>
            </div>
            <span className="bg-[#FAF6EE] text-[#B48F48] border border-[#C5A059]/20 px-2 py-0.5 rounded-md text-[9px] font-bold font-mono">
              BDS ISO 6935-2
            </span>
          </div>

          <div className="space-y-3.5 pt-1">
            {rebarSizeBreakdown.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex flex-wrap justify-between gap-4 items-center text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="font-black text-slate-800 font-mono">{item.size} Rebar</span>
                    <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-mono">
                      {item.grade}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 font-mono text-xs font-bold">
                    <span className="text-slate-800">{(item.kg / 1000).toFixed(1)} MT</span>
                    <span className="text-slate-400">({item.pct}%)</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-[#C5A059] rounded-full transition-all duration-500"
                    style={{ width: `${item.pct}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Yard Inventory Stock Link */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap justify-between gap-4 items-center text-xs font-mono">
            <span className="text-slate-500">Finished Goods Yard Stock:</span>
            <Link href="/tenant/steel/yard-inventory" className="text-[#B48F48] font-black hover:underline flex items-center">
              <span>198.5 MT Ready</span>
              <span className="ml-1">→</span>
            </Link>
          </div>
        </div>

      </div>

      {/* LIVE DIGITAL TWIN: MELTSHOP, CCM CASTER & ROLLING MILL TELEMETRY */}
      <div className="bg-white border border-slate-200/80 p-5 sm:p-6 rounded-3xl shadow-xs space-y-4">
        <div className="flex flex-wrap flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 gap-2">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest font-mono">
                Live Meltshop, Caster & Rolling Mill Digital Twin
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Real-time telemetry and supervisory monitoring of induction furnaces, continuous caster and rebar finishing lines.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-xl font-bold border border-emerald-200 flex items-center">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block mr-1.5 animate-pulse"></span>
              Sensors Online (4/4 Units)
            </span>
          </div>
        </div>

        {/* 4 Digital Twin Equipment Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          
          {/* Unit 1: Furnace 01 */}
          <div className="border border-slate-200/80 rounded-2xl p-4 bg-slate-50/50 hover:bg-white hover:border-[#C5A059]/40 hover:shadow-sm transition-all space-y-3">
            <div className="flex flex-wrap justify-between gap-4 items-start">
              <div>
                <h4 className="text-xs font-black text-slate-850">{furnace1.name}</h4>
                <p className="text-[9px] text-slate-400 font-mono">15 Ton Crucible • Acid Lining</p>
              </div>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-mono">
                {furnace1.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
              <div className="bg-white p-2.5 rounded-xl border border-slate-150">
                <span className="text-[9px] text-slate-400 uppercase font-bold">Bath Temp</span>
                <div className="text-base font-black text-rose-600 mt-0.5">{furnace1.temp}°C</div>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-150">
                <span className="text-[9px] text-slate-400 uppercase font-bold">Power Load</span>
                <div className="text-base font-black text-slate-800 mt-0.5">{(furnace1.powerKw / 1000).toFixed(2)} MW</div>
              </div>
            </div>

            <div className="space-y-1 text-[10px] font-mono">
              <div className="flex flex-wrap justify-between gap-4 text-slate-500">
                <span>Crucible Heat Life:</span>
                <span className="font-bold text-slate-800">{furnace1.liningHeats} / {furnace1.maxLiningHeats} Heats</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#C5A059] rounded-full" style={{ width: `${(furnace1.liningHeats / furnace1.maxLiningHeats) * 100}%` }}></div>
              </div>
            </div>
          </div>

          {/* Unit 2: Furnace 02 */}
          <div className="border border-slate-200/80 rounded-2xl p-4 bg-slate-50/50 hover:bg-white hover:border-amber-400/40 hover:shadow-sm transition-all space-y-3">
            <div className="flex flex-wrap justify-between gap-4 items-start">
              <div>
                <h4 className="text-xs font-black text-slate-850">{furnace2.name}</h4>
                <p className="text-[9px] text-slate-400 font-mono">15 Ton Crucible • Basic Lining</p>
              </div>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-mono">
                {furnace2.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
              <div className="bg-white p-2.5 rounded-xl border border-slate-150">
                <span className="text-[9px] text-slate-400 uppercase font-bold">Bath Temp</span>
                <div className="text-base font-black text-rose-600 mt-0.5">{furnace2.temp}°C</div>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-150">
                <span className="text-[9px] text-slate-400 uppercase font-bold">Power Load</span>
                <div className="text-base font-black text-slate-800 mt-0.5">{(furnace2.powerKw / 1000).toFixed(2)} MW</div>
              </div>
            </div>

            <div className="space-y-1 text-[10px] font-mono">
              <div className="flex flex-wrap justify-between gap-4 text-slate-500">
                <span>Crucible Heat Life:</span>
                <span className="font-bold text-slate-800">{furnace2.liningHeats} / {furnace2.maxLiningHeats} Heats</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(furnace2.liningHeats / furnace2.maxLiningHeats) * 100}%` }}></div>
              </div>
            </div>
          </div>

          {/* Unit 3: CCM Continuous Caster */}
          <div className="border border-slate-200/80 rounded-2xl p-4 bg-slate-50/50 hover:bg-white hover:border-indigo-400/40 hover:shadow-sm transition-all space-y-3">
            <div className="flex flex-wrap justify-between gap-4 items-start">
              <div>
                <h4 className="text-xs font-black text-slate-850">{ccmCaster.name}</h4>
                <p className="text-[9px] text-slate-400 font-mono">2-Strand Curved Mould Caster</p>
              </div>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-mono">
                {ccmCaster.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
              <div className="bg-white p-2.5 rounded-xl border border-slate-150">
                <span className="text-[9px] text-slate-400 uppercase font-bold">Tundish Temp</span>
                <div className="text-base font-black text-indigo-700 mt-0.5">{ccmCaster.temp}°C</div>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-150">
                <span className="text-[9px] text-slate-400 uppercase font-bold">Casting Speed</span>
                <div className="text-base font-black text-slate-800 mt-0.5">{ccmCaster.speedMpm} m/min</div>
              </div>
            </div>

            <div className="space-y-1 text-[10px] font-mono">
              <div className="flex flex-wrap justify-between gap-4 text-slate-500">
                <span>Active Section:</span>
                <span className="font-bold text-slate-800">{ccmCaster.billetSection}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
          </div>

          {/* Unit 4: Rebar Rolling Mill */}
          <div className="border border-slate-200/80 rounded-2xl p-4 bg-slate-50/50 hover:bg-white hover:border-emerald-400/40 hover:shadow-sm transition-all space-y-3">
            <div className="flex flex-wrap justify-between gap-4 items-start">
              <div>
                <h4 className="text-xs font-black text-slate-850">{rollingMill.name}</h4>
                <p className="text-[9px] text-slate-400 font-mono">18 Continuous Stands • TMT Quench</p>
              </div>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-mono">
                {rollingMill.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
              <div className="bg-white p-2.5 rounded-xl border border-slate-150">
                <span className="text-[9px] text-slate-400 uppercase font-bold">Throughput</span>
                <div className="text-base font-black text-emerald-700 mt-0.5">{rollingMill.hourlyTph} TPH</div>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-150">
                <span className="text-[9px] text-slate-400 uppercase font-bold">Delivery Speed</span>
                <div className="text-base font-black text-slate-800 mt-0.5">{rollingMill.speedMps} m/s</div>
              </div>
            </div>

            <div className="space-y-1 text-[10px] font-mono">
              <div className="flex flex-wrap justify-between gap-4 text-slate-500">
                <span>Active Section:</span>
                <span className="font-bold text-slate-800">{rollingMill.activeSize}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '96%' }}></div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* QUALITY SPECTRO LAB RADAR & MILL DOWNTIME BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quality Spectrometer Heat Map & Compliance Audit */}
        <div className="bg-white border border-slate-200/80 p-5 sm:p-6 rounded-3xl shadow-xs space-y-4 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider font-mono">
                  Optical Emission Spectro (OES) Chemistry & Grade 500W Compliance
                </h3>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Laboratory chemical and mechanical verification against BDS ISO 6935-2 specifications.</p>
            </div>
            <Link href="/tenant/steel/quality-spectro" className="text-xs text-[#B48F48] font-bold hover:underline font-mono">
              Full Spectro Log →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-150 text-[10px] font-black text-slate-400 uppercase">
                  <th className="py-2.5">Sample ID</th>
                  <th>Heat Link</th>
                  <th>Size / Grade</th>
                  <th className="text-right">%C (&lt;0.25)</th>
                  <th className="text-right">%Mn (&lt;1.0)</th>
                  <th className="text-right">%Si (&lt;0.30)</th>
                  <th className="text-right">%S+P (&lt;0.08)</th>
                  <th className="text-right font-black text-slate-800">Carbon Eq (CE)</th>
                  <th className="text-center">Bend Test</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {qualityData.slice(0, 4).map((q, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-2.5 font-black text-slate-800">{q.sample_id}</td>
                    <td className="text-slate-500 font-bold">{q.heat_no}</td>
                    <td>
                      <span className="font-bold text-slate-800">{q.rod_size}</span>{' '}
                      <span className="text-[9px] bg-slate-100 px-1.5 py-0.2 rounded text-slate-600 font-bold">{q.grade}</span>
                    </td>
                    <td className="text-right font-bold text-slate-700">{q.pct_c}%</td>
                    <td className="text-right font-bold text-slate-700">{q.pct_mn}%</td>
                    <td className="text-right font-bold text-slate-700">{q.pct_si}%</td>
                    <td className="text-right font-bold text-slate-700">{+(q.pct_s + q.pct_p).toFixed(3)}%</td>
                    <td className="text-right font-black text-emerald-700">{q.pct_ce}%</td>
                    <td className="text-center">
                      <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        {q.bend_test_result || 'PASSED'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-[#FAF6EE]/50 border border-[#C5A059]/20 rounded-2xl p-3 flex flex-wrap flex-col sm:flex-row sm:items-center justify-between text-xs font-mono gap-2">
            <span className="text-slate-600">Standard Formula: <strong className="text-slate-850">CE = C + Mn/6 + (Cr+Mo+V)/5 + (Ni+Cu)/15</strong></span>
            <span className="text-emerald-700 font-bold">All Heats 100% Compliant (CE ≤ 0.42%)</span>
          </div>
        </div>

        {/* Downtime & Overall Equipment Effectiveness (OEE) Hub */}
        <div className="bg-white border border-slate-200/80 p-5 sm:p-6 rounded-3xl shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider font-mono">Downtime & OEE Index</h3>
              <p className="text-[10px] text-slate-400">Plant availability & breakdown tracking.</p>
            </div>
            <Link href="/tenant/steel/downtime-tracker" className="text-xs text-[#B48F48] font-bold hover:underline font-mono">
              View Log →
            </Link>
          </div>

          {/* OEE Score Display */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-[#C5A059] font-black uppercase tracking-widest font-mono">Overall OEE</span>
              <div className="text-2xl font-black font-mono text-white mt-0.5">{oeeScore}%</div>
              <p className="text-[9px] text-slate-400 font-mono mt-0.5">Avail: {availabilityPct}% • Perf: {performancePct}%</p>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-[#C5A059] flex items-center justify-center font-mono font-black text-xs text-[#F5E6C8]">
              {oeeScore}%
            </div>
          </div>

          {/* Downtime Breakdown Progress Bars */}
          <div className="space-y-3 pt-1 text-xs font-mono">
            <div className="flex flex-wrap justify-between gap-4 text-slate-600">
              <span className="font-bold">Total Recorded Downtime:</span>
              <span className="font-black text-rose-600">{totalDowntimeMin} mins</span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap justify-between gap-4 text-[10px] text-slate-500 font-bold">
                <span>Induction Melt Shop:</span>
                <span>{totalMeltDowntime} mins</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${totalDowntimeMin > 0 ? (totalMeltDowntime / totalDowntimeMin) * 100 : 40}%` }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap justify-between gap-4 text-[10px] text-slate-500 font-bold">
                <span>Hot Rolling Mill Stands:</span>
                <span>{totalMillDowntime} mins</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${totalDowntimeMin > 0 ? (totalMillDowntime / totalDowntimeMin) * 100 : 60}%` }}></div>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 font-mono">
            Major scheduled factor: Mill pass changeover and flying shear blade calibrations.
          </p>
        </div>

      </div>

      {/* MODAL: QUICK HEAT ENTRY TO LOG DIRECTLY INTO SYSTEM */}
      {isQuickHeatModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200/90 animate-zoom-in space-y-5 my-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-[#B48F48] flex items-center justify-center font-bold border border-amber-500/20">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-sans">Log Induction Smelting Heat</h3>
                  <p className="text-xs text-slate-500 font-sans">Synchronize live plant telemetry with tapped heat records.</p>
                </div>
              </div>
              <button
                onClick={() => setIsQuickHeatModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddQuickHeat} className="space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider font-mono mb-1">Furnace Station</label>
                  <select
                    value={newHeat.furnace_no}
                    onChange={e => setNewHeat({ ...newHeat, furnace_no: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-sans text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059]"
                  >
                    <option value="Furnace 01">Furnace 01 (15 Ton)</option>
                    <option value="Furnace 02">Furnace 02 (15 Ton)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider font-mono mb-1">Heat Number</label>
                  <input
                    type="text"
                    value={newHeat.heat_no}
                    onChange={e => setNewHeat({ ...newHeat, heat_no: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-sans text-slate-900 uppercase font-mono focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider font-mono mb-1">Scrap Charged (KG)</label>
                  <input
                    type="number"
                    value={newHeat.scrap_input_kg}
                    onChange={e => setNewHeat({ ...newHeat, scrap_input_kg: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider font-mono mb-1">Liquid Steel (KG)</label>
                  <input
                    type="number"
                    value={newHeat.liquid_steel_tapped_kg}
                    onChange={e => setNewHeat({ ...newHeat, liquid_steel_tapped_kg: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider font-mono mb-1">Tapping Temp (°C)</label>
                  <input
                    type="number"
                    value={newHeat.tapping_temp_c}
                    onChange={e => setNewHeat({ ...newHeat, tapping_temp_c: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider font-mono mb-1">Power Units (kWh)</label>
                  <input
                    type="number"
                    value={newHeat.power_consumed_kwh}
                    onChange={e => setNewHeat({ ...newHeat, power_consumed_kwh: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider font-mono mb-1">Runtime (Mins)</label>
                  <input
                    type="number"
                    value={newHeat.runtime_min}
                    onChange={e => setNewHeat({ ...newHeat, runtime_min: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider font-mono mb-1">Shift / Lead</label>
                  <select
                    value={newHeat.shift_id}
                    onChange={e => setNewHeat({ ...newHeat, shift_id: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-sans text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059]"
                  >
                    <option value="A">Shift A (Kabir Ahmed)</option>
                    <option value="B">Shift B (Zahirul Haque)</option>
                    <option value="C">Shift C (Ataur Rahman)</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Yield & SEC calculation strip */}
              <div className="bg-amber-50/70 border border-amber-200/90 rounded-xl p-3.5 flex flex-wrap justify-between gap-4 items-center text-xs font-mono">
                <span className="text-slate-600 font-medium">Calculated Smelting Yield:</span>
                <span className="font-bold text-[#B48F48] text-sm">
                  {newHeat.scrap_input_kg > 0 ? ((newHeat.liquid_steel_tapped_kg / newHeat.scrap_input_kg) * 100).toFixed(2) : 0}%
                </span>
              </div>

              <div className="flex flex-wrap justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsQuickHeatModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#B48F48] hover:bg-[#9E7A37] text-white font-semibold text-sm rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Commit Heat Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
