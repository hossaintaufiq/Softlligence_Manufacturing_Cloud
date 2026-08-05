import type { Request, Response, NextFunction } from 'express';
import { getApiKeys, generateApiKey, getWebhooks, createWebhook } from './developerPlatform.service.js';

export async function handleGetApiKeys(_req: Request, res: Response, next: NextFunction) {
  try {
    const keys = await getApiKeys();
    res.json({ keys });
  } catch (err) {
    next(err);
  }
}

export async function handleCreateApiKey(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, permissions } = req.body ?? {};
    const result = await generateApiKey(String(name || 'Integration Key'), permissions || ['read:all']);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function handleGetWebhooks(_req: Request, res: Response, next: NextFunction) {
  try {
    const webhooks = await getWebhooks();
    res.json({ webhooks });
  } catch (err) {
    next(err);
  }
}

export async function handleCreateWebhook(req: Request, res: Response, next: NextFunction) {
  try {
    const { targetUrl, events } = req.body ?? {};
    const webhook = await createWebhook(String(targetUrl), events || ['*']);
    res.json({ ok: true, webhook });
  } catch (err) {
    next(err);
  }
}
