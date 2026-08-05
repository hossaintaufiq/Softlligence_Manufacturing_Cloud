import { Router } from 'express';
import { requireAuth } from '../identity/identity.middleware.js';
import { checkTenantIpWhitelist } from '../../common/middleware/ipWhitelist.middleware.js';
import { handleGetKpis, handleGenerateReport, handleExportReportCsv } from './analytics.controller.js';

export const analyticsRouter = Router();

analyticsRouter.get('/kpis', requireAuth, checkTenantIpWhitelist, handleGetKpis);
analyticsRouter.post('/report', requireAuth, checkTenantIpWhitelist, handleGenerateReport);
analyticsRouter.get('/export', requireAuth, checkTenantIpWhitelist, handleExportReportCsv);
