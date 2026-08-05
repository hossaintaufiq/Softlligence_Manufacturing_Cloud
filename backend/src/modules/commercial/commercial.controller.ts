import type { Request, Response, NextFunction } from 'express';
import * as commercialService from './commercial.service.js';

export async function listPartiesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.auth!.user.tenantId!;
    const type = req.query.type as 'customer' | 'supplier' | undefined;
    const data = await commercialService.listParties(tenantId, { type });
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function createPartyHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.auth!.user.tenantId!;
    const data = await commercialService.createParty(tenantId, req.body);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
}

export async function listPurchaseOrdersHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.auth!.user.tenantId!;
    const status = req.query.status as string | undefined;
    const data = await commercialService.listPurchaseOrders(tenantId, status);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function createPurchaseOrderHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.auth!.user.tenantId!;
    const data = await commercialService.createPurchaseOrder(tenantId, req.body);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
}

export async function listGrnsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.auth!.user.tenantId!;
    const data = await commercialService.listGrns(tenantId);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function postGrnHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.auth!.user.tenantId!;
    const userId = req.auth!.user.id;
    const data = await commercialService.postGrn(tenantId, userId, req.body);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
}

export async function listSalesOrdersHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.auth!.user.tenantId!;
    const status = req.query.status as string | undefined;
    const data = await commercialService.listSalesOrders(tenantId, status);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function createSalesOrderHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.auth!.user.tenantId!;
    const data = await commercialService.createSalesOrder(tenantId, req.body);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
}

export async function listDispatchesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.auth!.user.tenantId!;
    const data = await commercialService.listDispatches(tenantId);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function postDispatchHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.auth!.user.tenantId!;
    const userId = req.auth!.user.id;
    const data = await commercialService.postDispatch(tenantId, userId, req.body);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
}

export async function getCommercialKpisHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.auth!.user.tenantId!;
    const data = await commercialService.getCommercialKpis(tenantId);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}
