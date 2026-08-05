# Softlligence Manufacturing Cloud  
## Document 03 — Enterprise REST API Specification

| Field | Value |
|-------|--------|
| **Document ID** | SMC-DOC-03 |
| **Title** | Enterprise REST API Specification |
| **Product** | Softlligence Manufacturing Cloud |
| **Classification** | Official API Contract |
| **Version** | 1.0.0 |
| **API Version** | `v1` |
| **Status** | Draft for Engineering Baseline (Pre-Backend Build) |
| **Owner** | Softlligence Technologies — API Architecture |
| **Upstream Authority** | Document 02 Database Design + Document 01 SRS + Review 2 |
| **Downstream Consumers** | Backend, Frontend, Mobile, Integrators, QA |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-08-04 | Softlligence Documentation Team | Initial REST API specification from DB design + SRS |

---

## Table of Contents

1. [Document Control](#1-document-control)
2. [Goals](#2-goals)
3. [Scope](#3-scope)
4. [Dependencies](#4-dependencies)
5. [Definitions](#5-definitions)
6. [Architecture References](#6-architecture-references)
7. [Design Decisions](#7-design-decisions)
8. [Base URL & Versioning](#8-base-url--versioning)
9. [Cross-Cutting Conventions](#9-cross-cutting-conventions)
10. [Authentication](#10-authentication)
11. [Authorization](#11-authorization)
12. [Tenancy & Request Context](#12-tenancy--request-context)
13. [Request Format](#13-request-format)
14. [Response Format](#14-response-format)
15. [Error Model](#15-error-model)
16. [Pagination](#16-pagination)
17. [Filtering](#17-filtering)
18. [Sorting](#18-sorting)
19. [Idempotency](#19-idempotency)
20. [Rate Limits](#20-rate-limits)
21. [Caching & Conditional Requests](#21-caching--conditional-requests)
22. [File Upload / Download](#22-file-upload--download)
23. [Background Jobs API](#23-background-jobs-api)
24. [Webhooks](#24-webhooks)
25. [Event Bus (Internal Contracts)](#25-event-bus-internal-contracts)
26. [OpenAPI Guidelines](#26-openapi-guidelines)
27. [Endpoint Catalog — Platform & Auth](#27-endpoint-catalog--platform--auth)
28. [Endpoint Catalog — Organization](#28-endpoint-catalog--organization)
29. [Endpoint Catalog — IAM](#29-endpoint-catalog--iam)
30. [Endpoint Catalog — Modules & Settings](#30-endpoint-catalog--modules--settings)
31. [Endpoint Catalog — Inventory](#31-endpoint-catalog--inventory)
32. [Endpoint Catalog — Manufacturing](#32-endpoint-catalog--manufacturing)
33. [Endpoint Catalog — Procurement & Sales](#33-endpoint-catalog--procurement--sales)
34. [Endpoint Catalog — Quality, Maintenance, HR, Finance](#34-endpoint-catalog--quality-maintenance-hr-finance)
35. [Endpoint Catalog — Workflows & Notifications](#35-endpoint-catalog--workflows--notifications)
36. [Endpoint Catalog — Analytics, Billing, AI, Templates](#36-endpoint-catalog--analytics-billing-ai-templates)
37. [Endpoint Catalog — Super Admin Platform](#37-endpoint-catalog--super-admin-platform)
38. [Status Code Usage](#38-status-code-usage)
39. [Security Requirements](#39-security-requirements)
40. [Best Practices](#40-best-practices)
41. [Future Expansion](#41-future-expansion)
42. [Appendices](#42-appendices)
43. [Cross References](#43-cross-references)

---

# 1. Document Control

### 1.1 Purpose

This document defines the **enterprise REST API** for Softlligence Manufacturing Cloud. It is the contract between clients and the modular monolith API (Review 2). It is written **before backend development** and must be implementable against Document 02 entities.

### 1.2 Non-goals

- GraphQL schemas (optional Later per Review 2)  
- gRPC service definitions  
- Prisma / NestJS code  
- UI wireframes  

### 1.3 Endpoint identifier convention

`API-{DOMAIN}-{NNN}` e.g. `API-AUTH-001`, `API-WO-014`.

---

# 2. Goals

| ID | Goal |
|----|------|
| AG-01 | Stable versioned REST surface for web, admin, workers, partners |
| AG-02 | Enforce tenant isolation and RBAC on every resource |
| AG-03 | Predictable errors, pagination, filtering, sorting |
| AG-04 | Support async imports/exports/reports via jobs |
| AG-05 | Webhooks for tenant integrations |
| AG-06 | OpenAPI-first documentation culture |
| AG-07 | Fix Review 1 API smells (unbounded lists, list-after-write, silent take=200 as sole truth) |

---

# 3. Scope

**In scope:** Public HTTPS JSON REST API under `/api/v1`, auth, all SRS modules’ resource APIs, jobs, webhooks contracts, internal domain event names.

**Out of scope:** BFF-only aggregate endpoints may be added later without breaking v1 resources.

---

# 4. Dependencies

| Doc | Role |
|-----|------|
| `02_Database_Design.md` | Resource identity & fields |
| `01_SRS.md` | Permissions, screens, FRs |
| Review 2 §22 | REST + OpenAPI primary; events + queues |

---

# 5. Definitions

| Term | Meaning |
|------|---------|
| **Resource** | Noun URL representing an entity collection/item |
| **Action endpoint** | Verb-like sub-resource for lifecycle (`/release`, `/confirm`) |
| **Cursor** | Opaque pagination token |
| **Idempotency-Key** | Client header for safe retries on POST |
| **Job** | Async unit tracked via Jobs API |
| **Webhook** | Outbound HTTP callback to tenant URL |
| **Domain event** | Internal bus message (not public REST) |

---

# 6. Architecture References

| Binding | Source |
|---------|--------|
| REST + OpenAPI `/v1` | Review 2 §22 |
| Modular monolith API | Review 2 §1, §20 |
| Auth JWT + refresh + sessions | Review 2 §6; Doc 02 auth_session |
| RBAC permission strings | SRS §11 |
| Tenant RLS + app tenant context | Doc 02 §9–10 |
| Async heavy work | Review 2 principle #4; SRS FR-076 |

---

# 7. Design Decisions

| ID | Decision |
|----|----------|
| AD-01 | URL prefix `/api/v1` |
| AD-02 | JSON only (`application/json`) except multipart uploads |
| AD-03 | UUID path params for resource ids |
| AD-04 | Cursor pagination default for lists; `limit` max 100 (configurable ≤200) |
| AD-05 | Mutations return **the affected resource**, not full collections |
| AD-06 | Prefer POST to action subpaths for lifecycle transitions |
| AD-07 | Error body standardized; no raw stack traces |
| AD-08 | Authorization via permission codes; 403 if denied |
| AD-09 | Missing module entitlement → 403 `module_disabled` |
| AD-10 | OpenAPI 3.1 is source of published contract |

---

# 8. Base URL & Versioning

| Environment | Example base |
|-------------|--------------|
| Local | `http://localhost:5001/api/v1` |
| Production | `https://api.{domain}/api/v1` |

**Versioning rules**

- Breaking changes require `/v2`  
- Additive fields are non-breaking  
- Deprecation: `Deprecation` + `Sunset` headers; minimum 90 days notice  

**Compatibility alias (migration only):** legacy `/api/*` without version may proxy to v1 during pilot cutover — not part of the long-term contract.

---

# 9. Cross-Cutting Conventions

### 9.1 Headers (client → server)

| Header | Required | Purpose |
|--------|----------|---------|
| `Authorization` | Conditional | `Bearer <access_token>` |
| `Content-Type` | For body | `application/json` or multipart |
| `Accept` | Recommended | `application/json` |
| `X-Request-Id` | Optional | Client correlation; server echoes |
| `X-Idempotency-Key` | POST creates | UUID/string unique per tenant+route |
| `X-Client-Id` | Auth flows | Device/client identifier |
| `X-Client-Signature` | Auth refresh | Binding per Review 2 |
| `Accept-Language` | Optional | Locale |

Cookies (when browser): httpOnly access/refresh per Review 2; `credentials: include`.

### 9.2 Headers (server → client)

| Header | Purpose |
|--------|---------|
| `X-Request-Id` | Correlation |
| `X-RateLimit-Limit` / `Remaining` / `Reset` | Rate limit |
| `ETag` | On GET resources supporting concurrency |
| `Deprecation` / `Sunset` | Version sunset |

### 9.3 Resource naming

- Plural nouns: `/work-orders`, `/warehouses`  
- Kebab-case paths  
- Nested only one level when ownership is strong: `/work-orders/{id}/outputs`  
- Avoid deep nesting beyond 2 segments of ids  

---

# 10. Authentication

## 10.1 Methods

| Method | Use |
|--------|-----|
| Password grant | Login |
| Refresh token grant | Rotate access |
| Bearer access JWT | API calls |
| Cookie access (browser) | Same-site / configured CORS |
| SSO OIDC/SAML | Enterprise (authorization code via browser; API receives resulting session) |

## 10.2 Token contents (claims) — logical

`sub` (user_id), `tid` (tenant_id nullable for platform), `sid` (session id), `role_codes[]` or resolve server-side, `iss`, `aud`, `exp`, `iat`.  
Permissions may be loaded server-side from DB each request or embedded as compact codes — **authorization always re-validated server-side**.

## 10.3 Auth endpoints

| ID | Method | Path | Auth | Description |
|----|--------|------|------|-------------|
| API-AUTH-001 | POST | `/auth/login` | Public + rate limit | Email/password; sets cookies; returns tokens |
| API-AUTH-002 | POST | `/oauth/token` | Public + rate limit | `grant_type=password\|refresh_token` |
| API-AUTH-003 | POST | `/oauth/revoke` | Bearer | Revoke session |
| API-AUTH-004 | POST | `/auth/logout` | Bearer | Revoke + clear cookies |
| API-AUTH-005 | GET | `/auth/me` | Bearer | Current user, permissions, tenant, scopes |
| API-AUTH-006 | POST | `/auth/mfa/verify` | Partial session | Complete MFA |
| API-AUTH-007 | POST | `/auth/mfa/setup` | Bearer | Begin TOTP setup |
| API-AUTH-008 | POST | `/auth/mfa/confirm` | Bearer | Confirm TOTP |
| API-AUTH-009 | POST | `/auth/password/forgot` | Public + rate limit | |
| API-AUTH-010 | POST | `/auth/password/reset` | Public + rate limit | |
| API-AUTH-011 | POST | `/auth/invites/accept` | Public | Accept invite |
| API-AUTH-012 | GET | `/auth/sessions` | Bearer | List own sessions |
| API-AUTH-013 | DELETE | `/auth/sessions/{id}` | Bearer | Revoke session |
| API-AUTH-014 | GET | `/auth/sso/{provider}/start` | Public | Browser SSO start |
| API-AUTH-015 | GET | `/auth/sso/callback` | Public | SSO callback |

### 10.4 Login request/response (logical)

**Request:** `{ "email", "password", "client_id"? }`  
**Response 200:** `{ "access_token", "token_type":"Bearer", "expires_in", "refresh_token"?, "user", "tenant" }`  
Refresh preferably cookie-only for browsers; body refresh for mobile.

---

# 11. Authorization

### 11.1 Enforcement order

1. Authenticated? → else 401  
2. Tenant resolved & not suspended? → else 403 `tenant_suspended`  
3. Module entitled & enabled? → else 403 `module_disabled`  
4. Permission? → else 403 `forbidden`  
5. Resource scope (factory/warehouse)? → else 404/403 (prefer 404 to avoid leakage)  
6. Tenant match on resource? → else 404  

### 11.2 Permission header (debug only)

Never trust client-sent permissions. Optional response field on `/auth/me`: `permissions: string[]`.

---

# 12. Tenancy & Request Context

| Context | Source |
|---------|--------|
| User | JWT `sub` |
| Tenant | JWT `tid` (platform users null) |
| Session | JWT `sid` |
| Break-glass | Platform impersonation token + audit |

**No client-supplied `tenant_id` on body overrides JWT tenant** for non-platform users.  
Platform Super Admin APIs use `/platform/...` routes.

---

# 13. Request Format

- UTF-8 JSON objects  
- Unknown fields: **reject** `400 validation_error` (strict) for writes  
- Custom fields: nested under `attrs` object; validated against definitions  
- Dates: `YYYY-MM-DD`; timestamps: ISO-8601 UTC  

---

# 14. Response Format

### 14.1 Single resource

```json
{
  "data": { "...resource" }
}
```

### 14.2 Collection

```json
{
  "data": [ { "...resource" } ],
  "meta": {
    "pagination": {
      "next_cursor": "eyJ...",
      "prev_cursor": null,
      "limit": 50,
      "has_more": true
    }
  }
}
```

### 14.3 Action result

Same as single resource, optionally with `meta.job_id` if async.

### 14.4 No list-after-write

Creating a PO returns the PO, not all POs (Review 1 fix).

---

# 15. Error Model

### 15.1 Body

```json
{
  "error": {
    "code": "validation_error",
    "message": "Human readable summary",
    "request_id": "uuid",
    "details": [
      { "field": "email", "code": "invalid", "message": "Invalid email" }
    ]
  }
}
```

### 15.2 Standard error codes

| code | HTTP | Meaning |
|------|------|---------|
| `unauthorized` | 401 | Missing/invalid token |
| `forbidden` | 403 | Permission denied |
| `module_disabled` | 403 | Module not enabled |
| `tenant_suspended` | 403 | Tenant locked |
| `not_found` | 404 | Resource missing / out of scope |
| `conflict` | 409 | Unique / version conflict |
| `validation_error` | 400 | Input validation |
| `rate_limited` | 429 | Too many requests |
| `idempotency_conflict` | 409 | Reused key with different body |
| `unprocessable` | 422 | Business rule failed |
| `payload_too_large` | 413 | |
| `unsupported_media_type` | 415 | |
| `internal_error` | 500 | Sanitized |
| `service_unavailable` | 503 | |

OAuth token errors may use OAuth-style `{ "error": "invalid_grant", "message": "..." }` on `/oauth/token` only.

---

# 16. Pagination

| Param | Description |
|-------|-------------|
| `limit` | 1–100 default 25 (hard max 200) |
| `cursor` | Opaque next page |
| `cursor_dir` | `next` \| `prev` optional |

**Rules:** Stable sort required for cursor (`created_at desc, id desc` default).  
**Total count:** optional `include_total=true` (expensive; avoid default).  
**Offset pagination:** discouraged; allowed only for small admin catalogs with `page` + `page_size` ≤ 100.

---

# 17. Filtering

### 17.1 Common query params

| Param | Meaning |
|-------|---------|
| `status` | Exact or comma-list |
| `factory_id` | Scope |
| `company_id` | Scope |
| `q` | Full-text/simple search on code/name |
| `doc_date_from` / `doc_date_to` | Inclusive dates |
| `updated_since` | TIMESTAMPTZ |

### 17.2 Filter operators (advanced)

Where needed: `filter[status]=posted`, `filter[qty][gte]=0` — document per endpoint. Unknown filters → 400.

---

# 18. Sorting

| Param | Example |
|-------|---------|
| `sort` | `doc_date:desc`, `name:asc` |

Whitelist per endpoint. Default documented. Invalid sort → 400.

---

# 19. Idempotency

- Required on POST create for documents (WO, PO, GRN, Dispatch, adjustments)  
- Header `X-Idempotency-Key`  
- Server stores hash of body + route + tenant for 24h  
- Replay returns original response  

---

# 20. Rate Limits

| Scope | Limit (defaults) |
|-------|------------------|
| Auth login / token | 40 / 15 min / IP+email |
| Authenticated API | 600 / min / user |
| Import endpoints | 10 / hour / tenant |
| Export/report start | 30 / hour / user |
| Webhook test | 20 / hour / tenant |
| Platform admin | Higher tier |

Exceed → 429 + `Retry-After`.  
Enterprise plans may raise via entitlements.

---

# 21. Caching & Conditional Requests

- GET by id supports `ETag` / `If-Match` on updates (maps to `row_version`)  
- Update with stale version → 409 `conflict`  
- Lists generally `Cache-Control: private, no-store`  

---

# 22. File Upload / Download

| ID | Method | Path | Notes |
|----|--------|------|-------|
| API-FILE-001 | POST | `/files` | multipart; returns file_object |
| API-FILE-002 | GET | `/files/{id}` | metadata |
| API-FILE-003 | GET | `/files/{id}/content` | redirect or stream |
| API-FILE-004 | DELETE | `/files/{id}` | soft delete |
| API-FILE-005 | POST | `/files/{id}/links` | attach to entity |

Max size per plan; virus scan async job Later.

---

# 23. Background Jobs API

| ID | Method | Path | Description |
|----|--------|------|-------------|
| API-JOB-001 | GET | `/jobs/{id}` | Status, progress, errors, result |
| API-JOB-002 | GET | `/jobs` | List own/tenant jobs |
| API-JOB-003 | POST | `/jobs/{id}/cancel` | If supported |

**Job statuses:** `queued`, `running`, `succeeded`, `failed`, `cancelled`.

Started by: imports, exports, reports, template install, AI runs.

Response on start: `202 Accepted` + `{ "data": { "job_id" } }`.

---

# 24. Webhooks

### 24.1 Management

| ID | Method | Path |
|----|--------|------|
| API-WH-001 | GET | `/webhooks` |
| API-WH-002 | POST | `/webhooks` |
| API-WH-003 | PATCH | `/webhooks/{id}` |
| API-WH-004 | DELETE | `/webhooks/{id}` |
| API-WH-005 | POST | `/webhooks/{id}/test` |

### 24.2 Delivery payload

```json
{
  "id": "evt_...",
  "type": "manufacturing.work_order.completed",
  "created_at": "...",
  "tenant_id": "...",
  "data": { }
}
```

### 24.3 Security

- HTTPS only  
- `X-Softlligence-Signature` HMAC SHA-256  
- Retries with backoff; delivery log in DB  

### 24.4 Event types (public webhook)

`inventory.stock.adjusted`, `manufacturing.work_order.completed`, `sales.dispatch.confirmed`, `procurement.grn.posted`, `workflow.task.completed`, `tenant.suspended` (platform→ops), etc.

---

# 25. Event Bus (Internal Contracts)

Not public HTTP. Workers subscribe.

| Event name | Emitted when |
|------------|--------------|
| `tenant.created` | Provisioning |
| `inventory.ledger.posted` | Stock movement |
| `mfg.work_order.completed` | WO complete |
| `sales.dispatch.confirmed` | Dispatch confirm |
| `notify.dispatch` | Notification requested |
| `billing.usage.recorded` | Meter |
| `ai.prediction.requested` | AI job |

At-least-once delivery; consumers idempotent.

---

# 26. OpenAPI Guidelines

1. Single OpenAPI 3.1 document generated from source of truth annotations  
2. Every endpoint has `operationId`, tags, security, parameters, request/response schemas, error responses  
3. Examples for happy path + validation error  
4. Components reuse: `ProblemError`, `PaginationMeta`, `UUID`, `Money`, `Attrs`  
5. Publish to `/api/v1/openapi.json` (authenticated or public redacted)  
6. Breaking change checklist in Playbook  

<!-- API_PART_1_END -->
---

# 27. Endpoint Catalog — Platform & Auth

Auth endpoints: see §10.3 (API-AUTH-001…015).

| ID | Method | Path | Perm | Notes |
|----|--------|------|------|-------|
| API-HEALTH-001 | GET | `/health` | Public | Liveness |
| API-HEALTH-002 | GET | `/ready` | Public | Readiness (db/redis) |

---

# 28. Endpoint Catalog — Organization

| ID | Method | Path | Permission | Body / Query |
|----|--------|------|------------|--------------|
| API-ORG-001 | GET | `/organizations` | `org.company.manage` or read equiv | list |
| API-ORG-002 | POST | `/organizations` | `org.company.manage` | create |
| API-ORG-003 | GET | `/organizations/{id}` | | |
| API-ORG-004 | PATCH | `/organizations/{id}` | | |
| API-ORG-005 | DELETE | `/organizations/{id}` | | soft delete |
| API-CO-001 | GET | `/companies` | `org.company.manage` / read | filter |
| API-CO-002 | POST | `/companies` | `org.company.manage` | |
| API-CO-003 | GET | `/companies/{id}` | | |
| API-CO-004 | PATCH | `/companies/{id}` | | |
| API-CO-005 | DELETE | `/companies/{id}` | | soft |
| API-FAC-001 | GET | `/factories` | `org.factory.manage` / read | `company_id` |
| API-FAC-002 | POST | `/factories` | `org.factory.manage` | |
| API-FAC-003 | GET | `/factories/{id}` | | |
| API-FAC-004 | PATCH | `/factories/{id}` | | |
| API-FAC-005 | DELETE | `/factories/{id}` | | soft |
| API-PLT-001 | GET | `/plants` | `org.plant.manage` / read | `factory_id` |
| API-PLT-002 | POST | `/plants` | `org.plant.manage` | |
| API-PLT-003 | GET | `/plants/{id}` | | |
| API-PLT-004 | PATCH | `/plants/{id}` | | |
| API-PLT-005 | DELETE | `/plants/{id}` | | |
| API-WH-001 | GET | `/warehouses` | `org.warehouse.manage` / read | `factory_id` |
| API-WH-002 | POST | `/warehouses` | `org.warehouse.manage` | |
| API-WH-003 | GET | `/warehouses/{id}` | | |
| API-WH-004 | PATCH | `/warehouses/{id}` | | |
| API-WH-005 | DELETE | `/warehouses/{id}` | | |
| API-DEP-001 | GET | `/departments` | `org.department.manage` / read | |
| API-DEP-002 | POST | `/departments` | | |
| API-DEP-003 | GET | `/departments/{id}` | | |
| API-DEP-004 | PATCH | `/departments/{id}` | | |
| API-DEP-005 | DELETE | `/departments/{id}` | | |
| API-LINE-001 | GET | `/production-lines` | `org.line.manage` / read | |
| API-LINE-002 | POST | `/production-lines` | | |
| API-LINE-003 | GET | `/production-lines/{id}` | | |
| API-LINE-004 | PATCH | `/production-lines/{id}` | | |
| API-LINE-005 | DELETE | `/production-lines/{id}` | | |
| API-MAC-001 | GET | `/machines` | `org.machine.manage` / read | |
| API-MAC-002 | POST | `/machines` | | |
| API-MAC-003 | GET | `/machines/{id}` | | |
| API-MAC-004 | PATCH | `/machines/{id}` | | |
| API-MAC-005 | DELETE | `/machines/{id}` | | |

**Read permission note:** Where SRS only lists `*.manage`, implement paired `*.read` or allow manage⊃read. Document 05 should seed both.

---

# 29. Endpoint Catalog — IAM

| ID | Method | Path | Permission |
|----|--------|------|------------|
| API-IAM-001 | GET | `/users` | `iam.user.read` |
| API-IAM-002 | POST | `/users` | `iam.user.create` |
| API-IAM-003 | GET | `/users/{id}` | `iam.user.read` |
| API-IAM-004 | PATCH | `/users/{id}` | `iam.user.update` |
| API-IAM-005 | POST | `/users/{id}/deactivate` | `iam.user.deactivate` |
| API-IAM-006 | POST | `/users/invites` | `iam.user.invite` |
| API-IAM-007 | POST | `/users/{id}/roles` | `iam.user.assign_role` |
| API-IAM-008 | DELETE | `/users/{id}/roles/{roleId}` | `iam.user.assign_role` |
| API-IAM-009 | PUT | `/users/{id}/scopes` | `iam.scope.assign` |
| API-IAM-010 | GET | `/roles` | `iam.role.read` |
| API-IAM-011 | POST | `/roles` | `iam.role.manage` |
| API-IAM-012 | GET | `/roles/{id}` | `iam.role.read` |
| API-IAM-013 | PATCH | `/roles/{id}` | `iam.role.manage` |
| API-IAM-014 | PUT | `/roles/{id}/permissions` | `iam.role.manage` |
| API-IAM-015 | DELETE | `/roles/{id}` | `iam.role.manage` |
| API-IAM-016 | GET | `/permissions` | `iam.role.read` |
| API-IAM-017 | GET | `/groups` | `iam.group.manage` / read |
| API-IAM-018 | POST | `/groups` | `iam.group.manage` |
| API-IAM-019 | PATCH | `/groups/{id}` | |
| API-IAM-020 | DELETE | `/groups/{id}` | |
| API-IAM-021 | PUT | `/groups/{id}/members` | |
| API-IAM-022 | GET | `/employees` | `hr.employee.manage` / read |
| API-IAM-023 | POST | `/employees` | `hr.employee.manage` |
| API-IAM-024 | GET | `/employees/{id}` | |
| API-IAM-025 | PATCH | `/employees/{id}` | |
| API-IAM-026 | DELETE | `/employees/{id}` | soft |
| API-IAM-027 | POST | `/employees/{id}/link-user` | |

---

# 30. Endpoint Catalog — Modules & Settings

| ID | Method | Path | Permission |
|----|--------|------|------------|
| API-MOD-001 | GET | `/modules` | `modules.catalog.view` |
| API-MOD-002 | GET | `/modules/{code}` | |
| API-MOD-003 | POST | `/modules/{code}/enable` | `modules.tenant.toggle` |
| API-MOD-004 | POST | `/modules/{code}/disable` | `modules.tenant.toggle` |
| API-CF-001 | GET | `/custom-fields` | settings or manage |
| API-CF-002 | POST | `/custom-fields` | `settings.tenant.manage` / admin |
| API-CF-003 | PATCH | `/custom-fields/{id}` | |
| API-CF-004 | DELETE | `/custom-fields/{id}` | soft |
| API-SET-001 | GET | `/settings` | `settings.tenant.manage` / read |
| API-SET-002 | PUT | `/settings/{key}` | `settings.tenant.manage` |
| API-SET-003 | GET | `/branding` | |
| API-SET-004 | PUT | `/branding` | |
| API-SET-005 | GET | `/number-series` | |
| API-SET-006 | POST | `/number-series` | |
| API-SET-007 | PATCH | `/number-series/{id}` | |
| API-AUD-001 | GET | `/audit-events` | `audit.event.read` |
| API-AUD-002 | GET | `/audit-events/{id}` | |

Filters on audit: `action`, `entity_type`, `entity_id`, `from`, `to`.

---

# 31. Endpoint Catalog — Inventory

Module: `MOD-INV`.

| ID | Method | Path | Permission |
|----|--------|------|------------|
| API-UOM-001 | GET | `/uoms` | `inv.item.manage` / read |
| API-UOM-002 | POST | `/uoms` | `inv.item.manage` |
| API-UOM-003 | PATCH | `/uoms/{id}` | |
| API-ITEM-001 | GET | `/items` | `inv.item.manage` / `inv.stock.read` |
| API-ITEM-002 | POST | `/items` | `inv.item.manage` |
| API-ITEM-003 | GET | `/items/{id}` | |
| API-ITEM-004 | PATCH | `/items/{id}` | |
| API-ITEM-005 | DELETE | `/items/{id}` | soft |
| API-LOT-001 | GET | `/lots` | `inv.lot.manage` / read |
| API-LOT-002 | POST | `/lots` | `inv.lot.manage` |
| API-LOT-003 | GET | `/lots/{id}` | |
| API-STK-001 | GET | `/stock/on-hand` | `inv.stock.read` |
| API-STK-002 | GET | `/stock/ledger` | `inv.stock.read` |
| API-TR-001 | GET | `/stock-transfers` | `inv.stock.transfer` / read |
| API-TR-002 | POST | `/stock-transfers` | `inv.stock.transfer` |
| API-TR-003 | GET | `/stock-transfers/{id}` | |
| API-TR-004 | POST | `/stock-transfers/{id}/post` | `inv.stock.transfer` |
| API-TR-005 | POST | `/stock-transfers/{id}/cancel` | |
| API-ADJ-001 | GET | `/stock-adjustments` | `inv.stock.adjust` / read |
| API-ADJ-002 | POST | `/stock-adjustments` | `inv.stock.adjust` |
| API-ADJ-003 | GET | `/stock-adjustments/{id}` | |
| API-ADJ-004 | POST | `/stock-adjustments/{id}/post` | |
| API-INV-IMP | POST | `/inventory/imports` | `data.import.execute` | 202 job |

**On-hand query:** `warehouse_id`, `item_id`, `lot_id`.  
**Ledger query:** filters + cursor; never unbounded.

---

# 32. Endpoint Catalog — Manufacturing

Module: `MOD-MFG`.

| ID | Method | Path | Permission |
|----|--------|------|------------|
| API-BOM-001 | GET | `/boms` | `mfg.bom.manage` / read |
| API-BOM-002 | POST | `/boms` | `mfg.bom.manage` |
| API-BOM-003 | GET | `/boms/{id}` | |
| API-BOM-004 | PATCH | `/boms/{id}` | |
| API-BOM-005 | DELETE | `/boms/{id}` | soft |
| API-RTG-001 | GET | `/routings` | `mfg.routing.manage` / read |
| API-RTG-002 | POST | `/routings` | |
| API-RTG-003 | GET | `/routings/{id}` | |
| API-RTG-004 | PATCH | `/routings/{id}` | |
| API-WO-001 | GET | `/work-orders` | view production |
| API-WO-002 | POST | `/work-orders` | `mfg.workorder.create` |
| API-WO-003 | GET | `/work-orders/{id}` | |
| API-WO-004 | PATCH | `/work-orders/{id}` | `mfg.workorder.update` (draft only) |
| API-WO-005 | POST | `/work-orders/{id}/release` | `mfg.workorder.release` |
| API-WO-006 | POST | `/work-orders/{id}/complete` | `mfg.workorder.complete` |
| API-WO-007 | POST | `/work-orders/{id}/cancel` | `mfg.workorder.cancel` |
| API-WO-008 | POST | `/work-orders/{id}/operations` | `mfg.operation.post` |
| API-WO-009 | POST | `/work-orders/{id}/issues` | issue materials |
| API-WO-010 | POST | `/work-orders/{id}/outputs` | `mfg` output |
| API-WO-011 | POST | `/work-orders/{id}/scraps` | `mfg.scrap.post` |
| API-WO-012 | POST | `/work-orders/{id}/energy` | `mfg.energy.post` |
| API-WO-013 | GET | `/work-orders/{id}/cost` | `mfg.cost.view` |
| API-WO-014 | GET | `/work-orders/{id}/ledger-refs` | related stock moves |
| API-EN-001 | GET | `/energy-logs` | `mfg.energy.post` / read |
| API-EN-002 | POST | `/energy-logs` | `mfg.energy.post` |

### 32.1 Lifecycle errors

| Action | Invalid state → |
|--------|-----------------|
| PATCH after released | 422 `unprocessable` |
| complete without required ops | 422 |
| release without BOM when required | 422 |

### 32.2 Steel-oriented queries

Same WO endpoints with `wo_type=MELT|ROLL` and `attrs.heat_no` filters — **no separate steel resource API** (Doc 02 §33).

Optional convenience (non-authoritative):

| ID | Method | Path |
|----|--------|------|
| API-STL-001 | GET | `/templates/steel/heats` |
| API-STL-002 | GET | `/templates/steel/rolling` |
| API-STL-003 | GET | `/templates/steel/party-ledger` |

These are **views** over core resources.

---

# 33. Endpoint Catalog — Procurement & Sales

| ID | Method | Path | Permission |
|----|--------|------|------------|
| API-PARTY-001 | GET | `/parties` | customer/supplier manage/read |
| API-PARTY-002 | POST | `/parties` | |
| API-PARTY-003 | GET | `/parties/{id}` | |
| API-PARTY-004 | PATCH | `/parties/{id}` | |
| API-PARTY-005 | DELETE | `/parties/{id}` | soft |
| API-PO-001 | GET | `/purchase-orders` | `proc.po.create` / read |
| API-PO-002 | POST | `/purchase-orders` | `proc.po.create` |
| API-PO-003 | GET | `/purchase-orders/{id}` | |
| API-PO-004 | PATCH | `/purchase-orders/{id}` | draft |
| API-PO-005 | POST | `/purchase-orders/{id}/submit` | starts workflow |
| API-PO-006 | POST | `/purchase-orders/{id}/cancel` | |
| API-GRN-001 | GET | `/grns` | `proc.grn.post` / read |
| API-GRN-002 | POST | `/grns` | `proc.grn.post` |
| API-GRN-003 | GET | `/grns/{id}` | |
| API-GRN-004 | POST | `/grns/{id}/post` | posts stock |
| API-SO-001 | GET | `/sales-orders` | `sales.order.manage` / read |
| API-SO-002 | POST | `/sales-orders` | |
| API-SO-003 | GET | `/sales-orders/{id}` | |
| API-SO-004 | PATCH | `/sales-orders/{id}` | |
| API-SO-005 | POST | `/sales-orders/{id}/cancel` | |
| API-DIS-001 | GET | `/dispatches` | `sales.dispatch.create` / read |
| API-DIS-002 | POST | `/dispatches` | `sales.dispatch.create` |
| API-DIS-003 | GET | `/dispatches/{id}` | |
| API-DIS-004 | PATCH | `/dispatches/{id}` | draft |
| API-DIS-005 | POST | `/dispatches/{id}/confirm` | `sales.dispatch.confirm` |
| API-DIS-006 | POST | `/dispatches/{id}/cancel` | |
| API-DIS-007 | GET | `/dispatches/{id}/print` | PDF meta / file |

Confirm may return 422 if stock insufficient (BR-007) unless override permission present.

---

# 34. Endpoint Catalog — Quality, Maintenance, HR, Finance

## 34.1 Quality

| ID | Method | Path | Permission |
|----|--------|------|------------|
| API-QA-001 | GET/POST | `/quality-specs` | `qa.spec.manage` |
| API-QA-002 | GET/PATCH/DELETE | `/quality-specs/{id}` | |
| API-QA-003 | GET/POST | `/quality-inspections` | `qa.inspection.post` |
| API-QA-004 | GET | `/quality-inspections/{id}` | |
| API-QA-005 | GET/POST | `/ncrs` | `qa.ncr.manage` |
| API-QA-006 | GET/PATCH | `/ncrs/{id}` | |
| API-QA-007 | GET/POST | `/capas` | `qa.capa.manage` |
| API-QA-008 | GET/PATCH | `/capas/{id}` | |

## 34.2 Maintenance

| ID | Method | Path | Permission |
|----|--------|------|------------|
| API-MNT-001 | CRUD | `/maint-assets` | `maint.asset.manage` |
| API-MNT-002 | CRUD | `/maint-pm-schedules` | `maint.pm.manage` |
| API-MNT-003 | CRUD + actions | `/maint-work-orders` | `maint.wo.manage` |
| API-MNT-004 | POST | `/maint-work-orders/{id}/complete` | |

## 34.3 HR

| ID | Method | Path | Permission |
|----|--------|------|------------|
| API-HR-001 | GET/POST | `/leave-requests` | `hr.leave.manage` / self create |
| API-HR-002 | GET | `/leave-requests/{id}` | |
| API-HR-003 | POST | `/leave-requests/{id}/submit` | |
| API-HR-004 | GET | `/attendance` | `hr.attendance.view` |

Employees under IAM §29.

## 34.4 Finance (P3)

| ID | Method | Path | Permission |
|----|--------|------|------------|
| API-FIN-001 | CRUD-ish | `/ar-invoices` | `fin.invoice.manage` |
| API-FIN-002 | POST | `/ar-invoices/{id}/post` | |
| API-FIN-003 | CRUD-ish | `/ap-bills` | |
| API-FIN-004 | CRUD-ish | `/payments` | `fin.payment.manage` |
| API-FIN-005 | GET | `/journals` | `fin.journal.view` |

---

# 35. Endpoint Catalog — Workflows & Notifications

| ID | Method | Path | Permission |
|----|--------|------|------------|
| API-WF-001 | GET | `/workflows` | workflow admin |
| API-WF-002 | POST | `/workflows` | |
| API-WF-003 | GET | `/workflows/{id}` | |
| API-WF-004 | PATCH | `/workflows/{id}` | |
| API-WF-005 | POST | `/workflows/{id}/publish` | |
| API-WF-006 | GET | `/workflow-instances` | |
| API-WF-007 | GET | `/workflow-instances/{id}` | |
| API-WF-008 | GET | `/approvals/inbox` | authenticated |
| API-WF-009 | POST | `/approvals/tasks/{id}/approve` | assignee |
| API-WF-010 | POST | `/approvals/tasks/{id}/reject` | comment required |
| API-WF-011 | POST | `/approvals/tasks/{id}/delegate` | |
| API-NTF-001 | GET | `/notifications` | self |
| API-NTF-002 | POST | `/notifications/mark-read` | self |
| API-NTF-003 | GET/PUT | `/notification-preferences` | self |
| API-NTF-004 | GET/POST | `/notification-templates` | `notify.preference.manage` |
| API-NTF-005 | POST | `/notification-channels/test` | admin |

---

# 36. Endpoint Catalog — Analytics, Billing, AI, Templates

## 36.1 Analytics

| ID | Method | Path | Permission |
|----|--------|------|------------|
| API-AN-001 | GET | `/kpis` | `analytics.report.run` |
| API-AN-002 | GET | `/kpis/{code}` | |
| API-AN-003 | GET | `/reports` | |
| API-AN-004 | POST | `/reports/{code}/run` | may 202 job |
| API-AN-005 | GET | `/report-schedules` | `analytics.report.schedule` |
| API-AN-006 | POST | `/report-schedules` | |
| API-AN-007 | PATCH/DELETE | `/report-schedules/{id}` | |
| API-AN-008 | GET | `/dashboards/{code}` | aggregated widgets |
| API-EXP-001 | POST | `/exports` | `data.export.execute` | 202 |

## 36.2 Billing (tenant)

| ID | Method | Path | Permission |
|----|--------|------|------------|
| API-BILL-001 | GET | `/billing/subscription` | `billing.subscription.view` |
| API-BILL-002 | GET | `/billing/plans` | |
| API-BILL-003 | POST | `/billing/change-plan` | `billing.plan.change` |
| API-BILL-004 | GET | `/billing/invoices` | `billing.invoice.view` |
| API-BILL-005 | GET | `/billing/invoices/{id}` | |
| API-BILL-006 | GET | `/billing/usage` | |
| API-BILL-007 | GET | `/billing/credits` | |

## 36.3 AI (P4)

| ID | Method | Path | Permission |
|----|--------|------|------------|
| API-AI-001 | POST | `/ai/conversations` | `ai.assistant.use` |
| API-AI-002 | POST | `/ai/conversations/{id}/messages` | |
| API-AI-003 | GET | `/ai/conversations/{id}` | |
| API-AI-004 | POST | `/ai/predictions` | `ai.forecast.view` / maint | 202 job |
| API-AI-005 | GET | `/ai/predictions/{id}` | |
| API-AI-006 | GET | `/ai/credits` | |

## 36.4 Industry templates

| ID | Method | Path | Permission |
|----|--------|------|------------|
| API-TPL-001 | GET | `/industry-templates` | admin |
| API-TPL-002 | GET | `/industry-templates/{code}` | |
| API-TPL-003 | POST | `/industry-templates/{code}/install` | admin | 202 |
| API-TPL-004 | POST | `/industry-templates/{code}/disable` | admin |
| API-TPL-005 | GET | `/industry-templates/installed` | |

## 36.5 Imports

| ID | Method | Path | Permission |
|----|--------|------|------------|
| API-IMP-001 | POST | `/imports` | `data.import.execute` | multipart + type; dry_run |
| API-IMP-002 | GET | `/imports/{jobId}` | via jobs |

---

# 37. Endpoint Catalog — Super Admin Platform

Base path: `/platform`. Requires platform roles.

| ID | Method | Path | Permission |
|----|--------|------|------------|
| API-PLT-TEN-001 | GET | `/platform/tenants` | `platform.tenant.manage` |
| API-PLT-TEN-002 | POST | `/platform/tenants` | |
| API-PLT-TEN-003 | GET | `/platform/tenants/{id}` | |
| API-PLT-TEN-004 | PATCH | `/platform/tenants/{id}` | |
| API-PLT-TEN-005 | POST | `/platform/tenants/{id}/suspend` | |
| API-PLT-TEN-006 | POST | `/platform/tenants/{id}/reactivate` | |
| API-PLT-TEN-007 | POST | `/platform/tenants/{id}/impersonate` | `platform.tenant.impersonate` |
| API-PLT-PLAN-001 | CRUD | `/platform/plans` | `platform.plan.manage` |
| API-PLT-SUB-001 | GET | `/platform/subscriptions` | `platform.billing.manage` |
| API-PLT-REV-001 | GET | `/platform/revenue/summary` | |
| API-PLT-USG-001 | GET | `/platform/usage` | `platform.usage.view` |
| API-PLT-FLAG-001 | CRUD | `/platform/feature-flags` | `platform.flag.manage` |
| API-PLT-JOB-001 | GET | `/platform/jobs` | `platform.job.manage` |
| API-PLT-JOB-002 | POST | `/platform/jobs/{id}/retry` | |
| API-PLT-ERR-001 | GET | `/platform/errors` | |
| API-PLT-HLT-001 | GET | `/platform/health` | |
| API-PLT-AUD-001 | GET | `/platform/audit-events` | |
| API-PLT-USR-001 | CRUD | `/platform/users` | platform user admin |
| API-PLT-SUP-001 | GET/PATCH | `/platform/support/tickets` | `platform.support.manage` |

Impersonate returns short-lived token + mandatory reason body; emits audit.

---

# 38. Status Code Usage

| Code | When |
|------|------|
| 200 | GET/PATCH success |
| 201 | POST create synchronous |
| 202 | Async accepted (job) |
| 204 | DELETE success no body |
| 400 | Validation |
| 401 | Auth |
| 403 | AuthZ / module / tenant |
| 404 | Missing / out of scope |
| 409 | Conflict / idempotency / version |
| 413 | Too large |
| 415 | Media type |
| 422 | Business rule |
| 429 | Rate limit |
| 500 | Unexpected |
| 503 | Dependency down |

---

# 39. Security Requirements

| Req | Requirement |
|-----|-------------|
| SEC-API-01 | TLS in production |
| SEC-API-02 | No secrets in logs/responses |
| SEC-API-03 | Tenant isolation on every query |
| SEC-API-04 | CORS allowlist (Review 2 / PRODUCTION) |
| SEC-API-05 | Rate limit auth endpoints |
| SEC-API-06 | Webhook signatures required |
| SEC-API-07 | Break-glass audited |
| SEC-API-08 | Prefer 404 over 403 for cross-tenant id probes |
| SEC-API-09 | File content authorization on every download |
| SEC-API-10 | Strict JSON — no mass assignment of `tenant_id`, `id`, `status` transitions |

---

# 40. Best Practices

1. One resource model shared by web and partners.  
2. Action endpoints for state transitions — not PATCH status freeform.  
3. Always paginate.  
4. Return entities, not whole collections, on write.  
5. Document permission on every operation in OpenAPI `x-permission`.  
6. Evolve attrs without breaking core schema.  
7. Version webhook event payloads carefully.  
8. Correlation IDs end-to-end.  
9. Contract tests against OpenAPI in CI.  
10. Steel convenience APIs never become second write path.

---

# 41. Future Expansion

- `/api/v2` if pagination model changes incompatibly  
- GraphQL BFF for dashboards  
- Partner OAuth client_credentials  
- Bulk endpoints with job-only semantics  
- Public developer portal  

---

# 42. Appendices

## Appendix A — Resource ↔ Table map (sample)

| API Resource | Doc 02 Table |
|--------------|--------------|
| `/work-orders` | `work_order` |
| `/items` | `item` |
| `/stock/ledger` | `stock_ledger_entry` |
| `/dispatches` | `dispatch` |
| `/parties` | `party` |
| `/custom-fields` | `custom_field_definition` |
| `/modules` | `module_catalog` + `tenant_module` |
| `/audit-events` | `audit_event` |
| `/jobs` | job store (redis/db) |

## Appendix B — Permission extension

OpenAPI vendor extension:

`x-permission: mfg.workorder.release`  
`x-module: MOD-MFG`

## Appendix C — Minimal collection query example

`GET /api/v1/work-orders?factory_id=...&status=released&doc_date_from=2026-01-01&sort=doc_date:desc&limit=50&cursor=...`

## Appendix D — State transition matrix (WO)

| From \ To | release | complete | cancel |
|-----------|---------|----------|--------|
| draft | yes | no | yes |
| released | no | yes | yes |
| in_progress | no | yes | yes |
| completed | no | no | no |
| cancelled | no | no | no |

## Appendix E — Endpoint count (v1.0 catalog)

Auth ~15 · Org ~40 · IAM ~27 · Modules/Settings/Audit ~15 · Inventory ~20 · Manufacturing ~20+ · Procure/Sales ~25 · QA/MNT/HR/FIN ~25 · WF/Notify ~15 · Analytics/Billing/AI/Templates/Files/Jobs/Webhooks ~40 · Platform ~25+  

**Rough total: 250+ operations** (including CRUD expansions).

## Appendix F — Pre-backend checklist

- [ ] OpenAPI skeleton with components  
- [ ] Auth + tenancy middleware contract tests  
- [ ] Pagination helpers  
- [ ] Error mapper  
- [ ] Idempotency store  
- [ ] Job + webhook workers  
- [ ] Permission seed aligned to SRS  

---

# 43. Cross References

| Document | Path |
|----------|------|
| Database Design | [`02_Database_Design.md`](./02_Database_Design.md) |
| SRS | [`01_SRS.md`](./01_SRS.md) |
| Review 2 | [`REVIEW_2_Enterprise_Architecture.md`](./REVIEW_2_Enterprise_Architecture.md) |
| Review 1 | [`REVIEW_1_Architecture_Audit.md`](./REVIEW_1_Architecture_Audit.md) |
| Documentation System | [`00_Documentation_System.md`](./00_Documentation_System.md) |
| Documents Index | [`README.md`](./README.md) |
| Document 04 UI/UX | `04_UI_UX_Design_System.md` (next) |
| Document 05 Playbook | `05_Development_Playbook.md` |

---

## Document completion status

| Area | Status |
|------|--------|
| Cross-cutting auth/errors/pagination/filters/jobs/webhooks/events/OpenAPI | Complete |
| Endpoint catalogs for all major domains | Complete |
| Implementation code | **Out of scope** |

---

**End of Document 03 — Enterprise REST API Specification v1.0.0**

*Softlligence Manufacturing Cloud — Official API Contract*  
*Based on Document 02 Database Design + Document 01 SRS. Bound by Review 2.*
