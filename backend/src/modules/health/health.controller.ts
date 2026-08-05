import type { Request, Response } from 'express';
import { env } from '../../config/env.js';
import { checkDatabase } from './health.service.js';

export async function getHealth(_req: Request, res: Response) {
  res.json({
    status: 'ok',
    service: env.appSlug,
    name: env.appName,
    version: env.appVersion,
    timestamp: new Date().toISOString(),
  });
}

export async function getReady(_req: Request, res: Response) {
  const db = await checkDatabase();
  const ready = db.ok;

  res.status(ready ? 200 : 503).json({
    status: ready ? 'ready' : 'not_ready',
    checks: {
      database: db,
    },
    timestamp: new Date().toISOString(),
  });
}
