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

  if (p.includes('heat') || p.includes('yield') || p.includes('steel')) {
    answer = 'The latest Induction Furnace Heat #HEAT-2026-001 achieved 92.4% melt yield producing 42,000 kg billets with 520 kWh/MT energy efficiency.';
  } else if (p.includes('inventory') || p.includes('stock') || p.includes('scrap')) {
    answer = 'Current raw scrap stock on hand is 215,000 kg across Raw Scrap Yard #1 (RACK-A-01: 78.5% capacity). FIFO stock valuation stands at $284,500 USD.';
  } else if (p.includes('oee') || p.includes('maintenance') || p.includes('downtime')) {
    answer = 'Overall Equipment Effectiveness (OEE) is at 88.5%. Rolling Mill Stand #1 reported 45 minutes downtime due to motor thermal overload.';
  }

  return {
    query: prompt,
    response: answer,
    confidenceScore: 0.96,
    model: 'Softlligence ERP Predictive AI v1.0',
  };
}
