# Section 2 — Identity & Auth (As-Built)

| Field | Value |
|-------|--------|
| **Document ID** | SMC-SEC-02 |
| **Plan section** | [`plan.md`](../../plan.md) § Section 2 |
| **Version** | 1.0.0 |
| **Status** | Done (MFA deferred to 2b) |
| **Date** | 2026-08-05 |
| **Owner** | Softlligence Technologies — Engineering |
| **Upstream** | Section 1, Doc 03 §10, ADR-0009 |
| **Downstream** | Section 3 (Tenancy & Super Admin) |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-08-05 | Softlligence Engineering | Login, cookies, refresh, logout, `/auth/me`, login UI |

---

## 1. Goals (plan)

- Password login  
- JWT + httpOnly cookies  
- Refresh + logout  
- `GET /auth/me`  
- MFA for admin roles → **Section 2b** (deferred)  
- No demo passwords in the client bundle  

---

## 2. Outcome summary

| Item | Result |
|------|--------|
| Login | `POST /api/v1/auth/login` — bcrypt verify, session row, cookies |
| Refresh | `POST /api/v1/auth/refresh` — rotate refresh, re-issue access |
| Logout | `POST /api/v1/auth/logout` — revoke session, clear cookies |
| Me | `GET /api/v1/auth/me` — user + tenant (+ empty permissions[]) |
| Cookies | `smc_access`, `smc_refresh` (httpOnly) |
| UI | `/login` form + home `SessionPanel` |
| Seed | Demo admin password via `SEED_DEMO_PASSWORD` (server seed only) |

---

## 3. Backend implementation

### 3.1 Dependencies

`bcryptjs`, `jsonwebtoken` (+ types).

### 3.2 Files

```
backend/src/modules/identity/
  identity.routes.ts
  identity.controller.ts
  identity.service.ts
  identity.middleware.ts   # requireAuth
  identity.crypto.ts       # hash, JWT, cookies
```

### 3.3 Endpoints (API-AUTH subset)

| ID | Method | Path | Auth | Notes |
|----|--------|------|------|-------|
| API-AUTH-001 | POST | `/auth/login` | Public | Sets cookies; returns tokens + user + tenant |
| — | POST | `/auth/refresh` | Cookie/body refresh | Rotation + client signature check |
| API-AUTH-004 | POST | `/auth/logout` | Cookie/session | Revoke + clear cookies (`204`) |
| API-AUTH-005 | GET | `/auth/me` | Bearer or access cookie | Current user / tenant |

Login body: `{ "email", "password" }`  
Login/refresh response:

```json
{
  "access_token": "…",
  "token_type": "Bearer",
  "expires_in": 900,
  "user": { "id", "email", "name", "status", "tenantId" },
  "tenant": { "id", "slug", "name", "status", "planCode" }
}
```

`/auth/me` response:

```json
{
  "user": { … },
  "tenant": { … },
  "permissions": []
}
```

Permissions filled in Section 5 (IAM).

### 3.4 Token & session model

| Piece | Behavior |
|-------|----------|
| Access JWT | Claims: `sub`, `tid`, `sid`, `email`; TTL `JWT_ACCESS_TTL_SEC` (default 900) |
| Refresh | Opaque random; **SHA-256** stored in `auth_session.refresh_token_hash` |
| Session | `auth_session` row with expiry, optional IP/UA, `client_signature` |
| Rotation | Refresh revokes old session and creates a new one |
| Binding | `X-Client-Signature` or User-Agent hashed; mismatch revokes |

Cookie flags from env: `COOKIE_SECURE`, `COOKIE_SAME_SITE` (local: secure=false, sameSite=lax).

### 3.5 `requireAuth`

Accepts `Authorization: Bearer` **or** `smc_access` cookie. Validates JWT, loads session, rejects revoked/expired/suspended tenant.

### 3.6 Seed

`SEED_DEMO_PASSWORD` (default `password123` in seed script / `.env.example` only):

| Field | Value |
|-------|--------|
| Email | `admin@demo.local` |
| Tenant | `demo` |
| Password | from env / seed default — **not** in frontend code |

---

## 4. Frontend implementation

| Path | Role |
|------|------|
| `/login` | Email/password form → `POST /api/v1/auth/login` with `credentials: 'include'` |
| `/` `SessionPanel` | Calls `/auth/me`, falls back to `/auth/refresh`, logout |
| `src/lib/api/auth.ts` | login / fetchMe / refreshSession / logout |

Same-origin `/api/v1` rewrites keep httpOnly cookies on the web origin (`:3000`).

---

## 5. Env additions

| Variable | Default | Purpose |
|----------|---------|---------|
| `JWT_ACCESS_TTL_SEC` | `900` | Access token lifetime |
| `JWT_REFRESH_TTL_SEC` | `604800` | Refresh / session lifetime (7d) |
| `SEED_DEMO_PASSWORD` | seed-only | Demo user hash input |

---

## 6. Verification

| Check | Result |
|-------|--------|
| Login `admin@demo.local` | 200 + cookies + tenant `demo` |
| `/auth/me` with cookies | Demo Admin |
| `/auth/refresh` | New access + rotated refresh |
| `/auth/logout` then `/me` | 401 |
| Frontend typecheck | Pass |
| Backend typecheck | Pass |
| Password not in FE bundle | Confirmed (seed/env only) |

---

## 7. Out of scope (deferred)

| Topic | When |
|-------|------|
| MFA TOTP (`/auth/mfa/*`) | Section 2b |
| Forgot / reset password | Later |
| SSO / OAuth providers | Later |
| `/oauth/token` grant surface | Later (browser cookie path is primary now) |
| Session list / revoke by id | Later |
| Real RBAC permissions on `/me` | Section 5 |

---

## 8. How to try

```bash
# ensure seed password is set, then:
cd backend && npm run db:seed && npm run dev
cd frontend && npm run dev
```

Open http://localhost:3000/login — sign in with seeded admin (password from `SEED_DEMO_PASSWORD`).

---

## 9. Cross references

| Doc | Relevance |
|-----|-----------|
| [`SECTION_01_Foundation.md`](./SECTION_01_Foundation.md) | Prerequisite |
| [`../03_API_Specification.md`](../03_API_Specification.md) §10 | Auth contract |
| [`../adrs/ADR-0009-hybrid-auth-sessions.md`](../adrs/ADR-0009-hybrid-auth-sessions.md) | Hybrid JWT + cookies |
| [`../../plan.md`](../../plan.md) | Delivery sequence |

---

## 10. Next section

**Section 3 — Tenancy & Super Admin:** tenant CRUD, suspend, Super Admin shell; billing stubs only.

---

*End of SECTION_02_Identity_Auth*
