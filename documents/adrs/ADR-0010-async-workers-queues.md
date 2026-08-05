# ADR-0010 — Async Workers and Queues for Heavy Work

| Field | Value |
|-------|--------|
| **Status** | Accepted |
| **Date** | 2026-08-04 |
| **Deciders** | Softlligence Architecture |
| **Tags** | async, performance, reliability |

## Context

Imports, exports, reports, template installs, and AI runs can exceed HTTP time budgets and block UX (Review 1 Excel N+1 / main-thread issues; SRS FR-076).

## Decision

- Separate **`apps/worker`** process consumes jobs from Redis-backed queue (BullMQ) or cloud queue (SQS) per environment.  
- API returns **202 + job_id** for long operations (Document 03 §23).  
- UI shows Job Progress (Document 04).  
- Redis is **required** in staging/production (no in-memory multi-instance fallback).

## Consequences

**Positive:** Responsive API; retries; horizontal worker scale.  
**Negative:** Extra deployable; at-least-once delivery requires idempotent handlers.

## References

- Review 2 §1, §17–19, principle #4  
- Document 03 §23–25  
- Document 05 PD-09, PD-10  
