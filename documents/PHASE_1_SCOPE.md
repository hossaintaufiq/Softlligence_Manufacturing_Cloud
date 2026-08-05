# Phase 1 Scope Freeze

| Field | Value |
|-------|--------|
| **Version** | 1.0.0 |
| **Date** | 2026-08-05 |
| **Status** | Accepted for build |
| **Resolves** | Review 2 Phase 1 vs SRS P0 conflicts |

## Rule

When SRS marks something P0 but Review 2 Phase 1 is narrower, **this freeze wins for the first live deploy**.

Broader SRS items move to later sections in [`plan.md`](../plan.md).

---

## In scope (Sections 1–6 first)

| Area | Include |
|------|---------|
| Auth | Email/password, session, logout, `/auth/me` |
| MFA | Required for Super Admin / Tenant Owner (can land end of Section 2) |
| Tenancy | Create/list/suspend tenants |
| Org | Company + Factory (minimum) |
| IAM | Users, invite, roles, permissions, factory scope |
| Modules | Catalog + enable/disable; always-on core |
| Audit | Privileged actions logged |
| Billing | **Stub only** — plan name / status on tenant |
| Portals | Super Admin shell + Company/Ops shell |
| Deploy | Local + Vercel (web) + Render (API) + Supabase |

## Explicitly out of first live cut

| Area | When |
|------|------|
| Plant / Warehouse / Department masters | Before Section 7 (Inventory) |
| Full Stripe invoices / coupons / self-serve checkout | Section 6+ / later |
| SSO / SAML | Later |
| Inventory / Manufacturing / Dispatch | Sections 7–9 |
| Steel template | Section 10 |
| AI | Later |
| AWS / Kubernetes | Not planned for this phase |

## Permission note

Ship explicit `*.read` and `*.manage` (or write) pairs for P0 domains.  
Matrix file to add: `documents/seeds/permission_matrix.md` during Section 5.

## API ID note

Use:

- `API-PLANT-*` for plants  
- `API-PLATFORM-*` for Super Admin platform routes  

(Do not reuse `API-PLT-*` for both.)
