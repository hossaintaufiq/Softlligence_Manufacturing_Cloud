import type { Request, Response, NextFunction } from 'express';
import * as manufacturingService from './manufacturing.service.js';

export async function listBomsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.auth!.user.tenantId!;
    const parentItemId = req.query.parentItemId as string | undefined;
    const boms = await manufacturingService.listBoms(tenantId, parentItemId);
    res.json({ data: boms });
  } catch (err) {
    next(err);
  }
}

export async function createBomHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.auth!.user.tenantId!;
    const result = await manufacturingService.createBom(tenantId, req.body);
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function listWorkOrdersHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.auth!.user.tenantId!;
    const status = req.query.status as string | undefined;
    const factoryId = req.query.factoryId as string | undefined;
    const workOrders = await manufacturingService.listWorkOrders(tenantId, status, factoryId);
    res.json({ data: workOrders });
  } catch (err) {
    next(err);
  }
}

export async function createWorkOrderHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.auth!.user.tenantId!;
    const result = await manufacturingService.createWorkOrder(tenantId, req.body);
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function updateWorkOrderStatusHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.auth!.user.tenantId!;
    const id = req.params.id;
    const { status } = req.body;
    const result = await manufacturingService.updateWorkOrderStatus(tenantId, id, status);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function postMaterialIssueHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.auth!.user.tenantId!;
    const userId = req.auth!.user.id;
    const result = await manufacturingService.postMaterialIssue(tenantId, userId, req.body);
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function postProductionOutputHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.auth!.user.tenantId!;
    const userId = req.auth!.user.id;
    const result = await manufacturingService.postProductionOutput(tenantId, userId, req.body);
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function postScrapLogHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.auth!.user.tenantId!;
    const result = await manufacturingService.postScrapLog(tenantId, req.body);
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function postEnergyLogHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.auth!.user.tenantId!;
    const result = await manufacturingService.postEnergyLog(tenantId, req.body);
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function getManufacturingKpisHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.auth!.user.tenantId!;
    const kpis = await manufacturingService.getManufacturingKpis(tenantId);
    res.json({ data: kpis });
  } catch (err) {
    next(err);
  }
}
