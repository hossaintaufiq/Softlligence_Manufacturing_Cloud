import { Router } from 'express';
import { requireAuth } from '../identity/identity.middleware.js';
import { requireTenantUser } from '../organization/organization.middleware.js';
import { requireModule } from '../modules/modules.middleware.js';
import * as manufacturingCtrl from './manufacturing.controller.js';

export const manufacturingRouter = Router();

manufacturingRouter.use(requireAuth, requireTenantUser, requireModule('manufacturing'));

// Bill of Materials
manufacturingRouter.get('/boms', manufacturingCtrl.listBomsHandler);
manufacturingRouter.post('/boms', manufacturingCtrl.createBomHandler);

// Work Orders
manufacturingRouter.get('/work-orders', manufacturingCtrl.listWorkOrdersHandler);
manufacturingRouter.post('/work-orders', manufacturingCtrl.createWorkOrderHandler);
manufacturingRouter.put('/work-orders/:id/status', manufacturingCtrl.updateWorkOrderStatusHandler);

// Executions & Postings
manufacturingRouter.post('/material-issues', manufacturingCtrl.postMaterialIssueHandler);
manufacturingRouter.post('/production-outputs', manufacturingCtrl.postProductionOutputHandler);
manufacturingRouter.post('/scraps', manufacturingCtrl.postScrapLogHandler);
manufacturingRouter.post('/energy-logs', manufacturingCtrl.postEnergyLogHandler);

// Dashboard KPIs
manufacturingRouter.get('/kpis', manufacturingCtrl.getManufacturingKpisHandler);
