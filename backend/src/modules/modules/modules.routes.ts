import { Router } from 'express';
import { requireAuth } from '../identity/identity.middleware.js';
import { requireTenantUser } from '../organization/organization.middleware.js';
import { requirePermission } from '../iam/iam.middleware.js';
import {
  handleCreateCustomField,
  handleDeleteCustomField,
  handleGetEntitlements,
  handleListCatalog,
  handleListCustomFields,
  handleListTenantModules,
  handleToggleModule,
} from './modules.controller.js';

export const modulesRouter = Router();
export const customFieldsRouter = Router();

// Modules API
modulesRouter.use(requireAuth);

modulesRouter.get('/catalog', handleListCatalog);
modulesRouter.get('/entitlements', requireTenantUser, handleGetEntitlements);
modulesRouter.get('/', requireTenantUser, requirePermission('modules.read'), handleListTenantModules);
modulesRouter.put('/:code', requireTenantUser, requirePermission('modules.manage'), handleToggleModule);

// Custom Fields API
customFieldsRouter.use(requireAuth, requireTenantUser);

customFieldsRouter.get('/', requirePermission('modules.read'), handleListCustomFields);
customFieldsRouter.post('/', requirePermission('custom_fields.manage'), handleCreateCustomField);
customFieldsRouter.delete('/:id', requirePermission('custom_fields.manage'), handleDeleteCustomField);
