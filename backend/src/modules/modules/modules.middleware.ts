import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../../common/errors/AppError.js';
import { isModuleEnabledForTenant } from './modules.service.js';

export function requireModule(moduleCode: string) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.auth) {
        throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
      }

      // Platform admins override tenant module restrictions
      if (req.auth.user.isPlatformAdmin) {
        next();
        return;
      }

      const tenantId = req.auth.tenant?.id;
      if (!tenantId) {
        throw new AppError(400, 'Tenant context required for module access', 'TENANT_REQUIRED');
      }

      const enabled = await isModuleEnabledForTenant(tenantId, moduleCode);
      if (!enabled) {
        throw new AppError(
          403,
          `Module '${moduleCode}' is disabled for this tenant. Please upgrade or enable it in Settings.`,
          'MODULE_DISABLED',
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
