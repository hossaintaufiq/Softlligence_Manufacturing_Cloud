# Softlligence Manufacturing Cloud
## Enterprise Architecture Specification (Target State) — Review 2

**Classification:** System Design / Architecture Blueprint  
**Author role:** Chief Software Architect, Softlligence Technologies  
**Status:** Design-only — no code, no schema dumps, no API implementations  
**Audience:** Founders, engineering leads, product, security, DevOps  
**Related:** See [`REVIEW_1_Architecture_Audit.md`](./REVIEW_1_Architecture_Audit.md) for current-codebase architecture audit (Review 1).

---

# SECTION 1 — Overall Architecture

Softlligence Manufacturing Cloud is a **multi-tenant B2B SaaS manufacturing platform**. Steel is one **industry template**, not the core.

## Architectural style

**Modular monolith first → selectively extract services later.**

Why not microservices on day one:
- Manufacturing ERP has deep transactional consistency (inventory ↔ production ↔ finance)
- Small team cannot operate 20 services
- Bounded contexts inside one deployable core + workers is how Odoo / early NetSuite scaled before fragmentation

## Logical planes

| Plane | Responsibility |
|-------|----------------|
| **Experience** | Next.js portals (Super Admin, Company Admin, Plant Ops, Mobile PWA later) |
| **Edge** | CDN, WAF, API Gateway / BFF, rate limits, TLS |
| **Identity** | AuthN, SSO, sessions, MFA |
| **Application Core** | Domain modules (Org, Manufacturing, Inventory, Finance, …) |
| **Integration** | Webhooks, ERP connectors, email/SMS providers |
| **Data** | PostgreSQL (system of record), Redis (cache/session), object storage, search, warehouse |
| **Async** | Queues + workers (reports, imports, notifications, AI jobs) |
| **Intelligence** | Feature store, LLM/RAG, forecasting jobs |
| **Control** | Observability, audit, feature flags, billing metering |

## Component map

| Component | Role |
|-----------|------|
| **Frontend** | Next.js App Router; multi-portal; server components for shells; client for grids |
| **Backend** | NestJS (or modular Express equivalent) — domain modules, CQRS-lite for reads |
| **Gateway / BFF** | Auth, tenancy header resolution, routing, throttling, request ID |
| **Services** | In-process modules initially; extract Billing, Notifications, AI, Search later |
| **Database** | PostgreSQL + Row Level Security; shared DB, tenant_id on all business rows |
| **Redis** | Sessions revoke, rate limit, cache, job locks, feature flag snapshots |
| **Storage** | S3-compatible (documents, exports, attachments, AI corpora) |
| **Queues** | Redis Streams / BullMQ or SQS — never do heavy work in HTTP |
| **Search** | OpenSearch/Meilisearch for global search across docs/entities |
| **Analytics** | OLTP for ops; ClickHouse or warehouse replica for BI |
| **AI** | Async inference workers + RAG over tenant-scoped docs |
| **Monitoring** | OpenTelemetry → metrics/logs/traces; uptime + error budgets |

---

# SECTION 2 — System Architecture Diagram

```
                         ┌──────────────────────────────┐
                         │     Cloudflare / CDN / WAF    │
                         └──────────────┬───────────────┘
                                        │
              ┌─────────────────────────┼─────────────────────────┐
              │                         │                         │
              ▼                         ▼                         ▼
     ┌────────────────┐       ┌─────────────────┐       ┌─────────────────┐
     │ Super Admin UI │       │ Company Portals │       │ Public / Marketing│
     │ (Next.js)      │       │ Ops / Plant / HR│       │ (Next.js)        │
     └───────┬────────┘       └────────┬────────┘       └────────┬────────┘
             │                         │                         │
             └────────────┬────────────┴────────────┬────────────┘
                          │                         │
                          ▼                         ▼
                 ┌────────────────────────────────────────────┐
                 │           API Gateway / BFF                 │
                 │  TLS · Auth · Tenant resolve · Rate limit  │
                 │  Idempotency · Correlation ID              │
                 └────────────────────┬───────────────────────┘
                                      │
                          ┌───────────┴───────────┐
                          ▼                       ▼
               ┌────────────────────┐   ┌────────────────────┐
               │ Identity Service   │   │ Application Core   │
               │ JWT/OIDC/SAML/MFA  │   │ Modular Monolith   │
               │ Session / SSO      │   │ Org · Mfg · Inv ·  │
               └─────────┬──────────┘   │ Fin · CRM · HR ·   │
                         │              │ Quality · Maint ·  │
                         │              │ Billing · Audit    │
                         │              └─────────┬──────────┘
                         │                        │
         ┌───────────────┼────────┬───────────────┼──────────────┐
         ▼               ▼        ▼               ▼              ▼
   ┌──────────┐   ┌──────────┐ ┌──────┐   ┌────────────┐  ┌──────────┐
   │PostgreSQL│   │  Redis   │ │  S3  │   │ Job Queue  │  │  Search  │
   │ + RLS    │   │ cache /  │ │files │   │ Workers    │  │ OpenSearch│
   │          │   │ sessions │ │      │   │ reports /  │  │          │
   └────┬─────┘   └──────────┘ └──────┘   │ notify /   │  └──────────┘
        │                                 │ import / AI│
        │                                 └─────┬──────┘
        │                                       │
        ▼                                       ▼
   ┌──────────────┐                    ┌────────────────┐
   │ Read replica │──ETL──►            │ Analytics WH   │
   │ / CDC        │         ┌──────────│ ClickHouse /   │
   └──────────────┘         │          │ BigQuery       │
                            ▼          └───────┬────────┘
                     ┌─────────────┐           │
                     │ AI Services │◄──────────┘
                     │ Forecast /  │
                     │ Maint / RAG │
                     │ LLM gateway │
                     └──────┬──────┘
                            │
                     ┌──────▼──────┐
                     │ Monitoring  │
                     │ OTel · APM  │
                     │ Sentry ·    │
                     │ Prometheus  │
                     └─────────────┘
```

---

# SECTION 3 — Domain Driven Design (Bounded Contexts)

| Context | Owns | Does not own |
|---------|------|--------------|
| **Identity** | Users, credentials, MFA, SSO links, sessions | Business roles inside a factory |
| **Tenant / Billing** | Tenants, plans, subscriptions, usage, invoices | Production data |
| **Organization** | Company, sites, factories, plants, warehouses, depts, org chart | Inventory balances |
| **IAM (Authorization)** | Roles, permissions, policies, resource grants | Authentication credentials |
| **HR** | Employees, attendance, leave, payroll hooks | Machine runtime |
| **Inventory** | Items, UoM, lots/batches, stock, transfers, valuations | Work-order execution logic |
| **Procurement** | Suppliers, POs, GRN, landed cost | Customer invoices |
| **Manufacturing** | BOMs, routings, work orders, shop floor, yields, scrap, energy | GL posting (emits events) |
| **Quality** | Specs, inspections, NCR, CAPA | Inventory movements (requests them) |
| **Maintenance** | Assets, PM schedules, breakdowns, spare parts requests | Purchasing (raises PR) |
| **CRM / Sales** | Customers, leads, quotes, orders, dispatches | Warehouse pick logic |
| **Finance** | Chart of accounts, journals, AR/AP, costing, tax | Shop-floor entry UI |
| **Notification** | Channels, templates, delivery | Business rules that *trigger* notify |
| **Settings / Branding** | Locale, timezone, number formats, logos | Feature entitlement (Billing) |
| **Analytics** | Metrics definitions, dashboards, scheduled reports | Source OLTP writes |
| **AI** | Models, prompts, embeddings, predictions | Authoritative business decisions |
| **Audit / Compliance** | Immutable activity trail | UX presentation |
| **Support** | Tickets, knowledge base | Tenant data mutation |

**Integration rule:** Contexts communicate via **domain events** and **application services**, never by reaching into another context’s tables from UI code.

---

# SECTION 4 — Multi Tenant Architecture

## Chosen model: Shared Database + Shared Schema + Strong Tenant Isolation (Hybrid-ready)

| Option | Verdict |
|--------|---------|
| Shared DB / shared schema | **Default** — best cost, ops simplicity, cross-tenant Super Admin analytics |
| Separate schema per tenant | Optional for regulated mid-market later |
| Separate database per tenant | Enterprise SKU / data residency / on-prem bridge |
| Hybrid | **Target:** shared for 95%; dedicated DB for premium / compliance |

### Why shared + RLS

- Matches NetSuite / Dynamics / modern SaaS economics  
- PostgreSQL RLS + mandatory `tenant_id` + app middleware = defense in depth  
- Easy Super Admin metering and global support tooling  
- Schema evolution is one migration pipeline  

### Isolation layers (mandatory)

1. Every business table: `tenant_id` (NOT NULL)  
2. RLS policies: `tenant_id = current_setting('app.tenant_id')`  
3. Gateway sets tenant from JWT / subdomain / header (validated, never trusted alone)  
4. Cross-tenant only via Super Admin break-glass with audit  

### Hierarchy (canonical)

```
Platform (Softlligence)
  └── Tenant (billing customer / workspace)
        └── Organization (legal / brand umbrella, optional)
              └── Company (operating company)
                    └── Factory / Site
                          ├── Plant
                          ├── Warehouse
                          ├── Department
                          ├── Production Line
                          ├── Machine / Asset
                          ├── Employee (HR person)
                          └── User (login identity) ── binds to Employee optionally
```

| Entity | Meaning |
|--------|---------|
| **Tenant** | SaaS boundary — subscription, data isolation, feature flags |
| **Organization** | Holding group if one tenant runs multiple legal entities |
| **Company** | Legal / fiscal entity (books, tax) |
| **Factory / Site** | Physical location |
| **Plant** | Production unit inside a site |
| **Warehouse** | Inventory location |
| **Department** | Org unit (Melting, Rolling, HR, Finance) |
| **Production Line** | Logical sequencing of stations |
| **Machine** | Maintainable asset |
| **Employee** | Person record |
| **User** | Login principal (may be external consultant without Employee) |
| **Role / Permission** | Authorization inside tenant |

---

# SECTION 5 — Database Design (Conceptual Hierarchy)

```
Tenant
 ├── Subscription / PlanEntitlement
 ├── FeatureFlagOverride
 ├── Organization(s)
 │     └── Company(s)
 │           ├── Factory/Site(s)
 │           │     ├── Plant(s)
 │           │     ├── Warehouse(s)
 │           │     ├── Department(s)
 │           │     ├── Line(s) → Station → Machine
 │           │     └── Document storage roots
 │           ├── Party Master (Customer / Supplier / Both)
 │           ├── Item Master (material / FG / spare) + UoM
 │           ├── BOM / Routing (industry-templated)
 │           ├── WorkOrder → Operation → Consumption / Output / Scrap / Energy
 │           ├── StockLedger / Lot / Serial
 │           ├── QualityInspection / NCR
 │           ├── MaintenanceWorkOrder
 │           ├── SalesOrder / Dispatch
 │           ├── PurchaseOrder / GRN
 │           ├── Employee / Attendance / Leave
 │           └── Finance docs (Invoice, Payment, Journal)
 ├── CustomFieldDefinition (tenant-scoped)
 ├── WorkflowDefinition
 ├── NotificationPreference
 └── AuditEvent (append-only)
```

### Relationship principles

- **Tenant owns everything** below it for isolation  
- **Company** is fiscal owner of inventory valuation and AR/AP  
- **Factory** scopes operational transactions (work orders, energy)  
- **Warehouse** owns stock balances; production consumes/produces via stock ledger  
- **Item** is abstract; industry templates add attributes (steel grade, GSM, SKU size)  
- **No industry table as core** — industry = template pack of modules, fields, workflows, KPIs  

---

# SECTION 6 — Authentication

## Target AuthN stack

| Capability | Design |
|------------|--------|
| Primary | Email/password with strong policy |
| Tokens | Short-lived access JWT (5–15m) + rotating refresh |
| Storage | Prefer **httpOnly Secure cookies**; Bearer for mobile/API clients |
| Sessions | Server-side session registry (revoke, device list, concurrency limits) |
| MFA | TOTP + backup codes (mandatory for Super Admin / Company Admin) |
| Magic link | Optional low-friction invite accept |
| Social | Google / Microsoft OIDC for workforce |
| Enterprise SSO | SAML 2.0 / OIDC per tenant (Entra ID, Okta, Google Workspace) |
| Password policy | Length, breach check (HaveIBeenPwned k-anonymity), rotation optional by policy |
| Device binding | Soft binding (client id + risk signals); step-up on anomaly |

### Identity rules

- User email uniqueness is **per tenant** (or global login with tenant picker) — never block multi-company consultants incorrectly  
- Platform Super Admins live in `tenant_id = null` / platform realm  
- All logins emit audit events  

---

# SECTION 7 — Authorization (Enterprise RBAC+)

## Model

```
User ──< Membership >── Group
                │
                ▼
              Role ──< RolePermission >── Permission
                │
                ▼
         ResourcePolicy (optional ABAC)
         e.g. factory_id IN (...), amount < limit
```

| Layer | Purpose |
|-------|---------|
| **Permission** | Atomic capability (`inventory.stock.read`, `mfg.workorder.post`) |
| **Role** | Bundle of permissions (Plant Manager, Melter, Auditor) |
| **Group** | Assign roles to many users (Shift A Supervisors) |
| **Resource scope** | Tenant → Company → Factory → Warehouse |
| **Policy** | Conditions (ABAC): amount thresholds, shift, own-records-only |
| **Hierarchical roles** | Optional inheritance (Plant Manager ⊃ Supervisor) with explicit deny |

### Principles

- Authorization is **server-enforced**; UI only hides controls  
- No “switch role” that elevates without re-auth / assignment change  
- Custom roles per tenant; Softlligence ships **role templates** per industry  
- Every mutation checks: authentication ∧ tenant ∧ module enabled ∧ permission ∧ resource scope ∧ policy  

---

# SECTION 8 — Manufacturing Domain (Industry-Agnostic Core)

## Core objects

| Concept | Purpose |
|---------|---------|
| **Item** | Raw / WIP / FG / consumable / spare |
| **BOM** | What goes in |
| **Routing** | How / where / how long |
| **Work Order (WO)** | Planned/executed production job |
| **Operation** | Step on a line/machine |
| **Material Issue / Return** | Inventory consumption |
| **Output / Receipt** | FG or intermediate |
| **By-product / Scrap / Waste** | Loss streams with reasons |
| **Energy Log** | Power/gas/water normalized per WO/operation |
| **Yield / Loss** | Calculated KPIs from input vs output |
| **Cost rollup** | Material + labor + energy + overhead → WO cost |
| **Dispatch** | Outbound logistics from FG warehouse |

### Flow (canonical)

```
Purchase → GRN → Warehouse (RM)
     → Plan → Work Order
         → Issue materials → Run operations → Quality gates
         → Output FG / Scrap / Rework
         → Energy & downtime capture
     → FG Warehouse → Sales Order → Dispatch
```

### Costing

- Standard or actual (tenant setting)  
- Yield loss and energy attributed to WO  
- Finance context consumes **cost events**, does not own shop floor  

---

# SECTION 9 — Steel Industry Template

Steel is a **template pack**: modules + custom attributes + workflows + KPI definitions + report pack. Core tables stay generic (`WorkOrder`, `Operation`, `Item`, `EnergyLog`).

## Module map (steel)

| Steel concept | Maps to core |
|---------------|--------------|
| Scrap purchase / receiving | Procurement + GRN + Item (scrap grades) + expenses |
| Scrap yard inventory | Warehouse + lots |
| Furnace / Heat | Plant + Machine + Work Order type “MELT” |
| Heat number | WO / batch identifier |
| Billet production | Operation output → Item (billet sizes) |
| Rolling | Work Order type “ROLL” / routing |
| Rod / rebar sizes | FG items + attributes (diameter, grade) |
| Burning loss / melting loss | Scrap & loss reasons + yield KPIs |
| Power / gas | EnergyLog (kWh, Nm³) |
| Dispatch / challan | Sales dispatch documents |
| Party ledger | Customer/Supplier + AR/AP summaries |
| Quality (composition, size) | Quality inspections against specs |
| Reports / Excel packs | Report definitions + exporters |

### Steel operational chain

```
Scrap Purchase → Yard Stock
  → Furnace Heat (input scrap, runtime, downtime, kWh, gas)
  → Billet Output (size, weight, yield %)
  → Billet Stock
  → Rolling Mill (billet in → rod out, scale loss)
  → Rod Stock
  → Customer Dispatch (challan, rate, freight)
  → Party Ledger / Margin
```

Excel MIS sheets become **import mappings + report templates**, not hardcoded schema.

---

# SECTION 10 — Factory-Independent Design

| Industry | Same core | Template differences |
|----------|-----------|----------------------|
| **Garments** | Item, BOM, WO, QC, inventory | Style/color/size matrix, cutting, sewing lines, trim |
| **Textile** | Same | GSM, loom, yarn lots, dyeing recipes |
| **Plastic** | Same | Moulds as tools, cavity count, regrind scrap |
| **Food** | Same | Batch/expiry, HACCP QC, allergen attributes |
| **Paper** | Same | Reel/lot, grammage, machine deckle |
| **Cement** | Same | Kiln as machine, silo warehouses, chemistry QC |
| **Electronics** | Same | Serials, SMT lines, component traceability |
| **Furniture** | Same | Job-shop routings, wood lots |

### Reuse mechanism

1. Core entities unchanged  
2. Industry template installs: modules, field packs, workflows, KPIs, role templates, sample items  
3. Tenants may extend further with Dynamic Forms  
4. UI navigation composition from enabled modules + template views  

---

# SECTION 11 — SaaS Modules (Commercial)

| Capability | Design |
|------------|--------|
| **Plans** | Starter / Professional / Enterprise — module bundles + limits |
| **Subscriptions** | Status, renewals, seats, factories limit |
| **Trials** | Time-boxed full or module-limited |
| **Invoices / Coupons** | Billing context; Stripe/local PSP adapters |
| **Feature flags** | Plan defaults + tenant overrides |
| **Usage metering** | Seats, API calls, storage GB, AI tokens, SMS |
| **Quotas** | Soft warn / hard block policies |
| **AI / SMS credits** | Prepaid wallets with overage rules |

**Entitlement check** on every module entry and heavy API:  
`subscribed ∧ feature enabled ∧ quota remaining ∧ role permitted`

---

# SECTION 12 — Super Admin Portal (Softlligence)

Softlligence operators manage the **platform**, not customer shop floors (except break-glass).

| Area | Capabilities |
|------|----------------|
| Tenants / Companies | Onboard, suspend, impersonate (audited), delete schedule |
| Revenue | MRR, ARR, churn, failed payments |
| Subscriptions / Plans | Catalog, upgrades, coupons |
| Users (platform) | Staff RBAC |
| Usage | Storage, API, AI, SMS per tenant |
| Jobs | Queue depth, failed jobs, retries |
| Errors | Cross-tenant error budget (PII-scrubbed) |
| Logs / Audit | Platform + break-glass trail |
| Support | Ticket linkage to tenant |
| Feature flags | Global kill switches |
| Health | Region status, DB, Redis, workers |

---

# SECTION 13 — Company Admin Portal

| Area | Capabilities |
|------|----------------|
| Org setup | Companies, factories, plants, warehouses, departments |
| People | Employees, users, invites, roles, scopes |
| Modules | Enable within plan entitlements |
| Masters | Items, parties, machines, lines |
| Operations oversight | Production, inventory, quality dashboards |
| Settings | Locale, fiscal year, branding, number series |
| Notifications | Channel config |
| Compliance | Audit export, data retention requests |
| Billing (self-serve) | Plan, invoices, seats (if allowed) |

Plant users see **scoped** ops UI (single factory), not full admin.

---

# SECTION 14 — Module System (Dynamic Enablement)

```
Plan entitlements  →  Tenant module subscriptions  →  Navigation + API guards
```

| Company A | Company B |
|-----------|-----------|
| Inventory, HR, CRM, Finance, Manufacturing | Inventory, Manufacturing only |

### Mechanics

1. Module registry (code + metadata) shipped by Softlligence  
2. TenantModule row: `enabled`, `config JSON`  
3. Gateway/BFF and backend guards reject disabled modules  
4. Frontend shell builds nav from enabled modules only  
5. Data for disabled modules remains isolated (not deleted) for re-enable  

Industry templates = **recommended module sets + seed config**, not forks of the product.

---

# SECTION 15 — Dynamic Forms / Custom Fields

| Layer | Behavior |
|-------|----------|
| Definition | Per tenant (+ optional per company): entity, key, type, validation, options |
| Storage | JSONB extension column and/or EAV for rare searchable fields |
| Indexing | Generated indexes / expression indexes for frequently filtered keys |
| UI | Form renderer + grid columns from metadata |
| API | Schema-aware validation; unknown keys rejected |
| Isolation | Definitions always `tenant_id` scoped |

Custom fields **never** replace core transactional integrity fields (qty, UoM, tenant_id, document status).

---

# SECTION 16 — Workflow Engine

Generic engine: **Definition → Instance → Step → Action → Audit**.

| Use case | Example path |
|----------|--------------|
| Purchase approval | PO draft → Dept head → Finance → Ordered |
| Leave | Employee → Manager → HR |
| Expense | Claim → Manager → Finance |
| Production | WO release → Supervisor ack |
| Quality | Inspection fail → NCR → CAPA approve |

Features: parallel/serial steps, SLA timers, escalation, delegation, comments, attachments, versioned definitions.

---

# SECTION 17 — Notification System

```
Domain Event → Notification Policy → Template → Channel Router → Provider → Delivery Log
```

Channels: **Email, SMS, WhatsApp, Telegram, Push, In-App**.  
Tenant chooses providers and templates; platform enforces credit quotas.  
Workers send asynchronously; HTTP never blocks on SMTP.

---

# SECTION 18 — Reporting Engine

| Capability | Design |
|------------|--------|
| Operational dashboards | Near-real-time from OLTP / Redis cache |
| Analytical KPIs | Warehouse / materialized views |
| Charts | Semantic metric layer (definition ≠ chart widget) |
| Scheduled reports | Cron workers → Excel/PDF → storage + notify |
| Exports | Async job for large extracts |
| Templates | Industry report packs (steel daily heat report, etc.) |

---

# SECTION 19 — AI Architecture

| Capability | Approach |
|------------|----------|
| Predictive maintenance | Features from downtime/energy/vibration proxies → model jobs |
| Demand / production / inventory forecast | Time-series on warehouse facts |
| Energy optimization | Recommendations, not auto-control (human approve) |
| Chat assistant | Tenant-scoped RAG over manuals, SOPs, tickets |
| LLM gateway | Central proxy: prompt templates, PII scrubbing, cost metering, audit |

**Rules:** AI never bypasses RBAC/tenant isolation; predictions are advisory unless under a controlled closed-loop module with explicit consent.

---

# SECTION 20 — Technology Stack Recommendation

## Recommendation (pragmatic enterprise)

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | **Keep Next.js** | SSR/portals, ecosystem, hiring; evolve to App Router properly |
| API | **Move to NestJS** (or modular Fastify with strict structure) | Modules, DI, guards, OpenAPI — fits ERP growth better than flat Express |
| ORM | **Keep Prisma short-term**; evaluate **Drizzle** for complex SQL/perf later | Don’t rewrite ORM on day one of redesign |
| API style | **REST + OpenAPI** primary; **tRPC** optional for BFF↔web only | External integrators need REST; tRPC is not partner-friendly alone |
| Queue | **BullMQ (Redis)** or **SQS** | Proven job semantics |
| DB | **PostgreSQL** | RLS, JSONB, reliability |
| Cache | **Redis** | Required, not optional, in production |
| Search | Meilisearch/OpenSearch | When global search appears |
| Mobile later | React Native / PWA | Share design system |

### What not to do now

- Full microservices  
- GraphQL everywhere (add later for flexible BFF reads if needed)  
- gRPC except internal high-QPS services later  
- Rewriting frontend to another framework  

**Express can remain temporarily** behind a modular folder discipline, but NestJS is the better long-term home for Softlligence Manufacturing Cloud.

---

# SECTION 21 — Enterprise Monorepo Structure

```
softlligence-manufacturing-cloud/
├── apps/
│   ├── web/                 # Company + plant portals (Next.js)
│   ├── admin/               # Super Admin portal (Next.js)
│   ├── api/                 # NestJS modular monolith
│   └── worker/              # Queue consumers
├── packages/
│   ├── domain-*/            # Shared types, contracts (no UI)
│   ├── auth-sdk/
│   ├── ui/                  # Design system
│   ├── config/
│   └── eslint-config/
├── templates/
│   ├── steel/
│   ├── garments/
│   └── ...
├── infra/
│   ├── docker/
│   ├── k8s/
│   └── terraform/
├── docs/
│   ├── architecture/
│   ├── adrs/
│   └── runbooks/
└── tools/                   # codegen, migration helpers
```

---

# SECTION 22 — API Architecture

| Style | Use |
|-------|-----|
| **REST / OpenAPI 3** | External + primary product API, versioned `/v1` |
| **BFF** | Portal-optimized aggregates |
| **Async events** | Domain events on bus (WO completed, GRN posted) |
| **Queues** | Imports, reports, notifications, AI |
| **Webhooks** | Tenant outbound integrations |
| **GraphQL** | Optional later for complex dashboards |
| **gRPC** | Optional later for internal AI/search |

**Cross-cutting:** idempotency keys, cursor pagination, consistent error model, correlation IDs, tenant context on every call.

---

# SECTION 23 — Deployment

### 23.1 Near-term hosting profile (current build)

| Concern | Choice |
|---------|--------|
| Web | **Vercel** (Next.js) |
| API | **Render** (Node web service) |
| Database | **Supabase** PostgreSQL |
| Redis / Worker | Render add-ons when needed |
| CI/CD | GitHub → Vercel + Render auto-deploy |
| Goal | Local first, then simple public deploy — **not AWS/K8s yet** |

See ADR-0013, `documents/DEPLOY.md`, and root `plan.md`.

### 23.2 Long-term scale (when needed)

| Concern | Design |
|---------|--------|
| Containers | Docker for api, worker, web |
| Orchestration | Kubernetes (EKS/GKE) when scale demands |
| Edge | Cloudflare TLS, WAF, caching static |
| Data | Postgres HA, PITR backups, encrypted S3 |
| Scaling | HPA on api/worker; Redis cluster; read replicas |
| Environments | local / staging / prod; separate secrets |
| Multi-region | Later — active-passive first |

---

# SECTION 24 — Security

| Area | Control |
|------|---------|
| OWASP Top 10 | Secure SDLC, dependency scanning, SAST, DAST |
| Encryption | TLS in transit; KMS for secrets; encryption at rest |
| Secrets | Vault / cloud secret manager — never in git |
| Tenant isolation | `tenant_id` + RLS + tests + break-glass audit |
| AuthZ | Server-side RBAC+policy |
| Audit | Append-only, immutable storage tier for critical events |
| Privacy | PII minimization, retention policies, export/delete |
| Supply chain | Signed images, least privilege IAM |

---

# SECTION 25 — Roadmap

### Phase 1 — Core SaaS Kernel (foundation)
Identity, tenant, org hierarchy (Company → Factory), RBAC, modules/entitlements, audit, billing stubs, Super Admin + Company Admin shells, RLS, Redis, workers skeleton.

### Phase 2 — Manufacturing + Inventory Core
Items, warehouses, stock ledger, BOM/routing, work orders, scrap/yield/energy abstractions, basic quality gate, reporting MVP.

### Phase 3 — Steel Template
Steel field packs, heat/billet/rod workflows, energy KPIs, party ledger views, Excel import/export packs, steel role templates — **on top of core**, not a fork.

### Phase 4 — Finance
AR/AP, costing postings, basic GL, landed cost, subscriptions hardening.

### Phase 5 — CRM / Sales / Procurement depth
Full quote-to-cash and procure-to-pay, advanced party management.

### Phase 6 — AI + Scale
Forecasting, predictive maintenance, RAG assistant, warehouse analytics, optional dedicated-DB tenants, multi-industry templates beyond steel.

---

## Architecture Principles (non-negotiable)

1. **Industry-agnostic core; templates for verticals**  
2. **Tenant isolation by design (app + RLS)**  
3. **Modular enablement via entitlements**  
4. **Async for anything heavy**  
5. **Server is source of truth for security**  
6. **Modular monolith until a context proves it must split**  
7. **Audit everything privileged**  
8. **Steel is a template, not the product**  

---

## Decision Summary

| Decision | Choice |
|----------|--------|
| Tenancy | Shared DB + shared schema + RLS; dedicated DB as Enterprise option |
| App shape | Modular monolith + workers |
| Frontend | Next.js multi-portal |
| Backend | NestJS-oriented modular API |
| Integration | REST/OpenAPI + events + queues |
| Vertical strategy | Template packs (Steel first) |
| AI | Advisory, tenant-scoped, metered |

---

## Next step

Architecture Decision Records (ADRs) for tenancy, NestJS migration, and steel template mapping — then a Phase-1 delivery backlog.

---

*Review 2 — Target enterprise architecture for Softlligence Manufacturing Cloud. Design-only document.*
