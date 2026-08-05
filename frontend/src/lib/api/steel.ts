import { apiBase, parseJson } from './client';

export type SteelScrapReceiptItem = {
  id: string;
  supplierName: string;
  supplierCode: string;
  warehouseName: string;
  gradeCategory: string;
  vehicleNo: string | null;
  receivedKg: number;
  expenses: number;
  remarks: string | null;
  receivedAt: string;
};

export type SteelHeatLogItem = {
  id: string;
  heatNo: string;
  furnaceNo: string;
  scrapInputKg: number;
  billetOutputKg: number;
  billetSize: string;
  yieldPct: number;
  powerKwh: number;
  gasNm3: number;
  runtimeMin: number;
  downtimeMin: number;
  shift: string;
  remarks: string | null;
  loggedAt: string;
};

export type SteelRollingLogItem = {
  id: string;
  heatRef: string | null;
  billetInputKg: number;
  rodOutputKg: number;
  rodSizeSpec: string;
  burningLossKg: number;
  burningLossPct: number;
  rollingYieldPct: number;
  downtimeMin: number;
  shift: string;
  remarks: string | null;
  loggedAt: string;
};

export type SteelKpis = {
  totalScrapReceivedKg: number;
  totalScrapMeltedKg: number;
  totalBilletProducedKg: number;
  meltYieldPct: number;
  totalBilletRolledKg: number;
  totalRodProducedKg: number;
  rollingYieldPct: number;
  totalBurningLossKg: number;
  kwhPerBilletTon: number;
  totalHeatsCount: number;
  totalRollingBatchesCount: number;
};

export async function fetchScrapReceipts(): Promise<SteelScrapReceiptItem[]> {
  const res = await fetch(`${apiBase()}/api/v1/steel/scrap-receipts`, {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });
  const data = await parseJson<{ data: SteelScrapReceiptItem[] }>(res);
  return data.data;
}

export async function createScrapReceiptApi(input: {
  companyId: string;
  warehouseId: string;
  partyId: string;
  gradeCategory: string;
  vehicleNo?: string;
  receivedKg: number;
  expenses?: number;
  remarks?: string;
}): Promise<SteelScrapReceiptItem> {
  const res = await fetch(`${apiBase()}/api/v1/steel/scrap-receipts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });
  const data = await parseJson<{ data: SteelScrapReceiptItem }>(res);
  return data.data;
}

export async function fetchHeatLogs(): Promise<SteelHeatLogItem[]> {
  const res = await fetch(`${apiBase()}/api/v1/steel/heats`, {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });
  const data = await parseJson<{ data: SteelHeatLogItem[] }>(res);
  return data.data;
}

export async function createHeatLogApi(input: {
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
}): Promise<SteelHeatLogItem> {
  const res = await fetch(`${apiBase()}/api/v1/steel/heats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });
  const data = await parseJson<{ data: SteelHeatLogItem }>(res);
  return data.data;
}

export async function fetchRollingLogs(): Promise<SteelRollingLogItem[]> {
  const res = await fetch(`${apiBase()}/api/v1/steel/rolling`, {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });
  const data = await parseJson<{ data: SteelRollingLogItem[] }>(res);
  return data.data;
}

export async function createRollingLogApi(input: {
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
}): Promise<SteelRollingLogItem> {
  const res = await fetch(`${apiBase()}/api/v1/steel/rolling`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });
  const data = await parseJson<{ data: SteelRollingLogItem }>(res);
  return data.data;
}

export async function importSteelBatchApi(input: {
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
}): Promise<{ importedHeats: number; importedRollings: number; total: number }> {
  const res = await fetch(`${apiBase()}/api/v1/steel/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });
  const data = await parseJson<{ data: { importedHeats: number; importedRollings: number; total: number } }>(res);
  return data.data;
}

export async function fetchSteelKpis(): Promise<SteelKpis> {
  const res = await fetch(`${apiBase()}/api/v1/steel/kpis`, {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });
  const data = await parseJson<{ data: SteelKpis }>(res);
  return data.data;
}
