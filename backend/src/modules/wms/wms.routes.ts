import { Router } from 'express';
import { requireAuth } from '../identity/identity.middleware.js';
import { checkTenantIpWhitelist } from '../../common/middleware/ipWhitelist.middleware.js';
import { handleGetBins, handleGetGenealogy, handleGetValuation } from './wms.controller.js';

export const wmsRouter = Router();

wmsRouter.get('/bins', requireAuth, checkTenantIpWhitelist, handleGetBins);
wmsRouter.get('/traceability', requireAuth, checkTenantIpWhitelist, handleGetGenealogy);
wmsRouter.get('/valuation', requireAuth, checkTenantIpWhitelist, handleGetValuation);
