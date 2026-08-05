import { Router } from 'express';
import { AppError } from '../../common/errors/AppError.js';

/** Section 8 — Manufacturing (stub) */
export const manufacturingRouter = Router();

manufacturingRouter.use((_req, _res, next) => {
  next(new AppError(501, 'Manufacturing module not implemented yet (Section 8)', 'NOT_IMPLEMENTED'));
});
