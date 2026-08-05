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
import { registerOnboarding } from './onboarding.controller.js';

export const platformTenancyRouter = Router();

// Public onboarding wizard endpoint
platformTenancyRouter.post('/tenants/onboarding', registerOnboarding);

// Protected super admin endpoints
platformTenancyRouter.use(requirePlatformAdmin);

platformTenancyRouter.get('/tenants', listTenants);
platformTenancyRouter.post('/tenants', createTenant);
platformTenancyRouter.get('/tenants/:id', getTenant);
platformTenancyRouter.patch('/tenants/:id', updateTenant);
platformTenancyRouter.post('/tenants/:id/suspend', suspendTenant);
platformTenancyRouter.post('/tenants/:id/reactivate', reactivateTenant);
