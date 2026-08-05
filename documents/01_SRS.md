# Softlligence Manufacturing Cloud  
## Document 01 — Software Requirements Specification (SRS)

| Field | Value |
|-------|--------|
| **Document ID** | SMC-DOC-01 |
| **Title** | Software Requirements Specification |
| **Product** | Softlligence Manufacturing Cloud |
| **Classification** | Official Product Specification |
| **Version** | 1.0.0 |
| **Status** | Draft for Engineering Baseline |
| **Owner** | Softlligence Technologies — Product Management |
| **Audience** | Product, Engineering (50+), QA, DevOps, Security, UX, AI, PMs, BAs, POs |
| **Architecture Authority** | Review 1 + Review 2 (**FINAL**) |
| **Delivery plan** | [`../plan.md`](../plan.md) · Phase 1: [`PHASE_1_SCOPE.md`](./PHASE_1_SCOPE.md) |
| **Near-term deploy** | Vercel + Render + Supabase — [`DEPLOY.md`](./DEPLOY.md) |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-08-04 | Softlligence Documentation Team | Initial official SRS baseline aligned to Review 2 |

---

## Table of Contents

1. [Document Control & Conventions](#1-document-control--conventions)
2. [Vision](#2-vision)
3. [Mission](#3-mission)
4. [Business Goals](#4-business-goals)
5. [Scope](#5-scope)
6. [Non-Goals](#6-non-goals)
7. [Definitions & Glossary](#7-definitions--glossary)
8. [Architecture References](#8-architecture-references)
9. [Stakeholders & Personas](#9-stakeholders--personas)
10. [User Roles](#10-user-roles)
11. [Permissions Catalog](#11-permissions-catalog)
12. [Module Catalog](#12-module-catalog)
13. [Feature Catalog](#13-feature-catalog)
14. [Portals, Navigation & Information Architecture](#14-portals-navigation--information-architecture)
15. [Screen Catalog (Every Screen)](#15-screen-catalog-every-screen)
16. [Form Catalog (Every Form)](#16-form-catalog-every-form)
17. [Action & Button Catalog](#17-action--button-catalog)
18. [Functional Requirements](#18-functional-requirements)
19. [Business Rules](#19-business-rules)
20. [Workflows & Approval System](#20-workflows--approval-system)
21. [Notification Requirements](#21-notification-requirements)
22. [Reports Catalog](#22-reports-catalog)
23. [Dashboards & KPI Catalog](#23-dashboards--kpi-catalog)
24. [Industry Templates](#24-industry-templates)
25. [Steel Mill Template — Modules & Screens](#25-steel-mill-template--modules--screens)
26. [Future Industry Templates](#26-future-industry-templates)
27. [AI Features](#27-ai-features)
28. [Subscription & Billing Features](#28-subscription--billing-features)
29. [Super Admin Portal Requirements](#29-super-admin-portal-requirements)
30. [Company Admin Portal Requirements](#30-company-admin-portal-requirements)
31. [Factory / Plant User Requirements](#31-factory--plant-user-requirements)
32. [Employee Journey](#32-employee-journey)
33. [Customer Journey](#33-customer-journey)
34. [Supplier Journey](#34-supplier-journey)
35. [Non-Functional Requirements](#35-non-functional-requirements)
36. [Design Decisions (Product)](#36-design-decisions-product)
37. [Best Practices (Product)](#37-best-practices-product)
38. [Future Expansion](#38-future-expansion)
39. [Appendices](#39-appendices)
40. [Cross References](#40-cross-references)

---

# 1. Document Control & Conventions

### 1.1 Purpose of this SRS

This Software Requirements Specification defines **what** Softlligence Manufacturing Cloud must do as a product. It is the official product specification used before database design (Document 02), API specification (Document 03), UI/UX design system (Document 04), and the development playbook (Document 05).

This document does **not** prescribe implementation technology, code structure, ORM models, or endpoint payloads. Those belong to later documents and must still obey Review 2.

### 1.2 Requirement identifiers

| Prefix | Meaning |
|--------|---------|
| FR-xxx | Functional requirement |
| NFR-xxx | Non-functional requirement |
| BR-xxx | Business rule |
| WF-xxx | Workflow |
| SCR-xxx | Screen |
| FRM-xxx | Form |
| ACT-xxx | Action / button |
| RPT-xxx | Report |
| KPI-xxx | Key performance indicator |
| MOD-xxx | Module |
| PERM-xxx | Permission |
| ROLE-xxx | Role |

### 1.3 Priority legend

| Priority | Meaning |
|----------|---------|
| P0 | Must ship for Core SaaS Kernel (Review 2 Phase 1) |
| P1 | Manufacturing + Inventory Core (Phase 2) |
| P2 | Steel Template completeness (Phase 3) |
| P3 | Finance / CRM depth (Phases 4–5) |
| P4 | AI + scale (Phase 6) |
| Later | Backlog / future industries |

### 1.4 Product principles (inherited)

From Review 2 — Architecture Principles:

1. Industry-agnostic core; templates for verticals  
2. Tenant isolation by design  
3. Modular enablement via entitlements  
4. Async for heavy work (product implication: long jobs show progress, not blocked UI)  
5. Server is source of truth for security (product implication: UI never grants power alone)  
6. Modular monolith until proven otherwise (no product impact beyond module packaging)  
7. Audit everything privileged  
8. Steel is a template, not the product  

---

# 2. Vision

Softlligence Manufacturing Cloud is the operating system for manufacturing companies of any industry.

Thousands of companies register into one SaaS platform. Each company receives an **isolated workspace** where they run factories, plants, warehouses, people, production, inventory, quality, maintenance, procurement, sales, finance, analytics, and AI — without affecting any other company.

Steel mills are supported as a **first-class industry template**. Garments, textile, plastic, food, chemical, paper, cement, construction, furniture, electronics, and future industries reuse the **same core product** through templates, modules, and configuration — never through forked products.

---

# 3. Mission

To give Softlligence Technologies a single, sellable manufacturing cloud that:

- Onboards a new manufacturing company in hours, not months  
- Lets Softlligence operate the platform commercially (plans, billing, support, usage)  
- Lets each company configure organization, roles, modules, and workflows to match how they work  
- Captures trustworthy operational data for decisions, compliance, and AI  
- Scales from one factory pilot to multi-site enterprise groups  

---

# 4. Business Goals

| ID | Goal | Success signal |
|----|------|----------------|
| BG-01 | Become Softlligence’s flagship manufacturing SaaS | Named product, priced plans, Super Admin revenue views |
| BG-02 | Multi-tenant isolation customers can trust | No cross-tenant data visible in any company portal |
| BG-03 | Industry expansion without rewrite | New industry = template pack, not new codebase |
| BG-04 | Replace spreadsheet / Excel MIS for steel first | Steel template covers scrap→heat→billet→rod→dispatch |
| BG-05 | Monetize via subscriptions + usage | Plans, seats, storage, AI/SMS credits |
| BG-06 | Support Softlligence operations at scale | Super Admin can manage tenants, jobs, errors, support |
| BG-07 | Enable plant-floor adoption | Factory users can complete daily tasks in under 3 clicks for common entries |
| BG-08 | Provide executive visibility | Dashboards and scheduled reports for owners and plant managers |
| BG-09 | Compliance readiness | Audit trail for privileged actions |
| BG-10 | AI as advisory layer | Forecasts and assistants improve decisions without replacing controls |

---

# 5. Scope

### 5.1 In scope (product)

- Multi-tenant SaaS workspaces (Tenant boundary per Review 2)  
- Organization hierarchy: Organization → Company → Factory/Site → Plant → Warehouse → Department → Line → Machine  
- Identity & access: users, employees, roles, permissions, scopes, MFA, SSO (enterprise)  
- Dynamic module enablement per tenant plan  
- Dynamic custom fields / forms  
- Manufacturing core: items, BOM, routing, work orders, yield, scrap, energy, cost rollup events  
- Inventory core: stock, lots/batches, transfers, valuations (conceptual)  
- Procurement & sales/dispatch masters and documents  
- Quality, maintenance (core objects)  
- HR basics: employees, leave, attendance hooks  
- Finance hooks: AR/AP documents (phased depth)  
- CRM basics: customers, suppliers, parties  
- Workflow / approval engine  
- Notifications (email, SMS, WhatsApp, Telegram, push, in-app) — product behavior  
- Reporting, dashboards, KPIs, export Excel/PDF  
- Super Admin portal  
- Company Admin portal  
- Factory / plant operational portals  
- Steel industry template  
- Subscription, billing, feature flags, quotas, credits  
- AI advisory features (phased)  
- Audit / activity visibility for admins  

### 5.2 Portals in scope

| Portal | Primary users |
|--------|----------------|
| Marketing / Public | Prospects (high-level; signup later) |
| Super Admin | Softlligence platform staff |
| Company Admin | Tenant owners / company admins |
| Operations / Plant | Supervisors, operators, sales, auditors |
| Self-service (later) | Customers / suppliers portals (phased) |

### 5.3 Industry scope (MVP path)

- **Core:** Industry-agnostic  
- **First template:** Steel Mill (Review 2 Phase 3)  
- **Documented future templates:** Garments, Textile, Plastic, Food, Chemical, Paper, Cement, Construction, Furniture, Electronics  

---

# 6. Non-Goals

The following are explicitly **out of scope** for this product definition cycle (may appear in Later):

| ID | Non-goal | Reason |
|----|----------|--------|
| NG-01 | Being only a Steel Mill MIS | Contradicts Review 2 vision |
| NG-02 | Separate product per industry | Templates only |
| NG-03 | Machine PLC direct control / SCADA replacement | Softlligence is ERP/MIS, not OT control |
| NG-04 | Full payroll statutory engine for every country on day one | HR hooks first; localized payroll later |
| NG-05 | Replacing banks / payment rails | Billing via PSP adapters |
| NG-06 | Unconstrained AI auto-posting of inventory/finance | AI is advisory unless explicitly approved closed-loop module |
| NG-07 | Client-side “role switch” that elevates privileges | Forbidden by Review 1 findings + Review 2 security principles |
| NG-08 | Sharing custom fields / modules globally across tenants | Forbidden; tenant-scoped |
| NG-09 | Guaranteeing offline-first plant apps in Phase 1 | PWA/offline later |
| NG-10 | Building a public developer marketplace in Phase 1 | Internal modules first |
| NG-11 | Multi-region active-active on day one | Active-passive later per Review 2 |
| NG-12 | Implementing Document 02–05 content inside this SRS | Separate documents |

---

# 7. Definitions & Glossary

| Term | Definition |
|------|------------|
| **Platform** | Softlligence Manufacturing Cloud operated by Softlligence Technologies |
| **Tenant** | Billing and data-isolation boundary; one SaaS customer workspace |
| **Organization** | Optional holding umbrella under a tenant |
| **Company** | Legal / fiscal operating entity |
| **Factory / Site** | Physical location |
| **Plant** | Production unit within a site |
| **Warehouse** | Inventory location |
| **Department** | Organizational unit |
| **Production Line** | Sequence of stations/machines |
| **Machine / Asset** | Maintainable equipment |
| **Employee** | HR person record |
| **User** | Login identity (may map to Employee) |
| **Module** | Product capability pack that can be enabled/disabled per entitlement |
| **Industry Template** | Pack of modules, fields, workflows, roles, KPIs, reports for a vertical |
| **Item** | Material / WIP / FG / spare / consumable master |
| **Work Order (WO)** | Production job |
| **BOM** | Bill of materials |
| **Routing** | Process steps |
| **Party** | Customer, supplier, or both |
| **Entitlement** | Plan-granted right to use modules/limits |
| **Feature Flag** | Runtime toggle (plan default + tenant override) |
| **Break-glass** | Audited Super Admin access into a tenant for support |
| **Advisory AI** | Prediction/recommendation that does not auto-mutate controlled documents without approval |

---

# 8. Architecture References

| Reference | Role in SRS |
|-----------|-------------|
| [`REVIEW_1_Architecture_Audit.md`](./REVIEW_1_Architecture_Audit.md) | As-is gaps that this product must not repeat (global modules/fields, fake role switch, take=200 as business truth, etc.) |
| [`REVIEW_2_Enterprise_Architecture.md`](./REVIEW_2_Enterprise_Architecture.md) | Target product shape: tenancy, DDD contexts, modules, portals, roadmap phases |
| [`00_Documentation_System.md`](./00_Documentation_System.md) | Documentation rules |

### 8.1 Binding product decisions from Review 2

| Topic | Binding decision |
|-------|------------------|
| Tenancy | Shared DB model with strong isolation; tenant owns workspace |
| Hierarchy | Platform → Tenant → Organization → Company → Factory → … |
| Modules | Dynamically enabled per plan/tenant |
| Custom fields | Tenant-scoped |
| Steel | Template pack mapping to generic manufacturing objects |
| AI | Tenant-scoped, metered, advisory |
| Portals | Super Admin + Company + Ops |
| Roadmap | Phases 1–6 define requirement priority bands |

---

# 9. Stakeholders & Personas

| Persona | Goals | Pain if product fails |
|---------|-------|------------------------|
| Softlligence Founder / CRO | Sell plans, show MRR, onboard logos | Cannot operate as SaaS |
| Softlligence Support | Resolve tickets with break-glass | No audit / no tenant tools |
| Company Owner / MD | See yield, stock, margin, people | Spreadsheets, no trust |
| Company Admin | Configure org, users, modules | Chaos, over-permissioning |
| Plant Manager | Daily production control | Blind spots, delayed reports |
| Melting / Production Supervisor | Log heats / WOs fast | Clunky forms, errors |
| Sales / Logistics | Dispatch & challans | Stock mismatch |
| Quality Officer | Inspections / NCR | Quality not linked to WO |
| Maintenance Engineer | PM & breakdowns | Downtime unmanaged |
| Warehouse Storekeeper | Stock accuracy | Negative stock surprises |
| Finance User | Cost & invoices | Ops data not finance-ready |
| Auditor / Viewer | Read-only truth | Can edit by mistake |
| External Customer (later) | Order status | Phone-only updates |
| External Supplier (later) | PO / ASN | Email chaos |

---

# 10. User Roles

Roles are **templates** Softlligence ships and tenants may clone/customize (Review 2 §7). Platform roles and tenant roles are separate realms.

## 10.1 Platform (Softlligence) roles

| Role ID | Role name | Description |
|---------|-----------|-------------|
| ROLE-P-SUPER | Platform Super Admin | Full platform control |
| ROLE-P-BILLING | Platform Billing Admin | Plans, invoices, credits |
| ROLE-P-SUPPORT | Platform Support Agent | Tickets, limited break-glass |
| ROLE-P-SUCCESS | Customer Success | Onboarding, health scores (read-heavy) |
| ROLE-P-SEC | Platform Security Admin | Security settings, audit export |
| ROLE-P-OPS | Platform Ops | Jobs, errors, infra health views |

## 10.2 Tenant roles (shipped templates)

| Role ID | Role name | Typical scope |
|---------|-----------|---------------|
| ROLE-T-OWNER | Tenant Owner | All companies in tenant; billing self-serve |
| ROLE-T-ADMIN | Company Admin | Company configuration & users |
| ROLE-T-PLANT | Plant Manager | One or more factories/plants |
| ROLE-T-SUP | Production Supervisor | Shop-floor WOs / steel heats |
| ROLE-T-WH | Warehouse Officer | Stock & transfers |
| ROLE-T-QC | Quality Officer | Inspections / NCR |
| ROLE-T-MNT | Maintenance Engineer | Assets / PM |
| ROLE-T-PROC | Procurement Officer | PO / GRN |
| ROLE-T-SALES | Sales & Logistics | Orders / dispatch |
| ROLE-T-FIN | Finance User | AR/AP / costing views |
| ROLE-T-HR | HR Officer | Employees / leave |
| ROLE-T-VIEW | Auditor / Viewer | Read-only |
| ROLE-T-AI | AI Analyst | AI features + analytics (no master delete) |

### 10.3 Steel template additional role labels (aliases)

These map to tenant roles with steel-oriented permission packs:

| Alias | Maps to |
|-------|---------|
| Melting Supervisor | ROLE-T-SUP + melt permissions |
| Rolling Supervisor | ROLE-T-SUP + roll permissions |
| Scrap Yard Officer | ROLE-T-WH + scrap item permissions |
| Challan Officer | ROLE-T-SALES |

### 10.4 Role rules (product)

- BR-ROLE-01: Elevating a user to a higher role requires permission `iam.user.assign_role` and cannot be done by self for Owner/Super Admin without dual control (P1+).  
- BR-ROLE-02: Viewer cannot obtain write UI controls for any module.  
- BR-ROLE-03: Platform roles never appear inside tenant role pickers.  
- BR-ROLE-04: Custom roles are tenant-scoped clones of templates.  

---

# 11. Permissions Catalog

Permissions are atomic strings (Review 2). Product UI groups them by module.

### 11.1 Convention

`domain.resource.action`  
Examples: `mfg.workorder.create`, `inv.stock.adjust`, `iam.role.manage`

### 11.2 Cross-cutting permissions

| Permission ID | Permission | Description |
|---------------|------------|-------------|
| PERM-AUDIT-READ | `audit.event.read` | View audit log |
| PERM-NOTIF-MANAGE | `notify.preference.manage` | Manage notification settings |
| PERM-REPORT-RUN | `analytics.report.run` | Run / export reports |
| PERM-REPORT-SCHED | `analytics.report.schedule` | Schedule reports |
| PERM-IMPORT | `data.import.execute` | Run Excel/CSV imports |
| PERM-EXPORT | `data.export.execute` | Export datasets |
| PERM-FILE-UPLOAD | `files.object.upload` | Upload attachments |
| PERM-SETTINGS | `settings.tenant.manage` | Tenant settings / branding |
| PERM-MODULE-VIEW | `modules.catalog.view` | See module catalog |
| PERM-MODULE-TOGGLE | `modules.tenant.toggle` | Enable/disable entitled modules |

### 11.3 IAM permissions

| Permission | Description |
|------------|-------------|
| `iam.user.read` / `create` / `update` / `deactivate` | User lifecycle |
| `iam.user.assign_role` | Assign roles |
| `iam.user.invite` | Send invites |
| `iam.role.read` / `manage` | Custom roles |
| `iam.group.manage` | Groups |
| `iam.policy.manage` | ABAC-style policies (P2+) |
| `iam.scope.assign` | Factory/warehouse scopes |

### 11.4 Organization permissions

| Permission | Description |
|------------|-------------|
| `org.company.manage` | Companies |
| `org.factory.manage` | Factories/sites |
| `org.plant.manage` | Plants |
| `org.warehouse.manage` | Warehouses |
| `org.department.manage` | Departments |
| `org.line.manage` | Lines |
| `org.machine.manage` | Machines/assets master |

### 11.5 Inventory permissions

| Permission | Description |
|------------|-------------|
| `inv.item.manage` | Item master |
| `inv.stock.read` | View stock |
| `inv.stock.adjust` | Adjustments |
| `inv.stock.transfer` | Transfers |
| `inv.lot.manage` | Lots/batches |

### 11.6 Manufacturing permissions

| Permission | Description |
|------------|-------------|
| `mfg.bom.manage` | BOM |
| `mfg.routing.manage` | Routing |
| `mfg.workorder.create` / `update` / `release` / `complete` / `cancel` | WO lifecycle |
| `mfg.operation.post` | Post operation results |
| `mfg.energy.post` | Energy logs |
| `mfg.scrap.post` | Scrap/waste posting |
| `mfg.cost.view` | Cost rollup views |

### 11.7 Procurement / Sales / Quality / Maintenance / HR / Finance / CRM

| Domain | Key permissions |
|--------|-----------------|
| Procurement | `proc.supplier.manage`, `proc.po.create`, `proc.po.approve`, `proc.grn.post` |
| Sales | `crm.customer.manage`, `sales.order.manage`, `sales.dispatch.create`, `sales.dispatch.confirm` |
| Quality | `qa.spec.manage`, `qa.inspection.post`, `qa.ncr.manage`, `qa.capa.manage` |
| Maintenance | `maint.asset.manage`, `maint.wo.manage`, `maint.pm.manage` |
| HR | `hr.employee.manage`, `hr.leave.manage`, `hr.attendance.view` |
| Finance | `fin.invoice.manage`, `fin.payment.manage`, `fin.journal.view`, `fin.cost.post_view` |
| Billing (tenant) | `billing.subscription.view`, `billing.invoice.view`, `billing.plan.change` |
| AI | `ai.assistant.use`, `ai.forecast.view`, `ai.maint.view` |

### 11.8 Platform permissions (Super Admin)

| Permission | Description |
|------------|-------------|
| `platform.tenant.manage` | Create/suspend tenants |
| `platform.tenant.impersonate` | Break-glass |
| `platform.plan.manage` | Plan catalog |
| `platform.billing.manage` | Platform billing ops |
| `platform.flag.manage` | Global feature flags |
| `platform.job.manage` | Background jobs |
| `platform.usage.view` | Metering |
| `platform.support.manage` | Tickets |

### 11.9 Permission matrix (template defaults) — summary

| Role | Write shop floor | Manage users | Billing | Platform |
|------|------------------|--------------|---------|----------|
| Platform Super Admin | No (unless break-glass) | Platform users | Yes | Yes |
| Tenant Owner | Configurable | Yes | Yes | No |
| Company Admin | Limited | Yes (company) | View | No |
| Plant Manager | Yes (scoped) | No | No | No |
| Supervisor | Yes (limited docs) | No | No | No |
| Viewer | No | No | No | No |

Full cell-by-cell matrix is maintained in Appendix A (role × permission). Product rule: **UI hides; server enforces**.

---

# 12. Module Catalog

Modules follow Review 2 §14. Each module can be entitled by plan and enabled per tenant.

| Module ID | Module name | Phase | Depends on |
|-----------|-------------|-------|------------|
| MOD-CORE | Platform Core (always on) | P0 | — |
| MOD-ORG | Organization | P0 | CORE |
| MOD-IAM | Users & Access | P0 | CORE |
| MOD-SET | Settings & Branding | P0 | CORE |
| MOD-AUDIT | Audit & Compliance | P0 | CORE |
| MOD-BILL | Subscriptions & Billing | P0 | CORE |
| MOD-NOTIF | Notifications | P0 | CORE |
| MOD-FILES | Files & Attachments | P1 | CORE |
| MOD-WF | Workflows & Approvals | P1 | IAM |
| MOD-INV | Inventory | P1 | ORG |
| MOD-MFG | Manufacturing | P1 | INV |
| MOD-PROC | Procurement | P1 | INV |
| MOD-SALES | Sales & Dispatch | P1 | INV |
| MOD-CRM | CRM | P1 | SALES |
| MOD-QA | Quality | P1 | MFG |
| MOD-MNT | Maintenance | P1 | ORG |
| MOD-HR | HR | P1 | ORG |
| MOD-FIN | Finance | P3 | INV, SALES, PROC |
| MOD-ANALYTICS | Analytics & Reports | P1 | CORE |
| MOD-AI | AI Assistant & Forecasts | P4 | ANALYTICS |
| MOD-TPL-STEEL | Steel Industry Template | P2 | MFG, INV, SALES, PROC |
| MOD-TPL-* | Other industry templates | Later | MFG, INV |

### 12.1 Always-on vs optional

- **Always-on for every tenant:** CORE, ORG (minimal), IAM, SET, AUDIT, BILL (view), NOTIF (in-app minimum)  
- **Optional / plan-gated:** INV, MFG, PROC, SALES, CRM, QA, MNT, HR, FIN, AI, templates  

---

# 13. Feature Catalog

## 13.1 Core SaaS features (P0)

| Feature ID | Feature | Description |
|------------|---------|-------------|
| FEAT-TENANT-01 | Tenant workspace | Isolated company workspace |
| FEAT-AUTH-01 | Login / logout | Email+password session |
| FEAT-AUTH-02 | MFA | TOTP for admins |
| FEAT-AUTH-03 | Password policy | Strength + breach checks (product requirement) |
| FEAT-AUTH-04 | Invite users | Email invite accept flow |
| FEAT-AUTH-05 | SSO (OIDC/SAML) | Enterprise plan |
| FEAT-ORG-01 | Org hierarchy management | Company→Factory→… CRUD |
| FEAT-IAM-01 | Roles & permissions | Template + custom roles |
| FEAT-IAM-02 | Resource scopes | Limit user to factories/warehouses |
| FEAT-MOD-01 | Module marketplace (internal) | Enable entitled modules |
| FEAT-FLAG-01 | Feature flags | Plan + tenant overrides |
| FEAT-AUDIT-01 | Audit log | Privileged action trail |
| FEAT-BILL-01 | Plan & subscription status | View current plan |
| FEAT-BILL-02 | Invoices & payments history | Tenant billing pages |
| FEAT-NOTIF-01 | In-app notifications | Bell + center |
| FEAT-NAV-01 | Entitlement-aware navigation | Hide disabled modules |

## 13.2 Manufacturing & inventory features (P1–P2)

| Feature ID | Feature |
|------------|---------|
| FEAT-INV-01 | Item master + UoM |
| FEAT-INV-02 | Stock ledger & on-hand |
| FEAT-INV-03 | Transfers & adjustments |
| FEAT-INV-04 | Lots / batches / serials (as needed) |
| FEAT-MFG-01 | BOM & routing |
| FEAT-MFG-02 | Work orders lifecycle |
| FEAT-MFG-03 | Operation posting |
| FEAT-MFG-04 | Scrap / waste / by-product |
| FEAT-MFG-05 | Energy logging |
| FEAT-MFG-06 | Yield & loss KPIs |
| FEAT-MFG-07 | WO cost rollup view |
| FEAT-PROC-01 | Suppliers & POs |
| FEAT-PROC-02 | GRN |
| FEAT-SALES-01 | Customers & sales orders |
| FEAT-SALES-02 | Dispatch / challan |
| FEAT-QA-01 | Specs & inspections |
| FEAT-QA-02 | NCR / CAPA |
| FEAT-MNT-01 | Asset register & PM |
| FEAT-MNT-02 | Breakdown work orders |
| FEAT-HR-01 | Employee directory |
| FEAT-HR-02 | Leave requests |
| FEAT-WF-01 | Configurable approvals |
| FEAT-FORM-01 | Custom fields / dynamic forms |
| FEAT-IMP-01 | Excel import mappings |
| FEAT-EXP-01 | Excel/PDF export |

## 13.3 Steel template features (P2)

| Feature ID | Feature |
|------------|---------|
| FEAT-STL-01 | Scrap receiving & yard stock |
| FEAT-STL-02 | Furnace heat logging |
| FEAT-STL-03 | Billet production & stock |
| FEAT-STL-04 | Rolling / rod production |
| FEAT-STL-05 | Melting & burning loss KPIs |
| FEAT-STL-06 | Power & gas intensity |
| FEAT-STL-07 | Party ledger views |
| FEAT-STL-08 | Steel daily / shift reports |
| FEAT-STL-09 | Steel role & field packs |
| FEAT-STL-10 | Steel Excel import pack |

## 13.4 AI & advanced (P4)

| Feature ID | Feature |
|------------|---------|
| FEAT-AI-01 | In-app chat assistant (RAG) |
| FEAT-AI-02 | Demand forecast |
| FEAT-AI-03 | Production forecast |
| FEAT-AI-04 | Inventory prediction |
| FEAT-AI-05 | Predictive maintenance |
| FEAT-AI-06 | Energy optimization advice |
| FEAT-AI-07 | AI credit wallet |

<!-- SRS_PART_1_END -->
---

# 14. Portals, Navigation & Information Architecture

## 14.1 Portal map

| Portal ID | Name | Entry URL (logical) | Who |
|-----------|------|---------------------|-----|
| PORT-PUBLIC | Public / Marketing | `/` | Prospects |
| PORT-AUTH | Authentication | `/auth/*` | All |
| PORT-SA | Super Admin | `/admin/*` | Platform roles |
| PORT-CO | Company Admin | `/app/admin/*` | Tenant owner / company admin |
| PORT-OPS | Operations | `/app/*` | Plant & functional users |

## 14.2 Global chrome (all authenticated portals)

| Element | Behavior |
|---------|----------|
| Top bar | Logo/branding, global search (P1+), notification bell, user menu |
| User menu | Profile, security (MFA), language, logout |
| Sidebar | Module navigation filtered by entitlement + permission |
| Scope switcher | Factory / warehouse scope **within tenant** (not cross-tenant security elevation) |
| Command palette | Optional P2: jump to screens |
| Environment badge | Staging only |

## 14.3 Super Admin navigation

1. Home / Platform Dashboard  
2. Tenants  
3. Subscriptions & Plans  
4. Revenue  
5. Usage & Quotas  
6. Feature Flags  
7. Jobs & Queues  
8. Errors & Health  
9. Audit (platform)  
10. Support Tickets  
11. Platform Users  
12. Settings  

## 14.4 Company Admin navigation

1. Home / Executive Dashboard  
2. Organization (Companies, Factories, Plants, Warehouses, Departments, Lines, Machines)  
3. People (Employees, Users, Roles, Groups, Invites)  
4. Modules & Entitlements  
5. Workflows  
6. Custom Fields  
7. Notifications settings  
8. Files  
9. Audit  
10. Billing  
11. Settings & Branding  
12. Link into Operations modules (as entitled)

## 14.5 Operations navigation (module-aware)

- Dashboard  
- Inventory → Items, Stock, Transfers, Adjustments, Lots  
- Manufacturing → BOMs, Routings, Work Orders, Energy, Scrap  
- Procurement → Suppliers, POs, GRNs  
- Sales → Customers, Orders, Dispatches  
- Quality → Specs, Inspections, NCRs, CAPAs  
- Maintenance → Assets, PM, Maintenance WOs  
- HR → Employees, Leave, Attendance  
- Finance → Invoices, Payments, Journals (when entitled)  
- Analytics → Dashboards, Reports, Schedules  
- AI → Assistant, Forecasts (when entitled)  
- Steel (when template enabled) → Scrap, Heats, Billets, Rolling, Party Ledger, Steel Reports  

---

# 15. Screen Catalog (Every Screen)

Screens are product surfaces. IDs are stable for UX and QA traceability.

## 15.1 Authentication screens

| Screen ID | Name | Priority | Primary actions |
|-----------|------|----------|-----------------|
| SCR-AUTH-01 | Login | P0 | Sign in, Forgot password, SSO |
| SCR-AUTH-02 | MFA Challenge | P0 | Verify TOTP, use backup code |
| SCR-AUTH-03 | Forgot Password | P0 | Request reset link |
| SCR-AUTH-04 | Reset Password | P0 | Set new password |
| SCR-AUTH-05 | Accept Invite | P0 | Set password, join tenant |
| SCR-AUTH-06 | SSO Redirect Landing | P0 | Complete IdP login |
| SCR-AUTH-07 | Tenant Picker | P0 | Choose workspace (multi-membership) |
| SCR-AUTH-08 | Locked / Suspended Tenant | P0 | Contact support message |
| SCR-AUTH-09 | Session Expired | P0 | Re-authenticate |

## 15.2 Super Admin screens

| Screen ID | Name | Priority |
|-----------|------|----------|
| SCR-SA-01 | Platform Dashboard | P0 |
| SCR-SA-02 | Tenant List | P0 |
| SCR-SA-03 | Tenant Detail | P0 |
| SCR-SA-04 | Create / Edit Tenant | P0 |
| SCR-SA-05 | Tenant Suspend / Reactivate Confirm | P0 |
| SCR-SA-06 | Break-glass Launch (reason required) | P0 |
| SCR-SA-07 | Plans Catalog | P0 |
| SCR-SA-08 | Plan Detail / Edit | P0 |
| SCR-SA-09 | Subscriptions List | P0 |
| SCR-SA-10 | Subscription Detail | P0 |
| SCR-SA-11 | Coupons | P1 |
| SCR-SA-12 | Revenue Dashboard | P0 |
| SCR-SA-13 | Invoices (platform view) | P0 |
| SCR-SA-14 | Usage Explorer | P0 |
| SCR-SA-15 | Quota Policy Editor | P1 |
| SCR-SA-16 | Feature Flags | P0 |
| SCR-SA-17 | Jobs Monitor | P0 |
| SCR-SA-18 | Job Detail / Retry | P0 |
| SCR-SA-19 | Errors & Alerts | P0 |
| SCR-SA-20 | Health Status | P0 |
| SCR-SA-21 | Platform Audit Log | P0 |
| SCR-SA-22 | Support Ticket List | P1 |
| SCR-SA-23 | Support Ticket Detail | P1 |
| SCR-SA-24 | Platform Users | P0 |
| SCR-SA-25 | Platform Roles | P0 |
| SCR-SA-26 | Platform Settings | P0 |
| SCR-SA-27 | AI Usage (platform) | P4 |
| SCR-SA-28 | Storage Usage by Tenant | P1 |

## 15.3 Company Admin — Organization screens

| Screen ID | Name | Priority |
|-----------|------|----------|
| SCR-ORG-01 | Organization Overview | P0 |
| SCR-ORG-02 | Company List | P0 |
| SCR-ORG-03 | Company Detail | P0 |
| SCR-ORG-04 | Company Create/Edit | P0 |
| SCR-ORG-05 | Factory List | P0 |
| SCR-ORG-06 | Factory Detail | P0 |
| SCR-ORG-07 | Factory Create/Edit | P0 |
| SCR-ORG-08 | Plant List | P0 |
| SCR-ORG-09 | Plant Create/Edit | P0 |
| SCR-ORG-10 | Warehouse List | P0 |
| SCR-ORG-11 | Warehouse Create/Edit | P0 |
| SCR-ORG-12 | Department List | P0 |
| SCR-ORG-13 | Department Create/Edit | P0 |
| SCR-ORG-14 | Production Line List | P1 |
| SCR-ORG-15 | Production Line Create/Edit | P1 |
| SCR-ORG-16 | Machine / Asset List | P1 |
| SCR-ORG-17 | Machine Create/Edit | P1 |
| SCR-ORG-18 | Org Chart View | P2 |

## 15.4 Company Admin — People & IAM

| Screen ID | Name | Priority |
|-----------|------|----------|
| SCR-IAM-01 | Users List | P0 |
| SCR-IAM-02 | User Detail | P0 |
| SCR-IAM-03 | Invite User | P0 |
| SCR-IAM-04 | Edit User / Assign Roles & Scopes | P0 |
| SCR-IAM-05 | Deactivate User Confirm | P0 |
| SCR-IAM-06 | Roles List | P0 |
| SCR-IAM-07 | Role Detail / Permission Matrix Editor | P0 |
| SCR-IAM-08 | Create Custom Role | P0 |
| SCR-IAM-09 | Groups List | P1 |
| SCR-IAM-10 | Group Edit | P1 |
| SCR-IAM-11 | Employees List | P1 |
| SCR-IAM-12 | Employee Detail | P1 |
| SCR-IAM-13 | Employee Create/Edit | P1 |
| SCR-IAM-14 | Link User ↔ Employee | P1 |
| SCR-IAM-15 | My Profile | P0 |
| SCR-IAM-16 | My Security (MFA, sessions, devices) | P0 |

## 15.5 Modules, fields, workflows, settings

| Screen ID | Name | Priority |
|-----------|------|----------|
| SCR-MOD-01 | Module Catalog | P0 |
| SCR-MOD-02 | Module Detail / Enable | P0 |
| SCR-CF-01 | Custom Fields List | P1 |
| SCR-CF-02 | Custom Field Create/Edit | P1 |
| SCR-WF-01 | Workflow Definitions List | P1 |
| SCR-WF-02 | Workflow Designer | P1 |
| SCR-WF-03 | Workflow Instance Tracker | P1 |
| SCR-SET-01 | Tenant Settings | P0 |
| SCR-SET-02 | Branding | P0 |
| SCR-SET-03 | Number Series | P1 |
| SCR-SET-04 | Fiscal / Locale | P0 |
| SCR-SET-05 | Notification Channels | P0 |
| SCR-SET-06 | Notification Templates | P1 |
| SCR-AUD-01 | Tenant Audit Log | P0 |
| SCR-BILL-01 | Subscription Overview | P0 |
| SCR-BILL-02 | Plan Comparison / Upgrade | P0 |
| SCR-BILL-03 | Billing Invoices | P0 |
| SCR-BILL-04 | Payment Methods | P1 |
| SCR-BILL-05 | Usage & Credits | P1 |
| SCR-FILE-01 | Files Browser | P1 |
| SCR-FILE-02 | File Detail | P1 |
| SCR-NOTIF-01 | Notification Center | P0 |
| SCR-NOTIF-02 | Notification Preferences (user) | P0 |

## 15.6 Inventory screens

| Screen ID | Name | Priority |
|-----------|------|----------|
| SCR-INV-01 | Inventory Dashboard | P1 |
| SCR-INV-02 | Items List | P1 |
| SCR-INV-03 | Item Detail | P1 |
| SCR-INV-04 | Item Create/Edit | P1 |
| SCR-INV-05 | Stock On-Hand | P1 |
| SCR-INV-06 | Stock Ledger | P1 |
| SCR-INV-07 | Transfer Create | P1 |
| SCR-INV-08 | Transfers List | P1 |
| SCR-INV-09 | Adjustment Create | P1 |
| SCR-INV-10 | Lots / Batches List | P1 |
| SCR-INV-11 | Lot Detail | P1 |
| SCR-INV-12 | Inventory Import | P1 |

## 15.7 Manufacturing screens

| Screen ID | Name | Priority |
|-----------|------|----------|
| SCR-MFG-01 | Manufacturing Dashboard | P1 |
| SCR-MFG-02 | BOM List | P1 |
| SCR-MFG-03 | BOM Detail / Edit | P1 |
| SCR-MFG-04 | Routing List | P1 |
| SCR-MFG-05 | Routing Detail / Edit | P1 |
| SCR-MFG-06 | Work Orders List | P1 |
| SCR-MFG-07 | Work Order Detail | P1 |
| SCR-MFG-08 | Work Order Create | P1 |
| SCR-MFG-09 | Release WO Confirm | P1 |
| SCR-MFG-10 | Post Operation | P1 |
| SCR-MFG-11 | Post Material Issue | P1 |
| SCR-MFG-12 | Post Output / Receipt | P1 |
| SCR-MFG-13 | Post Scrap / Waste | P1 |
| SCR-MFG-14 | Post Energy | P1 |
| SCR-MFG-15 | Complete / Close WO | P1 |
| SCR-MFG-16 | Cancel WO | P1 |
| SCR-MFG-17 | WO Cost View | P1 |
| SCR-MFG-18 | Downtime Log | P2 |

## 15.8 Procurement, Sales, Quality, Maintenance, HR, Finance

| Screen ID | Name | Priority |
|-----------|------|----------|
| SCR-PROC-01 | Procurement Dashboard | P1 |
| SCR-PROC-02 | Suppliers List | P1 |
| SCR-PROC-03 | Supplier Detail | P1 |
| SCR-PROC-04 | Supplier Create/Edit | P1 |
| SCR-PROC-05 | Purchase Orders List | P1 |
| SCR-PROC-06 | PO Detail | P1 |
| SCR-PROC-07 | PO Create/Edit | P1 |
| SCR-PROC-08 | PO Submit for Approval | P1 |
| SCR-PROC-09 | GRN List | P1 |
| SCR-PROC-10 | GRN Create | P1 |
| SCR-SALES-01 | Sales Dashboard | P1 |
| SCR-SALES-02 | Customers List | P1 |
| SCR-SALES-03 | Customer Detail | P1 |
| SCR-SALES-04 | Customer Create/Edit | P1 |
| SCR-SALES-05 | Sales Orders List | P1 |
| SCR-SALES-06 | Sales Order Detail | P1 |
| SCR-SALES-07 | Sales Order Create/Edit | P1 |
| SCR-SALES-08 | Dispatches List | P1 |
| SCR-SALES-09 | Dispatch / Challan Create | P1 |
| SCR-SALES-10 | Dispatch Detail / Print | P1 |
| SCR-QA-01 | Quality Dashboard | P1 |
| SCR-QA-02 | Specs List | P1 |
| SCR-QA-03 | Spec Edit | P1 |
| SCR-QA-04 | Inspections List | P1 |
| SCR-QA-05 | Inspection Post | P1 |
| SCR-QA-06 | NCR List | P1 |
| SCR-QA-07 | NCR Detail | P1 |
| SCR-QA-08 | CAPA Detail | P1 |
| SCR-MNT-01 | Maintenance Dashboard | P1 |
| SCR-MNT-02 | Assets List | P1 |
| SCR-MNT-03 | PM Schedules | P1 |
| SCR-MNT-04 | Maintenance WO List | P1 |
| SCR-MNT-05 | Maintenance WO Detail | P1 |
| SCR-HR-01 | HR Dashboard | P1 |
| SCR-HR-02 | Leave Requests | P1 |
| SCR-HR-03 | Leave Apply | P1 |
| SCR-HR-04 | Attendance View | P2 |
| SCR-FIN-01 | Finance Dashboard | P3 |
| SCR-FIN-02 | AR Invoices | P3 |
| SCR-FIN-03 | AP Bills | P3 |
| SCR-FIN-04 | Payments | P3 |
| SCR-FIN-05 | Journals | P3 |
| SCR-CRM-01 | CRM Pipeline (optional) | P3 |

## 15.9 Analytics, AI, Steel

| Screen ID | Name | Priority |
|-----------|------|----------|
| SCR-AN-01 | Analytics Home | P1 |
| SCR-AN-02 | Report Library | P1 |
| SCR-AN-03 | Report Runner | P1 |
| SCR-AN-04 | Scheduled Reports | P1 |
| SCR-AN-05 | KPI Dictionary | P2 |
| SCR-AI-01 | AI Assistant | P4 |
| SCR-AI-02 | Forecast Center | P4 |
| SCR-AI-03 | Predictive Maintenance | P4 |
| SCR-AI-04 | Energy Advisor | P4 |
| SCR-AI-05 | AI Credits Wallet | P4 |
| SCR-STL-01 | Steel Dashboard | P2 |
| SCR-STL-02 | Scrap Receiving List | P2 |
| SCR-STL-03 | Scrap Receiving Entry | P2 |
| SCR-STL-04 | Scrap Yard Stock | P2 |
| SCR-STL-05 | Furnace Heats List | P2 |
| SCR-STL-06 | Heat Entry | P2 |
| SCR-STL-07 | Heat Detail | P2 |
| SCR-STL-08 | Billet Production List | P2 |
| SCR-STL-09 | Billet Entry | P2 |
| SCR-STL-10 | Billet Stock | P2 |
| SCR-STL-11 | Rolling / Rod List | P2 |
| SCR-STL-12 | Rolling Entry | P2 |
| SCR-STL-13 | Rod Stock | P2 |
| SCR-STL-14 | Steel Dispatch List | P2 |
| SCR-STL-15 | Steel Party Ledger | P2 |
| SCR-STL-16 | Steel Energy Board | P2 |
| SCR-STL-17 | Steel Reports Hub | P2 |
| SCR-STL-18 | Steel Excel Import | P2 |

## 15.10 Shared utility screens

| Screen ID | Name | Priority |
|-----------|------|----------|
| SCR-SHR-01 | Global Search Results | P1 |
| SCR-SHR-02 | Approval Inbox | P1 |
| SCR-SHR-03 | Approval Decision | P1 |
| SCR-SHR-04 | Import Job Progress | P1 |
| SCR-SHR-05 | Export Job Progress | P1 |
| SCR-SHR-06 | Print Preview | P1 |
| SCR-SHR-07 | 403 Forbidden | P0 |
| SCR-SHR-08 | 404 Not Found | P0 |
| SCR-SHR-09 | Empty Module (not entitled) | P0 |
| SCR-SHR-10 | Onboarding Wizard | P0 |

---

# 16. Form Catalog (Every Form)

Each form lists required product fields at business level (not database types).

## 16.1 Auth & IAM forms

| Form ID | Screen | Fields (business) | Validation highlights |
|---------|--------|-------------------|----------------------|
| FRM-AUTH-01 | Login | Email, Password, Remember device | Email format; password required |
| FRM-AUTH-02 | MFA | OTP code | 6-digit |
| FRM-AUTH-03 | Reset Password | New password, Confirm | Policy rules |
| FRM-AUTH-04 | Invite Accept | Name, Password, Confirm | |
| FRM-IAM-01 | Invite User | Email, Name, Roles, Scopes, Employee link optional | Email unique in tenant |
| FRM-IAM-02 | Edit User | Name, Status, Roles, Scopes | Cannot remove last Owner |
| FRM-IAM-03 | Role Editor | Name, Description, Permission checkboxes | At least one permission |
| FRM-IAM-04 | Employee | Code, Name, Department, Factory, Designation, Join date, Status, Contacts | |
| FRM-IAM-05 | Profile | Display name, phone, locale, avatar | |
| FRM-IAM-06 | MFA Setup | Secret confirm / OTP | |

## 16.2 Organization forms

| Form ID | Fields |
|---------|--------|
| FRM-ORG-01 Company | Legal name, code, tax IDs, currency, address, status |
| FRM-ORG-02 Factory | Name, code, company, address, timezone, status |
| FRM-ORG-03 Plant | Name, code, factory, type, status |
| FRM-ORG-04 Warehouse | Name, code, factory, type (RM/FG/Scrap/Stores), status |
| FRM-ORG-05 Department | Name, code, factory, manager employee |
| FRM-ORG-06 Line | Name, code, plant, sequence |
| FRM-ORG-07 Machine | Name, code, line/plant, asset class, capacity meta, status |

## 16.3 Inventory & manufacturing forms

| Form ID | Fields |
|---------|--------|
| FRM-INV-01 Item | Code, name, type (RM/WIP/FG/spare), UoM, tracking (none/lot/serial), valuation method, status, custom fields |
| FRM-INV-02 Transfer | From WH, To WH, lines (item, qty, lot), reason, date |
| FRM-INV-03 Adjustment | WH, lines, reason code, date, attachment optional |
| FRM-MFG-01 BOM | Parent item, version, lines (component, qty, scrap%), effective dates |
| FRM-MFG-02 Routing | Item/plant, operations (seq, work center/machine, std time) |
| FRM-MFG-03 WO Create | Type, item, qty, BOM/routing version, factory/plant, planned dates, priority |
| FRM-MFG-04 Operation Post | WO, operation, good qty, reject qty, downtime, notes |
| FRM-MFG-05 Issue | WO, lines from BOM or manual, WH |
| FRM-MFG-06 Output | WO, item, qty, lot/heat ref, WH |
| FRM-MFG-07 Scrap | WO/operation, reason, qty, disposition |
| FRM-MFG-08 Energy | WO/operation/machine, utility type, quantity, UoM, period |

## 16.4 Procure / sales / quality / maintenance / HR / finance

| Form ID | Fields |
|---------|--------|
| FRM-PROC-01 Supplier | Code, name, contacts, payment terms, status |
| FRM-PROC-02 PO | Supplier, dates, lines (item, qty, price), taxes, delivery WH |
| FRM-PROC-03 GRN | PO ref optional, supplier, lines received, WH, vehicle/ref |
| FRM-SALES-01 Customer | Code, name, credit limit, contacts, status |
| FRM-SALES-02 SO | Customer, lines, dates, prices |
| FRM-SALES-03 Dispatch | Customer, SO optional, challan no (series), vehicle, lines (item, qty, rate), freight, dates |
| FRM-QA-01 Spec | Item, parameters, min/max, method |
| FRM-QA-02 Inspection | Ref doc (WO/GRN/Dispatch), results, pass/fail |
| FRM-QA-03 NCR | Source, severity, description, disposition |
| FRM-QA-04 CAPA | NCR link, actions, owners, due dates |
| FRM-MNT-01 Asset | Links machine, criticality |
| FRM-MNT-02 PM | Asset, frequency, checklist |
| FRM-MNT-03 Maint WO | Asset, type (PM/breakdown), description, parts, labor |
| FRM-HR-01 Leave | Type, dates, reason |
| FRM-FIN-01 Invoice | Party, lines, taxes, due date |
| FRM-FIN-02 Payment | Party, amount, method, allocations |

## 16.5 Steel template forms

| Form ID | Fields |
|---------|--------|
| FRM-STL-01 Scrap Receiving | Date, party/supplier, category/grade, vehicle no, received kg, expenses, remarks, WH, custom fields |
| FRM-STL-02 Heat | Date, heat no, furnace/machine, scrap input kg, billet output kg, billet size, runtime, downtime, power kWh, gas Nm³, shift, remarks |
| FRM-STL-03 Billet (if separate) | Heat ref, size, qty/weight, WH |
| FRM-STL-04 Rolling | Date, mill heat/ref, billet input kg, rod output kg, size/spec, downtime, burning loss, shift |
| FRM-STL-05 Steel Dispatch | Extends FRM-SALES-03 with steel size attributes |
| FRM-STL-06 Steel Import Mapping | Sheet→entity mapping wizard |

## 16.6 Admin / billing / workflow / custom field forms

| Form ID | Fields |
|---------|--------|
| FRM-SA-01 Tenant | Name, slug, owner email, plan, trial end, status |
| FRM-SA-02 Break-glass | Tenant, reason, duration |
| FRM-SA-03 Plan | Name, modules, seat limit, factory limit, storage, AI credits, price |
| FRM-CF-01 Custom Field | Entity, key, label, type, options, required, order |
| FRM-WF-01 Workflow Meta | Name, trigger doc type, active version |
| FRM-WF-02 Workflow Step | Role/user, condition, SLA hours, escalate to |
| FRM-SET-01 Branding | Logo, colors, product display name |
| FRM-SET-02 Number Series | Doc type, prefix, next number, reset policy |
| FRM-BILL-01 Upgrade | Target plan, seats |
| FRM-NOTIF-01 Channel Config | Provider toggles, sender IDs (masked secrets) |
| FRM-IMP-01 Import Upload | File, template type, dry-run toggle |

---

# 17. Action & Button Catalog

Primary actions that must exist on screens (product-level). Destructive actions always require confirm.

## 17.1 Universal actions

| Action ID | Label | Rules |
|-----------|-------|-------|
| ACT-SAVE | Save | Validates form; shows success/error toast |
| ACT-CANCEL | Cancel | Confirms if dirty |
| ACT-EDIT | Edit | Opens form/drawer |
| ACT-DELETE | Delete / Deactivate | Confirm modal; prefer deactivate |
| ACT-EXPORT | Export | Starts async job if large |
| ACT-IMPORT | Import | Opens import wizard |
| ACT-PRINT | Print / PDF | Print preview |
| ACT-REFRESH | Refresh | Reloads dataset |
| ACT-FILTER | Apply Filters | |
| ACT-CLEAR-FILTER | Clear | |
| ACT-SEARCH | Search | |
| ACT-BACK | Back | |
| ACT-APPROVE | Approve | Approval inbox |
| ACT-REJECT | Reject | Requires comment |
| ACT-SUBMIT | Submit for Approval | |
| ACT-ATTACH | Attach File | |
| ACT-NOTIFY-TEST | Send Test Notification | Admin |

## 17.2 Domain-specific actions

| Action ID | Label | Where |
|-----------|-------|-------|
| ACT-WO-RELEASE | Release | WO Detail |
| ACT-WO-COMPLETE | Complete | WO Detail |
| ACT-WO-CANCEL | Cancel WO | WO Detail |
| ACT-POST-OP | Post Operation | WO |
| ACT-POST-ISSUE | Issue Materials | WO |
| ACT-POST-OUTPUT | Post Output | WO |
| ACT-POST-SCRAP | Post Scrap | WO |
| ACT-POST-ENERGY | Post Energy | WO |
| ACT-PO-SEND | Send to Supplier | PO (Later channel) |
| ACT-GRN-POST | Post GRN | GRN |
| ACT-DISPATCH-CONFIRM | Confirm Dispatch | Dispatch |
| ACT-DISPATCH-PRINT | Print Challan | Dispatch |
| ACT-INV-ADJUST | Post Adjustment | Inventory |
| ACT-INV-TRANSFER | Post Transfer | Inventory |
| ACT-MOD-ENABLE | Enable Module | Module catalog |
| ACT-MOD-DISABLE | Disable Module | Confirm data retained |
| ACT-TENANT-SUSPEND | Suspend Tenant | Super Admin |
| ACT-TENANT-IMPERSONATE | Break-glass Enter | Reason required |
| ACT-JOB-RETRY | Retry Job | Jobs monitor |
| ACT-PLAN-UPGRADE | Upgrade Plan | Billing |
| ACT-AI-ASK | Ask Assistant | AI |
| ACT-STL-CALC | Calculate Yield | Steel forms (display) |

## 17.3 Row-level grid actions

For every list screen supporting CRUD: **View**, **Edit**, **Duplicate** (where safe), **Deactivate**, **Audit trail** (if permitted).

---

# 18. Functional Requirements

## 18.1 Tenant & access (P0)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001 | System shall provide isolated tenant workspaces so Company A cannot view Company B data in any company portal | P0 |
| FR-002 | System shall authenticate users and establish a session | P0 |
| FR-003 | System shall support MFA for Tenant Owner, Company Admin, and all Platform roles | P0 |
| FR-004 | System shall allow inviting users by email into a tenant | P0 |
| FR-005 | System shall enforce permissions on every privileged action | P0 |
| FR-006 | System shall support assigning factory/warehouse scopes to users | P0 |
| FR-007 | System shall present only modules the tenant is entitled to and has enabled | P0 |
| FR-008 | System shall write audit events for login failures, role changes, break-glass, module toggles, approvals, deletes | P0 |
| FR-009 | System shall allow Super Admin to create, suspend, and reactivate tenants | P0 |
| FR-010 | System shall require a written reason for break-glass and record full audit | P0 |

## 18.2 Organization (P0–P1)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-020 | System shall manage Companies under a Tenant | P0 |
| FR-021 | System shall manage Factories under Companies | P0 |
| FR-022 | System shall manage Plants, Warehouses, Departments under Factories | P0 |
| FR-023 | System shall manage Production Lines and Machines | P1 |
| FR-024 | Deleting org nodes with dependent transactions shall be blocked; deactivate instead | P0 |

## 18.3 Inventory & manufacturing (P1)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-030 | System shall maintain Item master with UoM and item type | P1 |
| FR-031 | System shall maintain on-hand stock by warehouse (and lot if tracked) | P1 |
| FR-032 | System shall support stock transfer between warehouses | P1 |
| FR-033 | System shall support controlled stock adjustments with reason | P1 |
| FR-034 | System shall support BOM and Routing versions | P1 |
| FR-035 | System shall support Work Order lifecycle: Draft→Released→In Progress→Completed/Cancelled | P1 |
| FR-036 | System shall post material issues, outputs, scrap, and energy against WOs | P1 |
| FR-037 | System shall calculate yield and loss KPIs from posted quantities | P1 |
| FR-038 | System shall present WO cost rollup from material/energy/labor inputs when available | P1 |
| FR-039 | Negative stock shall be blocked or require override permission (tenant policy) | P1 |

## 18.4 Procure, sales, quality, maintenance, HR (P1–P3)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-050 | System shall manage suppliers and purchase orders | P1 |
| FR-051 | System shall receive goods via GRN into warehouses | P1 |
| FR-052 | System shall manage customers, sales orders, and dispatches/challans | P1 |
| FR-053 | System shall support quality specs, inspections, NCR, CAPA | P1 |
| FR-054 | System shall support maintenance assets, PM, and breakdown WOs | P1 |
| FR-055 | System shall manage employees and leave requests | P1 |
| FR-056 | System shall support AR/AP documents when Finance module enabled | P3 |

## 18.5 Workflows, forms, files, notifications, analytics

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-070 | System shall allow configurable multi-step approvals for selected document types | P1 |
| FR-071 | System shall support tenant-scoped custom fields on allowed entities | P1 |
| FR-072 | System shall store attachments against documents | P1 |
| FR-073 | System shall deliver in-app notifications and support email/SMS/WhatsApp/Telegram/push per config | P0/P1 |
| FR-074 | System shall provide report library, runner, export Excel/PDF, and schedules | P1 |
| FR-075 | System shall provide role-appropriate dashboards with KPIs | P1 |
| FR-076 | Large imports/exports shall run asynchronously with progress UI | P1 |

## 18.6 Steel template (P2)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-080 | Steel template shall provide scrap receiving, heat, billet, rolling, dispatch, party ledger, energy, and steel reports | P2 |
| FR-081 | Steel screens shall map to core manufacturing/inventory/sales concepts (not a separate product) | P2 |
| FR-082 | Steel Excel import pack shall map legacy MIS sheets into template entities | P2 |
| FR-083 | Steel KPIs shall include melting yield, rolling yield, burning loss, kWh/ton, gas/ton | P2 |

## 18.7 Billing & AI

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-090 | System shall show plan, entitlements, invoices, and usage to Tenant Owner | P0 |
| FR-091 | System shall enforce seat, factory, storage, and module entitlements | P0 |
| FR-092 | AI features shall consume AI credits and remain tenant-scoped | P4 |
| FR-093 | AI outputs are advisory unless a future closed-loop module is explicitly enabled | P4 |

---

# 19. Business Rules

| ID | Rule |
|----|------|
| BR-001 | Tenant boundary is absolute in company portals |
| BR-002 | Module disabled ⇒ navigation hidden and actions denied; data retained |
| BR-003 | Custom field definitions never cross tenants |
| BR-004 | Number series are unique per company (or tenant policy) |
| BR-005 | Posted inventory/financial documents are immutable except via reversing documents |
| BR-006 | WO completion requires mandatory operations per routing policy |
| BR-007 | Dispatch cannot exceed available FG stock unless override permission |
| BR-008 | Approval rejection requires comment |
| BR-009 | Last Tenant Owner cannot be deactivated |
| BR-010 | Break-glass sessions auto-expire and are fully audited |
| BR-011 | Plan downgrade that removes modules disables modules but does not hard-delete data |
| BR-012 | Viewer role has no mutate permissions |
| BR-013 | Steel heat numbers unique per factory |
| BR-014 | Challan numbers unique per company number series |
| BR-015 | Soft delete / deactivate preferred over hard delete for masters |
| BR-016 | Scope switcher never grants another tenant’s data |
| BR-017 | Imports run dry-run before commit by default |
| BR-018 | Notifications respect user preferences and quiet hours (P1) |
| BR-019 | KPI definitions are versioned in Analytics dictionary (P2) |
| BR-020 | Industry template install is reversible (disable pack) without deleting core data |

---

# 20. Workflows & Approval System

## 20.1 Engine capabilities (product)

| Capability | Requirement |
|------------|-------------|
| Definition versions | Publish/activate versions without breaking in-flight instances |
| Steps | Sequential and parallel |
| Assignees | Role, group, specific user, manager-of-requester |
| Conditions | Amount thresholds, factory, document type |
| SLA | Due timers + escalation |
| Actions | Approve, Reject, Request changes, Delegate |
| Audit | Every decision stored |
| Inbox | SCR-SHR-02 / 03 |

## 20.2 Standard workflows

| WF ID | Name | Trigger | Default path | Priority |
|-------|------|---------|--------------|----------|
| WF-01 | Purchase Approval | PO submit | Creator → Dept Head → Finance → Approved | P1 |
| WF-02 | Leave Approval | Leave apply | Employee → Manager → HR | P1 |
| WF-03 | Expense Approval | Expense claim | Employee → Manager → Finance | P2 |
| WF-04 | Production Release | WO release request | Supervisor → Plant Manager | P1 |
| WF-05 | Quality Hold Release | Failed inspection | QC → Plant Manager | P1 |
| WF-06 | NCR Disposition | NCR open | QC → Process Owner → QA Head | P1 |
| WF-07 | Stock Adjustment | Adjustment submit | Store → Plant Manager (if over threshold) | P1 |
| WF-08 | Dispatch Credit Override | Dispatch over credit limit | Sales → Finance | P2 |
| WF-09 | Plan Change | Tenant upgrade/downgrade | Auto or Softlligence approval for enterprise | P1 |
| WF-10 | Break-glass Request | Support needs access | Support → Security Admin | P1 |

---

# 21. Notification Requirements

## 21.1 Channels

In-App (P0), Email (P0), SMS (P1), WhatsApp (P1), Telegram (P2), Push (P2).

## 21.2 Event catalog (representative)

| Event | Default channels | Recipients |
|-------|------------------|------------|
| User invited | Email | Invitee |
| Approval pending | In-app + Email | Assignees |
| Approval decided | In-app | Requester |
| WO completed | In-app | Plant Manager |
| QC fail | In-app + Email | QC + Supervisor |
| Tenant suspended | Email | Owners |
| Payment failed | Email | Billing contacts |
| Import finished | In-app | Initiator |
| Quota warning (80/100%) | In-app + Email | Owners |
| AI credit low | In-app | AI users + Owner |
| Maintenance due | In-app | Maintenance |
| Break-glass started | Email | Security + Owner |

## 21.3 Product rules

- Templates are tenant-customizable where allowed  
- Platform enforces credit quotas for SMS/WhatsApp/AI  
- User can mute non-critical categories  

---

# 22. Reports Catalog

| Report ID | Name | Module | Priority | Formats |
|-----------|------|--------|----------|---------|
| RPT-001 | Tenant Usage Summary | Platform | P0 | Screen/PDF |
| RPT-010 | Stock On-Hand | Inventory | P1 | Excel/PDF |
| RPT-011 | Stock Ledger | Inventory | P1 | Excel |
| RPT-020 | Work Order Status | Manufacturing | P1 | Excel/PDF |
| RPT-021 | Yield by WO / Period | Manufacturing | P1 | Excel/PDF |
| RPT-022 | Scrap Reason Analysis | Manufacturing | P1 | Excel |
| RPT-023 | Energy by WO / Machine | Manufacturing | P1 | Excel |
| RPT-030 | PO Aging | Procurement | P1 | Excel |
| RPT-031 | GRN Register | Procurement | P1 | Excel |
| RPT-040 | Sales Register | Sales | P1 | Excel |
| RPT-041 | Dispatch / Challan Register | Sales | P1 | Excel/PDF |
| RPT-050 | Inspection Summary | Quality | P1 | Excel |
| RPT-051 | Open NCR | Quality | P1 | Excel |
| RPT-060 | Asset Downtime | Maintenance | P1 | Excel |
| RPT-070 | Leave Balance | HR | P1 | Excel |
| RPT-080 | AR Aging | Finance | P3 | Excel |
| RPT-081 | AP Aging | Finance | P3 | Excel |
| RPT-100 | Steel Daily Heat Report | Steel | P2 | PDF/Excel |
| RPT-101 | Steel Shift Production | Steel | P2 | PDF |
| RPT-102 | Steel Melting Yield | Steel | P2 | Excel |
| RPT-103 | Steel Rolling Yield | Steel | P2 | Excel |
| RPT-104 | Steel Party Ledger | Steel | P2 | Excel/PDF |
| RPT-105 | Steel Energy Intensity | Steel | P2 | Excel |
| RPT-106 | Steel Scrap Purchase Register | Steel | P2 | Excel |
| RPT-200 | Scheduled Report Pack | Analytics | P1 | Email+File |

---

# 23. Dashboards & KPI Catalog

## 23.1 Dashboards

| Dashboard | Audience | Priority |
|-----------|----------|----------|
| Platform Dashboard | Super Admin | P0 |
| Executive Dashboard | Owner / MD | P1 |
| Inventory Dashboard | Warehouse | P1 |
| Manufacturing Dashboard | Plant Manager | P1 |
| Sales Dashboard | Sales | P1 |
| Quality Dashboard | QC | P1 |
| Maintenance Dashboard | Maintenance | P1 |
| Steel Dashboard | Steel plant users | P2 |
| AI Forecast Center | AI Analyst | P4 |

## 23.2 KPI dictionary (core)

| KPI ID | Name | Definition (business) | Priority |
|--------|------|----------------------|----------|
| KPI-001 | Active Tenants | Count of non-suspended tenants | P0 |
| KPI-002 | MRR | Monthly recurring revenue | P0 |
| KPI-010 | Stock Value | Sum of on-hand × valuation | P1 |
| KPI-011 | Stock Turns | Issue / average stock (period) | P2 |
| KPI-020 | WO On-Time % | Completed by plan date / completed | P1 |
| KPI-021 | Yield % | Output / input × 100 | P1 |
| KPI-022 | Scrap % | Scrap / input × 100 | P1 |
| KPI-023 | Specific Energy | Energy qty / output ton | P1 |
| KPI-024 | Downtime Hours | Sum downtime | P1 |
| KPI-030 | OTIF | On-time in-full dispatches | P2 |
| KPI-031 | Open Order Value | Unfulfilled SO value | P1 |
| KPI-040 | First Pass Yield | Passed inspections / total | P1 |
| KPI-041 | Open NCRs | Count open | P1 |
| KPI-050 | MTTR | Mean time to repair | P2 |
| KPI-051 | PM Compliance % | PM done / PM due | P1 |
| KPI-060 | Seat Utilization | Active users / seats | P0 |
| KPI-070 | Melting Yield % (Steel) | Billet / scrap input | P2 |
| KPI-071 | Rolling Yield % (Steel) | Rod / billet input | P2 |
| KPI-072 | Burning Loss kg (Steel) | Input − output | P2 |
| KPI-073 | kWh / ton (Steel) | Power / output ton | P2 |
| KPI-074 | Gas Nm³ / ton (Steel) | Gas / output ton | P2 |
| KPI-075 | Billet Stock ton | On-hand billet | P2 |
| KPI-076 | Rod Stock ton | On-hand rod | P2 |

---

# 24. Industry Templates

## 24.1 Template product definition

An Industry Template is a Softlligence-published pack that installs:

- Recommended modules  
- Role templates / permission packs  
- Custom field packs  
- Workflow defaults  
- KPI & report packs  
- Import/export mappings  
- Navigation section (e.g., “Steel”)  
- Sample masters (optional, demo flag)

Templates **do not** fork the core. Disable removes navigation/pack overlays; core transactional data remains.

## 24.2 Template lifecycle actions

| Action | Description |
|--------|-------------|
| Preview | See what will be enabled |
| Install / Enable | Apply pack within entitlements |
| Configure | Map factories/machines |
| Disable | Hide pack features |
| Upgrade pack version | Migration notes shown to admin |

---

# 25. Steel Mill Template — Modules & Screens

## 25.1 Business chain (product)

Scrap Purchase → Yard Stock → Furnace Heat → Billet Output/Stock → Rolling → Rod Stock → Customer Dispatch → Party Ledger / Margin; with Energy, Yield, Quality, Expenses.

## 25.2 Steel navigation group

Scrap Receiving · Scrap Yard · Furnace Heats · Billet Stock · Rolling / Rod · Dispatches · Party Ledger · Energy Board · Steel Reports · Steel Import

## 25.3 Steel screen ↔ core mapping

| Steel screen | Core concept |
|--------------|--------------|
| Scrap Receiving | GRN / purchase receipt + Item (scrap grades) |
| Heat Entry | Work Order type MELT + energy + scrap/output posts |
| Billet Stock | Inventory on-hand FG/WIP billet |
| Rolling Entry | Work Order type ROLL |
| Rod Stock | Inventory FG |
| Steel Dispatch | Sales dispatch |
| Party Ledger | Party + movements/AR summary views |

## 25.4 Steel-specific business rules

| ID | Rule |
|----|------|
| BR-STL-01 | Heat number unique per factory |
| BR-STL-02 | Yield auto-calculated; user may not silently override without permission |
| BR-STL-03 | Power/gas posting optional per tenant steel settings but required for energy KPIs |
| BR-STL-04 | Dispatch sizes must match rod item attributes |
| BR-STL-05 | Daily Heat Report printable with letterhead branding |

---

# 26. Future Industry Templates

| Template | Distinct product content (examples) | Still uses |
|----------|--------------------------------------|------------|
| Garments | Style/color/size matrix, cutting, sewing lines, trim BOM | Item, BOM, WO, QC, INV |
| Textile | GSM, loom, yarn lots, dye recipes | Same core |
| Plastic | Mould tools, cavities, regrind scrap | Same core |
| Food | Expiry/batch, HACCP checklists, allergens | Same + QA |
| Chemical | Batch genealogy, hazards attributes | Same + QA |
| Paper | Reel/lot, grammage, deckle | Same core |
| Cement | Kiln asset, silo WH, chemistry QC | Same core |
| Construction | Job sites as factories, project WOs | Same core |
| Furniture | Job-shop routings, wood lots | Same core |
| Electronics | Serials, SMT lines, component traceability | Same + serial tracking |

Each future template gets its own sub-SRS addendum when scheduled; this SRS only reserves the extension points.

---

# 27. AI Features

| Feature | User value | Guardrail |
|---------|------------|-----------|
| Chat assistant | Ask “what was melting yield last week?” | Tenant-scoped RAG; cited answers; permission-filtered |
| Demand forecast | Plan purchases | Advisory charts; not auto PO |
| Production forecast | Plan WOs | Advisory |
| Inventory prediction | Avoid stockouts | Advisory reorder suggestions |
| Predictive maintenance | Reduce downtime | Suggestions create draft Maint WO only on confirm |
| Energy optimization | Lower kWh/ton | Recommendations only |
| AI credits | Commercial metering | Hard stop / overage policy |

Screens: SCR-AI-01…05. Permissions: `ai.*`. Priority P4 per Review 2 Phase 6.

---

# 28. Subscription & Billing Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Plans | Starter / Professional / Enterprise module bundles | P0 |
| Trials | Time-boxed access | P0 |
| Seats | Active user limits | P0 |
| Factory limits | Max factories per plan | P0 |
| Storage quota | Files GB | P1 |
| API quota | Partner integrations later | P3 |
| AI credits | Token/job wallet | P4 |
| SMS credits | Notification wallet | P1 |
| Coupons | Discount codes | P1 |
| Invoices | History + PDF | P0 |
| Self-serve upgrade | Owner upgrades | P0 |
| Grace period | Soft lock on failed payment | P1 |
| Entitlement enforcement | Module + limit checks | P0 |

Super Admin manages catalog and exceptions (SCR-SA-07…).

---

# 29. Super Admin Portal Requirements

Softlligence staff manage the **platform**, not daily shop floors (except audited break-glass).

Must support: tenant lifecycle, plans, subscriptions, revenue KPIs, usage, flags, jobs, errors, health, platform audit, support linkage, platform users/roles, AI/storage usage views — matching Review 2 §12 and screens SCR-SA-*.

---

# 30. Company Admin Portal Requirements

Company/tenant administrators must configure org hierarchy, people, roles/scopes, modules, workflows, custom fields, branding, notifications, billing self-serve, and audit export — matching Review 2 §13 and SCR-ORG/IAM/MOD/SET/BILL/*.

---

# 31. Factory / Plant User Requirements

Factory users need fast task UX:

- Scoped dashboards  
- WO / steel entry forms with defaults (factory, shift, machine)  
- Approval inbox  
- Scan/search by doc number  
- Print challan/shift report  
- Minimal admin noise  

They must never see other tenants or unscoped factories.

---

# 32. Employee Journey

1. Admin creates Employee (optional) and invites User  
2. Employee receives invite email → SCR-AUTH-05  
3. Sets password + optional MFA  
4. Lands on OPS dashboard scoped to assignments  
5. Performs daily tasks (WO postings / leave / approvals)  
6. Receives notifications  
7. Updates profile / security  
8. On exit: admin deactivates user; sessions revoked; audit retained  

---

# 33. Customer Journey

**Internal (company users managing customers):** create customer → credit terms → sales order → production/stock → dispatch/challan → invoice (finance) → party ledger → reports.

**External customer portal (Later):** invite contact → view order/dispatch status → download challan PDF → raise query ticket. Not P0.

---

# 34. Supplier Journey

**Internal:** create supplier → PO → approval → send PO → GRN → quality inspect → inventory up → AP bill.

**External supplier portal (Later):** view PO → confirm → ASN → upload docs. Not P0.

---

# 35. Non-Functional Requirements

Product-facing NFRs (not infrastructure runbooks):

| ID | Category | Requirement | Priority |
|----|----------|-------------|----------|
| NFR-001 | Security | Tenant isolation absolute in product behavior | P0 |
| NFR-002 | Security | Privileged actions auditable | P0 |
| NFR-003 | Security | MFA for privileged roles | P0 |
| NFR-004 | Usability | Common shop-floor create flow ≤ 3 primary steps | P1 |
| NFR-005 | Usability | Mobile-responsive ops screens | P1 |
| NFR-006 | Accessibility | Keyboard reachable primary actions; forms labeled | P1 |
| NFR-007 | Reliability | Async jobs show progress and failure reasons | P1 |
| NFR-008 | Performance | List pages paginated; no silent truncation as business truth | P0 |
| NFR-009 | Scalability | Product model supports thousands of tenants conceptually | P0 |
| NFR-010 | Localization | Locale, timezone, number/date formats per tenant | P0 |
| NFR-011 | Branding | Tenant logo/letterhead on printable docs | P1 |
| NFR-012 | Availability | Status page / health visible to Super Admin | P0 |
| NFR-013 | Privacy | Export/delete requests supported for tenant data (process) | P2 |
| NFR-014 | Observability | Correlation IDs visible in support tooling | P1 |
| NFR-015 | Compliance | Password policy & session timeout configurable | P0 |

---

# 36. Design Decisions (Product)

| Decision | Choice | Architecture ref |
|----------|--------|------------------|
| Product shape | One cloud, many industry templates | Review 2 Vision |
| Isolation unit | Tenant workspace | Review 2 §4 |
| Org model | Company→Factory→Plant→WH→Dept→Line→Machine | Review 2 §4–5 |
| Module model | Entitlement + enablement | Review 2 §14 |
| Steel | Template, not core | Review 2 §9–10 |
| AI | Advisory + metered | Review 2 §19 |
| Approvals | Generic workflow engine | Review 2 §16 |
| Custom fields | Tenant-scoped only | Review 2 §15 |
| No fake privilege switcher | Scopes within tenant only | Review 1 critical issues + Review 2 security |

---

# 37. Best Practices (Product)

1. Prefer deactivate over delete for masters.  
2. Every destructive button needs confirm + permission.  
3. Show entitlement upsell when module locked.  
4. Defaults must be factory-aware for plant users.  
5. Printable documents use branding.  
6. Dry-run imports.  
7. KPI definitions documented before chart widgets.  
8. External portals after internal mastery.  
9. Template packs versioned and changelogs visible.  
10. Never present UI control that the user’s permissions cannot execute.

---

# 38. Future Expansion

- Customer & supplier portals  
- Mobile offline shop-floor app  
- Marketplace of partner templates  
- Advanced MRP / planning board  
- Full multi-country payroll  
- IoT meter auto-ingest for energy  
- Closed-loop AI with human approval gates  
- Multi-entity consolidation dashboards  

Aligned with Review 2 Phases 4–6 and Later items.

---

# 39. Appendices

## Appendix A — Role × Permission Matrix

Canonical matrix is maintained as a living spreadsheet linked from this appendix in the documentation repo. Baseline rule sets:

- **Viewer:** all `*.read` for entitled modules; no mutate  
- **Supervisor:** manufacturing post permissions for scoped factory; no IAM manage  
- **Plant Manager:** supervisor + release/complete + inventory transfer + approvals  
- **Company Admin:** org + IAM + module toggle within plan + settings  
- **Tenant Owner:** company admin + billing  
- **Platform Super Admin:** platform.*  

## Appendix B — Screen Index (count)

Authentication 9 · Super Admin 28 · Organization 18 · IAM 16 · Modules/Settings/Billing/Files/Notif/Audit ~20 · Inventory 12 · Manufacturing 18 · Procure/Sales/QA/Maint/HR/Finance ~40 · Analytics/AI/Steel/Shared ~35+  

**Total product screens in this SRS:** 190+ logical screens (including utilities).

## Appendix C — Form Index

Auth/IAM · Org · Inventory/MFG · Procure/Sales/QA/MNT/HR/FIN · Steel · Admin/Billing/Workflow/Custom Fields / Import — **60+ forms** specified.

## Appendix D — Priority mapping to Review 2 roadmap

| Review 2 Phase | SRS priority band |
|----------------|-------------------|
| Phase 1 Core SaaS | P0 |
| Phase 2 Manufacturing + Inventory | P1 |
| Phase 3 Steel Template | P2 |
| Phase 4 Finance | P3 |
| Phase 5 CRM/Procurement depth | P3 |
| Phase 6 AI + Scale | P4 |

## Appendix E — Traceability

| This SRS section | Feeds document |
|------------------|----------------|
| Modules, entities implied by screens/forms | Document 02 Database Design |
| Screen/actions | Document 03 API Specification |
| Screens/forms/buttons | Document 04 UI/UX Design System |
| Priorities & NFRs | Document 05 Development Playbook |

---

# 40. Cross References

| Document | Path |
|----------|------|
| Documentation System | [`00_Documentation_System.md`](./00_Documentation_System.md) |
| Review 1 — Architecture Audit | [`REVIEW_1_Architecture_Audit.md`](./REVIEW_1_Architecture_Audit.md) |
| Review 2 — Enterprise Architecture | [`REVIEW_2_Enterprise_Architecture.md`](./REVIEW_2_Enterprise_Architecture.md) |
| Documents Index | [`README.md`](./README.md) |
| Document 02 | `02_Database_Design.md` (next) |
| Document 03 | `03_API_Specification.md` (planned) |
| Document 04 | `04_UI_UX_Design_System.md` (planned) |
| Document 05 | `05_Development_Playbook.md` (planned) |

---

## Document completion status

| Section | Status |
|---------|--------|
| 1–40 listed in TOC | **Complete in v1.0.0** |
| Appendix A cell-level matrix file | Living artifact (baseline rules included) |

---

**End of Document 01 — Software Requirements Specification (SRS) v1.0.0**

*Softlligence Manufacturing Cloud — Official Product Specification*  
*Aligned to Review 2. Architecture decisions win on conflict.*
