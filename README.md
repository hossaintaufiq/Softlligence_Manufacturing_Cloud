# Softlligence Manufacturing Cloud

A Next.js full-stack multi-tenant Industrial Enterprise Resource Planning (ERP) platform designed for complex manufacturing verticals. The platform features fully interactive Excel-like inline spreadsheets, custom high-performance SVG charting, live sensor telemetry, and print-ready reporting dashboards.

---

## 🚀 Key Architectural Capabilities

### 1. Multi-Tenant Industrial Verticals
The ERP splits into three tailored tenant modules, each supporting specific business workflows:
* **Steel Manufacturing Cloud:** End-to-end logging for scrap procurement, weighbridge gates, induction furnace melting, CCM billet casting, re-rolling mill stands, lab quality chemical specs (spectrometer checks), downtime tracking, and power utilities.
* **Garments Manufacturing Cloud:** High-volume garment workflows including merchandising logs, commercial documents, inventory ledger, industrial engineering (IE), and procurement schedules.
* **Local Store Operations:** Local retail workflows including orders, POS terminal sales, ratings, invoicing, store roster shifts, and customer CRM databases.

### 2. High-Performance Excel-like Spreadsheet Engine
All operational logs are managed using interactive, editable sheets built directly in React with native HTML layouts:
* **Inline Grid Editing:** Users can double-click or click any text/number cell to edit it directly inline. Blur or press `Enter` to commit, and `Escape` to cancel.
* **Arithmetic Formula Parser:** Safe mathematical calculation evaluator allows entering formulas like `=10000-500` or `12*50`. On input blur, the expression is evaluated to a static number.
* **Excel Copy-Down (`⬇️`):** Copy-down triggers next to column headers copy the first row's value to all subsequent rows.
* **Dynamic Custom Columns:** Users can click `+ Add Column` to prompt for a custom header name and append new persistent fields to the active sheet grid.
* **Database Cross-Referencing:** Upgraded data hooks auto-resolve linkages (e.g., updating a `heat_no` in the CCM log automatically pulls corresponding furnace numbers and tapping weights from the Furnace Melt logs).
* **Date Calendar Focus Picker:** Integrated browser calendar inputs (`type="date"`) optimized to auto-save instantly on value select while avoiding focus-loss/blur dismissal.

### 3. Steel Overview Control Hub
A premium, real-time dashboard aggregating telemetry and operations feeds:
* **Interactive Control Filters:** Instantly slice data by Timeframe (7 days, 30 days, all time), Furnace selection, or Finished Rod sizes.
* **Live Telemetry Simulator:** Real-time temperature tracker showing active heats, temperatures fluctuating dynamically (1500°C–1620°C), and states cycling (*Charging*, *Melting*, *Tapping*).
* **Donut & Area SVG Charts:** Responsive vector charts built entirely with clean SVG paths for lightning-fast loads and zero external bundle bloat.
* **Lab Quality Chem Audit:** Live spectrometer analysis tracking %C, %Mn, %Si, %CE (Carbon Equivalent), and compliance status.

### 4. Dynamic Reporting Console
* Supports **11 pre-configured industrial reports** (Daily Sheets, Customer Ledgers, QA Spectrometer logs, etc.).
* Automated, instant generation upon selecting pre-configured tabs.
* **Print-Ready CSS Block:** Implements custom `@media print` style overrides that scale tables cleanly to print boundaries, avoiding viewport cutoff.

---

## 🛠️ Technology Stack
* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **Styling:** Vanilla CSS, TailwindCSS (for utility layout structure)
* **State Management:** React Context API, local storage synchronization
* **Data Visualization:** Custom inline SVG charts

---

## 📂 Project Directory Structure

```text
Softlligence_Manufacturing_Cloud/
├── backend/                       # Placed for future microservice integrations
└── frontend/                      # Main full-stack client codebase
    ├── public/                    # Static assets & public resources
    └── src/
        ├── context/               # Global state contexts (User, Auth)
        ├── lib/                   # Utility helpers & Excel exporter
        └── app/
            ├── admin/             # System administrator dashboard
            ├── api/               # Serverless Next.js API route handlers
            ├── login/             # User Authentication portal
            └── tenant/            # Multi-tenant operational zones
                ├── garments/      # Merchandising & Commercial ERP
                ├── local/         # Local Store Operations & CRM
                └── steel/         # Steel Plant ERP Pages
                    ├── overview/  # Enriched Control Hub & Live Telemetry
                    ├── reports/   # Print-ready Reporting Console
                    ├── ...        # 9 Sheet Modules (CCM, Furnace log, etc.)
                    └── layout.tsx # Scale viewport wrapper (1280px locking)
```

---

## ⚙️ Getting Started

### Prerequisites
* Node.js (v18.x or later)
* npm (v9.x or later)

### Installation
1. Clone the repository and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Run the local development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production
To compile and check for static type correctness:
```bash
npm run build
```
This builds an optimized production bundle successfully with zero static errors.
