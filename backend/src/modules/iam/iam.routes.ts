import { Router } from 'express';
import { requirePermission } from './iam.middleware.js';
import * as ctrl from './iam.controller.js';

/** Section 5 — IAM (mounted at /api/v1) */
export const iamRouter = Router();

iamRouter.get('/users', requirePermission('iam.user.read'), ctrl.listUsers);
iamRouter.post('/users', requirePermission('iam.user.create'), ctrl.createUser);
iamRouter.post('/users/invites', requirePermission('iam.user.invite'), ctrl.inviteUser);
iamRouter.get('/users/:id', requirePermission('iam.user.read'), ctrl.getUser);
iamRouter.patch('/users/:id', requirePermission('iam.user.update'), ctrl.updateUser);
iamRouter.post('/users/:id/deactivate', requirePermission('iam.user.deactivate'), ctrl.deactivateUser);
iamRouter.post('/users/:id/roles', requirePermission('iam.user.assign_role'), ctrl.assignRoles);
iamRouter.delete('/users/:id/roles/:roleId', requirePermission('iam.user.assign_role'), ctrl.removeRole);
iamRouter.put('/users/:id/scopes', requirePermission('iam.scope.assign'), ctrl.setScopes);

iamRouter.get('/roles', requirePermission('iam.role.read'), ctrl.listRoles);
iamRouter.post('/roles', requirePermission('iam.role.manage'), ctrl.createRole);
iamRouter.get('/roles/:id', requirePermission('iam.role.read'), ctrl.getRole);
iamRouter.patch('/roles/:id', requirePermission('iam.role.manage'), ctrl.updateRole);
iamRouter.put('/roles/:id/permissions', requirePermission('iam.role.manage'), ctrl.setRolePermissions);
iamRouter.delete('/roles/:id', requirePermission('iam.role.manage'), ctrl.deleteRole);

iamRouter.get('/permissions', requirePermission('iam.role.read'), ctrl.listPermissions);
