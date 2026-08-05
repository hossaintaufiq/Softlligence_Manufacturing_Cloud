import { Router } from 'express';
import { requirePlatformAdmin } from './tenancy.middleware.js';
import {
  createTenant,
  getTenant,
  listTenants,
  reactivateTenant,
  suspendTenant,
  updateTenant,
} from './tenancy.controller.js';

/** Section 3 — Platform tenancy (Super Admin) */
export const platformTenancyRouter = Router();

platformTenancyRouter.use(requirePlatformAdmin);

platformTenancyRouter.get('/tenants', listTenants);
platformTenancyRouter.post('/tenants', createTenant);
platformTenancyRouter.get('/tenants/:id', getTenant);
platformTenancyRouter.patch('/tenants/:id', updateTenant);
platformTenancyRouter.post('/tenants/:id/suspend', suspendTenant);
platformTenancyRouter.post('/tenants/:id/reactivate', reactivateTenant);
