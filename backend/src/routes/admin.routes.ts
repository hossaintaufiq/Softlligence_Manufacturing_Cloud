import { Router } from 'express';
import {
  getSystemStats,
  getTenants,
  createTenant,
  updateTenant,
  exportDatabase,
  resetDatabase,
} from '../controllers/admin.controller';
import { authMiddleware, requireSuperAdmin } from '../middlewares/auth';

const router = Router();

// In development/demo, we can allow open access or require super-admin
router.get('/stats', getSystemStats);
router.get('/tenants', getTenants);
router.post('/tenants', createTenant);
router.patch('/tenants/:id', updateTenant);
router.get('/db/export', exportDatabase);
router.post('/db/reset', resetDatabase);

export default router;
