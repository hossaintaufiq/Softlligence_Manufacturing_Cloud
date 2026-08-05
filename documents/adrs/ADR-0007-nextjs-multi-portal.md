# ADR-0007 — Next.js Multi-Portal Frontend

| Field | Value |
|-------|--------|
| **Status** | Accepted |
| **Date** | 2026-08-04 |
| **Deciders** | Softlligence Architecture / Experience |
| **Tags** | frontend |

## Context

Review 1 found a single-route tab SPA with weak deep-linking. Review 2 requires Super Admin, Company Admin, and Ops portals with proper App Router usage.

## Decision

Use **Next.js** (App Router) for:

- `apps/web` — company + plant operations  
- `apps/admin` — Softlligence Super Admin  

UI must follow Document 04 (tokens, shell, templates). Token-driven CSS design system; Tailwind is an implementation option, not an architecture requirement.

## Consequences

**Positive:** Hiring familiarity; SSR/portals; monorepo shared `packages/ui`.  
**Negative:** Must migrate away from tab-only navigation.  
**Ban:** Fake client role switchers; blank boot screens.

## References

- Review 2 §1, §12–13, §20–21  
- Document 04  
- Document 05 §11.4  
