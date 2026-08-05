# ADR-0002 — Shared Database + Shared Schema + RLS Tenancy

| Field | Value |
|-------|--------|
| **Status** | Accepted |
| **Date** | 2026-08-04 |
| **Deciders** | Softlligence Architecture |
| **Tags** | tenancy, database, security |

## Context

The product must isolate thousands of company workspaces. Options: database-per-tenant, schema-per-tenant, or shared schema with isolation controls. Review 1 showed incomplete app-layer isolation and missing indexes/RLS.

## Decision

**Default tenancy model:** Shared PostgreSQL database, shared schema, mandatory `tenant_id` on business rows, PostgreSQL **Row Level Security**, plus application tenant context on every request.

**Later option:** Dedicated database per tenant for Enterprise / compliance (hybrid), same logical schema.

## Consequences

**Positive:** Operational simplicity; one migration pipeline; Super Admin analytics; cost-efficient SaaS.  
**Negative:** Requires rigorous RLS + query discipline; noisy-neighbor risk managed by quotas/pooling.  
**Compliance:** Defense in depth (app + RLS); break-glass audited.

## Rejected alternatives

| Alternative | Why rejected (for default) |
|-------------|----------------------------|
| DB-per-tenant always | Ops cost; schema drift; slow onboarding |
| Schema-per-tenant always | Migration complexity at scale |

## References

- Review 2 §4, §5, §24  
- Document 02 §9–10  
- SRS FR-001, NFR-001  
