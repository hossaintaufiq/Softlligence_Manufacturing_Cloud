# ADR-0008 — Prisma as Initial ORM

| Field | Value |
|-------|--------|
| **Status** | Accepted |
| **Date** | 2026-08-04 |
| **Deciders** | Softlligence Architecture / Data |
| **Tags** | database, orm |

## Context

Document 02 defines the logical model. The team already uses Prisma in the pilot. Rewriting ORM on day one of the redesign would delay Phase 1.

## Decision

- **Initial ORM:** Prisma, with schema naming aligned to Document 02.  
- **Future:** Drizzle (or raw SQL) may be evaluated for complex reporting/perf — via a new ADR, not silent rewrite.  
- Migrations forward-only; RLS created with tenant-owned tables; NUMERIC for money/qty.

## Consequences

**Positive:** Speed; existing skills; migration tooling.  
**Negative:** Some advanced SQL/RLS ergonomics need raw SQL / `$executeRaw` carefully reviewed.

## References

- Review 2 §20  
- Document 02 §36–37  
- Document 05 §11.5  
