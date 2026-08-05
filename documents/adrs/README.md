# Architecture Decision Records (ADRs)

**Product:** Softlligence Manufacturing Cloud  
**Location:** `documents/adrs/`  
**Authority:** Review 2 is FINAL. ADRs record *why* those decisions stand; they must not contradict Review 2 or Documents 01–05.

## How to use

1. Read the index below before proposing a new technical direction.  
2. New cross-cutting changes require a new ADR (see Document 05 §10.1).  
3. Status values: `Proposed` · `Accepted` · `Deprecated` · `Superseded by ADR-XXXX`.  
4. Filename: `ADR-XXXX-short-kebab-title.md` (zero-padded 4 digits).

## Index

| ADR | Title | Status |
|-----|-------|--------|
| [ADR-0001](./ADR-0001-record-architecture-decisions.md) | Record architecture decisions as ADRs | Accepted |
| [ADR-0002](./ADR-0002-shared-database-tenant-isolation.md) | Shared database + shared schema + RLS tenancy | Accepted |
| [ADR-0003](./ADR-0003-modular-monolith.md) | Modular monolith first; extract services later | Accepted |
| [ADR-0004](./ADR-0004-nestjs-api-platform.md) | NestJS-oriented modular API (Express pilot bridge allowed) | Accepted |
| [ADR-0005](./ADR-0005-rest-openapi-primary.md) | REST + OpenAPI as primary external API | Accepted |
| [ADR-0006](./ADR-0006-industry-templates.md) | Industry-agnostic core; Steel as template pack | Accepted |
| [ADR-0007](./ADR-0007-nextjs-multi-portal.md) | Next.js multi-portal frontend | Accepted |
| [ADR-0008](./ADR-0008-prisma-orm.md) | Prisma as initial ORM aligned to Document 02 | Accepted |
| [ADR-0009](./ADR-0009-hybrid-auth-sessions.md) | Hybrid JWT + httpOnly cookies + server sessions | Accepted |
| [ADR-0010](./ADR-0010-async-workers-queues.md) | Async workers/queues for heavy work | Accepted |
| [ADR-0011](./ADR-0011-tenant-scoped-custom-fields.md) | Tenant-scoped custom fields (no global CF) | Accepted |
| [ADR-0012](./ADR-0012-rbac-server-enforced.md) | Server-enforced RBAC; UI never elevates | Accepted |

## Related documents

- [`../REVIEW_2_Enterprise_Architecture.md`](../REVIEW_2_Enterprise_Architecture.md)  
- [`../05_Development_Playbook.md`](../05_Development_Playbook.md)  
- [`../README.md`](../README.md)  

---

*Softlligence Technologies — Architecture*
