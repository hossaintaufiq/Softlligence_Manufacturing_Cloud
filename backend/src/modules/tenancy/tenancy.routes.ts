import { Router } from 'express';
import { AppError } from '../../common/errors/AppError.js';

/** Section 3 — Tenancy (stub) */
export const tenancyRouter = Router();

tenancyRouter.use((_req, _res, next) => {
  next(new AppError(501, 'Tenancy module not implemented yet (Section 3)', 'NOT_IMPLEMENTED'));
});
