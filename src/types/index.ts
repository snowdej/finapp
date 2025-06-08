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

// Asset types
export interface Asset {
  id: string
  name: string
  type: 'ISA' | 'SIPP' | 'Property' | 'Stocks' | 'Bonds' | 'Cash' | 'Other'
  currentValue: number
  ownerIds: string[]
  growthRate?: number
  inflationRate?: number
  loans?: Loan[]
  manualOverrides?: AssetOverride[]
  createdAt?: string
  updatedAt?: string
}

// Loan types
export interface Loan {
  id: string
  name: string
  amount: number
  interestRate: number
  termYears: number
  startDate: string
  monthlyPayment?: number
  remainingBalance?: number
}

// Asset override types
export interface AssetOverride {
  id: string
  year: number
  value: number
  note?: string
}

// Income types
export interface Income {
  id: string
  name: string
  amount: number
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'annually'
  startYear: number
  endYear?: number
  ownerIds: string[]
  destination?: 'cash' | 'asset' | 'external'
  destinationAssetId?: string
  growthRate?: number
  inflationRate?: number
  createdAt?: string
  updatedAt?: string
}

// Commitment types
export interface Commitment {
  id: string
  name: string
  amount: number
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'annually'
  startYear: number
  endYear?: number
  ownerIds: string[]
  source?: 'cash' | 'asset' | 'external'
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
  type: 'income' | 'expense' | 'asset-change'
  assetId?: string
  createdAt?: string
  updatedAt?: string
}

// Plan types
export interface FinancialPlan {
  id: string
  name: string
  people: Person[]
  assets: Asset[]
  income: Income[]
  commitments: Commitment[]
  events: Event[]
  createdAt: string
  updatedAt?: string
}

// Scenario types
export interface Scenario {
  id: string
  planId: string
  name: string
  isBase: boolean
  assumptions: Assumptions
  createdAt: string
  updatedAt?: string
}

// Assumptions types
export interface Assumptions {
  inflationRate: number
  incomeGrowthRate: number
  assetGrowthRates: Record<string, number>
  taxRates?: Record<string, number>
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

