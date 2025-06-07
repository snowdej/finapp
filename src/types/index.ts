export enum Sex {
  M = 'M',
  F = 'F'
}

export interface Person {
  id: string;
  name: string;
  dateOfBirth: string;
  sex: Sex;
  createdAt: Date;
  updatedAt: Date;
}

export interface Loan {
  id: string;
  name: string;
  principal: number;
  interestRate: number;
  termYears: number;
  startDate: string;
  monthlyPayment?: number;
}

export interface Asset {
  id: string;
  name: string;
  type: 'ISA' | 'SIPP' | 'Property' | 'Investment' | 'Cash' | 'Other';
  currentValue: number;
  ownerIds: string[];
  loans: Loan[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialItem {
  id: string;
  name: string;
  type: 'Income' | 'Commitment';
  amount: number;
  frequency: 'Weekly' | 'Monthly' | 'Quarterly' | 'Annually';
  startYear: number;
  endYear?: number;
  ownerIds: string[];
  inflationRate?: number;
  growthRate?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  name: string;
  year: number;
  amount: number;
  type: 'Income' | 'Expense' | 'AssetChange';
  assetId?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Assumptions {
  id: string;
  planId: string;
  defaultInflationRate: number;
  defaultGrowthRate: number;
  categoryOverrides: Record<string, { inflationRate?: number; growthRate?: number }>;
  itemOverrides: Record<string, { inflationRate?: number; growthRate?: number }>;
  updatedAt: Date;
}

export interface Scenario {
  id: string;
  planId: string;
  name: string;
  isBase: boolean;
  description?: string;
  people: Person[];
  assets: Asset[];
  financialItems: FinancialItem[];
  events: Event[];
  assumptions: Assumptions;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChangeLog {
  id: string;
  planId: string;
  scenarioId: string;
  action: string;
  entityType: 'Person' | 'Asset' | 'FinancialItem' | 'Event' | 'Assumptions';
  entityId: string;
  summary: string;
  timestamp: Date;
  previousState?: any;
  newState?: any;
}

export interface Plan {
  id: string;
  name: string;
  description?: string;
  currentScenarioId: string;
  scenarios: Scenario[];
  changeLogs: ChangeLog[];
  schemaVersion: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}
