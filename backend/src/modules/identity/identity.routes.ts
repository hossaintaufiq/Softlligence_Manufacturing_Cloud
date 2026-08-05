import { Router } from 'express';
import { AppError } from '../../common/errors/AppError.js';

/** Section 2 — Identity & Auth (stub) */
export const identityRouter = Router();

identityRouter.use((_req, _res, next) => {
  next(new AppError(501, 'Identity module not implemented yet (Section 2)', 'NOT_IMPLEMENTED'));
});
