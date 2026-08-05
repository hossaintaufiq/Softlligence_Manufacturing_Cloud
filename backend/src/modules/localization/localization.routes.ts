import { Router } from 'express';
import { requireAuth } from '../identity/identity.middleware.js';
import { checkTenantIpWhitelist } from '../../common/middleware/ipWhitelist.middleware.js';
import { handleGetCurrencies, handleConvert } from './localization.controller.js';

export const localizationRouter = Router();

localizationRouter.get('/currencies', requireAuth, checkTenantIpWhitelist, handleGetCurrencies);
localizationRouter.post('/convert', requireAuth, checkTenantIpWhitelist, handleConvert);
