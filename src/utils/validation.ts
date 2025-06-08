import { Person, ValidationError, ValidationResult, Sex, Asset, Loan, Income, Commitment } from '../types'

function isValidName(name: string): boolean {
  return !!(name && name.trim().length > 0)
}

function isValidDate(date: string): boolean {
  const parsedDate = new Date(date)
  return !isNaN(parsedDate.getTime())
}

function isValidSex(sex: string): sex is Sex {
  return sex === Sex.M || sex === Sex.F
}

export function validatePerson(person: Partial<Person>): ValidationResult {
  const errors: ValidationError[] = []

  // Name validation (optional since we auto-generate)
  if (person.name && !isValidName(person.name)) {
    errors.push({ field: 'name', message: 'Name cannot be empty or just whitespace' })
  }

  // Date of birth validation (required)
  if (!person.dateOfBirth) {
    errors.push({ field: 'dateOfBirth', message: 'Date of birth is required' })
  } else if (!isValidDate(person.dateOfBirth)) {
    errors.push({ field: 'dateOfBirth', message: 'Valid date of birth is required' })
  } else {
    const birthDate = new Date(person.dateOfBirth)
    const today = new Date()
    if (birthDate > today) {
      errors.push({ field: 'dateOfBirth', message: 'Date of birth cannot be in the future' })
    }
    
    // Check for reasonable age limits
    const age = today.getFullYear() - birthDate.getFullYear()
    if (age > 150) {
      errors.push({ field: 'dateOfBirth', message: 'Please check the date of birth - age seems unrealistic' })
    }
  }

  // Sex validation (required)
  if (!person.sex) {
    errors.push({ field: 'sex', message: 'Sex is required' })
  } else if (!isValidSex(person.sex)) {
    errors.push({ field: 'sex', message: 'Valid sex (M or F) is required' })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Utility function to generate unique IDs with optional prefix
export function generateId(prefix?: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`
}

// Utility function to calculate age from date of birth
export function calculateAge(dateOfBirth: string): number {
  const birth = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

// Utility function for deep cloning objects
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as unknown as T
  }
  
  const cloned = {} as T
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key])
    }
  }
  
  return cloned
}

export function validateAsset(asset: Partial<Asset>, people: Person[]): ValidationResult {
  const errors: ValidationError[] = []

  // Name validation (optional since we auto-generate)
  if (asset.name && !isValidName(asset.name)) {
    errors.push({ field: 'name', message: 'Name cannot be empty or just whitespace' })
  }

  // Type validation (required)
  if (!asset.type) {
    errors.push({ field: 'type', message: 'Asset type is required' })
  }

  // Current value validation (required, non-negative)
  if (asset.currentValue === undefined || asset.currentValue === null) {
    errors.push({ field: 'currentValue', message: 'Current value is required' })
  } else if (asset.currentValue < 0) {
    errors.push({ field: 'currentValue', message: 'Asset value cannot be negative' })
  }

  // Owners validation (at least one required)
  if (!asset.ownerIds || asset.ownerIds.length === 0) {
    errors.push({ field: 'ownerIds', message: 'At least one owner is required' })
  } else {
    // Validate all owner IDs exist
    const invalidOwners = asset.ownerIds.filter(id => !people.find(p => p.id === id))
    if (invalidOwners.length > 0) {
      errors.push({ field: 'ownerIds', message: 'One or more selected owners do not exist' })
    }
  }

  // Growth rate validation (optional, but if provided should be reasonable)
  if (asset.growthRate !== undefined && (asset.growthRate < -100 || asset.growthRate > 100)) {
    errors.push({ field: 'growthRate', message: 'Growth rate should be between -100% and 100%' })
  }

  // Inflation rate validation (optional, but if provided should be reasonable)
  if (asset.inflationRate !== undefined && (asset.inflationRate < -50 || asset.inflationRate > 50)) {
    errors.push({ field: 'inflationRate', message: 'Inflation rate should be between -50% and 50%' })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateLoan(loan: Partial<Loan>): ValidationResult {
  const errors: ValidationError[] = []

  // Name validation (required)
  if (!loan.name || !loan.name.trim()) {
    errors.push({ field: 'name', message: 'Loan name is required' })
  }

  // Amount validation (required, positive)
  if (!loan.amount || loan.amount <= 0) {
    errors.push({ field: 'amount', message: 'Loan amount must be greater than 0' })
  }

  // Interest rate validation (required, non-negative)
  if (loan.interestRate === undefined || loan.interestRate === null || loan.interestRate < 0) {
    errors.push({ field: 'interestRate', message: 'Interest rate must be 0 or greater' })
  }

  // Term validation (required, positive integer)
  if (!loan.termYears || loan.termYears <= 0 || !Number.isInteger(loan.termYears)) {
    errors.push({ field: 'termYears', message: 'Term must be a positive number of years' })
  }

  // Start date validation (required)
  if (!loan.startDate) {
    errors.push({ field: 'startDate', message: 'Start date is required' })
  } else if (!isValidDate(loan.startDate)) {
    errors.push({ field: 'startDate', message: 'Valid start date is required' })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateIncome(income: Partial<Income>, people: Person[], assets: Asset[]): ValidationResult {
  const errors: ValidationError[] = []

  // Name validation (required)
  if (!income.name || !income.name.trim()) {
    errors.push({ field: 'name', message: 'Income name is required' })
  }

  // Amount validation (required, positive)
  if (!income.amount || income.amount <= 0) {
    errors.push({ field: 'amount', message: 'Income amount must be greater than 0' })
  }

  // Frequency validation (required)
  if (!income.frequency) {
    errors.push({ field: 'frequency', message: 'Frequency is required' })
  }

  // Start year validation (required, reasonable)
  if (!income.startYear) {
    errors.push({ field: 'startYear', message: 'Start year is required' })
  } else if (income.startYear < 1900 || income.startYear > 2100) {
    errors.push({ field: 'startYear', message: 'Start year should be between 1900 and 2100' })
  }

  // End year validation (optional, but if provided should be after start year)
  if (income.endYear && income.startYear && income.endYear <= income.startYear) {
    errors.push({ field: 'endYear', message: 'End year must be after start year' })
  }

  // Owners validation (at least one required)
  if (!income.ownerIds || income.ownerIds.length === 0) {
    errors.push({ field: 'ownerIds', message: 'At least one owner is required' })
  } else {
    const invalidOwners = income.ownerIds.filter(id => !people.find(p => p.id === id))
    if (invalidOwners.length > 0) {
      errors.push({ field: 'ownerIds', message: 'One or more selected owners do not exist' })
    }
  }

  // Destination asset validation
  if (income.destination === 'asset' && income.destinationAssetId) {
    if (!assets.find(a => a.id === income.destinationAssetId)) {
      errors.push({ field: 'destinationAssetId', message: 'Selected destination asset does not exist' })
    }
  }

  // Growth and inflation rate validation
  if (income.growthRate !== undefined && (income.growthRate < -100 || income.growthRate > 100)) {
    errors.push({ field: 'growthRate', message: 'Growth rate should be between -100% and 100%' })
  }

  if (income.inflationRate !== undefined && (income.inflationRate < -50 || income.inflationRate > 50)) {
    errors.push({ field: 'inflationRate', message: 'Inflation rate should be between -50% and 50%' })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateCommitment(commitment: Partial<Commitment>, people: Person[], assets: Asset[]): ValidationResult {
  const errors: ValidationError[] = []

  // Name validation (required)
  if (!commitment.name || !commitment.name.trim()) {
    errors.push({ field: 'name', message: 'Commitment name is required' })
  }

  // Amount validation (required, positive)
  if (!commitment.amount || commitment.amount <= 0) {
    errors.push({ field: 'amount', message: 'Commitment amount must be greater than 0' })
  }

  // Frequency validation (required)
  if (!commitment.frequency) {
    errors.push({ field: 'frequency', message: 'Frequency is required' })
  }

  // Start year validation (required, reasonable)
  if (!commitment.startYear) {
    errors.push({ field: 'startYear', message: 'Start year is required' })
  } else if (commitment.startYear < 1900 || commitment.startYear > 2100) {
    errors.push({ field: 'startYear', message: 'Start year should be between 1900 and 2100' })
  }

  // End year validation (optional, but if provided should be after start year)
  if (commitment.endYear && commitment.startYear && commitment.endYear <= commitment.startYear) {
    errors.push({ field: 'endYear', message: 'End year must be after start year' })
  }

  // Owners validation (at least one required)
  if (!commitment.ownerIds || commitment.ownerIds.length === 0) {
    errors.push({ field: 'ownerIds', message: 'At least one owner is required' })
  } else {
    const invalidOwners = commitment.ownerIds.filter(id => !people.find(p => p.id === id))
    if (invalidOwners.length > 0) {
      errors.push({ field: 'ownerIds', message: 'One or more selected owners do not exist' })
    }
  }

  // Source asset validation
  if (commitment.source === 'asset' && commitment.sourceAssetId) {
    if (!assets.find(a => a.id === commitment.sourceAssetId)) {
      errors.push({ field: 'sourceAssetId', message: 'Selected source asset does not exist' })
    }
  }

  // Growth and inflation rate validation
  if (commitment.growthRate !== undefined && (commitment.growthRate < -100 || commitment.growthRate > 100)) {
    errors.push({ field: 'growthRate', message: 'Growth rate should be between -100% and 100%' })
  }

  if (commitment.inflationRate !== undefined && (commitment.inflationRate < -50 || commitment.inflationRate > 50)) {
    errors.push({ field: 'inflationRate', message: 'Inflation rate should be between -50% and 50%' })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateEvent(event: Partial<Event>, people: Person[], assets: Asset[]): ValidationResult {
  const errors: ValidationError[] = []

  // Name validation (required)
  if (!event.name || !event.name.trim()) {
    errors.push({ field: 'name', message: 'Event name is required' })
  }

  // Year validation (required, reasonable)
  if (!event.year) {
    errors.push({ field: 'year', message: 'Event year is required' })
  } else if (event.year < 1900 || event.year > 2200) {
    errors.push({ field: 'year', message: 'Event year should be between 1900 and 2200' })
  }

  // Amount validation (required, can be negative for expenses)
  if (event.amount === undefined || event.amount === null) {
    errors.push({ field: 'amount', message: 'Event amount is required' })
  }

  // Type validation (required)
  if (!event.type) {
    errors.push({ field: 'type', message: 'Event type is required' })
  }

  // Recurring end year validation
  if (event.isRecurring && event.recurringEndYear) {
    if (event.recurringEndYear <= event.year!) {
      errors.push({ field: 'recurringEndYear', message: 'Recurring end year must be after event year' })
    }
  }

  // Affected persons validation (optional, but if provided should exist)
  if (event.affectedPersonIds && event.affectedPersonIds.length > 0) {
    const invalidPersons = event.affectedPersonIds.filter(id => !people.find(p => p.id === id))
    if (invalidPersons.length > 0) {
      errors.push({ field: 'affectedPersonIds', message: 'One or more selected people do not exist' })
    }
  }

  // Linked asset validation (optional, but if provided should exist)
  if (event.linkedAssetId) {
    if (!assets.find(a => a.id === event.linkedAssetId)) {
      errors.push({ field: 'linkedAssetId', message: 'Selected linked asset does not exist' })
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}