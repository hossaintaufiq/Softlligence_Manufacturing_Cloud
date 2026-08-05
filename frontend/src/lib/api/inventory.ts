export interface Warehouse {
  id: string;
  tenantId: string;
  companyId: string;
  factoryId?: string;
  code: string;
  name: string;
  type: string;
  status: string;
  company?: { name: string; code: string };
  factory?: { name: string; code: string };
}

export interface UnitOfMeasure {
  id: string;
  code: string;
  name: string;
  symbol?: string;
}

export interface Item {
  id: string;
  code: string;
  name: string;
  itemType: 'RM' | 'WIP' | 'FG' | 'SPARE' | 'CONSUMABLE';
  uomId: string;
  trackingType: string;
  valuationMethod: string;
  status: string;
  uom?: UnitOfMeasure;
}

export interface StockBalance {
  id: string;
  warehouseId: string;
  itemId: string;
  qtyOnHand: number;
  warehouse?: Warehouse;
  item?: Item;
}

export interface StockLedgerEntry {
  id: string;
  warehouseId: string;
  itemId: string;
  qtyIn: number;
  qtyOut: number;
  movementType: string;
  refDocType?: string;
  createdAt: string;
  warehouse?: Warehouse;
  item?: Item;
  uom?: UnitOfMeasure;
}

export async function fetchWarehouses(): Promise<Warehouse[]> {
  const res = await fetch('/api/v1/inventory/warehouses', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch warehouses');
  return res.json();
}

export async function createWarehouseApi(data: {
  companyId: string;
  factoryId?: string;
  code: string;
  name: string;
  type: string;
}): Promise<Warehouse> {
  const res = await fetch('/api/v1/inventory/warehouses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create warehouse');
  }
  return res.json();
}

export async function fetchUoms(): Promise<UnitOfMeasure[]> {
  const res = await fetch('/api/v1/inventory/uoms', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch units of measure');
  return res.json();
}

export async function createUomApi(data: { code: string; name: string; symbol?: string }): Promise<UnitOfMeasure> {
  const res = await fetch('/api/v1/inventory/uoms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create UOM');
  }
  return res.json();
}

export async function fetchItems(itemType?: string): Promise<Item[]> {
  const url = itemType ? `/api/v1/inventory/items?item_type=${encodeURIComponent(itemType)}` : '/api/v1/inventory/items';
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch items');
  return res.json();
}

export async function createItemApi(data: {
  code: string;
  name: string;
  itemType: string;
  uomId: string;
  valuationMethod?: string;
}): Promise<Item> {
  const res = await fetch('/api/v1/inventory/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create item');
  }
  return res.json();
}

export async function fetchStockBalances(warehouseId?: string): Promise<StockBalance[]> {
  const url = warehouseId
    ? `/api/v1/inventory/balances?warehouse_id=${encodeURIComponent(warehouseId)}`
    : '/api/v1/inventory/balances';
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch stock balances');
  return res.json();
}

export async function fetchStockLedger(warehouseId?: string, itemId?: string): Promise<StockLedgerEntry[]> {
  let url = '/api/v1/inventory/ledger';
  const params = new URLSearchParams();
  if (warehouseId) params.append('warehouse_id', warehouseId);
  if (itemId) params.append('item_id', itemId);
  if (params.toString()) url += `?${params.toString()}`;

  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch stock ledger');
  return res.json();
}

export async function postStockTransferApi(data: {
  fromWarehouseId: string;
  toWarehouseId: string;
  notes?: string;
  lines: { itemId: string; uomId: string; qty: number }[];
}) {
  const res = await fetch('/api/v1/inventory/transfers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to post stock transfer');
  }
  return res.json();
}

export async function postStockAdjustmentApi(data: {
  warehouseId: string;
  reasonCode: string;
  notes?: string;
  lines: { itemId: string; uomId: string; qty: number }[];
}) {
  const res = await fetch('/api/v1/inventory/adjustments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to post stock adjustment');
  }
  return res.json();
}
