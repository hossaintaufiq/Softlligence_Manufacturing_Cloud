import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../../common/errors/AppError.js';
import { requireTenantUser } from '../organization/organization.middleware.js';
import { getUserPermissionCodes } from './iam.permissions.js';
import type { PermissionCode } from './permissions.catalog.js';

/** One lookup per request, reused by every guard on the route. */
async function loadPermissions(req: Request): Promise<Set<string>> {
  if (!req.auth) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
  if (!req.auth.permissions) {
    req.auth.permissions = new Set(await getUserPermissionCodes(req.auth.user.id));
  }
  return req.auth.permissions;
}

function guard(check: (granted: Set<string>) => AppError | null) {
  return (req: Request, res: Response, next: NextFunction) => {
    requireTenantUser(req, res, (err?: unknown) => {
      if (err) {
        next(err);
        return;
      }
      loadPermissions(req)
        .then((granted) => next(check(granted) ?? undefined))
        .catch(next);
    });
  };
}

export function requirePermission(...codes: PermissionCode[]) {
  return guard((granted) => {
    const missing = codes.find((code) => !granted.has(code));
    return missing ? new AppError(403, `Missing permission: ${missing}`, 'FORBIDDEN') : null;
  });
}

/** Any one of the listed permissions is enough. */
export function requireAnyPermission(...codes: PermissionCode[]) {
  return guard((granted) =>
    codes.some((code) => granted.has(code))
      ? null
      : new AppError(403, `Missing permission: one of [${codes.join(', ')}]`, 'FORBIDDEN'),
  );
}
