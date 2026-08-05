# ADR-0001 — Record Architecture Decisions as ADRs

| Field | Value |
|-------|--------|
| **Status** | Accepted |
| **Date** | 2026-08-04 |
| **Deciders** | Softlligence Architecture / Engineering Leadership |
| **Tags** | process, governance |

## Context

Softlligence Manufacturing Cloud will be built by many engineers over years. Architecture choices in Review 2 must remain discoverable, dated, and change-controlled. Informal chat decisions cause drift (as seen in Review 1 vs later docs).

## Decision

All significant, cross-cutting technical decisions SHALL be recorded as Architecture Decision Records under `documents/adrs/`.

An ADR is required when changing: tenancy, auth, API style, ORM, deployment topology, module boundaries, or any Review 2 principle.

## Consequences

**Positive:** Traceability; onboarding; explicit supersession path.  
**Negative:** Small process overhead.  
**Neutral:** ADRs describe decisions; Documents 01–05 remain product/engineering specs.

## References

- Document 05 §10.1  
- Review 2 Decision Summary  
