import type { Request, Response, NextFunction } from 'express';
import * as steelService from './steel.service.js';

export async function listScrapReceiptsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.auth!.user.tenantId!;
    const data = await steelService.listScrapReceipts(tenantId);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function createScrapReceiptHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.auth!.user.tenantId!;
    const data = await steelService.createScrapReceipt(tenantId, req.body);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
}

export async function listHeatLogsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.auth!.user.tenantId!;
    const data = await steelService.listHeatLogs(tenantId);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function createHeatLogHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.auth!.user.tenantId!;
    const data = await steelService.createHeatLog(tenantId, req.body);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
}

export async function listRollingLogsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.auth!.user.tenantId!;
    const data = await steelService.listRollingLogs(tenantId);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function createRollingLogHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.auth!.user.tenantId!;
    const data = await steelService.createRollingLog(tenantId, req.body);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
}

export async function importSteelBatchHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.auth!.user.tenantId!;
    const data = await steelService.importSteelBatch(tenantId, req.body);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
}

export async function getSteelKpisHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.auth!.user.tenantId!;
    const data = await steelService.getSteelKpis(tenantId);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}
