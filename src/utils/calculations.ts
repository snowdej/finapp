import { 
  Person, Asset, Income, Commitment, Event, PlanAssumptions, AssumptionOverride,
  Scenario, FinancialPlan 
} from '../types'
import { getEffectiveRate, getCurrentRates } from './assumptions'
import { calculateAge } from './validation'

export interface ProjectionItem {
  id: string
  name: string
  type: 'asset' | 'income' | 'commitment' | 'event'
  category: string
  ownerIds: string[]
  yearlyValues: Record<number, number>
  warnings: ProjectionWarning[]
  hasOverrides: boolean
}

export interface ProjectionWarning {
  year: number
  type: 'negative_balance' | 'negative_income' | 'negative_commitment' | 'unrealistic_growth'
  message: string
  severity: 'low' | 'medium' | 'high'
}

export interface YearlySnapshot {
  year: number
  totalAssets: number
  totalIncome: number
  totalCommitments: number
  netWorth: number
  cashFlow: number
  assetsByCategory: Record<string, number>
  items: ProjectionItem[]
  warnings: ProjectionWarning[]
}

export interface ProjectionSummary {
  startYear: number
  endYear: number
  snapshots: YearlySnapshot[]
  totalWarnings: number
  categoryTotals: Record<string, Record<number, number>>
}

// Main projection calculation function
export function calculateProjections(
  plan: FinancialPlan,
  scenario?: Scenario,
  startYear?: number,
  endYear?: number
): ProjectionSummary {
  const effectiveAssumptions = scenario?.assumptions || plan.assumptions
  const effectiveOverrides = scenario?.overrides || plan.overrides
  
  const projectionStartYear = startYear || new Date().getFullYear()
  const projectionEndYear = endYear || projectionStartYear + 50
  
  const snapshots: YearlySnapshot[] = []
  const categoryTotals: Record<string, Record<number, number>> = {}
  
  // Initialize category totals
  const categories = ['ISA', 'SIPP', 'Property', 'Cash', 'Premium Bonds', 'Investment', 'Crypto', 'Other', 'Income', 'Commitments']
  categories.forEach(cat => {
    categoryTotals[cat] = {}
  })
  
  for (let year = projectionStartYear; year <= projectionEndYear; year++) {
    const snapshot = calculateYearlySnapshot(
      year,
      plan,
      effectiveAssumptions,
      effectiveOverrides,
      projectionStartYear
    )
    snapshots.push(snapshot)
    
    // Update category totals
    snapshot.items.forEach(item => {
      const value = item.yearlyValues[year] || 0
      if (!categoryTotals[item.category]) {
        categoryTotals[item.category] = {}
      }
      categoryTotals[item.category][year] = (categoryTotals[item.category][year] || 0) + value
    })
  }
  
  const totalWarnings = snapshots.reduce((sum, snapshot) => sum + snapshot.warnings.length, 0)
  
  return {
    startYear: projectionStartYear,
    endYear: projectionEndYear,
    snapshots,
    totalWarnings,
    categoryTotals
  }
}

// Calculate a single year's financial snapshot
function calculateYearlySnapshot(
  year: number,
  plan: FinancialPlan,
  assumptions: PlanAssumptions,
  overrides: AssumptionOverride[],
  startYear: number
): YearlySnapshot {
  const items: ProjectionItem[] = []
  const warnings: ProjectionWarning[] = []
  
  // Project assets
  plan.assets.forEach(asset => {
    const projectedItem = projectAsset(asset, year, startYear, assumptions, overrides, plan.people)
    items.push(projectedItem)
    warnings.push(...projectedItem.warnings)
  })
  
  // Project income
  plan.income.forEach(income => {
    const projectedItem = projectIncome(income, year, assumptions, overrides, plan.people)
    items.push(projectedItem)
    warnings.push(...projectedItem.warnings)
  })
  
  // Project commitments
  plan.commitments.forEach(commitment => {
    const projectedItem = projectCommitment(commitment, year, assumptions, overrides, plan.people)
    items.push(projectedItem)
    warnings.push(...projectedItem.warnings)
  })
  
  // Project events
  plan.events.forEach(event => {
    const projectedItem = projectEvent(event, year, plan.people)
    if (projectedItem) {
      items.push(projectedItem)
      warnings.push(...projectedItem.warnings)
    }
  })
  
  // Calculate totals
  const totalAssets = items
    .filter(item => item.type === 'asset')
    .reduce((sum, item) => sum + (item.yearlyValues[year] || 0), 0)
  
  const totalIncome = items
    .filter(item => item.type === 'income')
    .reduce((sum, item) => sum + (item.yearlyValues[year] || 0), 0)
  
  const totalCommitments = items
    .filter(item => item.type === 'commitment')
    .reduce((sum, item) => sum + Math.abs(item.yearlyValues[year] || 0), 0)
  
  const eventImpact = items
    .filter(item => item.type === 'event')
    .reduce((sum, item) => sum + (item.yearlyValues[year] || 0), 0)
  
  const assetsByCategory: Record<string, number> = {}
  items.filter(item => item.type === 'asset').forEach(item => {
    assetsByCategory[item.category] = (assetsByCategory[item.category] || 0) + (item.yearlyValues[year] || 0)
  })
  
  return {
    year,
    totalAssets,
    totalIncome,
    totalCommitments,
    netWorth: totalAssets,
    cashFlow: totalIncome - totalCommitments + eventImpact,
    assetsByCategory,
    items,
    warnings: warnings.filter(w => w.year === year)
  }
}

// Project individual asset over time
function projectAsset(
  asset: Asset,
  targetYear: number,
  startYear: number,
  assumptions: PlanAssumptions,
  overrides: AssumptionOverride[],
  people: Person[]
): ProjectionItem {
  const yearlyValues: Record<number, number> = {}
  const warnings: ProjectionWarning[] = []
  let currentValue = asset.currentValue
  
  // Check if there are any overrides for this asset
  const hasOverrides = overrides.some(o => 
    (o.entityType === 'asset' && o.entityId === asset.id) ||
    (o.entityType === 'category' && o.category === asset.type)
  )
  
  for (let year = startYear; year <= targetYear; year++) {
    if (year === startYear) {
      yearlyValues[year] = currentValue
    } else {
      const growthRate = getEffectiveRate(asset, 'growth', year, assumptions, overrides)
      const inflationRate = getEffectiveRate(asset, 'inflation', year, assumptions, overrides)
      
      // Apply growth and inflation
      const effectiveGrowthRate = growthRate - inflationRate
      currentValue *= (1 + effectiveGrowthRate / 100)
      
      // Prevent negative investment balances (hard constraint)
      if (asset.type !== 'Cash' && currentValue < 0) {
        currentValue = 0
        warnings.push({
          year,
          type: 'negative_balance',
          message: `${asset.name} balance went negative and was reset to zero`,
          severity: 'high'
        })
      }
      
      // Warn about unrealistic growth
      if (Math.abs(effectiveGrowthRate) > 50) {
        warnings.push({
          year,
          type: 'unrealistic_growth',
          message: `${asset.name} has unrealistic growth rate: ${effectiveGrowthRate.toFixed(1)}%`,
          severity: 'medium'
        })
      }
      
      yearlyValues[year] = currentValue
    }
  }
  
  return {
    id: asset.id,
    name: asset.name,
    type: 'asset',
    category: asset.type,
    ownerIds: asset.ownerIds,
    yearlyValues,
    warnings,
    hasOverrides
  }
}

// Project individual income over time
function projectIncome(
  income: Income,
  targetYear: number,
  assumptions: PlanAssumptions,
  overrides: AssumptionOverride[],
  people: Person[]
): ProjectionItem {
  const yearlyValues: Record<number, number> = {}
  const warnings: ProjectionWarning[] = []
  
  const hasOverrides = overrides.some(o => 
    (o.entityType === 'income' && o.entityId === income.id) ||
    (o.entityType === 'category' && o.category === 'income')
  )
  
  // Check if income is active for target year
  if (targetYear < income.startYear || (income.endYear && targetYear > income.endYear)) {
    yearlyValues[targetYear] = 0
  } else {
    const yearsFromStart = targetYear - income.startYear
    let annualAmount = income.amount
    
    // Convert to annual amount
    switch (income.frequency) {
      case 'weekly':
        annualAmount *= 52
        break
      case 'monthly':
        annualAmount *= 12
        break
      case 'quarterly':
        annualAmount *= 4
        break
      // 'annually' stays the same
    }
    
    // Apply growth over years
    if (yearsFromStart > 0) {
      const growthRate = getEffectiveRate(income, 'growth', targetYear, assumptions, overrides)
      annualAmount *= Math.pow(1 + growthRate / 100, yearsFromStart)
    }
    
    // Check for negative income (warning)
    if (annualAmount < 0) {
      warnings.push({
        year: targetYear,
        type: 'negative_income',
        message: `${income.name} has negative value`,
        severity: 'medium'
      })
    }
    
    yearlyValues[targetYear] = annualAmount
  }
  
  return {
    id: income.id,
    name: income.name,
    type: 'income',
    category: 'Income',
    ownerIds: income.ownerIds,
    yearlyValues,
    warnings,
    hasOverrides
  }
}

// Project individual commitment over time
function projectCommitment(
  commitment: Commitment,
  targetYear: number,
  assumptions: PlanAssumptions,
  overrides: AssumptionOverride[],
  people: Person[]
): ProjectionItem {
  const yearlyValues: Record<number, number> = {}
  const warnings: ProjectionWarning[] = []
  
  const hasOverrides = overrides.some(o => 
    (o.entityType === 'commitment' && o.entityId === commitment.id) ||
    (o.entityType === 'category' && o.category === 'commitment')
  )
  
  // Check if commitment is active for target year
  if (targetYear < commitment.startYear || (commitment.endYear && targetYear > commitment.endYear)) {
    yearlyValues[targetYear] = 0
  } else {
    const yearsFromStart = targetYear - commitment.startYear
    let annualAmount = commitment.amount
    
    // Convert to annual amount
    switch (commitment.frequency) {
      case 'weekly':
        annualAmount *= 52
        break
      case 'monthly':
        annualAmount *= 12
        break
      case 'quarterly':
        annualAmount *= 4
        break
      // 'annually' stays the same
    }
    
    // Apply growth over years (commitments typically grow with inflation)
    if (yearsFromStart > 0) {
      const growthRate = getEffectiveRate(commitment, 'inflation', targetYear, assumptions, overrides)
      annualAmount *= Math.pow(1 + growthRate / 100, yearsFromStart)
    }
    
    // Check for negative commitment (warning)
    if (annualAmount < 0) {
      warnings.push({
        year: targetYear,
        type: 'negative_commitment',
        message: `${commitment.name} has negative value`,
        severity: 'medium'
      })
    }
    
    // Store as negative value to represent outgoing
    yearlyValues[targetYear] = -annualAmount
  }
  
  return {
    id: commitment.id,
    name: commitment.name,
    type: 'commitment',
    category: 'Commitments',
    ownerIds: commitment.ownerIds,
    yearlyValues,
    warnings,
    hasOverrides
  }
}

// Project individual event
function projectEvent(
  event: Event,
  targetYear: number,
  people: Person[]
): ProjectionItem | null {
  const yearlyValues: Record<number, number> = {}
  const warnings: ProjectionWarning[] = []
  
  // Check if event occurs in target year
  let eventOccurs = false
  
  if (event.isRecurring) {
    // Recurring event
    if (targetYear >= event.year && (!event.recurringEndYear || targetYear <= event.recurringEndYear)) {
      eventOccurs = true
    }
  } else {
    // One-time event
    if (targetYear === event.year) {
      eventOccurs = true
    }
  }
  
  if (eventOccurs) {
    yearlyValues[targetYear] = event.amount
  } else {
    yearlyValues[targetYear] = 0
  }
  
  // Only return projection item if event has any impact
  if (Object.values(yearlyValues).some(value => value !== 0)) {
    return {
      id: event.id,
      name: event.name,
      type: 'event',
      category: event.type,
      ownerIds: event.affectedPersonIds || [],
      yearlyValues,
      warnings,
      hasOverrides: false
    }
  }
  
  return null
}

// Helper function to get retirement status
export function getRetirementStatus(person: Person, year: number, retirementAge: number): 'working' | 'retired' | 'child' {
  const age = calculateAge(person.dateOfBirth) + (year - new Date().getFullYear())
  
  if (age < 18) return 'child'
  if (age >= retirementAge) return 'retired'
  return 'working'
}

// Helper function to group projections by category
export function groupProjectionsByCategory(
  projections: ProjectionItem[],
  year: number
): Record<string, { items: ProjectionItem[]; total: number }> {
  const grouped: Record<string, { items: ProjectionItem[]; total: number }> = {}
  
  projections.forEach(item => {
    if (!grouped[item.category]) {
      grouped[item.category] = { items: [], total: 0 }
    }
    
    grouped[item.category].items.push(item)
    grouped[item.category].total += item.yearlyValues[year] || 0
  })
  
  return grouped
}

// Calculate net worth progression
export function calculateNetWorthProgression(summary: ProjectionSummary): Record<number, number> {
  const netWorth: Record<number, number> = {}
  
  summary.snapshots.forEach(snapshot => {
    netWorth[snapshot.year] = snapshot.netWorth
  })
  
  return netWorth
}

// Calculate cash flow progression
export function calculateCashFlowProgression(summary: ProjectionSummary): Record<number, number> {
  const cashFlow: Record<number, number> = {}
  
  summary.snapshots.forEach(snapshot => {
    cashFlow[snapshot.year] = snapshot.cashFlow
  })
  
  return cashFlow
}

// Get projection warnings by severity
export function getWarningsBySeverity(summary: ProjectionSummary): Record<'low' | 'medium' | 'high', ProjectionWarning[]> {
  const warnings = { low: [], medium: [], high: [] } as Record<'low' | 'medium' | 'high', ProjectionWarning[]>
  
  summary.snapshots.forEach(snapshot => {
    snapshot.warnings.forEach(warning => {
      warnings[warning.severity].push(warning)
    })
  })
  
  return warnings
}
