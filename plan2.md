# plan2.md — Product Refinement & Enterprise Readiness Plan

| Field | Value |
|---|---|
| **Author** | Executive Product Team (CPO, Principal Architects, Senior Security & Manufacturing Consultants) |
| **Status** | Approved Specification — Post-MVP Roadmap |
| **Authority** | Bound by `01_SRS.md` through `05_Development_Playbook.md` and `plan.md` |
| **Scope** | Sections 11 through 25 (Enterprise UX, Security, AI, Observability, Multi-Industry Scaling) |

---

## SECTION 11 — Product Experience

The user experience transitions from functional prototype screens to an ultra-slick, high-density enterprise product combining the speed of Linear, clarity of Notion, financial authority of Stripe, and operational power of SAP/Dynamics 365.

```
+-----------------------------------------------------------------------------------------------+
| [Softlligence Logo] [Tenant Switcher (Super)] [Company/Factory Dropdown] [Quick Search ⌘K]    |
| [Global Nav: Overview | Inventory | Manufacturing | Commercial | Steel | AI Assistant] [Profile]|
+-----------------------------------------------------------------------------------------------+
| Sidebar (Collapsible) | Breadcrumbs: Tenant > Steel Vertical > Furnace Heat Logs             |
| - Favorites           | --------------------------------------------------------------------- |
| - Recents             | [Heat Log #H-2026-089] [Status: Active Run] [Saved View: Shift A v]    |
| - Core Modules        | +-------------------------------------------------------------------+ |
| - Factory Floor Mode  | | KPI Cards: Melt Yield (94.2%), Power (610 kWh/T), Output (48.2 MT)| |
| - Settings            | +-------------------------------------------------------------------+ |
|                       | | Advanced Filterable Data Table (Virtual Scroll, Density Toggle)   | |
+-----------------------+-----------------------------------------------------------------------+
```

### 11.1 Core Navigation & Shell
- **Global Command Palette (`⌘K` / `Ctrl+K`)**: Instant search across all system records (Parties, Work Orders, Heat Logs, Items), navigation shortcuts, and action triggers.
- **Factory Operator Mode**: Large-touch target UI (minimum 48px touch targets), high contrast, dark-mode default, physical barcode scanning integration, simplified numeric keypads.
- **Dynamic Context Header**: Multi-tenant/company/factory scope switcher, active breadcrumbs, real-time sync status indicator, global notification drawer, and quick profile switcher.
- **Navigation History & Quick Access**:
  - **Favorites**: Star any entity view, custom filter, or report for 1-click sidebar pinning.
  - **Recents**: Automatically record the last 20 visited pages/records with keyboard navigation (`Ctrl+[` / `Ctrl+]`).
  - **Bookmarks & Saved Views**: Store customized column arrangements, filter sets, and sort orders per user.

### 11.2 Mobile & Touch Optimization Matrix
| View Mode | Target Persona | Viewport Range | Key Features |
|---|---|---|---|
| **Desktop Enterprise** | Plant Manager, Executive, Accountant | >= 1280px | Multi-window drawers, dense tables, split panes, hover cards |
| **Tablet Field View** | Quality Inspector, Warehouse Supervisor | 768px - 1279px | Touch-friendly tables, swipe actions, camera QR scanning |
| **Factory Operator HMI** | Furnace Operator, Mill Technician | Touch Displays (1080p+) | Giant buttons, single-task focus, glove-friendly touch targets |

---

## SECTION 12 — Enterprise UI System

A cohesive, high-density design system built using Vanilla CSS tokens, dynamic micro-animations, and reusable layout patterns.

```
                                    +-----------------------+
                                    | Design System Tokens  |
                                    +-----------+-----------+
                                                |
          +-------------------------+-----------+-----------+-------------------------+
          |                         |                       |                         |
+---------v---------+     +---------v---------+   +---------v---------+     +---------v---------+
| Typography & Colors|     | Data Presentation |   | Interactive Form  |     | Motion & Feedback |
| Inter/Roboto Mono |     | Virtual Tables    |   | Dynamic Forms     |     | Skeletons         |
| CSS Variables     |     | Kanban / Timeline |   | Saved Filters     |     | Micro-Animations  |
+-------------------+     +-------------------+   +-------------------+     +-------------------+
```

### 12.1 Token Hierarchy & Components
- **Typography**: Inter (Body/UI) + JetBrains Mono (Codes, Doc Numbers, Heat Numbers, Quantities).
- **Color System**: Curated HSL variables supporting seamless Light and Dark modes.
- **Component Palette**:
  - **Virtual Tables**: Render 100,000+ rows smoothly with sticky headers, column resizing, reordering, pin/freeze columns, and inline editing.
  - **Advanced Filters**: Multilevel logic filter builder (`AND`/`OR`, range, wildcard, null checks) with named saved views.
  - **Kanban & Timelines**: Drag-and-drop Work Order scheduling board with machine downtime overlays.
  - **Tree Views**: Infinite hierarchy for Bill of Materials (BOM) multi-level explosion.
  - **Data Import/Export Wizard**: Step-by-step CSV/Excel mapper with row-level validation previews, error highlighting, and transaction rollback.

---

## SECTION 13 — Enterprise Security

```
[Incoming Request]
        │
        ▼
[Cloudflare WAF / IP Whitelist]
        │
        ▼
[Rate Limiter (Redis Token Bucket)]
        │
        ▼
[Session Validation & Session Hijack Detection (IP/UA Fingerprint)]
        │
        ▼
[MFA Verification Step (TOTP / WebAuthn FIDO2)]
        │
        ▼
[RBAC & Tenant Isolation Enforcement (Prisma Extension RLS)]
        │
        ▼
[Immutable Audit Logger (Append-Only Audit Event)]
```

### 13.1 Security Control Matrix
| Control Area | Enterprise Standard | Implementation Mechanism | Priority |
|---|---|---|---|
| **Multi-Factor Auth** | Mandatory for Admins, TOTP & WebAuthn | Speakeasy TOTP + SimpleWebAuthn | P0 |
| **Session Control** | Fingerprinted Tokens, Single-Device Enforce | Redis Session Registry + Revocation API | P0 |
| **IP Tracking & Geofencing** | CIDR Whitelisting per Tenant | Middleware IP Validator | P1 |
| **Audit Trails** | Immutable Append-Only Audit Log | DB trigger & dedicated audit table | P0 |
| **Rate Limiting** | Tiered Bucket Limits (Auth: 5/min, API: 1000/min) | Redis Sliding Window Rate Limiter | P0 |
| **Data Protection** | AES-256 at rest, TLS 1.3 in transit | Database Encryption & HSTS Headers | P0 |

---

## SECTION 14 — Platform Services

```
                                  +-----------------------+
                                  | Central Platform Bus  |
                                  +-----------+-----------+
                                              |
      +-------------------+-------------------+-------------------+-------------------+
      |                   |                   |                   |                   |
+-----v-----+       +-----v-----+       +-----v-----+       +-----v-----+       +-----v-----+
| Event Bus |       | Notification|     | File Store|       | Jobs Queue|       | Cache Engine|
| Redis/RMQ |       | Email/SMS/WA|     | S3 Pre-signed|     | BullMQ    |       | Redis Cluster|
+-----------+       +-----------+       +-----------+       +-----------+       +-----------+
```

### 14.1 Micro-Services Architecture Summary
- **Event Bus & Async Messaging**: Event-driven decoupling using Redis Streams / BullMQ for async events (`inventory.receipt`, `work_order.completed`, `dispatch.issued`).
- **Omnichannel Notification Engine**: Unified gateway for In-App toasts, Web Push, Email (SendGrid/Resend), SMS (Twilio), and Telegram/WhatsApp business notifications.
- **Distributed Search Service**: Search index (Meilisearch/Elasticsearch) for instant cross-entity full-text queries.
- **Background Job Queue**: Retried background processing for PDF challan generation, bulk import/export, and night-shift inventory reconciliation.

---

## SECTION 15 — Reporting & Analytics

Executive dashboards and operational reporting tools built for high-throughput manufacturing data.

```
+---------------------------------------------------------------------------------------------------+
| EXECUTIVE DASHBOARD — TENANT SCOPE                                                                |
+------------------------------------+----------------------------------+---------------------------+
| Total Sales YTD: $4.82M (+14%)     | Plant OEE: 87.4%                 | Scrap Rate: 2.1% (-0.4%)  |
+------------------------------------+----------------------------------+---------------------------+
| Real-time Melt Yield vs Target (%) | Daily Dispatch Volume (Metric T) | Power Cost / Ton Trend    |
| [Line Chart: 30-day Trend]         | [Bar Chart: By Customer]        | [Area Chart: By Shift]    |
+------------------------------------+----------------------------------+---------------------------+
```

### 15.1 Reporting Suite Specifications
| Report Category | Key Metrics & Data | Export Formats | Frequency |
|---|---|---|---|
| **Executive** | Revenue, Gross Margin, Total OEE, Working Capital | PDF, Executive Slide | On-Demand, Weekly Automated |
| **Plant Floor** | Heat Yield, Shift Output, Downtime Pareto, Scrap Loss | PDF, Excel, Raw CSV | Shift Close, Daily |
| **Inventory** | Stock Valuation, Fast/Slow Moving Items, Reorder Point Alert| Excel, CSV | Real-time, Monthly Close |
| **Commercial** | Customer Credit Risk, PO Compliance, Order Fulfillment Rate| PDF, Excel | Weekly, Monthly |

---

## SECTION 16 — AI Platform Architecture

A complete, enterprise-grade AI architecture integrating Large Language Models (LLMs) with factory operational data.

```
+---------------------------------------------------------------------------------------------------+
| USER INTERACTION (Natural Language Prompt / Chat Assistant / Automatic Insight)                    |
+---------------------------------------------------------------------------------------------------+
                                                  │
                                                  ▼
+---------------------------------------------------------------------------------------------------+
| AI GATEWAY (Rate Limiting, Model Routing: OpenAI GPT-4o / Anthropic Claude 3.5 / Local Llama 3)    |
+---------------------------------------------------------------------------------------------------+
                                                  │
                                                  ▼
+---------------------------------------------------------------------------------------------------+
| RAG & CONTEXT ENGINE                                                                               |
| - Prompt Registry & Templating                                                                    |
| - Vector Store (pgvector / Qdrant) for SRS, Schema, Historical Logs                               |
| - Dynamic SQL Generator (Text-to-SQL with Tenant Isolation Guards)                                |
+---------------------------------------------------------------------------------------------------+
                                                  │
                                                  ▼
+---------------------------------------------------------------------------------------------------+
| AI INSIGHT MODULES                                                                                |
| 1. Predictive Maintenance Alerts  2. Demand & Stock Forecasting  3. Heat Yield Optimization       |
+---------------------------------------------------------------------------------------------------+
```

### 16.1 AI Core Capabilities
- **Tenant-Isolated Vector Knowledge Base**: Encrypted vector embeddings (`pgvector`) storing plant historical logs, SOP documents, and equipment manuals.
- **Natural Language Text-to-SQL Analytics**: Allow plant managers to ask *"What was the average power consumption per ton on Furnace 2 during Shift B last week?"* and receive instant interactive charts.
- **Predictive Manufacturing Insights**: Automatically trigger alerts when burning loss or scrap rates deviate from historical standard deviations.

---

## SECTION 17 — Performance Roadmap

Target benchmarks to support high-concurrency industrial environments.

### 17.1 Performance SLA Targets
- **Page Initial Load (FCP)**: < 0.8s
- **API P95 Response Time**: < 50ms
- **API P99 Response Time**: < 150ms
- **Search Query Latency**: < 20ms
- **Database Query Latency**: < 10ms for 99% of read operations

### 17.2 Optimization Strategy
- **Frontend**: Code splitting, virtualized list rendering (`@tanstack/react-virtual`), asset compression (AVIF/WebP), static generation for documentation and shell.
- **Backend**: DB connection pooling (PgBouncer), read-replicas for analytical queries, Redis key-value caching for static master data (UOMs, Companies, Users).

---

## SECTION 18 — Testing Strategy

```
          / \
         /   \        E2E Tests (Playwright / Cypress) — Multi-Tenant Workflows
        /     \       -----------------------------------------------------------
       /       \      Integration Tests (Supertest) — API Endpoints & Auth
      /         \     -----------------------------------------------------------
     /           \    Unit Tests (Vitest) — Business Logic & Yield Calculation
    /-------------\   -----------------------------------------------------------
   / Tenant Isolation\ Security & Static Analysis (SonarQube, Trivy, Prisma RLS Test)
  -------------------
```

### 18.1 Testing Scope Matrix
| Layer | Target Coverage | Framework | Key Objective |
|---|---|---|---|
| **Unit** | > 85% | Vitest | Calculation logic (Yield %, Valuation, Credit limits) |
| **Integration**| > 80% | Supertest | Express routes, DB mutations, transactions |
| **E2E** | Critical Flows | Playwright | Full user journeys (Order to Dispatch, Heat logging) |
| **Isolation** | 100% | Custom Suite | Cross-tenant data leakage prevention verification |
| **Performance**| Load / Stress | k6 | Validate 5,000 concurrent users at 1,000 req/sec |

---

## SECTION 19 — Observability

```
[Application Logs (Winston/Pino JSON)] ──┐
[Prometheus Metrics (/metrics)]         ──┼──> [OpenTelemetry Collector] ──> [Grafana / Datadog Dashboards]
[Distributed Traces (OpenTelemetry)]    ──┘
```

### 19.1 Observability Matrix
- **Metrics**: Request rate, error rate, DB pool utilization, job queue latency, active WebSocket connections, memory/CPU usage.
- **Tracing**: End-to-end distributed tracing using OpenTelemetry across API gateways, background workers, and PostgreSQL.
- **Error Tracking**: Automated exception aggregation (Sentry) with source-map mapping and immediate Slack/PagerDuty alerts for P0 production errors.

---

## SECTION 20 — Production Readiness

### 20.1 Infrastructure & Deployment Strategy
- **Deployment Pattern**: Zero-downtime **Blue/Green Deployments** with automated health check validation and 1-click rollback.
- **Disaster Recovery (DR)**:
  - **RPO (Recovery Point Objective)**: < 5 minutes (WAL archiving).
  - **RTO (Recovery Time Objective)**: < 15 minutes (automated failover to secondary cloud region).
- **Secrets Management**: HashiCorp Vault / AWS Secrets Manager for DB credentials, JWT signing keys, and third-party API keys.

---

## SECTION 21 — Multi-Industry Expansion Architecture

Reusing the core **Inventory**, **Manufacturing**, **IAM**, and **Commercial** engines across diverse manufacturing domains without duplicating code or creating isolated code bases.

```
                                +-----------------------------------+
                                | CORE MANUFACTURING ENGINE         |
                                | (Tenant, IAM, Inventory, Commer.)|
                                +-----------------+-----------------+
                                                  |
     +------------------+------------------+------+------------------+------------------+
     |                  |                  |                         |                  |
+----v-----+       +----v-----+       +----v-----+              +----v-----+       +----v-----+
| Steel    |       | Garments |       | Food &   |              | Plastics |       | Chemicals|
| Template |       | Template |       | Beverage |              | Template |       | Template |
+----------+       +----------+       +----------+              +----------+       +----------+
| Scrap    |       | Fabric   |       | Batch/   |              | Injection|       | Formula/ |
| Heat Log |       | Cutting  |       | Expiry   |              | Molding  |       | Multi-Mix|
| Rolling  |       | Sewing   |       | Recipe   |              | Cycle Time|      | Density  |
+----------+       +----------+       +----------+              +----------+       +----------+
```

### 21.1 Vertical Template Mapping Matrix
| Industry Vertical | Primary Raw Material | Core Process Log | Output Entity | Key Sector Attributes |
|---|---|---|---|---|
| **Steel (Shipped)** | Scrap / Billet | Heat Log & Rolling Mill | Rebar, Billet, Wire Rod | `heat_no`, `billet_size`, `power_kwh`, `burning_loss` |
| **Garments / Textile** | Fabric Roll, Yarn | Cutting & Sewing Bundle | Finished Apparel | `color`, `size_matrix`, `gsm`, `rejection_pct` |
| **Food & Beverage** | Raw Ingredients | Batch Processing & Pasteurize | Packaged Food/Beverage | `expiry_date`, `batch_no`, `brix`, `ph_level` |
| **Plastics** | Resin Polymers | Injection Molding / Extrusion | Molded Components | `cycle_time_sec`, `mold_id`, `cavity_count`, `runner_scrap` |
| **Chemicals** | Raw Compounds | Reactor Batch Blending | Chemical Compounds | `purity_pct`, `viscosity`, `hazmat_code`, `density` |

---

## SECTION 22 — Product Polish & UX Fine-Tuning

### 22.1 Enterprise Polish Deliverables
1. **Global Keyboard Navigation**:
   - `⌘ + K`: Open Command Palette.
   - `G + H`: Navigate Home.
   - `G + I`: Navigate Inventory.
   - `G + M`: Navigate Manufacturing.
   - `G + S`: Navigate Steel.
   - `N`: Trigger New Record creation modal on active view.
2. **Micro-Interactions**: Smooth state transitions, optimistic UI updates for instant feedback, skeleton loaders for data fetching, and toast notifications with `Undo` support.
3. **Data Integrity Enhancements**: Form auto-save to `localStorage` to prevent data loss during network drops, inline field validation, and confirmation drawers for destructive actions.

---

## SECTION 23 — Post-MVP Master Roadmap

```
Phase 2: Enterprise UI & Polish ──> Phase 3: Advanced Security & Analytics ──> Phase 4: AI Platform & Automation ──> Phase 5: Multi-Industry Expansion ──> Phase 6: Global Scale & Ecosystem
```

### 23.1 Detailed Phase Breakdown

#### Phase 2: Enterprise UI System & Polish (Months 1–2)
- **Objectives**: Transform UI/UX into an enterprise-grade, high-density interface.
- **Deliverables**: Command Palette (`⌘K`), Virtual Tables, Saved Views, Dark/Light Mode, Touch HMI layout for operators.
- **Dependencies**: Completed MVP (Sections 1–10).
- **Risks**: UI performance regression with virtualized tables.
- **Success Criteria**: Page load < 0.8s, 100% positive feedback on operator touch targets.

#### Phase 3: Advanced Security, Observability & Analytics (Months 3–4)
- **Objectives**: Enterprise security compliance, SOC2/OWASP readiness, and full observability.
- **Deliverables**: MFA (TOTP/WebAuthn), IP Whitelisting, Immutable Audit Logs, OpenTelemetry + Grafana tracing setup, Executive KPI Dashboards.
- **Dependencies**: Phase 2.
- **Risks**: Audit log database bloat over time.
- **Success Criteria**: Zero OWASP Top 10 vulnerabilities, 100% trace visibility across API endpoints.

#### Phase 4: AI Platform Engine & Automation (Months 5–6)
- **Objectives**: Integrate LLMs, predictive manufacturing insights, and RAG-based query assistant.
- **Deliverables**: AI Gateway, Natural Language Text-to-SQL Engine, Predictive Maintenance & Burning Loss Alerting.
- **Dependencies**: Phase 3.
- **Risks**: Hallucinations in generated SQL queries.
- **Success Criteria**: Text-to-SQL accuracy > 95% with strict tenant isolation enforcement.

#### Phase 5: Multi-Industry Expansion Engine (Months 7–9)
- **Objectives**: Expand template system to support Garments, Food & Beverage, and Plastics.
- **Deliverables**: Dynamic field wizard, multi-industry template packs, batch/expiry lot tracking.
- **Dependencies**: Phase 4.
- **Risks**: Over-complicating generic core models.
- **Success Criteria**: Successfully onboard a Garments or F&B pilot tenant without core backend changes.

#### Phase 6: Global Scale, Integration Hub & Ecosystem (Months 10–12)
- **Objectives**: Enable third-party API webhooks, SAP/Oracle integration connectors, and multi-region DB replication.
- **Deliverables**: Public Developer API Portal, Webhook engine, Multi-region PostgreSQL read replicas, ERP Sync connectors.
- **Dependencies**: Phase 5.
- **Risks**: Webhook delivery failure under high traffic.
- **Success Criteria**: Support 500+ active enterprise tenants with 99.99% uptime SLA.

---

## SECTION 24 — Technical Debt Assessment

| Debt Item | Severity | Impact Area | Mitigation Strategy | Priority |
|---|---|---|---|---|
| **Direct JSON Querying** | Medium | Reporting Speed | Add Postgres expression indexes on frequently accessed `attrs` JSON keys | P1 |
| **In-Memory Rate Limiter** | High | Multi-Instance Sync | Replace local memory rate limiter with Redis distributed token bucket | P0 |
| **Monolithic Route File** | Low | Developer Ergonomics | Split `index.ts` routes into modular sub-router packages | P2 |
| **Client-Side Data Aggregation**| Medium | Browser Memory | Shift KPI aggregations to database analytical queries / Materialized Views | P1 |

---

## SECTION 25 — Definition of Production Ready (Go-Live Checklist)

Before onboarding the first external manufacturing enterprise customer, the platform must pass 100% of this checklist:

```
[ ] SECURITY & ACCESS CONTROL
    [ ] Multi-Factor Authentication (MFA) fully enforced for tenant admins.
    [ ] Tenant isolation validated via automated cross-tenant data leakage tests.
    [ ] Penetration testing completed with 0 critical/high findings.
    [ ] OWASP Top 10 mitigation verified.

[ ] PERFORMANCE & SCALABILITY
    [ ] P95 API latency under 50ms under load (1,000 req/sec).
    [ ] Database connection pooling configured and tested for failover.
    [ ] CDN edge caching active for static assets and UI bundles.

[ ] RELIABILITY & DISASTER RECOVERY
    [ ] Automated daily DB backups + Point-in-Time Recovery (PITR) verified with restore test.
    [ ] RPO < 5 mins and RTO < 15 mins confirmed.
    [ ] Blue/Green deployment pipeline active with zero-downtime updates.

[ ] OBSERVABILITY & SUPPORT
    [ ] Prometheus + Grafana dashboards active with real-time alerting for 5xx errors.
    [ ] Sentry exception tracking integrated across frontend and backend.
    [ ] 24/7 incident escalation policy configured.

[ ] DOCUMENTATION & TRAINING
    [ ] End-user operator manual published.
    [ ] API documentation published via OpenAPI / Swagger.
    [ ] Data migration Excel/CSV templates tested and approved.
```

---

*Softlligence Technologies — Executive Product Team*  
*Official Product Refinement & Enterprise Readiness Plan (v2.0.0)*
