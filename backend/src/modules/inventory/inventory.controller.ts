import type { Request, Response, NextFunction } from 'express';
import {
  createItem,
  createUom,
  createWarehouse,
  executeStockAdjustment,
  executeStockTransfer,
  getItemById,
  getStockBalances,
  getStockLedger,
  listItems,
  listUoms,
  listWarehouses,
} from './inventory.service.js';

export async function handleListWarehouses(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.auth!.user.tenantId!;
    const warehouses = await listWarehouses(tenantId);
    res.json(warehouses);
  } catch (err) {
    next(err);
  }
}

export async function handleCreateWarehouse(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.auth!.user.tenantId!;
    const warehouse = await createWarehouse(tenantId, req.body);
    res.status(201).json(warehouse);
  } catch (err) {
    next(err);
  }
}

export async function handleListUoms(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.auth!.user.tenantId!;
    const uoms = await listUoms(tenantId);
    res.json(uoms);
  } catch (err) {
    next(err);
  }
}

export async function handleCreateUom(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.auth!.user.tenantId!;
    const uom = await createUom(tenantId, req.body);
    res.status(201).json(uom);
  } catch (err) {
    next(err);
  }
}

export async function handleListItems(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.auth!.user.tenantId!;
    const itemType = req.query.item_type as string | undefined;
    const items = await listItems(tenantId, itemType);
    res.json(items);
  } catch (err) {
    next(err);
  }
}

export async function handleCreateItem(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.auth!.user.tenantId!;
    const item = await createItem(tenantId, req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

export async function handleGetItem(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.auth!.user.tenantId!;
    const item = await getItemById(tenantId, req.params.id);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function handleGetStockBalances(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.auth!.user.tenantId!;
    const warehouseId = req.query.warehouse_id as string | undefined;
    const balances = await getStockBalances(tenantId, warehouseId);
    res.json(balances);
  } catch (err) {
    next(err);
  }
}

export async function handleGetStockLedger(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.auth!.user.tenantId!;
    const warehouseId = req.query.warehouse_id as string | undefined;
    const itemId = req.query.item_id as string | undefined;
    const ledger = await getStockLedger(tenantId, warehouseId, itemId);
    res.json(ledger);
  } catch (err) {
    next(err);
  }
}

export async function handleExecuteStockTransfer(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.auth!.user.tenantId!;
    const userId = req.auth!.user.id;
    const transfer = await executeStockTransfer(tenantId, userId, req.body);
    res.status(201).json(transfer);
  } catch (err) {
    next(err);
  }
}

export async function handleExecuteStockAdjustment(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.auth!.user.tenantId!;
    const userId = req.auth!.user.id;
    const adjustment = await executeStockAdjustment(tenantId, userId, req.body);
    res.status(201).json(adjustment);
  } catch (err) {
    next(err);
  }
}
