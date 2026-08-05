import type { Request, Response, NextFunction } from 'express';
import { getUserNotifications, markNotificationAsRead } from './notification.service.js';
import { getBackgroundJobs, enqueueBackgroundJob } from './jobQueue.service.js';
import { searchCrossEntity } from './search.service.js';

export async function handleGetNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const tenantId = req.auth?.user.tenantId || null;
    const notifications = await getUserNotifications(tenantId);
    res.json({ notifications });
  } catch (err) {
    next(err);
  }
}

export async function handleMarkRead(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const result = await markNotificationAsRead(String(id));
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function handleGetJobs(_req: Request, res: Response, next: NextFunction) {
  try {
    const jobs = await getBackgroundJobs();
    res.json({ jobs });
  } catch (err) {
    next(err);
  }
}

export async function handleCreateJob(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, payload } = req.body ?? {};
    const job = await enqueueBackgroundJob(name || 'pdf.challan', payload || {});
    res.json({ ok: true, job });
  } catch (err) {
    next(err);
  }
}

export async function handleSearch(req: Request, res: Response, next: NextFunction) {
  try {
    const query = String(req.query.q || '');
    const tenantId = req.auth?.user.tenantId || null;
    const results = await searchCrossEntity(query, tenantId);
    res.json({ query, results });
  } catch (err) {
    next(err);
  }
}
