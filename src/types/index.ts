export enum Sex {
  M = 'M',
  F = 'F'
}

export interface Person {
  id: string;
  name: string;
  dateOfBirth: string;
  sex: Sex;
  isChild?: boolean;
}

export interface Asset {
  id: string;
  name: string;
  type: 'ISA' | 'SIPP' | 'Property' | 'Investment' | 'Cash' | 'Other';
  currentValue: number;
  ownerIds: string[];
  loans?: Loan[];
  overrides?: AssetOverride[];
}

export interface Loan {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  monthlyPayment: number;
  startYear: number;
  endYear?: number;
}

export interface AssetOverride {
  year: number;
  value: number;
  reason?: string;
}

export interface FinancialItem {
  id: string;
  name: string;
  amount: number;
  frequency: 'annual' | 'monthly' | 'weekly';
  startYear: number;
  endYear?: number;
  ownerIds: string[];
  category?: string;
  destination?: 'cash' | 'asset' | 'external';
  destinationAssetId?: string;
  inflationRate?: number;
  growthRate?: number;
}

export interface Event {
  id: string;
  name: string;
  year: number;
  amount: number;
  type: 'income' | 'expense' | 'asset_sale' | 'inheritance' | 'other';
  assetId?: string;
  description?: string;
}

export interface Scenario {
  id: string;
  planId: string;
  name: string;
  isBase: boolean;
  description?: string;
  assumptions: Assumptions;
  createdAt: string;
  updatedAt?: string;
}

export interface Assumptions {
  inflationRate: number;
  incomeGrowthRate: number;
  assetGrowthRates: Record<string, number>; // Asset type -> growth rate
  retirementAge: number;
  lifeExpectancy: number;
}

export interface ChangeLogEntry {
  id: string;
  planId: string;
  scenarioId?: string;
  timestamp: string;
  action: 'create' | 'update' | 'delete';
  entityType: 'person' | 'asset' | 'income' | 'commitment' | 'event' | 'scenario' | 'assumptions';
  entityId: string;
  description: string;
  oldValue?: any;
  newValue?: any;
}

export interface FinancialPlan {
  id: string;
  name: string;
  people: Person[];
  assets: Asset[];
  income: FinancialItem[];
  commitments: FinancialItem[];
  events: Event[];
  scenarios: Scenario[];
  activeScenarioId: string;
  changeLog: ChangeLogEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Projection types
export interface YearlyProjection {
  year: number;
  assets: Record<string, number>;
  income: Record<string, number>;
  commitments: Record<string, number>;
  netWorth: number;
  cashFlow: number;
  warnings: string[];
}

export interface ProjectionSummary {
  years: YearlyProjection[];
  totalAssets: number;
  totalIncome: number;
  totalCommitments: number;
  projectedNetWorth: number;
}
