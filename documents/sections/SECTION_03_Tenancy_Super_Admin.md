# Section 3 — Tenancy & Super Admin (As-Built)

| Field | Value |
|-------|--------|
| **Document ID** | SMC-SEC-03 |
| **Plan section** | [`plan.md`](../../plan.md) § Section 3 |
| **Version** | 1.0.0 |
| **Status** | Done |
| **Date** | 2026-08-05 |
| **Owner** | Softlligence Technologies — Engineering |
| **Upstream** | Section 2, Doc 03 §37, PHASE_1_SCOPE |
| **Downstream** | Section 4 (Organization) |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-08-05 | Softlligence Engineering | Platform tenants CRUD, suspend/reactivate, Super Admin UI |

---

## 1. Goals (plan)

- Tenant CRUD  
- Status active / suspended (also `trial` on create)  
- Super Admin portal (minimal)  
- Billing = **stubs only** (`planCode` on tenant)  

---

## 2. Outcome summary

| Item | Result |
|------|--------|
| Schema | `user_account.is_platform_admin` |
| Routes | `/api/v1/platform/tenants*` (API-PLATFORM-*) |
| Guard | `requirePlatformAdmin` |
| UI | `/admin` Super Admin shell + tenant table |
| Seed | `superadmin@softlligence.local` (platform) |
| Billing | `planCode` editable stub only |

---

## 3. Data model changes

Migration: `20260805010000_platform_admin`

| Column | Table | Notes |
|--------|-------|-------|
| `is_platform_admin` | `user_account` | `BOOLEAN NOT NULL DEFAULT false` |
| Index on `email` | `user_account` | Faster login lookup |

Platform Super Admin users have `tenant_id = null` and `is_platform_admin = true`.

`/auth/me` and login payloads now include `user.isPlatformAdmin`.

---

## 4. API (platform)

All require authenticated **platform admin**.

| Method | Path | Behavior |
|--------|------|----------|
| `GET` | `/api/v1/platform/tenants` | List non-deleted tenants |
| `POST` | `/api/v1/platform/tenants` | Create `{ slug, name, planCode?, status? }` → `201` |
| `GET` | `/api/v1/platform/tenants/:id` | Get one |
| `PATCH` | `/api/v1/platform/tenants/:id` | Update `name`, `planCode` (billing stub) |
| `POST` | `/api/v1/platform/tenants/:id/suspend` | Set `status=suspended` |
| `POST` | `/api/v1/platform/tenants/:id/reactivate` | Set `status=active` |

Slug rules: lowercase alphanumeric + hyphens, max 64.  
Non-platform users receive **403**.

Files:

```
backend/src/modules/tenancy/
  tenancy.routes.ts      # mounted at /platform
  tenancy.controller.ts
  tenancy.service.ts
  tenancy.middleware.ts
```

---

## 5. Frontend

| Route | Role |
|-------|------|
| `/admin` | Super Admin shell — gated by `isPlatformAdmin` |
| Home session panel | Link “Open Super Admin” when platform |

Components: `TenantAdminPanel` — create, list, edit plan blur-save, suspend/reactivate.

API client: `src/lib/api/tenants.ts`.

---

## 6. Seed credentials

| User | Email | Password env | Role |
|------|-------|--------------|------|
| Tenant admin | `admin@demo.local` | `SEED_DEMO_PASSWORD` (default `password123`) | Tenant user |
| Super Admin | `superadmin@softlligence.local` | `SEED_PLATFORM_PASSWORD` (default `platform123`) | Platform |

Passwords are **not** in the frontend bundle.

---

## 7. Verification

| Check | Result |
|-------|--------|
| Platform login + `isPlatformAdmin` | true |
| List / create / suspend / reactivate | OK |
| Tenant admin → platform list | 403 |
| Frontend typecheck | Pass |
| Backend typecheck / build | Pass |

---

## 8. Out of scope

| Topic | When |
|-------|------|
| Impersonate tenant | Later |
| Hard delete / pending_delete workflow | Later |
| Real billing / Stripe | Later |
| Company / Factory org tree | Section 4 |

---

## 9. How to try

```bash
cd backend && npx prisma migrate deploy && npm run db:seed && npm run dev
cd frontend && npm run dev
```

1. Sign in at `/login` as `superadmin@softlligence.local`  
2. Open `/admin` (or use the home link)  
3. Create / suspend tenants  

---

## 10. Cross references

| Doc | Relevance |
|-----|-----------|
| [`SECTION_02_Identity_Auth.md`](./SECTION_02_Identity_Auth.md) | Auth prerequisite |
| [`../03_API_Specification.md`](../03_API_Specification.md) §37 | Platform tenant APIs |
| [`../PHASE_1_SCOPE.md`](../PHASE_1_SCOPE.md) | Billing stub rule |
| [`../../plan.md`](../../plan.md) | Delivery sequence |

---

## 11. Next section

**Section 4 — Organization:** Company → Factory (Plant/WH later as needed).

---

*End of SECTION_03_Tenancy_Super_Admin*
