import { Router } from 'express';
import {
  login,
  logout,
  me,
  refresh,
  acceptInvite,
  handleMfaSetup,
  handleMfaVerify,
  handleListSessions,
  handleRevokeSession,
  handleGetAuditLogs,
} from './identity.controller.js';
import { requireAuth } from './identity.middleware.js';
import { authRateLimiter } from '../../common/middleware/rateLimiter.middleware.js';
import { checkTenantIpWhitelist } from '../../common/middleware/ipWhitelist.middleware.js';

export const identityRouter = Router();

// Public auth endpoints protected by Auth Rate Limiter
identityRouter.post('/login', authRateLimiter, login);
identityRouter.post('/refresh', authRateLimiter, refresh);
identityRouter.post('/logout', logout);
identityRouter.post('/invites/accept', acceptInvite);

// Authenticated session & identity routes with IP Whitelist enforcement
identityRouter.get('/me', requireAuth, checkTenantIpWhitelist, me);

// Section 13 — Enterprise Security Endpoints
identityRouter.post('/mfa/setup', requireAuth, checkTenantIpWhitelist, handleMfaSetup);
identityRouter.post('/mfa/verify', requireAuth, checkTenantIpWhitelist, handleMfaVerify);
identityRouter.get('/sessions', requireAuth, checkTenantIpWhitelist, handleListSessions);
identityRouter.delete('/sessions/:id', requireAuth, checkTenantIpWhitelist, handleRevokeSession);
identityRouter.get('/audit-logs', requireAuth, checkTenantIpWhitelist, handleGetAuditLogs);

