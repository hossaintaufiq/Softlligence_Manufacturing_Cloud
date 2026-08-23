import fs from 'fs';
import path from 'path';

// Interfaces for our Relational Database Tables
export interface ScrapRow {
  id: number;
  date: string;
  supplier_name: string;
  scrap_category: string; // 'LC Scrap' | 'Rolling Kechi' | 'Tin Bundle' | 'Plate Cutting' | 'Others'
  truck_no: string;
  gross_weight: number;
  tare_weight: number;
  net_received_kg: number; // calculated: gross_weight - tare_weight
  rate_per_kg: number;
  total_cost: number; // calculated: net_received_kg * rate_per_kg
}

export interface FurnaceRow {
  id: number;
  date: string;
  furnace_id: string;
  heat_no: string;
  scrap_input_kg: number;
  runtime_min: number;
  patching_powder_kg: number;
  patching_forma_kg: number;
  liquid_steel_tapped_kg: number;
  yield_pct: number; // calculated: (liquid_steel_tapped_kg / scrap_input_kg) * 100
}

export interface BilletRow {
  id: number;
  heat_no: string; // references furnace.heat_no
  billet_size_section: string; // e.g. '100x100 mm' | '130x130 mm'
  billet_output_kg: number;
  scull_loss_kg: number;
  scrap_loss_kg: number; // calculated: scrap_input - billet_output_kg
  billet_yield_pct: number; // calculated: (billet_output_kg / scrap_input) * 100
}

export interface RollingRow {
  id: number;
  date: string;
  billet_input_kg: number;
  rod_size: string; // '10mm' | '12mm' | '16mm' | '20mm' | '25mm' | '32mm'
  rod_production_kg: number;
  burning_loss_kg: number;
  end_cut_loss_kg: number;
  miss_roll_kg: number;
  rod_loss_kg: number; // calculated: billet_input_kg - rod_production_kg
  rod_yield_pct: number; // calculated: (rod_production_kg / billet_input_kg) * 100
}

export interface DispatchRow {
  id: number;
  date: string;
  customer_name: string;
  challan_no: string;
  rod_size: string;
  dispatch_qty_kg: number;
  rate_per_kg: number;
  total_selling_price: number; // calculated: dispatch_qty_kg * rate_per_kg
  truck_no: string;
  contact_info: string;
}

export interface DowntimeRow {
  id: number;
  date: string;
  section: 'BILLET_LINE' | 'ROLLING_LINE';
  breakdown_category: 'Mechanical' | 'Electrical' | 'Roll Change' | 'Power Outage';
  duration_min: number;
  root_cause_notes: string;
  resolved_by: string;
}

export interface EnergyRow {
  id: number;
  date: string;
  meter_reading_kw: number;
  power_consumed_kwh: number;
  gas_consumed_nm3: number;
  billet_kwh_per_ton: number; // calculated: power_consumed / total_billet_tons_today
  rod_kwh_per_ton: number;    // calculated: power_consumed / total_rod_tons_today
  gas_per_ton: number;        // calculated: gas_consumed / total_rod_tons_today
}

export interface WeighbridgeRow {
  id: number;
  ticket_no: string;
  date: string;
  vehicle_no: string;
  material_type: string; // 'Incoming Scrap' | 'Outgoing Finished Rods'
  gross_weight_kg: number;
  tare_weight_kg: number;
  net_weight_kg: number; // calculated: gross_weight - tare_weight
  status: 'Pending' | 'Completed';
}

export interface QualityRow {
  id: number;
  heat_no: string;
  test_date: string;
  pct_c: number;
  pct_mn: number;
  pct_si: number;
  pct_s: number;
  pct_p: number;
  pct_ce: number; // calculated: C + Mn/6 + Si/24
  yield_strength_n_mm2: number;
  tensile_strength_n_mm2: number;
  elongation_pct: number;
  bend_test_status: 'Approved' | 'Rejected';
}

export interface InventoryRow {
  raw_scrap_mt: number;
  billet_yard_mt: number;
  rebar_10mm_mt: number;
  rebar_12mm_mt: number;
  rebar_16mm_mt: number;
  rebar_20mm_mt: number;
  rebar_25mm_mt: number;
  rebar_32mm_mt: number;
  store_spares_qty: number;
}

export interface ExpenseRow {
  id: number;
  date: string;
  category: string;
  voucher_no: string;
  description: string;
  amount: number;
  type: 'Expense' | 'Scrap Payable' | 'Customer Receivable';
}

export interface ShiftRow {
  id: number;
  date: string;
  shift: 'Shift A' | 'Shift B' | 'Shift C';
  furnace_master: string;
  roll_turner: string;
  operators_present: number;
  attendance_log: string;
}

export interface DBStructure {
  scrap: ScrapRow[];
  furnace: FurnaceRow[];
  billet: BilletRow[];
  rolling: RollingRow[];
  dispatch: DispatchRow[];
  downtime: DowntimeRow[];
  energy: EnergyRow[];
  weighbridge: WeighbridgeRow[];
  quality: QualityRow[];
  inventory: InventoryRow;
  expenses: ExpenseRow[];
  shifts: ShiftRow[];
}

const DB_FILE_PATH = path.join(process.cwd(), 'src/lib/db.json');

// Ensure db directory and file exist with seed data
function initDB(): DBStructure {
  const dir = path.dirname(DB_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (fs.existsSync(DB_FILE_PATH)) {
    try {
      const content = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      return JSON.parse(content);
    } catch {
      // If corrupted, reinitialize
    }
  }

  // Initial Seed Data
  const initialData: DBStructure = {
    scrap: [
      { id: 1, date: '2026-08-20', supplier_name: 'Metal Recyclers Corp', scrap_category: 'Heavy Melting', truck_no: 'TR-1024', gross_weight: 24500, tare_weight: 9500, net_received_kg: 15000, rate_per_kg: 42, total_cost: 630000 },
      { id: 2, date: '2026-08-21', supplier_name: 'Apex Scrap Sourcing', scrap_category: 'LC Scrap', truck_no: 'TR-8812', gross_weight: 22000, tare_weight: 9200, net_received_kg: 12800, rate_per_kg: 44, total_cost: 563200 },
      { id: 3, date: '2026-08-22', supplier_name: 'Alpha Industrial Alloys', scrap_category: 'Rolling Kechi', truck_no: 'TR-5034', gross_weight: 18500, tare_weight: 9000, net_received_kg: 9500, rate_per_kg: 40, total_cost: 380000 },
      { id: 4, date: '2026-08-23', supplier_name: 'Metro Iron & Steel', scrap_category: 'Tin Bundle', truck_no: 'TR-4455', gross_weight: 19000, tare_weight: 9400, net_received_kg: 9600, rate_per_kg: 38, total_cost: 364800 },
      { id: 5, date: '2026-08-23', supplier_name: 'Metal Recyclers Corp', scrap_category: 'Plate Cutting', truck_no: 'TR-9110', gross_weight: 26000, tare_weight: 9800, net_received_kg: 16200, rate_per_kg: 46, total_cost: 745200 }
    ],
    furnace: [
      { id: 1, date: '2026-08-20', furnace_id: 'EAF-01', heat_no: 'H-260820A', scrap_input_kg: 12000, runtime_min: 52, patching_powder_kg: 150, patching_forma_kg: 45, liquid_steel_tapped_kg: 10800, yield_pct: 90 },
      { id: 2, date: '2026-08-21', furnace_id: 'EAF-01', heat_no: 'H-260821A', scrap_input_kg: 13000, runtime_min: 55, patching_powder_kg: 180, patching_forma_kg: 45, liquid_steel_tapped_kg: 11440, yield_pct: 88 },
      { id: 3, date: '2026-08-22', furnace_id: 'EAF-02', heat_no: 'H-260822A', scrap_input_kg: 11500, runtime_min: 48, patching_powder_kg: 120, patching_forma_kg: 30, liquid_steel_tapped_kg: 10465, yield_pct: 91 },
      { id: 4, date: '2026-08-23', furnace_id: 'EAF-01', heat_no: 'H-260823A', scrap_input_kg: 14000, runtime_min: 58, patching_powder_kg: 200, patching_forma_kg: 60, liquid_steel_tapped_kg: 12180, yield_pct: 87 },
      { id: 5, date: '2026-08-23', furnace_id: 'EAF-02', heat_no: 'H-260823B', scrap_input_kg: 12500, runtime_min: 50, patching_powder_kg: 140, patching_forma_kg: 45, liquid_steel_tapped_kg: 11125, yield_pct: 89 }
    ],
    billet: [
      { id: 1, heat_no: 'H-260820A', billet_size_section: '100x100 mm', billet_output_kg: 10500, scull_loss_kg: 150, scrap_loss_kg: 1500, billet_yield_pct: 87.5 },
      { id: 2, heat_no: 'H-260821A', billet_size_section: '130x130 mm', billet_output_kg: 11100, scull_loss_kg: 180, scrap_loss_kg: 1900, billet_yield_pct: 85.38 },
      { id: 3, heat_no: 'H-260822A', billet_size_section: '100x100 mm', billet_output_kg: 10200, scull_loss_kg: 120, scrap_loss_kg: 1300, billet_yield_pct: 88.7 },
      { id: 4, heat_no: 'H-260823A', billet_size_section: '130x130 mm', billet_output_kg: 11800, scull_loss_kg: 210, scrap_loss_kg: 2200, billet_yield_pct: 84.29 },
      { id: 5, heat_no: 'H-260823B', billet_size_section: '100x100 mm', billet_output_kg: 10800, scull_loss_kg: 160, scrap_loss_kg: 1700, billet_yield_pct: 86.4 }
    ],
    rolling: [
      { id: 1, date: '2026-08-20', billet_input_kg: 10000, rod_size: '12mm', rod_production_kg: 9600, burning_loss_kg: 200, end_cut_loss_kg: 150, miss_roll_kg: 50, rod_loss_kg: 400, rod_yield_pct: 96 },
      { id: 2, date: '2026-08-21', billet_input_kg: 11000, rod_size: '16mm', rod_production_kg: 10580, burning_loss_kg: 220, end_cut_loss_kg: 140, miss_roll_kg: 60, rod_loss_kg: 420, rod_yield_pct: 96.18 },
      { id: 3, date: '2026-08-22', billet_input_kg: 10000, rod_size: '20mm', rod_production_kg: 9550, burning_loss_kg: 200, end_cut_loss_kg: 160, miss_roll_kg: 90, rod_loss_kg: 450, rod_yield_pct: 95.5 },
      { id: 4, date: '2026-08-23', billet_input_kg: 11500, rod_size: '12mm', rod_production_kg: 11020, burning_loss_kg: 240, end_cut_loss_kg: 180, miss_roll_kg: 60, rod_loss_kg: 480, rod_yield_pct: 95.83 },
      { id: 5, date: '2026-08-23', billet_input_kg: 10500, rod_size: '25mm', rod_production_kg: 10050, burning_loss_kg: 210, end_cut_loss_kg: 160, miss_roll_kg: 80, rod_loss_kg: 450, rod_yield_pct: 95.71 }
    ],
    dispatch: [
      { id: 1, date: '2026-08-20', customer_name: 'Metro Infrastructures', challan_no: 'CH-77801', rod_size: '12mm', dispatch_qty_kg: 8000, rate_per_kg: 65, total_selling_price: 520000, truck_no: 'TR-2005', contact_info: 'info@metroinfra.com' },
      { id: 2, date: '2026-08-21', customer_name: 'Bengal Housing Ltd', challan_no: 'CH-77802', rod_size: '16mm', dispatch_qty_kg: 10000, rate_per_kg: 66, total_selling_price: 660000, truck_no: 'TR-1025', contact_info: '+880-1712-334455' },
      { id: 3, date: '2026-08-22', customer_name: 'Apex Bridges & Roads', challan_no: 'CH-77803', rod_size: '20mm', dispatch_qty_kg: 9000, rate_per_kg: 68, total_selling_price: 612000, truck_no: 'TR-3088', contact_info: 'dispatch@apexbridges.org' },
      { id: 4, date: '2026-08-23', customer_name: 'Dhaka Construction Co', challan_no: 'CH-77804', rod_size: '12mm', dispatch_qty_kg: 7500, rate_per_kg: 65, total_selling_price: 487500, truck_no: 'TR-5052', contact_info: 'dhakaconco@dhaka.net' },
      { id: 5, date: '2026-08-23', customer_name: 'Metro Infrastructures', challan_no: 'CH-77805', rod_size: '25mm', dispatch_qty_kg: 9500, rate_per_kg: 69, total_selling_price: 655500, truck_no: 'TR-9204', contact_info: 'info@metroinfra.com' }
    ],
    downtime: [
      { id: 1, date: '2026-08-20', section: 'BILLET_LINE', breakdown_category: 'Electrical', duration_min: 45, root_cause_notes: 'Caster mold electromagnetic stirrer sensor failure.', resolved_by: 'Engr. Shafiul Islam' },
      { id: 2, date: '2026-08-21', section: 'ROLLING_LINE', breakdown_category: 'Roll Change', duration_min: 90, root_cause_notes: 'Scheduled changeover to 16mm rebar profiling rolls.', resolved_by: 'Roll Turner Rashed' },
      { id: 3, date: '2026-08-22', section: 'BILLET_LINE', breakdown_category: 'Mechanical', duration_min: 30, root_cause_notes: 'Tundish nozzle alignment correction.', resolved_by: 'Foreman Harun' },
      { id: 4, date: '2026-08-23', section: 'ROLLING_LINE', breakdown_category: 'Power Outage', duration_min: 15, root_cause_notes: 'Brief voltage dip, auxiliary system restart lag.', resolved_by: 'Substation Crew' },
      { id: 5, date: '2026-08-23', section: 'ROLLING_LINE', breakdown_category: 'Mechanical', duration_min: 60, root_cause_notes: 'Miss-roll shear blade replacement in finishing mill block.', resolved_by: 'Engr. Karim Uddin' }
    ],
    energy: [
      { id: 1, date: '2026-08-20', meter_reading_kw: 185200, power_consumed_kwh: 12500, gas_consumed_nm3: 2100, billet_kwh_per_ton: 595.24, rod_kwh_per_ton: 651.04, gas_per_ton: 109.38 },
      { id: 2, date: '2026-08-21', meter_reading_kw: 198000, power_consumed_kwh: 12800, gas_consumed_nm3: 2250, billet_kwh_per_ton: 576.58, rod_kwh_per_ton: 604.91, gas_per_ton: 106.33 },
      { id: 3, date: '2026-08-22', meter_reading_kw: 210100, power_consumed_kwh: 12100, gas_consumed_nm3: 2050, billet_kwh_per_ton: 593.14, rod_kwh_per_ton: 633.51, gas_per_ton: 107.33 },
      { id: 4, date: '2026-08-23', meter_reading_kw: 224300, power_consumed_kwh: 14200, gas_consumed_nm3: 2450, billet_kwh_per_ton: 628.32, rod_kwh_per_ton: 644.28, gas_per_ton: 111.16 }
    ],
    weighbridge: [
      { id: 1, ticket_no: 'WB-260820-001', date: '2026-08-20', vehicle_no: 'TR-1024', material_type: 'Incoming Scrap', gross_weight_kg: 24500, tare_weight_kg: 9500, net_weight_kg: 15000, status: 'Completed' },
      { id: 2, ticket_no: 'WB-260820-002', date: '2026-08-20', vehicle_no: 'TR-2005', material_type: 'Outgoing Finished Rods', gross_weight_kg: 16500, tare_weight_kg: 8500, net_weight_kg: 8000, status: 'Completed' },
      { id: 3, ticket_no: 'WB-260821-001', date: '2026-08-21', vehicle_no: 'TR-8812', material_type: 'Incoming Scrap', gross_weight_kg: 22000, tare_weight_kg: 9200, net_weight_kg: 12800, status: 'Completed' },
      { id: 4, ticket_no: 'WB-260822-001', date: '2026-08-22', vehicle_no: 'TR-3088', material_type: 'Outgoing Finished Rods', gross_weight_kg: 17800, tare_weight_kg: 8800, net_weight_kg: 9000, status: 'Completed' },
      { id: 5, ticket_no: 'WB-260823-001', date: '2026-08-23', vehicle_no: 'TR-9110', material_type: 'Incoming Scrap', gross_weight_kg: 26000, tare_weight_kg: 9800, net_weight_kg: 16200, status: 'Completed' }
    ],
    quality: [
      { id: 1, heat_no: 'H-260820A', test_date: '2026-08-20', pct_c: 0.22, pct_mn: 0.85, pct_si: 0.24, pct_s: 0.035, pct_p: 0.038, pct_ce: 0.37, yield_strength_n_mm2: 520.4, tensile_strength_n_mm2: 635.8, elongation_pct: 18.5, bend_test_status: 'Approved' },
      { id: 2, heat_no: 'H-260821A', test_date: '2026-08-21', pct_c: 0.24, pct_mn: 0.90, pct_si: 0.26, pct_s: 0.040, pct_p: 0.042, pct_ce: 0.40, yield_strength_n_mm2: 535.2, tensile_strength_n_mm2: 650.5, elongation_pct: 17.8, bend_test_status: 'Approved' },
      { id: 3, heat_no: 'H-260822A', test_date: '2026-08-22', pct_c: 0.21, pct_mn: 0.82, pct_si: 0.22, pct_s: 0.030, pct_p: 0.032, pct_ce: 0.35, yield_strength_n_mm2: 512.8, tensile_strength_n_mm2: 622.3, elongation_pct: 19.2, bend_test_status: 'Approved' },
      { id: 4, heat_no: 'H-260823A', test_date: '2026-08-23', pct_c: 0.26, pct_mn: 0.95, pct_si: 0.28, pct_s: 0.048, pct_p: 0.049, pct_ce: 0.43, yield_strength_n_mm2: 548.0, tensile_strength_n_mm2: 662.0, elongation_pct: 16.5, bend_test_status: 'Approved' }
    ],
    inventory: {
      raw_scrap_mt: 382.50,
      billet_yard_mt: 145.20,
      rebar_10mm_mt: 42.00,
      rebar_12mm_mt: 74.80,
      rebar_16mm_mt: 98.40,
      rebar_20mm_mt: 86.50,
      rebar_25mm_mt: 55.20,
      rebar_32mm_mt: 28.00,
      store_spares_qty: 1250
    },
    expenses: [
      { id: 1, date: '2026-08-20', category: 'Spares', voucher_no: 'PV-10255', description: 'Bought caster mold seals and bearings.', amount: 45000, type: 'Expense' },
      { id: 2, date: '2026-08-21', category: 'Electricity', voucher_no: 'PV-10256', description: 'EAF power utility billing deposit.', amount: 820000, type: 'Expense' },
      { id: 3, date: '2026-08-22', category: 'Scrap Purchase', voucher_no: 'SP-99120', description: 'Outstanding payable to Metal Recyclers Corp for invoice #2608A.', amount: 630000, type: 'Scrap Payable' },
      { id: 4, date: '2026-08-23', category: 'Consumables', voucher_no: 'PV-10257', description: 'Bought Ladle patching powder (40 bags) & forma powder.', amount: 35000, type: 'Expense' },
      { id: 5, date: '2026-08-23', category: 'Others', voucher_no: 'CR-88204', description: 'Receivable invoice generated for Metro Infrastructures challan CH-77805.', amount: 655500, type: 'Customer Receivable' }
    ],
    shifts: [
      { id: 1, date: '2026-08-20', shift: 'Shift A', furnace_master: 'Kabir Ahmed', roll_turner: 'Rashedul Bari', operators_present: 24, attendance_log: '100% core attendance, minor roll change delayed shift handover by 10 mins.' },
      { id: 2, date: '2026-08-21', shift: 'Shift B', furnace_master: 'Zahirul Haque', roll_turner: 'Jamil Hossain', operators_present: 22, attendance_log: '2 absences covered. Ladle crane routine maintenance completed without downtime.' },
      { id: 3, date: '2026-08-22', shift: 'Shift C', furnace_master: 'Ataur Rahman', roll_turner: 'Rashedul Bari', operators_present: 23, attendance_log: 'Night shift operations normal, tapped 1 heat of standard Grade 60 alloy.' },
      { id: 4, date: '2026-08-23', shift: 'Shift A', furnace_master: 'Kabir Ahmed', roll_turner: 'Rashedul Bari', operators_present: 25, attendance_log: 'Fully operational shift, EAF-01 and CCM-02 running simultaneously.' }
    ]
  };

  fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
  return initialData;
}

export function readDB(): DBStructure {
  return initDB();
}

export function writeDB(data: DBStructure): void {
  fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// -------------------------------------------------------------
// Transaction Logics & Relational Triggers
// -------------------------------------------------------------

export function addScrapRow(row: Omit<ScrapRow, 'id' | 'net_received_kg' | 'total_cost'>): ScrapRow {
  const db = readDB();
  const net_received_kg = row.gross_weight - row.tare_weight;
  const total_cost = net_received_kg * row.rate_per_kg;
  
  const newRow: ScrapRow = {
    ...row,
    id: db.scrap.length > 0 ? Math.max(...db.scrap.map(r => r.id)) + 1 : 1,
    net_received_kg,
    total_cost
  };

  db.scrap.push(newRow);

  // Trigger: Add net received scrap to raw scrap inventory (MT)
  db.inventory.raw_scrap_mt = parseFloat((db.inventory.raw_scrap_mt + (net_received_kg / 1000)).toFixed(2));
  
  writeDB(db);
  return newRow;
}

export function addFurnaceRow(row: Omit<FurnaceRow, 'id' | 'yield_pct'>): FurnaceRow {
  const db = readDB();
  const yield_pct = parseFloat(((row.liquid_steel_tapped_kg / row.scrap_input_kg) * 100).toFixed(2));

  const newRow: FurnaceRow = {
    ...row,
    id: db.furnace.length > 0 ? Math.max(...db.furnace.map(r => r.id)) + 1 : 1,
    yield_pct
  };

  db.furnace.push(newRow);

  // Trigger: Deduct scrap input from raw scrap inventory (MT)
  db.inventory.raw_scrap_mt = parseFloat((db.inventory.raw_scrap_mt - (row.scrap_input_kg / 1000)).toFixed(2));

  writeDB(db);
  return newRow;
}

export function addBilletRow(row: Omit<BilletRow, 'id' | 'scrap_loss_kg' | 'billet_yield_pct'>): BilletRow {
  const db = readDB();

  // Relational Lookup: Find Scrap Input from the Furnace Heat Log
  const furnaceHeat = db.furnace.find(f => f.heat_no === row.heat_no);
  const scrapInput = furnaceHeat ? furnaceHeat.scrap_input_kg : row.billet_output_kg + row.scull_loss_kg; // fallback
  
  const scrap_loss_kg = scrapInput - row.billet_output_kg;
  const billet_yield_pct = parseFloat(((row.billet_output_kg / scrapInput) * 100).toFixed(2));

  const newRow: BilletRow = {
    ...row,
    id: db.billet.length > 0 ? Math.max(...db.billet.map(r => r.id)) + 1 : 1,
    scrap_loss_kg,
    billet_yield_pct
  };

  db.billet.push(newRow);

  // Trigger: Add Billet output to billet yard inventory (MT)
  db.inventory.billet_yard_mt = parseFloat((db.inventory.billet_yard_mt + (row.billet_output_kg / 1000)).toFixed(2));

  writeDB(db);
  return newRow;
}

export function addRollingRow(row: Omit<RollingRow, 'id' | 'rod_loss_kg' | 'rod_yield_pct'>): RollingRow {
  const db = readDB();
  const rod_loss_kg = row.billet_input_kg - row.rod_production_kg;
  const rod_yield_pct = parseFloat(((row.rod_production_kg / row.billet_input_kg) * 100).toFixed(2));

  const newRow: RollingRow = {
    ...row,
    id: db.rolling.length > 0 ? Math.max(...db.rolling.map(r => r.id)) + 1 : 1,
    rod_loss_kg,
    rod_yield_pct
  };

  db.rolling.push(newRow);

  // Trigger: Deduct Billet input from Billet Yard (MT)
  db.inventory.billet_yard_mt = parseFloat((db.inventory.billet_yard_mt - (row.billet_input_kg / 1000)).toFixed(2));

  // Trigger: Add Rod Production to Rebar Inventory based on size (diameter)
  const sizeKey = `rebar_${row.rod_size.toLowerCase()}_mt` as keyof InventoryRow;
  if (sizeKey in db.inventory) {
    (db.inventory[sizeKey] as number) = parseFloat(((db.inventory[sizeKey] as number) + (row.rod_production_kg / 1000)).toFixed(2));
  }

  writeDB(db);
  return newRow;
}

export function addDispatchRow(row: Omit<DispatchRow, 'id' | 'total_selling_price'>): DispatchRow {
  const db = readDB();
  const total_selling_price = row.dispatch_qty_kg * row.rate_per_kg;

  const newRow: DispatchRow = {
    ...row,
    id: db.dispatch.length > 0 ? Math.max(...db.dispatch.map(r => r.id)) + 1 : 1,
    total_selling_price
  };

  db.dispatch.push(newRow);

  // Trigger: Deduct Rod Dispatch from Rebar Inventory based on size (diameter)
  const sizeKey = `rebar_${row.rod_size.toLowerCase()}_mt` as keyof InventoryRow;
  if (sizeKey in db.inventory) {
    (db.inventory[sizeKey] as number) = parseFloat(((db.inventory[sizeKey] as number) - (row.dispatch_qty_kg / 1000)).toFixed(2));
  }

  writeDB(db);
  return newRow;
}

export function addDowntimeRow(row: Omit<DowntimeRow, 'id'>): DowntimeRow {
  const db = readDB();
  const newRow: DowntimeRow = {
    ...row,
    id: db.downtime.length > 0 ? Math.max(...db.downtime.map(r => r.id)) + 1 : 1
  };
  db.downtime.push(newRow);
  writeDB(db);
  return newRow;
}

export function addEnergyRow(row: Omit<EnergyRow, 'id' | 'billet_kwh_per_ton' | 'rod_kwh_per_ton' | 'gas_per_ton'>): EnergyRow {
  const db = readDB();

  // Find daily billet output and daily rod production for this specific date
  const dailyBilletOutputKg = db.billet
    .filter(b => {
      const furnaceRecord = db.furnace.find(f => f.heat_no === b.heat_no);
      return furnaceRecord && furnaceRecord.date === row.date;
    })
    .reduce((sum, b) => sum + b.billet_output_kg, 0);

  const dailyRodProductionKg = db.rolling
    .filter(r => r.date === row.date)
    .reduce((sum, r) => sum + r.rod_production_kg, 0);

  const dailyBilletTons = dailyBilletOutputKg > 0 ? dailyBilletOutputKg / 1000 : 18.5; // fallback defaults if none logged yet
  const dailyRodTons = dailyRodProductionKg > 0 ? dailyRodProductionKg / 1000 : 16.2;     // fallback defaults if none logged yet

  const billet_kwh_per_ton = parseFloat((row.power_consumed_kwh / dailyBilletTons).toFixed(2));
  const rod_kwh_per_ton = parseFloat((row.power_consumed_kwh / dailyRodTons).toFixed(2));
  const gas_per_ton = parseFloat((row.gas_consumed_nm3 / dailyRodTons).toFixed(2));

  const newRow: EnergyRow = {
    ...row,
    id: db.energy.length > 0 ? Math.max(...db.energy.map(r => r.id)) + 1 : 1,
    billet_kwh_per_ton,
    rod_kwh_per_ton,
    gas_per_ton
  };

  db.energy.push(newRow);
  writeDB(db);
  return newRow;
}

export function addWeighbridgeRow(row: Omit<WeighbridgeRow, 'id' | 'net_weight_kg'>): WeighbridgeRow {
  const db = readDB();
  const net_weight_kg = row.gross_weight_kg - row.tare_weight_kg;

  const newRow: WeighbridgeRow = {
    ...row,
    id: db.weighbridge.length > 0 ? Math.max(...db.weighbridge.map(r => r.id)) + 1 : 1,
    net_weight_kg
  };

  db.weighbridge.push(newRow);
  writeDB(db);
  return newRow;
}

export function addQualityRow(row: Omit<QualityRow, 'id' | 'pct_ce'>): QualityRow {
  const db = readDB();
  const pct_ce = parseFloat((row.pct_c + row.pct_mn / 6 + row.pct_si / 24).toFixed(3));

  const newRow: QualityRow = {
    ...row,
    id: db.quality.length > 0 ? Math.max(...db.quality.map(r => r.id)) + 1 : 1,
    pct_ce
  };

  db.quality.push(newRow);
  writeDB(db);
  return newRow;
}

export function updateInventory(inventory: InventoryRow): InventoryRow {
  const db = readDB();
  db.inventory = { ...inventory };
  writeDB(db);
  return db.inventory;
}

export function addExpenseRow(row: Omit<ExpenseRow, 'id'>): ExpenseRow {
  const db = readDB();
  const newRow: ExpenseRow = {
    ...row,
    id: db.expenses.length > 0 ? Math.max(...db.expenses.map(r => r.id)) + 1 : 1
  };
  db.expenses.push(newRow);
  writeDB(db);
  return newRow;
}

export function addShiftRow(row: Omit<ShiftRow, 'id'>): ShiftRow {
  const db = readDB();
  const newRow: ShiftRow = {
    ...row,
    id: db.shifts.length > 0 ? Math.max(...db.shifts.map(r => r.id)) + 1 : 1
  };
  db.shifts.push(newRow);
  writeDB(db);
  return newRow;
}
