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
  isChild?: boolean
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

export interface Asset {
  id: string
  name: string
  type: string
  currentValue: number
  ownerIds: string[]
  createdAt?: string
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
  createdAt: string
  updatedAt?: string
}

export interface Loan {
  id: string
  name: string
  amount: number
  interestRate: number
  termYears: number
  startYear: number
  monthlyPayment?: number
}

export interface Income {
  id: string
  name: string
  amount: number
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'annually'
  startYear: number
  endYear?: number
  ownerIds: string[]
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
  createdAt?: string
  updatedAt?: string
}

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

export interface ManualOverride {
  id: string
  year: number
  value: number
  description?: string
}

export interface Scenario {
  id: string
  planId: string
  name: string
  isBase: boolean
  assumptions: Assumptions
  createdAt: string
  updatedAt?: string
}

export interface Assumptions {
  inflationRate: number
  incomeGrowthRate: number
  assetGrowthRates: Record<string, number>
  taxRates?: Record<string, number>
}

export interface ChangeLog {
  id: string
  planId: string
  scenarioId?: string
  timestamp: string
  action: string
  description: string
  data: any
}
