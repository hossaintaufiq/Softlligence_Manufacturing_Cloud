import { apiBase, parseJson } from './client';

export type PartyItem = {
  id: string;
  tenantId: string;
  companyId: string | null;
  code: string;
  name: string;
  isCustomer: boolean;
  isSupplier: boolean;
  creditLimit: number | null;
  paymentTerms: string | null;
  status: string;
  createdAt: string;
};

export type PurchaseOrderItem = {
  id: string;
  tenantId: string;
  companyId: string;
  partyId: string;
  supplierCode: string;
  supplierName: string;
  docNo: string;
  docDate: string;
  status: string;
  currency: string;
  totalAmount: number;
  lines: Array<{
    id: string;
    itemId: string;
    itemCode: string;
    itemName: string;
    qty: number;
    unitPrice: number;
    amount: number;
    uomSymbol: string;
  }>;
  createdAt: string;
};

export type GrnItem = {
  id: string;
  docNo: string;
  docDate: string;
  status: string;
  supplierName: string;
  warehouseName: string;
  vehicleNo: string | null;
  lines: Array<{
    itemCode: string;
    itemName: string;
    qtyReceived: number;
    unitCost: number;
    uomSymbol: string;
  }>;
};

export type SalesOrderItem = {
  id: string;
  tenantId: string;
  companyId: string;
  partyId: string;
  customerCode: string;
  customerName: string;
  docNo: string;
  docDate: string;
  status: string;
  currency: string;
  totalAmount: number;
  lines: Array<{
    id: string;
    itemId: string;
    itemCode: string;
    itemName: string;
    qty: number;
    unitPrice: number;
    amount: number;
    uomSymbol: string;
  }>;
  createdAt: string;
};

export type DispatchItem = {
  id: string;
  docNo: string;
  docDate: string;
  status: string;
  customerName: string;
  warehouseName: string;
  vehicleNo: string | null;
  freightAmount: number;
  lines: Array<{
    itemCode: string;
    itemName: string;
    qty: number;
    unitPrice: number;
    amount: number;
    uomSymbol: string;
  }>;
};

export type CommercialKpis = {
  customerCount: number;
  supplierCount: number;
  totalPos: number;
  openPos: number;
  totalProcurementVal: number;
  totalSos: number;
  openSos: number;
  totalSalesVal: number;
  grnCount: number;
  dispatchCount: number;
};

export async function fetchParties(type?: 'customer' | 'supplier'): Promise<PartyItem[]> {
  const q = type ? `?type=${type}` : '';
  const res = await fetch(`${apiBase()}/api/v1/commercial/parties${q}`, {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });
  const data = await parseJson<{ data: PartyItem[] }>(res);
  return data.data;
}

export async function createPartyApi(input: {
  code: string;
  name: string;
  isCustomer?: boolean;
  isSupplier?: boolean;
  creditLimit?: number;
  paymentTerms?: string;
}): Promise<PartyItem> {
  const res = await fetch(`${apiBase()}/api/v1/commercial/parties`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });
  const data = await parseJson<{ data: PartyItem }>(res);
  return data.data;
}

export async function fetchPurchaseOrders(status?: string): Promise<PurchaseOrderItem[]> {
  const q = status ? `?status=${encodeURIComponent(status)}` : '';
  const res = await fetch(`${apiBase()}/api/v1/commercial/purchase-orders${q}`, {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });
  const data = await parseJson<{ data: PurchaseOrderItem[] }>(res);
  return data.data;
}

export async function createPurchaseOrderApi(input: {
  companyId: string;
  partyId: string;
  docNo?: string;
  lines: Array<{ itemId: string; uomId: string; qty: number; unitPrice: number }>;
}): Promise<{ id: string; docNo: string; status: string; totalAmount: number }> {
  const res = await fetch(`${apiBase()}/api/v1/commercial/purchase-orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });
  const data = await parseJson<{ data: { id: string; docNo: string; status: string; totalAmount: number } }>(res);
  return data.data;
}

export async function fetchGrns(): Promise<GrnItem[]> {
  const res = await fetch(`${apiBase()}/api/v1/commercial/grns`, {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });
  const data = await parseJson<{ data: GrnItem[] }>(res);
  return data.data;
}

export async function postGrnApi(input: {
  companyId: string;
  warehouseId: string;
  partyId: string;
  purchaseOrderId?: string;
  docNo?: string;
  vehicleNo?: string;
  lines: Array<{ itemId: string; uomId: string; qtyReceived: number; unitCost?: number }>;
}): Promise<{ id: string; docNo: string; status: string }> {
  const res = await fetch(`${apiBase()}/api/v1/commercial/grns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });
  const data = await parseJson<{ data: { id: string; docNo: string; status: string } }>(res);
  return data.data;
}

export async function fetchSalesOrders(status?: string): Promise<SalesOrderItem[]> {
  const q = status ? `?status=${encodeURIComponent(status)}` : '';
  const res = await fetch(`${apiBase()}/api/v1/commercial/sales-orders${q}`, {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });
  const data = await parseJson<{ data: SalesOrderItem[] }>(res);
  return data.data;
}

export async function createSalesOrderApi(input: {
  companyId: string;
  partyId: string;
  docNo?: string;
  lines: Array<{ itemId: string; uomId: string; qty: number; unitPrice: number }>;
}): Promise<{ id: string; docNo: string; status: string; totalAmount: number }> {
  const res = await fetch(`${apiBase()}/api/v1/commercial/sales-orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });
  const data = await parseJson<{ data: { id: string; docNo: string; status: string; totalAmount: number } }>(res);
  return data.data;
}

export async function fetchDispatches(): Promise<DispatchItem[]> {
  const res = await fetch(`${apiBase()}/api/v1/commercial/dispatches`, {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });
  const data = await parseJson<{ data: DispatchItem[] }>(res);
  return data.data;
}

export async function postDispatchApi(input: {
  companyId: string;
  warehouseId: string;
  partyId: string;
  salesOrderId?: string;
  docNo?: string;
  vehicleNo?: string;
  freightAmount?: number;
  lines: Array<{ itemId: string; uomId: string; qty: number; unitPrice?: number }>;
}): Promise<{ id: string; docNo: string; status: string }> {
  const res = await fetch(`${apiBase()}/api/v1/commercial/dispatches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });
  const data = await parseJson<{ data: { id: string; docNo: string; status: string } }>(res);
  return data.data;
}

export async function fetchCommercialKpis(): Promise<CommercialKpis> {
  const res = await fetch(`${apiBase()}/api/v1/commercial/kpis`, {
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });
  const data = await parseJson<{ data: CommercialKpis }>(res);
  return data.data;
}
