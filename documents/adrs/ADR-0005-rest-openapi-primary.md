# ADR-0005 — REST + OpenAPI as Primary External API

| Field | Value |
|-------|--------|
| **Status** | Accepted |
| **Date** | 2026-08-04 |
| **Deciders** | Softlligence Architecture |
| **Tags** | api, integration |

## Context

Clients include web portals, future mobile, and third-party integrators. GraphQL-everywhere and tRPC-only approaches hinder partner integration. Review 2 selects REST + OpenAPI as primary.

## Decision

- **Primary public API:** Versioned REST (`/api/v1`) with OpenAPI 3.1.  
- **tRPC:** Optional only for internal BFF↔web if ever needed — not the partner contract.  
- **GraphQL / gRPC:** Deferred (Later) for specific BFF or internal high-QPS cases.

## Consequences

**Positive:** Familiar to integrators; contract testing; aligns Document 03.  
- **Negative:** Less flexible querying than GraphQL for complex dashboards (mitigate with purpose-built aggregate endpoints later).

## References

- Review 2 §22  
- Document 03  
- Document 05 §17 OpenAPI in CI  
