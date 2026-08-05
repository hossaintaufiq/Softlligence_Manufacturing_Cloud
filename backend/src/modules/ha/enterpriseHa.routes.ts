import { Router } from 'express';
import { requireAuth } from '../identity/identity.middleware.js';
import { checkTenantIpWhitelist } from '../../common/middleware/ipWhitelist.middleware.js';
import { handleGetHaHealth, handleTriggerSnapshot } from './enterpriseHa.controller.js';

export const enterpriseHaRouter = Router();

enterpriseHaRouter.get('/health', requireAuth, checkTenantIpWhitelist, handleGetHaHealth);
enterpriseHaRouter.post('/snapshot', requireAuth, checkTenantIpWhitelist, handleTriggerSnapshot);
