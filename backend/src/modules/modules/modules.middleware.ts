import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../../common/errors/AppError.js';
import { requireTenantUser } from '../organization/organization.middleware.js';
import { getTenantEntitlements } from './modules.service.js';

async function loadEntitlements(req: Request): Promise<Set<string>> {
  if (!req.auth) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

  if (!req.auth.entitlements) {
    if (req.auth.user.isPlatformAdmin) {
      req.auth.entitlements = new Set(['org', 'iam', 'inventory', 'manufacturing', 'commercial', 'steel']);
    } else {
      const tenantId = req.auth.user.tenantId;
      req.auth.entitlements = tenantId
        ? new Set(await getTenantEntitlements(tenantId))
        : new Set();
    }
  }

  return req.auth.entitlements;
}

export function requireModule(moduleCode: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    requireTenantUser(req, res, (err?: unknown) => {
      if (err) {
        next(err);
        return;
      }

      loadEntitlements(req)
        .then((enabled) => {
          if (!enabled.has(moduleCode)) {
            next(
              new AppError(
                403,
                `Module '${moduleCode}' is disabled for this tenant. Enable it under Modules & Entitlements.`,
                'MODULE_DISABLED',
              ),
            );
            return;
          }
          next();
        })
        .catch(next);
    });
  };
}
