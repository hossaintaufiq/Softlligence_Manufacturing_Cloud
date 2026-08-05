# ADR-0009 — Hybrid JWT + httpOnly Cookies + Server Sessions

| Field | Value |
|-------|--------|
| **Status** | Accepted |
| **Date** | 2026-08-04 |
| **Deciders** | Softlligence Architecture / Security |
| **Tags** | security, auth |

## Context

Browser apps need secure session UX; API/mobile clients need Bearer tokens. Refresh must be rotatable and revocable. Review 1/pilot issues included localStorage JWT XSS risk and fragile cross-site cookies when misconfigured.

## Decision

Adopt **hybrid authentication** (Review 2 §6 / Document 03 §10):

- Short-lived **access JWT** (Bearer and/or httpOnly cookie)  
- **Refresh** via httpOnly cookie + hashed token in `auth_session`  
- Server-side session registry with revoke  
- MFA for privileged roles  
- Prefer httpOnly access cookies for browser apps over long-lived localStorage tokens  
- Client signature binding for refresh hardening  

Production cookie flags (`Secure`, `SameSite`) must match deployment topology (see PRODUCTION / Playbook).

## Consequences

**Positive:** Revocation, rotation, multi-device control.  
**Negative:** CORS/cookie configuration sensitivity across API/FE domains.  
**Mitigation:** Documented env matrix; security tests for revoke/refresh.

## References

- Review 2 §6, §24  
- Document 02 §19.4  
- Document 03 §10  
- Document 05 §19  
