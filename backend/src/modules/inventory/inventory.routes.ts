import { Router } from 'express';
import { AppError } from '../../common/errors/AppError.js';

/** Section 7 — Inventory (stub) */
export const inventoryRouter = Router();

inventoryRouter.use((_req, _res, next) => {
  next(new AppError(501, 'Inventory module not implemented yet (Section 7)', 'NOT_IMPLEMENTED'));
});
