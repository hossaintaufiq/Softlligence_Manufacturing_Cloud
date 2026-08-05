import type { Request, Response, NextFunction } from 'express';
import { calculateLandedCost, getVehicleGatePasses, createVehicleGatePass } from './logistics.service.js';

export async function handleCalculateLandedCost(req: Request, res: Response, next: NextFunction) {
  try {
    const { poNumber, baseCost, freight, duty, handling } = req.body ?? {};
    const result = await calculateLandedCost(
      String(poNumber || 'PO-2026-001'),
      Number(baseCost || 10000),
      Number(freight || 500),
      Number(duty || 800),
      Number(handling || 200)
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function handleGetGatePasses(_req: Request, res: Response, next: NextFunction) {
  try {
    const passes = await getVehicleGatePasses();
    res.json({ passes });
  } catch (err) {
    next(err);
  }
}

export async function handleCreateGatePass(req: Request, res: Response, next: NextFunction) {
  try {
    const { gatePassNo, vehicleNo, driverName, partyName, entryType, grossWeightKg, tareWeightKg, status } = req.body ?? {};
    const pass = await createVehicleGatePass({
      gatePassNo: String(gatePassNo || `GATE-${Date.now()}`),
      vehicleNo: String(vehicleNo || 'N/A'),
      driverName: String(driverName || 'Driver'),
      partyName: String(partyName || 'Party'),
      entryType: entryType || 'INBOUND_SCRAP',
      grossWeightKg: Number(grossWeightKg || 0),
      tareWeightKg: Number(tareWeightKg || 0),
      status: status || 'GATE_IN',
    });
    res.json({ ok: true, pass });
  } catch (err) {
    next(err);
  }
}
