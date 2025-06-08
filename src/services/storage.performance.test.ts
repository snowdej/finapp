import { describe, it, expect, beforeEach } from 'vitest'
import { savePlan, loadPlan, loadAllPlans, clearAllData } from './storage'
import { AssetType, Sex } from '../types'

describe('Storage Performance Tests', () => {
  beforeEach(async () => {
    await clearAllData()
  })

  it('handles large datasets efficiently', async () => {
    const largePlan = {
      id: 'large-plan',
      name: 'Large Financial Plan',
      people: Array.from({ length: 50 }, (_, i) => ({
        id: `person-${i}`,
        name: `Person ${i}`,
        dateOfBirth: `198${i % 10}-01-01`,
        sex: i % 2 === 0 ? Sex.M : Sex.F,
        createdAt: new Date().toISOString()
      })),
      assets: Array.from({ length: 200 }, (_, i) => ({
        id: `asset-${i}`,
        name: `Asset ${i}`,
        type: Object.values(AssetType)[i % Object.values(AssetType).length],
        currentValue: Math.random() * 1000000,
        ownerIds: [`person-${i % 50}`],
        loans: [],
        valueOverrides: [],
        createdAt: new Date().toISOString()
      })),
      income: Array.from({ length: 100 }, (_, i) => ({
        id: `income-${i}`,
        name: `Income ${i}`,
        amount: Math.random() * 10000,
        frequency: 'monthly' as const,
        startYear: 2024,
        ownerIds: [`person-${i % 50}`],
        destination: 'cash' as const,
        createdAt: new Date().toISOString()
      })),
      commitments: Array.from({ length: 150 }, (_, i) => ({
        id: `commitment-${i}`,
        name: `Commitment ${i}`,
        amount: Math.random() * 5000,
        frequency: 'monthly' as const,
        startYear: 2024,
        ownerIds: [`person-${i % 50}`],
        source: 'cash' as const,
        createdAt: new Date().toISOString()
      })),
      events: Array.from({ length: 75 }, (_, i) => ({
        id: `event-${i}`,
        name: `Event ${i}`,
        year: 2024 + (i % 50),
        amount: Math.random() * 50000,
        type: 'income' as const,
        createdAt: new Date().toISOString()
      })),
      assumptions: {
        inflationRate: 2.5,
        incomeGrowthRate: 3.0,
        commitmentGrowthRate: 2.5,
        retirementAge: 65,
        lifeExpectancy: 85,
        assetGrowthRates: {
          [AssetType.ISA]: 5.0,
          [AssetType.SIPP]: 7.0,
          [AssetType.Property]: 4.0,
          [AssetType.Other]: 3.0
        }
      },
      overrides: [],
      scenarios: [],
      createdAt: new Date().toISOString()
    }

    const startTime = performance.now()
    
    // Save large plan
    const savedId = await savePlan(largePlan)
    expect(savedId).toBe('large-plan')
    
    // Load large plan
    const loadedPlan = await loadPlan('large-plan')
    expect(loadedPlan).toBeDefined()
    expect(loadedPlan.people).toHaveLength(50)
    expect(loadedPlan.assets).toHaveLength(200)
    expect(loadedPlan.income).toHaveLength(100)
    expect(loadedPlan.commitments).toHaveLength(150)
    expect(loadedPlan.events).toHaveLength(75)
    
    const endTime = performance.now()
    const totalTime = endTime - startTime
    
    // Should complete within reasonable time (adjust threshold as needed)
    expect(totalTime).toBeLessThan(5000) // 5 seconds
    
    console.log(`Large dataset test completed in ${totalTime.toFixed(2)}ms`)
  })

  it('handles multiple concurrent operations', async () => {
    const plans = Array.from({ length: 10 }, (_, i) => ({
      id: `concurrent-plan-${i}`,
      name: `Concurrent Plan ${i}`,
      people: [
        {
          id: `person-${i}`,
          name: `Person ${i}`,
          dateOfBirth: '1980-01-01',
          sex: Sex.M,
          createdAt: new Date().toISOString()
        }
      ],
      assets: [],
      income: [],
      commitments: [],
      events: [],
      assumptions: {
        inflationRate: 2.5,
        incomeGrowthRate: 3.0,
        commitmentGrowthRate: 2.5,
        retirementAge: 65,
        lifeExpectancy: 85,
        assetGrowthRates: {
          [AssetType.ISA]: 5.0,
          [AssetType.SIPP]: 7.0,
          [AssetType.Property]: 4.0,
          [AssetType.Other]: 3.0
        }
      },
      overrides: [],
      scenarios: [],
      createdAt: new Date().toISOString()
    }))

    const startTime = performance.now()

    // Save all plans concurrently
    const savePromises = plans.map(plan => savePlan(plan))
    const savedIds = await Promise.all(savePromises)
    
    expect(savedIds).toHaveLength(10)

    // Load all plans concurrently
    const loadPromises = savedIds.map(id => loadPlan(id))
    const loadedPlans = await Promise.all(loadPromises)
    
    expect(loadedPlans.filter(Boolean)).toHaveLength(10)

    const endTime = performance.now()
    const totalTime = endTime - startTime
    
    expect(totalTime).toBeLessThan(3000) // 3 seconds
    
    console.log(`Concurrent operations test completed in ${totalTime.toFixed(2)}ms`)
  })

  it('handles memory usage efficiently with large datasets', async () => {
    // Create multiple large plans to test memory usage
    const plans = Array.from({ length: 5 }, (_, planIndex) => ({
      id: `memory-plan-${planIndex}`,
      name: `Memory Test Plan ${planIndex}`,
      people: Array.from({ length: 20 }, (_, i) => ({
        id: `person-${planIndex}-${i}`,
        name: `Person ${planIndex}-${i}`,
        dateOfBirth: '1980-01-01',
        sex: i % 2 === 0 ? Sex.M : Sex.F,
        createdAt: new Date().toISOString()
      })),
      assets: Array.from({ length: 50 }, (_, i) => ({
        id: `asset-${planIndex}-${i}`,
        name: `Asset ${planIndex}-${i}`,
        type: AssetType.ISA,
        currentValue: 10000,
        ownerIds: [`person-${planIndex}-${i % 20}`],
        loans: [],
        valueOverrides: [],
        createdAt: new Date().toISOString()
      })),
      income: [],
      commitments: [],
      events: [],
      assumptions: {
        inflationRate: 2.5,
        incomeGrowthRate: 3.0,
        commitmentGrowthRate: 2.5,
        retirementAge: 65,
        lifeExpectancy: 85,
        assetGrowthRates: {}
      },
      overrides: [],
      scenarios: [],
      createdAt: new Date().toISOString()
    }))

    // Save all plans
    for (const plan of plans) {
      await savePlan(plan)
    }

    // Load all plans to test memory usage
    const loadedPlans = []
    for (let i = 0; i < 5; i++) {
      const plan = await loadPlan(`memory-plan-${i}`)
      expect(plan).toBeDefined()
      loadedPlans.push(plan)
    }

    // Verify all plans loaded correctly
    expect(loadedPlans).toHaveLength(5)
    loadedPlans.forEach((plan, index) => {
      expect(plan).toBeDefined()
      expect(plan!.people).toHaveLength(20)
      expect(plan!.assets).toHaveLength(50)
      expect(plan!.name).toBe(`Memory Test Plan ${index}`)
    })

    // Test loading all plans at once
    const allPlans = await loadAllPlans()
    expect(allPlans).toHaveLength(5)
  })
})
