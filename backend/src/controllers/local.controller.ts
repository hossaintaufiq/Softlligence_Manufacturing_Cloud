import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { dbManager } from '../db/db';

export const getLocalOrders = (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.read();
  res.status(200).json({ success: true, count: db.local.orders.length, data: db.local.orders });
};

export const createLocalOrder = (req: AuthenticatedRequest, res: Response) => {
  const { invoiceNo, customerName, customerPhone, date, items, paymentMode = 'Cash', status = 'Paid' } = req.body;

  if (!invoiceNo || !customerName || !date || !items || !Array.isArray(items)) {
    return res.status(400).json({ success: false, error: 'Required fields missing or items format invalid.' });
  }

  const totalAmount = items.reduce((sum: number, item: any) => sum + (item.subtotal || (item.qty * item.unitPrice)), 0);

  const newOrder = dbManager.addLocalOrder({
    invoiceNo,
    customerName,
    customerPhone: customerPhone || '',
    date,
    items,
    totalAmount,
    paymentMode,
    status,
  });

  res.status(201).json({ success: true, message: 'POS order created.', data: newOrder });
};

export const getLocalInventory = (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.read();
  res.status(200).json({ success: true, count: db.local.inventory.length, data: db.local.inventory });
};

export const createLocalInventoryItem = (req: AuthenticatedRequest, res: Response) => {
  const { sku, name, category, costPrice, sellingPrice, stockQty } = req.body;

  if (!sku || !name || !category) {
    return res.status(400).json({ success: false, error: 'Required fields missing.' });
  }

  const newItem = dbManager.addLocalInventoryItem({
    sku,
    name,
    category,
    costPrice: parseFloat(costPrice || 0),
    sellingPrice: parseFloat(sellingPrice || 0),
    stockQty: parseInt(stockQty || 0, 10),
  });

  res.status(201).json({ success: true, message: 'Local store inventory item created.', data: newItem });
};
