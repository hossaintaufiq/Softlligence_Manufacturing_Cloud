import type { NextFunction, Request, Response } from 'express';
import * as tenancyService from './tenancy.service.js';

export async function listTenants(_req: Request, res: Response, next: NextFunction) {
  try {
    const tenants = await tenancyService.listTenants();
    res.json({ tenants });
  } catch (err) {
    next(err);
  }
}

export async function getTenant(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant = await tenancyService.getTenant(req.params.id);
    res.json({ tenant });
  } catch (err) {
    next(err);
  }
}

export async function createTenant(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug, name, planCode, status } = req.body ?? {};
    const tenant = await tenancyService.createTenant({
      slug: String(slug ?? ''),
      name: String(name ?? ''),
      planCode: planCode === undefined ? undefined : planCode,
      status: status === undefined ? undefined : String(status),
    });
    res.status(201).json({ tenant });
  } catch (err) {
    next(err);
  }
}

export async function updateTenant(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, planCode } = req.body ?? {};
    const tenant = await tenancyService.updateTenant(req.params.id, {
      name: name === undefined ? undefined : String(name),
      planCode: planCode === undefined ? undefined : planCode,
    });
    res.json({ tenant });
  } catch (err) {
    next(err);
  }
}

export async function suspendTenant(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant = await tenancyService.suspendTenant(req.params.id);
    res.json({ tenant });
  } catch (err) {
    next(err);
  }
}

export async function reactivateTenant(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant = await tenancyService.reactivateTenant(req.params.id);
    res.json({ tenant });
  } catch (err) {
    next(err);
  }
}
