# ADR-0011 — Tenant-Scoped Custom Fields (No Global CF)

| Field | Value |
|-------|--------|
| **Status** | Accepted |
| **Date** | 2026-08-04 |
| **Deciders** | Softlligence Architecture / Product |
| **Tags** | tenancy, metadata, security |

## Context

Review 1 found `CustomField` (and module toggles) modeled globally, allowing one company admin to affect all tenants. Review 2 and Document 02 require tenant-scoped definitions.

## Decision

- `custom_field_definition.tenant_id` is **NOT NULL**.  
- Values stored primarily in entity `attrs` JSONB; optional EAV for indexed filters.  
- Core transactional columns never exist only inside attrs.  
- Module **enablement** is per-tenant via `tenant_module` (catalog may be global read-only).

## Consequences

**Positive:** Fixes cross-tenant schema pollution; aligns industry field packs.  
**Negative:** Slightly more rows; template install must copy definitions per tenant.

## References

- Review 1 critical findings  
- Review 2 §14–15  
- Document 02 §22, §31  
- SRS FR-071, BR-003  
