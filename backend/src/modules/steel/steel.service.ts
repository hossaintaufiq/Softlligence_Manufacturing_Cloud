import { prisma } from '../../config/prisma.js';
import { AppError } from '../../common/errors/AppError.js';

// —— Steel Scrap Receiving (FRM-STL-01) ——

export async function listScrapReceipts(tenantId: string) {
  const rows = await prisma.steelScrapReceipt.findMany({
    where: { tenantId },
    include: {
      party: { select: { code: true, name: true } },
      warehouse: { select: { code: true, name: true } },
    },
    orderBy: { receivedAt: 'desc' },
  });

  return rows.map((r) => ({
    id: r.id,
    supplierName: r.party.name,
    supplierCode: r.party.code,
    warehouseName: r.warehouse.name,
    gradeCategory: r.gradeCategory,
    vehicleNo: r.vehicleNo,
    receivedKg: r.receivedKg,
    expenses: r.expenses,
    remarks: r.remarks,
    receivedAt: r.receivedAt.toISOString(),
  }));
}

export async function createScrapReceipt(
  tenantId: string,
  input: {
    companyId: string;
    warehouseId: string;
    partyId: string;
    gradeCategory: string;
    vehicleNo?: string;
    receivedKg: number;
    expenses?: number;
    remarks?: string;
  },
) {
  if (!input.partyId || !input.warehouseId || !input.receivedKg || input.receivedKg <= 0) {
    throw new AppError(400, 'Supplier partyId, warehouseId, and positive receivedKg are required', 'VALIDATION_ERROR');
  }

  const receipt = await prisma.steelScrapReceipt.create({
    data: {
      tenantId,
      companyId: input.companyId,
      warehouseId: input.warehouseId,
      partyId: input.partyId,
      gradeCategory: input.gradeCategory || 'Heavy Melting Scrap',
      vehicleNo: input.vehicleNo || null,
      receivedKg: Number(input.receivedKg),
      expenses: Number(input.expenses || 0),
      remarks: input.remarks || null,
    },
  });

  return receipt;
}

// —— Steel Heat Logs (Furnace Melting - FRM-STL-02) ——

export async function listHeatLogs(tenantId: string) {
  const rows = await prisma.steelHeatLog.findMany({
    where: { tenantId },
    orderBy: { loggedAt: 'desc' },
  });

  return rows.map((h) => ({
    id: h.id,
    heatNo: h.heatNo,
    furnaceNo: h.furnaceNo,
    scrapInputKg: h.scrapInputKg,
    billetOutputKg: h.billetOutputKg,
    billetSize: h.billetSize,
    yieldPct: Number(((h.billetOutputKg / (h.scrapInputKg || 1)) * 100).toFixed(2)),
    powerKwh: h.powerKwh,
    gasNm3: h.gasNm3,
    runtimeMin: h.runtimeMin,
    downtimeMin: h.downtimeMin,
    shift: h.shift,
    remarks: h.remarks,
    loggedAt: h.loggedAt.toISOString(),
  }));
}

export async function createHeatLog(
  tenantId: string,
  input: {
    companyId: string;
    factoryId: string;
    heatNo: string;
    furnaceNo?: string;
    scrapInputKg: number;
    billetOutputKg: number;
    billetSize?: string;
    powerKwh?: number;
    gasNm3?: number;
    runtimeMin?: number;
    downtimeMin?: number;
    shift?: string;
    remarks?: string;
  },
) {
  if (!input.heatNo || !input.scrapInputKg || !input.billetOutputKg) {
    throw new AppError(400, 'heatNo, scrapInputKg, and billetOutputKg are required', 'VALIDATION_ERROR');
  }

  const existing = await prisma.steelHeatLog.findFirst({
    where: { tenantId, factoryId: input.factoryId, heatNo: input.heatNo.trim() },
  });

  if (existing) {
    throw new AppError(409, `Heat number '${input.heatNo}' already logged for this factory`, 'CONFLICT');
  }

  const log = await prisma.steelHeatLog.create({
    data: {
      tenantId,
      companyId: input.companyId,
      factoryId: input.factoryId,
      heatNo: input.heatNo.trim(),
      furnaceNo: input.furnaceNo || 'Furnace-1',
      scrapInputKg: Number(input.scrapInputKg),
      billetOutputKg: Number(input.billetOutputKg),
      billetSize: input.billetSize || '150x150',
      powerKwh: Number(input.powerKwh || 0),
      gasNm3: Number(input.gasNm3 || 0),
      runtimeMin: Number(input.runtimeMin || 0),
      downtimeMin: Number(input.downtimeMin || 0),
      shift: input.shift || 'Shift-A',
      remarks: input.remarks || null,
    },
  });

  return log;
}

// —— Steel Rolling Mill Logs (FRM-STL-04) ——

export async function listRollingLogs(tenantId: string) {
  const rows = await prisma.steelRollingLog.findMany({
    where: { tenantId },
    orderBy: { loggedAt: 'desc' },
  });

  return rows.map((r) => ({
    id: r.id,
    heatRef: r.heatRef,
    billetInputKg: r.billetInputKg,
    rodOutputKg: r.rodOutputKg,
    rodSizeSpec: r.rodSizeSpec,
    burningLossKg: r.burningLossKg,
    burningLossPct: Number(((r.burningLossKg / (r.billetInputKg || 1)) * 100).toFixed(2)),
    rollingYieldPct: Number(((r.rodOutputKg / (r.billetInputKg || 1)) * 100).toFixed(2)),
    downtimeMin: r.downtimeMin,
    shift: r.shift,
    remarks: r.remarks,
    loggedAt: r.loggedAt.toISOString(),
  }));
}

export async function createRollingLog(
  tenantId: string,
  input: {
    companyId: string;
    factoryId: string;
    heatRef?: string;
    billetInputKg: number;
    rodOutputKg: number;
    rodSizeSpec?: string;
    burningLossKg?: number;
    downtimeMin?: number;
    shift?: string;
    remarks?: string;
  },
) {
  if (!input.billetInputKg || !input.rodOutputKg) {
    throw new AppError(400, 'billetInputKg and rodOutputKg are required', 'VALIDATION_ERROR');
  }

  const log = await prisma.steelRollingLog.create({
    data: {
      tenantId,
      companyId: input.companyId,
      factoryId: input.factoryId,
      heatRef: input.heatRef?.trim() || null,
      billetInputKg: Number(input.billetInputKg),
      rodOutputKg: Number(input.rodOutputKg),
      rodSizeSpec: input.rodSizeSpec || '12mm Grade 60',
      burningLossKg: Number(input.burningLossKg || 0),
      downtimeMin: Number(input.downtimeMin || 0),
      shift: input.shift || 'Shift-A',
      remarks: input.remarks || null,
    },
  });

  return log;
}

// —— Steel Excel Import Wizard (FRM-STL-06) ——

export async function importSteelBatch(
  tenantId: string,
  input: {
    companyId: string;
    factoryId: string;
    records: Array<{
      type: 'heat' | 'rolling';
      heatNo?: string;
      scrapInputKg?: number;
      billetOutputKg?: number;
      billetInputKg?: number;
      rodOutputKg?: number;
      burningLossKg?: number;
      powerKwh?: number;
      rodSizeSpec?: string;
    }>;
  },
) {
  if (!input.records || input.records.length === 0) {
    throw new AppError(400, 'No records provided for import', 'VALIDATION_ERROR');
  }

  let importedHeats = 0;
  let importedRollings = 0;

  for (const r of input.records) {
    if (r.type === 'heat' && r.heatNo && r.scrapInputKg && r.billetOutputKg) {
      await prisma.steelHeatLog.create({
        data: {
          tenantId,
          companyId: input.companyId,
          factoryId: input.factoryId,
          heatNo: r.heatNo.trim(),
          scrapInputKg: Number(r.scrapInputKg),
          billetOutputKg: Number(r.billetOutputKg),
          powerKwh: Number(r.powerKwh || 0),
        },
      });
      importedHeats++;
    } else if (r.type === 'rolling' && r.billetInputKg && r.rodOutputKg) {
      await prisma.steelRollingLog.create({
        data: {
          tenantId,
          companyId: input.companyId,
          factoryId: input.factoryId,
          billetInputKg: Number(r.billetInputKg),
          rodOutputKg: Number(r.rodOutputKg),
          burningLossKg: Number(r.burningLossKg || 0),
          rodSizeSpec: r.rodSizeSpec || '12mm Grade 60',
        },
      });
      importedRollings++;
    }
  }

  return { importedHeats, importedRollings, total: importedHeats + importedRollings };
}

// —— Steel Yield & Efficiency Analytics ——

export async function getSteelKpis(tenantId: string) {
  const [heats, rollings, scrapReceipts] = await Promise.all([
    prisma.steelHeatLog.findMany({ where: { tenantId } }),
    prisma.steelRollingLog.findMany({ where: { tenantId } }),
    prisma.steelScrapReceipt.findMany({ where: { tenantId } }),
  ]);

  const totalScrapReceivedKg = scrapReceipts.reduce((s, r) => s + r.receivedKg, 0);
  const totalScrapMeltedKg = heats.reduce((s, h) => s + h.scrapInputKg, 0);
  const totalBilletProducedKg = heats.reduce((s, h) => s + h.billetOutputKg, 0);
  const totalPowerKwh = heats.reduce((s, h) => s + h.powerKwh, 0);

  const totalBilletRolledKg = rollings.reduce((s, r) => s + r.billetInputKg, 0);
  const totalRodProducedKg = rollings.reduce((s, r) => s + r.rodOutputKg, 0);
  const totalBurningLossKg = rollings.reduce((s, r) => s + r.burningLossKg, 0);

  const meltYieldPct = totalScrapMeltedKg > 0 ? ((totalBilletProducedKg / totalScrapMeltedKg) * 100).toFixed(2) : '0.00';
  const rollingYieldPct = totalBilletRolledKg > 0 ? ((totalRodProducedKg / totalBilletRolledKg) * 100).toFixed(2) : '0.00';
  const kwhPerBilletTon = totalBilletProducedKg > 0 ? ((totalPowerKwh / (totalBilletProducedKg / 1000))).toFixed(1) : '0';

  return {
    totalScrapReceivedKg,
    totalScrapMeltedKg,
    totalBilletProducedKg,
    meltYieldPct: Number(meltYieldPct),
    totalBilletRolledKg,
    totalRodProducedKg,
    rollingYieldPct: Number(rollingYieldPct),
    totalBurningLossKg,
    kwhPerBilletTon: Number(kwhPerBilletTon),
    totalHeatsCount: heats.length,
    totalRollingBatchesCount: rollings.length,
  };
}
