# Section 4 — Organization (As-Built)

| Field | Value |
|-------|--------|
| **Document ID** | SMC-SEC-04 |
| **Plan section** | [`plan.md`](../../plan.md) § Section 4 |
| **Version** | 1.0.0 |
| **Status** | Done |
| **Date** | 2026-08-05 |
| **Owner** | Softlligence Technologies — Engineering |
| **Upstream** | Section 3, Doc 02 §20.2–20.3, Doc 03 §28 |
| **Downstream** | Section 5 (IAM / factory scope) |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-08-05 | Softlligence Engineering | Company + Factory CRUD, tenant UI `/org` |

---

## 1. Goals (plan)

- Company + Factory **required**  
- Plant / Warehouse / Department → later (before Inventory / Section 7)  

---

## 2. Outcome summary

| Item | Result |
|------|--------|
| Tables | `company`, `factory` |
| APIs | `/api/v1/companies*`, `/api/v1/factories*` |
| Auth | Tenant users only (`requireTenantUser`) |
| UI | `/org` organization workspace |
| Seed | Demo company `DEMO` + factory `MAIN` |

---

## 3. Data model

Migration: `20260805020000_organization`

### `company`

| Column | Notes |
|--------|--------|
| tenant_id | Required |
| name, code | Unique `(tenant_id, code)` |
| tax_id | Optional |
| currency | CHAR(3), default `USD` |
| address_json | JSONB optional |
| status | Default `active` |
| deleted_at | Soft delete (code rewritten on delete) |

### `factory`

| Column | Notes |
|--------|--------|
| tenant_id, company_id | Required; company must be same tenant |
| name, code | Unique `(tenant_id, company_id, code)` |
| timezone | Default `UTC` |
| address_json | Optional |
| status / soft delete | Same pattern as company |

---

## 4. API

All routes require authenticated user with `tenantId` (not platform-only).

| Method | Path | Notes |
|--------|------|-------|
| GET | `/companies` | List |
| POST | `/companies` | `{ name, code, currency?, taxId? }` |
| GET | `/companies/:id` | |
| PATCH | `/companies/:id` | |
| DELETE | `/companies/:id` | Soft; blocked if factories remain |
| GET | `/factories` | Optional `?company_id=` |
| POST | `/factories` | `{ companyId, name, code, timezone? }` |
| GET/PATCH/DELETE | `/factories/:id` | Soft delete |

Cross-tenant IDs → **404**. Platform admin without tenant → **403**.

---

## 5. Frontend

| Route | Role |
|-------|------|
| `/org` | Tenant org shell — companies + factories |
| Home | “Organization” link when `tenantId` present |

---

## 6. Seed

For tenant `demo`:

| Entity | Code | Name |
|--------|------|------|
| Company | `DEMO` | Demo Manufacturing Co Ltd |
| Factory | `MAIN` | Main Plant (`Asia/Dhaka`) |

---

## 7. Out of scope

Plant, Warehouse, Department, Production line, Machine — before Section 7.

---

## 8. How to try

Sign in as `admin@demo.local` / `password123` → http://localhost:3000/org

---

## 9. Next

**Section 5 — IAM:** users, roles, permissions, factory scope.

---

*End of SECTION_04_Organization*
