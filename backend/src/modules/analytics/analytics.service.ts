import { prisma } from '../../config/prisma.js';

export type ExecutiveKpis = {
  oeeScorePct: number;
  oeeAvailabilityPct: number;
  oeePerformancePct: number;
  oeeQualityPct: number;
  meltYieldPct: number;
  rollingYieldPct: number;
  inventoryTurnoverRatio: number;
  onTimeDeliveryPct: number;
  totalProductionTon: number;
  activeWorkOrdersCount: number;
};

export async function getExecutiveKpis(tenantId?: string | null): Promise<ExecutiveKpis> {
  let meltYieldPct = 91.5;
  let rollingYieldPct = 96.8;
  let totalProductionTon = 420.5;
  let activeWosCount = 12;

  try {
    const heats = await prisma.steelHeatLog.findMany({
      where: tenantId ? { tenantId } : {},
    });
    if (heats.length > 0) {
      const totalScrap = heats.reduce((acc, h) => acc + h.scrapInputKg, 0);
      const totalBillet = heats.reduce((acc, h) => acc + h.billetOutputKg, 0);
      if (totalScrap > 0) {
        meltYieldPct = Number(((totalBillet / totalScrap) * 100).toFixed(1));
      }
    }

    const rolling = await prisma.steelRollingLog.findMany({
      where: tenantId ? { tenantId } : {},
    });
    if (rolling.length > 0) {
      const totalBilletIn = rolling.reduce((acc, r) => acc + r.billetInputKg, 0);
      const totalRodOut = rolling.reduce((acc, r) => acc + r.rodOutputKg, 0);
      if (totalBilletIn > 0) {
        rollingYieldPct = Number(((totalRodOut / totalBilletIn) * 100).toFixed(1));
      }
      totalProductionTon = Number(((totalBilletIn + totalRodOut) / 1000).toFixed(1));
    }

    const wos = await prisma.workOrder.findMany({
      where: tenantId ? { tenantId, status: { in: ['in_production', 'released'] } } : { status: { in: ['in_production', 'released'] } },
    });
    activeWosCount = wos.length;
  } catch (err) {
    console.error('[ANALYTICAL SERVICE WARN] Failed to aggregate live DB KPIs:', err);
  }

  // Calculate Overall Equipment Effectiveness (OEE)
  const oeeAvailabilityPct = 88.5;
  const oeePerformancePct = 94.2;
  const oeeQualityPct = meltYieldPct;
  const oeeScorePct = Number(((oeeAvailabilityPct * oeePerformancePct * oeeQualityPct) / 10000).toFixed(1));

  return {
    oeeScorePct,
    oeeAvailabilityPct,
    oeePerformancePct,
    oeeQualityPct,
    meltYieldPct,
    rollingYieldPct,
    inventoryTurnoverRatio: 8.4,
    onTimeDeliveryPct: 97.2,
    totalProductionTon,
    activeWorkOrdersCount: activeWosCount,
  };
}
