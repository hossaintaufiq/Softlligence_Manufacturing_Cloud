# Softlligence Manufacturing Cloud

Enterprise Manufacturing ERP / MIS SaaS platform (current codebase also branded as Rupsha MIS / Enterprise MIS).

**Monorepo**

| Path | Stack |
|------|--------|
| `frontend/` | Next.js 14, React 18, TypeScript, vanilla CSS (`theme.css`) — **not Tailwind** |
| `backend/` | Node.js, Express, TypeScript, Prisma ORM, PostgreSQL (Supabase) |
| `resources/` | Sample Excel / assets |

---

## Quick Start

```bash
# Backend
cd backend
cp .env.example .env   # set real DATABASE_URL, DIRECT_URL, JWT_SECRET, CORS_ORIGINS
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run dev            # http://localhost:5001

# Frontend (new terminal)
cd frontend
npm install
npm run dev            # http://localhost:3000
```

Demo logins: see [`frontend/CREDENTIALS.md`](./frontend/CREDENTIALS.md) (env-driven seed emails; default password `password123`).

More: [`TESTING.md`](./TESTING.md) · [`PRODUCTION.md`](./PRODUCTION.md)

```bash
cd backend
npm test                 # unit + security + API + perf
npm run test:security
```

---

# Architecture Audit

> Read-only audit of the existing project. No code was modified for this document.  
> Goal: become Softlligence Manufacturing Cloud — multi-tenant manufacturing SaaS for thousands of companies.

**Overall score: ~4.4 / 10** — solid pilot MIS; not Softlligence Manufacturing Cloud–ready without a tenancy-first redesign.

---

## 1. Executive Summary

This project is a **credible multi-tenant manufacturing MIS MVP**, not yet an enterprise SaaS ERP.

### What works today

- Shared-database multi-tenancy on operational records (`Scrap` / `Billet` / `Rod` / `Delivery`)
- JWT + refresh sessions + bcrypt + route-level RBAC
- Application-layer tenant isolation with security tests
- Domain UI for steel scrap → melt → roll → dispatch

### What is incorrect / incomplete

- Multi-tenant design is **hybrid and incomplete**: records are tenant-scoped; **Modules** and **CustomFields** are global
- No org hierarchy (Organization → Company → Factory → Plant → Warehouse → Department)
- Billing/subscriptions are cosmetic Tenant fields only
- No audit logs, feature flags, jobs, file storage, API versioning
- Frontend “tenant switch” / “role switch” are client preferences, not security boundaries
- Schema lacks `tenantId` indexes, soft deletes, proper enums, UUID strategy, RLS

**Bottom line:** Good foundation for a demo/pilot. **Not ready** for thousands of companies without a deliberate tenancy + domain redesign.

---

## 2. Existing Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Browser (localhost:3000)                     │
│  Next.js App Router (single page SPA)                            │
│  AuthContext | AppContext | Tab Modules | theme.css              │
│  JWT in localStorage + cookies (credentials: include)            │
└───────────────────────────────┬─────────────────────────────────┘
                                │ /api/* rewrite → BACKEND_URL
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Express API (localhost:5001)                     │
│  helmet | cors | rate-limit(auth) | cookie-parser                │
│  Routes → Controllers → Services → Prisma                        │
│  authenticate + requirePermission / requireRole                   │
└───────────────┬─────────────────────────────┬───────────────────┘
                │                             │
                ▼                             ▼
     ┌──────────────────┐          ┌────────────────────┐
     │ PostgreSQL       │          │ Redis (optional)   │
     │ Tenant, User,    │          │ session revoke +   │
     │ AuthSession,     │          │ summary cache      │
     │ Records x4,      │          │ (falls back to     │
     │ Module*, Custom* │          │ in-memory Map)     │
     └──────────────────┘          └────────────────────┘
                * Module & CustomField = GLOBAL (no tenantId)
```

### Auth flow

```
Login → /oauth/token (password)
     → Access JWT (Bearer + cookie) + Refresh cookie + AuthSession row
Request → authenticate (JWT sid + revoke cache)
401 → refresh_token grant → rotate session
Logout → revoke session + clear cookies
```

---

## 3. Folder Structure Analysis

| Area | Present? | Assessment |
|------|----------|------------|
| `frontend/` | Yes | Small coherent SPA; App Router underused (only `/`) |
| `backend/` | Yes | Layered Express: routes / controllers / services / middleware / config / utils / lib |
| `shared/` | **No** | Types/permissions conceptually duplicated across FE/BE |
| `prisma/` | Yes | Schema + 2 migrations + seed |
| middleware / auth / services / controllers / routes / utils / configs | Yes (backend) | Correct shape for MVP; services become a “god module” |
| Frontend hooks / design-system package | **No** | Contexts + cloned module components |

### Backend layout

```
backend/
  api/index.ts              # Vercel serverless export
  prisma/                   # schema, migrations, seed
  scripts/
  src/
    index.ts                # listen()
    app.ts                  # Express bootstrap
    config/
    controllers/
    middleware/
    routes/
    services/               # fat domain module
    lib/                    # prisma, redis
    utils/                  # auth, permissions
    types/
  tests/                    # unit, security, api, perf
```

### Frontend layout

```
frontend/src/
  app/          layout.tsx, page.tsx only
  context/      AuthContext, AppContext
  services/     api, storage, permissions, calculations, authData, seedData
  components/   auth, layout, common, dashboard, modules, saas
  types/
  styles/       theme.css
```

**Correct:** Clear monorepo split; backend layering readable.  
**Wrong / missing:** No shared package; no domain modules; frontend docs partly stale; no Clean Architecture boundaries. **Tailwind is not used** (vanilla CSS only).

---

## 4. Database Analysis

### Models

| Model | tenantId | ID style | Notes |
|-------|----------|----------|-------|
| Tenant | N/A | Manual string (`comp-*`) | Billing fields stub; `createdAt` as string |
| User | Optional | Manual string | Global unique email; no tenantId index |
| AuthSession | No | cuid | Refresh hash, revoke, client signature |
| Module | **No** | Manual | Global feature catalog |
| CustomField | **No** | Manual | Global schema; company_admin can mutate for all |
| Scrap / Billet / Rod / Delivery | **Yes (required)** | cuid | No indexes on `tenantId`/`date`; dates as strings; money as Float |

### Correct

- Operational records require `tenantId` + FK to Tenant
- AuthSession design is solid for refresh rotation
- Cascade choices largely sensible (records RESTRICT; sessions CASCADE)

### Wrong / enterprise problems

- No soft delete (`deletedAt`)
- No `updatedAt` on most entities
- Stringly-typed roles / status / plan / dates
- Float for money
- Missing unique business keys (e.g. challan per tenant)
- No `tenantId` indexes → scale risk
- No Postgres RLS
- Modules / CustomFields not multi-tenant
- Global unique email blocks same person across companies

### Scalability

Fine for tens of tenants / demo data. Breaks as rows grow without indexes, pagination everywhere, and per-tenant config tables.

---

## 5. Multi Tenant Analysis

**Current mode: Hybrid shared-database multi-tenancy (incomplete).**

| Question | Answer |
|----------|--------|
| Multi-tenant? | **Partially yes** for production records + users |
| Single-tenant? | Can behave like single-tenant if one company, but designed multi |
| Hybrid? | **Yes** — shared DB, app-layer isolation; some tables global |
| Org / Company / Factory model? | Only flat `Tenant` (= company). No factory / plant / warehouse |
| Every table has tenantId? | **No** |
| Every query filters by tenant? | **Mostly for records/users;** not for modules/custom fields |
| Cross-tenant access possible? | Super admin intentionally yes. Non-super: mitigated for records/users. CustomFields/Modules: **cross-tenant pollution yes** |
| Data leak risk? | Medium–High if a query forgets filter (no RLS). UI tenant switch can mislead |

### What must change

1. Hierarchy: Organization → Tenant/Company → Site/Factory → Plant → Warehouse → Department  
2. Add `tenantId` to **all** business/config tables (modules, custom fields, roles, settings)  
3. Enforce tenancy in DB (RLS) + middleware (`requireTenant`)  
4. Remove deceptive client-only tenant/role security UX  
5. Index `(tenantId, date)` and paginate all list APIs  
6. Per-tenant entitlements / feature flags  

---

## 6. Security Analysis

| Control | Status |
|---------|--------|
| Password hashing (bcrypt) | Present |
| JWT + refresh rotation + session revoke | Present |
| Helmet / CORS / auth rate limit | Present (CORS/rate-limit incomplete) |
| RBAC middleware on writes | Present |
| Tenant IDOR tests | Present |
| SQL injection | Low risk via Prisma |
| XSS | Mostly mitigated by React; JWT in localStorage is XSS-high impact |
| CSRF | Weak (cookie auth relies on SameSite only) |
| Postgres RLS | Absent |
| Audit logs | Absent |
| Default JWT secret / default passwords | Dangerous if misconfigured |
| Demo credentials in frontend bundle | Present |

**Authorization model:** Hard-coded role → permission catalog (RBAC). Not ABAC. Not hierarchical DB roles. Not resource-instance ACL. Frontend permissions are UX-only; DataGrid edit gating is too coarse (any `edit_*` unlocks all grids).

---

## 7. Backend Analysis

**Pattern:** Layered MVC / Service pattern (Routes → Controllers → Services → Prisma).  
**Not:** Clean Architecture, Repository Pattern, DDD.

**Strengths:** Clear layers; real authz middleware; security test suite.  
**Weaknesses:** Fat `services/index.ts`; light validation; list-after-write APIs; no versioning; no OpenAPI; mutations often return full collections.

### Main API surface

| Area | Endpoints (under `/api`) |
|------|--------------------------|
| Health / system | `/health`, `/system/stats`, `/system/summary` |
| Auth / OAuth | `/auth/login`, `/auth/me`, `/auth/logout`, `/oauth/token`, `/oauth/revoke` |
| Tenants | GET/POST `/tenants`, PATCH `/tenants/:id/toggle` |
| Users / roles | `/users`, `/roles` |
| Modules / fields | `/modules`, `/custom-fields` |
| Records | `/records/:entity` (`SCRAP` \| `BILLET` \| `ROD` \| `DELIVERY`) |

---

## 8. Frontend Analysis

**Pattern:** Client SPA on Next.js (tabs in memory, not URL routes).

| Area | Finding |
|------|---------|
| Routing | Single page + `activeTab` — no deep links |
| State | Dual contexts; high re-render blast radius |
| API | Real REST client; `take=200` hard cap |
| UI | CSS design tokens; no Tailwind; no dark mode; weak a11y |
| Auth UX | Login → JWT localStorage; blank boot screen |
| Docs | Root README (this file); frontend README/docs partly stale |

### Modules

Dashboard, Scrap, Billet, Rod, Delivery, Energy, Party Ledger, Analytics, Dynamic Modules, Super Admin, Employees.

---

## 9. Performance Analysis

| Bottleneck | Impact |
|------------|--------|
| No `tenantId` indexes | Slow tenant list queries at scale |
| Eager load 4×200 records | Boot cost; incomplete analytics |
| Sequential Excel import (N API writes) | UI freezes |
| Fat AppContext | Extra React renders |
| List-after-write on admin APIs | Extra DB + payload |
| Summary invalidation over all tenants | O(tenants) |
| In-memory Redis fallback | Broken revoke/cache under multi-instance |
| Full `xlsx` + all modules in one page | Bundle / no route code-split |

---

## 10. Enterprise Readiness

**Can support today (narrowly):** scrap, melting, rolling, delivery, basic KPIs, SaaS-ish company toggle, employee CRUD.

**Cannot support without redesign:** Factories / Plants / Warehouses / Departments, Inventory master, HR, CRM, Finance, Maintenance, Procurement, Quality workflows, Approvals, Documents, Period close, SSO, Audit, Notifications, Localization.

`plant_manager` is a **role name**, not a Plant entity.

---

## 11. SaaS Readiness

| Capability | Ready? |
|------------|--------|
| Thousands of companies register | **No** (schema / index / config / billing gaps) |
| Multiple factories per company | **No** |
| Multiple warehouses / lines / departments | **No** |
| Multiple users/roles per company | **Partial** (fixed 6 roles; no custom roles) |
| Isolation without affecting others | **Partial** (records yes; modules/fields no) |
| Subscriptions / metering / entitlements | **No** (cosmetic Tenant fields) |
| Self-serve onboarding | **No** |

---

## 12. Critical Problems

1. Incomplete multi-tenancy — global Modules & CustomFields  
2. App-only isolation — no RLS; one missed filter = leak  
3. Client tenant/role switchers present as security  
4. Secret/password defaults (`JWT_SECRET` fallback, `password123`)  
5. No audit / activity logging  
6. Missing tenant indexes on all operational tables  
7. Hard `take=200` silently truncates business truth  
8. No org hierarchy for manufacturing  
9. Billing/plan not enforced  
10. Redis optional memory fallback unsafe for multi-instance  
11. Frontend JWT in localStorage + demo passwords in bundle  
12. Coarse UI edit permissions + Excel import ungated  

---

## 13. Recommended Improvements

1. Define canonical tenancy model: `Organization` / `Tenant` / `Site` / `Plant` / `Warehouse`  
2. Make every business row tenant-scoped; move modules/custom fields/roles per tenant  
3. Add Postgres RLS + mandatory `tenantId` middleware  
4. Replace hard-coded roles with tenant-configurable RBAC (optionally ABAC later)  
5. Introduce audit_log, outbox/jobs, feature flags, billing entitlements  
6. Index `(tenantId, date)`, paginate/filter/sort all lists, remove list-after-write  
7. Harden auth: no default secrets, prefer httpOnly access tokens, CSRF strategy, MFA  
8. Frontend: URL routes, server-driven paging, remove fake security switchers, entity-scoped UI gates  
9. Shared package for types/permissions contracts  
10. Align docs with reality (Tailwind claim is false today)

---

## 14. Priority Roadmap

### P0 — Stop leaks / stop false security (1–3 weeks)

- Tenant-scope Modules & CustomFields  
- Remove or demote client role/tenant “security” UI  
- Force strong `JWT_SECRET`; ban default passwords in prod  
- Add `tenantId` indexes  
- Gate Excel import by permission  

### P1 — Make it a real SaaS kernel (1–2 months)

- Org hierarchy (at least Company → Site/Factory)  
- RLS + audit logs  
- Pagination/filtering APIs; remove `take=200` as sole strategy  
- Redis required in multi-instance; session revoke consistency  
- Billing stubs → real plan / maxUsers enforcement  

### P2 — Manufacturing ERP expansion (3–6 months)

- Inventory, work orders, machines/lines, QC, procurement masters  
- Attachments, approvals, notifications, background jobs  
- Frontend route architecture + design system cleanup  

### P3 — Scale Softlligence Manufacturing Cloud (6–12 months)

- Feature flags, metering, multi-region, SSO/SAML, API versioning  
- Partitioning/sharding strategy, observability, DR/backups  

---

## 15. Final Scorecard

| Dimension | Score (1–10) |
|-----------|--------------|
| Database | **4** |
| Backend | **5** |
| Frontend | **6** |
| Security | **6** |
| Scalability | **3** |
| Architecture | **5** |
| Maintainability | **5** |
| Performance | **4** |
| Code Quality | **5** |
| Enterprise Readiness | **3** |
| SaaS Readiness | **2** |

**Overall: ~4.4 / 10**

---

## Missing Enterprise Features (checklist)

| Feature | Status |
|---------|--------|
| Audit Logs | Missing |
| Activity Logs | Missing |
| Notifications | Missing |
| Subscriptions / Billing | Stub fields only |
| Feature Flags | Missing |
| Email Queue | Missing |
| Background Jobs | Missing |
| File Storage | Missing |
| Backups / DR | Ops-dependent (Supabase) |
| Monitoring / Metrics | Minimal (`/health`, summary) |
| Health Checks | Present (`/api/health`) |
| API Versioning | Missing |
| Localization | Missing |
| Settings / Org Management | Minimal |
| SSO / MFA | Missing |

---

## Scalability Snapshot

| Tenants | Outlook |
|---------|---------|
| 10 | Fine for demo / MVP |
| 100 | Indexes + global CF/modules become painful |
| 1,000 | Unbounded lists, cache invalidation, shared schema break |
| 10,000 | Not viable without tenancy redesign, RLS, Redis, paging, partitioning |

---

## Related docs

- [`../PRODUCTION.md`](../PRODUCTION.md) — HTTPS, cookies, deploy checklist  
- [`../TESTING.md`](../TESTING.md) — automated + manual security matrix  
- [`../frontend/CREDENTIALS.md`](../frontend/CREDENTIALS.md) — demo accounts  
- [`../frontend/documentation.md`](../frontend/documentation.md) — product notes (partially stale)
- [`REVIEW_2_Enterprise_Architecture.md`](./REVIEW_2_Enterprise_Architecture.md) — target architecture (**FINAL**)
- [`README.md`](./README.md) — documents library index

---

*Architecture audit captured for Softlligence Manufacturing Cloud planning. Next recommended step: target architecture blueprint (still design-first), then phased P0 migration.*
