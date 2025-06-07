# Pension & Property Financial Projection Tool — Developer Specification

## 1. Overview

A browser-based, single-user application for comprehensive pension and property financial planning. The tool allows creation of a detailed household plan, flexible income and asset tracking, scenario modelling, and data visualisation. The application prioritises local data privacy (all data is stored locally), and uses British English and GBP (£) throughout.

## 2. Requirements

### Functional Requirements

* Users can create and manage a “Household Plan” containing:

  * Multiple named people (e.g., Jo, Fred), each with age, sex, and tracked year-by-year
  * Flexible, user-defined income, investment, asset, and commitment categories (with templates for salary, rental, ISAs, etc.)
  * Assignment of items to a person
  * Per-item attributes: name, owner, type, amount, frequency, start/end date, index-linking, growth rate, tax treatment, notes, etc.
  * Nominal/future and net present value calculations for all projections, per item and for the plan overall
  * Global (plan-wide) inflation/growth/discount rates, overridable at category or item level
  * Full scenario system: clone/edit/save independent scenario copies, amend any detail, compare/export results
  * Initial values for investments/assets, with specified growth/contribution/withdrawal, plus manual override per year to reset to reality
  * Commitment/outgoing items support multiple frequencies (one-off, monthly, weekly, quarterly, annual), end dates, inflation-linking per entry
  * Age-tracking for all people (children/adults); items can be linked to age-based triggers/milestones
  * Property assets track name/location, ownership, purchase price/date, value/growth, mortgage details, rental income, planned sale, sale assumptions, remortgage/equity options
  * Only DC (defined contribution) pensions, with all standard features: contributions (personal/employer), salary sacrifice, tax relief, growth, charges, lump sum/drawdown scheduling, etc.
  * Allow any income to be sourced from an asset (e.g., ISA/SIPP withdrawal), with balance automatically reduced; or simple custom-labelled sources
  * Create custom future events (positive/negative, dated, optional asset linkage, label, assignment)
  * Timeline/list view for future events
  * Yearly, tabular (Excel-like) snapshots for all figures, with export for actual plan and all scenarios
  * Full plan or scenario export/import as JSON, including all configuration and data
  * Option to start from an empty plan or a prepopulated sample (JSON template)
  * Data validation: prevent duplicate names, warn but allow negative balances, highlight missing/invalid fields, soft (warning) validation unless critical
  * In-app git-like history timeline (all changes, timestamps, rollback/view old version)
  * Single-user only, no authentication, all data local; user specifies local file save location
  * All UI and terminology in British English; only GBP (£) as currency
  * Dashboard is the landing page (no onboarding or guided tour)
  * Light/dark mode toggle
  * No integrations, reminders, or alerts in the first version
  * General accessibility best practices (labels, keyboard, screen reader friendly)

### Non-Functional Requirements

* Local, browser-based operation; no data is sent off-device
* Fast, responsive UI suitable for tabular and graphical data
* Modular codebase for future extensibility (e.g., multi-user, integrations)
* Secure: no cloud storage, no cookies unless for theme/local settings

---

## 3. Architecture Choices

### Technology Stack

* **React** for UI
* **shadcn/ui** or **Material UI** for accessible, responsive component library
* **Tailwind CSS** for styling and rapid theming (supports light/dark mode)
* **Recharts** (preferred) or **Chart.js** for data visualisation (line, bar, pie, stacked, etc.)
* **React-Table** for high-performance, flexible grid/table views
* **IndexedDB** (via `idb` or similar) for local structured storage, enabling versioning/history
* **Browser File APIs** for user-directed import/export (JSON/CSV)
* **TypeScript** for static typing, maintainability
* **Vite** or **Create React App** for build/dev tooling

### Data Model (Sketch)

```typescript
// Person
interface Person {
  id: string;
  name: string;
  dob: string; // YYYY-MM-DD
  sex: 'male' | 'female' | 'other';
}

// Asset/Investment
interface Asset {
  id: string;
  name: string;
  type: string; // e.g., ISA, Property, SIPP
  ownerId: string | string[]; // single or joint
  location?: string;
  startValue: number;
  growthRate: number;
  manualOverrides?: { [year: number]: number };
  linkedIncomeIds?: string[];
  // ...mortgage, rental, etc.
}

// Income/Commitment/Event
interface FinancialItem {
  id: string;
  label: string;
  category: 'income' | 'commitment' | 'event';
  ownerId: string;
  sourceAssetId?: string; // for drawdowns
  amount: number;
  frequency: 'monthly' | 'weekly' | 'quarterly' | 'annual' | 'one-off';
  startDate: string;
  endDate?: string;
  indexLinked: boolean;
  customGrowthRate?: number;
  notes?: string;
}

// Scenario
interface Scenario {
  id: string;
  name: string;
  basePlanId: string; // allows for cloning
  assumptions: Assumptions;
  people: Person[];
  assets: Asset[];
  items: FinancialItem[];
  events: FinancialItem[];
  history: ChangeLog[];
}

// ChangeLog (history)
interface ChangeLog {
  id: string;
  timestamp: string;
  user: string;
  changeSummary: string;
  changes: object;
}

// Assumptions
interface Assumptions {
  inflation: number;
  investmentReturn: number;
  discountRate: number;
  // ...can be overridden per asset/item
}
```

### Storage Approach

* All data stored in IndexedDB with robust schema, or fallback to localStorage for basic demo
* User-initiated import/export (JSON for complete plan, CSV for table snapshots)
* Version history in IndexedDB, support for rollback/viewing past versions
* Autosave (with manual save/export option)
* All data changes trigger save to local storage

### UI/UX Features

* Responsive, accessible dashboard
* Tabbed or side-panel navigation for: People, Assets, Incomes/Commitments, Events, Scenarios, Settings
* Modal/dialog or side-drawer forms for add/edit
* All tables filterable and sortable
* Graphs show net worth, cash flow, asset balances, breakdown by category/person
* Light/dark mode toggle
* Validation warnings on forms, error messages inline
* Timeline/history accessible from dashboard
* Data export/import controls prominent in UI

---

## 4. Data Handling and Error Handling

### Data Handling

* Use UUIDs for all object IDs
* On startup, load from IndexedDB (or prompt for import)
* Validate data on entry: prevent duplicates, logical date consistency, warn on negative balances
* Store all changes with timestamp and summary for git-like history
* Export (full plan/scenario) as JSON — includes all tables, assets, events, assumptions, history
* Export table snapshots as CSV (yearly breakdowns, actual/scenario)
* Import merges or replaces based on user choice
* User can select file location on export (browser File API)
* All local data is user-only, no sync/cloud

### Error Handling Strategies

* Form validation: inline, real-time; highlight errors or warnings
* Soft warnings for negative asset balances, allow override with reason/note
* Hard prevention for critical issues (e.g., duplicate names, invalid dates)
* Catch and display all file import/export errors, show readable message if file/format is invalid
* Backup/corruption fallback: allow user to export/backup/restore at any time
* Console logging for dev/debug, user-friendly error panels for prod
* Unexpected errors: show modal with error info and option to download current data for support

---

## 5. Testing Plan

### Unit Testing

* All core data models and calculation utilities tested with Jest (or Vitest)
* Validation and form logic tested for all edge cases
* Test all scenario cloning, export/import, and version history features

### Integration/UI Testing

* Cypress or Playwright for UI workflow coverage:

  * Add/edit/delete people/assets/events
  * Create/clone scenarios, switch between them
  * Test validation and warnings
  * Table/grid sorting/filtering
  * Chart/graph rendering (light/dark)
  * Export/import flows
  * Version history: change, rollback, view old
  * Accessibility checks: keyboard, screen reader

### Manual Testing

* Cross-browser (Chrome, Edge, Firefox, Safari)
* Export/import plans, actual vs scenario
* Check data privacy (network tab: no outbound data)
* Large dataset performance
* Dark/light mode, British English and £ currency

---

## 6. Deliverables

* Source code (TypeScript, React, preferred structure)
* README with setup, run, build, and test instructions
* Sample JSON plan for demo/import
* Documentation for all data models and export/import formats
* App bundled as static files (can be run locally)
* User documentation (Markdown): quick start, tips, data backup

---

## 7. Notes/Future Enhancements (out of scope for v1)

* Multi-user/collaboration support
* Integrations (bank feeds, Google Sheets, calendars)
* API for remote storage/backups
* Custom report/dashboard builder
* Role-based access, permissions
* Multi-currency
* Defined benefit pensions
* More granular event triggers/automation

