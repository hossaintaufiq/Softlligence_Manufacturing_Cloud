# ADR-0004 — NestJS-Oriented Modular API Platform

| Field | Value |
|-------|--------|
| **Status** | Accepted |
| **Date** | 2026-08-04 |
| **Deciders** | Softlligence Architecture |
| **Tags** | backend, framework |

## Context

The pilot uses Express with a thickening `services/index.ts`. Review 2 recommends NestJS (or equivalently strict modular Fastify) for DI, guards, modules, and OpenAPI alignment as the ERP grows.

## Decision

**Target API platform:** NestJS modular structure (or Nest-equivalent module/guard patterns).

**Transition:** The existing Express pilot MAY act as a short-term bridge, but new target modules SHALL follow NestJS-oriented boundaries. No permanent dual frameworks without a sunset date.

## Consequences

**Positive:** Clear modules, guards for RBAC/tenancy, OpenAPI decorators, testability.  
**Negative:** Migration cost from pilot Express; learning curve.  
**Mitigation:** Strangler pattern (Playbook §28).

## References

- Review 2 §20  
- Document 05 PD-02, §28  
- Document 03 (API contracts framework-agnostic)  
