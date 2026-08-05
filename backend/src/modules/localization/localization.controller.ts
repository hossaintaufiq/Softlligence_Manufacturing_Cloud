import type { Request, Response, NextFunction } from 'express';
import { getCurrencyRates, convertCurrency } from './localization.service.js';

export async function handleGetCurrencies(_req: Request, res: Response, next: NextFunction) {
  try {
    const currencies = await getCurrencyRates();
    res.json({ currencies });
  } catch (err) {
    next(err);
  }
}

export async function handleConvert(req: Request, res: Response, next: NextFunction) {
  try {
    const { amount, fromCode, toCode } = req.body ?? {};
    const result = await convertCurrency(Number(amount || 100), String(fromCode || 'USD'), String(toCode || 'BDT'));
    res.json(result);
  } catch (err) {
    next(err);
  }
}
