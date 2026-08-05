# Softlligence Manufacturing Cloud — Documents

Official documentation for **Softlligence Manufacturing Cloud**.

**Build order:** [`../plan.md`](../plan.md) (10 sections)  
**Deploy now:** **Vercel** (web) + **Render** (API) + **Supabase** (DB) → [`DEPLOY.md`](./DEPLOY.md)

---

## Source of truth

| Doc | File | Status |
|-----|------|--------|
| Review 1 — Architecture Audit | [`REVIEW_1_Architecture_Audit.md`](./REVIEW_1_Architecture_Audit.md) | FINAL |
| Review 2 — Enterprise Architecture | [`REVIEW_2_Enterprise_Architecture.md`](./REVIEW_2_Enterprise_Architecture.md) | FINAL (near-term host: Vercel/Render) |
| ADRs | [`adrs/README.md`](./adrs/README.md) | Accepted 0001–0013 |

Architecture wins on conflict.

---

## Master documents (01–05)

| # | Document | File | Role |
|---|----------|------|------|
| 00 | Documentation System | [`00_Documentation_System.md`](./00_Documentation_System.md) | How docs are written |
| 01 | SRS | [`01_SRS.md`](./01_SRS.md) | Product requirements |
| 02 | Database Design | [`02_Database_Design.md`](./02_Database_Design.md) | Entities before Prisma |
| 03 | API Specification | [`03_API_Specification.md`](./03_API_Specification.md) | REST `/api/v1` |
| 04 | UI / UX Design System | [`04_UI_UX_Design_System.md`](./04_UI_UX_Design_System.md) | Screens & components |
| 05 | Development Playbook | [`05_Development_Playbook.md`](./05_Development_Playbook.md) | How we build & ship |

---

## Delivery guides

| Doc | File |
|-----|------|
| 10-section build plan | [`../plan.md`](../plan.md) |
| Phase 1 scope freeze | [`PHASE_1_SCOPE.md`](./PHASE_1_SCOPE.md) |
| Vercel + Render deploy | [`DEPLOY.md`](./DEPLOY.md) |

---

## Implementation series (as-built)

What was **actually shipped** per plan section (complements specs 01–05):

| Section | File | Status |
|---------|------|--------|
| Series index | [`sections/README.md`](./sections/README.md) | Active |
| 1 Foundation | [`sections/SECTION_01_Foundation.md`](./sections/SECTION_01_Foundation.md) | Done |

---

## Clean design summary

| Topic | Decision |
|-------|----------|
| Product | Multi-tenant manufacturing SaaS; Steel = template |
| App shape | Modular monolith + workers later |
| API | REST + OpenAPI on Render |
| Web | Next.js on Vercel |
| DB | Postgres on Supabase + RLS |
| Auth | JWT + cookies; server RBAC |
| First ship | Sections 1–6, then 7–10 per `plan.md` |

---

*Softlligence Technologies*
