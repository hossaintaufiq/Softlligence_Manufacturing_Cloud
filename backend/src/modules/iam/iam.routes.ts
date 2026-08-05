import { Router } from 'express';
import { AppError } from '../../common/errors/AppError.js';

/** Section 5 — IAM (stub) */
export const iamRouter = Router();

iamRouter.use((_req, _res, next) => {
  next(new AppError(501, 'IAM module not implemented yet (Section 5)', 'NOT_IMPLEMENTED'));
});
