import type { Request, Response, NextFunction } from 'express';
import { getWarehouseBins, getLotGenealogy, getFifoInventoryValuation } from './wms.service.js';

export async function handleGetBins(_req: Request, res: Response, next: NextFunction) {
  try {
    const bins = await getWarehouseBins();
    res.json({ bins });
  } catch (err) {
    next(err);
  }
}

export async function handleGetGenealogy(req: Request, res: Response, next: NextFunction) {
  try {
    const lotNo = String(req.query.lotNo || 'LOT-2026-8891');
    const genealogy = await getLotGenealogy(lotNo);
    res.json({ genealogy });
  } catch (err) {
    next(err);
  }
}

export async function handleGetValuation(_req: Request, res: Response, next: NextFunction) {
  try {
    const valuation = await getFifoInventoryValuation();
    res.json(valuation);
  } catch (err) {
    next(err);
  }
}
