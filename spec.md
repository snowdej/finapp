# Pension & Property Financial Projection Tool — Developer Specification (Refined)

## 1. Overview

A browser-based, single-user application for comprehensive pension and property financial planning. The tool allows creation of a detailed household plan, flexible income and asset tracking, scenario modelling, and data visualisation. The application prioritises local data privacy (all data is stored locally), and uses British English and GBP (£) throughout.

---

## 2. Requirements

### Functional Requirements

* Users can create and manage a **“Household Plan”** containing:

  * Multiple named people (e.g., Jo, Fred), each with:

    * Age (tracked by date of birth)
    * Sex
    * Unique or auto-assigned names ("Person 1", etc. if blank)
  * All people tracked year-by-year for projections (age milestones supported)
  * Flexible, user-defined income, investment, asset, and commitment categories (templates for salary, rental, ISAs, etc.)
  * Assignment of items/assets to one, many, or all participants (joint ownership is always equal split)
  * Per-item attributes: name, owner(s), type/category, amount, frequency, start/end date, index-linking (inflation), growth rate, tax treatment (label only), notes
  * Allow manual override of a specific asset/item value for a single year ("known value"), with future projections using the override as the new base

    * List and manage all manual valuation points per item, with add/remove
    * Manual override events recorded in change timeline/history
    * Overrides highlighted in tables/graphs
  * Commitment/outgoing items support frequencies: one-off, monthly, weekly, quarterly, annual; have end dates and can index-link by inflation (category or item override)
  * For properties/assets:

    * Assign name/location
    * Assign one or more owners (equal split)
    * Track purchase price/date, current value (growth/inflation), and a timeline of multiple loans/mortgages
    * Each loan: amount, interest rate, start/end, repayment type, overpayment
    * Net asset value = asset value minus all outstanding asset-backed loans
  * Only DC (defined contribution) pensions, supporting:

    * Owner, fund/provider label, starting balance
    * Personal & employer contributions (frequency, amount, start/end)
    * Salary sacrifice (destination: tracked asset or cash)
    * Tax treatment label
    * Growth/charges
    * Lump sum withdrawal, drawdown schedule
  * Any income/commitment can be assigned to a person, or all adults (joint by default, children separately)

    * All income and expenditure is assumed joint for adults, unless assigned to a child
    * Destination for income: cash, asset, or other account as specified by user
  * Plan-wide default assumptions for inflation and growth rate, with category default and per-item override (precedence: plan-wide < category < item)
  * Custom future events (positive/negative, dated, optional asset linkage, label, assignable to household/person)
  * Timeline/list view for all future events
  * Yearly, tabular (Excel-like) snapshots for all figures, with option to group/merge/expand/collapse by broad categories (e.g., all ISAs, all income sources)
  * Full plan or scenario export/import as JSON, including all configuration, metadata (plan name, date, schema version, GUID)

    * On import, always create a new plan with a unique GUID; prompt to rename on conflict
  * Option to start from an empty plan or prepopulated sample (JSON template)
  * Validation:

    * Prevent negative balances only for investments (block save); allow negatives elsewhere with warning
    * Block on critical date errors (end before start, invalid dates)
    * Auto-label missing person names (e.g., Person 1)
    * Soft warnings (not blocking) for other fields/issues
  * Git-like in-app history timeline:

    * Track each significant interaction: add/remove/edit items, assumption/growth changes, manual overrides
    * Each event records: auto-generated summary, date/time, base/scenario, type
    * User can view history, revert to previous plan state (hard reset only)
    * Export of a base plan or scenario as JSON; import as new plan
  * Scenarios:

    * Scenarios listed; click to switch active scenario, updating main dashboard/tables/graphs
    * Only one scenario shown at a time
    * Base scenario clearly indicated
  * Dashboard is landing page; no onboarding/tour
  * Light/dark mode toggle
  * No integrations, reminders, or alerts in v1
  * General accessibility best practices
  * All UI in British English; GBP (£) only

### Non-Functional Requirements

* Local, browser-based operation; all data stored locally via IndexedDB (with localStorage fallback if needed)
* User chooses export location for JSON/CSV files (no cloud storage, no outbound network traffic)
* Modular codebase for future extensibility
* Fast/responsive UI; summary views/grouped tables for large datasets
* No authentication or multi-user support

---

## 3. Architecture Choices

### Technology Stack

* **React** (TypeScript) for UI
* **shadcn/ui** (preferred) or Material UI for accessible components
* **Tailwind CSS** for styling, light/dark support
* **Recharts** for graphs/visuals
* **React-Table** for tables, with category grouping/expand/collapse
* **IndexedDB** for local data (via idb or similar)
* **Browser File APIs** for export/import
* **Vite** or CRA for tooling

### Data Model (Sketch)

```typescript
interface Person {
  id: string;
  name: string; // "Person 1", etc. if blank
  dob: string; // YYYY-MM-DD
  sex: 'male' | 'female' | 'other';
}

interface Asset {
  id: string;
  name: string;
  type: string; // e.g., ISA, Property, SIPP
  owners: string[]; // list of person ids (equal split)
  location?: string;
  startValue: number;
  growthRate: number;
  inflationRate: number;
  manualOverrides?: { [year: number]: number };
  loans?: Loan[];
  // ...other fields
}

interface Loan {
  id: string;
  assetId: string;
  amount: number;
  interestRate: number;
  startDate: string;
  endDate: string;
  repaymentType: 'repayment' | 'interest-only';
  overpayments?: number[];
}

interface FinancialItem {
  id: string;
  label: string;
  category: 'income' | 'commitment' | 'event';
  owners: string[]; // adults (joint by default) or single child
  sourceAssetId?: string; // for drawdowns etc.
  destination: 'cash' | string; // asset/account id
  amount: number;
  frequency: 'monthly' | 'weekly' | 'quarterly' | 'annual' | 'one-off';
  startDate: string;
  endDate?: string;
  indexLinked: boolean;
  customGrowthRate?: number;
  customInflationRate?: number;
  taxTreatment: string; // label only
  notes?: string;
}

interface Scenario {
  id: string;
  name: string;
  basePlanId: string;
  assumptions: Assumptions;
  people: Person[];
  assets: Asset[];
  items: FinancialItem[];
  events: FinancialItem[];
  history: ChangeLog[];
}

interface ChangeLog {
  id: string;
  timestamp: string;
  planOrScenario: string;
  summary: string;
  changes: object;
}

interface Assumptions {
  inflation: number;
  growth: number;
  discount: number;
  // category/item overrides
}
```

---

## 4. Data Handling and Error Handling

### Data Handling

* All local, in IndexedDB (with localStorage fallback)
* Autosave after each significant interaction
* Export/import as JSON (includes GUID, plan name, schema version)
* On import, new plan always created with new GUID; prompt user to resolve any name clash
* List of all manual overrides per asset/item, with option to remove
* Autosave and manual save supported

### Error Handling Strategies

* Validation:

  * Block save for: negative investments, critical date errors, missing dates
  * Soft warnings for: negative balances elsewhere, most missing fields
  * Missing person name auto-filled (Person 1...)
* All file import/export errors handled gracefully; user shown preview before accepting
* On file import, never merge or overwrite existing plans
* History: each change is a form-level interaction (not every field edit); user can view and hard-revert to any point

---

## 5. UI/UX and Accessibility

* Dashboard as landing page (no onboarding)
* Navigation: sidebar/tabs for People, Assets, Income, Commitments, Events, Scenarios, Settings
* Tables: group/summarise by category, with expand/collapse for details

  * User can choose to view totals only, or expand to see individual items
* Graphs: support light/dark mode
* Large datasets: rely on summary/grouped views; export for deep-dive
* Manual overrides and warnings highlighted in UI
* Accessibility: best effort/good practices, no hard minimums

---

## 6. Testing Plan

### Unit Testing

* All data model/calculation utilities (Jest/Vitest)
* Form logic and validation, including override/critical error handling
* Scenario creation, export/import, timeline history

### Integration/UI Testing

* Cypress/Playwright for major workflows:

  * Add/edit/delete
  * Group/ungroup views
  * Scenario switching
  * Validation/override logic
  * Table/graph render (light/dark)
  * Export/import
  * Timeline/history
  * Accessibility checks

### Manual Testing

* Cross-browser (Chrome, Edge, Firefox, Safari)
* Large dataset performance
* All planned flows, export/import
* Dark/light mode, British English/£ currency

---

## 7. Deliverables

* Source code (React/TypeScript)
* README and sample JSON plan
* Documentation for data models/export/import
* Static build for local use
* User documentation (Markdown): quick start, backup, etc.

---

## 8. Notes/Future Enhancements (out of scope for v1)

* Multi-user/collaboration support
* Automated UK tax/NI calculations
* Integrations (banks, spreadsheets)
* Custom report builder
* Role-based access
* Multi-currency
* DB pensions
* Advanced event triggers

---

## Testing Strategy

### Unit Testing (Vitest + Testing Library)
* Data models and validation functions
* Utility functions (calculations, formatting, validation)  
* Individual React components in isolation
* Storage service operations
* Projection engine calculations

### Integration Testing (Vitest + Testing Library)
* Component interactions and data flow
* Storage persistence across app lifecycle
* Scenario switching and data integrity
* Import/export functionality
* Change tracking and timeline operations

### End-to-End Testing (Cypress)
* Complete user journeys from start to finish
* Cross-browser compatibility testing
* Data persistence across page reloads
* Error handling and recovery scenarios
* Performance testing with large datasets

### Accessibility Testing (Axe + Cypress)
* WCAG 2.1 AA compliance verification
* Keyboard navigation testing
* Screen reader compatibility
* Focus management and ARIA implementation
* Color contrast and visual accessibility

### Performance Testing
* Large dataset handling (1000+ items)
* Concurrent operation testing
* Memory usage optimization
* Load time benchmarking
* Storage efficiency measurement

### Browser Testing Matrix
* Chrome (latest 2 versions)
* Firefox (latest 2 versions)  
* Safari (latest 2 versions)
* Edge (latest version)
* Mobile browsers (iOS Safari, Chrome Mobile)

### Test Data Management
* Synthetic test data generation
* Edge case scenario testing
* Data migration testing
* Backup and recovery testing

### Continuous Integration
* Automated test execution on commits
* Coverage reporting and thresholds
* Performance regression detection
* Accessibility compliance monitoring

* Cypress/Playwright for major workflows:
  - Creating complete financial plans
  - Adding people, assets, income, commitments
  - Running projections and viewing reports
  - Scenario creation and switching
  - Data import/export workflows
  - Timeline reversion testing
  - Accessibility compliance verification
