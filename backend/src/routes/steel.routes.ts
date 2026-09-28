import { Router } from 'express';
import {
  getOverviewSummary,
  getScrap,
  createScrap,
  getFurnace,
  createFurnace,
  getBillet,
  createBillet,
  getRolling,
  createRolling,
  getDispatch,
  createDispatch,
  getDowntime,
  createDowntime,
  getEnergy,
  createEnergy,
  getWeighbridge,
  createWeighbridge,
  getQuality,
  createQuality,
  getInventory,
  updateInventory,
  getExpenses,
  createExpense,
  getShifts,
  createShift,
} from '../controllers/steel.controller';
import { optionalAuthMiddleware } from '../middlewares/auth';
import { tenantMiddleware } from '../middlewares/tenant';

const router = Router();

// Apply optional auth & tenant middleware
router.use(optionalAuthMiddleware, tenantMiddleware);

// Overview & Telemetry Metrics
router.get('/overview', getOverviewSummary);

// 1. Scrap Sourcing
router.get('/scrap', getScrap);
router.post('/scrap', createScrap);

// 2. Furnace Log
router.get('/furnace', getFurnace);
router.post('/furnace', createFurnace);

// 3. CCM Billet Casting
router.get('/billet', getBillet);
router.post('/billet', createBillet);

// 4. Re-Rolling Mill
router.get('/rolling', getRolling);
router.post('/rolling', createRolling);

// 5. Sales & Dispatch
router.get('/dispatch', getDispatch);
router.post('/dispatch', createDispatch);

// 6. Downtime Tracker
router.get('/downtime', getDowntime);
router.post('/downtime', createDowntime);

// 7. Power & Utilities
router.get('/energy', getEnergy);
router.post('/energy', createEnergy);

// 8. Weighbridge Gate
router.get('/weighbridge', getWeighbridge);
router.post('/weighbridge', createWeighbridge);

// 9. QA Spectrometer Lab
router.get('/quality', getQuality);
router.post('/quality', createQuality);

// 10. Yard Inventory
router.get('/inventory', getInventory);
router.put('/inventory', updateInventory);

// 11. Ledger Expenses
router.get('/expenses', getExpenses);
router.post('/expenses', createExpense);

// 12. HRMS Shifts
router.get('/shifts', getShifts);
router.post('/shifts', createShift);

export default router;
