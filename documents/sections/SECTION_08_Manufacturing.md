# Section 08 — Manufacturing Core

## Overview
Section 8 implements the **Manufacturing Core** domain of the Softlligence Manufacturing Cloud architecture. It provides full lifecycle management of Bills of Materials (BOM), Work Orders, Material Issues, Finished Goods Receipts, Scrap Logging, Energy Consumption tracking, and Manufacturing Yield KPIs.

---

## 1. Database Schema & Prisma Models

The following 8 models were added to `backend/prisma/schema.prisma` in accordance with Document 02 (Enterprise Database Design §24):

- **`BomHeader`**: Represents parent item BOM headers with multi-version support (`v1.0`), validity dates (`effectiveFrom`/`effectiveTo`), active toggles, and metadata attributes (`attrsJson`).
- **`BomLine`**: Line-item components for each BOM, defining `componentItemId`, standard ratio (`qty`), scrap allowance percentage (`scrapPercent`), and unit of measure (`uomId`).
- **`WorkOrder`**: Production work order headers tracking document numbers (`WO-2026-001`), work order types (`GENERIC`, `MELT`, `ROLL`), lifecycle status (`draft`, `released`, `in_progress`, `completed`, `cancelled`), planned quantities (`qtyPlanned`), completed quantities (`qtyCompleted`), priority, and schedule.
- **`WorkOrderMaterialIssue` & `WorkOrderMaterialIssueLine`**: Records raw material issues from specific warehouses into a Work Order.
- **`WorkOrderOutput`**: Records output receipts of finished goods into FG warehouses.
- **`WorkOrderScrap`**: Log of scrapped materials with reason codes.
- **`EnergyLog`**: Tracking utility consumption (electricity, gas, water in kWh / Nm3) linked to factories and work orders.

---

## 2. Backend API Endpoints

The manufacturing API endpoints are mounted at `/api/v1/manufacturing` and protected by authentication, tenant context, and module entitlement (`requireModule('manufacturing')`):

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/manufacturing/boms` | List BOMs, optionally filtered by `parentItemId` |
| `POST` | `/api/v1/manufacturing/boms` | Create a new BOM version with component lines |
| `GET` | `/api/v1/manufacturing/work-orders` | List Work Orders, filtered by `status` or `factoryId` |
| `POST` | `/api/v1/manufacturing/work-orders` | Create a new Work Order in `draft` status |
| `PUT` | `/api/v1/manufacturing/work-orders/:id/status` | Transition status (`draft` → `released` → `in_progress` → `completed`) |
| `POST` | `/api/v1/manufacturing/material-issues` | Post raw material issue into Work Order & update Stock Ledger (`ISSUE`) |
| `POST` | `/api/v1/manufacturing/production-outputs` | Post finished goods receipt into warehouse & update Stock Ledger (`OUTPUT`) |
| `POST` | `/api/v1/manufacturing/scraps` | Log scrap quantity and reason code |
| `POST` | `/api/v1/manufacturing/energy-logs` | Record power/gas/water consumption |
| `GET` | `/api/v1/manufacturing/kpis` | Calculate Yield %, Total Produced, Active WOs, & Energy Intensity |

---

## 3. Stock Ledger Integration

All quantitative manufacturing transactions automatically update the inventory system of record (Section 7 Inventory Core):

1. **Material Issue Posting**: Creates a `StockLedgerEntry` with `movementType: 'ISSUE'`, deducting the issued quantity from the designated raw material warehouse (`StockBalance`).
2. **Production Output Posting**: Creates a `StockLedgerEntry` with `movementType: 'OUTPUT'`, adding finished goods to the designated FG warehouse (`StockBalance`), and increments `qtyCompleted` on the Work Order.

---

## 4. Frontend UI Portal (`/manufacturing`)

The frontend portal (`frontend/src/app/manufacturing/page.tsx`) provides:
- **KPI Summary Header**: Highlighting Total Work Orders, Active Orders, Overall Yield %, Total Produced FG (MT), and Energy Usage (kWh).
- **Work Orders Table**: Showing status badges, interactive completion progress bars (`qtyCompleted / qtyPlanned`), status release controls, and quick-action execution buttons.
- **Material Issue & Output Forms**: Interactive modals for issuing raw materials from inventory and posting finished goods outputs.
- **Bill of Materials (BOM) Catalog**: Structured view of item formulas and recipe ratios.

---

## 5. Verification Status

- **Prisma Schema**: Synchronized via `prisma db push` and `prisma generate`.
- **Backend Typecheck**: Passed with 0 errors (`npm run typecheck`).
- **Database Seed**: Executed successfully (`npm run db:seed`), populating `BOM (v1.0)` and `WO-2026-001`.
- **Frontend Production Build**: Passed with 0 errors (`npm run build`).
