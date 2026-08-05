# Section 5 — IAM (As-Built)

| Field | Value |
|-------|--------|
| **Document ID** | SMC-SEC-05 |
| **Plan section** | [`plan.md`](../../plan.md) § Section 5 |
| **Version** | 1.0.0 |
| **Status** | Done |
| **Date** | 2026-08-05 |
| **Upstream** | Section 4, Doc 02 §21, ADR-0012 |
| **Downstream** | Section 6 (Modules) |

---

## 1. Goals

- Invite users, roles, permissions  
- Factory scope  
- Server-enforced RBAC (ADR-0012)  

---

## 2. Outcome

| Item | Result |
|------|--------|
| Tables | `permission_catalog`, `role`, `role_permission`, `user_role`, `user_scope` + invite fields on `user_account` |
| APIs | `/users*`, `/roles*`, `/permissions`, `/auth/invites/accept` |
| Guard | `requirePermission(...)` on IAM + org routes |
| `/auth/me` | Returns `permissions[]` + `scopes.factories` |
| UI | `/iam`, `/invite` |
| Matrix | [`../seeds/permission_matrix.md`](../seeds/permission_matrix.md) |

---

## 3. Model notes

- Permissions are **platform catalog** rows (codes like `iam.user.read`).  
- Roles are **tenant-scoped**; system roles: `tenant_admin`, `tenant_viewer`.  
- `user_scope` with `scope_type=factory` limits context; **empty = all factories**.  
- Invite: `status=invited`, hashed one-time token, accept sets password → `active`.  

New tenants (platform create) auto-run `ensureTenantIamDefaults`.

---

## 4. Key endpoints

| Method | Path | Permission |
|--------|------|------------|
| GET/POST | `/users`, `/users/invites` | read / create / invite |
| POST | `/users/:id/deactivate` | deactivate |
| POST/DELETE | `/users/:id/roles…` | assign_role |
| PUT | `/users/:id/scopes` | scope.assign |
| CRUD | `/roles` + PUT permissions | role.read / manage |
| GET | `/permissions` | role.read |
| POST | `/auth/invites/accept` | public |

Org `/companies*` and `/factories*` now require `org.*.manage`.

---

## 5. Try it

1. Login `admin@demo.local` / `password123`  
2. Open http://localhost:3000/iam  
3. Invite a user → copy token → http://localhost:3000/invite  

---

## 6. Out of scope

Groups, ABAC policies, warehouse scopes, email delivery of invites.

---

## 7. Next

**Section 6 — Modules & Entitlements**

---

*End of SECTION_05_IAM*
