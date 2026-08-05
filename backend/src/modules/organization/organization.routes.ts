import { Router } from 'express';
import { AppError } from '../../common/errors/AppError.js';

/** Section 4 — Organization (stub) */
export const organizationRouter = Router();

organizationRouter.use((_req, _res, next) => {
  next(new AppError(501, 'Organization module not implemented yet (Section 4)', 'NOT_IMPLEMENTED'));
});
