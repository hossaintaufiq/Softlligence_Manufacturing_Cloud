import { Router } from 'express';
import { requireTenantUser } from './organization.middleware.js';
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

/** Section 4 — Organization (Company + Factory) */
export const organizationRouter = Router();

organizationRouter.use(requireTenantUser);

organizationRouter.get('/companies', listCompanies);
organizationRouter.post('/companies', createCompany);
organizationRouter.get('/companies/:id', getCompany);
organizationRouter.patch('/companies/:id', updateCompany);
organizationRouter.delete('/companies/:id', deleteCompany);

organizationRouter.get('/factories', listFactories);
organizationRouter.post('/factories', createFactory);
organizationRouter.get('/factories/:id', getFactory);
organizationRouter.patch('/factories/:id', updateFactory);
organizationRouter.delete('/factories/:id', deleteFactory);
