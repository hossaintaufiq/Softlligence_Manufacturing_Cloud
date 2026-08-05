# Softlligence Manufacturing Cloud  
## Document 04 — Enterprise UI / UX Design System

| Field | Value |
|-------|--------|
| **Document ID** | SMC-DOC-04 |
| **Title** | Enterprise UI / UX Design System |
| **Product** | Softlligence Manufacturing Cloud |
| **Classification** | Official Design System & Interaction Specification |
| **Version** | 1.0.0 |
| **Status** | Draft for Engineering Baseline (Pre-Frontend Build) |
| **Owner** | Softlligence Technologies — Product Design / UX |
| **Upstream Authority** | Document 01 SRS + Document 03 API + Review 2 |
| **Downstream Consumers** | Frontend engineers, UI designers, QA, accessibility reviewers |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-08-04 | Softlligence Documentation Team | Initial enterprise UI/UX design system from SRS screens + API |

---

## Table of Contents

1. [Document Control](#1-document-control)
2. [Goals](#2-goals)
3. [Scope](#3-scope)
4. [Dependencies](#4-dependencies)
5. [Definitions](#5-definitions)
6. [Architecture References](#6-architecture-references)
7. [Design Decisions](#7-design-decisions)
8. [Brand & Visual Foundations](#8-brand--visual-foundations)
9. [Design Tokens](#9-design-tokens)
10. [Typography](#10-typography)
11. [Color System & Theme](#11-color-system--theme)
12. [Dark Mode](#12-dark-mode)
13. [Spacing, Sizing & Elevation](#13-spacing-sizing--elevation)
14. [Iconography & Motion](#14-iconography--motion)
15. [Layout Grid & Responsive System](#15-layout-grid--responsive-system)
16. [App Shell & Navigation](#16-app-shell--navigation)
17. [Permission-Aware UI](#17-permission-aware-ui)
18. [Component Library](#18-component-library)
19. [Forms Pattern Language](#19-forms-pattern-language)
20. [Tables & Data Grids](#20-tables--data-grids)
21. [Charts & Data Visualization](#21-charts--data-visualization)
22. [Modals, Drawers & Overlays](#22-modals-drawers--overlays)
23. [Notifications & Toasts](#23-notifications--toasts)
24. [Loading States](#24-loading-states)
25. [Empty States](#25-empty-states)
26. [Error States](#26-error-states)
27. [Keyboard Navigation](#27-keyboard-navigation)
28. [Accessibility Requirements](#28-accessibility-requirements)
29. [Page Templates](#29-page-templates)
30. [Portal Page Catalog](#30-portal-page-catalog)
31. [Plant-Floor UX Patterns](#31-plant-floor-ux-patterns)
32. [Print & Export UX](#32-print--export-ux)
33. [Content, Voice & Microcopy](#33-content-voice--microcopy)
34. [Best Practices](#34-best-practices)
35. [Future Expansion](#35-future-expansion)
36. [Appendices](#36-appendices)
37. [Cross References](#37-cross-references)

---

# 1. Document Control

### 1.1 Purpose

This document defines the **enterprise UI/UX design system** for Softlligence Manufacturing Cloud: tokens, components, layouts, navigation, interaction patterns, accessibility, and page-level design rules for every portal defined in the SRS.

It is the last major design artifact **before frontend development**. It does not include React code, CSS files, or Tailwind configuration (Review 2 keeps Next.js; styling approach is token-driven CSS — Tailwind optional as implementation detail in Document 05, not required here).

### 1.2 Binding product rules

- Steel is a **template navigation pack**, not a separate product shell (Review 2).  
- UI never grants power; permissions only **hide/disable** (SRS / Review 2).  
- No fake “security role switcher” (Review 1 critical defect).  
- Scope switcher is **within-tenant** factory/warehouse context only.  

---

# 2. Goals

| ID | Goal |
|----|------|
| UX-01 | One coherent system across Super Admin, Company Admin, Ops |
| UX-02 | Plant users complete common entries in ≤ 3 primary steps (SRS NFR-004) |
| UX-03 | Accessible, keyboard-complete primary flows (SRS NFR-006) |
| UX-04 | Responsive from mobile drawer to desktop dense grids |
| UX-05 | Clear loading / empty / error / permission-denied states |
| UX-06 | Themeable light + dark with tenant branding hooks |
| UX-07 | Design tokens as single source for color/type/space |

---

# 3. Scope

**In scope:** All portals in SRS §14–15; component inventory; page templates; interaction states; a11y; dark mode; chart guidance; notification UX; print layouts.

**Out of scope:** Marketing website art direction beyond shared tokens; native mobile app UI (Later); illustration library commissioning.

---

# 4. Dependencies

| Document | Use |
|----------|-----|
| `01_SRS.md` | Screens SCR-*, forms FRM-*, actions ACT-*, roles |
| `03_API_Specification.md` | Async jobs, errors, pagination UX mapping |
| Review 2 §12–13 | Portal split Super Admin vs Company |

---

# 5. Definitions

| Term | Meaning |
|------|---------|
| **Token** | Named design value (color, space, radius, shadow) |
| **Component** | Reusable UI unit with states |
| **Pattern** | Composition of components for a recurring problem |
| **App shell** | Chrome: nav, topbar, main |
| **Density** | Comfortable vs compact (ops tables) |
| **Entitlement gate** | UI when module disabled |
| **Scope chip** | Active factory/warehouse context |

---

# 6. Architecture References

| Binding | Source |
|---------|--------|
| Multi-portal Next.js | Review 2 §1, §20 |
| Module-aware navigation | Review 2 §14; SRS §14 |
| Async jobs show progress | SRS FR-076; API 202 jobs |
| Server authz source of truth | Review 2 principle #5 |

---

# 7. Design Decisions

| ID | Decision |
|----|----------|
| UD-01 | Token-first design system; no hard-coded hex in features |
| UD-02 | Light default; dark mode via `data-theme="dark"` |
| UD-03 | Desktop-first ops density; mobile progressive disclosure |
| UD-04 | Primary brand: industrial blue (not purple-gradient cliché) |
| UD-05 | Tables are the workhorse; cards only for KPIs and summaries |
| UD-06 | Destructive actions always confirm |
| UD-07 | Disabled controls show tooltip with reason (permission/module) |
| UD-08 | Prefer drawers for create/edit on large lists; full pages for complex WO |
| UD-09 | Chart palette accessible (colorblind-safe) |
| UD-10 | Tenant branding limited to logo + primary accent + print letterhead |

---

# 8. Brand & Visual Foundations

### 8.1 Product personality

**Reliable · Industrial · Clear · Calm.**  
High signal, low decoration. No emoji in enterprise chrome. No neon glow.

### 8.2 Logo placement

| Surface | Rule |
|---------|------|
| Auth | Brand mark + product name hero-adjacent |
| App topbar | Compact mark |
| Print | Tenant logo left; Softlligence small footer optional |
| Super Admin | Softlligence platform mark |

### 8.3 Portal visual distinction

| Portal | Accent cue |
|--------|------------|
| Super Admin | Neutral dark sidebar + platform badge |
| Company Admin | Brand primary sidebar |
| Ops / Plant | Same shell; denser tables; scope chip prominent |

---

# 9. Design Tokens

### 9.1 Token layers

1. **Primitive** — raw palette  
2. **Semantic** — `--color-bg`, `--color-danger`  
3. **Component** — `--button-primary-bg`  

### 9.2 Color primitives (light reference)

| Token | Value | Role |
|-------|-------|------|
| `color.blue.600` | `#0284C7` | Primary (aligns pilot brand; adjustable) |
| `color.blue.700` | `#0369A1` | Primary hover |
| `color.slate.50–900` | slate scale | Neutrals |
| `color.green.600` | `#059669` | Success |
| `color.amber.500` | `#F59E0B` | Warning |
| `color.red.600` | `#DC2626` | Danger |
| `color.cyan.700` | `#0E7490` | Info |

### 9.3 Semantic tokens

| Token | Light | Dark |
|-------|-------|------|
| `--bg-canvas` | slate-50 | slate-950 |
| `--bg-surface` | white | slate-900 |
| `--bg-subtle` | slate-100 | slate-800 |
| `--border-default` | slate-200 | slate-700 |
| `--text-primary` | slate-900 | slate-50 |
| `--text-secondary` | slate-600 | slate-300 |
| `--text-muted` | slate-400 | slate-500 |
| `--action-primary` | blue-600 | blue-400 |
| `--action-danger` | red-600 | red-400 |
| `--focus-ring` | blue-600 @ 2px | blue-300 |
| `--overlay-scrim` | black/40 | black/60 |

### 9.4 Spacing scale (rem)

`0, 1=4px, 2=8, 3=12, 4=16, 5=20, 6=24, 8=32, 10=40, 12=48, 16=64`

### 9.5 Radius

`radius.sm=4` · `md=8` · `lg=12` · `full=9999` (avatars only; avoid pill overload in chrome)

### 9.6 Shadow

`shadow.sm`, `shadow.md` — restrained; no multi-layer neon stacks.

### 9.7 Z-index scale

`dropdown=1000`, `sticky=1100`, `drawer=1200`, `modal=1300`, `toast=1400`, `spotlight=1500`

---

# 10. Typography

| Role | Spec |
|------|------|
| Font family UI | Plus Jakarta Sans / Outfit fallback system-ui |
| Font family mono | JetBrains Mono for codes, heat nos, IDs |
| Display | 30/36 semibold — rare (auth, empty) |
| H1 page | 24/32 semibold |
| H2 section | 18/28 semibold |
| Body | 14/20 regular |
| Body dense | 13/18 |
| Label | 12/16 medium |
| Caption | 12/16 muted |

**Rule:** Load fonts via `next/font` or equivalent — do not declare unused families (Review 1 gap).

---

# 11. Color System & Theme

### 11.1 Status colors

| Status | Token | Usage |
|--------|-------|-------|
| Draft | slate | badges |
| In approval | amber | |
| Released / Active | blue | |
| Completed / Posted | green | |
| Cancelled | slate strikethrough | |
| Failed / NCR | red | |
| Suspended tenant | red emphasis | |

### 11.2 Tenant branding

Allowed overrides: `--brand-primary`, logo URL, print header.  
Forbidden: arbitrary CSS injection, replacing danger colors, removing focus rings.

---

# 12. Dark Mode

| Rule | Detail |
|------|--------|
| Toggle | User preference + system `prefers-color-scheme` default |
| Storage | User profile setting via API when available |
| Charts | Use semantic series tokens, not hard RGB |
| Images/logos | Provide dark-safe logo variant when tenant uploads |
| Super Admin | May default dark |
| Contrast | WCAG AA minimum for text |

Implementation attribute: `html[data-theme="light"|"dark"]`.

---

# 13. Spacing, Sizing & Elevation

| Control | Height |
|---------|--------|
| Button sm | 32px |
| Button md | 36px |
| Button lg | 40px |
| Input md | 36px |
| Table row comfortable | 44px |
| Table row compact | 36px |

Plant ops default **compact**; admin default **comfortable**.

---

# 14. Iconography & Motion

- Icon set: Lucide-compatible metaphors (consistent 20/24px)  
- Motion: 150–250ms ease for drawers/toasts; respect `prefers-reduced-motion`  
- Intentional motion only: page fade-in subtle, sidebar expand, toast enter — **not** decorative bounce  

---

# 15. Layout Grid & Responsive System

### 15.1 Breakpoints

| Name | Width | Behavior |
|------|-------|----------|
| `sm` | ≥640 | Forms stack → 2-col |
| `md` | ≥768 | |
| `lg` | ≥1024 | Persistent sidebar |
| `xl` | ≥1280 | Content max 1440 centered optional |
| `2xl` | ≥1536 | Wide tables full bleed in main |

### 15.2 App frame

```
┌──────────────────────────────────────────────┐
│ Topbar                                        │
├────────────┬─────────────────────────────────┤
│ Sidebar    │ Page header                      │
│            ├─────────────────────────────────┤
│            │ Filters / tabs                   │
│            ├─────────────────────────────────┤
│            │ Main content                     │
│            │                                  │
└────────────┴─────────────────────────────────┘
```

### 15.3 Mobile

- Sidebar → drawer  
- Topbar keeps: menu, scope, notifications, user  
- Global search may collapse to icon  
- Tables → card list **or** horizontal scroll with sticky first column (ops prefer sticky)

---

# 16. App Shell & Navigation

### 16.1 Sidebar IA rules

1. Only **entitled + enabled** modules appear  
2. Steel group appears only if template installed  
3. Active item: primary bar + contrast  
4. Nested items for Inventory / Manufacturing / etc.  
5. Bottom: Settings, Help, Billing (role-gated)  

### 16.2 Topbar elements

| Element | Behavior |
|---------|----------|
| Brand | Home |
| Scope switcher | Factory / warehouse within tenant |
| Search | Cmd/Ctrl+K command palette (P1+) |
| Approvals badge | Pending count |
| Notifications bell | Inbox |
| User menu | Profile, theme, security, logout |

### 16.3 Scope switcher UX

- Label: “Context” not “Security role”  
- Changing scope refetches scoped lists  
- Never implies cross-tenant switch for company users  
- Super Admin tenant picker is a **separate** platform control  

### 16.4 Super Admin nav visual

Distinct “PLATFORM” eyebrow; tenants search always available.

---

# 17. Permission-Aware UI

| Situation | UI behavior |
|-----------|-------------|
| No permission | Hide nav item; deep link → SCR-SHR-07 Forbidden page |
| Can view not edit | Hide Save; fields read-only |
| Module disabled | SCR-SHR-09 Empty Module with upsell if Owner |
| Button forbidden | Do not show; if remaining disabled, tooltip “Requires permission X” |
| Partial field rights | Rare — prefer document-level |

**Never** rely on client role switcher to unlock controls.

---

# 18. Component Library

### 18.1 Foundations

| Component | Variants / notes |
|-----------|------------------|
| Button | primary, secondary, ghost, danger, link; sm/md/lg; loading |
| IconButton | aria-label required |
| Input | text, number, password, search |
| Textarea | autosize optional |
| Select | single/multi |
| Combobox | async search (parties, items) |
| Checkbox / Radio / Switch | |
| DatePicker / DateRange | |
| Time / DateTime | |
| FileDropzone | |
| Badge / StatusPill | status map §11 |
| Tag | filters |
| Avatar | |
| Tooltip | |
| Spinner / Progress | |
| Skeleton | |
| Divider | |
| Link | |

### 18.2 Feedback

Toast, Alert inline, Banner, EmptyState, ErrorState, PermissionDenied.

### 18.3 Overlay

Modal, ConfirmDialog, Drawer, Popover, DropdownMenu, CommandPalette.

### 18.4 Data display

Table/DataGrid, DescriptionList, StatCard/MetricCard, Tabs, Accordion, Pagination, Breadcrumbs.

### 18.5 Charts

Line, Area, Bar, Pie/Donut — wrapped with empty/loading.

### 18.6 Domain composites

| Composite | Use |
|-----------|-----|
| `PageHeader` | title, crumbs, primary/secondary actions |
| `FilterBar` | q, status, date range, factory |
| `ResourceListPage` | header+filters+table |
| `ResourceDetailHeader` | status, doc no, actions |
| `LineEditor` | editable lines for PO/WO/Dispatch |
| `AttrsFormSection` | dynamic custom fields |
| `JobProgressPanel` | import/export/report |
| `ApprovalActions` | approve/reject/delegate |
| `ScopeBreadcrumb` | company / factory |

---

# 19. Forms Pattern Language

### 19.1 Anatomy

```
PageHeader
Form sections (cards)
  - Basic fields
  - AttrsFormSection (custom fields)
  - LineEditor (if document)
Sticky footer: Cancel · Secondary · Primary Save
```

### 19.2 Validation UX

- Inline field errors on blur/submit  
- Summary alert at top if ≥3 errors  
- Map API `details[].field` to inputs  
- Disable double-submit (loading on primary)  

### 19.3 Field layout

| Density | Columns (lg+) |
|---------|----------------|
| Admin | 2 |
| Plant entry | 2–3 with large touch targets optional |
| Lines | Full-width table |

### 19.4 Required indicators

Asterisk + `required` in label; don’t rely on color alone.

---

# 20. Tables & Data Grids

### 20.1 Capabilities (SRS DataGrid successor)

| Feature | Required |
|---------|----------|
| Column sort (API sort whitelist) | Yes |
| Column show/hide | P1 |
| Pagination (cursor) | Yes — never silent truncate as truth |
| Row selection | When bulk actions exist |
| Row actions menu | View/Edit/… |
| Sticky header | Yes |
| Sticky first column (mobile/wide) | Yes |
| Empty / loading / error | Yes |
| Export button | Permission-gated |
| Compact mode | Ops default |

### 20.2 Pagination UX

Show “Showing page · Next/Prev”; if `include_total`, show counts.  
Do not claim “all records” when API paginated.

### 20.3 Inline edit

Discouraged for transactional docs; use drawer/page.

---

# 21. Charts & Data Visualization

| Rule | Detail |
|------|--------|
| Max series | Prefer ≤6 without toggle |
| Empty | Chart EmptyState |
| Loading | Skeleton chart |
| Tooltip | Include units (kg, %, kWh/t) |
| Steel KPIs | Yield line, energy bar, scrap reasons |
| Colorblind | Avoid red/green only encoding — use pattern/shape |
| Drill-down | Click → filtered list page |

Library choice is implementation (Recharts acceptable); wrappers mandatory.

---

# 22. Modals, Drawers & Overlays

| Pattern | When |
|---------|------|
| ConfirmDialog | Delete, cancel WO, suspend tenant, break-glass |
| Modal | Small forms, MFA, session messages |
| Drawer | Create/edit masters from list |
| Full page | WO detail, workflow designer, impersonation caution |

### 22.1 A11y overlay rules

- `role="dialog"`, `aria-modal="true"`  
- Focus trap; restore focus on close  
- ESC closes (unless destructive confirm requires explicit choice)  
- Labelled by title  

---

# 23. Notifications & Toasts

| Type | Duration | Use |
|------|----------|-----|
| Toast success | 4s | Saved |
| Toast error | sticky until dismiss | Save failed |
| Toast info | 5s | Job started |
| Bell inbox | Persistent | Approvals, system |
| Banner | Page top | Tenant suspended, payment past due |

Never use toast alone for approval tasks — also inbox.

---

# 24. Loading States

| Context | Pattern |
|---------|---------|
| App boot /auth/me | Full-shell skeleton (not blank null) |
| Table fetch | Skeleton rows |
| Save | Button spinner + disabled |
| 202 Job | JobProgressPanel with poll |
| Chart | Skeleton |
| Route change | Top progress bar optional |

---

# 25. Empty States

Every list/detail section defines:

| Element | Content |
|---------|---------|
| Illustration/icon | Simple |
| Title | “No work orders yet” |
| Description | One sentence |
| Primary CTA | If permitted — “Create work order” |
| Secondary | Docs/import |

Module locked empty: explain plan entitlement + CTA “View plans” for Owner.

---

# 26. Error States

| Error | UX |
|-------|----|
| Field validation | Inline |
| 401 | Redirect login; preserve return URL |
| 403 | Forbidden page; no chrome leak of existence |
| 404 | Not found |
| 422 business | Alert with server message |
| 429 | Toast + retry timing |
| 500 | Generic + request id for support |
| Network | Banner “Offline/connection” |

Display `request_id` in details collapse for admins.

---

# 27. Keyboard Navigation

| Shortcut | Action |
|----------|--------|
| `/` or Ctrl+K | Command palette |
| `n` then `w` | New WO (when permitted; optional) |
| `g` then `d` | Go dashboard |
| `Esc` | Close overlay |
| `?` | Shortcut help |

### 27.1 Focus rules

- Visible focus ring always (`--focus-ring`)  
- Skip link to `#main`  
- Tables: header buttons focusable  
- Menus: arrow key navigation  

---

# 28. Accessibility Requirements

| ID | Requirement |
|----|-------------|
| A11Y-01 | WCAG 2.2 AA contrast |
| A11Y-02 | All icon buttons named |
| A11Y-03 | Form inputs have labels |
| A11Y-04 | Errors linked via `aria-describedby` |
| A11Y-05 | Live region for toasts (`aria-live=polite`) |
| A11Y-06 | Reduced motion respected |
| A11Y-07 | Don’t convey status by color alone |
| A11Y-08 | Hit target ≥24px (preferred 32+) |
| A11Y-09 | Language attribute on `html` |
| A11Y-10 | Auth pages usable without mouse |

---

# 29. Page Templates

### T-01 List page
PageHeader + FilterBar + DataGrid + Empty/Loading/Error

### T-02 Detail page
Header with status + tabs (Overview / Lines / History / Files / Audit)

### T-03 Create/Edit page
Form pattern §19

### T-04 Dashboard
KPI row + chart row + work queue tables

### T-05 Settings
Left subnav + form sections

### T-06 Auth
Centered card, minimal chrome, brand

### T-07 Job progress
Panel + success/fail summary + download links

### T-08 Approval inbox
Task list + detail split view

### T-09 Forbidden / Upsell
Single message + actions

### T-10 Print preview
Letterhead + tables + signatures (steel daily report)

<!-- UI_PART_1_END -->
---

# 30. Portal Page Catalog

Each SRS screen maps to a template + key components. Designers/FE must implement these surfaces.

## 30.1 Authentication (SCR-AUTH-*)

| Screen | Template | Notes |
|--------|----------|-------|
| SCR-AUTH-01 Login | T-06 | Email/password; SSO buttons; errors inline |
| SCR-AUTH-02 MFA | T-06 | OTP input; backup code link |
| SCR-AUTH-03 Forgot | T-06 | |
| SCR-AUTH-04 Reset | T-06 | Password policy hints |
| SCR-AUTH-05 Invite accept | T-06 | |
| SCR-AUTH-06 SSO landing | T-06 | Spinner + failure state |
| SCR-AUTH-07 Tenant picker | T-06 | List of workspaces |
| SCR-AUTH-08 Suspended | T-09 | Contact support |
| SCR-AUTH-09 Session expired | T-06 | Re-auth |

## 30.2 Super Admin (SCR-SA-*)

| Screen | Template | Primary components |
|--------|----------|-------------------|
| SCR-SA-01 Platform Dashboard | T-04 | KPI: tenants, MRR, jobs failing |
| SCR-SA-02 Tenant List | T-01 | Search, status filter |
| SCR-SA-03 Tenant Detail | T-02 | Tabs: overview, subscription, usage, audit |
| SCR-SA-04 Create/Edit Tenant | T-03 / Drawer | |
| SCR-SA-05 Suspend confirm | ConfirmDialog | Reason field |
| SCR-SA-06 Break-glass | ConfirmDialog | Reason + duration; warning banner |
| SCR-SA-07–10 Plans/Subs | T-01/T-02 | |
| SCR-SA-12 Revenue | T-04 | Charts |
| SCR-SA-14 Usage Explorer | T-01 | Meter filters |
| SCR-SA-16 Feature Flags | T-01 | Switches |
| SCR-SA-17–18 Jobs | T-01/T-07 | Retry action |
| SCR-SA-19–20 Errors/Health | T-04 | |
| SCR-SA-21 Platform Audit | T-01 | |
| SCR-SA-22–23 Support | T-01/T-02 | |
| SCR-SA-24–26 Users/Roles/Settings | T-01/T-05 | |

## 30.3 Company Admin — Org & People

| Screen | Template |
|--------|----------|
| SCR-ORG-01…18 | T-01 / T-02 / T-03 |
| SCR-IAM-01…14 | T-01 / T-02 / T-03 |
| SCR-IAM-15–16 Profile/Security | T-05 |
| SCR-MOD-01–02 Modules | T-01 + entitlement cards |
| SCR-CF-01–02 Custom fields | T-01 / T-03 |
| SCR-WF-01–03 Workflows | T-01 + designer canvas (WF-02) |
| SCR-SET-01–06 Settings/Notif | T-05 |
| SCR-AUD-01 Audit | T-01 |
| SCR-BILL-01–05 Billing | T-02 / T-04 |
| SCR-FILE-01–02 Files | T-01 |
| SCR-NOTIF-01–02 | Inbox / T-05 |

## 30.4 Operations — Inventory & Manufacturing

| Screen | Template | UX notes |
|--------|----------|----------|
| SCR-INV-01 Dashboard | T-04 | |
| SCR-INV-02–04 Items | T-01/T-03 | Combobox-friendly codes |
| SCR-INV-05 On-hand | T-01 | Warehouse scope default |
| SCR-INV-06 Ledger | T-01 | Dense; export |
| SCR-INV-07–11 Transfers/Adj/Lots | T-03 / T-01 | Post = primary |
| SCR-INV-12 Import | T-07 | dry-run step |
| SCR-MFG-01 Dashboard | T-04 | WO queue |
| SCR-MFG-02–05 BOM/Routing | T-01/T-03 | LineEditor |
| SCR-MFG-06–08 WO list/detail/create | T-01/T-02/T-03 | Detail = hub for posts |
| SCR-MFG-09–16 Actions | Confirm / Modal / Sections on detail | |
| SCR-MFG-17 Cost | T-02 tab | |
| SCR-MFG-18 Downtime | T-01 | |

## 30.5 Procurement, Sales, QA, Maintenance, HR, Finance

| Domain screens | Template |
|----------------|----------|
| SCR-PROC-* | T-01/T-02/T-03; submit approval CTA |
| SCR-SALES-* | T-01/T-02/T-03; print challan |
| SCR-QA-* | T-01/T-02; fail → NCR deep link |
| SCR-MNT-* | T-01/T-02 |
| SCR-HR-* | T-01/T-08 leave |
| SCR-FIN-* | T-01/T-02 |

## 30.6 Analytics, AI, Steel, Shared

| Screen | Template | Notes |
|--------|----------|-------|
| SCR-AN-01…05 | T-04 / T-01 / T-07 | Report runner |
| SCR-AI-01 | Chat split view | Citations panel |
| SCR-AI-02–04 | T-04 | Advisory banners |
| SCR-AI-05 Credits | T-02 | |
| SCR-STL-01 Steel Dashboard | T-04 | Steel KPI set |
| SCR-STL-02–18 | T-01/T-03/T-07/T-10 | Map to core forms; heat_no monospace |
| SCR-SHR-01 Search | Full results | |
| SCR-SHR-02–03 Approvals | T-08 | |
| SCR-SHR-04–05 Jobs | T-07 | |
| SCR-SHR-06 Print | T-10 | |
| SCR-SHR-07–09 | T-09 | |
| SCR-SHR-10 Onboarding | Wizard steps | |

### 30.7 Navigation wire (Ops)

```
Dashboard
Inventory ▸ Items · On-hand · Ledger · Transfers · Adjustments
Manufacturing ▸ WO · BOM · Routings · Energy
Procurement ▸ Suppliers · POs · GRNs
Sales ▸ Customers · Orders · Dispatches
Quality ▸ …
Maintenance ▸ …
HR ▸ …
Finance ▸ … (if enabled)
Steel ▸ … (if template)
Analytics ▸ …
AI ▸ … (if enabled)
Approvals
```

---

# 31. Plant-Floor UX Patterns

| Pattern | Rule |
|---------|------|
| Defaults | Factory, warehouse, shift, machine prefilled from scope + last used |
| Large primary CTA | “Post Output”, “Save Heat” |
| Numeric keypad friendly | Input mode decimal |
| Recent docs | Quick resume list |
| Barcode/search | Focus `q` on list pages |
| Offline | Out of scope P0 — show connection banner if API fails |
| Shift handoff | Optional saved filter “My shift” |
| Validation | Block post with clear missing energy/qty messages |
| Success | Toast + stay on form with “Save & new” secondary |

---

# 32. Print & Export UX

| Artifact | Design |
|----------|--------|
| Challan / Dispatch | Letterhead, QR/doc no, lines, signatures |
| Steel Daily Heat Report | T-10; shift, furnace, yields |
| Grid export | JobProgress → download link |
| PDF fail | Error with request id |

Print CSS: hide app chrome; black text; show logo.

---

# 33. Content, Voice & Microcopy

| Voice | Clear, professional, short |
|-------|----------------------------|
| Buttons | Verb + noun: “Create work order” |
| Errors | Say how to fix |
| Permissions | “You need Plant Manager access to release work orders.” |
| Module lock | “Manufacturing is not enabled on your plan.” |
| Break-glass | “This session is audited.” |
| AI | “Suggestion — review before posting.” |

No playful copy on destructive actions.

---

# 34. Best Practices

1. Tokens only — no one-off hex in feature PRs without design review.  
2. Every new page picks a template from §29.  
3. Every list has loading/empty/error.  
4. Gate actions by permission + module.  
5. Prefer drawers for masters; pages for documents.  
6. Confirm destructive + irreversible posts.  
7. Show job progress for async.  
8. Dark mode tested on charts and tables.  
9. Keyboard path for create → save.  
10. Do not reintroduce role-switch security theatre.

---

# 35. Future Expansion

- Full command palette actions registry  
- Customizable dashboards (drag widgets)  
- Mobile PWA plant mode  
- Right-to-left locales  
- High-contrast theme  
- Design package in monorepo `packages/ui` (Review 2 §21)  

---

# 36. Appendices

## Appendix A — Component checklist (build order)

1. Tokens + ThemeProvider  
2. Button, Input, Select, Alert  
3. Modal, Drawer, Toast  
4. DataGrid + FilterBar + PageHeader  
5. Form primitives + AttrsFormSection  
6. Shell (Sidebar/Topbar)  
7. Charts wrapper  
8. JobProgress  
9. Empty/Error/Forbidden  

## Appendix B — State matrix (Button)

| State | Visual |
|-------|--------|
| default | |
| hover | |
| active | |
| focus | ring |
| loading | spinner |
| disabled | muted + tooltip |

## Appendix C — DataGrid column types

text, number, badge, date, link, money, attrs preview, actions.

## Appendix D — Chart token series

`--chart-1` … `--chart-6` defined per theme.

## Appendix E — SRS screen coverage

All SCR-* IDs in Document 01 §15 are assigned templates in §30. Any new screen must update both SRS and this catalog.

## Appendix F — Contrast pairs (minimum)

| Pair | Ratio target |
|------|--------------|
| text-primary on bg-surface | ≥4.5 |
| text-secondary on bg-surface | ≥4.5 |
| primary button text on action-primary | ≥4.5 |
| badge text on badge bg | ≥4.5 |

## Appendix G — Forbidden UI anti-patterns

| Anti-pattern | Why |
|--------------|-----|
| Blank white boot screen | Review 1 / SRS NFR |
| Unbounded “load all 200” messaging as complete data | API pagination |
| Cards everywhere on ops lists | Density |
| Purple gradient marketing chrome in app | Brand decision UD-04 |
| Color-only status | A11Y-07 |
| Modal stacks >2 deep | UX complexity |

---

# 37. Cross References

| Document | Path |
|----------|------|
| SRS | [`01_SRS.md`](./01_SRS.md) |
| Database Design | [`02_Database_Design.md`](./02_Database_Design.md) |
| API Specification | [`03_API_Specification.md`](./03_API_Specification.md) |
| Review 2 | [`REVIEW_2_Enterprise_Architecture.md`](./REVIEW_2_Enterprise_Architecture.md) |
| Review 1 | [`REVIEW_1_Architecture_Audit.md`](./REVIEW_1_Architecture_Audit.md) |
| Documentation System | [`00_Documentation_System.md`](./00_Documentation_System.md) |
| Documents Index | [`README.md`](./README.md) |
| Document 05 Playbook | `05_Development_Playbook.md` (next) |

---

## Document completion status

| Area | Status |
|------|--------|
| Tokens, theme, dark mode, a11y, keyboard | Complete |
| Components, forms, tables, charts, overlays | Complete |
| Page templates + portal screen catalog | Complete |
| Plant-floor, print, microcopy | Complete |
| React/CSS implementation | **Out of scope** |

---

**End of Document 04 — Enterprise UI / UX Design System v1.0.0**

*Softlligence Manufacturing Cloud — Official Design System*  
*Based on Document 01 SRS screens + Document 03 API behaviors. Bound by Review 2.*
