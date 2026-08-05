import { Router } from 'express';
import { requireAuth } from '../identity/identity.middleware.js';
import { requireTenantUser } from '../organization/organization.middleware.js';
import * as commercialCtrl from './commercial.controller.js';

export const commercialRouter = Router();

commercialRouter.use(requireAuth, requireTenantUser);

// Parties (Customers & Suppliers)
commercialRouter.get('/parties', commercialCtrl.listPartiesHandler);
commercialRouter.post('/parties', commercialCtrl.createPartyHandler);

// Procurement (POs & GRNs)
commercialRouter.get('/purchase-orders', commercialCtrl.listPurchaseOrdersHandler);
commercialRouter.post('/purchase-orders', commercialCtrl.createPurchaseOrderHandler);
commercialRouter.get('/grns', commercialCtrl.listGrnsHandler);
commercialRouter.post('/grns', commercialCtrl.postGrnHandler);

// Sales & Dispatches
commercialRouter.get('/sales-orders', commercialCtrl.listSalesOrdersHandler);
commercialRouter.post('/sales-orders', commercialCtrl.createSalesOrderHandler);
commercialRouter.get('/dispatches', commercialCtrl.listDispatchesHandler);
commercialRouter.post('/dispatches', commercialCtrl.postDispatchHandler);

// Commercial Analytics & KPIs
commercialRouter.get('/kpis', commercialCtrl.getCommercialKpisHandler);
