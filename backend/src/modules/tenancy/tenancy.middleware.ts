import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../../common/errors/AppError.js';
import { requireAuth } from '../identity/identity.middleware.js';

export function requirePlatformAdmin(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, (err?: unknown) => {
    if (err) {
      next(err);
      return;
    }
    if (!req.auth?.user.isPlatformAdmin) {
      next(new AppError(403, 'Platform admin access required', 'FORBIDDEN'));
      return;
    }
    next();
  });
}
