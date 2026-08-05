import type { NextFunction, Request, Response } from 'express';
import * as org from './organization.service.js';

function tenantId(req: Request): string {
  return req.auth!.user.tenantId!;
}

export async function listCompanies(req: Request, res: Response, next: NextFunction) {
  try {
    const companies = await org.listCompanies(tenantId(req));
    res.json({ companies });
  } catch (err) {
    next(err);
  }
}

export async function getCompany(req: Request, res: Response, next: NextFunction) {
  try {
    const company = await org.getCompany(tenantId(req), req.params.id);
    res.json({ company });
  } catch (err) {
    next(err);
  }
}

export async function createCompany(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, code, taxId, currency, addressJson, status } = req.body ?? {};
    const company = await org.createCompany(tenantId(req), {
      name: String(name ?? ''),
      code: String(code ?? ''),
      taxId,
      currency: currency === undefined ? undefined : String(currency),
      addressJson,
      status: status === undefined ? undefined : String(status),
    });
    res.status(201).json({ company });
  } catch (err) {
    next(err);
  }
}

export async function updateCompany(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, taxId, currency, addressJson, status } = req.body ?? {};
    const company = await org.updateCompany(tenantId(req), req.params.id, {
      name: name === undefined ? undefined : String(name),
      taxId,
      currency: currency === undefined ? undefined : String(currency),
      addressJson,
      status: status === undefined ? undefined : String(status),
    });
    res.json({ company });
  } catch (err) {
    next(err);
  }
}

export async function deleteCompany(req: Request, res: Response, next: NextFunction) {
  try {
    await org.softDeleteCompany(tenantId(req), req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function listFactories(req: Request, res: Response, next: NextFunction) {
  try {
    const companyId = typeof req.query.company_id === 'string' ? req.query.company_id : undefined;
    const factories = await org.listFactories(tenantId(req), companyId);
    res.json({ factories });
  } catch (err) {
    next(err);
  }
}

export async function getFactory(req: Request, res: Response, next: NextFunction) {
  try {
    const factory = await org.getFactory(tenantId(req), req.params.id);
    res.json({ factory });
  } catch (err) {
    next(err);
  }
}

export async function createFactory(req: Request, res: Response, next: NextFunction) {
  try {
    const { companyId, company_id, name, code, timezone, addressJson, status } = req.body ?? {};
    const factory = await org.createFactory(tenantId(req), {
      companyId: String(companyId ?? company_id ?? ''),
      name: String(name ?? ''),
      code: String(code ?? ''),
      timezone: timezone === undefined ? undefined : String(timezone),
      addressJson,
      status: status === undefined ? undefined : String(status),
    });
    res.status(201).json({ factory });
  } catch (err) {
    next(err);
  }
}

export async function updateFactory(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, timezone, addressJson, status } = req.body ?? {};
    const factory = await org.updateFactory(tenantId(req), req.params.id, {
      name: name === undefined ? undefined : String(name),
      timezone: timezone === undefined ? undefined : String(timezone),
      addressJson,
      status: status === undefined ? undefined : String(status),
    });
    res.json({ factory });
  } catch (err) {
    next(err);
  }
}

export async function deleteFactory(req: Request, res: Response, next: NextFunction) {
  try {
    await org.softDeleteFactory(tenantId(req), req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
