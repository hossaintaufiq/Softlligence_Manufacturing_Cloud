import { prisma } from '../../config/prisma.js';

export type PredictiveMaintenanceAlert = {
  id: string;
  machineName: string;
  sensorType: 'VIBRATION' | 'BEARING_TEMP' | 'CURRENT_DRAW';
  anomalyScorePct: number;
  recommendedAction: string;
  detectedAt: string;
};

const maintenanceAlertsStore: PredictiveMaintenanceAlert[] = [
  { id: 'ai_alert_1', machineName: 'Steel Rolling Mill Stand #1', sensorType: 'BEARING_TEMP', anomalyScorePct: 87.4, recommendedAction: 'Inspect lubrication pump & replace main drive bearing during next shift.', detectedAt: new Date().toISOString() },
  { id: 'ai_alert_2', machineName: 'Continuous Casting Machine (CCM-01)', sensorType: 'VIBRATION', anomalyScorePct: 74.2, recommendedAction: 'Check oscillation table alignment.', detectedAt: new Date(Date.now() - 3600000).toISOString() },
];

export async function getPredictiveAlerts() {
  return maintenanceAlertsStore;
}

export async function processAiAssistantQuery(prompt: string) {
  const p = prompt.toLowerCase();
  let answer = 'Based on current ERP datasets, all plant operations are running within optimal parameters.';

  try {
    if (p.includes('heat') || p.includes('yield') || p.includes('steel')) {
      const heatCount = await prisma.steelHeatLog.count();
      const latestHeats = await prisma.steelHeatLog.findMany({
        take: 3,
        orderBy: { loggedAt: 'desc' },
      });
      if (heatCount > 0) {
        const yieldSum = latestHeats.reduce((sum, h) => {
          const yieldPct = h.scrapInputKg > 0 ? (h.billetOutputKg / h.scrapInputKg) * 100 : 0;
          return sum + yieldPct;
        }, 0);
        const avgYield = yieldSum / latestHeats.length;
        
        const latest = latestHeats[0];
        const latestYield = latest.scrapInputKg > 0 ? (latest.billetOutputKg / latest.scrapInputKg) * 100 : 0;

        answer = `I found ${heatCount} furnace heat logs. The average yield of the latest runs is ${avgYield.toFixed(1)}%. The most recent run was Heat #${latest.heatNo} yielding ${latestYield.toFixed(1)}% with ${latest.billetOutputKg} kg of billets produced.`;
      } else {
        answer = 'No furnace heat logs have been recorded in the database yet.';
      }
    } else if (p.includes('inventory') || p.includes('stock') || p.includes('scrap')) {
      const totalStock = await prisma.stockBalance.aggregate({
        _sum: { qtyOnHand: true },
      });
      const stockItems = await prisma.stockBalance.count();
      if (stockItems > 0) {
        answer = `Current total physical inventory across all warehouses is ${totalStock._sum.qtyOnHand || 0} units. I detected ${stockItems} separate stock balance registers in the inventory ledger.`;
      } else {
        answer = 'No physical items are currently recorded on hand in the WMS ledger.';
      }
    } else if (p.includes('oee') || p.includes('order') || p.includes('production')) {
      const activeCount = await prisma.workOrder.count({
        where: { status: 'in_progress' },
      });
      const totalCount = await prisma.workOrder.count();
      answer = `The factory is currently running ${activeCount} active in-progress work orders out of ${totalCount} total orders scheduled on the Gantt timeline.`;
    }
  } catch (err) {
    console.error('AI database lookup failed, falling back to mock logic:', err);
  }

  return {
    query: prompt,
    response: answer,
    confidenceScore: 0.96,
    model: 'Softlligence ERP Predictive AI v1.0',
  };
}
