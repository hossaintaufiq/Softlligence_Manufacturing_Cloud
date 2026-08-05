# Section 1 — Foundation (As-Built)

| Field | Value |
|-------|--------|
| **Document ID** | SMC-SEC-01 |
| **Plan section** | [`plan.md`](../../plan.md) § Section 1 |
| **Version** | 1.0.0 |
| **Status** | Done |
| **Date** | 2026-08-05 |
| **Owner** | Softlligence Technologies — Engineering |
| **Upstream** | Review 2, Doc 02 (P0 entities), Doc 05, ADR-0003 / 0008 / 0013 |
| **Downstream** | Section 2 (Identity & Auth) |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-08-05 | Softlligence Engineering | Initial as-built record for Foundation |

---

## 1. Goals (plan)

Deliver a runnable local foundation:

- Monorepo layout: `frontend/` + `backend/`
- Env templates + Postgres via Supabase
- Prisma P0 tables from Document 02
- `GET /api/v1/health` and `GET /api/v1/ready`
- Local run: web `:3000`, API `:5001`

---

## 2. Outcome summary

| Item | Result |
|------|--------|
| Folders | `frontend/`, `backend/`, root scripts in `package.json` |
| API | Express + TypeScript modular monolith |
| Web | Next.js 14 App Router + Tailwind CSS v3 |
| DB | Supabase Postgres; migration `20260805000000_foundation` applied |
| Health | Live locally — health `ok`, ready `ready` when `DATABASE_URL` set |
| Deploy stubs | `backend/render.yaml`, `frontend/vercel.json` |

---

## 3. Repository layout (implemented)

```
MIS_System/
├── package.json                 # root helpers: dev:backend, dev:frontend, typecheck, db:*
├── plan.md
├── README.md
├── documents/                   # specs + this series
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── render.yaml
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/20260805000000_foundation/
│   └── src/
│       ├── index.ts
│       ├── app.ts
│       ├── config/              # env, prisma
│       ├── common/              # logger, AppError, middleware, utils
│       ├── routes/index.ts      # /api/v1 composition
│       ├── types/express.d.ts
│       └── modules/
│           ├── health/          # implemented
│           ├── identity/        # 501 stub (Section 2)
│           ├── tenancy/         # 501 stub (Section 3)
│           ├── organization/    # 501 stub (Section 4)
│           ├── iam/             # 501 stub (Section 5)
│           ├── modules/         # 501 stub (Section 6)
│           ├── inventory/       # 501 stub (Section 7)
│           ├── manufacturing/   # 501 stub (Section 8)
│           └── commercial/      # 501 stub (Section 9)
└── frontend/
    ├── package.json
    ├── next.config.mjs          # rewrites /api/v1 → API_URL
    ├── vercel.json
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── .env.example
    └── src/
        ├── app/                 # layout, page, globals.css
        ├── components/foundation/
        ├── lib/api/
        ├── features/            # reserved Section 2+
        └── types/css.d.ts
```

**Note:** Plan originally mentioned `apps/web` + `apps/api`. Delivery uses `frontend/` + `backend/` for Vercel/Render simplicity (same roles).

---

## 4. Backend (API) — implemented details

### 4.1 Stack

| Concern | Choice |
|---------|--------|
| Runtime | Node ≥ 20 |
| Framework | Express 4 (Nest-oriented folder layout; NestJS bridge deferred per ADR-0004) |
| Language | TypeScript (`module: NodeNext`) |
| ORM | Prisma 5 (`@prisma/client` + `prisma`) |
| Dev runner | `tsx watch` |
| Prod start | `tsc` → `node dist/index.js` |
| Security middleware | `helmet`, `cors` (credentials), `cookie-parser` |
| Logging | JSON lines via `common/logger.ts` |
| Errors | `AppError` + centralized `errorHandler` |
| Request tracing | `x-request-id` middleware |

### 4.2 Environment (`backend/.env.example`)

| Variable | Purpose |
|----------|---------|
| `PORT` | Default `5001` (Render injects its own `PORT` in production) |
| `DATABASE_URL` | Pooled Supabase URI (6543 + `pgbouncer=true`) |
| `DIRECT_URL` | Direct/session URI for Prisma migrate |
| `JWT_SECRET` | Placeholder for Section 2 |
| `FRONTEND_URL` / `CORS_ORIGINS` | Browser origin allow-list |
| `COOKIE_SECURE` / `COOKIE_SAME_SITE` | Cookie policy (auth later) |
| `APP_NAME` / `APP_SLUG` / `APP_VERSION` | Health payload metadata |

`dotenv` is loaded from `src/config/env.ts` so config is available for all entry paths.

### 4.3 HTTP surface (Section 1)

Base path: **`/api/v1`**

| Method | Path | Behavior |
|--------|------|----------|
| `GET` | `/api/v1/health` | Liveness — no DB. Returns `status`, `service`, `name`, `version`, `timestamp` |
| `GET` | `/api/v1/ready` | Readiness — `SELECT 1` via Prisma. `200` + `ready` or `503` + `not_ready` |

Example ready payload:

```json
{
  "status": "ready",
  "checks": {
    "database": { "ok": true, "message": "connected" }
  },
  "timestamp": "…"
}
```

### 4.4 Module stubs (501)

Mounted under `/api/v1` for future sections. Any request returns:

`501 NOT_IMPLEMENTED` via `AppError`.

| Mount | Section |
|-------|---------|
| `/auth` | 2 Identity |
| `/tenants` | 3 Tenancy |
| `/org` | 4 Organization |
| `/iam` | 5 IAM |
| `/modules` | 6 Modules |
| `/inventory` | 7 Inventory |
| `/manufacturing` | 8 Manufacturing |
| `/commercial` | 9 Commercial |

Unknown routes → `404 NOT_FOUND`.

### 4.5 Prisma schema (P0)

Aligned with Document 02 platform/identity entities:

| Model | Table | Role |
|-------|-------|------|
| `Tenant` | `tenant` | SaaS workspace (`slug`, `status`, `plan_code`, soft `deleted_at`) |
| `User` | `user_account` | Login identity shell (`password_hash` nullable until Section 2) |
| `AuthSession` | `auth_session` | Refresh-session registry (unused until Section 2) |

Migration: `backend/prisma/migrations/20260805000000_foundation/`.

### 4.6 Seed

`npm run db:seed` creates:

| Entity | Value |
|--------|--------|
| Tenant | slug `demo`, name `Demo Manufacturing Co`, plan `trial` |
| User | `admin@demo.local` / name `Demo Admin` (no password hash yet) |

Password login is **out of scope** for Section 1 (Section 2).

### 4.7 Scripts

| Script | Action |
|--------|--------|
| `npm run dev` | Watch API on `:5001` |
| `npm run build` | `tsc` → `dist/` |
| `npm start` | `node dist/index.js` |
| `npm run db:generate` | Prisma client |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:deploy` | `prisma migrate deploy` |
| `npm run db:seed` | Seed demo tenant/user |
| `npm run db:studio` | Prisma Studio |

### 4.8 Render profile

`backend/render.yaml`:

- `rootDir: backend`
- Build: `npm install && npx prisma generate && npm run build`
- Start: `npx prisma migrate deploy && npm run start`
- Health check: `/api/v1/health`
- Does **not** hardcode `PORT` (Render injects it)
- Secrets expected: `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `FRONTEND_URL`, `CORS_ORIGINS`

---

## 5. Frontend (Web) — implemented details

### 5.1 Stack

| Concern | Choice |
|---------|--------|
| Framework | Next.js 14 (App Router) |
| UI | React 18 |
| Styling | Tailwind CSS v3 + PostCSS |
| Font | IBM Plex Sans (`next/font/google`) |
| Theme | Light / clean (Doc 04 light tokens) |
| API access | Next rewrites: `/api/v1/*` → `API_URL` (default `http://localhost:5001`) |

### 5.2 Theme tokens (`tailwind.config.js`)

| Token | Value | Use |
|-------|--------|-----|
| `canvas` | `#F8FAFC` | Page background (slate-50) |
| `elevated` | `#FFFFFF` | Surfaces |
| `ink` | `#0F172A` | Primary text |
| `mute` | `#64748B` | Secondary text |
| `accent` | `#0284C7` | Brand primary (Doc 04 blue-600) |
| `ok` / `bad` | `#059669` / `#DC2626` | Status pills |
| `line` | `#E2E8F0` | Borders |
| `shadow-soft` | soft elevation | Status panel |

### 5.3 Screens (Section 1)

| Route | Content |
|-------|---------|
| `/` | Brand header + **Foundation status** panel (client fetch of health + ready) |

Components:

- `src/components/foundation/StatusPanel.tsx` — live API status
- `src/lib/api/health.ts` — `fetchHealth` / `fetchReady`

### 5.4 Environment (`frontend/.env.example`)

| Variable | Purpose |
|----------|---------|
| `API_URL` | Server-side rewrite target for `/api/v1/*` |
| `NEXT_PUBLIC_APP_NAME` / `VERSION` | Display metadata (optional) |

### 5.5 Vercel

`frontend/vercel.json` — `framework: nextjs`.

---

## 6. Root tooling

| Script | Action |
|--------|--------|
| `npm run dev:backend` | Start API |
| `npm run dev:frontend` | Start web |
| `npm run typecheck` | Both packages |
| `npm run db:deploy` / `db:seed` | Proxy to backend |

---

## 7. Verification checklist (as executed)

| Check | Result |
|-------|--------|
| `GET :5001/api/v1/health` | `status: ok` |
| `GET :5001/api/v1/ready` (with Supabase) | `status: ready` |
| `GET :3000` | HTTP 200 |
| Proxy `GET :3000/api/v1/health` | Pass-through OK |
| Proxy `GET :3000/api/v1/ready` | Pass-through OK |
| Prisma migrate status | Up to date |
| Seed | `demo` + `admin@demo.local` |
| Backend `tsc` / `npm run build` | Pass |
| Frontend `tsc` / `next build` | Pass |
| Stub `GET /api/v1/auth/login` | `501` |
| Unknown route | `404` |

---

## 8. Explicitly out of scope (deferred)

| Topic | Deferred to |
|-------|-------------|
| Password login, JWT cookies, `/auth/me` | Section 2 |
| Tenant CRUD / Super Admin UI | Section 3 |
| Company / Factory | Section 4 |
| Roles / permissions UI | Section 5 |
| Module entitlements | Section 6 |
| NestJS migration | Later (Express bridge OK now) |
| Redis | Optional later |
| AWS / Kubernetes | Not near-term (ADR-0013) |
| RLS policies SQL | Later (schema ready for tenancy) |

---

## 9. How to run (local)

```bash
# API
cd backend
cp .env.example .env          # set DATABASE_URL + DIRECT_URL
npm install
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run dev                   # :5001

# Web
cd frontend
cp .env.example .env.local
npm install
npm run dev                   # :3000
```

Or from repo root: `npm run dev:backend` / `npm run dev:frontend`.

---

## 10. Cross references

| Doc | Relevance |
|-----|-----------|
| [`../../plan.md`](../../plan.md) | Delivery sequence — Section 1 Done |
| [`../REVIEW_2_Enterprise_Architecture.md`](../REVIEW_2_Enterprise_Architecture.md) | Target architecture |
| [`../02_Database_Design.md`](../02_Database_Design.md) | P0 entity authority |
| [`../03_API_Specification.md`](../03_API_Specification.md) | `/api/v1` conventions |
| [`../04_UI_UX_Design_System.md`](../04_UI_UX_Design_System.md) | Light theme tokens |
| [`../05_Development_Playbook.md`](../05_Development_Playbook.md) | Eng process |
| [`../DEPLOY.md`](../DEPLOY.md) | Vercel + Render + Supabase |
| [`../adrs/ADR-0013-vercel-render-supabase.md`](../adrs/ADR-0013-vercel-render-supabase.md) | Hosting ADR |
| [`./README.md`](./README.md) | Series index |

---

## 11. Next section

**Section 2 — Identity & Auth:** password login, JWT + cookies, refresh, logout, `/auth/me`; wire `password_hash` + `auth_session`.

---

*End of SECTION_01_Foundation*
