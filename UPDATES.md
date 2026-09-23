# System Updates & Enhancements

## Feature 1: Fully Customizable Report Builder & Flexible Input System

### 1. What We Built

**Custom Report Builder**
- A new interactive report generation module that allows users to build their own bespoke reports on the fly.
- Users can select a specific **Data Source** (e.g., Scrap Sourcing, Furnace Melting, Billet CCM).
- **Data Merging**: Users can select multiple data sources to seamlessly merge related datasets (e.g., Scrap + Furnace) into a single, unified analytical view.
- Based on the chosen data sources, the system dynamically displays a checklist of all available data columns (including dynamically added custom fields).
- Users check the exact columns they want to view, generating a real-time responsive data table that automatically updates and scales perfectly for **Excel Export**.

**Flexible Input System (Smart Spreadsheets)**
- **Inline Cell Editing:** Users can double-click on any data cell within the grid to edit its value directly. Changes automatically recalculate derived metrics (like net weight, yield, and total cost) in real-time without refreshing the page.
- **Excel Clipboard Paste:** A powerful bulk-ingestion feature added directly to the operational grids. Users can copy hundreds of rows from Microsoft Excel, click anywhere on the web table, press `Ctrl+V`, and the system will parse the TSV (Tab-Separated Values) format, calculate relevant yields automatically, and insert all rows at once.
- **Dynamic Form Schema:** The "Log New Record" modals were upgraded to support unstructured, dynamic data. Users can click `+ Add Custom Column` directly inside the input form. This appends a new text field instantly without needing a developer to alter the database schema or code. 

## Feature 2: Ultimate UI Flexibility (Drag & Drop + Data Management)

### 1. What We Built

**Native Drag & Drop Reordering**
- **Row Reordering:** Users can click and hold a drag handle (`≡`) on the left side of any row to physically drag that row up or down in the grid.
- **Column Reordering:** The table layout engine was rebuilt. Users can click and drag any column header left or right to reorder how the data is visually presented. Both row and column layouts automatically persist to local storage.

**Custom Column Management**
- Users can now **Rename** or **Delete** any custom column they added.
- The system recursively loops through all historical data, safely migrating values to a new key (on rename) or securely wiping the column from existence (on delete).

### 2. How We Made This (The Process)

1. **State Abstraction:** For the Custom Reports, we mapped the active React states of all major operational data arrays into a centralized dynamic mapping function.
2. **Schema Introspection:** We utilized `Object.keys()` over the data objects to detect dynamically added properties.
3. **Clipboard Interception:** Intercepted the `ClipboardEvent`, parsing native TSV lines and tabs to map into strongly-typed TypeScript objects.
4. **HTML5 Drag-and-Drop API:** Instead of relying on heavy third-party NPM libraries, we hooked natively into `onDragStart`, `onDragOver`, and `onDrop` events on the DOM nodes, maintaining high performance. 
5. **Dynamic Column Definitions:** We refactored the hardcoded `<thead>` and `<tbody>` rendering loops to read from an ordered `displayColumns` array state, allowing the grid to change shape instantly.

### 3. Technology Stack

- **Framework:** Next.js (App Router) & React 18
- **Language:** TypeScript (using interfaces with index signatures `[key: string]: any` to support dynamic columns while maintaining type safety).
- **Styling:** Vanilla CSS & Tailwind CSS for layout.
- **State Persistence:** Local Storage API synchronizing with React `useState` & `useEffect`.
- **Browser APIs:** DOM Clipboard API (`ClipboardEvent`) and HTML5 Drag and Drop API (`DragEvent`).

### 4. Files Edited

The following files were extensively modified to support these architectural upgrades:

1. `frontend/src/app/tenant/steel/reports/page.tsx`
   - Added the `custom-builder` report type.
   - Built the dynamic column selector checkboxes.

2. `frontend/src/app/tenant/steel/furnace-log/page.tsx`
   - Added the `onPaste` handler for bulk pasting.
   - Added `+ Add Custom Column` UI into the modal.
   - Refactored table rendering for drag-and-drop rows and columns.
   - Integrated rename and delete logic for dynamic columns.

3. `frontend/src/app/tenant/steel/scrap-sourcing/page.tsx`
   - Applied identical flexible input principles: `onPaste` interception, custom schema builder, drag-and-drop grids, and column management.

## Feature 3: Global UI Responsiveness & Mobile Adaptability

### 1. What We Built

**Fully Responsive Layouts**
- Ensured the entire application across over 30 separate pages correctly adapts to mobile, tablet, and desktop screens.
- **Fluid Button & Card Groups:** Previously rigid button rows (that would break out of cards or overlap) now wrap fluidly onto new lines dynamically based on available screen space.
- **Adaptive Data Grids:** Data tables and internal dashboards natively scroll horizontally (`overflow-x-auto`) on narrow screens without forcing the entire layout to zoom out or break proportions.
- **Layout Unlocked:** Main layouts dynamically shrink and expand rather than being locked to a fixed 1280px minimum width.

### 2. How We Made This (The Process)

1. **Regex Code Transformation:** Used a python script to scan the entire `.tsx` codebase and apply structural regex modifications. 
2. **Flex Container Refactoring:** Replaced rigid `space-x-[n]` utility classes with modern, safe `flex-wrap gap-[n]` logic in hundreds of button containers across the platform.
3. **Responsive Stacking:** Updated multi-column header actions (e.g. `justify-between`) by appending `flex-wrap gap-4` to force a clean vertical stack on small screens.
4. **Width Validation:** Located and stripped any global minimum width constraints (`min-w-[1280px]`) that broke mobile viewports.

### 3. Technology Stack

- **Styling:** Tailwind CSS (specifically flexbox, flex-wrap, gap, and overflow utilities).
- **Automation:** Python script for global regex AST-like replacements.

### 4. Files Edited

Over 30 distinct page files were modified, including:
1. `frontend/src/app/tenant/steel/layout.tsx` (Removed global layout lock).
2. All tenant data entry pages (e.g., `scrap-sourcing`, `furnace-log`, `hrms-shifts`, `rolling-mill`).
3. Administrative nodes (`frontend/src/app/admin/page.tsx` and related sub-pages).
4. System entrypoints (`login/page.tsx`).
