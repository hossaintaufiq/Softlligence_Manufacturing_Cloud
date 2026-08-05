import { Router } from 'express';
import { requirePermission } from '../iam/iam.middleware.js';
import { requireModule } from '../modules/modules.middleware.js';
import {
  createCompany,
  createFactory,
  deleteCompany,
  deleteFactory,
  getCompany,
  getFactory,
  listCompanies,
  listFactories,
  updateCompany,
  updateFactory,
} from './organization.controller.js';

/** Section 4 — Organization (Company + Factory) — permission-gated in Section 5 */
export const organizationRouter = Router();

organizationRouter.use(requireModule('org'));

organizationRouter.get('/companies', requirePermission('org.company.manage'), listCompanies);
organizationRouter.post('/companies', requirePermission('org.company.manage'), createCompany);
organizationRouter.get('/companies/:id', requirePermission('org.company.manage'), getCompany);
organizationRouter.patch('/companies/:id', requirePermission('org.company.manage'), updateCompany);
organizationRouter.delete('/companies/:id', requirePermission('org.company.manage'), deleteCompany);

organizationRouter.get('/factories', requirePermission('org.factory.manage'), listFactories);
organizationRouter.post('/factories', requirePermission('org.factory.manage'), createFactory);
organizationRouter.get('/factories/:id', requirePermission('org.factory.manage'), getFactory);
organizationRouter.patch('/factories/:id', requirePermission('org.factory.manage'), updateFactory);
organizationRouter.delete('/factories/:id', requirePermission('org.factory.manage'), deleteFactory);
