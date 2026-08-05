export interface CreateWarehouseDto {
  companyId: string;
  factoryId?: string;
  code: string;
  name: string;
  type?: 'RM' | 'WIP' | 'FG' | 'SPARE' | 'SCRAP';
}

export interface CreateUomDto {
  code: string;
  name: string;
  symbol?: string;
}

export interface CreateItemDto {
  companyId?: string;
  code: string;
  name: string;
  itemType?: 'RM' | 'WIP' | 'FG' | 'SPARE' | 'CONSUMABLE';
  uomId: string;
  trackingType?: 'none' | 'lot' | 'serial';
  valuationMethod?: 'standard' | 'average' | 'fifo';
  attrsJson?: Record<string, unknown>;
}

export interface StockTransferDto {
  fromWarehouseId: string;
  toWarehouseId: string;
  notes?: string;
  lines: {
    itemId: string;
    uomId: string;
    qty: number;
  }[];
}

export interface StockAdjustmentDto {
  warehouseId: string;
  reasonCode: string;
  notes?: string;
  lines: {
    itemId: string;
    uomId: string;
    qty: number; // positive to add stock, negative to remove
  }[];
}
