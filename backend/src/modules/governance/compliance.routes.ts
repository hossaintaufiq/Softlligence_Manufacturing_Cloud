import { Router } from 'express';
import { requireAuth } from '../identity/identity.middleware.js';
import { checkTenantIpWhitelist } from '../../common/middleware/ipWhitelist.middleware.js';
import { handleGetCompliance, handleCreateESignature } from './compliance.controller.js';

export const complianceRouter = Router();

complianceRouter.get('/records', requireAuth, checkTenantIpWhitelist, handleGetCompliance);
complianceRouter.post('/esignature', requireAuth, checkTenantIpWhitelist, handleCreateESignature);
