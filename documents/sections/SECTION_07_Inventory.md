# Section 7 — Inventory Core (As-Built)

| Field | Value |
|-------|--------|
| **Document ID** | SMC-SEC-07 |
| **Plan section** | [`plan.md`](../../plan.md) § Section 7 |
| **Version** | 1.0.0 |
| **Status** | Done |
| **Date** | 2026-08-05 |
| **Owner** | Softlligence Technologies — Engineering |
| **Upstream** | Section 4, Section 5, Section 6, Doc 02 §23 |
| **Downstream** | Section 8 (Manufacturing Core) |

---

## 1. Goals (plan)

- Items, UoM, warehouses, on-hand balances, append-only stock ledger
- Inter-warehouse stock transfers & count adjustments
- Real-time stock calculation & ledger audit trail

---

## 2. Outcome summary

| Item | Result |
|------|--------|
| Data Models | `Warehouse`, `UnitOfMeasure`, `Item`, `Lot`, `StockBalance`, `StockLedgerEntry`, `StockTransfer`, `StockTransferLine`, `StockAdjustment`, `StockAdjustmentLine` |
| REST APIs | `/inventory/warehouses`, `/inventory/uoms`, `/inventory/items`, `/inventory/balances`, `/inventory/ledger`, `/inventory/transfers`, `/inventory/adjustments` |
| Permissions | 7 RBAC permissions (`inventory.items.*`, `inventory.warehouses.*`, `inventory.stock.*`) |
| Frontend UI | `/inventory` dashboard featuring Item Catalog, Warehouses & UOMs, Live Stock Balances, Stock Ledger, and Stock Movement Modal |
| Seed Data | Steel Billet 150x150mm (RM), Deformed Rebar 12mm (FG), Metric Ton & Pieces UOMs, Raw Material Yard & Finished Goods Warehouses, and 450 MT initial stock |

---

## 3. Data Model Details

- **`warehouse`**: Physical or logical storage locations bound to tenant + company + optional factory.
- **`uom`**: Unit of Measure definitions (`MT`, `PCS`, etc.).
- **`item`**: Catalog master with item types (`RM`, `WIP`, `FG`, `SPARE`, `CONSUMABLE`) and valuation methods.
- **`stock_balance`**: Materialized stock balance on-hand per warehouse + item (`@@unique([warehouseId, itemId])`).
- **`stock_ledger_entry`**: Append-only log recording `qtyIn`, `qtyOut`, movement type (`GRN`, `ISSUE`, `TRANSFER_IN`, `TRANSFER_OUT`, `ADJUST`), and reference documents.
- **`stock_transfer`**: Header and lines for inter-warehouse transfers with atomic balance updates.
- **`stock_adjustment`**: Header and lines for stock count corrections with reason codes.

---

## 4. API Endpoints

All endpoints require authenticated tenant users with corresponding RBAC permissions.

| Method | Path | Permission Required | Notes |
|--------|------|--------------------|-------|
| `GET` | `/inventory/warehouses` | `inventory.warehouses.read` | List tenant warehouses |
| `POST` | `/inventory/warehouses` | `inventory.warehouses.manage` | Create warehouse |
| `GET` | `/inventory/uoms` | `inventory.items.read` | List units of measure |
| `POST` | `/inventory/uoms` | `inventory.items.manage` | Create UOM |
| `GET` | `/inventory/items` | `inventory.items.read` | List item catalog (optional `?item_type=`) |
| `POST` | `/inventory/items` | `inventory.items.manage` | Create new catalog item |
| `GET` | `/inventory/balances` | `inventory.stock.read` | Live stock balances (optional `?warehouse_id=`) |
| `GET` | `/inventory/ledger` | `inventory.stock.read` | Stock ledger audit trail |
| `POST` | `/inventory/transfers` | `inventory.stock.transfer` | Execute inter-warehouse transfer |
| `POST` | `/inventory/adjustments` | `inventory.stock.adjust` | Execute count adjustment with reason code |

---

## 5. Verification

| Check | Result |
|-------|--------|
| Schema migration (`npx prisma db push`) | Passed |
| Database Seed (`npm run db:seed`) | Passed |
| Stock Transfer Execution | Balance updated atomically & ledger entries posted |
| Stock Adjustment Execution | Balance adjusted & ledger entry logged |
| Typecheck (`npm run typecheck`) | Clean |

---

*End of SECTION_07_Inventory*
