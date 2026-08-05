import { Router } from 'express';
import { requireAuth } from '../identity/identity.middleware.js';
import { checkTenantIpWhitelist } from '../../common/middleware/ipWhitelist.middleware.js';
import { handleCalculateLandedCost, handleGetGatePasses, handleCreateGatePass } from './logistics.controller.js';

export const logisticsRouter = Router();

logisticsRouter.post('/landed-cost', requireAuth, checkTenantIpWhitelist, handleCalculateLandedCost);
logisticsRouter.get('/gate-passes', requireAuth, checkTenantIpWhitelist, handleGetGatePasses);
logisticsRouter.post('/gate-passes', requireAuth, checkTenantIpWhitelist, handleCreateGatePass);
