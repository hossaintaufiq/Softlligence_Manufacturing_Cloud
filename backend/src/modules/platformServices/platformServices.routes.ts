import { Router } from 'express';
import { requireAuth } from '../identity/identity.middleware.js';
import { checkTenantIpWhitelist } from '../../common/middleware/ipWhitelist.middleware.js';
import {
  handleGetNotifications,
  handleMarkRead,
  handleGetJobs,
  handleCreateJob,
  handleSearch,
} from './platformServices.controller.js';

export const platformServicesRouter = Router();

// Section 14 Platform Services Endpoints
platformServicesRouter.get('/notifications', requireAuth, checkTenantIpWhitelist, handleGetNotifications);
platformServicesRouter.post('/notifications/:id/read', requireAuth, checkTenantIpWhitelist, handleMarkRead);
platformServicesRouter.get('/jobs', requireAuth, checkTenantIpWhitelist, handleGetJobs);
platformServicesRouter.post('/jobs', requireAuth, checkTenantIpWhitelist, handleCreateJob);
platformServicesRouter.get('/search', requireAuth, checkTenantIpWhitelist, handleSearch);
