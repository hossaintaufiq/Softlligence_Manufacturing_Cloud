import { Router } from 'express';
import {
  getGarmentOrders,
  createGarmentOrder,
  getGarmentInventory,
  createGarmentInventoryItem,
} from '../controllers/garments.controller';
import { optionalAuthMiddleware } from '../middlewares/auth';
import { tenantMiddleware } from '../middlewares/tenant';

const router = Router();

router.use(optionalAuthMiddleware, tenantMiddleware);

// Merchandising Orders
router.get('/orders', getGarmentOrders);
router.post('/orders', createGarmentOrder);

// Raw Materials Inventory
router.get('/inventory', getGarmentInventory);
router.post('/inventory', createGarmentInventoryItem);

export default router;
