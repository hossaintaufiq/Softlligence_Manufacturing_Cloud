# Permission Matrix — Phase 1 (Section 5)

| Code | Module | Used by |
|------|--------|---------|
| `iam.user.read` | iam | `GET /users`, `GET /users/:id` |
| `iam.user.create` | iam | `POST /users` |
| `iam.user.update` | iam | `PATCH /users/:id` |
| `iam.user.deactivate` | iam | `POST /users/:id/deactivate` |
| `iam.user.invite` | iam | `POST /users/invites` |
| `iam.user.assign_role` | iam | assign/remove roles |
| `iam.scope.assign` | iam | `PUT /users/:id/scopes` |
| `iam.role.read` | iam | roles + permission catalog list |
| `iam.role.manage` | iam | create/update/delete roles, set permissions |
| `org.company.manage` | org | `/companies*` |
| `org.factory.manage` | org | `/factories*` |

## Default roles

| Role code | Permissions |
|-----------|-------------|
| `tenant_admin` | All Phase 1 codes above |
| `tenant_viewer` | `iam.user.read`, `iam.role.read` |

Platform Super Admin (`isPlatformAdmin`) bypasses tenant permission checks on platform routes; `/auth/me` returns `permissions: ["*"]`.

UI never elevates privileges (ADR-0012) — missing permission → API `403`.
