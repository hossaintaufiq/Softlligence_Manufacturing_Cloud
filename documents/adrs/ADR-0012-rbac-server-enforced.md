# ADR-0012 — Server-Enforced RBAC; UI Never Elevates

| Field | Value |
|-------|--------|
| **Status** | Accepted |
| **Date** | 2026-08-04 |
| **Deciders** | Softlligence Architecture / Security / Product |
| **Tags** | security, authorization, ux |

## Context

Review 1 documented dual role systems, unused `hasPermission` for real gates, and a UI role switcher that appeared to change security. Document 04 forbids security theatre.

## Decision

- Authorization is enforced exclusively by **API guards** using permission codes (SRS §11, Document 03 §11).  
- UI may hide/disable controls for UX only.  
- **Forbidden:** client-only role switchers that change effective privileges; trusting client-sent permission lists.  
- Within-tenant **factory/warehouse scope switcher** is allowed as data context, not privilege escalation.  
- Custom roles are tenant-scoped; platform roles never appear in tenant pickers.

## Consequences

**Positive:** Real security boundary; clearer UX semantics.  
**Negative:** Every endpoint must declare permissions (OpenAPI `x-permission`).  
**Testing:** RBAC + isolation suites mandatory (Playbook §16.2).

## References

- Review 1 RBAC findings  
- Review 2 §7, principle #5  
- Document 01 §10–11  
- Document 03 §11  
- Document 04 §17  
- Document 05 §6.1 bans  
