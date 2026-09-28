import { Request } from 'express';

// Authentication & Tenant Types
export type UserRole = 'super-admin' | 'tenant-admin' | 'operator' | 'auditor';

export interface UserPreferences {
  density: 'cozy' | 'compact';
  defaultTab?: string;
  theme?: 'dark' | 'light';
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  passwordHash?: string;
  tenantId?: string;
  tenantName?: string;
  preferences?: UserPreferences;
  createdAt: string;
  updatedAt?: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended' | 'trial';
  planCode: 'Standard' | 'Growth' | 'Enterprise';
  createdAt: string;
  businessType: 'steel' | 'garments' | 'local';
}

export interface AuthenticatedRequest extends Request {
  user?: User;
  tenantId?: string;
}

// Steel Manufacturing Models
export interface ScrapRow {
  id: number;
  date: string;
  supplier_name: string;
  scrap_category: string;
  scrap_rcv_kg: number;
  truck_no: string;
  gross_weight: number;
  value_tare: number;
  rate_per_kg: number;
  total_cost: number;
  yard_location: string;
}

export interface FurnaceRow {
  id: number;
  date: string;
  furnace_no: string;
  heat_no: string;
  scrap_input_kg: number;
  runtime_min: number;
  used_patching_powder_kg: number;
  used_patching_forma_kg: number;
  tapping_temp_c: number;
  liquid_steel_tapped_kg: number;
  power_consumed_kwh: number;
  shift_id: string;
  furnace_master: string;
}

export interface BilletRow {
  id: number;
  date: string;
  billet_size_section: string;
  billet_output_kg: number;
  scull_loss_kg: number;
  billet_yield_pct: number;
  billet_stock_kg: number;
  heat_no: string;
}

export interface RollingRow {
  id: number;
  date: string;
  billet_input_kg: number;
  rod_size: string;
  rod_production_kg: number;
  rod_loss_kg: number;
  rod_yield_pct: number;
  rod_stock_kg: number;
}

export interface DispatchRow {
  id: number;
  date: string;
  customer_name: string;
  contact_info: string;
  challan_no: string;
  rod_size: string;
  dispatch_qty_kg: number;
  rate_per_kg: number;
  total_selling_price: number;
  truck_details: string;
  payment_terms: string;
  delivery_status: 'Pending' | 'In-Transit' | 'Delivered';
}

export interface DowntimeRow {
  id: number;
  date: string;
  billet_breakdown_min: number;
  rolling_breakdown_min: number;
  breakdown_category: string;
  root_cause_notes: string;
  shift_code: string;
  action_taken: string;
}

export interface EnergyRow {
  id: number;
  date: string;
  power_consumption_kw: number;
  gas_consumption_nm3: number;
  power_consumed_per_kg: number;
  gas_consumed_per_kg: number;
  peak_demand_kva: number;
  furnace_kwh_per_mt: number;
  rolling_kwh_per_mt: number;
}

export interface WeighbridgeRow {
  id: number;
  ticket_no: string;
  date_time: string;
  vehicle_no: string;
  party_name: string;
  material_type: 'Raw Scrap Inward' | 'Finished Rod Outward';
  gross_weight_kg: number;
  tare_weight_kg: number;
  net_weight_kg: number;
  operator_signature: string;
}

export interface QualityRow {
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

export interface SteelInventory {
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
  date: string;
  expenses: number;
  category: string;
  voucher_no: string;
  payment_method: string;
  remarks: string;
}

export interface ShiftRow {
  id: number;
  date: string;
  shift_id: 'Shift A' | 'Shift B' | 'Shift C' | 'General';
  shift_supervisor: string;
  furnace_tapper_melters: string;
  ccm_operators: string;
  roll_turners_feeders: string;
  total_crew_strength: number;
  shift_output_mt: number;
}

// Garments Vertical Models
export interface GarmentOrder {
  id: number;
  orderNo: string;
  buyerName: string;
  styleNo: string;
  itemType: string;
  quantityPcs: number;
  unitPriceUsd: number;
  totalValueUsd: number;
  targetShipDate: string;
  status: 'Pending' | 'Cutting' | 'Sewing' | 'Finishing' | 'Shipped' | 'Cancelled';
}

export interface GarmentInventoryItem {
  id: number;
  materialCode: string;
  description: string;
  category: 'Fabric' | 'Trims' | 'Thread' | 'Accessories' | 'Chemicals';
  stockQty: number;
  unit: string;
  reorderLevel: number;
}

// Local Retail Vertical Models
export interface LocalOrderItem {
  itemId: number;
  itemName: string;
  qty: number;
  unitPrice: number;
  subtotal: number;
}

export interface LocalOrder {
  id: number;
  invoiceNo: string;
  customerName: string;
  customerPhone: string;
  date: string;
  items: LocalOrderItem[];
  totalAmount: number;
  paymentMode: 'Cash' | 'Card' | 'Mobile Banking';
  status: 'Paid' | 'Pending' | 'Refunded';
}

export interface LocalInventoryItem {
  id: number;
  sku: string;
  name: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  stockQty: number;
}

// Full Database Schema
export interface DatabaseSchema {
  users: User[];
  tenants: Tenant[];
  steel: {
    scrap: ScrapRow[];
    furnace: FurnaceRow[];
    billet: BilletRow[];
    rolling: RollingRow[];
    dispatch: DispatchRow[];
    downtime: DowntimeRow[];
    energy: EnergyRow[];
    weighbridge: WeighbridgeRow[];
    quality: QualityRow[];
    inventory: SteelInventory;
    expenses: ExpenseRow[];
    shifts: ShiftRow[];
  };
  garments: {
    orders: GarmentOrder[];
    inventory: GarmentInventoryItem[];
  };
  local: {
    orders: LocalOrder[];
    inventory: LocalInventoryItem[];
  };
}
