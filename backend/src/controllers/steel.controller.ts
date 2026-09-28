import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { dbManager } from '../db/db';

export const getOverviewSummary = (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.read();
  const steel = db.steel;

  const totalScrapRcvKg = steel.scrap.reduce((sum, r) => sum + r.scrap_rcv_kg, 0);
  const totalBilletProdKg = steel.billet.reduce((sum, r) => sum + r.billet_output_kg, 0);
  const totalRodProdKg = steel.rolling.reduce((sum, r) => sum + r.rod_production_kg, 0);
  const totalDispatchKg = steel.dispatch.reduce((sum, r) => sum + r.dispatch_qty_kg, 0);
  const totalRevenue = steel.dispatch.reduce((sum, r) => sum + r.total_selling_price, 0);
  const totalExpenses = steel.expenses.reduce((sum, r) => sum + r.expenses, 0);

  const avgFurnaceTemp = steel.furnace.length > 0
    ? Math.round(steel.furnace.reduce((sum, r) => sum + r.tapping_temp_c, 0) / steel.furnace.length)
    : 1550;

  const avgBilletYield = steel.billet.length > 0
    ? parseFloat((steel.billet.reduce((sum, r) => sum + r.billet_yield_pct, 0) / steel.billet.length).toFixed(2))
    : 87.2;

  const avgRollingYield = steel.rolling.length > 0
    ? parseFloat((steel.rolling.reduce((sum, r) => sum + r.rod_yield_pct, 0) / steel.rolling.length).toFixed(2))
    : 95.9;

  res.status(200).json({
    success: true,
    data: {
      metrics: {
        totalScrapRcvMt: parseFloat((totalScrapRcvKg / 1000).toFixed(2)),
        totalBilletProdMt: parseFloat((totalBilletProdKg / 1000).toFixed(2)),
        totalRodProdMt: parseFloat((totalRodProdKg / 1000).toFixed(2)),
        totalDispatchMt: parseFloat((totalDispatchKg / 1000).toFixed(2)),
        totalRevenueBdt: totalRevenue,
        totalExpensesBdt: totalExpenses,
        avgFurnaceTempC: avgFurnaceTemp,
        avgBilletYieldPct: avgBilletYield,
        avgRollingYieldPct: avgRollingYield,
      },
      inventory: steel.inventory,
      recentHeats: steel.furnace.slice(-5),
      recentDispatches: steel.dispatch.slice(-5),
    },
  });
};

// 1. Scrap Sourcing
export const getScrap = (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.read();
  res.status(200).json({ success: true, count: db.steel.scrap.length, data: db.steel.scrap });
};

export const createScrap = (req: AuthenticatedRequest, res: Response) => {
  const {
    date,
    supplier_name,
    scrap_category,
    scrap_rcv_kg,
    truck_no,
    gross_weight,
    value_tare,
    rate_per_kg,
    yard_location,
  } = req.body;

  if (!date || !supplier_name || !scrap_category || !truck_no || !yard_location) {
    return res.status(400).json({ success: false, error: 'Required fields missing.' });
  }

  const newRow = dbManager.addScrapRow({
    date,
    supplier_name,
    scrap_category,
    scrap_rcv_kg: parseFloat(scrap_rcv_kg),
    truck_no,
    gross_weight: parseFloat(gross_weight),
    value_tare: parseFloat(value_tare),
    rate_per_kg: parseFloat(rate_per_kg),
    yard_location,
  });

  res.status(201).json({ success: true, message: 'Scrap record logged successfully.', data: newRow });
};

// 2. Furnace Log
export const getFurnace = (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.read();
  res.status(200).json({ success: true, count: db.steel.furnace.length, data: db.steel.furnace });
};

export const createFurnace = (req: AuthenticatedRequest, res: Response) => {
  const {
    date,
    furnace_no,
    heat_no,
    scrap_input_kg,
    runtime_min,
    used_patching_powder_kg,
    used_patching_forma_kg,
    tapping_temp_c,
    liquid_steel_tapped_kg,
    power_consumed_kwh,
    shift_id,
    furnace_master,
  } = req.body;

  if (!date || !furnace_no || !heat_no || !shift_id || !furnace_master) {
    return res.status(400).json({ success: false, error: 'Required fields missing.' });
  }

  const newRow = dbManager.addFurnaceRow({
    date,
    furnace_no,
    heat_no,
    scrap_input_kg: parseFloat(scrap_input_kg),
    runtime_min: parseInt(runtime_min, 10),
    used_patching_powder_kg: parseFloat(used_patching_powder_kg || 0),
    used_patching_forma_kg: parseInt(used_patching_forma_kg || 0, 10),
    tapping_temp_c: parseInt(tapping_temp_c, 10),
    liquid_steel_tapped_kg: parseFloat(liquid_steel_tapped_kg),
    power_consumed_kwh: parseFloat(power_consumed_kwh),
    shift_id,
    furnace_master,
  });

  res.status(201).json({ success: true, message: 'Furnace melt logged successfully.', data: newRow });
};

// 3. CCM Billet Casting
export const getBillet = (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.read();
  res.status(200).json({ success: true, count: db.steel.billet.length, data: db.steel.billet });
};

export const createBillet = (req: AuthenticatedRequest, res: Response) => {
  const { date, billet_size_section, billet_output_kg, heat_no } = req.body;

  if (!date || !billet_size_section || !heat_no) {
    return res.status(400).json({ success: false, error: 'Required fields missing.' });
  }

  const newRow = dbManager.addBilletRow({
    date,
    billet_size_section,
    billet_output_kg: parseFloat(billet_output_kg),
    heat_no,
  });

  res.status(201).json({ success: true, message: 'CCM Billet casting record logged successfully.', data: newRow });
};

// 4. Re-Rolling Mill
export const getRolling = (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.read();
  res.status(200).json({ success: true, count: db.steel.rolling.length, data: db.steel.rolling });
};

export const createRolling = (req: AuthenticatedRequest, res: Response) => {
  const { date, billet_input_kg, rod_size, rod_production_kg } = req.body;

  if (!date || !rod_size) {
    return res.status(400).json({ success: false, error: 'Required fields missing.' });
  }

  const newRow = dbManager.addRollingRow({
    date,
    billet_input_kg: parseFloat(billet_input_kg),
    rod_size,
    rod_production_kg: parseFloat(rod_production_kg),
  });

  res.status(201).json({ success: true, message: 'Re-rolling production logged successfully.', data: newRow });
};

// 5. Sales & Dispatch
export const getDispatch = (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.read();
  res.status(200).json({ success: true, count: db.steel.dispatch.length, data: db.steel.dispatch });
};

export const createDispatch = (req: AuthenticatedRequest, res: Response) => {
  const {
    date,
    customer_name,
    contact_info,
    challan_no,
    rod_size,
    dispatch_qty_kg,
    rate_per_kg,
    truck_details,
    payment_terms,
    delivery_status,
  } = req.body;

  if (!date || !customer_name || !challan_no || !rod_size || !delivery_status) {
    return res.status(400).json({ success: false, error: 'Required fields missing.' });
  }

  const newRow = dbManager.addDispatchRow({
    date,
    customer_name,
    contact_info: contact_info || '',
    challan_no,
    rod_size,
    dispatch_qty_kg: parseFloat(dispatch_qty_kg),
    rate_per_kg: parseFloat(rate_per_kg),
    truck_details: truck_details || '',
    payment_terms: payment_terms || 'Cash',
    delivery_status,
  });

  res.status(201).json({ success: true, message: 'Sales dispatch recorded successfully.', data: newRow });
};

// 6. Downtime Tracker
export const getDowntime = (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.read();
  res.status(200).json({ success: true, count: db.steel.downtime.length, data: db.steel.downtime });
};

export const createDowntime = (req: AuthenticatedRequest, res: Response) => {
  const {
    date,
    billet_breakdown_min,
    rolling_breakdown_min,
    breakdown_category,
    root_cause_notes,
    shift_code,
    action_taken,
  } = req.body;

  if (!date || !breakdown_category || !shift_code) {
    return res.status(400).json({ success: false, error: 'Required fields missing.' });
  }

  const newRow = dbManager.addDowntimeRow({
    date,
    billet_breakdown_min: parseInt(billet_breakdown_min || 0, 10),
    rolling_breakdown_min: parseInt(rolling_breakdown_min || 0, 10),
    breakdown_category,
    root_cause_notes: root_cause_notes || '',
    shift_code,
    action_taken: action_taken || '',
  });

  res.status(201).json({ success: true, message: 'Downtime breakdown logged successfully.', data: newRow });
};

// 7. Power & Utilities
export const getEnergy = (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.read();
  res.status(200).json({ success: true, count: db.steel.energy.length, data: db.steel.energy });
};

export const createEnergy = (req: AuthenticatedRequest, res: Response) => {
  const { date, power_consumption_kw, gas_consumption_nm3, peak_demand_kva } = req.body;

  if (!date) {
    return res.status(400).json({ success: false, error: 'Date is required.' });
  }

  const newRow = dbManager.addEnergyRow({
    date,
    power_consumption_kw: parseFloat(power_consumption_kw),
    gas_consumption_nm3: parseFloat(gas_consumption_nm3 || 0),
    peak_demand_kva: parseFloat(peak_demand_kva || 0),
  });

  res.status(201).json({ success: true, message: 'Power utility logs saved successfully.', data: newRow });
};

// 8. Weighbridge Gate
export const getWeighbridge = (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.read();
  res.status(200).json({ success: true, count: db.steel.weighbridge.length, data: db.steel.weighbridge });
};

export const createWeighbridge = (req: AuthenticatedRequest, res: Response) => {
  const {
    ticket_no,
    date_time,
    vehicle_no,
    party_name,
    material_type,
    gross_weight_kg,
    tare_weight_kg,
    operator_signature,
  } = req.body;

  if (!ticket_no || !date_time || !vehicle_no || !party_name || !material_type) {
    return res.status(400).json({ success: false, error: 'Required fields missing.' });
  }

  const newRow = dbManager.addWeighbridgeRow({
    ticket_no,
    date_time,
    vehicle_no,
    party_name,
    material_type,
    gross_weight_kg: parseFloat(gross_weight_kg),
    tare_weight_kg: parseFloat(tare_weight_kg),
    operator_signature: operator_signature || '',
  });

  res.status(201).json({ success: true, message: 'Weighbridge ticket created successfully.', data: newRow });
};

// 9. QA Spectrometer Chemical Lab
export const getQuality = (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.read();
  res.status(200).json({ success: true, count: db.steel.quality.length, data: db.steel.quality });
};

export const createQuality = (req: AuthenticatedRequest, res: Response) => {
  const {
    heat_no,
    testing_date,
    pct_c,
    pct_mn,
    pct_si,
    pct_s,
    pct_p,
    yield_strength_n_mm2,
    tensile_strength_n_mm2,
    elongation_pct,
    bend_test_result,
    nominal_mass_g_m,
  } = req.body;

  if (!heat_no || !testing_date || !bend_test_result) {
    return res.status(400).json({ success: false, error: 'Required fields missing.' });
  }

  const newRow = dbManager.addQualityRow({
    heat_no,
    testing_date,
    pct_c: parseFloat(pct_c),
    pct_mn: parseFloat(pct_mn),
    pct_si: parseFloat(pct_si),
    pct_s: parseFloat(pct_s),
    pct_p: parseFloat(pct_p),
    yield_strength_n_mm2: parseFloat(yield_strength_n_mm2 || 500),
    tensile_strength_n_mm2: parseFloat(tensile_strength_n_mm2 || 620),
    elongation_pct: parseFloat(elongation_pct || 18),
    bend_test_result,
    nominal_mass_g_m: parseFloat(nominal_mass_g_m || 1.0),
  });

  res.status(201).json({ success: true, message: 'Quality spectrometer test saved.', data: newRow });
};

// 10. Yard Inventory
export const getInventory = (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.read();
  res.status(200).json({ success: true, data: db.steel.inventory });
};

export const updateInventory = (req: AuthenticatedRequest, res: Response) => {
  const updated = dbManager.updateSteelInventory(req.body);
  res.status(200).json({ success: true, message: 'Inventory balances updated successfully.', data: updated });
};

// 11. Expenses Ledger
export const getExpenses = (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.read();
  res.status(200).json({ success: true, count: db.steel.expenses.length, data: db.steel.expenses });
};

export const createExpense = (req: AuthenticatedRequest, res: Response) => {
  const { date, expenses, category, voucher_no, payment_method, remarks } = req.body;

  if (!date || !category || !voucher_no) {
    return res.status(400).json({ success: false, error: 'Required fields missing.' });
  }

  const newRow = dbManager.addExpenseRow({
    date,
    expenses: parseFloat(expenses),
    category,
    voucher_no,
    payment_method: payment_method || 'Cash',
    remarks: remarks || '',
  });

  res.status(201).json({ success: true, message: 'Expense entry recorded.', data: newRow });
};

// 12. HRMS Shifts
export const getShifts = (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.read();
  res.status(200).json({ success: true, count: db.steel.shifts.length, data: db.steel.shifts });
};

export const createShift = (req: AuthenticatedRequest, res: Response) => {
  const {
    date,
    shift_id,
    shift_supervisor,
    furnace_tapper_melters,
    ccm_operators,
    roll_turners_feeders,
    total_crew_strength,
    shift_output_mt,
  } = req.body;

  if (!date || !shift_id || !shift_supervisor) {
    return res.status(400).json({ success: false, error: 'Required fields missing.' });
  }

  const newRow = dbManager.addShiftRow({
    date,
    shift_id,
    shift_supervisor,
    furnace_tapper_melters: furnace_tapper_melters || '',
    ccm_operators: ccm_operators || '',
    roll_turners_feeders: roll_turners_feeders || '',
    total_crew_strength: parseInt(total_crew_strength || 20, 10),
    shift_output_mt: parseFloat(shift_output_mt || 0),
  });

  res.status(201).json({ success: true, message: 'Shift roster logged.', data: newRow });
};
