import { Router } from 'express';
import { AppError } from '../../common/errors/AppError.js';

/** Section 9 — Commercial (stub) */
export const commercialRouter = Router();

commercialRouter.use((_req, _res, next) => {
  next(new AppError(501, 'Commercial module not implemented yet (Section 9)', 'NOT_IMPLEMENTED'));
});
