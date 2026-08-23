import fs from 'fs';
import path from 'path';

// Interfaces for our Relational Database Tables matching the Excel MIS columns
export interface ScrapRow {
  id: number;
  date: string; // Date
  supplier_name: string; // Scarp Party Name
  scrap_category: string; // Scarp Category (LC Scrap, Rolling Kechi, Tin Bundle, Plate Cutting, etc.)
  scrap_rcv_kg: number; // Scrap Rcv (KG)
  truck_no: string; // Challan/Truck No
  gross_weight: number; // Gross Weight (kg)
  value_tare: number; // Tare Weight (kg)
  rate_per_kg: number; // Rate Per KG
  total_cost: number; // Total Purchase Cost
  yard_location: string; // Unloading Yard Location
}

export interface FurnaceRow {
  id: number;
  date: string; // Date
  furnace_no: string; // Furnace No
  heat_no: string; // Heat No.
  scrap_input_kg: number; // Scarp Input (kg)
  runtime_min: number; // Runtime (Min)
  used_patching_powder_kg: number; // Used Patching Powder (kg)
  used_patching_forma_kg: number; // Used Paching Forma (kg)
  tapping_temp_c: number; // Tapping Temperature (°C)
  liquid_steel_tapped_kg: number; // Liquid Steel Tapped (kg)
  power_consumed_kwh: number; // Power Consumed (kWh)
  shift_id: string; // Shift ID (A/B/C)
  furnace_master: string; // Furnace Master Name
}

export interface BilletRow {
  id: number;
  date: string; // Date
  billet_size_section: string; // Billet Size (e.g. 100x100mm x 6m)
  billet_output_kg: number; // Billet Production (kg)
  scull_loss_kg: number; // Scarp Loss (kg) (Scarp Input - Billet Production)
  billet_yield_pct: number; // Billet Yield%
  billet_stock_kg: number; // Billet Stock (kg)
  heat_no: string; // References Furnace Log
}

export interface RollingRow {
  id: number;
  date: string; // Date
  billet_input_kg: number; // Billet Input (kg)
  rod_size: string; // Rod Size (10MM, 12MM, 16MM, 20MM, 25MM, 32MM)
  rod_production_kg: number; // Rod Production (kg)
  rod_loss_kg: number; // Rod Loss (kg) (Billet Input - Rod Production)
  rod_yield_pct: number; // Rod Yield%
  rod_stock_kg: number; // Rod Stock (kg)
}

export interface DispatchRow {
  id: number;
  date: string; // Date
  customer_name: string; // Customer Name
  contact_info: string; // Contact Info
  challan_no: string; // Challan No
  rod_size: string; // Rod Size
  dispatch_qty_kg: number; // Dispatch Qty (kg)
  rate_per_kg: number; // Rate Per KG
  total_selling_price: number; // Total Selling Price
  truck_details: string; // Truck / Driver Details
  payment_terms: string; // Payment Terms
  delivery_status: 'Pending' | 'In-Transit' | 'Delivered'; // Delivery Status
}

export interface DowntimeRow {
  id: number;
  date: string; // Date
  billet_breakdown_min: number; // Billet Breakdown Min (Melt Shop / CCM)
  rolling_breakdown_min: number; // Rolling Breakdown Min (Re-Rolling Mill)
  breakdown_category: string; // Mechanical, Electrical, Roll Changing, Power Cut, Furnace Relining
  root_cause_notes: string; // Root Cause Notes
  shift_code: string; // Shift Code
  action_taken: string; // Action Taken
}

export interface EnergyRow {
  id: number;
  date: string; // Date
  power_consumption_kw: number; // Power Consumpsion (KW)
  gas_consumption_nm3: number; // Gas Consumsion (Nm3)
  power_consumed_per_kg: number; // Power Consumpsion per kg
  gas_consumed_per_kg: number; // Gas Consumsion per kg
  peak_demand_kva: number; // Peak Demand (kVA)
  furnace_kwh_per_mt: number; // Furnace kWh/MT
  rolling_kwh_per_mt: number; // Rolling Mill kWh/MT
}

export interface WeighbridgeRow {
  id: number;
  ticket_no: string; // Ticket No
  date_time: string; // Date & Time
  vehicle_no: string; // Vehicle Number
  party_name: string; // Party Name
  material_type: 'Raw Scrap Inward' | 'Finished Rod Outward'; // Material Type
  gross_weight_kg: number; // Gross Weight (kg)
  tare_weight_kg: number; // Tare Weight (kg)
  net_weight_kg: number; // Net Weight (kg)
  operator_signature: string; // Operator Signature
}

export interface QualityRow {
  id: number;
  heat_no: string; // Heat No.
  testing_date: string; // Testing Date
  pct_c: number; // %C
  pct_mn: number; // %Mn
  pct_si: number; // %Si
  pct_s: number; // %S
  pct_p: number; // %P
  pct_ce: number; // %CE (Carbon Equivalent)
  yield_strength_n_mm2: number; // Yield Strength (N/mm2)
  tensile_strength_n_mm2: number; // Tensile Strength (N/mm2)
  elongation_pct: number; // % Elongation
  bend_test_result: 'Approved' | 'Rejected'; // 180° Bend Test Result
  nominal_mass_g_m: number; // Nominal Mass per Meter (kg/m)
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
  store_patching_powder_kg: number;
  store_patching_forma_qty: number;
  store_rolls_qty: number;
  store_guides_qty: number;
}

export interface ExpenseRow {
  id: number;
  date: string; // Date
  expenses: number; // Expenses (Expenditure Amount)
  category: string; // Expense Category
  voucher_no: string; // Voucher No
  payment_method: string; // Payment Method
  remarks: string; // Remarks
}

export interface ShiftRow {
  id: number;
  date: string; // Date
  shift_id: 'Shift A' | 'Shift B' | 'Shift C' | 'General'; // Shift ID
  shift_supervisor: string; // Shift Supervisor
  furnace_tapper_melters: string; // Furnace Tapper / Melters
  ccm_operators: string; // CCM Operators
  roll_turners_feeders: string; // Roll Turners / Feeders
  total_crew_strength: number; // Total Crew Strength
  shift_output_mt: number; // Shift Output (MT)
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

// Ensure db directory and file exist with seeded schema
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
      // Re-seed on corruption
    }
  }

  // Seeding initial spreadsheet logs
  const initialData: DBStructure = {
    scrap: [
      { id: 1, date: '2026-08-20', supplier_name: 'Metal Recyclers Corp', scrap_category: 'LC Scrap', scrap_rcv_kg: 15000, truck_no: 'TR-1024', gross_weight: 24500, value_tare: 9500, rate_per_kg: 42, total_cost: 630000, yard_location: 'Bay A' },
      { id: 2, date: '2026-08-21', supplier_name: 'Apex Scrap Suppliers', scrap_category: 'Rolling Kechi', scrap_rcv_kg: 12800, truck_no: 'TR-8812', gross_weight: 22000, value_tare: 9200, rate_per_kg: 44, total_cost: 563200, yard_location: 'Bay B' },
      { id: 3, date: '2026-08-22', supplier_name: 'Alpha Alloys', scrap_category: 'Plate Cutting', scrap_rcv_kg: 9500, truck_no: 'TR-5034', gross_weight: 18500, value_tare: 9000, rate_per_kg: 40, total_cost: 380000, yard_location: 'Bay A' }
    ],
    furnace: [
      { id: 1, date: '2026-08-20', furnace_no: 'Furnace 01', heat_no: 'H-260820A', scrap_input_kg: 12000, runtime_min: 52, used_patching_powder_kg: 150, used_patching_forma_kg: 1, tapping_temp_c: 1540, liquid_steel_tapped_kg: 10800, power_consumed_kwh: 7200, shift_id: 'A', furnace_master: 'Kabir Ahmed' },
      { id: 2, date: '2026-08-21', furnace_no: 'Furnace 01', heat_no: 'H-260821A', scrap_input_kg: 13000, runtime_min: 55, used_patching_powder_kg: 180, used_patching_forma_kg: 1, tapping_temp_c: 1560, liquid_steel_tapped_kg: 11440, power_consumed_kwh: 7800, shift_id: 'B', furnace_master: 'Zahirul Haque' },
      { id: 3, date: '2026-08-22', furnace_no: 'Furnace 02', heat_no: 'H-260822A', scrap_input_kg: 11500, runtime_min: 48, used_patching_powder_kg: 120, used_patching_forma_kg: 0, tapping_temp_c: 1550, liquid_steel_tapped_kg: 10465, power_consumed_kwh: 6900, shift_id: 'C', furnace_master: 'Ataur Rahman' }
    ],
    billet: [
      { id: 1, date: '2026-08-20', billet_size_section: '100x100mm x 6m', billet_output_kg: 10500, scull_loss_kg: 1500, billet_yield_pct: 87.5, billet_stock_kg: 50000, heat_no: 'H-260820A' },
      { id: 2, date: '2026-08-21', billet_size_section: '130x130mm x 6m', billet_output_kg: 11100, scull_loss_kg: 1900, billet_yield_pct: 85.38, billet_stock_kg: 61100, heat_no: 'H-260821A' },
      { id: 3, date: '2026-08-22', billet_size_section: '100x100mm x 6m', billet_output_kg: 10200, scull_loss_kg: 1300, billet_yield_pct: 88.7, billet_stock_kg: 71300, heat_no: 'H-260822A' }
    ],
    rolling: [
      { id: 1, date: '2026-08-20', billet_input_kg: 10000, rod_size: '12MM', rod_production_kg: 9600, rod_loss_kg: 400, rod_yield_pct: 96, rod_stock_kg: 145000 },
      { id: 2, date: '2026-08-21', billet_input_kg: 11000, rod_size: '16MM', rod_production_kg: 10580, rod_loss_kg: 420, rod_yield_pct: 96.18, rod_stock_kg: 155580 },
      { id: 3, date: '2026-08-22', billet_input_kg: 10000, rod_size: '20MM', rod_production_kg: 9550, rod_loss_kg: 450, rod_yield_pct: 95.5, rod_stock_kg: 165130 }
    ],
    dispatch: [
      { id: 1, date: '2026-08-20', customer_name: 'Metro Infrastructures', contact_info: 'info@metroinfra.com', challan_no: 'CH-77801', rod_size: '12MM', dispatch_qty_kg: 8000, rate_per_kg: 65, total_selling_price: 520000, truck_details: 'TR-2005 / Driver Jamal', payment_terms: 'LC 30 Days', delivery_status: 'Delivered' },
      { id: 2, date: '2026-08-21', customer_name: 'Bengal Housing Ltd', contact_info: '01712-334455', challan_no: 'CH-77802', rod_size: '16MM', dispatch_qty_kg: 10000, rate_per_kg: 66, total_selling_price: 660000, truck_details: 'TR-1025 / Driver Milon', payment_terms: 'Cash on Delivery', delivery_status: 'Delivered' },
      { id: 3, date: '2026-08-22', customer_name: 'Apex Bridges', contact_info: 'dispatch@apex.org', challan_no: 'CH-77803', rod_size: '20MM', dispatch_qty_kg: 9000, rate_per_kg: 68, total_selling_price: 612000, truck_details: 'TR-3088 / Driver Rahim', payment_terms: 'Post Dated Cheque', delivery_status: 'In-Transit' }
    ],
    downtime: [
      { id: 1, date: '2026-08-20', billet_breakdown_min: 45, rolling_breakdown_min: 0, breakdown_category: 'Electrical', root_cause_notes: 'CCM mold stirrer sensor replacement', shift_code: 'A', action_taken: 'Replaced inductive sensor' },
      { id: 2, date: '2026-08-21', billet_breakdown_min: 0, rolling_breakdown_min: 90, breakdown_category: 'Roll Changing', root_cause_notes: 'Scheduled changeover to 16MM guide rolls', shift_code: 'B', action_taken: 'Replaced 12mm sizing blocks' },
      { id: 3, date: '2026-08-22', billet_breakdown_min: 30, rolling_breakdown_min: 0, breakdown_category: 'Mechanical', root_cause_notes: 'Ladle slide-gate nozzle alignment checks', shift_code: 'C', action_taken: 'Re-aligned cylinder guides' }
    ],
    energy: [
      { id: 1, date: '2026-08-20', power_consumption_kw: 12500, gas_consumption_nm3: 2100, power_consumed_per_kg: 1.30, gas_consumed_per_kg: 0.22, peak_demand_kva: 3400, furnace_kwh_per_mt: 595, rolling_kwh_per_mt: 651 },
      { id: 2, date: '2026-08-21', power_consumption_kw: 12800, gas_consumption_nm3: 2250, power_consumed_per_kg: 1.21, gas_consumed_per_kg: 0.21, peak_demand_kva: 3500, furnace_kwh_per_mt: 576, rolling_kwh_per_mt: 604 },
      { id: 3, date: '2026-08-22', power_consumption_kw: 12100, gas_consumption_nm3: 2050, power_consumed_per_kg: 1.27, gas_consumed_per_kg: 0.21, peak_demand_kva: 3300, furnace_kwh_per_mt: 593, rolling_kwh_per_mt: 633 }
    ],
    weighbridge: [
      { id: 1, ticket_no: 'WB-260820-001', date_time: '2026-08-20 09:30', vehicle_no: 'TR-1024', party_name: 'Metal Recyclers Corp', material_type: 'Raw Scrap Inward', gross_weight_kg: 24500, tare_weight_kg: 9500, net_weight_kg: 15000, operator_signature: 'Masum Billah' },
      { id: 2, ticket_no: 'WB-260820-002', date_time: '2026-08-20 16:15', vehicle_no: 'TR-2005', party_name: 'Metro Infrastructures', material_type: 'Finished Rod Outward', gross_weight_kg: 16500, tare_weight_kg: 8500, net_weight_kg: 8000, operator_signature: 'Masum Billah' },
      { id: 3, ticket_no: 'WB-260821-001', date_time: '2026-08-21 10:45', vehicle_no: 'TR-8812', party_name: 'Apex Scrap Suppliers', material_type: 'Raw Scrap Inward', gross_weight_kg: 22000, tare_weight_kg: 9200, net_weight_kg: 12800, operator_signature: 'S. K. Dev' }
    ],
    quality: [
      { id: 1, heat_no: 'H-260820A', testing_date: '2026-08-20', pct_c: 0.22, pct_mn: 0.85, pct_si: 0.24, pct_s: 0.035, pct_p: 0.038, pct_ce: 0.37, yield_strength_n_mm2: 520, tensile_strength_n_mm2: 635, elongation_pct: 18, bend_test_result: 'Approved', nominal_mass_g_m: 0.888 },
      { id: 2, heat_no: 'H-260821A', testing_date: '2026-08-21', pct_c: 0.24, pct_mn: 0.90, pct_si: 0.26, pct_s: 0.040, pct_p: 0.042, pct_ce: 0.40, yield_strength_n_mm2: 535, tensile_strength_n_mm2: 650, elongation_pct: 17, bend_test_result: 'Approved', nominal_mass_g_m: 1.580 },
      { id: 3, heat_no: 'H-260822A', testing_date: '2026-08-22', pct_c: 0.21, pct_mn: 0.82, pct_si: 0.22, pct_s: 0.030, pct_p: 0.032, pct_ce: 0.35, yield_strength_n_mm2: 512, tensile_strength_n_mm2: 622, elongation_pct: 19, bend_test_result: 'Approved', nominal_mass_g_m: 2.470 }
    ],
    inventory: {
      raw_scrap_mt: 382.5,
      billet_yard_mt: 145.2,
      rebar_10mm_mt: 42.0,
      rebar_12mm_mt: 74.8,
      rebar_16mm_mt: 98.4,
      rebar_20mm_mt: 86.5,
      rebar_25mm_mt: 55.2,
      rebar_32mm_mt: 28.0,
      store_patching_powder_kg: 5000,
      store_patching_forma_qty: 25,
      store_rolls_qty: 12,
      store_guides_qty: 48
    },
    expenses: [
      { id: 1, date: '2026-08-20', expenses: 45000, category: 'Spares & Refractory', voucher_no: 'PV-10255', payment_method: 'Bank Transfer', remarks: 'Purchased secondary guide rolls' },
      { id: 2, date: '2026-08-21', expenses: 820000, category: 'Electricity Bill', voucher_no: 'PV-10256', payment_method: 'Pay Order', remarks: 'August industrial line billing' },
      { id: 3, date: '2026-08-22', expenses: 630000, category: 'Scrap Procurement', voucher_no: 'SP-99120', payment_method: 'Letter of Credit', remarks: 'Procurement invoice raw scrap weight' }
    ],
    shifts: [
      { id: 1, date: '2026-08-20', shift_id: 'Shift A', shift_supervisor: 'Aminul Islam', furnace_tapper_melters: 'Karim / Sabuj', ccm_operators: 'Rafiqul / Sumon', roll_turners_feeders: 'Milon / Sajal', total_crew_strength: 24, shift_output_mt: 10.5 },
      { id: 2, date: '2026-08-21', shift_id: 'Shift B', shift_supervisor: 'Jafar Ahmed', furnace_tapper_melters: 'Selim / Alam', ccm_operators: 'Faruk / Jamil', roll_turners_feeders: 'Rubel / Hasan', total_crew_strength: 22, shift_output_mt: 11.1 },
      { id: 3, date: '2026-08-22', shift_id: 'Shift C', shift_supervisor: 'Tariqul Bari', furnace_tapper_melters: 'Sohag / Imran', ccm_operators: 'Nayan / Sohel', roll_turners_feeders: 'Nasir / Al-Amin', total_crew_strength: 23, shift_output_mt: 10.2 }
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
// Transaction Calculations & Relational Triggers
// -------------------------------------------------------------

export function addScrapRow(row: Omit<ScrapRow, 'id' | 'total_cost'>): ScrapRow {
  const db = readDB();
  const total_cost = row.scrap_rcv_kg * row.rate_per_kg;

  const newRow: ScrapRow = {
    ...row,
    id: db.scrap.length > 0 ? Math.max(...db.scrap.map(r => r.id)) + 1 : 1,
    total_cost
  };

  db.scrap.push(newRow);

  // Trigger: Add scrap payload to yard raw scrap inventory (MT)
  db.inventory.raw_scrap_mt = parseFloat((db.inventory.raw_scrap_mt + (row.scrap_rcv_kg / 1000)).toFixed(2));

  writeDB(db);
  return newRow;
}

export function addFurnaceRow(row: Omit<FurnaceRow, 'id'>): FurnaceRow {
  const db = readDB();

  const newRow: FurnaceRow = {
    ...row,
    id: db.furnace.length > 0 ? Math.max(...db.furnace.map(r => r.id)) + 1 : 1
  };

  db.furnace.push(newRow);

  // Trigger: Deduct charged scrap from raw scrap yard
  db.inventory.raw_scrap_mt = parseFloat((db.inventory.raw_scrap_mt - (row.scrap_input_kg / 1000)).toFixed(2));
  // Deduct patching powder and refractory forma from stores
  db.inventory.store_patching_powder_kg = Math.max(0, db.inventory.store_patching_powder_kg - row.used_patching_powder_kg);
  db.inventory.store_patching_forma_qty = Math.max(0, db.inventory.store_patching_forma_qty - row.used_patching_forma_kg);

  writeDB(db);
  return newRow;
}

export function addBilletRow(row: Omit<BilletRow, 'id' | 'scull_loss_kg' | 'billet_yield_pct' | 'billet_stock_kg'>): BilletRow {
  const db = readDB();

  // Find related furnace log charge
  const furnaceHeat = db.furnace.find(f => f.heat_no === row.heat_no);
  const scrapInput = furnaceHeat ? furnaceHeat.scrap_input_kg : row.billet_output_kg + 1000; // fallback

  const scull_loss_kg = Math.max(0, scrapInput - row.billet_output_kg);
  const billet_yield_pct = parseFloat(((row.billet_output_kg / scrapInput) * 100).toFixed(2));

  // Compute billet yard stock
  const prevStockKg = db.billet.length > 0 ? db.billet[db.billet.length - 1].billet_stock_kg : 40000;
  // Billet Input into rolling today - we look at rolling logs for today's date
  const rollingInputToday = db.rolling
    .filter(r => r.date === row.date)
    .reduce((sum, r) => sum + r.billet_input_kg, 0);

  const billet_stock_kg = prevStockKg + row.billet_output_kg - rollingInputToday;

  const newRow: BilletRow = {
    ...row,
    scull_loss_kg,
    billet_yield_pct,
    billet_stock_kg,
    id: db.billet.length > 0 ? Math.max(...db.billet.map(r => r.id)) + 1 : 1
  };

  db.billet.push(newRow);

  // Trigger: Add billet output weight to WIP billet yard (MT)
  db.inventory.billet_yard_mt = parseFloat((db.inventory.billet_yard_mt + (row.billet_output_kg / 1000)).toFixed(2));

  writeDB(db);
  return newRow;
}

export function addRollingRow(row: Omit<RollingRow, 'id' | 'rod_loss_kg' | 'rod_yield_pct' | 'rod_stock_kg'>): RollingRow {
  const db = readDB();

  const rod_loss_kg = Math.max(0, row.billet_input_kg - row.rod_production_kg);
  const rod_yield_pct = parseFloat(((row.rod_production_kg / row.billet_input_kg) * 100).toFixed(2));

  // Compute rod yard stock
  const prevStockKg = db.rolling.length > 0 ? db.rolling[db.rolling.length - 1].rod_stock_kg : 120000;
  // Dispatch today of this rod size
  const dispatchToday = db.dispatch
    .filter(d => d.date === row.date && d.rod_size === row.rod_size)
    .reduce((sum, d) => sum + d.dispatch_qty_kg, 0);

  const rod_stock_kg = prevStockKg + row.rod_production_kg - dispatchToday;

  const newRow: RollingRow = {
    ...row,
    rod_loss_kg,
    rod_yield_pct,
    rod_stock_kg,
    id: db.rolling.length > 0 ? Math.max(...db.rolling.map(r => r.id)) + 1 : 1
  };

  db.rolling.push(newRow);

  // Trigger: Deduct Billet Input from Billet Yard inventory (MT)
  db.inventory.billet_yard_mt = parseFloat((db.inventory.billet_yard_mt - (row.billet_input_kg / 1000)).toFixed(2));

  // Trigger: Increment Finished Rebar Yard inventory size key (MT)
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

  // Trigger: Decrement Finished Rebar Yard inventory size key (MT)
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

export function addEnergyRow(row: Omit<EnergyRow, 'id' | 'power_consumed_per_kg' | 'gas_consumed_per_kg' | 'furnace_kwh_per_mt' | 'rolling_kwh_per_mt'>): EnergyRow {
  const db = readDB();

  // Aggregate today's outputs to calculate ratios
  const dailyBilletOutputKg = db.billet
    .filter(b => b.date === row.date)
    .reduce((sum, b) => sum + b.billet_output_kg, 0);

  const dailyRodProductionKg = db.rolling
    .filter(r => r.date === row.date)
    .reduce((sum, r) => sum + r.rod_production_kg, 0);

  const totalProductionKg = dailyRodProductionKg > 0 ? dailyRodProductionKg : 16000;
  const totalBilletTons = dailyBilletOutputKg > 0 ? dailyBilletOutputKg / 1000 : 18.5;
  const totalRodTons = dailyRodProductionKg > 0 ? dailyRodProductionKg / 1000 : 16.2;

  const power_consumed_per_kg = parseFloat((row.power_consumption_kw / totalProductionKg).toFixed(4));
  const gas_consumed_per_kg = parseFloat((row.gas_consumption_nm3 / totalProductionKg).toFixed(4));

  const furnace_kwh_per_mt = parseFloat((row.power_consumption_kw / totalBilletTons).toFixed(2));
  const rolling_kwh_per_mt = parseFloat((row.power_consumption_kw / totalRodTons).toFixed(2));

  const newRow: EnergyRow = {
    ...row,
    power_consumed_per_kg,
    gas_consumed_per_kg,
    furnace_kwh_per_mt,
    rolling_kwh_per_mt,
    id: db.energy.length > 0 ? Math.max(...db.energy.map(r => r.id)) + 1 : 1
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
    net_weight_kg,
    id: db.weighbridge.length > 0 ? Math.max(...db.weighbridge.map(r => r.id)) + 1 : 1
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
    pct_ce,
    id: db.quality.length > 0 ? Math.max(...db.quality.map(r => r.id)) + 1 : 1
  };

  db.quality.push(newRow);
  writeDB(db);
  return newRow;
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

export function updateInventory(inventory: InventoryRow): InventoryRow {
  const db = readDB();
  db.inventory = { ...inventory };
  writeDB(db);
  return db.inventory;
}
