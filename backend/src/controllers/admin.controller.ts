import { Response } from 'express';
import { AuthenticatedRequest, Tenant } from '../types';
import { dbManager } from '../db/db';

export const getSystemStats = (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.read();

  const stats = {
    totalTenants: db.tenants.length,
    activeTenants: db.tenants.filter(t => t.status === 'active').length,
    totalUsers: db.users.length,
    totalSteelRecords:
      db.steel.scrap.length +
      db.steel.furnace.length +
      db.steel.billet.length +
      db.steel.rolling.length +
      db.steel.dispatch.length +
      db.steel.downtime.length +
      db.steel.energy.length +
      db.steel.weighbridge.length +
      db.steel.quality.length +
      db.steel.expenses.length +
      db.steel.shifts.length,
    totalGarmentOrders: db.garments.orders.length,
    totalLocalOrders: db.local.orders.length,
  };

  res.status(200).json({ success: true, data: stats });
};

export const getTenants = (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.read();
  res.status(200).json({ success: true, count: db.tenants.length, data: db.tenants });
};

export const createTenant = (req: AuthenticatedRequest, res: Response) => {
  const { name, slug, planCode = 'Standard', businessType = 'steel' } = req.body;

  if (!name || !slug) {
    return res.status(400).json({ success: false, error: 'Name and slug are required.' });
  }

  const db = dbManager.read();
  if (db.tenants.some(t => t.id === slug || t.slug === slug)) {
    return res.status(409).json({ success: false, error: `Tenant slug '${slug}' already exists.` });
  }

  const newTenant: Tenant = {
    id: slug,
    name,
    slug,
    status: 'active',
    planCode,
    businessType,
    createdAt: new Date().toISOString().split('T')[0],
  };

  db.tenants.push(newTenant);
  dbManager.write(db);

  res.status(201).json({ success: true, message: 'Tenant created successfully.', data: newTenant });
};

export const updateTenant = (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, status, planCode, businessType } = req.body;

  const db = dbManager.read();
  const tenant = db.tenants.find(t => t.id === id || t.slug === id);

  if (!tenant) {
    return res.status(404).json({ success: false, error: `Tenant '${id}' not found.` });
  }

  if (name) tenant.name = name;
  if (status) tenant.status = status;
  if (planCode) tenant.planCode = planCode;
  if (businessType) tenant.businessType = businessType;

  dbManager.write(db);

  res.status(200).json({ success: true, message: 'Tenant updated successfully.', data: tenant });
};

export const exportDatabase = (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.read();
  res.status(200).json({ success: true, data: db });
};

export const resetDatabase = (req: AuthenticatedRequest, res: Response) => {
  const freshSeeds = dbManager.resetToSeeds();
  res.status(200).json({ success: true, message: 'Database successfully reset to initial seed state.', data: freshSeeds });
};
