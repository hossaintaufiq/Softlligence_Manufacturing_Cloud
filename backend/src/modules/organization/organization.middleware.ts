import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../../common/errors/AppError.js';
import { requireAuth } from '../identity/identity.middleware.js';

/** Tenant-scoped routes — user must belong to a tenant workspace. */
export function requireTenantUser(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, (err?: unknown) => {
    if (err) {
      next(err);
      return;
    }
    if (!req.auth?.user.tenantId) {
      next(new AppError(403, 'Tenant workspace required', 'FORBIDDEN'));
      return;
    }
    next();
  });
}
