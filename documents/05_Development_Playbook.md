# Softlligence Manufacturing Cloud  
## Document 05 — Enterprise Development Playbook

| Field | Value |
|-------|--------|
| **Document ID** | SMC-DOC-05 |
| **Title** | Enterprise Development Playbook |
| **Product** | Softlligence Manufacturing Cloud |
| **Classification** | Official Engineering Operating Manual |
| **Version** | 1.0.0 |
| **Status** | Draft for Engineering Baseline (Pre-Development) |
| **Owner** | Softlligence Technologies — Engineering Leadership |
| **Upstream Authority** | Docs 01–04 + Review 1 + Review 2 (**FINAL**) |
| **Audience** | All engineers, QA, DevOps, Security, Tech Leads, EMs |
| **Delivery plan** | [`../plan.md`](../plan.md) |
| **Near-term deploy** | Vercel + Render + Supabase — [`DEPLOY.md`](./DEPLOY.md) · ADR-0013 |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-08-04 | Softlligence Documentation Team | Initial playbook for Softlligence Manufacturing Cloud |

---

## Table of Contents

1. [Document Control](#1-document-control)
2. [Goals](#2-goals)
3. [Scope](#3-scope)
4. [Dependencies](#4-dependencies)
5. [Definitions](#5-definitions)
6. [Architecture References & Non-Negotiables](#6-architecture-references--non-negotiables)
7. [Design Decisions (Engineering Process)](#7-design-decisions-engineering-process)
8. [Team Topology & Ownership](#8-team-topology--ownership)
9. [Monorepo Folder Structure](#9-monorepo-folder-structure)
10. [Architecture Rules](#10-architecture-rules)
11. [Coding Standards](#11-coding-standards)
12. [Branch Strategy](#12-branch-strategy)
13. [Git Workflow](#13-git-workflow)
14. [Pull Request Rules](#14-pull-request-rules)
15. [Code Reviews](#15-code-reviews)
16. [Testing Strategy](#16-testing-strategy)
17. [CI/CD](#17-cicd)
18. [Release Strategy](#18-release-strategy)
19. [Security Checklist](#19-security-checklist)
20. [Performance Checklist](#20-performance-checklist)
21. [Environment & Configuration](#21-environment--configuration)
22. [Deployment](#22-deployment)
23. [Monitoring & Observability](#23-monitoring--observability)
24. [Incident Response](#24-incident-response)
25. [Documentation Standards](#25-documentation-standards)
26. [Definition of Done](#26-definition-of-done)
27. [Onboarding Engineers](#27-onboarding-engineers)
28. [Migration from Pilot Codebase](#28-migration-from-pilot-codebase)
29. [Best Practices](#29-best-practices)
30. [Future Expansion](#30-future-expansion)
31. [Appendices](#31-appendices)
32. [Cross References](#32-cross-references)

---

# 1. Document Control

### 1.1 Purpose

This playbook tells **how Softlligence builds** Softlligence Manufacturing Cloud. It is mandatory reading before writing production code for the target platform.

It binds day-to-day engineering to:

- Review 2 target architecture  
- Document 01 SRS (what)  
- Document 02 Database Design (data)  
- Document 03 API Specification (contracts)  
- Document 04 UI/UX Design System (experience)  

### 1.2 Authority order (conflict resolution)

1. Review 2 architecture principles  
2. Documents 01–04 (domain-specific)  
3. This playbook (process)  
4. Team conventions  

If code contradicts architecture, **architecture wins** — change the code.

---

# 2. Goals

| ID | Goal |
|----|------|
| PB-01 | Predictable delivery across 50+ engineers |
| PB-02 | Prevent Review 1 regressions (tenant leaks, global CF, fake RBAC UI) |
| PB-03 | Ship secure, tested, observable increments |
| PB-04 | Keep modular monolith healthy until extraction is justified |
| PB-05 | Make DoD and reviews unambiguous |

---

# 3. Scope

**In scope:** Coding standards, repo layout, git/CI/CD, test/release, security/perf checklists, deploy/monitor/incident, docs standards, DoD, pilot migration guidance.

**Out of scope:** Legal policies, HR performance management, customer support SLAs (referenced only).

---

# 4. Dependencies

| Artifact | Path |
|----------|------|
| Review 1 | `documents/REVIEW_1_Architecture_Audit.md` |
| Review 2 | `documents/REVIEW_2_Enterprise_Architecture.md` |
| SRS | `documents/01_SRS.md` |
| DB Design | `documents/02_Database_Design.md` |
| API Spec | `documents/03_API_Specification.md` |
| UI/UX | `documents/04_UI_UX_Design_System.md` |
| Doc System | `documents/00_Documentation_System.md` |

---

# 5. Definitions

| Term | Meaning |
|------|---------|
| **Pilot** | Current `frontend/` + `backend/` MIS codebase |
| **Target** | Softlligence Manufacturing Cloud per Review 2 |
| **ADR** | Architecture Decision Record |
| **DoD** | Definition of Done |
| **SLT** | Service Level Objective target |
| **Break-glass** | Audited Super Admin tenant access |
| **Contract test** | Test vs OpenAPI / consumer pact |

---

# 6. Architecture References & Non-Negotiables

From Review 2 — **must not violate**:

1. Industry-agnostic core; templates for verticals  
2. Tenant isolation by design (app + RLS)  
3. Modular enablement via entitlements  
4. Async for heavy work  
5. Server is source of truth for security  
6. Modular monolith until proven split  
7. Audit privileged actions  
8. Steel is a template, not the product  

### 6.1 Explicit bans (from Review 1)

| Ban | Reason |
|-----|--------|
| Global `CustomField` / global module enablement | Cross-tenant pollution |
| Client “role switcher” that elevates privileges | Fake security |
| FLOAT for money/qty | Precision |
| String `doc_date` | Correctness |
| Unbounded `findMany` without pagination | Scale |
| List-after-write returning entire tables | Perf/API contract |
| Default JWT secret / default prod passwords | Security |
| Shipping demo passwords in client bundles | Security |
| Silent `take=200` as “all data” | Correctness |

---

# 7. Design Decisions (Engineering Process)

| ID | Decision |
|----|----------|
| PD-01 | Monorepo (`apps/*`, `packages/*`) per Review 2 §21 |
| PD-02 | API: NestJS-oriented modular structure (Express pilot may bridge short-term) |
| PD-03 | ORM: Prisma aligned to Doc 02 names; evaluate Drizzle later without big-bang |
| PD-04 | OpenAPI 3.1 generated/verified in CI |
| PD-05 | Trunk-based development with short-lived feature branches |
| PD-06 | Environments: `local` → `dev` → `staging` → `prod` |
| PD-07 | No direct push to `main` |
| PD-08 | Feature flags for incomplete server capabilities |
| PD-09 | Workers separate process (`apps/worker`) |
| PD-10 | Redis required in staging/prod (not memory fallback) |

---

# 8. Team Topology & Ownership

| Area | Owns | Code paths (target) |
|------|------|---------------------|
| Platform / Identity / Billing | Team Platform | `apps/api` identity, billing; `apps/admin` |
| Organization / IAM | Team Platform | org + iam modules |
| Inventory / Manufacturing | Team Ops Domain | inv + mfg |
| Procure / Sales / CRM | Team Commercial | proc + sales |
| Quality / Maintenance / HR | Team Ops Domain | qa + mnt + hr |
| Finance | Team Finance (Phase 4) | fin |
| Frontend Shell + UI kit | Team Experience | `packages/ui`, `apps/web` |
| Steel Template | Team Ops + Experience | `templates/steel` |
| Data / DB / RLS | Team Data | prisma, migrations |
| DevEx / CI | Team Platform | `.github`, tooling |
| SRE / Observability | Team SRE | infra, alerts |

**Code owners:** `CODEOWNERS` file required for `/documents`, `/apps/api`, `/packages/ui`, `/infra`.

---

# 9. Monorepo Folder Structure

Target layout (Review 2 §21) — adopt incrementally:

```
softlligence-manufacturing-cloud/
├── apps/
│   ├── web/                 # Company + plant portals (Next.js)
│   ├── admin/               # Super Admin (Next.js)
│   ├── api/                 # Modular API
│   └── worker/              # Queue consumers
├── packages/
│   ├── ui/                  # Design system (Doc 04)
│   ├── api-client/          # Typed OpenAPI client
│   ├── auth-sdk/
│   ├── domain-contracts/    # Shared types/events
│   ├── config/
│   └── eslint-config/
├── templates/
│   └── steel/
├── documents/               # Official docs (this library)
├── infra/
│   ├── docker/
│   ├── k8s/
│   └── terraform/
├── tools/
└── .github/workflows/
```

### 9.1 Pilot repo during transition

Current paths `frontend/`, `backend/` remain until cutover. New target work should land in the structure above (or mirrored folders). Do not invent a third layout.

### 9.2 Module boundaries inside API

```
apps/api/src/
  modules/
    identity/
    tenancy/
    organization/
    iam/
    inventory/
    manufacturing/
    procurement/
    sales/
    quality/
    maintenance/
    hr/
    finance/
    workflow/
    notification/
    billing/
    analytics/
    ai/
    audit/
    files/
  common/          # guards, pagination, errors
  prisma/
```

Each module: `controller` · `service` · `dto` · `tests` — **no god `services/index.ts`**.

---

# 10. Architecture Rules

| Rule | Detail |
|------|--------|
| AR-01 | Every business write sets/checks `tenant_id` |
| AR-02 | RLS policies ship with every new tenant-owned table |
| AR-03 | Permissions enforced in API guards; UI only hides |
| AR-04 | Heavy work → queue (import/export/report/AI) |
| AR-05 | Domain events for cross-module side effects |
| AR-06 | No cross-module DB joins that bypass module APIs without review |
| AR-07 | Steel writes go through core manufacturing/inventory APIs |
| AR-08 | Custom fields tenant-scoped only |
| AR-09 | Posted ledgers append-only |
| AR-10 | Secrets only from env/secret manager |
| AR-11 | ADRs required for cross-cutting changes |
| AR-12 | Public API is `/api/v1` per Doc 03 |

### 10.1 ADR process

- Path: `documents/adrs/ADR-XXXX-title.md`  
- Required for: tenancy model changes, new external dependency, splitting a service, auth changes, breaking API  

---

# 11. Coding Standards

### 11.1 Languages

| Layer | Language | Notes |
|-------|----------|-------|
| API / Worker | TypeScript strict | `strict: true` |
| Web / Admin | TypeScript strict | React 18 / Next.js App Router |
| SQL | PostgreSQL | Via migrations |

### 11.2 General

- Meaningful names; no abbreviations unless domain-standard (`wo`, `grn`)  
- No `any` without eslint disable + justification  
- Prefer early returns  
- Functions small; services orchestrate, don’t dump SQL everywhere  
- Magic numbers → named constants  
- Don’t commit `.env`  
- Don’t log PII/secrets  

### 11.3 API

- DTOs validated (Zod/class-validator — pick one stack-wide)  
- Controllers thin  
- Map domain errors → Doc 03 error codes  
- Idempotency middleware on documented POSTs  
- Pagination helpers mandatory for lists  

### 11.4 Frontend

- Follow Doc 04 templates/components  
- Tokens only for color/space  
- No blank boot: skeleton while `/auth/me`  
- Server authz remains authoritative  
- Prefer `packages/ui` over copy-paste modules  

### 11.5 Prisma / DB

- Schema names match Doc 02  
- NUMERIC for money/qty  
- Partial unique indexes for soft delete  
- Migrations forward-only  
- Never use `db push` in shared envs  

### 11.6 Formatting & lint

- Prettier + ESLint shared configs  
- `lint` + `typecheck` required in CI  
- Pre-commit hooks optional but CI is source of truth  

---

# 12. Branch Strategy

**Model:** Trunk-based with short-lived branches.

| Branch | Purpose | Protection |
|--------|---------|------------|
| `main` | Production-ready trunk | Required reviews + CI |
| `develop` (optional) | Integration if needed early | Same as main eventually |
| `feature/<jira>-short-desc` | Feature work | |
| `fix/<jira>-short-desc` | Bugfix | |
| `chore/<desc>` | Tooling | |
| `hotfix/<desc>` | Prod emergency from main | Fast-follow review |

### 12.1 Rules

- Branch lifetime ≤ 5 business days ideally  
- Rebase or merge from `main` daily  
- No long-lived team branches  
- Release tags: `vMAJOR.MINOR.PATCH`  

---

# 13. Git Workflow

1. Create branch from latest `main`  
2. Implement behind feature flag if incomplete  
3. Add/adjust tests  
4. Update docs if contract/UI/DB changes  
5. Open PR using template  
6. Pass CI  
7. Obtain approvals (CODEOWNERS)  
8. Squash merge (default)  
9. Delete branch  

### 13.1 Commit messages

Conventional commits preferred:

`feat(mfg): add work order release endpoint`  
`fix(tenancy): enforce RLS on stock ledger`  
`docs(api): clarify idempotency header`  

### 13.2 Secrets

- Never commit secrets  
- If leaked: rotate immediately + incident  

---

# 14. Pull Request Rules

### 14.1 PR must include

- Summary (why)  
- Link to ticket / SRS requirement IDs when applicable  
- Type: feat/fix/chore/docs/security  
- Screenshots for UI  
- Risk notes (tenancy, auth, migrations)  
- Test plan checklist  
- Feature flag name if used  

### 14.2 Size

- Prefer < 400 LOC diff net of generated  
- Split migrations from large features when possible  

### 14.3 Merge requirements

| Check | Required |
|-------|----------|
| CI green | Yes |
| 1+ code owner approval | Yes |
| 2 approvals if auth/tenancy/billing | Yes |
| No unresolved conversations | Yes |
| Docs updated if public contract changes | Yes |

### 14.4 Forbidden in PR

- Commented-out large dead code  
- `console.log` noise  
- `.only` in tests  
- Force push to `main`  

---

# 15. Code Reviews

### 15.1 Reviewer checklist

- [ ] Correctness vs SRS/API/DB docs  
- [ ] Tenant isolation  
- [ ] Permission guards present  
- [ ] Pagination / no unbounded queries  
- [ ] Validation + error codes  
- [ ] Soft delete / immutability rules  
- [ ] Audit events for privileged actions  
- [ ] Tests meaningful  
- [ ] No secrets  
- [ ] UI matches Doc 04 patterns (FE)  
- [ ] Migration safe/rollback story  

### 15.2 Tone

Assume good intent; prefer questions; block on security/tenancy always.

### 15.3 SLA

First response within 1 business day for ordinary PRs; same day for hotfixes/security.

---

# 16. Testing Strategy

### 16.1 Test pyramid

| Layer | Tools (indicative) | Ownership |
|-------|--------------------|-----------|
| Unit | Vitest/Jest | Domain logic, permissions matrix |
| Integration | API + test DB | Modules |
| Contract | OpenAPI spectral + schemathesis optional | API |
| Security | Tenant isolation + RBAC suites | Mandatory |
| E2E | Playwright critical journeys | Experience + QA |
| Perf smoke | k6/artillery light | SRE |

### 16.2 Mandatory suites (never skip)

1. **Tenant isolation** — cross-tenant IDOR attempts fail  
2. **RBAC** — viewer cannot write; module disabled denied  
3. **Auth session** — revoke/refresh  
4. **Pagination** — limit caps  
5. **Money/qty** — decimal integrity smoke  

### 16.3 Data

- Ephemeral Postgres in CI  
- Factories/fixtures with unique tenant per test  
- No reliance on shared mutable seed  

### 16.4 Coverage expectations

- Critical modules (auth, tenancy, stock postings, WO lifecycle): high coverage on domain services  
- Do not chase 100% line coverage vanity  

### 16.5 Pilot

Existing `backend/tests/**` patterns should be ported/expanded — do not delete security tests during migration without replacement.

---

# 17. CI/CD

### 17.1 PR pipeline

1. Lint  
2. Typecheck  
3. Unit + integration + security tests  
4. Build API/web/admin  
5. OpenAPI lint/diff (fail on breaking without version note)  
6. Dependency audit (high+ fail or waive with ticket)  

### 17.2 Main pipeline

1. All PR checks  
2. Migrate staging  
3. Deploy staging  
4. Smoke tests  
5. Manual/automated promote to prod  

### 17.3 Migration CI

- `prisma migrate deploy` against ephemeral DB  
- Policy: migrations review by Team Data  

### 17.4 Artifacts

Docker images signed (Later); SBOM generation recommended.

---

# 18. Release Strategy

### 18.1 Cadence

- Prefer frequent small releases  
- Staging always deployable from `main`  

### 18.2 Versioning

SemVer for external API and release tags.  
App release notes in `documents/releases/` or GitHub Releases.

### 18.3 Feature flags

- Incomplete features off by default in prod  
- Flag names logged  

### 18.4 Hotfix

1. Branch from tag/main  
2. Accelerated review (security still required if relevant)  
3. Deploy  
4. Postmortem if Sev-1/2  

### 18.5 Rollback

- App rollback via previous image  
- DB: forward-fix migrations preferred; expand/contract pattern  
- Never destructive down-migrations in prod without explicit approval  

---

# 19. Security Checklist

Use on every PR touching auth, tenancy, files, billing, admin:

- [ ] No default secrets  
- [ ] Tenant predicate + RLS considered  
- [ ] Permission guard mapped to SRS code  
- [ ] Soft redaction in audit logs  
- [ ] File download authz  
- [ ] Rate limits on auth/import  
- [ ] Webhook signature verified if inbound  
- [ ] No mass assignment of role/tenant fields  
- [ ] XSS: no unsanitized HTML in UI  
- [ ] CSRF strategy respected for cookie auth  
- [ ] Dependency vulns addressed  
- [ ] Break-glass path audited  

OWASP Top 10 awareness required for all backend/FE engineers (Review 2 §24).

---

# 20. Performance Checklist

- [ ] List endpoints paginated  
- [ ] Indexes exist for new filters (`tenant_id` composites)  
- [ ] No N+1 (use includes carefully / DataLoader pattern if needed)  
- [ ] No list-after-write  
- [ ] Heavy export/import async  
- [ ] FE: avoid loading entire history for charts without aggregation API  
- [ ] Redis used for session revoke/cache in staging/prod  
- [ ] Query explain on slow paths  
- [ ] Bundle: lazy routes for heavy modules  

---

# 21. Environment & Configuration

| Env | Purpose | Typical host |
|-----|---------|--------------|
| local | Developer machines | localhost |
| staging | Shared test | Vercel preview + Render |
| prod | Customers / demos | Vercel + Render + Supabase |

### 21.1 Required config (illustrative)

`DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `CORS_ORIGINS`, `FRONTEND_URL`, `COOKIE_SECURE`, `COOKIE_SAME_SITE`, `NEXT_PUBLIC_API_URL`  
Optional later: `REDIS_URL`, `S3_*`  
**No secrets in git.**

### 21.2 Rules

- Local: `COOKIE_SECURE=false`, `COOKIE_SAME_SITE=lax`  
- Vercel↔Render (cross-site): `COOKIE_SECURE=true`, `COOKIE_SAME_SITE=none`  
- Redis required when multi-instance sessions/jobs need it; optional for earliest MVP  
- Separate JWT secrets per env  

See [`DEPLOY.md`](./DEPLOY.md).

---

# 22. Deployment

### 22.1 Near-term hosting (Accepted — ADR-0013)

| Component | Host |
|-----------|------|
| `apps/web` (Next.js) | **Vercel** |
| `apps/api` (Node) | **Render** Web Service |
| PostgreSQL | **Supabase** |
| Worker / Redis | Render add-ons when needed |

**Not required for first releases:** AWS, Kubernetes, multi-region.

Long-term scale path remains Review 2 §23.

### 22.2 Procedure

1. Local feature complete for the section  
2. Migrate Supabase (`prisma migrate deploy`)  
3. Deploy API on Render  
4. Deploy web on Vercel (`NEXT_PUBLIC_API_URL` → Render)  
5. Align CORS / cookie env; redeploy API if frontend URL changed  
6. Smoke: health, login, one write path  

Detail: [`DEPLOY.md`](./DEPLOY.md) · delivery order: [`../plan.md`](../plan.md)

### 22.3 Later (scale)

Containers / Kubernetes / Cloudflare when traffic and team size justify it (Review 2 §23).

### 22.4 Database

- Supabase PITR/backups per project plan  
- Migrate before API that requires new columns (expand/contract)  

---

# 23. Monitoring & Observability

### 23.1 Pillars

| Pillar | Requirement |
|--------|-------------|
| Logs | Structured JSON; `request_id`, `tenant_id`, `user_id` |
| Metrics | Latency, error rate, queue depth, auth failures |
| Traces | OpenTelemetry across API/worker |
| Alerts | 5xx, login spike, queue lag, RLS/auth anomalies |

### 23.2 Health

Doc 03 `/health` + `/ready`; platform health dashboard for Super Admin.

### 23.3 Product analytics

Separate from security logs; no secrets.

---

# 24. Incident Response

### 24.1 Severity

| Sev | Example | Response |
|-----|---------|----------|
| Sev-1 | Cross-tenant data leak; auth total outage | Immediate all-hands |
| Sev-2 | Major module down; payment failures | Urgent |
| Sev-3 | Degraded performance | Business hours |
| Sev-4 | Minor bug | Backlog |

### 24.2 Process

1. Detect / declare channel  
2. Incident commander  
3. Mitigate (rollback/flag off)  
4. Communicate  
5. Preserve evidence (request ids)  
6. Resolve  
7. Blameless postmortem within 72h for Sev-1/2  
8. Track remediation tickets  

### 24.3 Suspected tenant leak

1. Disable affected API paths/flags  
2. Rotate secrets if needed  
3. Audit break-glass and access logs  
4. Notify leadership / legal as policy requires  

---

# 25. Documentation Standards

### 25.1 What lives where

| Content | Location |
|---------|----------|
| Official product/engineering specs | `documents/` |
| ADRs | `documents/adrs/` |
| Release notes | GitHub Releases + optional `documents/releases/` |
| Module README | Next to module code (short) |
| Runbooks | `documents/runbooks/` or `infra/runbooks/` |

### 25.2 Rules

- Docs 01–05 are authoritative; don’t fork conflicting specs in Notion without linking  
- API changes update Doc 03 or OpenAPI that is generated from code **and** reviewed for drift  
- UI new templates update Doc 04 catalog  
- DB new entities update Doc 02 before merge when cross-cutting  

### 25.3 Language

English; precise requirement IDs when referencing SRS (`FR-035`).

---

# 26. Definition of Done

A story/PR is **Done** only when all applicable items pass:

### 26.1 Universal

- [ ] Meets acceptance criteria / SRS refs  
- [ ] Architecture rules obeyed  
- [ ] CI green  
- [ ] Code reviewed & merged  
- [ ] No known Sev-1/2 defects introduced  

### 26.2 Backend

- [ ] Guards: auth + permission + module  
- [ ] Tenant isolation verified (test or reviewed query)  
- [ ] Validation + Doc 03 errors  
- [ ] Pagination on lists  
- [ ] Migration + RLS if new table  
- [ ] Audit event if privileged  
- [ ] Tests added/updated  

### 26.3 Frontend

- [ ] Doc 04 template used  
- [ ] Loading/empty/error/permission states  
- [ ] Tokens for styling  
- [ ] Keyboard focus for primary flow  
- [ ] No privilege UI without API enforcement assumption documented  

### 26.4 Async

- [ ] Job status visible  
- [ ] Failure surfaced  
- [ ] Idempotent consumer if event-driven  

### 26.5 Ops

- [ ] Feature flagged or safe default  
- [ ] Dashboards/alerts considered for new critical path  
- [ ] Runbook updated if new operational procedure  

---

# 27. Onboarding Engineers

Week 0 checklist:

1. Read Review 2 (sections 1–8, 20–25)  
2. Read this playbook  
3. Skim SRS modules + own domain  
4. Read Doc 02 tenancy + Doc 03 cross-cutting  
5. Read Doc 04 shell + components  
6. Set up local env (API+DB+Redis+web)  
7. Run security test suite  
8. Ship a small docs or test PR  

---

# 28. Migration from Pilot Codebase

| Principle | Action |
|-----------|--------|
| Strangler | New modules in target structure; proxy/adapt pilot where needed |
| Data | New schema per Doc 02; migrate tenant data with scripts + verification |
| Auth | Move to Doc 03 contracts; retire localStorage-only assumptions gradually |
| UI | Replace tab SPA with routed portals per Doc 04 |
| Steel | Rebuild as template pack, not fork of old modules |
| Tests | Port isolation/RBAC tests first |

**Do not** “big bang rewrite” without flags and staging proof.

---

# 29. Best Practices

1. Small PRs.  
2. Security before cosmetics.  
3. Fix tenancy bugs as Sev-1 mindset.  
4. Write the test that would have caught Review 1 issues.  
5. Prefer clarity over cleverness.  
6. Delete dead pilot code only after replacement is live.  
7. Measure queue lag before adding features that enqueue.  
8. Keep OpenAPI honest.  
9. Pair on RLS/migrations.  
10. Leave code better than found — without drive-by refactors in urgent PRs.  

---

# 30. Future Expansion

- Service extraction playbooks per bounded context  
- Formal chaos testing  
- Multi-region active-passive runbooks  
- Public developer portal governance  
- Mobile release train  

---

# 31. Appendices

## Appendix A — PR template (markdown)

```markdown
### Why
### What
### SRS / Doc refs
### Risk (tenancy/auth/migration)
### Test plan
### Screenshots
### Feature flag
```

## Appendix B — Release smoke checklist

- [ ] `/health` `/ready`  
- [ ] Login + MFA path  
- [ ] `/auth/me` permissions  
- [ ] Create+list paginated resource  
- [ ] Permission denied case  
- [ ] Cross-tenant id access → 404  
- [ ] Job run (export or import dry-run)  

## Appendix C — Severity ↔ communication

| Sev | Comms |
|-----|-------|
| 1 | Immediate status page + exec |
| 2 | Customer-impacting notice |
| 3 | Internal only unless prolonged |

## Appendix D — Tooling baseline

Node 20+ · pnpm or npm workspaces · Docker · Postgres 15+ · Redis · Playwright · Vitest · ESLint · Prettier · OpenAPI toolchain  

## Appendix E — Phase gate (before “development begins” on target)

- [ ] Docs 01–05 accepted by Product + Eng leadership  
- [ ] ADR for NestJS migration path if bridging pilot  
- [ ] CI skeleton green  
- [ ] Staging Postgres + Redis provisioned  
- [ ] CODEOWNERS + branch protection enabled  
- [ ] Security test plan signed  

---

# 32. Cross References

| Document | Path |
|----------|------|
| Documentation System | [`00_Documentation_System.md`](./00_Documentation_System.md) |
| SRS | [`01_SRS.md`](./01_SRS.md) |
| Database Design | [`02_Database_Design.md`](./02_Database_Design.md) |
| API Specification | [`03_API_Specification.md`](./03_API_Specification.md) |
| UI/UX Design System | [`04_UI_UX_Design_System.md`](./04_UI_UX_Design_System.md) |
| Review 1 | [`REVIEW_1_Architecture_Audit.md`](./REVIEW_1_Architecture_Audit.md) |
| Review 2 | [`REVIEW_2_Enterprise_Architecture.md`](./REVIEW_2_Enterprise_Architecture.md) |
| Documents Index | [`README.md`](./README.md) |

---

## Document completion status

| Area | Status |
|------|--------|
| Standards, git, CI/CD, testing, release | Complete |
| Security/perf checklists, deploy, monitor, incident | Complete |
| DoD, onboarding, pilot migration | Complete |
| Execution of build | **Begins after phase gate Appendix E** |

---

**End of Document 05 — Enterprise Development Playbook v1.0.0**

*Softlligence Manufacturing Cloud — Official Engineering Operating Manual*  
*Bound by Review 2 and Documents 01–04. Architecture decisions win on conflict.*

---

## Master documentation set — status

| Doc | Title | Status |
|-----|-------|--------|
| 00 | Documentation System | Complete |
| Review 1 | Architecture Audit | FINAL |
| Review 2 | Enterprise Architecture | FINAL |
| 01 | SRS | Complete v1.0.0 |
| 02 | Database Design | Complete v1.0.0 |
| 03 | API Specification | Complete v1.0.0 |
| 04 | UI/UX Design System | Complete v1.0.0 |
| 05 | Development Playbook | Complete v1.0.0 |

**Pre-development documentation pack is complete.**  
**Delivery sequence:** [`../plan.md`](../plan.md)  
**First hosting profile:** Vercel + Render + Supabase ([`DEPLOY.md`](./DEPLOY.md), ADR-0013)  
**Phase 1 freeze:** [`PHASE_1_SCOPE.md`](./PHASE_1_SCOPE.md)  

Start coding with **Section 1** in `plan.md` after Product/Eng acknowledge the Phase 1 freeze.
