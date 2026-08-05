import type { NextFunction, Request, Response } from 'express';
import * as iam from './iam.service.js';

function tenantId(req: Request): string {
  return req.auth!.user.tenantId!;
}

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ users: await iam.listUsers(tenantId(req)) });
  } catch (err) {
    next(err);
  }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ user: await iam.getUser(tenantId(req), req.params.id) });
  } catch (err) {
    next(err);
  }
}

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, name, password, roleIds } = req.body ?? {};
    const user = await iam.createUser(tenantId(req), {
      email: String(email ?? ''),
      name: String(name ?? ''),
      password: String(password ?? ''),
      roleIds: Array.isArray(roleIds) ? roleIds.map(String) : undefined,
    });
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
}

export async function inviteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, name, roleIds, factoryIds } = req.body ?? {};
    const result = await iam.inviteUser(tenantId(req), {
      email: String(email ?? ''),
      name: String(name ?? ''),
      roleIds: Array.isArray(roleIds) ? roleIds.map(String) : undefined,
      factoryIds: Array.isArray(factoryIds) ? factoryIds.map(String) : undefined,
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, status } = req.body ?? {};
    const user = await iam.updateUser(tenantId(req), req.params.id, {
      name: name === undefined ? undefined : String(name),
      status: status === undefined ? undefined : String(status),
    });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function deactivateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await iam.deactivateUser(tenantId(req), req.params.id, req.auth!.user.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function assignRoles(req: Request, res: Response, next: NextFunction) {
  try {
    const roleIds = Array.isArray(req.body?.roleIds) ? req.body.roleIds.map(String) : [];
    const user = await iam.assignRoles(tenantId(req), req.params.id, roleIds);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function removeRole(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await iam.removeRole(tenantId(req), req.params.id, req.params.roleId);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function setScopes(req: Request, res: Response, next: NextFunction) {
  try {
    const factoryIds = Array.isArray(req.body?.factoryIds) ? req.body.factoryIds.map(String) : [];
    const user = await iam.setUserScopes(tenantId(req), req.params.id, factoryIds);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function listRoles(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ roles: await iam.listRoles(tenantId(req)) });
  } catch (err) {
    next(err);
  }
}

export async function getRole(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ role: await iam.getRole(tenantId(req), req.params.id) });
  } catch (err) {
    next(err);
  }
}

export async function createRole(req: Request, res: Response, next: NextFunction) {
  try {
    const { code, name, description, permissionCodes } = req.body ?? {};
    const role = await iam.createRole(tenantId(req), {
      code: String(code ?? ''),
      name: String(name ?? ''),
      description: description === undefined ? undefined : String(description),
      permissionCodes: Array.isArray(permissionCodes) ? permissionCodes.map(String) : undefined,
    });
    res.status(201).json({ role });
  } catch (err) {
    next(err);
  }
}

export async function updateRole(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, description } = req.body ?? {};
    const role = await iam.updateRole(tenantId(req), req.params.id, {
      name: name === undefined ? undefined : String(name),
      description: description === undefined ? undefined : description,
    });
    res.json({ role });
  } catch (err) {
    next(err);
  }
}

export async function setRolePermissions(req: Request, res: Response, next: NextFunction) {
  try {
    const permissionCodes = Array.isArray(req.body?.permissionCodes)
      ? req.body.permissionCodes.map(String)
      : [];
    const role = await iam.setRolePermissions(tenantId(req), req.params.id, permissionCodes);
    res.json({ role });
  } catch (err) {
    next(err);
  }
}

export async function deleteRole(req: Request, res: Response, next: NextFunction) {
  try {
    await iam.deleteRole(tenantId(req), req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function listPermissions(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ permissions: await iam.listPermissions() });
  } catch (err) {
    next(err);
  }
}
