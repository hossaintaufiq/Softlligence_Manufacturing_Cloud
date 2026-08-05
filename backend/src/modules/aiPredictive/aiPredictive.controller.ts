import type { Request, Response, NextFunction } from 'express';
import { getPredictiveAlerts, processAiAssistantQuery } from './aiPredictive.service.js';

export async function handleGetPredictiveAlerts(_req: Request, res: Response, next: NextFunction) {
  try {
    const alerts = await getPredictiveAlerts();
    res.json({ alerts });
  } catch (err) {
    next(err);
  }
}

export async function handleAiAssistantQuery(req: Request, res: Response, next: NextFunction) {
  try {
    const { prompt } = req.body ?? {};
    const result = await processAiAssistantQuery(String(prompt || 'What is our current yield?'));
    res.json(result);
  } catch (err) {
    next(err);
  }
}
