import { describe, it, expect } from 'vitest'
import { calculateProjections, calculateNetWorthProgression, calculateCashFlowProgression } from './calculations'
import { FinancialPlan, AssetType, Sex } from '../types'
import { getDefaultAssumptions } from './assumptions'

describe('Calculations Engine', () => {
  const mockPlan: FinancialPlan = {
    id: 'test-plan',
    name: 'Test Plan',
    people: [
      {
        id: 'person-1',
        name: 'Test Person',
        dateOfBirth: '1980-01-01',
        sex: Sex.M,
        createdAt: '2024-01-01T00:00:00.000Z'
      }
    ],
    assets: [
      {
        id: 'asset-1',
        name: 'ISA',
        type: AssetType.ISA,
        currentValue: 50000,
        ownerIds: ['person-1'],
        loans: [],
        valueOverrides: [],
        growthRate: 5.0,
        createdAt: '2024-01-01T00:00:00.000Z'
      }
    ],
    income: [
      {
        id: 'income-1',
        name: 'Salary',
        amount: 5000,
        frequency: 'monthly',
        startYear: 2024,
        ownerIds: ['person-1'],
        destination: 'cash',
        createdAt: '2024-01-01T00:00:00.000Z'
      }
    ],
    commitments: [
      {
        id: 'commitment-1',
        name: 'Rent',
        amount: 1500,
        frequency: 'monthly',
        startYear: 2024,
        ownerIds: ['person-1'],
        source: 'cash',
        createdAt: '2024-01-01T00:00:00.000Z'
      }
    ],
    events: [],
    assumptions: getDefaultAssumptions(),
    overrides: [],
    scenarios: [],
    createdAt: '2024-01-01T00:00:00.000Z'
  }

  it('calculates basic projection summary', () => {
    const result = calculateProjections(mockPlan, 2024, 2026)

    expect(result.snapshots).toHaveLength(3) // 2024, 2025, 2026
    expect(result.snapshots[0].year).toBe(2024)
    expect(result.snapshots[0].totalAssets).toBe(50000)
    expect(result.snapshots[0].totalIncome).toBe(60000) // 5000 * 12
    expect(result.snapshots[0].totalCommitments).toBe(-18000) // 1500 * 12
    expect(result.snapshots[0].cashFlow).toBe(42000) // 60000 - 18000
  })

  it('applies growth rates correctly', () => {
    const result = calculateProjections(mockPlan, 2024, 2025)

    // Asset should grow by 5%
    const year2025Assets = result.snapshots[1].totalAssets
    expect(year2025Assets).toBeCloseTo(52500, 0) // 50000 * 1.05
  })

  it('handles negative investment prevention', () => {
    const planWithNegativeAsset: FinancialPlan = {
      ...mockPlan,
      assets: [
        {
          ...mockPlan.assets[0],
          currentValue: 1000 // Small asset
        }
      ],
      commitments: [
        {
          ...mockPlan.commitments[0],
          amount: 10000, // Large commitment
          source: 'asset',
          sourceAssetId: 'asset-1'
        }
      ]
    }

    const result = calculateProjections(planWithNegativeAsset, 2024, 2025)

    // Asset should not go negative
    expect(result.snapshots[0].totalAssets).toBeGreaterThanOrEqual(0)
    expect(result.warnings).toContain('Investment balance prevented from going negative')
  })

  it('calculates net worth progression correctly', () => {
    const progression = calculateNetWorthProgression(mockPlan, 2024, 2026)

    expect(progression).toHaveLength(3)
    expect(progression[0].year).toBe(2024)
    expect(progression[0].netWorth).toBe(50000) // Starting assets
    
    // Net worth should increase due to positive cash flow
    expect(progression[1].netWorth).toBeGreaterThan(progression[0].netWorth)
  })

  it('calculates cash flow progression correctly', () => {
    const progression = calculateCashFlowProgression(mockPlan, 2024, 2026)

    expect(progression).toHaveLength(3)
    expect(progression[0].year).toBe(2024)
    expect(progression[0].cashFlow).toBe(42000) // 60000 income - 18000 commitments
  })

  it('handles manual value overrides', () => {
    const planWithOverrides: FinancialPlan = {
      ...mockPlan,
      assets: [
        {
          ...mockPlan.assets[0],
          valueOverrides: [
            {
              year: 2025,
              value: 75000,
              reason: 'Manual adjustment'
            }
          ]
        }
      ]
    }

    const result = calculateProjections(planWithOverrides, 2024, 2026)

    // 2025 should use override value
    expect(result.snapshots[1].totalAssets).toBe(75000)
    
    // 2026 should grow from override value
    expect(result.snapshots[2].totalAssets).toBeCloseTo(78750, 0) // 75000 * 1.05
  })

  it('handles different asset types in category breakdown', () => {
    const planWithMultipleAssets: FinancialPlan = {
      ...mockPlan,
      assets: [
        ...mockPlan.assets,
        {
          id: 'asset-2',
          name: 'SIPP',
          type: AssetType.SIPP,
          currentValue: 100000,
          ownerIds: ['person-1'],
          loans: [],
          valueOverrides: [],
          growthRate: 7.0,
          createdAt: '2024-01-01T00:00:00.000Z'
        }
      ]
    }

    const result = calculateProjections(planWithMultipleAssets, 2024, 2024)

    expect(result.categoryTotals['ISA'][2024]).toBe(50000)
    expect(result.categoryTotals['SIPP'][2024]).toBe(100000)
    expect(result.snapshots[0].assetsByCategory['ISA']).toBe(50000)
    expect(result.snapshots[0].assetsByCategory['SIPP']).toBe(100000)
  })

  it('handles end dates for income and commitments', () => {
    const planWithEndDates: FinancialPlan = {
      ...mockPlan,
      income: [
        {
          ...mockPlan.income[0],
          endYear: 2024 // Income stops after 2024
        }
      ]
    }

    const result = calculateProjections(planWithEndDates, 2024, 2025)

    expect(result.snapshots[0].totalIncome).toBe(60000) // 2024 has income
    expect(result.snapshots[1].totalIncome).toBe(0) // 2025 has no income
  })

  it('handles loans and interest calculations', () => {
    const planWithLoan: FinancialPlan = {
      ...mockPlan,
      assets: [
        {
          ...mockPlan.assets[0],
          currentValue: 200000,
          loans: [
            {
              id: 'loan-1',
              assetId: 'asset-1',
              name: 'Mortgage',
              amount: 150000,
              interestRate: 3.5,
              termYears: 25,
              startDate: '2024-01-01',
              createdAt: '2024-01-01T00:00:00.000Z'
            }
          ]
        }
      ]
    }

    const result = calculateProjections(planWithLoan, 2024, 2024)

    // Net asset value should be reduced by loan
    expect(result.snapshots[0].totalAssets).toBeLessThan(200000)
  })
})
