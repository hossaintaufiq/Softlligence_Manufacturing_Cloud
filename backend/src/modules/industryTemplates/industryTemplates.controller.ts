import type { Request, Response, NextFunction } from 'express';
import { getIndustryTemplates, getGarmentStyles, createGarmentStyle } from './industryTemplates.service.js';

export async function handleGetTemplates(_req: Request, res: Response, next: NextFunction) {
  try {
    const templates = await getIndustryTemplates();
    res.json({ templates });
  } catch (err) {
    next(err);
  }
}

export async function handleGetGarmentStyles(_req: Request, res: Response, next: NextFunction) {
  try {
    const styles = await getGarmentStyles();
    res.json({ styles });
  } catch (err) {
    next(err);
  }
}

export async function handleCreateGarmentStyle(req: Request, res: Response, next: NextFunction) {
  try {
    const { styleCode, styleName, buyerName, colorSizeMatrix, cutQuantity, packedQuantity } = req.body ?? {};
    const style = await createGarmentStyle({
      styleCode: String(styleCode || `STY-${Date.now()}`),
      styleName: String(styleName || 'Apparel Style'),
      buyerName: String(buyerName || 'Buyer'),
      colorSizeMatrix: String(colorSizeMatrix || 'Standard Matrix'),
      cutQuantity: Number(cutQuantity || 0),
      packedQuantity: Number(packedQuantity || 0),
    });
    res.json({ ok: true, style });
  } catch (err) {
    next(err);
  }
}
