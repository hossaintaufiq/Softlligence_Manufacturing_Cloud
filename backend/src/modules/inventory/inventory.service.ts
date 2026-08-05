import { prisma } from '../../config/prisma.js';
import { AppError } from '../../common/errors/AppError.js';
import type {
  CreateItemDto,
  CreateUomDto,
  CreateWarehouseDto,
  StockAdjustmentDto,
  StockTransferDto,
} from './inventory.types.js';

// --- Warehouse Service ---
export async function listWarehouses(tenantId: string) {
  return prisma.warehouse.findMany({
    where: { tenantId, deletedAt: null },
    include: { company: true, factory: true },
    orderBy: { code: 'asc' },
  });
}

export async function createWarehouse(tenantId: string, dto: CreateWarehouseDto) {
  const company = await prisma.company.findFirst({
    where: { id: dto.companyId, tenantId, deletedAt: null },
  });
  if (!company) {
    throw new AppError(404, 'Company not found', 'COMPANY_NOT_FOUND');
  }

  if (dto.factoryId) {
    const factory = await prisma.factory.findFirst({
      where: { id: dto.factoryId, tenantId, companyId: dto.companyId, deletedAt: null },
    });
    if (!factory) {
      throw new AppError(404, 'Factory not found', 'FACTORY_NOT_FOUND');
    }
  }

  const existing = await prisma.warehouse.findFirst({
    where: { tenantId, companyId: dto.companyId, code: dto.code },
  });
  if (existing) {
    throw new AppError(409, `Warehouse with code '${dto.code}' already exists for this company`, 'WAREHOUSE_EXISTS');
  }

  return prisma.warehouse.create({
    data: {
      tenantId,
      companyId: dto.companyId,
      factoryId: dto.factoryId || null,
      code: dto.code.trim().toUpperCase(),
      name: dto.name.trim(),
      type: dto.type || 'RM',
    },
    include: { company: true, factory: true },
  });
}

// --- UOM Service ---
export async function listUoms(tenantId: string) {
  return prisma.unitOfMeasure.findMany({
    where: { tenantId, deletedAt: null },
    orderBy: { code: 'asc' },
  });
}

export async function createUom(tenantId: string, dto: CreateUomDto) {
  const code = dto.code.trim().toUpperCase();
  const existing = await prisma.unitOfMeasure.findFirst({
    where: { tenantId, code },
  });
  if (existing) {
    throw new AppError(409, `UOM with code '${code}' already exists`, 'UOM_EXISTS');
  }

  return prisma.unitOfMeasure.create({
    data: {
      tenantId,
      code,
      name: dto.name.trim(),
      symbol: dto.symbol?.trim() || null,
    },
  });
}

// --- Item Catalog Service ---
export async function listItems(tenantId: string, itemType?: string) {
  return prisma.item.findMany({
    where: {
      tenantId,
      deletedAt: null,
      ...(itemType ? { itemType } : {}),
    },
    include: { uom: true, company: true },
    orderBy: { code: 'asc' },
  });
}

export async function createItem(tenantId: string, dto: CreateItemDto) {
  const uom = await prisma.unitOfMeasure.findFirst({
    where: { id: dto.uomId, tenantId, deletedAt: null },
  });
  if (!uom) {
    throw new AppError(404, 'Unit of measure not found', 'UOM_NOT_FOUND');
  }

  const code = dto.code.trim().toUpperCase();
  const existing = await prisma.item.findFirst({
    where: { tenantId, code },
  });
  if (existing) {
    throw new AppError(409, `Item with code '${code}' already exists`, 'ITEM_EXISTS');
  }

  return prisma.item.create({
    data: {
      tenantId,
      companyId: dto.companyId || null,
      code,
      name: dto.name.trim(),
      itemType: dto.itemType || 'RM',
      uomId: dto.uomId,
      trackingType: dto.trackingType || 'none',
      valuationMethod: dto.valuationMethod || 'average',
      attrsJson: (dto.attrsJson as object) || null,
    },
    include: { uom: true, company: true },
  });
}

export async function getItemById(tenantId: string, itemId: string) {
  const item = await prisma.item.findFirst({
    where: { id: itemId, tenantId, deletedAt: null },
    include: { uom: true, company: true, stockBalances: { include: { warehouse: true } } },
  });
  if (!item) {
    throw new AppError(404, 'Item not found', 'ITEM_NOT_FOUND');
  }
  return item;
}

// --- Stock Balances & Ledger ---
export async function getStockBalances(tenantId: string, warehouseId?: string) {
  return prisma.stockBalance.findMany({
    where: {
      tenantId,
      ...(warehouseId ? { warehouseId } : {}),
    },
    include: {
      warehouse: true,
      item: { include: { uom: true } },
      lot: true,
    },
    orderBy: [{ warehouseId: 'asc' }, { itemId: 'asc' }],
  });
}

export async function getStockLedger(tenantId: string, warehouseId?: string, itemId?: string) {
  return prisma.stockLedgerEntry.findMany({
    where: {
      tenantId,
      ...(warehouseId ? { warehouseId } : {}),
      ...(itemId ? { itemId } : {}),
    },
    include: {
      warehouse: true,
      item: true,
      uom: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
}

// --- Stock Transfers ---
export async function executeStockTransfer(tenantId: string, userId: string, dto: StockTransferDto) {
  if (dto.fromWarehouseId === dto.toWarehouseId) {
    throw new AppError(400, 'Source and destination warehouses cannot be the same', 'INVALID_TRANSFER');
  }

  const fromWh = await prisma.warehouse.findFirst({
    where: { id: dto.fromWarehouseId, tenantId, deletedAt: null },
  });
  const toWh = await prisma.warehouse.findFirst({
    where: { id: dto.toWarehouseId, tenantId, deletedAt: null },
  });

  if (!fromWh || !toWh) {
    throw new AppError(404, 'One or both warehouses not found', 'WAREHOUSE_NOT_FOUND');
  }

  if (!dto.lines || dto.lines.length === 0) {
    throw new AppError(400, 'Transfer must contain at least one line item', 'NO_LINES');
  }

  const transferNumber = `TRF-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

  return prisma.$transaction(async (tx) => {
    // 1. Create StockTransfer Header & Lines
    const transfer = await tx.stockTransfer.create({
      data: {
        tenantId,
        transferNumber,
        fromWarehouseId: dto.fromWarehouseId,
        toWarehouseId: dto.toWarehouseId,
        status: 'posted',
        notes: dto.notes || null,
        postedAt: new Date(),
        lines: {
          create: dto.lines.map((l) => ({
            itemId: l.itemId,
            uomId: l.uomId,
            qty: l.qty,
          })),
        },
      },
      include: { lines: true, fromWarehouse: true, toWarehouse: true },
    });

    // 2. Post Ledger Entries & Update Balances per line
    for (const line of dto.lines) {
      if (line.qty <= 0) {
        throw new AppError(400, `Transfer quantity must be greater than 0`, 'INVALID_QTY');
      }

      // Check current stock balance in source warehouse
      const currentBalance = await tx.stockBalance.findUnique({
        where: {
          warehouseId_itemId: {
            warehouseId: dto.fromWarehouseId,
            itemId: line.itemId,
          },
        },
      });

      if (!currentBalance || currentBalance.qtyOnHand < line.qty) {
        throw new AppError(
          400,
          `Insufficient stock in source warehouse '${fromWh.name}'. On-hand: ${currentBalance?.qtyOnHand || 0}, requested: ${line.qty}`,
          'INSUFFICIENT_STOCK',
        );
      }

      // OUT entry from source
      await tx.stockLedgerEntry.create({
        data: {
          tenantId,
          companyId: fromWh.companyId,
          factoryId: fromWh.factoryId,
          warehouseId: dto.fromWarehouseId,
          itemId: line.itemId,
          qtyIn: 0,
          qtyOut: line.qty,
          uomId: line.uomId,
          movementType: 'TRANSFER_OUT',
          refDocType: 'STOCK_TRANSFER',
          refDocId: transfer.id,
          createdBy: userId,
        },
      });

      // IN entry to destination
      await tx.stockLedgerEntry.create({
        data: {
          tenantId,
          companyId: toWh.companyId,
          factoryId: toWh.factoryId,
          warehouseId: dto.toWarehouseId,
          itemId: line.itemId,
          qtyIn: line.qty,
          qtyOut: 0,
          uomId: line.uomId,
          movementType: 'TRANSFER_IN',
          refDocType: 'STOCK_TRANSFER',
          refDocId: transfer.id,
          createdBy: userId,
        },
      });

      // Update Source Stock Balance
      await tx.stockBalance.update({
        where: { id: currentBalance.id },
        data: { qtyOnHand: currentBalance.qtyOnHand - line.qty },
      });

      // Update or Create Destination Stock Balance
      await tx.stockBalance.upsert({
        where: {
          warehouseId_itemId: {
            warehouseId: dto.toWarehouseId,
            itemId: line.itemId,
          },
        },
        update: { qtyOnHand: { increment: line.qty } },
        create: {
          tenantId,
          warehouseId: dto.toWarehouseId,
          itemId: line.itemId,
          qtyOnHand: line.qty,
        },
      });
    }

    return transfer;
  });
}

// --- Stock Adjustments ---
export async function executeStockAdjustment(tenantId: string, userId: string, dto: StockAdjustmentDto) {
  const warehouse = await prisma.warehouse.findFirst({
    where: { id: dto.warehouseId, tenantId, deletedAt: null },
  });

  if (!warehouse) {
    throw new AppError(404, 'Warehouse not found', 'WAREHOUSE_NOT_FOUND');
  }

  if (!dto.reasonCode) {
    throw new AppError(400, 'Adjustment reason code is required', 'REASON_REQUIRED');
  }

  if (!dto.lines || dto.lines.length === 0) {
    throw new AppError(400, 'Adjustment must contain at least one line item', 'NO_LINES');
  }

  const adjustmentNumber = `ADJ-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

  return prisma.$transaction(async (tx) => {
    // 1. Create Adjustment Header & Lines
    const adjustment = await tx.stockAdjustment.create({
      data: {
        tenantId,
        adjustmentNumber,
        warehouseId: dto.warehouseId,
        reasonCode: dto.reasonCode,
        status: 'posted',
        notes: dto.notes || null,
        postedAt: new Date(),
        lines: {
          create: dto.lines.map((l) => ({
            itemId: l.itemId,
            uomId: l.uomId,
            qty: l.qty,
          })),
        },
      },
      include: { lines: true, warehouse: true },
    });

    // 2. Post Ledger Entries & Update Balances
    for (const line of dto.lines) {
      if (line.qty === 0) continue;

      const qtyIn = line.qty > 0 ? line.qty : 0;
      const qtyOut = line.qty < 0 ? Math.abs(line.qty) : 0;

      await tx.stockLedgerEntry.create({
        data: {
          tenantId,
          companyId: warehouse.companyId,
          factoryId: warehouse.factoryId,
          warehouseId: dto.warehouseId,
          itemId: line.itemId,
          qtyIn,
          qtyOut,
          uomId: line.uomId,
          movementType: 'ADJUST',
          refDocType: 'STOCK_ADJUSTMENT',
          refDocId: adjustment.id,
          createdBy: userId,
        },
      });

      // Upsert Stock Balance
      await tx.stockBalance.upsert({
        where: {
          warehouseId_itemId: {
            warehouseId: dto.warehouseId,
            itemId: line.itemId,
          },
        },
        update: { qtyOnHand: { increment: line.qty } },
        create: {
          tenantId,
          warehouseId: dto.warehouseId,
          itemId: line.itemId,
          qtyOnHand: Math.max(0, line.qty),
        },
      });
    }

    return adjustment;
  });
}
