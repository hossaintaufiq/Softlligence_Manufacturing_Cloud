import type { Request, Response, NextFunction } from 'express';
import { getHaClusterHealth, triggerDrSnapshot } from './enterpriseHa.service.js';

export async function handleGetHaHealth(_req: Request, res: Response, next: NextFunction) {
  try {
    const health = await getHaClusterHealth();
    res.json(health);
  } catch (err) {
    next(err);
  }
}

export async function handleTriggerSnapshot(_req: Request, res: Response, next: NextFunction) {
  try {
    const snapshot = await triggerDrSnapshot();
    res.json({ ok: true, snapshot });
  } catch (err) {
    next(err);
  }
}
