import { Router } from 'express';
import { requireAuth } from '../identity/identity.middleware.js';
import { checkTenantIpWhitelist } from '../../common/middleware/ipWhitelist.middleware.js';
import { handleGetApiKeys, handleCreateApiKey, handleGetWebhooks, handleCreateWebhook } from './developerPlatform.controller.js';

export const developerPlatformRouter = Router();

developerPlatformRouter.get('/keys', requireAuth, checkTenantIpWhitelist, handleGetApiKeys);
developerPlatformRouter.post('/keys', requireAuth, checkTenantIpWhitelist, handleCreateApiKey);
developerPlatformRouter.get('/webhooks', requireAuth, checkTenantIpWhitelist, handleGetWebhooks);
developerPlatformRouter.post('/webhooks', requireAuth, checkTenantIpWhitelist, handleCreateWebhook);
