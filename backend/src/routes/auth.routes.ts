import { Router } from 'express';
import { login, register, getMe, updateProfile, getTenants } from '../controllers/auth.controller';
import { authMiddleware, optionalAuthMiddleware } from '../middlewares/auth';

const router = Router();

// Public routes
router.post('/login', login);
router.post('/register', register);
router.get('/tenants', getTenants);

// Protected routes
router.get('/me', authMiddleware, getMe);
router.patch('/profile', authMiddleware, updateProfile);

export default router;
