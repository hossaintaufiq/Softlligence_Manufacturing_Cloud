import { prisma } from '../../config/prisma.js';
import { AppError } from '../../common/errors/AppError.js';

// —— Party Services (Customers & Suppliers) ——

export async function listParties(tenantId: string, filter?: { type?: 'customer' | 'supplier' }) {
  const where: any = { tenantId, deletedAt: null };
  if (filter?.type === 'customer') where.isCustomer = true;
  if (filter?.type === 'supplier') where.isSupplier = true;

  const rows = await prisma.party.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return rows.map((p) => ({
    id: p.id,
    tenantId: p.tenantId,
    companyId: p.companyId,
    code: p.code,
    name: p.name,
    isCustomer: p.isCustomer,
    isSupplier: p.isSupplier,
    creditLimit: p.creditLimit,
    paymentTerms: p.paymentTerms,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
  }));
}

export async function createParty(
  tenantId: string,
  input: {
    companyId?: string;
    code: string;
    name: string;
    isCustomer?: boolean;
    isSupplier?: boolean;
    creditLimit?: number;
    paymentTerms?: string;
  },
) {
  if (!input.code || !input.name) {
    throw new AppError(400, 'Party code and name are required', 'VALIDATION_ERROR');
  }

  const existing = await prisma.party.findUnique({
    where: { tenantId_code: { tenantId, code: input.code.trim().toUpperCase() } },
  });
  if (existing) {
    throw new AppError(409, `Party code '${input.code}' already exists`, 'CONFLICT');
  }

  const party = await prisma.party.create({
    data: {
      tenantId,
      companyId: input.companyId || null,
      code: input.code.trim().toUpperCase(),
      name: input.name.trim(),
      isCustomer: Boolean(input.isCustomer),
      isSupplier: Boolean(input.isSupplier ?? true),
      creditLimit: input.creditLimit ? Number(input.creditLimit) : null,
      paymentTerms: input.paymentTerms || 'NET30',
    },
  });

  return party;
}

// —— Purchase Order Services ——

export async function listPurchaseOrders(tenantId: string, status?: string) {
  const rows = await prisma.purchaseOrder.findMany({
    where: {
      tenantId,
      deletedAt: null,
      ...(status ? { status } : {}),
    },
    include: {
      party: { select: { id: true, code: true, name: true } },
      lines: {
        include: {
          item: { select: { id: true, code: true, name: true } },
          uom: { select: { symbol: true, code: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return rows.map((po) => ({
    id: po.id,
    tenantId: po.tenantId,
    companyId: po.companyId,
    partyId: po.partyId,
    supplierCode: po.party.code,
    supplierName: po.party.name,
    docNo: po.docNo,
    docDate: po.docDate.toISOString().slice(0, 10),
    status: po.status,
    currency: po.currency,
    totalAmount: po.totalAmount,
    lines: po.lines.map((l) => ({
      id: l.id,
      itemId: l.itemId,
      itemCode: l.item.code,
      itemName: l.item.name,
      qty: l.qty,
      unitPrice: l.unitPrice,
      amount: l.amount,
      uomSymbol: l.uom.symbol || l.uom.code,
    })),
    createdAt: po.createdAt.toISOString(),
  }));
}

export async function createPurchaseOrder(
  tenantId: string,
  input: {
    companyId: string;
    partyId: string;
    docNo?: string;
    currency?: string;
    lines: Array<{ itemId: string; uomId: string; qty: number; unitPrice: number }>;
  },
) {
  if (!input.partyId || !input.lines || input.lines.length === 0) {
    throw new AppError(400, 'Supplier partyId and at least one order line are required', 'VALIDATION_ERROR');
  }

  const docNo = input.docNo?.trim() || `PO-${Date.now().toString().slice(-6)}`;
  let totalAmount = 0;
  const lineData = input.lines.map((l) => {
    const amount = Number(l.qty) * Number(l.unitPrice);
    totalAmount += amount;
    return {
      itemId: l.itemId,
      uomId: l.uomId,
      qty: Number(l.qty),
      unitPrice: Number(l.unitPrice),
      amount,
    };
  });

  const po = await prisma.purchaseOrder.create({
    data: {
      tenantId,
      companyId: input.companyId,
      partyId: input.partyId,
      docNo,
      currency: input.currency || 'USD',
      totalAmount,
      status: 'approved',
      lines: { create: lineData },
    },
    include: {
      party: { select: { code: true, name: true } },
    },
  });

  return { id: po.id, docNo: po.docNo, status: po.status, totalAmount: po.totalAmount };
}

// —— Goods Receipt Note (GRN) Services ——

export async function listGrns(tenantId: string) {
  const rows = await prisma.grn.findMany({
    where: { tenantId },
    include: {
      party: { select: { code: true, name: true } },
      warehouse: { select: { code: true, name: true } },
      lines: {
        include: {
          item: { select: { code: true, name: true } },
          uom: { select: { symbol: true, code: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return rows.map((g) => ({
    id: g.id,
    docNo: g.docNo,
    docDate: g.docDate.toISOString().slice(0, 10),
    status: g.status,
    supplierName: g.party.name,
    warehouseName: g.warehouse.name,
    vehicleNo: g.vehicleNo,
    lines: g.lines.map((l) => ({
      itemCode: l.item.code,
      itemName: l.item.name,
      qtyReceived: l.qtyReceived,
      unitCost: l.unitCost,
      uomSymbol: l.uom.symbol || l.uom.code,
    })),
  }));
}

export async function postGrn(
  tenantId: string,
  userId: string,
  input: {
    companyId: string;
    warehouseId: string;
    partyId: string;
    purchaseOrderId?: string;
    docNo?: string;
    vehicleNo?: string;
    lines: Array<{ itemId: string; uomId: string; qtyReceived: number; unitCost?: number }>;
  },
) {
  if (!input.partyId || !input.warehouseId || !input.lines || input.lines.length === 0) {
    throw new AppError(400, 'Supplier partyId, warehouseId, and receipt lines are required', 'VALIDATION_ERROR');
  }

  const docNo = input.docNo?.trim() || `GRN-${Date.now().toString().slice(-6)}`;

  return await prisma.$transaction(async (tx) => {
    const grn = await tx.grn.create({
      data: {
        tenantId,
        companyId: input.companyId,
        warehouseId: input.warehouseId,
        partyId: input.partyId,
        purchaseOrderId: input.purchaseOrderId || null,
        docNo,
        status: 'confirmed',
        vehicleNo: input.vehicleNo,
        receivedAt: new Date(),
        lines: {
          create: input.lines.map((l) => ({
            itemId: l.itemId,
            uomId: l.uomId,
            qtyReceived: Number(l.qtyReceived),
            unitCost: Number(l.unitCost || 0),
          })),
        },
      },
    });

    // Auto-update PO status to completed if linked
    if (input.purchaseOrderId) {
      await tx.purchaseOrder.update({
        where: { id: input.purchaseOrderId },
        data: { status: 'completed' },
      });
    }

    // Post to Stock Ledger (RECEIPT) and increment StockBalance for each item
    for (const line of input.lines) {
      const qty = Number(line.qtyReceived);
      await tx.stockLedgerEntry.create({
        data: {
          tenantId,
          companyId: input.companyId,
          warehouseId: input.warehouseId,
          itemId: line.itemId,
          qtyIn: qty,
          qtyOut: 0,
          uomId: line.uomId,
          movementType: 'RECEIPT',
          refDocType: 'grn',
          refDocId: grn.id,
          createdBy: userId,
        },
      });

      await tx.stockBalance.upsert({
        where: { warehouseId_itemId: { warehouseId: input.warehouseId, itemId: line.itemId } },
        update: { qtyOnHand: { increment: qty } },
        create: {
          tenantId,
          warehouseId: input.warehouseId,
          itemId: line.itemId,
          qtyOnHand: qty,
        },
      });
    }

    return { id: grn.id, docNo: grn.docNo, status: grn.status };
  });
}

// —— Sales Order Services ——

export async function listSalesOrders(tenantId: string, status?: string) {
  const rows = await prisma.salesOrder.findMany({
    where: {
      tenantId,
      deletedAt: null,
      ...(status ? { status } : {}),
    },
    include: {
      party: { select: { id: true, code: true, name: true } },
      lines: {
        include: {
          item: { select: { id: true, code: true, name: true } },
          uom: { select: { symbol: true, code: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return rows.map((so) => ({
    id: so.id,
    tenantId: so.tenantId,
    companyId: so.companyId,
    partyId: so.partyId,
    customerCode: so.party.code,
    customerName: so.party.name,
    docNo: so.docNo,
    docDate: so.docDate.toISOString().slice(0, 10),
    status: so.status,
    currency: so.currency,
    totalAmount: so.totalAmount,
    lines: so.lines.map((l) => ({
      id: l.id,
      itemId: l.itemId,
      itemCode: l.item.code,
      itemName: l.item.name,
      qty: l.qty,
      unitPrice: l.unitPrice,
      amount: l.amount,
      uomSymbol: l.uom.symbol || l.uom.code,
    })),
    createdAt: so.createdAt.toISOString(),
  }));
}

export async function createSalesOrder(
  tenantId: string,
  input: {
    companyId: string;
    partyId: string;
    docNo?: string;
    currency?: string;
    lines: Array<{ itemId: string; uomId: string; qty: number; unitPrice: number }>;
  },
) {
  if (!input.partyId || !input.lines || input.lines.length === 0) {
    throw new AppError(400, 'Customer partyId and at least one order line are required', 'VALIDATION_ERROR');
  }

  const docNo = input.docNo?.trim() || `SO-${Date.now().toString().slice(-6)}`;
  let totalAmount = 0;
  const lineData = input.lines.map((l) => {
    const amount = Number(l.qty) * Number(l.unitPrice);
    totalAmount += amount;
    return {
      itemId: l.itemId,
      uomId: l.uomId,
      qty: Number(l.qty),
      unitPrice: Number(l.unitPrice),
      amount,
    };
  });

  const so = await prisma.salesOrder.create({
    data: {
      tenantId,
      companyId: input.companyId,
      partyId: input.partyId,
      docNo,
      currency: input.currency || 'USD',
      totalAmount,
      status: 'confirmed',
      lines: { create: lineData },
    },
    include: { party: { select: { code: true, name: true } } },
  });

  return { id: so.id, docNo: so.docNo, status: so.status, totalAmount: so.totalAmount };
}

// —— Dispatch / Delivery Challan Services ——

export async function listDispatches(tenantId: string) {
  const rows = await prisma.dispatch.findMany({
    where: { tenantId },
    include: {
      party: { select: { code: true, name: true } },
      warehouse: { select: { code: true, name: true } },
      lines: {
        include: {
          item: { select: { code: true, name: true } },
          uom: { select: { symbol: true, code: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return rows.map((d) => ({
    id: d.id,
    docNo: d.docNo,
    docDate: d.docDate.toISOString().slice(0, 10),
    status: d.status,
    customerName: d.party.name,
    warehouseName: d.warehouse.name,
    vehicleNo: d.vehicleNo,
    freightAmount: d.freightAmount,
    lines: d.lines.map((l) => ({
      itemCode: l.item.code,
      itemName: l.item.name,
      qty: l.qty,
      unitPrice: l.unitPrice,
      amount: l.amount,
      uomSymbol: l.uom.symbol || l.uom.code,
    })),
  }));
}

export async function postDispatch(
  tenantId: string,
  userId: string,
  input: {
    companyId: string;
    warehouseId: string;
    partyId: string;
    salesOrderId?: string;
    docNo?: string;
    vehicleNo?: string;
    freightAmount?: number;
    lines: Array<{ itemId: string; uomId: string; qty: number; unitPrice?: number }>;
  },
) {
  if (!input.partyId || !input.warehouseId || !input.lines || input.lines.length === 0) {
    throw new AppError(400, 'Customer partyId, warehouseId, and dispatch lines are required', 'VALIDATION_ERROR');
  }

  const docNo = input.docNo?.trim() || `CHAL-${Date.now().toString().slice(-6)}`;

  return await prisma.$transaction(async (tx) => {
    const dispatch = await tx.dispatch.create({
      data: {
        tenantId,
        companyId: input.companyId,
        warehouseId: input.warehouseId,
        partyId: input.partyId,
        salesOrderId: input.salesOrderId || null,
        docNo,
        status: 'confirmed',
        vehicleNo: input.vehicleNo,
        freightAmount: Number(input.freightAmount || 0),
        confirmedAt: new Date(),
        lines: {
          create: input.lines.map((l) => ({
            itemId: l.itemId,
            uomId: l.uomId,
            qty: Number(l.qty),
            unitPrice: Number(l.unitPrice || 0),
            amount: Number(l.qty) * Number(l.unitPrice || 0),
          })),
        },
      },
    });

    // Auto-update Sales Order status if linked
    if (input.salesOrderId) {
      await tx.salesOrder.update({
        where: { id: input.salesOrderId },
        data: { status: 'completed' },
      });
    }

    // Post to Stock Ledger (DISPATCH) and decrement StockBalance for each item
    for (const line of input.lines) {
      const qty = Number(line.qty);
      await tx.stockLedgerEntry.create({
        data: {
          tenantId,
          companyId: input.companyId,
          warehouseId: input.warehouseId,
          itemId: line.itemId,
          qtyIn: 0,
          qtyOut: qty,
          uomId: line.uomId,
          movementType: 'DISPATCH',
          refDocType: 'dispatch',
          refDocId: dispatch.id,
          createdBy: userId,
        },
      });

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

    return { id: dispatch.id, docNo: dispatch.docNo, status: dispatch.status };
  });
}

// —— Commercial KPIs ——

export async function getCommercialKpis(tenantId: string) {
  const [parties, pos, grns, sos, dispatches] = await Promise.all([
    prisma.party.findMany({ where: { tenantId, deletedAt: null } }),
    prisma.purchaseOrder.findMany({ where: { tenantId, deletedAt: null } }),
    prisma.grn.findMany({ where: { tenantId } }),
    prisma.salesOrder.findMany({ where: { tenantId, deletedAt: null } }),
    prisma.dispatch.findMany({ where: { tenantId } }),
  ]);

  const customerCount = parties.filter((p) => p.isCustomer).length;
  const supplierCount = parties.filter((p) => p.isSupplier).length;

  const totalProcurementVal = pos.reduce((sum, po) => sum + po.totalAmount, 0);
  const totalSalesVal = sos.reduce((sum, so) => sum + so.totalAmount, 0);

  return {
    customerCount,
    supplierCount,
    totalPos: pos.length,
    openPos: pos.filter((p) => ['draft', 'approved'].includes(p.status)).length,
    totalProcurementVal,
    totalSos: sos.length,
    openSos: sos.filter((s) => ['draft', 'confirmed'].includes(s.status)).length,
    totalSalesVal,
    grnCount: grns.length,
    dispatchCount: dispatches.length,
  };
}
