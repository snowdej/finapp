import { Person, ValidationError, ValidationResult, Sex, Asset } from '../types'

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

  // Name validation (required)
  if (!asset.name || !asset.name.trim()) {
    errors.push({ field: 'name', message: 'Asset name is required' })
  }

  // Type validation (required)
  if (!asset.type || !asset.type.trim()) {
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
  if ('growthRate' in asset && asset.growthRate !== undefined && asset.growthRate !== null && (typeof asset.growthRate === 'number') && (asset.growthRate < -100 || asset.growthRate > 100)) {
    errors.push({ field: 'growthRate', message: 'Growth rate should be between -100% and 100%' })
  }

  // Inflation rate validation (optional, but if provided should be reasonable)
  if ('inflationRate' in asset && asset.inflationRate !== undefined && asset.inflationRate !== null && (typeof asset.inflationRate === 'number') && (asset.inflationRate < -50 || asset.inflationRate > 50)) {
    errors.push({ field: 'inflationRate', message: 'Inflation rate should be between -50% and 50%' })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}