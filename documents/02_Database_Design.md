# Softlligence Manufacturing Cloud  
## Document 02 — Enterprise Database Design Document

| Field | Value |
|-------|--------|
| **Document ID** | SMC-DOC-02 |
| **Title** | Enterprise Database Design Document |
| **Product** | Softlligence Manufacturing Cloud |
| **Classification** | Official Data Architecture Specification |
| **Version** | 1.0.0 |
| **Status** | Draft for Engineering Baseline (Pre-Prisma) |
| **Owner** | Softlligence Technologies — Data Architecture |
| **Audience** | Database engineers, backend engineers, security, QA, DevOps, BAs |
| **Upstream Authority** | Document 01 SRS + Review 2 (**FINAL**) |
| **Downstream Consumers** | Prisma schema, migrations, Document 03 API |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-08-04 | Softlligence Documentation Team | Initial enterprise DB design from SRS + Review 2 |

---

## Table of Contents

1. [Document Control](#1-document-control)
2. [Goals](#2-goals)
3. [Scope](#3-scope)
4. [Dependencies](#4-dependencies)
5. [Definitions](#5-definitions)
6. [Architecture References](#6-architecture-references)
7. [Design Decisions](#7-design-decisions)
8. [Database Naming Standards](#8-database-naming-standards)
9. [Tenant Strategy](#9-tenant-strategy)
10. [Row Level Security Strategy](#10-row-level-security-strategy)
11. [Soft Delete Strategy](#11-soft-delete-strategy)
12. [Audit Strategy](#12-audit-strategy)
13. [Temporal & Concurrency Standards](#13-temporal--concurrency-standards)
14. [Money, Quantity & UoM Standards](#14-money-quantity--uom-standards)
15. [Normalization Principles](#15-normalization-principles)
16. [Index Strategy](#16-index-strategy)
17. [Partitioning Strategy](#17-partitioning-strategy)
18. [Conceptual Data Model](#18-conceptual-data-model)
19. [Entity Catalog — Platform & Identity](#19-entity-catalog--platform--identity)
20. [Entity Catalog — Organization](#20-entity-catalog--organization)
21. [Entity Catalog — IAM](#21-entity-catalog--iam)
22. [Entity Catalog — Modules, Entitlements, Flags](#22-entity-catalog--modules-entitlements-flags)
23. [Entity Catalog — Inventory](#23-entity-catalog--inventory)
24. [Entity Catalog — Manufacturing](#24-entity-catalog--manufacturing)
25. [Entity Catalog — Procurement & Sales](#25-entity-catalog--procurement--sales)
26. [Entity Catalog — Quality, Maintenance, HR, Finance](#26-entity-catalog--quality-maintenance-hr-finance)
27. [Entity Catalog — Workflows & Notifications](#27-entity-catalog--workflows--notifications)
28. [Entity Catalog — Files, Settings, Number Series](#28-entity-catalog--files-settings-number-series)
29. [Entity Catalog — Billing & Usage](#29-entity-catalog--billing--usage)
30. [Entity Catalog — Analytics Metadata & AI](#30-entity-catalog--analytics-metadata--ai)
31. [Dynamic Fields & Metadata Model](#31-dynamic-fields--metadata-model)
32. [Industry Template Data Model](#32-industry-template-data-model)
33. [Steel Template Mapping Tables](#33-steel-template-mapping-tables)
34. [Business Constraints Catalog](#34-business-constraints-catalog)
35. [Entity Relationship Summary](#35-entity-relationship-summary)
36. [Physical Design Guidelines (Pre-Prisma)](#36-physical-design-guidelines-pre-prisma)
37. [Migration & Seed Strategy](#37-migration--seed-strategy)
38. [Best Practices](#38-best-practices)
39. [Future Expansion](#39-future-expansion)
40. [Appendices](#40-appendices)
41. [Cross References](#41-cross-references)

---

# 1. Document Control

### 1.1 Purpose

This document defines the **enterprise logical and physical database design** for Softlligence Manufacturing Cloud. It translates Document 01 (SRS) into entities, relationships, constraints, indexing, tenancy, audit, soft delete, dynamic fields, and industry-template metadata.

It is the **last authoritative design artifact before Prisma schema authoring**. It does **not** contain Prisma models or application code.

### 1.2 Out of this document

- Prisma `schema.prisma` syntax  
- API contracts (Document 03)  
- UI components (Document 04)  
- CI/CD runbooks (Document 05 / infra docs)  

### 1.3 Column specification convention

Each entity lists columns as:

| Column | Logical type | Null | Notes |
|--------|--------------|------|-------|
| `id` | UUID | NO | Primary key |

Logical types map later to PostgreSQL / Prisma:

| Logical type | Intended PostgreSQL |
|--------------|---------------------|
| UUID | `uuid` |
| TEXT | `text` |
| VARCHAR(n) | `varchar(n)` |
| BOOL | `boolean` |
| INT | `integer` |
| BIGINT | `bigint` |
| NUMERIC(p,s) | `numeric(p,s)` |
| TIMESTAMPTZ | `timestamptz` |
| DATE | `date` |
| JSONB | `jsonb` |
| ENUM | PostgreSQL enum or check-constrained text |

---

# 2. Goals

| ID | Goal |
|----|------|
| DG-01 | Support SRS FR-001 absolute tenant isolation |
| DG-02 | Model Review 2 hierarchy: Tenant→Org→Company→Factory→Plant→Warehouse→Dept→Line→Machine |
| DG-03 | Industry-agnostic core tables; steel as template metadata + attribute packs |
| DG-04 | Tenant-scoped modules, roles, custom fields (fix Review 1 global CF/module flaw) |
| DG-05 | Soft delete / deactivate for masters; immutable posted transactions |
| DG-06 | Append-only audit suitable for break-glass and privileged actions |
| DG-07 | Index for multi-tenant list/filter by `(tenant_id, …)` |
| DG-08 | Partition strategy for high-volume ledgers and audit |
| DG-09 | Dynamic fields without breaking transactional integrity |
| DG-10 | Ready for Prisma without redesign |

---

# 3. Scope

**In scope:** OLTP PostgreSQL system of record for all SRS modules P0–P4 entities; metadata for templates, KPIs, workflows; billing/usage tables; AI credit ledgers.

**Out of scope as primary store:** object binary content (S3 keys only), search engine indexes, warehouse/OLAP engines (may receive CDC later per Review 2).

---

# 4. Dependencies

| Dependency | Role |
|------------|------|
| Document 01 SRS | Requirements source for every entity |
| Review 2 §4–5, §14–15, §24 | Tenancy, hierarchy, modules, custom fields, security |
| Review 1 | Anti-patterns to avoid (missing tenant_id indexes, global Module/CustomField, string dates, Float money) |

---

# 5. Definitions

| Term | Meaning |
|------|---------|
| **OLTP DB** | Primary PostgreSQL database |
| **Tenant-owned row** | Row with NOT NULL `tenant_id` |
| **Platform row** | Row with NULL `tenant_id` or `tenant_id` in platform realm |
| **Master data** | Slow-changing reference entities (Item, Party, Machine) |
| **Transactional document** | PO, WO, GRN, Dispatch, etc. with lifecycle status |
| **Ledger row** | Append-oriented stock/energy/cost movement |
| **Posted** | Status that freezes quantitative fields (reversal via new doc) |
| **EAV / JSONB extension** | Dynamic field storage patterns |
| **RLS** | Row Level Security |

---

# 6. Architecture References

| Source | Binding decision used here |
|--------|----------------------------|
| Review 2 §4 | Shared DB + shared schema + RLS; hybrid dedicated DB later |
| Review 2 §5 | Hierarchy and relationship principles |
| Review 2 §14 | TenantModule enablement |
| Review 2 §15 | Tenant-scoped custom fields; JSONB and/or EAV |
| Review 2 §24 | Encryption at rest, secrets not in DB as plaintext where avoidable |
| SRS BR-001…020 | Business constraints |
| SRS FR-001…093 | Functional coverage |

---

# 7. Design Decisions

| ID | Decision | Rationale |
|----|----------|-----------|
| DD-01 | Shared database, shared schema | Review 2 default tenancy |
| DD-02 | UUID primary keys for all new entities | Avoid `Date.now()` collisions (Review 1) |
| DD-03 | `tenant_id` on every business table | Isolation + indexing |
| DD-04 | PostgreSQL RLS enabled on tenant-owned tables | Defense in depth |
| DD-05 | NUMERIC for money and quantities | Never Float |
| DD-06 | TIMESTAMPTZ for all timestamps; DATE for business calendar dates | Fix Review 1 string dates |
| DD-07 | Soft delete via `deleted_at` / `status` per entity class | SRS BR-015 |
| DD-08 | Posted documents immutable; reversals are new rows | SRS BR-005 |
| DD-09 | Custom field **definitions** tenant-scoped; values in JSONB `attrs` + optional EAV | Review 2 §15 |
| DD-10 | Module registry global catalog; **TenantModule** per tenant | Fixes Review 1 global toggle pollution for enablement state |
| DD-11 | Email uniqueness per tenant (composite), not global-only | Review 2 identity rules |
| DD-12 | Enum-like statuses as PostgreSQL enums or constrained TEXT | Avoid unchecked stringly types |
| DD-13 | Audit table append-only, no updates/deletes from app | SRS FR-008 |
| DD-14 | Partition high-volume tables by time (and optionally tenant hash later) | Scale path |
| DD-15 | No industry-specific core tables for steel heats | Map to `work_order` + attrs / template views |

---

# 8. Database Naming Standards

### 8.1 General

| Object | Convention | Example |
|--------|------------|---------|
| Table | `snake_case`, singular or collective noun consistent | `work_order`, `stock_ledger_entry` |
| Column | `snake_case` | `tenant_id`, `created_at` |
| Primary key | `id` | |
| Foreign key column | `{table}_id` | `factory_id` |
| Unique constraint | `uq_{table}_{cols}` | `uq_user_tenant_email` |
| Check constraint | `ck_{table}_{rule}` | `ck_item_qty_nonneg` |
| Index | `ix_{table}_{cols}` | `ix_work_order_tenant_status` |
| Enum type | `{name}_enum` | `work_order_status_enum` |
| RLS policy | `rls_{table}_{name}` | `rls_item_tenant_select` |

### 8.2 Reserved column names (standard columns)

Most tenant-owned tables include:

```
id, tenant_id,
created_at, created_by, updated_at, updated_by,
deleted_at, deleted_by,   -- when soft-deletable
row_version               -- optimistic concurrency (BIGINT)
```

Transactional headers also include: `company_id`, `factory_id` (when applicable), `status`, `doc_no`, `doc_date`.

### 8.3 Schema usage

| Schema | Purpose |
|--------|---------|
| `public` (or `app`) | OLTP application tables |
| `audit` | Audit events (optional separate schema) |
| `meta` | Optional KPI/template metadata if separation desired |

v1 uses primarily `public` + logical grouping by naming prefixes is **not** required; domain clarity via table names.

---

# 9. Tenant Strategy

### 9.1 Model (Review 2)

```
Platform
 └── tenant                    -- SaaS customer workspace
      ├── organization?        -- optional holding
      ├── company+
      ├── users / roles / modules / custom fields / billing
      └── all operational data keyed by tenant_id
```

### 9.2 Tenant identification

| Mechanism | Storage |
|-----------|---------|
| Surrogate key | `tenant.id` UUID |
| Human slug | `tenant.slug` UNIQUE (for URLs/subdomains) |
| Status | `active`, `trial`, `suspended`, `pending_delete` |

### 9.3 Isolation rules

1. Application sets session variable `app.tenant_id` per request.  
2. RLS enforces `tenant_id = current_setting('app.tenant_id', true)::uuid` for tenant users.  
3. Platform Super Admin uses `app.is_platform = true` break-glass policies (audited).  
4. No business query may omit `tenant_id` predicate in application repositories (defense even if RLS on).  

### 9.4 Hybrid dedicated database (Enterprise SKU — Later)

Metadata in control plane maps `tenant_id → connection`. Same logical schema. Not required for Phase 1.

### 9.5 Cross-tenant references

**Forbidden** for operational FKs. Allowed only:

- Platform catalog tables (plan definitions, module catalog, permission catalog)  
- Explicit sharing features (none in P0)

---

# 10. Row Level Security Strategy

### 10.1 Policy pattern (tenant-owned tables)

- `SELECT/INSERT/UPDATE/DELETE` allowed when `tenant_id` matches session tenant  
- `INSERT` must force `tenant_id` = session tenant (WITH CHECK)  
- Platform role bypass via separate policy requiring `app.is_platform = 'true'` AND audit middleware  

### 10.2 Tables without tenant_id

| Table class | RLS approach |
|-------------|--------------|
| `plan`, `module_catalog`, `permission_catalog` | Read-all authenticated; write platform only |
| `audit_event` | Insert-only for app; select by tenant or platform |
| `auth_session` | Select/update by user_id; no cross-user |

### 10.3 Mandatory engineering rule

Prisma/SQL migrations must create RLS policies for every new tenant-owned table before production release (SRS NFR-001).

---

# 11. Soft Delete Strategy

| Entity class | Strategy | Query default |
|--------------|----------|---------------|
| Masters (Item, Party, Machine, Employee, Warehouse…) | `deleted_at` + often `status` | Filter `deleted_at IS NULL` |
| Users | `status=deactivated` + `deactivated_at` (keep row for FK/audit) | Exclude deactivated from pickers |
| Tenant | `status=suspended/pending_delete` | Hard delete only via legal retention job |
| Transactional documents | **No delete after Posted**; Draft may soft-delete |
| Ledger entries | **No delete**; reverse entry |
| Audit events | **No delete** |
| Custom field definitions | Soft delete; values remain in historical JSON |

### 11.1 Unique constraints with soft delete

Use partial unique indexes:

`UNIQUE (tenant_id, code) WHERE deleted_at IS NULL`

---

# 12. Audit Strategy

### 12.1 Table `audit_event` (append-only)

Captures SRS FR-008 events and Review 2 privileged actions.

| Column | Logical type | Notes |
|--------|--------------|-------|
| id | UUID | PK |
| tenant_id | UUID | NULL for pure platform events |
| actor_user_id | UUID | NULL if system |
| actor_type | TEXT | `user`, `system`, `platform`, `break_glass` |
| action | TEXT | e.g. `iam.role.assign`, `mfg.workorder.complete` |
| entity_type | TEXT | Table/logical name |
| entity_id | UUID | |
| company_id / factory_id | UUID | Optional scope dims |
| before_json | JSONB | Redacted |
| after_json | JSONB | Redacted |
| ip | TEXT | |
| user_agent | TEXT | |
| correlation_id | TEXT | |
| created_at | TIMESTAMPTZ | |

**No `updated_at`. No soft delete. No application UPDATE/DELETE.**

### 12.2 Field-level sensitivity

Password hashes, refresh tokens, payment secrets **never** appear in `before_json`/`after_json`.

### 12.3 Retention

Configurable per tenant/plan; cold storage export Later. Partition by `created_at`.

---

# 13. Temporal & Concurrency Standards

| Concern | Design |
|---------|--------|
| Created/Updated | `created_at`, `updated_at` TIMESTAMPTZ |
| Actors | `created_by`, `updated_by` → `user.id` |
| Optimistic lock | `row_version` BIGINT incremented on update |
| Business date | `doc_date` DATE in tenant timezone interpretation |
| Idempotency | Optional `idempotency_key` UNIQUE per tenant on write APIs (Document 03) stored on doc header |

---

# 14. Money, Quantity & UoM Standards

| Kind | Type | Rules |
|------|------|-------|
| Money | NUMERIC(18,4) or (18,2) by currency policy | Never FLOAT |
| Quantity | NUMERIC(18,6) | Never FLOAT |
| Currency | CHAR(3) ISO | On company and documents |
| UoM | FK to `uom` or code table | Mandatory on quantity lines |
| FX (Later) | Separate rates table | |

---

# 15. Normalization Principles

| Level | Practice |
|-------|----------|
| 3NF default | Masters and documents normalized |
| Controlled denorm | Cached `party_name` on posted docs optional; source of truth remains FK |
| JSONB | `attrs` for template/custom fields; not for core qty/status/tenant_id |
| Ledger purity | Stock movements not updated in place |
| Avoid EAV for core | EAV only for sparsely queried custom attributes |

---

# 16. Index Strategy

### 16.1 Mandatory patterns

Every tenant-owned table:

1. PK on `id`  
2. Index on `tenant_id`  
3. Composite indexes matching list filters: `(tenant_id, status)`, `(tenant_id, doc_date DESC)`, `(tenant_id, factory_id, status)`  
4. Partial uniques for soft-deleted codes  

### 16.2 High-value composites (examples)

| Table | Index |
|-------|-------|
| `work_order` | `(tenant_id, factory_id, status, doc_date DESC)` |
| `stock_ledger_entry` | `(tenant_id, warehouse_id, item_id, created_at)` |
| `dispatch` | `(tenant_id, company_id, doc_no)` UNIQUE partial |
| `user_account` | `(tenant_id, email)` UNIQUE WHERE active |
| `audit_event` | `(tenant_id, created_at DESC)`, `(entity_type, entity_id)` |
| `auth_session` | `(user_id)`, `(refresh_token_hash)` |

### 16.3 Anti-pattern (from Review 1)

Never ship operational tables without `tenant_id` indexes.

---

# 17. Partitioning Strategy

| Table | Partition key | When |
|-------|---------------|------|
| `audit_event` | RANGE `created_at` (monthly) | P0 recommend |
| `stock_ledger_entry` | RANGE `created_at` (monthly) | P1 when volume high |
| `notification_delivery` | RANGE `created_at` | P1 |
| `usage_event` | RANGE `occurred_at` | P0/P1 |
| `work_order` | Optional later by `doc_date` | P3+ |
| Tenant hash subpartition | Later Enterprise | P4 |

Application must not assume cross-partition unique without including partition key in constraints carefully—document numbers uniqueness enforced at `(tenant_id, company_id, doc_type, doc_no)` on header tables (unpartitioned or consistent design).

---

# 18. Conceptual Data Model

```
tenant
 ├─ plan_subscription / usage / invoices
 ├─ organization?
 │   └─ company
 │        ├─ factory
 │        │    ├─ plant → line → machine
 │        │    ├─ warehouse
 │        │    └─ department
 │        ├─ party (customer/supplier)
 │        ├─ item / uom / bom / routing
 │        ├─ work_order → operation_posting / issue / output / scrap / energy
 │        ├─ stock_ledger_entry
 │        ├─ purchase_order → grn
 │        ├─ sales_order → dispatch
 │        ├─ quality / maintenance / hr / finance docs
 │        └─ number_series / files links
 ├─ user_account / role / permission_assignment / group
 ├─ tenant_module / custom_field_definition
 ├─ workflow_definition / workflow_instance
 ├─ notification_* 
 └─ audit_event
```

<!-- DB_PART_1_END -->
---

# 19. Entity Catalog — Platform & Identity

## 19.1 `tenant`

| Column | Logical type | Null | Notes |
|--------|--------------|------|-------|
| id | UUID | NO | PK |
| slug | VARCHAR(64) | NO | UNIQUE |
| name | TEXT | NO | |
| status | TEXT | NO | active/trial/suspended/pending_delete |
| plan_id | UUID | YES | FK plan |
| trial_ends_at | TIMESTAMPTZ | YES | |
| owner_email | TEXT | YES | |
| max_users | INT | YES | entitlement cache |
| max_factories | INT | YES | |
| locale_default | TEXT | YES | |
| timezone_default | TEXT | YES | |
| created_at / updated_at | TIMESTAMPTZ | NO | |
| deleted_at | TIMESTAMPTZ | YES | rare |

**Constraints:** `uq_tenant_slug`.  
**SRS:** FEAT-TENANT-01, FR-009.

## 19.2 `plan` (platform catalog)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| code | VARCHAR(64) | UNIQUE |
| name | TEXT | |
| modules_json | JSONB | default module codes |
| seat_limit | INT | |
| factory_limit | INT | |
| storage_gb | INT | |
| ai_credits_monthly | INT | |
| sms_credits_monthly | INT | |
| price_monthly | NUMERIC(18,2) | |
| currency | CHAR(3) | |
| is_active | BOOL | |
| created_at / updated_at | TIMESTAMPTZ | |

## 19.3 `user_account`

| Column | Type | Null | Notes |
|--------|------|------|-------|
| id | UUID | NO | PK |
| tenant_id | UUID | YES | NULL = platform user |
| email | TEXT | NO | |
| name | TEXT | NO | |
| password_hash | TEXT | YES | null if SSO-only |
| status | TEXT | NO | active/invited/deactivated |
| mfa_enabled | BOOL | NO | default false |
| mfa_secret_encrypted | TEXT | YES | |
| employee_id | UUID | YES | FK employee |
| last_login_at | TIMESTAMPTZ | YES | |
| deactivated_at | TIMESTAMPTZ | YES | |
| created_at / updated_at | TIMESTAMPTZ | NO | |
| row_version | BIGINT | NO | |

**Constraints:**  
`uq_user_tenant_email` UNIQUE (`tenant_id`, `email`) WHERE status <> deactivated (platform users: UNIQUE email WHERE tenant_id IS NULL).

## 19.4 `auth_session`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK (sid in JWT) |
| user_id | UUID | FK CASCADE |
| tenant_id | UUID | denorm for revoke queries |
| refresh_token_hash | TEXT | UNIQUE indexed |
| client_signature | TEXT | |
| ip_address | TEXT | |
| user_agent | TEXT | |
| expires_at | TIMESTAMPTZ | |
| revoked_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |

**SRS:** Auth sessions; Review 2 hybrid auth.

## 19.5 `user_identity` (SSO links)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| user_id | UUID | |
| tenant_id | UUID | |
| provider | TEXT | google/microsoft/saml:{id} |
| provider_subject | TEXT | |
| created_at | TIMESTAMPTZ | |

UNIQUE (`tenant_id`, `provider`, `provider_subject`).

## 19.6 `password_reset_token` / `invite_token`

Short-lived hashed tokens; tenant_id + user_id; expires_at; consumed_at.

---

# 20. Entity Catalog — Organization

## 20.1 `organization`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | NO |
| name | TEXT | |
| code | VARCHAR(64) | |
| status | TEXT | |
| standard columns | | soft delete |

UNIQUE (`tenant_id`, `code`) WHERE deleted_at IS NULL.

## 20.2 `company`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | NO |
| organization_id | UUID | YES |
| name | TEXT | |
| code | VARCHAR(64) | |
| tax_id | TEXT | YES |
| currency | CHAR(3) | NO |
| address_json | JSONB | YES |
| status | TEXT | |
| soft delete + audit cols | | |

UNIQUE (`tenant_id`, `code`) WHERE deleted_at IS NULL.

## 20.3 `factory` (site)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | NO |
| company_id | UUID | NO |
| name / code | | |
| timezone | TEXT | |
| address_json | JSONB | |
| status | TEXT | |
| soft delete | | |

UNIQUE (`tenant_id`, `company_id`, `code`) WHERE deleted_at IS NULL.  
INDEX (`tenant_id`, `company_id`).

## 20.4 `plant`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | NO |
| factory_id | UUID | NO |
| name / code / plant_type / status | | |
| soft delete | | |

## 20.5 `warehouse`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | NO |
| factory_id | UUID | NO |
| name / code | | |
| warehouse_type | TEXT | RM/FG/SCRAP/STORES/WIP |
| status | TEXT | |
| soft delete | | |

## 20.6 `department`

tenant_id, factory_id, name, code, manager_employee_id, status, soft delete.

## 20.7 `production_line`

tenant_id, plant_id, name, code, sequence_no, status, soft delete.

## 20.8 `machine`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | NO |
| plant_id | UUID | YES |
| production_line_id | UUID | YES |
| name / code | | |
| asset_class | TEXT | furnace/mill/other |
| capacity_json | JSONB | |
| status | TEXT | |
| soft delete | | |

**SRS:** FR-020–024, org screens.

---

# 21. Entity Catalog — IAM

## 21.1 `permission_catalog` (platform)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| code | TEXT | UNIQUE e.g. `mfg.workorder.create` |
| module_code | TEXT | |
| description | TEXT | |

## 21.2 `role`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | YES NULL=platform template seed copy source |
| code | VARCHAR(64) | |
| name | TEXT | |
| is_system | BOOL | shipped template |
| is_template | BOOL | |
| description | TEXT | |
| soft delete | | |

UNIQUE (`tenant_id`, `code`) WHERE deleted_at IS NULL.

## 21.3 `role_permission`

role_id, permission_id. UNIQUE (role_id, permission_id).

## 21.4 `user_role`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | NO |
| user_id | UUID | NO |
| role_id | UUID | NO |
| created_at | TIMESTAMPTZ | |

UNIQUE (`user_id`, `role_id`).

## 21.5 `user_scope`

Limits user to factories/warehouses (SRS FEAT-IAM-02).

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | NO |
| user_id | UUID | NO |
| scope_type | TEXT | factory/warehouse/company |
| scope_id | UUID | NO |

UNIQUE (`user_id`, `scope_type`, `scope_id`).

## 21.6 `group` / `group_member` / `group_role`

Tenant-scoped groups for workflow assignees (P1).

## 21.7 `policy_rule` (P2+ ABAC)

tenant_id, name, effect allow/deny, condition_json, priority — optional Phase later.

---

# 22. Entity Catalog — Modules, Entitlements, Flags

## 22.1 `module_catalog` (platform)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| code | VARCHAR(64) | UNIQUE MOD-* codes |
| name | TEXT | |
| description | TEXT | |
| depends_on_json | JSONB | module codes |
| is_always_on | BOOL | |
| sort_order | INT | |

## 22.2 `tenant_module`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | NO |
| module_code | TEXT | NO |
| enabled | BOOL | NO |
| config_json | JSONB | |
| enabled_at / disabled_at | TIMESTAMPTZ | |

UNIQUE (`tenant_id`, `module_code`).  
**Fixes Review 1:** enablement is per-tenant, not a single global `Module.active`.

## 22.3 `feature_flag_definition` / `feature_flag_override`

Platform defaults + tenant overrides (Review 2 §11).

## 22.4 `plan_module`

plan_id + module_code entitlement bridge.

---

# 23. Entity Catalog — Inventory

## 23.1 `uom`

tenant_id (or platform shared seed per tenant copy), code, name, soft delete.  
UNIQUE (`tenant_id`, `code`) WHERE deleted_at IS NULL.

## 23.2 `item`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | NO |
| company_id | UUID | YES if multi-company items isolated |
| code | VARCHAR(64) | |
| name | TEXT | |
| item_type | TEXT | RM/WIP/FG/SPARE/CONSUMABLE |
| uom_id | UUID | NO |
| tracking_type | TEXT | none/lot/serial |
| valuation_method | TEXT | standard/average/fifo |
| status | TEXT | |
| attrs | JSONB | custom + template attributes |
| soft delete + std cols | | |

UNIQUE (`tenant_id`, `code`) WHERE deleted_at IS NULL.  
INDEX (`tenant_id`, `item_type`, `status`).

## 23.3 `stock_balance` (optional materialized)

tenant_id, warehouse_id, item_id, lot_id NULL, qty_on_hand NUMERIC, updated_at.  
UNIQUE (`warehouse_id`, `item_id`, `lot_id`).  
Maintained by triggers or application on ledger post — choose one in Playbook; design allows either.

## 23.4 `lot`

tenant_id, item_id, lot_code, manufactured_date, expiry_date, attrs, soft delete.  
UNIQUE (`tenant_id`, `item_id`, `lot_code`) WHERE deleted_at IS NULL.

## 23.5 `stock_ledger_entry` (append-only)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | NO |
| company_id | UUID | NO |
| factory_id | UUID | YES |
| warehouse_id | UUID | NO |
| item_id | UUID | NO |
| lot_id | UUID | YES |
| qty_in | NUMERIC(18,6) | |
| qty_out | NUMERIC(18,6) | |
| uom_id | UUID | |
| unit_cost | NUMERIC(18,6) | YES |
| movement_type | TEXT | GRN/ISSUE/OUTPUT/TRANSFER_IN/OUT/ADJUST/DISPATCH |
| ref_doc_type | TEXT | |
| ref_doc_id | UUID | |
| ref_line_id | UUID | YES |
| occurred_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |
| created_by | UUID | |

**No updates/deletes.** Partition by `created_at`.  
INDEX (`tenant_id`, `warehouse_id`, `item_id`, `created_at`).

## 23.6 `stock_transfer` / `stock_transfer_line`

Header+lines; status draft/posted; posting writes ledger pairs.

## 23.7 `stock_adjustment` / `stock_adjustment_line`

Reason code required (SRS).

---

# 24. Entity Catalog — Manufacturing

## 24.1 `bom_header` / `bom_line`

Header: tenant_id, company_id, parent_item_id, version, is_active, effective_from/to, attrs.  
Line: component_item_id, qty, uom_id, scrap_percent, sequence.  
UNIQUE (`tenant_id`, `parent_item_id`, `version`) WHERE deleted_at IS NULL.

## 24.2 `routing_header` / `routing_operation`

Header: tenant_id, item_id, plant_id, version.  
Operation: sequence, machine_id/work_center, std_time_minutes, name.

## 24.3 `work_order`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | NO |
| company_id | UUID | NO |
| factory_id | UUID | NO |
| plant_id | UUID | YES |
| doc_no | TEXT | number series |
| doc_date | DATE | |
| wo_type | TEXT | GENERIC/MELT/ROLL/... |
| status | TEXT | draft/released/in_progress/completed/cancelled |
| item_id | UUID | output item |
| qty_planned | NUMERIC | |
| qty_completed | NUMERIC | |
| bom_header_id | UUID | YES |
| routing_header_id | UUID | YES |
| priority | INT | |
| planned_start / planned_end | TIMESTAMPTZ | |
| attrs | JSONB | heat_no, billet_size, shift, etc. |
| row_version | BIGINT | |
| std soft/audit cols | | Draft soft-delete only |

UNIQUE (`tenant_id`, `company_id`, `doc_no`).  
INDEX (`tenant_id`, `factory_id`, `status`, `doc_date DESC`).  
INDEX (`tenant_id`, `(attrs->>'heat_no')`) expression for steel when needed.

## 24.4 `work_order_operation_posting`

WO operation results: good_qty, reject_qty, downtime_minutes, posted_at, machine_id, attrs.

## 24.5 `work_order_material_issue` / `_line`

Issues to WO; posts stock ledger ISSUE.

## 24.6 `work_order_output`

Output receipts; posts OUTPUT ledger; links lot/heat refs in attrs.

## 24.7 `work_order_scrap`

reason_code, qty, disposition, links operation optional.

## 24.8 `energy_log`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | NO |
| factory_id | UUID | |
| work_order_id | UUID | YES |
| machine_id | UUID | YES |
| utility_type | TEXT | power/gas/water |
| quantity | NUMERIC | |
| uom_code | TEXT | kWh/Nm3 |
| period_start / period_end | TIMESTAMPTZ | |
| attrs | JSONB | |
| created_at | TIMESTAMPTZ | |

INDEX (`tenant_id`, `work_order_id`).

## 24.9 `downtime_event` (P2)

machine_id, reason, minutes, wo link optional.

---

# 25. Entity Catalog — Procurement & Sales

## 25.1 `party`

Unified customer/supplier (SRS party concept).

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | NO |
| company_id | UUID | YES |
| code | VARCHAR(64) | |
| name | TEXT | |
| is_customer | BOOL | |
| is_supplier | BOOL | |
| credit_limit | NUMERIC | YES |
| payment_terms | TEXT | YES |
| contacts_json | JSONB | |
| attrs | JSONB | |
| status | TEXT | |
| soft delete | | |

UNIQUE (`tenant_id`, `code`) WHERE deleted_at IS NULL.

## 25.2 `purchase_order` / `purchase_order_line`

Header: party_id (supplier), status (draft/in_approval/approved/cancelled/closed), doc_no, currency, totals, attrs.  
Lines: item_id, qty, uom_id, unit_price, tax_json.  
Approval via workflow_instance.

## 25.3 `grn` / `grn_line`

Receipt into warehouse; optional po_id; posts GRN ledger; vehicle_no in attrs (steel scrap).

## 25.4 `sales_order` / `sales_order_line`

Analogous to PO on customer side.

## 25.5 `dispatch` / `dispatch_line` (challan)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | NO |
| company_id | UUID | NO |
| factory_id | UUID | YES |
| doc_no | TEXT | challan number series |
| doc_date | DATE | |
| party_id | UUID | customer |
| sales_order_id | UUID | YES |
| status | TEXT | draft/confirmed/cancelled |
| vehicle_no | TEXT | YES |
| freight_amount | NUMERIC | YES |
| currency | CHAR(3) | |
| attrs | JSONB | |
| confirmed_at | TIMESTAMPTZ | YES |

Lines: item_id, qty, unit_price, amount, lot_id optional.  
Confirm posts DISPATCH stock out.  
UNIQUE (`tenant_id`, `company_id`, `doc_no`).  
**SRS:** BR-014, FR-052.

---

# 26. Entity Catalog — Quality, Maintenance, HR, Finance

## 26.1 Quality

- `quality_spec` / `quality_spec_parameter`  
- `quality_inspection` / `quality_inspection_result` (ref_doc_type/id)  
- `ncr` / `capa`  

All tenant_id + company/factory scope columns as needed; attrs JSONB.

## 26.2 Maintenance

- `maint_asset` (often 1:1 with machine)  
- `maint_pm_schedule`  
- `maint_work_order` / parts lines  

## 26.3 HR

- `employee` (code, name, department_id, factory_id, designation, join_date, status, contacts_json)  
- `leave_request` (type, dates, status, workflow)  
- `attendance_record` (P2)  

## 26.4 Finance (P3)

- `fin_invoice` / lines (AR)  
- `fin_bill` / lines (AP)  
- `fin_payment` / allocations  
- `fin_journal` / lines  

Posted documents immutable; link to source dispatch/GRN via ref fields.

---

# 27. Entity Catalog — Workflows & Notifications

## 27.1 `workflow_definition`

tenant_id, code, name, doc_type, is_active, version, graph_json (steps/conditions), published_at.

## 27.2 `workflow_instance`

definition_id, tenant_id, doc_type, doc_id, status (running/approved/rejected/cancelled), started_by, started_at, completed_at.

## 27.3 `workflow_task`

instance_id, step_key, assignee_user_id / role_id / group_id, status, due_at, acted_by, acted_at, comment.

## 27.4 Notifications

| Table | Purpose |
|-------|---------|
| `notification_template` | tenant_id, event_code, channel, subject, body |
| `notification_preference` | user_id, event_code, channels_json |
| `notification_inapp` | user_id, title, body, read_at, link |
| `notification_delivery` | channel, provider_ref, status, attempts, created_at (partitioned) |

---

# 28. Entity Catalog — Files, Settings, Number Series

## 28.1 `file_object`

tenant_id, storage_key, filename, mime, size_bytes, checksum, created_by, created_at, deleted_at.

## 28.2 `file_link`

file_id, entity_type, entity_id, purpose.

## 28.3 `tenant_setting`

tenant_id, key, value_json. UNIQUE (`tenant_id`, `key`).

## 28.4 `tenant_branding`

tenant_id UNIQUE, logo_file_id, colors_json, letterhead_html/pdf ref.

## 28.5 `number_series`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | NO |
| company_id | UUID | NO |
| doc_type | TEXT | WO/PO/DISPATCH/... |
| prefix | TEXT | |
| next_value | BIGINT | |
| pad_length | INT | |
| reset_policy | TEXT | never/yearly |

UNIQUE (`tenant_id`, `company_id`, `doc_type`).  
Increment must be transactional/safe under concurrency.

---

# 29. Entity Catalog — Billing & Usage

## 29.1 `subscription`

tenant_id UNIQUE active, plan_id, status, current_period_start/end, cancel_at.

## 29.2 `invoice` (billing)

platform billing invoices to tenant: amounts, status, pdf_file_id, external_psp_id.

## 29.3 `payment_method` (tokenized refs only)

## 29.4 `coupon` / `subscription_coupon`

## 29.5 `usage_event`

tenant_id, meter_code (seat/api/storage/ai/sms), quantity, occurred_at, meta_json. Partitioned.

## 29.6 `credit_wallet` / `credit_ledger_entry`

AI/SMS credits; append-only ledger; balance table optional.

---

# 30. Entity Catalog — Analytics Metadata & AI

## 30.1 `kpi_definition`

code, name, formula_description, module_code, version — platform + tenant overrides optional.

## 30.2 `report_definition`

code, name, query_key, default_params_json, module_code.

## 30.3 `report_schedule`

tenant_id, report_code, cron, channel, recipients_json, last_run_at.

## 30.4 AI

| Table | Purpose |
|-------|---------|
| `ai_conversation` | tenant_id, user_id, title |
| `ai_message` | conversation_id, role, content, citations_json |
| `ai_prediction_run` | type, params, result_json, status, created_at |
| `ai_document_chunk` | RAG chunks metadata + embedding ref (vector store may be external) |

All tenant_id scoped. **SRS:** AI advisory; no bypass of RBAC via data design.

---

# 31. Dynamic Fields & Metadata Model

## 31.1 `custom_field_definition`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| tenant_id | UUID | NO — **never global** |
| entity_type | TEXT | item/work_order/party/dispatch/... |
| field_key | VARCHAR(64) | |
| label | TEXT | |
| field_type | TEXT | text/number/select/date/bool/json |
| options_json | JSONB | |
| is_required | BOOL | |
| sort_order | INT | |
| validation_json | JSONB | |
| is_indexed | BOOL | request expression index |
| soft delete | | |

UNIQUE (`tenant_id`, `entity_type`, `field_key`) WHERE deleted_at IS NULL.

## 31.2 Value storage

**Primary:** `attrs JSONB` on entity row (Review 2 §15).  
**Secondary (optional EAV):** `custom_field_value` (tenant_id, entity_type, entity_id, field_key, value_text, value_num, value_bool, value_date) for filtered reporting.

## 31.3 Rules

- Core columns (qty, status, tenant_id, doc_no) **never** only in attrs  
- Unknown keys rejected at API using definitions  
- Steel template fields live as attrs keys namespaced `steel.*` or pack-defined keys  

---

# 32. Industry Template Data Model

## 32.1 `industry_template`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| code | TEXT | UNIQUE steel/garments/... |
| name | TEXT | |
| version | TEXT | |
| manifest_json | JSONB | modules, fields, roles, workflows, reports, navigations |
| is_published | BOOL | |

## 32.2 `tenant_industry_template`

tenant_id, template_code, template_version, status enabled/disabled, installed_at, config_json.  
UNIQUE (`tenant_id`, `template_code`).

## 32.3 Install semantics

Installing writes: tenant_module rows, custom_field_definition rows, role clones, workflow_definition seeds, report_schedule optional — all **tenant-scoped**. Disabling sets status; does not hard-delete transactional data (SRS BR-020).

---

# 33. Steel Template Mapping Tables

Steel does **not** require `scrap_record` / `billet_record` core tables. Mapping:

| Steel UI concept | Storage |
|------------------|---------|
| Scrap receiving | `grn` + lines + party supplier + item scrap grades + attrs (vehicle_no, expenses) |
| Scrap yard stock | `stock_balance` / ledger in SCRAP warehouse |
| Furnace heat | `work_order` wo_type=`MELT` + attrs.heat_no + energy_log + issues/outputs/scrap |
| Billet stock | inventory of billet items |
| Rolling | `work_order` wo_type=`ROLL` + attrs |
| Rod stock | FG inventory |
| Dispatch | `dispatch` |
| Party ledger | views over party + dispatch/GRN/invoices |
| Yield KPIs | computed from WO posts / reporting layer |

### 33.1 Recommended steel attrs (documentation keys)

`heat_no`, `shift`, `billet_size`, `rod_size`, `runtime_min`, `downtime_min`, `scrap_category`, `vehicle_no`, `freight_amount`, `expenses` — all in JSONB attrs / lines as appropriate.

### 33.2 Optional convenience views (non-authoritative)

`vw_steel_heat`, `vw_steel_rolling` — SQL views for reports; not second source of truth.

---

# 34. Business Constraints Catalog

| ID | Constraint | Enforcement |
|----|------------|-------------|
| BC-01 | tenant_id NOT NULL on business tables | Schema + RLS |
| BC-02 | Soft-unique codes per tenant | Partial UNIQUE |
| BC-03 | Posted doc no UPDATE of qty fields | Status check + app |
| BC-04 | Ledger append-only | Revoke UPDATE/DELETE grants |
| BC-05 | Dispatch confirm requires stock policy | App + optional DB trigger |
| BC-06 | heat_no unique per factory when present | Unique index on expression WHERE wo_type=MELT |
| BC-07 | challan doc_no unique per company | UNIQUE |
| BC-08 | Last owner protection | App (DB trigger optional) |
| BC-09 | Module disable retains data | No cascade delete of facts |
| BC-10 | Custom field definitions tenant-bound | FK tenant_id NOT NULL |
| BC-11 | user email unique per tenant | Partial UNIQUE |
| BC-12 | FK org integrity: warehouse.factory.tenant = warehouse.tenant | Composite FK or triggers |
| BC-13 | Number series concurrency safe | UPDATE … RETURNING in txn |
| BC-14 | Credit wallet never negative without overage flag | CHECK or ledger validation |
| BC-15 | Audit immutable | No UPDATE/DELETE |

### 34.1 Referential integrity pattern

Prefer PostgreSQL FKs. For multi-tenant consistency, use composite foreign keys where supported:

`(tenant_id, factory_id) REFERENCES factory(tenant_id, id)`  
requires UNIQUE(`tenant_id`, `id`) on parent (always true if id global unique — still store tenant_id for RLS).

---

# 35. Entity Relationship Summary

### 35.1 Core ER (ASCII)

```
tenant 1──* company 1──* factory 1──* warehouse
                 │          ├──* plant 1──* production_line 1──* machine
                 │          └──* department
                 ├──* party
                 ├──* item
                 ├──* work_order *──* energy_log
                 ├──* purchase_order / grn
                 └──* sales_order / dispatch

tenant 1──* user_account *──* user_role *── role *──* permission_catalog
tenant 1──* tenant_module
tenant 1──* custom_field_definition
tenant 1──* workflow_definition 1──* workflow_instance
tenant 1──* audit_event
```

### 35.2 Cardinality highlights

| Parent | Child | Card |
|--------|-------|------|
| Tenant | Company | 1:N |
| Company | Factory | 1:N |
| Factory | Warehouse | 1:N |
| Item | BOM versions | 1:N |
| Work Order | Postings | 1:N |
| Party | Dispatch | 1:N |
| User | Sessions | 1:N |
| WO | Stock ledger refs | 1:N via ref_doc |

---

# 36. Physical Design Guidelines (Pre-Prisma)

1. PostgreSQL 15+ recommended.  
2. Enable RLS on tenant-owned tables.  
3. Use `uuid` PKs (`gen_random_uuid()`).  
4. NUMERIC only for money/qty.  
5. JSONB GIN indexes only where filter selectivity justified.  
6. Connection pooling via PgBouncer transaction mode — prepare statements carefully (ops note).  
7. Migrations forward-only; expand/contract for enums.  
8. Separate `DIRECT_URL` for migrations (already in current ops practice).  
9. Vacuum/analyze strategy for ledger partitions.  
10. Prisma mapping document should 1:1 mirror these names where possible.

---

# 37. Migration & Seed Strategy

| Phase | Seeds |
|-------|-------|
| P0 | Plans, module_catalog, permission_catalog, platform roles, demo tenant optional |
| P1 | UoM defaults per tenant on create, number series defaults |
| P2 | Steel industry_template manifest |
| Always | Never seed plaintext production passwords in shared envs |

Tenant provisioning transaction: create tenant → owner user → default company/factory optional → always-on tenant_modules → default roles from templates → number series → settings.

---

# 38. Best Practices

1. Every new table checklist: tenant_id? RLS? indexes? soft delete? audit?  
2. Do not recreate Review 1 global Module/CustomField.  
3. Prefer views for steel, not duplicate fact tables.  
4. Document expression indexes for hot attrs keys.  
5. Keep ledger and audit append-only grants.  
6. Measure cardinality before partitioning.  
7. Redact secrets from audit JSON.  
8. Composite uniqueness always includes tenant_id.  
9. Avoid cross-tenant FKs.  
10. Design for Document 03 pagination (`created_at`, `id` cursors).

---

# 39. Future Expansion

- Dedicated DB per tenant connection table  
- Native `vector` embeddings table if in-DB RAG  
- Inventory close / fiscal period tables  
- Multi-currency valuation ledgers  
- IoT meter raw ingest tables  
- Sharding by tenant hash  

---

# 40. Appendices

## Appendix A — Entity index (v1.0)

Platform: tenant, plan, plan_module, module_catalog, permission_catalog, feature_flag_*  
Identity: user_account, auth_session, user_identity, invite/reset tokens  
Org: organization, company, factory, plant, warehouse, department, production_line, machine  
IAM: role, role_permission, user_role, user_scope, group*  
Modules: tenant_module  
Inventory: uom, item, lot, stock_balance, stock_ledger_entry, stock_transfer*, stock_adjustment*  
Manufacturing: bom_*, routing_*, work_order, postings, energy_log, downtime_event  
Procure/Sales: party, purchase_order*, grn*, sales_order*, dispatch*  
QA/MNT/HR/FIN: as §26  
Workflow/Notify/Files/Settings/Billing/Analytics/AI/Templates: as §27–33  
Audit: audit_event  

## Appendix B — SRS traceability (sample)

| SRS | Tables |
|-----|--------|
| FR-001 | tenant_id + RLS all business |
| FR-035 | work_order + postings |
| FR-052 | dispatch* |
| FR-071 | custom_field_definition + attrs |
| FR-080 | template + WO types + views |
| FR-090 | subscription, invoice, usage_event |

## Appendix C — Anti-pattern checklist (must not ship)

| Anti-pattern | Source |
|--------------|--------|
| Global custom fields | Review 1 |
| Global module active flag only | Review 1 |
| FLOAT money | Review 1 |
| String dates for doc_date | Review 1 |
| Missing tenant_id indexes | Review 1 |
| Hard delete posted ledgers | SRS BR-005 |

## Appendix D — Pre-Prisma handoff checklist

- [ ] All P0 entities named  
- [ ] RLS policy templates agreed  
- [ ] Partial uniques defined  
- [ ] Partition candidates listed  
- [ ] Seed manifests for permissions/modules  
- [ ] Steel mapped to core without duplicate facts  

---

# 41. Cross References

| Document | Path |
|----------|------|
| SRS | [`01_SRS.md`](./01_SRS.md) |
| Review 1 | [`REVIEW_1_Architecture_Audit.md`](./REVIEW_1_Architecture_Audit.md) |
| Review 2 | [`REVIEW_2_Enterprise_Architecture.md`](./REVIEW_2_Enterprise_Architecture.md) |
| Documentation System | [`00_Documentation_System.md`](./00_Documentation_System.md) |
| Documents Index | [`README.md`](./README.md) |
| Document 03 API | `03_API_Specification.md` (next) |
| Document 04 UI/UX | `04_UI_UX_Design_System.md` |
| Document 05 Playbook | `05_Development_Playbook.md` |

---

## Document completion status

| Area | Status |
|------|--------|
| Tenant/RLS/Audit/Soft delete/Indexes/Partitioning | Complete |
| Entity catalogs P0–P4 | Complete (logical) |
| Dynamic fields & industry templates | Complete |
| Steel mapping | Complete |
| Prisma schema | **Explicitly out of scope** (next engineering task after approval) |

---

**End of Document 02 — Enterprise Database Design Document v1.0.0**

*Softlligence Manufacturing Cloud — Official Data Architecture*  
*Based on Document 01 SRS. Bound by Review 2. Architecture decisions win on conflict.*
