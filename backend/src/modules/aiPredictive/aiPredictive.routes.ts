import { Router } from 'express';
import { requireAuth } from '../identity/identity.middleware.js';
import { checkTenantIpWhitelist } from '../../common/middleware/ipWhitelist.middleware.js';
import { handleGetPredictiveAlerts, handleAiAssistantQuery } from './aiPredictive.controller.js';

export const aiPredictiveRouter = Router();

aiPredictiveRouter.get('/alerts', requireAuth, checkTenantIpWhitelist, handleGetPredictiveAlerts);
aiPredictiveRouter.post('/query', requireAuth, checkTenantIpWhitelist, handleAiAssistantQuery);
