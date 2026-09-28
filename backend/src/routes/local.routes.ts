import { Router } from 'express';
import {
  getLocalOrders,
  createLocalOrder,
  getLocalInventory,
  createLocalInventoryItem,
} from '../controllers/local.controller';
import { optionalAuthMiddleware } from '../middlewares/auth';
import { tenantMiddleware } from '../middlewares/tenant';

const router = Router();

router.use(optionalAuthMiddleware, tenantMiddleware);

// POS & Retail Orders
router.get('/orders', getLocalOrders);
router.post('/orders', createLocalOrder);

// Store Inventory
router.get('/inventory', getLocalInventory);
router.post('/inventory', createLocalInventoryItem);

export default router;
