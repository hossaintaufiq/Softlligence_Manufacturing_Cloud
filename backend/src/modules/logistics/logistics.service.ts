export type LandedCostAllocation = {
  purchaseOrderId: string;
  poNumber: string;
  baseMaterialCostUsd: number;
  freightCostUsd: number;
  customsDutyUsd: number;
  handlingCostUsd: number;
  totalLandedCostUsd: number;
  landedCostFactor: number;
};

export type VehicleGatePass = {
  id: string;
  gatePassNo: string;
  vehicleNo: string;
  driverName: string;
  partyName: string;
  entryType: 'INBOUND_SCRAP' | 'OUTBOUND_REBAR';
  grossWeightKg: number;
  tareWeightKg: number;
  netWeightKg: number;
  status: 'GATE_IN' | 'WEIGHED' | 'DISPATCHED';
  enteredAt: string;
};

const gatePassStore: VehicleGatePass[] = [
  { id: 'gp_1', gatePassNo: 'GATE-2026-041', vehicleNo: 'DHAKA-METRO-TA-11-2094', driverName: 'Abul Hossain', partyName: 'Apex Scrap Suppliers', entryType: 'INBOUND_SCRAP', grossWeightKg: 42500, tareWeightKg: 14200, netWeightKg: 28300, status: 'WEIGHED', enteredAt: new Date().toISOString() },
  { id: 'gp_2', gatePassNo: 'GATE-2026-042', vehicleNo: 'CHATTO-METRO-HA-88-1092', driverName: 'Kabir Ahmed', partyName: 'National Builders Project', entryType: 'OUTBOUND_REBAR', grossWeightKg: 65000, tareWeightKg: 15000, netWeightKg: 50000, status: 'DISPATCHED', enteredAt: new Date(Date.now() - 7200000).toISOString() },
];

export async function calculateLandedCost(poNumber: string, baseCost: number, freight: number, duty: number, handling: number): Promise<LandedCostAllocation> {
  const totalLanded = baseCost + freight + duty + handling;
  const factor = baseCost > 0 ? Number((totalLanded / baseCost).toFixed(4)) : 1.0;

  return {
    purchaseOrderId: `po_${poNumber}`,
    poNumber,
    baseMaterialCostUsd: baseCost,
    freightCostUsd: freight,
    customsDutyUsd: duty,
    handlingCostUsd: handling,
    totalLandedCostUsd: totalLanded,
    landedCostFactor: factor,
  };
}

export async function getVehicleGatePasses() {
  return gatePassStore;
}

export async function createVehicleGatePass(data: Omit<VehicleGatePass, 'id' | 'netWeightKg' | 'enteredAt'>) {
  const netWeightKg = Math.max(0, data.grossWeightKg - data.tareWeightKg);
  const pass: VehicleGatePass = {
    id: `gp_${Date.now()}`,
    ...data,
    netWeightKg,
    enteredAt: new Date().toISOString(),
  };

  gatePassStore.unshift(pass);
  return pass;
}
