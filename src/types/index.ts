// Basic person types
export enum Sex {
  M = 'M',
  F = 'F'
}

export interface Person {
  id: string
  name: string
  dateOfBirth: string
  sex: Sex
  createdAt?: string
  updatedAt?: string
}

// Asset and loan types
export interface Asset {
  id: string
  name: string
  type: 'ISA' | 'SIPP' | 'Property' | 'Cash' | 'Premium Bonds' | 'Investment' | 'Crypto' | 'Other'
  currentValue: number
  ownerIds: string[]
  loans?: Loan[]
  growthRate?: number
  inflationRate?: number
  createdAt?: string
  updatedAt?: string
}

export interface Loan {
  id: string
  name: string
  amount: number
  interestRate: number
  termYears: number
  startDate: string
  assetId?: string
  monthlyPayment?: number
  remainingBalance?: number
  createdAt?: string
  updatedAt?: string
}

// Income and commitment types
export interface Income {
  id: string
  name: string
  amount: number
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'annually'
  startYear: number
  endYear?: number
  ownerIds: string[]
  destination: 'cash' | 'asset' | 'external'
  destinationAssetId?: string
  growthRate?: number
  inflationRate?: number
  createdAt?: string
  updatedAt?: string
}

export interface Commitment {
  id: string
  name: string
  amount: number
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'annually'
  startYear: number
  endYear?: number
  ownerIds: string[]
  source: 'cash' | 'asset' | 'external'
  sourceAssetId?: string
  growthRate?: number
  inflationRate?: number
  createdAt?: string
  updatedAt?: string
}

// Event types
export interface Event {
  id: string
  name: string
  year: number
  amount: number
  type: 'income' | 'expense' | 'asset_change' | 'withdrawal' | 'deposit' | 'inheritance' | 'other'
  description?: string
  affectedPersonIds?: string[]
  linkedAssetId?: string
  isRecurring?: boolean
  recurringEndYear?: number
  createdAt?: string
  updatedAt?: string
}

// Assumptions and overrides types
export interface PlanAssumptions {
  id?: string
  planId?: string
  inflationRate: number
  incomeGrowthRate: number
  assetGrowthRates: Record<string, number>
  commitmentGrowthRate: number
  interestRates: Record<string, number>
  retirementAge: number
  lifeExpectancy: number
  taxRates: {
    income: number
    capitalGains: number
    inheritanceTax: number
  }
  createdAt?: string
  updatedAt?: string
}

export interface AssumptionOverride {
  id: string
  entityType: 'asset' | 'income' | 'commitment' | 'category'
  entityId?: string
  category?: string
  overrideType: 'inflation' | 'growth' | 'interest' | 'tax'
  value: number
  startYear?: number
  endYear?: number
  description?: string
  createdAt?: string
  updatedAt?: string
}

// Change log types for git-like history
export interface ChangeLogEntry {
  id: string
  timestamp: string
  action: 'create' | 'update' | 'delete' | 'import' | 'scenario_switch'
  entityType: 'person' | 'asset' | 'income' | 'commitment' | 'event' | 'plan' | 'scenario'
  entityId: string
  entityName: string
  description: string
  scenarioId?: string
  previousState?: any
  newState?: any
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

// Enhanced types with scenario integration
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

// Change log types
export interface ChangeLog {
  id: string
  planId: string
  scenarioId?: string
  timestamp: string
  action: string
  description: string
  data: any
}

