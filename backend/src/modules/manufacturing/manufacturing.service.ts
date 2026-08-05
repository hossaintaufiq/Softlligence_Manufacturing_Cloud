import { prisma } from '../../config/prisma.js';
import { AppError } from '../../common/errors/AppError.js';

// —— Bill of Materials (BOM) Services ——

export async function listBoms(tenantId: string, parentItemId?: string) {
  const rows = await prisma.bomHeader.findMany({
    where: {
      tenantId,
      deletedAt: null,
      ...(parentItemId ? { parentItemId } : {}),
    },
    include: {
      parentItem: { select: { id: true, code: true, name: true } },
      lines: {
        include: {
          componentItem: { select: { id: true, code: true, name: true } },
          uom: { select: { id: true, code: true, symbol: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return rows.map((b) => ({
    id: b.id,
    tenantId: b.tenantId,
    parentItemId: b.parentItemId,
    parentItemCode: b.parentItem.code,
    parentItemName: b.parentItem.name,
    version: b.version,
    isActive: b.isActive,
    lines: b.lines.map((l) => ({
      id: l.id,
      componentItemId: l.componentItemId,
      componentItemCode: l.componentItem.code,
      componentItemName: l.componentItem.name,
      qty: l.qty,
      uomId: l.uomId,
      uomSymbol: l.uom.symbol || l.uom.code,
      scrapPercent: l.scrapPercent,
      sequence: l.sequence,
    })),
    createdAt: b.createdAt.toISOString(),
  }));
}

export async function createBom(
  tenantId: string,
  input: {
    parentItemId: string;
    version?: string;
    lines: Array<{
      componentItemId: string;
      qty: number;
      uomId: string;
      scrapPercent?: number;
      sequence?: number;
    }>;
  },
) {
  const version = input.version || 'v1.0';
  if (!input.lines || input.lines.length === 0) {
    throw new AppError(400, 'BOM must contain at least one component line', 'VALIDATION_ERROR');
  }

  const existing = await prisma.bomHeader.findUnique({
    where: { tenantId_parentItemId_version: { tenantId, parentItemId: input.parentItemId, version } },
  });
  if (existing) {
    throw new AppError(409, `BOM version ${version} already exists for this item`, 'CONFLICT');
  }

  const bom = await prisma.bomHeader.create({
    data: {
      tenantId,
      parentItemId: input.parentItemId,
      version,
      lines: {
        create: input.lines.map((l, idx) => ({
          componentItemId: l.componentItemId,
          qty: Number(l.qty),
          uomId: l.uomId,
          scrapPercent: Number(l.scrapPercent || 0),
          sequence: l.sequence || idx + 1,
        })),
      },
    },
    include: {
      parentItem: { select: { id: true, code: true, name: true } },
      lines: {
        include: {
          componentItem: { select: { id: true, code: true, name: true } },
          uom: { select: { id: true, code: true, symbol: true } },
        },
      },
    },
  });

  return {
    id: bom.id,
    tenantId: bom.tenantId,
    parentItemId: bom.parentItemId,
    parentItemCode: bom.parentItem.code,
    parentItemName: bom.parentItem.name,
    version: bom.version,
    isActive: bom.isActive,
    lines: bom.lines.map((l) => ({
      id: l.id,
      componentItemId: l.componentItemId,
      componentItemCode: l.componentItem.code,
      componentItemName: l.componentItem.name,
      qty: l.qty,
      uomId: l.uomId,
      uomSymbol: l.uom.symbol || l.uom.code,
      scrapPercent: l.scrapPercent,
    })),
    createdAt: bom.createdAt.toISOString(),
  };
}

// —— Work Order Services ——

export async function listWorkOrders(tenantId: string, status?: string, factoryId?: string) {
  const rows = await prisma.workOrder.findMany({
    where: {
      tenantId,
      ...(status ? { status } : {}),
      ...(factoryId ? { factoryId } : {}),
    },
    include: {
      item: { select: { id: true, code: true, name: true, uom: { select: { symbol: true, code: true } } } },
      bom: {
        select: {
          id: true,
          version: true,
          lines: {
            include: {
              componentItem: { select: { id: true, code: true, name: true } },
              uom: { select: { symbol: true, code: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return rows.map((wo) => ({
    id: wo.id,
    tenantId: wo.tenantId,
    companyId: wo.companyId,
    factoryId: wo.factoryId,
    docNo: wo.docNo,
    docDate: wo.docDate.toISOString().slice(0, 10),
    woType: wo.woType,
    status: wo.status,
    itemId: wo.itemId,
    itemCode: wo.item.code,
    itemName: wo.item.name,
    itemUom: wo.item.uom.symbol || wo.item.uom.code,
    qtyPlanned: wo.qtyPlanned,
    qtyCompleted: wo.qtyCompleted,
    bomHeaderId: wo.bomHeaderId,
    bomVersion: wo.bom?.version || null,
    bomLines: wo.bom?.lines.map((l) => ({
      componentItemId: l.componentItemId,
      componentItemCode: l.componentItem.code,
      componentItemName: l.componentItem.name,
      qtyPerUnit: l.qty,
      uomSymbol: l.uom.symbol || l.uom.code,
    })) || [],
    priority: wo.priority,
    plannedStart: wo.plannedStart?.toISOString().slice(0, 10) || null,
    plannedEnd: wo.plannedEnd?.toISOString().slice(0, 10) || null,
    attrsJson: wo.attrsJson,
    createdAt: wo.createdAt.toISOString(),
  }));
}

export async function createWorkOrder(
  tenantId: string,
  input: {
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
    attrsJson?: unknown;
  },
) {
  if (!input.itemId || !input.qtyPlanned || input.qtyPlanned <= 0) {
    throw new AppError(400, 'Valid itemId and positive qtyPlanned are required', 'VALIDATION_ERROR');
  }

  const docNo = input.docNo?.trim() || `WO-${Date.now().toString().slice(-6)}`;
  const woType = input.woType || 'GENERIC';

  const wo = await prisma.workOrder.create({
    data: {
      tenantId,
      companyId: input.companyId,
      factoryId: input.factoryId,
      docNo,
      woType,
      status: 'draft',
      itemId: input.itemId,
      qtyPlanned: Number(input.qtyPlanned),
      bomHeaderId: input.bomHeaderId || null,
      priority: input.priority || 1,
      plannedStart: input.plannedStart ? new Date(input.plannedStart) : null,
      plannedEnd: input.plannedEnd ? new Date(input.plannedEnd) : null,
      attrsJson: input.attrsJson as any,
    },
    include: {
      item: { select: { id: true, code: true, name: true, uom: { select: { symbol: true, code: true } } } },
    },
  });

  return {
    id: wo.id,
    docNo: wo.docNo,
    status: wo.status,
    itemCode: wo.item.code,
    itemName: wo.item.name,
    qtyPlanned: wo.qtyPlanned,
    qtyCompleted: wo.qtyCompleted,
    createdAt: wo.createdAt.toISOString(),
  };
}

export async function updateWorkOrderStatus(tenantId: string, workOrderId: string, nextStatus: string) {
  const wo = await prisma.workOrder.findFirst({
    where: { id: workOrderId, tenantId },
  });
  if (!wo) throw new AppError(404, 'Work Order not found', 'NOT_FOUND');

  const validStatuses = ['draft', 'released', 'in_progress', 'completed', 'cancelled'];
  if (!validStatuses.includes(nextStatus)) {
    throw new AppError(400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 'VALIDATION_ERROR');
  }

  const updated = await prisma.workOrder.update({
    where: { id: workOrderId },
    data: { status: nextStatus },
  });

  return { id: updated.id, docNo: updated.docNo, status: updated.status };
}

// —— Manufacturing Executions & Postings (Issues, Output Receipts, Scrap, Energy) ——

export async function postMaterialIssue(
  tenantId: string,
  userId: string,
  input: {
    workOrderId: string;
    warehouseId: string;
    lines: Array<{ itemId: string; uomId: string; qtyIssued: number }>;
    notes?: string;
  },
) {
  const wo = await prisma.workOrder.findFirst({
    where: { id: input.workOrderId, tenantId },
  });
  if (!wo) throw new AppError(404, 'Work Order not found', 'NOT_FOUND');
  if (!['released', 'in_progress'].includes(wo.status)) {
    throw new AppError(400, `Cannot issue materials for Work Order in status '${wo.status}'`, 'VALIDATION_ERROR');
  }

  return await prisma.$transaction(async (tx) => {
    const issue = await tx.workOrderMaterialIssue.create({
      data: {
        tenantId,
        workOrderId: wo.id,
        warehouseId: input.warehouseId,
        notes: input.notes,
        lines: {
          create: input.lines.map((l) => ({
            itemId: l.itemId,
            uomId: l.uomId,
            qtyIssued: Number(l.qtyIssued),
          })),
        },
      },
      include: { lines: true },
    });

    // Auto-update status to in_progress if currently released
    if (wo.status === 'released') {
      await tx.workOrder.update({
        where: { id: wo.id },
        data: { status: 'in_progress' },
      });
    }

    // Post to Stock Ledger (ISSUE) and update StockBalance for each component item
    for (const line of input.lines) {
      const qty = Number(line.qtyIssued);
      await tx.stockLedgerEntry.create({
        data: {
          tenantId,
          companyId: wo.companyId,
          factoryId: wo.factoryId,
          warehouseId: input.warehouseId,
          itemId: line.itemId,
          qtyIn: 0,
          qtyOut: qty,
          uomId: line.uomId,
          movementType: 'ISSUE',
          refDocType: 'work_order',
          refDocId: wo.id,
          refLineId: issue.id,
          createdBy: userId,
        },
      });

      // Reduce StockBalance
      await tx.stockBalance.upsert({
        where: { warehouseId_itemId: { warehouseId: input.warehouseId, itemId: line.itemId } },
        update: { qtyOnHand: { decrement: qty } },
        create: {
          tenantId,
          warehouseId: input.warehouseId,
          itemId: line.itemId,
          qtyOnHand: -qty,
        },
      });
    }

    return { id: issue.id, workOrderId: wo.id, issuedAt: issue.issuedAt.toISOString() };
  });
}

export async function postProductionOutput(
  tenantId: string,
  userId: string,
  input: {
    workOrderId: string;
    warehouseId: string;
    qtyProduced: number;
    uomId: string;
    lotCode?: string;
    attrsJson?: unknown;
  },
) {
  const wo = await prisma.workOrder.findFirst({
    where: { id: input.workOrderId, tenantId },
  });
  if (!wo) throw new AppError(404, 'Work Order not found', 'NOT_FOUND');
  if (!['released', 'in_progress'].includes(wo.status)) {
    throw new AppError(400, `Cannot post output for Work Order in status '${wo.status}'`, 'VALIDATION_ERROR');
  }

  const qty = Number(input.qtyProduced);
  if (qty <= 0) throw new AppError(400, 'qtyProduced must be greater than 0', 'VALIDATION_ERROR');

  return await prisma.$transaction(async (tx) => {
    const output = await tx.workOrderOutput.create({
      data: {
        tenantId,
        workOrderId: wo.id,
        warehouseId: input.warehouseId,
        qtyProduced: qty,
        uomId: input.uomId,
        lotCode: input.lotCode,
        attrsJson: input.attrsJson as any,
      },
    });

    // Update WorkOrder completed qty & status
    const newQtyCompleted = wo.qtyCompleted + qty;
    const isCompleted = newQtyCompleted >= wo.qtyPlanned;
    await tx.workOrder.update({
      where: { id: wo.id },
      data: {
        qtyCompleted: newQtyCompleted,
        status: isCompleted ? 'completed' : 'in_progress',
      },
    });

    // Post to Stock Ledger (OUTPUT) and update FG StockBalance
    await tx.stockLedgerEntry.create({
      data: {
        tenantId,
        companyId: wo.companyId,
        factoryId: wo.factoryId,
        warehouseId: input.warehouseId,
        itemId: wo.itemId,
        qtyIn: qty,
        qtyOut: 0,
        uomId: input.uomId,
        movementType: 'OUTPUT',
        refDocType: 'work_order',
        refDocId: wo.id,
        refLineId: output.id,
        createdBy: userId,
      },
    });

    await tx.stockBalance.upsert({
      where: { warehouseId_itemId: { warehouseId: input.warehouseId, itemId: wo.itemId } },
      update: { qtyOnHand: { increment: qty } },
      create: {
        tenantId,
        warehouseId: input.warehouseId,
        itemId: wo.itemId,
        qtyOnHand: qty,
      },
    });

    return {
      id: output.id,
      workOrderId: wo.id,
      qtyProduced: output.qtyProduced,
      totalCompleted: newQtyCompleted,
      isCompleted,
    };
  });
}

export async function postScrapLog(
  tenantId: string,
  input: {
    workOrderId: string;
    qtyScrapped: number;
    uomId: string;
    reasonCode: string;
    notes?: string;
  },
) {
  const scrap = await prisma.workOrderScrap.create({
    data: {
      tenantId,
      workOrderId: input.workOrderId,
      qtyScrapped: Number(input.qtyScrapped),
      uomId: input.uomId,
      reasonCode: input.reasonCode,
      notes: input.notes,
    },
  });
  return { id: scrap.id, qtyScrapped: scrap.qtyScrapped, reasonCode: scrap.reasonCode };
}

export async function postEnergyLog(
  tenantId: string,
  input: {
    factoryId: string;
    workOrderId?: string;
    utilityType: string;
    quantity: number;
    uomCode?: string;
  },
) {
  const log = await prisma.energyLog.create({
    data: {
      tenantId,
      factoryId: input.factoryId,
      workOrderId: input.workOrderId || null,
      utilityType: input.utilityType,
      quantity: Number(input.quantity),
      uomCode: input.uomCode || 'kWh',
    },
  });
  return { id: log.id, utilityType: log.utilityType, quantity: log.quantity };
}

export async function getManufacturingKpis(tenantId: string) {
  const workOrders = await prisma.workOrder.findMany({
    where: { tenantId },
    select: { status: true, qtyPlanned: true, qtyCompleted: true },
  });

  const totalOrders = workOrders.length;
  const activeOrders = workOrders.filter((w) => ['released', 'in_progress'].includes(w.status)).length;
  const completedOrders = workOrders.filter((w) => w.status === 'completed').length;

  const totalPlanned = workOrders.reduce((sum, w) => sum + w.qtyPlanned, 0);
  const totalProduced = workOrders.reduce((sum, w) => sum + w.qtyCompleted, 0);
  const overallYield = totalPlanned > 0 ? Math.min(100, (totalProduced / totalPlanned) * 100) : 100;

  const scraps = await prisma.workOrderScrap.findMany({ where: { tenantId } });
  const totalScrap = scraps.reduce((sum, s) => sum + s.qtyScrapped, 0);

  const energyLogs = await prisma.energyLog.findMany({ where: { tenantId } });
  const totalEnergyKwh = energyLogs
    .filter((e) => e.utilityType === 'electricity')
    .reduce((sum, e) => sum + e.quantity, 0);

  return {
    totalOrders,
    activeOrders,
    completedOrders,
    totalPlanned,
    totalProduced,
    totalScrap,
    overallYield: Number(overallYield.toFixed(2)),
    totalEnergyKwh,
  };
}
