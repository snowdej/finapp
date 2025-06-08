// Core person types
export enum Sex {
  M = 'M',
  F = 'F'
}

export interface Person {
  id: string
  name: string
  dateOfBirth: string
  sex: Sex
  createdAt: string
  updatedAt?: string
}

// Asset types
export enum AssetType {
  ISA = 'ISA',
  SIPP = 'SIPP',
  Property = 'Property',
  Savings = 'Savings',
  Stocks = 'Stocks',
  Bonds = 'Bonds',
  CorporatePension = 'Corporate Pension',
  StatePension = 'State Pension',
  Other = 'Other'
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
  updatedAt?: string
}

export interface Asset {
  id: string
  name: string
  type: AssetType
  currentValue: number
  ownerIds: string[]
  loans?: Loan[]
  growthRate?: number
  inflationRate?: number
  valueOverrides?: Record<number, number>
  createdAt: string
  updatedAt?: string
}

// Financial item types
export type Frequency = 'weekly' | 'monthly' | 'quarterly' | 'annually'
export type Destination = 'cash' | 'asset' | 'external'
export type Source = 'cash' | 'asset' | 'external'

export interface Income {
  id: string
  name: string
  amount: number
  frequency: Frequency
  startYear: number
  endYear?: number
  ownerIds: string[]
  destination: Destination
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
  source: Source
  sourceAssetId?: string
  growthRate?: number
  inflationRate?: number
  createdAt: string
  updatedAt?: string
}

// Event types
export type EventType = 'income' | 'expense' | 'asset_transfer' | 'inheritance' | 'gift' | 'other'

export interface Event {
  id: string
  name: string
  year: number
  amount: number
  type: EventType
  description?: string
  isRecurring?: boolean
  recurringEndYear?: number
  affectedPersonIds?: string[]
  linkedAssetId?: string
  createdAt: string
  updatedAt?: string
}

// Assumptions and overrides
export interface TaxRates {
  income: number
  capitalGains: number
  inheritanceTax: number
}

export interface PlanAssumptions {
  inflationRate: number
  incomeGrowthRate: number
  commitmentGrowthRate: number
  retirementAge: number
  lifeExpectancy: number
  assetGrowthRates: Record<string, number>
  taxRates: TaxRates
}

export type OverrideType = 'inflation' | 'growth' | 'interest' | 'tax'

export interface AssumptionOverride {
  id: string
  entityType: 'asset' | 'income' | 'commitment' | 'category'
  entityId?: string
  category?: string
  overrideType: OverrideType
  value: number
  startYear?: number
  endYear?: number
  description?: string
  createdAt: string
  updatedAt?: string
}

// Scenario types
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

// Change tracking types
export type ActionType = 'create' | 'update' | 'delete' | 'revert' | 'import'
export type EntityType = 'person' | 'asset' | 'income' | 'commitment' | 'event' | 'scenario' | 'plan'

export interface ChangeLogEntry {
  id: string
  planId: string
  scenarioId?: string
  timestamp: string
  actionType: ActionType
  entityType: EntityType
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
  targetScenario?: string
}

// Main plan interface
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
  activeScenarioId?: string
  createdAt: string
  updatedAt?: string
}

// Validation types
export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

// Projection and calculation types
export interface YearlySnapshot {
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
  snapshots: YearlySnapshot[]
  categoryTotals: Record<string, Record<number, number>>
  warnings: string[]
}

// Utility function exports
export { calculateAge } from '../utils/validation'
export { generateId } from '../utils/validation'
export { deepClone } from '../utils/validation'

