import { Router } from 'express';
import { requireAuth } from '../identity/identity.middleware.js';
import { checkTenantIpWhitelist } from '../../common/middleware/ipWhitelist.middleware.js';
import { handleGetTemplates, handleGetGarmentStyles, handleCreateGarmentStyle } from './industryTemplates.controller.js';

export const industryTemplatesRouter = Router();

industryTemplatesRouter.get('/templates', requireAuth, checkTenantIpWhitelist, handleGetTemplates);
industryTemplatesRouter.get('/garments/styles', requireAuth, checkTenantIpWhitelist, handleGetGarmentStyles);
industryTemplatesRouter.post('/garments/styles', requireAuth, checkTenantIpWhitelist, handleCreateGarmentStyle);
