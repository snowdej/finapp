# PromptPlan: Step-by-Step Blueprint for Building the Pension & Property Financial Projection Tool

*This PromptPlan follows the architecture and requirements from **spec.md**, using **React (TypeScript)**, **shadcn/ui** (or Material UI), **Tailwind CSS**, **Recharts**, **React-Table**, **IndexedDB**, and best-practice test-driven, incremental, integrated development.*

---

## High-Level Iterative Blueprint

### 1. Set Up and Scaffold the Project - [x]

* Initialise Vite (or Create React App) with React + TypeScript
* Configure Tailwind CSS
* Set up shadcn/ui (or Material UI) components
* Set up Recharts and React-Table
* Set up IndexedDB (using idb library)

### 2. Data Model, Types, and Utilities - [x]

* Define core TypeScript interfaces (Person, Asset, Loan, FinancialItem, Scenario, ChangeLog, Assumptions)
* Write utility functions for IDs, dates, and deep clones
* Implement core validation functions

### 3. Core App Layout and Navigation - [x]

* Build basic app shell: sidebar/tabs, dashboard landing page
* Implement light/dark mode toggle (with Tailwind/shadcn/ui)
* Add placeholder routes/views for: People, Assets, Income, Commitments, Events, Scenarios, Settings

### 4. Data Storage, Loading, and Saving - [ ]

* Implement IndexedDB wrapper for CRUD operations
* Implement autosave and manual save/export as JSON (browser File API)
* Implement import (create new plan with GUID, rename on conflict)

### 5. People Management - [ ]

* List/add/edit/delete people
* Auto-name if blank
* Validate DOB, sex

### 6. Assets & Loans Management - [ ]

* List/add/edit/delete assets (ISAs, SIPPs, Property, etc.)
* Assign one/many/all owners (equal split)
* Add/edit/remove multiple loans per asset
* Manual override of asset value for a year

### 7. Income & Commitments - [ ]

* List/add/edit/delete incomes and commitments
* Assign owners (joint for adults, or assign to child)
* Support all frequencies and per-item/category overrides
* Specify income destinations and sources , cash, asset, external

### 8. Events & Timeline - [ ]

* Add/list/edit/delete custom future events (positive/negative, link to assets)
* Show as timeline/list

### 9. Assumptions & Overrides - [ ]

* Edit plan-wide and category/item overrides for inflation/growth
* Precedence logic: plan < category < item

### 10. Scenario System - [ ]

* List scenarios, create/copy, switch between
* Apply changes only to selected scenario
* Mark base scenario

### 11. Calculations Engine - [ ]

* Year-by-year projection for each item
* Manual override logic (apply from override year forward)
* Category grouping, expand/collapse logic
* Prevent negative investment balances; warnings for other negatives

### 12. Reporting: Tables & Graphs - [ ]

* Yearly snapshot table with group/merge/expand/collapse
* Recharts graphs (net worth, cashflow, assets, breakdowns)
* Highlight overrides, warnings
* Support for large datasets (virtual scroll if needed)
* Export snapshot table as CSV

### 13. Change Timeline (Git-Like History) - [ ]

* Record all major interactions
* View history, hard-revert to any point

### 14. Accessibility & Polish - [ ]

* Ensure best practice accessibility (labels, keyboard navigation, contrast, ARIA roles)
* Responsive design
* Finalise British English/£ UI

### 15. Testing - [ ]

* Write unit and integration tests (Jest/Vitest + Cypress/Playwright)
* Manual testing for cross-browser, edge cases, large datasets

---

## Chunked, Iterative Steps and LLM Code-Gen Prompts

### \[Step 1] — **Project Bootstrap** - [ ]

```text
Create a new Vite (or Create React App) project with React and TypeScript. Add Tailwind CSS, shadcn/ui (or Material UI), Recharts, React-Table, and the idb library for IndexedDB support. Scaffold the src directory structure for components, types, utils, and features.

Write Jest or Vitest as the test runner. Confirm the app loads and the dependencies work by displaying a starter dashboard.
```

---

### \[Step 2] — **TypeScript Data Models and Utilities** - [ ]

```text
Define TypeScript interfaces for Person, Asset, Loan, FinancialItem, Scenario, ChangeLog, Assumptions, as per spec.md. Write type guards and validation helpers (e.g., isValidDate, isNonNegative, isValidName).

Write core utility functions for generating unique IDs (UUID), deep-cloning objects, and calculating ages from DOBs. Write Jest/Vitest unit tests for each utility.
```

---

### \[Step 3] — **App Shell and Navigation** - [x]

```text
Implement the app's main layout using shadcn/ui (or Material UI) and Tailwind CSS. Build a sidebar or tab navigation structure with placeholder pages for Dashboard, People, Assets, Income, Commitments, Events, Scenarios, Settings.

Implement a light/dark mode toggle (persist theme in localStorage). Write tests to confirm navigation and theme switching.
```

---

### \[Step 4] — **IndexedDB Storage, Import/Export** - [ ]

```text
Create a data persistence module using idb (IndexedDB wrapper). Implement functions for CRUD operations on plans/scenarios.

Implement manual export (as JSON, with metadata: name, date, schema version, GUID) and import (creating new plan with unique GUID, renaming on conflict). Add autosave on major changes. Write integration tests for save/load/export/import.
```

---

### \[Step 5] — **People CRUD UI** - [ ]

```text
Build forms and lists for adding, editing, and removing people (shadcn/ui/Material forms). Validate DOB and sex. Auto-assign unique names if blank.

Update the dashboard summary to show people count and ages. Write tests for all people-management flows.
```

---

### \[Step 6] — **Assets and Loans CRUD UI** - [ ]

```text
Implement forms/lists for assets (ISA, SIPP, property, etc.), with assignment to one/many/all owners. For properties/assets, add UI to attach multiple loans, each with terms.

Implement validation to block negative investments. Support manual override of asset value for a year (add/remove/list). Test asset and loan flows with unit and UI tests.
```

---

### \[Step 7] — **Income & Commitments CRUD UI** - [ ]

```text
Build UI for incomes and commitments, supporting all frequencies and per-item/category inflation/growth overrides. Assign joint (adults) or to child as needed.

Allow destination to be specified (cash, asset, or other). Validate and test CRUD and assignment logic.
```

---

### \[Step 8] — **Events & Timeline Management** - [ ]

```text
Create UI for listing, adding, editing, deleting custom future events. Allow linking to assets (for lump sum withdrawals, inheritances, liabilities).

Show all events in a timeline/list view. Record changes in the git-like history. Test all event flows and history log updates.
```

---

### \[Step 9] — **Assumptions, Category, and Item Overrides** - [ ]

```text
Implement forms/settings for plan-wide, category, and per-item inflation/growth settings. Apply correct precedence: plan < category < item. Update UI to show current assumptions in use for each item.

Test all override flows and calculation logic.
```

---

### \[Step 10] — **Scenario System** - [ ]

```text
Implement scenario management: list scenarios, create/copy, switch active scenario. Mark base scenario. Changes should only apply to the selected scenario. Ensure correct context is preserved when switching.

Test scenario CRUD and switching behaviour.
```

---

### \[Step 11] — **Projection Engine** - [ ]

```text
Write core functions to generate year-by-year projections for all people, assets, incomes, commitments, and events. Ensure manual overrides are respected, with new base after override year. Block negative investments, warn for other negatives.

Support grouping/merging by category for summary outputs. Write thorough unit tests for projection calculations.
```

---

### \[Step 12] — **Tables & Graphs Reporting** - [ ]

```text
Build React-Table-based yearly snapshot with expand/collapse for categories. Implement merging/summarising (all ISAs, all income, all commitments) and detail toggles. Highlight manual overrides and warnings.

Add Recharts graphs: net worth, cashflow, asset breakdown, etc. Test with large datasets and edge cases. Add CSV export for tables.
```

---

### \[Step 13] — **Git-Like Change Timeline** - [ ]

```text
Implement timeline/history tracking for all major actions: add/remove/edit items, assumptions, overrides. Each log includes auto-generated summary, timestamp, plan/scenario.

Show timeline in UI and allow user to hard-revert to any previous state. Test timeline display, log creation, and rollback logic.
```

---

### \[Step 14] — **Accessibility, UI Polish & Integration** - [ ]

```text
Review all forms, tables, and components for keyboard navigation, labels, contrast, and ARIA roles. Finalise responsive layout and British English/£ UI. Remove orphaned code, integrate and test all flows.
```

---

### \[Step 15] — **Testing: Final Pass** - [ ]

```text
Expand on unit and integration tests to cover:
- People/assets/income/events CRUD
- Calculations and projection correctness
- History log and scenario switching
- Data import/export
- Accessibility
- Performance with large plans
Conduct manual browser and device checks.
```

---

## Prompt Usage Instructions

* Use **one prompt section per dev iteration**.
* Each prompt should result in code that passes its associated tests and integrates with previous steps.
* Always maintain test-driven, incremental progress.
* After each prompt, integrate and validate before moving on.
* No code should remain unintegrated; each step builds directly on previous work.


