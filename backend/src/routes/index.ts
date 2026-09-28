import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import steelRoutes from './steel.routes';
import garmentsRoutes from './garments.routes';
import localRoutes from './local.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/steel', steelRoutes);
router.use('/garments', garmentsRoutes);
router.use('/local', localRoutes);
router.use('/admin', adminRoutes);

export default router;
