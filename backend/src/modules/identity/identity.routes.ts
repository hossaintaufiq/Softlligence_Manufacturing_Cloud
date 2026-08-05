import { Router } from 'express';
import { login, logout, me, refresh } from './identity.controller.js';
import { requireAuth } from './identity.middleware.js';

/** Section 2 — Identity & Auth */
export const identityRouter = Router();

identityRouter.post('/login', login);
identityRouter.post('/refresh', refresh);
identityRouter.post('/logout', logout);
identityRouter.get('/me', requireAuth, me);
