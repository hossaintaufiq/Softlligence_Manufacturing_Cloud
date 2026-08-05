import type { Request } from 'express';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  status: string;
  tenantId: string | null;
};

export type AuthTenant = {
  id: string;
  slug: string;
  name: string;
  status: string;
  planCode: string | null;
};

export type AccessTokenPayload = {
  sub: string;
  tid: string | null;
  sid: string;
  email: string;
};

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      auth?: {
        user: AuthUser;
        tenant: AuthTenant | null;
        sessionId: string;
        payload: AccessTokenPayload;
      };
    }
  }
}

export {};
