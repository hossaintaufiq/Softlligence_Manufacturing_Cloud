import { apiBase, parseJson } from './client';

export type BomLineItem = {
  id: string;
  componentItemId: string;
  componentItemCode: string;
  componentItemName: string;
  qty: number;
  uomId: string;
  uomSymbol: string;
  scrapPercent: number;
  sequence?: number;
};

export type BomItem = {
  id: string;
  tenantId: string;
  parentItemId: string;
  parentItemCode: string;
  parentItemName: string;
  version: string;
  isActive: boolean;
  lines: BomLineItem[];
  createdAt: string;
};

export type WorkOrderItem = {
  id: string;
  tenantId: string;
  companyId: string;
  factoryId: string;
  docNo: string;
  docDate: string;
  woType: string;
  status: 'draft' | 'released' | 'in_progress' | 'completed' | 'cancelled';
  itemId: string;
  itemCode: string;
  itemName: string;
  itemUom: string;
  qtyPlanned: number;
  qtyCompleted: number;
  bomHeaderId: string | null;
  bomVersion: string | null;
  bomLines: Array<{
    componentItemId: string;
    componentItemCode: string;
    componentItemName: string;
    qtyPerUnit: number;
    uomSymbol: string;
  }>;
  priority: number;
  plannedStart: string | null;
  plannedEnd: string | null;
  attrsJson: unknown;
  createdAt: string;
};

export type ManufacturingKpis = {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  totalPlanned: number;
  totalProduced: number;
  totalScrap: number;
  overallYield: number;
  totalEnergyKwh: number;
};

export async function fetchBoms(parentItemId?: string): Promise<BomItem[]> {
  const q = parentItemId ? `?parentItemId=${encodeURIComponent(parentItemId)}` : '';
  const res = await fetch(`${apiBase()}/api/v1/manufacturing/boms${q}`, {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });
  const data = await parseJson<{ data: BomItem[] }>(res);
  return data.data;
}

export async function createBomApi(input: {
  parentItemId: string;
  version?: string;
  lines: Array<{ componentItemId: string; qty: number; uomId: string; scrapPercent?: number }>;
}): Promise<BomItem> {
  const res = await fetch(`${apiBase()}/api/v1/manufacturing/boms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });
  const data = await parseJson<{ data: BomItem }>(res);
  return data.data;
}

export async function fetchWorkOrders(status?: string, factoryId?: string): Promise<WorkOrderItem[]> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (factoryId) params.append('factoryId', factoryId);
  const q = params.toString() ? `?${params.toString()}` : '';

  const res = await fetch(`${apiBase()}/api/v1/manufacturing/work-orders${q}`, {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });
  const data = await parseJson<{ data: WorkOrderItem[] }>(res);
  return data.data;
}

export async function createWorkOrderApi(input: {
  companyId: string;
  factoryId: string;
  docNo?: string;
  woType?: string;
  itemId: string;
  qtyPlanned: number;
  bomHeaderId?: string;
  priority?: number;
  plannedStart?: string;
  plannedEnd?: string;
}): Promise<{ id: string; docNo: string; status: string }> {
  const res = await fetch(`${apiBase()}/api/v1/manufacturing/work-orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });
  const data = await parseJson<{ data: { id: string; docNo: string; status: string } }>(res);
  return data.data;
}

export async function updateWorkOrderStatusApi(
  id: string,
  status: string,
): Promise<{ id: string; docNo: string; status: string }> {
  const res = await fetch(`${apiBase()}/api/v1/manufacturing/work-orders/${encodeURIComponent(id)}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ status }),
  });
  const data = await parseJson<{ data: { id: string; docNo: string; status: string } }>(res);
  return data.data;
}

export async function postMaterialIssueApi(input: {
  workOrderId: string;
  warehouseId: string;
  lines: Array<{ itemId: string; uomId: string; qtyIssued: number }>;
  notes?: string;
}): Promise<{ id: string; workOrderId: string }> {
  const res = await fetch(`${apiBase()}/api/v1/manufacturing/material-issues`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });
  const data = await parseJson<{ data: { id: string; workOrderId: string } }>(res);
  return data.data;
}

export async function postProductionOutputApi(input: {
  workOrderId: string;
  warehouseId: string;
  qtyProduced: number;
  uomId: string;
  lotCode?: string;
}): Promise<{ id: string; workOrderId: string; qtyProduced: number; totalCompleted: number; isCompleted: boolean }> {
  const res = await fetch(`${apiBase()}/api/v1/manufacturing/production-outputs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });
  const data = await parseJson<{
    data: { id: string; workOrderId: string; qtyProduced: number; totalCompleted: number; isCompleted: boolean };
  }>(res);
  return data.data;
}

export async function postScrapLogApi(input: {
  workOrderId: string;
  qtyScrapped: number;
  uomId: string;
  reasonCode: string;
}): Promise<{ id: string; qtyScrapped: number }> {
  const res = await fetch(`${apiBase()}/api/v1/manufacturing/scraps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });
  const data = await parseJson<{ data: { id: string; qtyScrapped: number } }>(res);
  return data.data;
}

export async function postEnergyLogApi(input: {
  factoryId: string;
  workOrderId?: string;
  utilityType: string;
  quantity: number;
  uomCode?: string;
}): Promise<{ id: string; quantity: number }> {
  const res = await fetch(`${apiBase()}/api/v1/manufacturing/energy-logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });
  const data = await parseJson<{ data: { id: string; quantity: number } }>(res);
  return data.data;
}

export async function fetchManufacturingKpis(): Promise<ManufacturingKpis> {
  const res = await fetch(`${apiBase()}/api/v1/manufacturing/kpis`, {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });
  const data = await parseJson<{ data: ManufacturingKpis }>(res);
  return data.data;
}
