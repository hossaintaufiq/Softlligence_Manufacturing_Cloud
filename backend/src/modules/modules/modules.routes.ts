import { Router } from 'express';
import { AppError } from '../../common/errors/AppError.js';

/** Section 6 — Modules & Entitlements (stub) */
export const modulesRouter = Router();

modulesRouter.use((_req, _res, next) => {
  next(new AppError(501, 'Modules catalog not implemented yet (Section 6)', 'NOT_IMPLEMENTED'));
});
