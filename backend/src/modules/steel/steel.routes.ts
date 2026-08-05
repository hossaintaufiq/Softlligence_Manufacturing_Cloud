import { Router } from 'express';
import { requireAuth } from '../identity/identity.middleware.js';
import { requireTenantUser } from '../organization/organization.middleware.js';
import * as steelCtrl from './steel.controller.js';

export const steelRouter = Router();

steelRouter.use(requireAuth, requireTenantUser);

// Steel Scrap Receiving
steelRouter.get('/scrap-receipts', steelCtrl.listScrapReceiptsHandler);
steelRouter.post('/scrap-receipts', steelCtrl.createScrapReceiptHandler);

// Steel Furnace Heat Logs
steelRouter.get('/heats', steelCtrl.listHeatLogsHandler);
steelRouter.post('/heats', steelCtrl.createHeatLogHandler);

// Steel Rolling Mill Logs
steelRouter.get('/rolling', steelCtrl.listRollingLogsHandler);
steelRouter.post('/rolling', steelCtrl.createRollingLogHandler);

// Steel Batch Import Wizard
steelRouter.post('/import', steelCtrl.importSteelBatchHandler);

// Steel Yield & Efficiency Analytics
steelRouter.get('/kpis', steelCtrl.getSteelKpisHandler);
