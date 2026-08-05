export type WarehouseBin = {
  id: string;
  binCode: string;
  warehouseName: string;
  zone: string;
  capacityKg: number;
  currentKg: number;
  utilizationPct: number;
  allowedGradeCategory?: string;
};

export type LotGenealogyNode = {
  lotNo: string;
  itemCode: string;
  itemName: string;
  qty: number;
  uom: string;
  supplierName?: string;
  heatNoRef?: string;
  producedAt: string;
  children?: LotGenealogyNode[];
};

const binStore: WarehouseBin[] = [
  { id: 'bin_1', binCode: 'RACK-A-01', warehouseName: 'Raw Scrap Yard #1', zone: 'Zone A', capacityKg: 100000, currentKg: 78500, utilizationPct: 78.5, allowedGradeCategory: 'Heavy Melting Scrap' },
  { id: 'bin_2', binCode: 'RACK-A-02', warehouseName: 'Raw Scrap Yard #1', zone: 'Zone A', capacityKg: 100000, currentKg: 42000, utilizationPct: 42.0, allowedGradeCategory: 'Shredded Scrap' },
  { id: 'bin_3', binCode: 'BIN-B-01', warehouseName: 'Finished Rod Store', zone: 'Zone B', capacityKg: 50000, currentKg: 38200, utilizationPct: 76.4, allowedGradeCategory: '12mm Grade 60 Rebar' },
  { id: 'bin_4', binCode: 'BIN-B-02', warehouseName: 'Finished Rod Store', zone: 'Zone B', capacityKg: 50000, currentKg: 12500, utilizationPct: 25.0, allowedGradeCategory: '16mm Grade 60 Rebar' },
];

export async function getWarehouseBins() {
  return binStore;
}

export async function getLotGenealogy(lotNo: string): Promise<LotGenealogyNode> {
  // Build a multi-tier forward/backward genealogy tree
  return {
    lotNo: lotNo || 'LOT-2026-8891',
    itemCode: 'ROD-12MM-G60',
    itemName: '12mm Grade 60 Rebar Rod Bundle',
    qty: 5000,
    uom: 'KG',
    producedAt: new Date().toISOString(),
    heatNoRef: 'HEAT-2026-001',
    children: [
      {
        lotNo: 'BILLET-HEAT-001-A',
        itemCode: 'BILLET-100MM',
        itemName: '100x100mm Mild Steel Billet',
        qty: 5250,
        uom: 'KG',
        producedAt: new Date(Date.now() - 86400000).toISOString(),
        heatNoRef: 'HEAT-2026-001',
        children: [
          {
            lotNo: 'SCRAP-SUPP-771',
            itemCode: 'SCRAP-HMS1',
            itemName: 'Heavy Melting Scrap Grade 1',
            qty: 5600,
            uom: 'KG',
            supplierName: 'Apex Metals Supplier Ltd',
            producedAt: new Date(Date.now() - 172800000).toISOString(),
          },
        ],
      },
    ],
  };
}

export async function getFifoInventoryValuation() {
  return {
    valuationMethod: 'FIFO',
    totalInventoryValueUsd: 284500.0,
    totalWeightKg: 425000,
    averageCostPerKg: 0.67,
    warehouseBreakdown: [
      { warehouseName: 'Raw Scrap Yard #1', totalKg: 215000, valuatedAmountUsd: 129000.0 },
      { warehouseName: 'Finished Rod Store', totalKg: 210000, valuatedAmountUsd: 155500.0 },
    ],
  };
}
