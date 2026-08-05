# ADR-0013 — Initial Hosting: Vercel + Render + Supabase

| Field | Value |
|-------|--------|
| **Status** | Accepted |
| **Date** | 2026-08-05 |
| **Deciders** | Softlligence Product / Engineering |
| **Tags** | deployment, hosting |

## Context

Softlligence Manufacturing Cloud will eventually support stronger infra (Review 2 §23). For the first builds and public demos, the team needs **simple, low-ops** hosting — not AWS or Kubernetes.

## Decision

**Initial production/staging profile:**

| Component | Host |
|-----------|------|
| Next.js web (and admin later) | **Vercel** |
| API (Node) | **Render** Web Service |
| PostgreSQL | **Supabase** |
| Redis / Worker | Render add-ons when required |

Local development remains the default daily workflow (`plan.md`).

This does **not** replace Review 2’s long-term deployment vision; it is the **near-term hosting profile**.

## Consequences

**Positive:** Fast deploy; low cost; matches team skill; Supabase already in use.  
**Negative:** Cold starts on free Render; cross-site cookies need `SameSite=none`; less control than VPS/K8s.  
**Mitigation:** Documented in `DEPLOY.md`; upgrade path to containers/K8s later without changing product architecture.

## References

- Review 2 §23 (long-term)  
- Document 05 §21–22 (updated)  
- `documents/DEPLOY.md`  
- `plan.md`  
