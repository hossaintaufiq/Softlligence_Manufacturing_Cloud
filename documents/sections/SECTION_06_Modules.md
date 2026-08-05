# Section 6 — Modules & Entitlements (As-Built)

| Field | Value |
|-------|--------|
| **Document ID** | SMC-SEC-06 |
| **Plan section** | [`plan.md`](../../plan.md) § Section 6 |
| **Version** | 1.0.0 |
| **Status** | Done |
| **Date** | 2026-08-05 |
| **Upstream** | Section 3, Section 5, ADR-0011 |
| **Downstream** | Section 7 (Inventory), Section 8 (Manufacturing) |

---

## 1. Goals

- Module catalog + tenant module enablement (`tenant_module`)  
- Module gating middleware (`requireModule`)  
- Navigation entitlement filtering based on enabled modules  
- Tenant-scoped custom metadata field definitions (ADR-0011)  

---

## 2. Outcome

| Item | Result |
|------|--------|
| Tables | `module_catalog`, `tenant_module`, `custom_field_definition` |
| APIs | `/modules/catalog`, `/modules`, `/modules/entitlements`, `/modules/:code`, `/custom-fields` |
| Guard | `requireModule(...)` middleware for module-specific routes |
| `/auth/me` | Includes `entitlements.modules` array |
| UI | [`/modules`](../../frontend/src/app/modules) toggle & custom fields definition manager |
| Seed | Module catalog defaults & sample custom field definition (`heat_number` on `item`) |

---

## 3. Model & Logic Notes

- `module_catalog`: Global catalog of modules (`inventory`, `manufacturing`, `commercial`, `quality`, `maintenance`).
- `is_core` modules (e.g. core identity/foundation) cannot be disabled by tenants.
- `tenant_module`: Tenant-scoped activation state with optional `config_json`.
- `custom_field_definition`: Tenant-scoped entity extensions (entity types: `item`, `factory`, `work_order`) matching ADR-0011.
- `requireModule(code)` checks tenant module status and returns 403 `MODULE_DISABLED` if non-active.

New tenants automatically execute `ensureTenantModuleDefaults` upon initialization.

---

## 4. Key Endpoints

| Method | Path | Permission / Guard |
|--------|------|-------------------|
| GET | `/modules/catalog` | Authenticated |
| GET | `/modules` | Authenticated |
| GET | `/modules/entitlements` | Authenticated |
| PUT | `/modules/:code` | Platform Admin or Tenant Admin |
| GET | `/custom-fields` | Authenticated |
| POST | `/custom-fields` | Tenant Admin |
| DELETE | `/custom-fields/:id` | Tenant Admin |

---

## 5. Try it

1. Login as `admin@demo.local` / `password123`  
2. Open http://localhost:3000/modules  
3. Toggle module status (e.g., enable/disable `quality` or `maintenance`)  
4. Define a custom metadata field for `item` (e.g., `heat_number` / `string`)  

---

## 6. Out of scope

Paid subscription plan tier automatic enforcement (billing engine), per-feature granular sub-toggles.

---

## 7. Next

**Section 7 — Inventory Core**

---

*End of SECTION_06_Modules*
