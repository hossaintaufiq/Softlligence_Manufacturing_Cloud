import type { NextFunction, Request, Response } from 'express';
import { onboardTenant } from './onboarding.service.js';
import { setAuthCookies } from '../identity/identity.crypto.js';

export async function registerOnboarding(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      companyName,
      companyCode,
      currency,
      industry,
      email,
      passwordPlane,
      planCode,
      factoryName,
      factoryCode,
      timezone,
    } = req.body ?? {};

    const bundle = await onboardTenant({
      companyName: String(companyName ?? ''),
      companyCode: String(companyCode ?? ''),
      currency: String(currency ?? 'USD'),
      industry: String(industry ?? 'Steel'),
      email: String(email ?? ''),
      passwordPlane: String(passwordPlane ?? ''),
      planCode: String(planCode ?? 'trial'),
      factoryName: String(factoryName ?? ''),
      factoryCode: String(factoryCode ?? ''),
      timezone: String(timezone ?? 'UTC'),
      userAgent: req.get('user-agent') ?? undefined,
      ipAddress: req.ip,
    });

    setAuthCookies(res, bundle.accessToken, bundle.refreshToken);

    res.json({
      access_token: bundle.accessToken,
      token_type: 'Bearer',
      expires_in: bundle.expiresIn,
      user: bundle.user,
      tenant: bundle.tenant,
    });
  } catch (err) {
    next(err);
  }
}
