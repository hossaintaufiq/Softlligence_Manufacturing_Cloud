# ADR-0003 — Modular Monolith First

| Field | Value |
|-------|--------|
| **Status** | Accepted |
| **Date** | 2026-08-04 |
| **Deciders** | Softlligence Architecture |
| **Tags** | architecture, modularity |

## Context

Manufacturing ERP requires strong transactional consistency across inventory, production, and later finance. A microservices-first approach would overload a growing team and complicate consistency.

## Decision

Build a **modular monolith** API with clear bounded-context modules, plus a separate **worker** process for async jobs. Extract independent services only when a context proves the need (scale, ownership, failure isolation).

## Consequences

**Positive:** Faster delivery; ACID where needed; simpler deploy early.  
**Negative:** Requires module discipline to avoid a “ball of mud.”  
**Mitigation:** Folder module boundaries (Playbook §9.2); no god service files; ADRs before extraction.

## References

- Review 2 §1, §3, principle #6  
- Document 05 §9–10  
