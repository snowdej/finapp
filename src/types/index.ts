// Core types for the financial planning application

export enum Sex {
  M = 'M',
  F = 'F'
}

export enum AssetType {
  ISA = 'ISA',
  SIPP = 'SIPP',
  Property = 'Property',
  Savings = 'Savings',
  Investment = 'Investment',
  Pension = 'Pension',
  Other = 'Other'
}

export enum Frequency {
  Weekly = 'weekly',
  Monthly = 'monthly',
  Quarterly = 'quarterly',
  Annually = 'annually'
}

export interface Person {
  id: string
  name: string
  dateOfBirth: string
  sex: Sex
  createdAt: string
  updatedAt?: string
}

export interface Loan {
  id: string
  name: string
  amount: number
  interestRate: number
  termYears: number
  startDate: string
  monthlyPayment?: number
  remainingBalance?: number
  createdAt: string
}

export interface AssetOverride {
  id: string
  assetId: string
  year: number
  value: number
  createdAt: string
}

export interface Asset {
  id: string
  name: string
  type: AssetType
  currentValue: number
  ownerIds: string[]
  loans: Loan[]
  overrides: AssetOverride[]
  growthRate?: number
  inflationRate?: number
  createdAt: string
  updatedAt?: string
}

export interface Income {
  id: string
  name: string
  amount: number
  frequency: Frequency
  startYear: number
  endYear?: number
  ownerIds: string[]
  destination: 'cash' | 'asset' | 'external'
  destinationAssetId?: string
  growthRate?: number
  inflationRate?: number
  createdAt: string
  updatedAt?: string
}

export interface Commitment {
  id: string
  name: string
  amount: number
  frequency: Frequency
  startYear: number
  endYear?: number
  ownerIds: string[]
  source: 'cash' | 'asset' | 'external'
  sourceAssetId?: string
  growthRate?: number
  inflationRate?: number
  createdAt: string
  updatedAt?: string
}

export interface Event {
  id: string
  name: string
  year: number
  amount: number
  type: 'income' | 'expense' | 'asset_change'
  description?: string
  affectedPersonIds?: string[]
  linkedAssetId?: string
  isRecurring?: boolean
  recurringEndYear?: number
  createdAt: string
  updatedAt?: string
}

export interface PlanAssumptions {
  inflationRate: number
  incomeGrowthRate: number
  commitmentGrowthRate: number
  retirementAge: number
  lifeExpectancy: number
  assetGrowthRates: Record<string, number>
  taxRates?: {
    income?: number
    capitalGains?: number
    inheritanceTax?: number
  }
}

export interface AssumptionOverride {
  id: string
  entityType: 'asset' | 'income' | 'commitment' | 'category'
  entityId?: string
  categoryType?: string
  overrideType: 'inflation' | 'growth' | 'interest' | 'tax'
  value: number
  startYear?: number
  endYear?: number
  createdAt: string
}

export interface Scenario {
  id: string
  planId: string
  name: string
  description?: string
  isBase: boolean
  assumptions: PlanAssumptions
  overrides: AssumptionOverride[]
  createdAt: string
  updatedAt?: string
}

export interface FinancialPlan {
  id: string
  name: string
  people: Person[]
  assets: Asset[]
  income: Income[]
  commitments: Commitment[]
  events: Event[]
  assumptions: PlanAssumptions
  overrides: AssumptionOverride[]
  scenarios: Scenario[]
  activeScenarioId: string
  createdAt: string
  updatedAt?: string
}

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

export interface ChangeLogEntry {
  id: string
  planId: string
  scenarioId?: string
  timestamp: string
  actionType: 'create' | 'update' | 'delete' | 'revert' | 'import'
  entityType: 'person' | 'asset' | 'income' | 'commitment' | 'event' | 'scenario' | 'plan'
  entityId?: string
  summary: string
  details: string
  beforeSnapshot?: any
  afterSnapshot?: any
  version: number
}

export interface ChangeTimelineState {
  currentVersion: number
  entries: ChangeLogEntry[]
}

export interface RevertOptions {
  createBackup?: boolean
  preserveScenarios?: boolean
}
  beforeSnapshot?: any
  afterSnapshot?: any
  version: number
}

export interface ChangeTimelineState {
  currentVersion: number
  entries: ChangeLogEntry[]
}

export interface RevertOptions {
  createBackup?: boolean
  preserveScenarios?: boolean
}

export interface ProjectionSnapshot {
  year: number
  netWorth: number
  totalAssets: number
  totalIncome: number
  totalCommitments: number
  cashFlow: number
  assetsByCategory: Record<string, number>
  warnings: string[]
}

export interface ProjectionSummary {
  snapshots: ProjectionSnapshot[]
  categoryTotals: Record<string, Record<number, number>>
  projectionYears: number[]
}

// Export metadata for import/export functionality
export interface ExportMetadata {
  version: string
  planId: string
  exportDate: string
  exportedBy?: string
  description?: string
}

export interface ExportData {
  metadata: ExportMetadata
  plan: FinancialPlan
  scenarios: Scenario[]
  timeline?: ChangeTimelineState
}

