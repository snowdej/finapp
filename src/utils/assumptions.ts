import { PlanAssumptions, AssumptionOverride, Asset, Income, Commitment } from '../types'

// Default assumptions for new plans
export function getDefaultAssumptions(): PlanAssumptions {
  return {
    inflationRate: 2.5,
    incomeGrowthRate: 3.0,
    commitmentGrowthRate: 2.5,
    retirementAge: 67,
    lifeExpectancy: 85,
    assetGrowthRates: {
      'ISA': 7.0,
      'SIPP': 7.0,
      'Property': 4.0,
      'Cash': 1.0,
      'Premium Bonds': 1.0,
      'Investment': 6.0,
      'Crypto': 15.0,
      'Other': 3.0
    },
    taxRates: {
      income: 20.0,
      capitalGains: 20.0,
      inheritanceTax: 40.0
    }
  }
}

// Get effective rate for a specific item with override precedence
export function getEffectiveRate(
  item: Asset | Income | Commitment,
  rateType: 'inflation' | 'growth',
  year: number,
  assumptions: PlanAssumptions,
  overrides: AssumptionOverride[]
): number {
  // Precedence: item-specific override > category override > plan assumption
  
  // 1. Check for item-specific override
  const itemOverride = overrides.find(o => 
    o.entityType === getEntityType(item) &&
    o.entityId === item.id &&
    o.overrideType === rateType &&
    (!o.startYear || year >= o.startYear) &&
    (!o.endYear || year <= o.endYear)
  )
  
  if (itemOverride) {
    return itemOverride.value
  }
  
  // 2. Check for category override
  const category = getItemCategory(item)
  const categoryOverride = overrides.find(o => 
    o.entityType === 'category' &&
    o.category === category &&
    o.overrideType === rateType &&
    (!o.startYear || year >= o.startYear) &&
    (!o.endYear || year <= o.endYear)
  )
  
  if (categoryOverride) {
    return categoryOverride.value
  }
  
  // 3. Check item-specific rate (from item properties)
  if (rateType === 'growth' && 'growthRate' in item && item.growthRate !== undefined) {
    return item.growthRate
  }
  
  if (rateType === 'inflation' && 'inflationRate' in item && item.inflationRate !== undefined) {
    return item.inflationRate
  }
  
  // 4. Fall back to plan assumptions
  return getPlanAssumptionRate(assumptions, item, rateType)
}

// Get the entity type for precedence logic
function getEntityType(item: Asset | Income | Commitment): 'asset' | 'income' | 'commitment' {
  if ('currentValue' in item) return 'asset'
  if ('destination' in item) return 'income'
  return 'commitment'
}

// Get the category for an item
function getItemCategory(item: Asset | Income | Commitment): string {
  if ('type' in item) return item.type // Asset type
  if ('destination' in item) return 'income' // Income category
  return 'commitment' // Commitment category
}

// Get the appropriate plan assumption rate
function getPlanAssumptionRate(
  assumptions: PlanAssumptions, 
  item: Asset | Income | Commitment, 
  rateType: 'inflation' | 'growth'
): number {
  if (rateType === 'inflation') {
    return assumptions.inflationRate
  }
  
  // Growth rate logic
  if ('currentValue' in item) {
    // Asset - use asset-specific growth rate
    return assumptions.assetGrowthRates[item.type] || assumptions.assetGrowthRates['Other'] || 3.0
  }
  
  if ('destination' in item) {
    // Income - use income growth rate
    return assumptions.incomeGrowthRate
  }
  
  // Commitment - use commitment growth rate
  return assumptions.commitmentGrowthRate
}

// Get all applicable overrides for display
export function getApplicableOverrides(
  item: Asset | Income | Commitment,
  year: number,
  overrides: AssumptionOverride[]
): AssumptionOverride[] {
  const entityType = getEntityType(item)
  const category = getItemCategory(item)
  
  return overrides.filter(o => 
    (o.entityType === entityType && o.entityId === item.id) ||
    (o.entityType === 'category' && o.category === category)
  ).filter(o =>
    (!o.startYear || year >= o.startYear) &&
    (!o.endYear || year <= o.endYear)
  )
}

// Get current rates being used for an item
export function getCurrentRates(
  item: Asset | Income | Commitment,
  year: number,
  assumptions: PlanAssumptions,
  overrides: AssumptionOverride[]
): { inflation: number; growth: number; source: string } {
  const inflation = getEffectiveRate(item, 'inflation', year, assumptions, overrides)
  const growth = getEffectiveRate(item, 'growth', year, assumptions, overrides)
  
  // Determine source for display
  const hasItemOverride = overrides.some(o => 
    o.entityType === getEntityType(item) && o.entityId === item.id
  )
  const hasCategoryOverride = overrides.some(o => 
    o.entityType === 'category' && o.category === getItemCategory(item)
  )
  const hasItemRates = ('growthRate' in item && item.growthRate !== undefined) || 
                      ('inflationRate' in item && item.inflationRate !== undefined)
  
  let source = 'Plan Default'
  if (hasItemOverride) source = 'Item Override'
  else if (hasCategoryOverride) source = 'Category Override'
  else if (hasItemRates) source = 'Item Specific'
  
  return { inflation, growth, source }
}
