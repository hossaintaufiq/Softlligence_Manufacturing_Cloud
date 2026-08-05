import { Router } from 'express';
import { requireAuth } from '../identity/identity.middleware.js';
import { checkTenantIpWhitelist } from '../../common/middleware/ipWhitelist.middleware.js';
import { handleGetMachines, handleLogDowntime, handleGetQms, handleCreateQms } from './mes.controller.js';

export const mesRouter = Router();

mesRouter.get('/machines', requireAuth, checkTenantIpWhitelist, handleGetMachines);
mesRouter.post('/downtime', requireAuth, checkTenantIpWhitelist, handleLogDowntime);
mesRouter.get('/qms', requireAuth, checkTenantIpWhitelist, handleGetQms);
mesRouter.post('/qms', requireAuth, checkTenantIpWhitelist, handleCreateQms);
