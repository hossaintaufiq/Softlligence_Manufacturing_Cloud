# Softlligence Manufacturing Cloud — Build Plan

| Field | Value |
|-------|--------|
| **Document** | `plan.md` |
| **Version** | 1.0.0 |
| **Date** | 2026-08-05 |
| **Goal** | Build & deploy Softlligence Manufacturing Cloud |
| **Local first** | Yes |
| **Hosting (now)** | **Vercel** (frontend) + **Render** (API) + **Supabase** (Postgres) |
| **Not now** | AWS, Kubernetes, multi-region |

**Authority:** Review 2 + Documents 01–05 + ADRs. This plan is the **delivery sequence**.

---

## Product goal (one sentence)

One multi-tenant manufacturing SaaS where many companies get isolated workspaces; Steel is the first industry template — not the whole product.

---

## Hosting design (simple)

```
Developer PC (local)
   │
   ▼
GitHub
   │
   ├──► Vercel  → Next.js web (+ admin later)
   ├──► Render  → Node API (+ worker later)
   └──► Supabase → PostgreSQL
```

| Layer | Service | URL example |
|-------|---------|-------------|
| Web | Vercel | `https://app.yourdomain.com` or `*.vercel.app` |
| API | Render | `https://api-xxx.onrender.com` |
| DB | Supabase | connection string in Render env |

**Redis:** optional locally at start; add Render Redis when sessions/jobs need it.

Full steps: [`documents/DEPLOY.md`](./documents/DEPLOY.md)

---

## The 10 sections

| # | Section | Outcome | Depends on |
|---|---------|---------|------------|
| **1** | Foundation | Monorepo, Prisma, health, local run | — |
| **2** | Identity & Auth | Login, sessions, `/auth/me`, logout | 1 |
| **3** | Tenancy & Super Admin | Tenants, suspend, Super Admin shell | 2 |
| **4** | Organization | Company → Factory (+ Plant/WH later) | 3 |
| **5** | IAM | Users, roles, permissions, scopes | 3–4 |
| **6** | Modules & Entitlements | Enable modules, gated nav, plan stubs | 3, 5 |
| **7** | Inventory Core | Items, stock, ledger, transfer/adjust | 4, 6 |
| **8** | Manufacturing Core | Work orders, posts, yield/energy | 7 |
| **9** | Commercial Ops | Parties, PO/GRN lite, dispatch, reports lite | 7–8 |
| **10** | Steel Template + Live Deploy | Steel pack + Vercel/Render production | 1–9 |

---

## Section details

### Section 1 — Foundation
- Create monorepo: `frontend/` + `backend/` (maps to web + api; admin can wait)
- Env templates, Prisma from Document 02 (P0: tenant, user_account, auth_session)
- `GET /api/v1/health`, `GET /api/v1/ready`
- Run locally: web `:3000`, api `:5001`
- **As-built:** [`documents/sections/SECTION_01_Foundation.md`](./documents/sections/SECTION_01_Foundation.md)

### Section 2 — Identity & Auth
- Password login, JWT + cookies, refresh, logout
- `/auth/me`
- MFA for admin roles (can be Section 2b)
- No demo passwords in client bundle
- **As-built:** [`documents/sections/SECTION_02_Identity_Auth.md`](./documents/sections/SECTION_02_Identity_Auth.md)

### Section 3 — Tenancy & Super Admin
- Tenant CRUD, status active/suspended
- Super Admin portal (minimal)
- Billing = **stubs only** (plan name on tenant)
- **As-built:** [`documents/sections/SECTION_03_Tenancy_Super_Admin.md`](./documents/sections/SECTION_03_Tenancy_Super_Admin.md)

### Section 4 — Organization
- Company + Factory required
- Plant / Warehouse / Department: add when Inventory needs them (still before Section 7)
- **As-built:** [`documents/sections/SECTION_04_Organization.md`](./documents/sections/SECTION_04_Organization.md)

### Section 5 — IAM
- Invite users, roles, permissions
- Factory scope
- Server-enforced RBAC (ADR-0012)
- **As-built:** [`documents/sections/SECTION_05_IAM.md`](./documents/sections/SECTION_05_IAM.md)
- **Matrix:** [`documents/seeds/permission_matrix.md`](./documents/seeds/permission_matrix.md)

### Section 6 — Modules & Entitlements
- Module catalog + `tenant_module`
- Nav shows only enabled modules
- Custom fields: tenant-scoped only

### Section 7 — Inventory Core
- Items, UoM, warehouses, on-hand, ledger
- Transfer + adjustment

### Section 8 — Manufacturing Core
- Work orders + issue/output/scrap/energy
- Yield KPIs on dashboard

### Section 9 — Commercial Ops
- Parties, light PO/GRN, sales dispatch/challan
- Basic report export

### Section 10 — Steel + Deploy
- Steel template pack (views on core WO/inventory)
- Wire Vercel ↔ Render ↔ Supabase
- Smoke test on live URLs

---

## Phase 1 scope freeze (what we build first)

**In for early live demo (Sections 1–6 + deploy skeleton):**

- Auth, tenants, company/factory, users/roles, modules stubs  
- Super Admin + Company shell  
- Deploy on Vercel + Render  

**Out until later sections:**

- Full Stripe billing / invoices PDF  
- SSO/SAML  
- AI  
- Full Finance/HR depth  
- AWS / Kubernetes  

See [`documents/PHASE_1_SCOPE.md`](./documents/PHASE_1_SCOPE.md)

---

## How we work each section

1. Implement section locally  
2. Test  
3. Commit / push  
4. Deploy to Render + Vercel when section is stable  
5. Mark section done in this file  

| Section | Status |
|---------|--------|
| 1 Foundation | Done — local web :3000 + api :5001, Prisma P0, health/ready green |
| 2 Auth | Done — login/refresh/logout/me + `/login` UI (MFA → 2b) |
| 3 Tenancy | Done — platform tenants CRUD + `/admin` Super Admin |
| 4 Organization | Done — companies/factories APIs + `/org` UI |
| 5 IAM | Done — users/roles/scopes + `/iam` + invite accept |
| 6 Modules | Done — module catalog toggle + custom fields `/modules` UI |
| 7 Inventory | Done — items/warehouses/UOMs, stock balances, ledger & movements `/inventory` UI |
| 8 Manufacturing | Done — BOMs, Work Orders, Raw Material Issues, FG Receipts, Scrap/Energy & Yield KPIs `/manufacturing` UI |
| 9 Commercial | Not started |
| 10 Steel + Deploy | Not started |

---

## Document map

| Doc | Role |
|-----|------|
| Review 1 | What was wrong in pilot |
| Review 2 | Target architecture |
| ADRs | Why we chose NestJS, RLS, Vercel/Render, etc. |
| 01 SRS | What the product must do |
| 02 Database | Entities before Prisma |
| 03 API | REST contracts |
| 04 UI/UX | Screens & design system |
| 05 Playbook | How we code & ship |
| **plan.md** | **This file — build order** |
| DEPLOY.md | Vercel + Render steps |
| sections/ | As-built records per section |

---

## Next command

Say **Start Section 8** for Manufacturing Core (Work Orders, Production Posts, Yield/Energy).
