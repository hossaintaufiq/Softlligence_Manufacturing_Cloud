import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { dbManager } from '../db/db';

export const getGarmentOrders = (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.read();
  res.status(200).json({ success: true, count: db.garments.orders.length, data: db.garments.orders });
};

export const createGarmentOrder = (req: AuthenticatedRequest, res: Response) => {
  const { orderNo, buyerName, styleNo, itemType, quantityPcs, unitPriceUsd, targetShipDate, status = 'Pending' } = req.body;

  if (!orderNo || !buyerName || !styleNo || !itemType || !targetShipDate) {
    return res.status(400).json({ success: false, error: 'Required fields missing.' });
  }

  const newOrder = dbManager.addGarmentOrder({
    orderNo,
    buyerName,
    styleNo,
    itemType,
    quantityPcs: parseInt(quantityPcs, 10),
    unitPriceUsd: parseFloat(unitPriceUsd),
    targetShipDate,
    status,
  });

  res.status(201).json({ success: true, message: 'Garment merchandising order created.', data: newOrder });
};

export const getGarmentInventory = (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.read();
  res.status(200).json({ success: true, count: db.garments.inventory.length, data: db.garments.inventory });
};

export const createGarmentInventoryItem = (req: AuthenticatedRequest, res: Response) => {
  const { materialCode, description, category, stockQty, unit, reorderLevel } = req.body;

  if (!materialCode || !description || !category || !unit) {
    return res.status(400).json({ success: false, error: 'Required fields missing.' });
  }

  const newItem = dbManager.addGarmentInventoryItem({
    materialCode,
    description,
    category,
    stockQty: parseFloat(stockQty || 0),
    unit,
    reorderLevel: parseFloat(reorderLevel || 0),
  });

  res.status(201).json({ success: true, message: 'Garment material item created.', data: newItem });
};
