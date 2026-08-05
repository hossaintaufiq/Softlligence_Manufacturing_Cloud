# ADR-0006 — Industry-Agnostic Core; Steel as Template Pack

| Field | Value |
|-------|--------|
| **Status** | Accepted |
| **Date** | 2026-08-04 |
| **Deciders** | Softlligence Architecture / Product |
| **Tags** | product, domain, templates |

## Context

The pilot is steel-mill oriented. The Softlligence vision requires one SaaS core for many manufacturing industries. Forking per industry would explode maintenance cost.

## Decision

- Core domain entities remain industry-agnostic (Item, BOM, Routing, Work Order, Stock, Party, etc.).  
- **Steel** (and future verticals) ship as **industry template packs**: modules, fields, roles, workflows, reports, navigation — not separate schemas/products.  
- Steel UI maps to core APIs/tables (Document 02 §33); convenience read views allowed; **no second write model**.

## Consequences

**Positive:** One platform; reusable architecture; steel ships as Phase 3 pack.  
**Negative:** Template discipline required; temptation to add `heat_*` core tables must be rejected in review.

## References

- Review 2 Vision, §9–10, §14, Phase 3  
- Document 01 §24–26  
- Document 02 §32–33  
- Document 03 §32.2  
