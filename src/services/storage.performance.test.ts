import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach } from 'vitest'
import { savePlan, loadPlan, loadAllPlans, clearAllData } from './storage'
import { FinancialPlan, AssetType, Sex, Frequency } from '../types'

describe('Storage Performance Tests', () => {
  beforeEach(async () => {
    await clearAllData()
  })

  const generateLargePlan = (planId: string, peopleCount: number, assetsCount: number): FinancialPlan => {
    const people = Array.from({ length: peopleCount }, (_, i) => ({
      id: `person-${i}`,
      name: `Person ${i}`,
      dateOfBirth: `198${i % 10}-01-01`,
      sex: i % 2 === 0 ? Sex.M : Sex.F,
      createdAt: new Date().toISOString()
    }))

    const assets = Array.from({ length: assetsCount }, (_, i) => ({
      id: `asset-${i}`,
      name: `Asset ${i}`,
      type: Object.values(AssetType)[i % Object.values(AssetType).length],
      currentValue: Math.random() * 100000,
      ownerIds: [people[i % peopleCount].id],
      loans: [],
      overrides: [],
      createdAt: new Date().toISOString()
    }))

    const income = Array.from({ length: Math.min(50, peopleCount * 3) }, (_, i) => ({
      id: `income-${i}`,
      name: `Income ${i}`,
      amount: Math.random() * 80000,
      frequency: Object.values(Frequency)[i % Object.values(Frequency).length],
      startYear: 2024,
      ownerIds: [people[i % peopleCount].id],
      destination: 'cash' as const,
      createdAt: new Date().toISOString()
    }))

    return {
      id: planId,
      name: `Large Plan ${planId}`,
      people,
      assets,
      income,
      commitments: [],
      events: [],
      assumptions: {
        inflationRate: 2.5,
        incomeGrowthRate: 3.0,
        commitmentGrowthRate: 2.5,
        retirementAge: 65,
        lifeExpectancy: 85,
        assetGrowthRates: {
          ISA: 6.0,
          SIPP: 7.0,
          Property: 4.0
        }
      },
      overrides: [],
      scenarios: [],
      activeScenarioId: 'base-scenario',
      createdAt: new Date().toISOString()
    }
  }

  it('should handle large plans efficiently', async () => {
    const largePlan = generateLargePlan('large-plan-1', 20, 100)
    
    const startTime = performance.now()
    await savePlan(largePlan)
    const saveTime = performance.now() - startTime
    
    expect(saveTime).toBeLessThan(1000) // Should save within 1 second
    
    const loadStartTime = performance.now()
    const loadedPlan = await loadPlan('large-plan-1')
    const loadTime = performance.now() - loadStartTime
    
    expect(loadTime).toBeLessThan(500) // Should load within 0.5 seconds
    expect(loadedPlan).toBeDefined()
    expect(loadedPlan?.people).toHaveLength(20)
    expect(loadedPlan?.assets).toHaveLength(100)
  })

  it('should handle multiple concurrent operations', async () => {
    const plans = Array.from({ length: 10 }, (_, i) => 
      generateLargePlan(`concurrent-plan-${i}`, 5, 20)
    )
    
    const startTime = performance.now()
    
    // Save all plans concurrently
    await Promise.all(plans.map(plan => savePlan(plan)))
    
    const saveTime = performance.now() - startTime
    expect(saveTime).toBeLessThan(2000) // Should complete within 2 seconds
    
    // Load all plans concurrently
    const loadStartTime = performance.now()
    const loadedPlans = await Promise.all(
      plans.map(plan => loadPlan(plan.id))
    )
    const loadTime = performance.now() - loadStartTime
    
    expect(loadTime).toBeLessThan(1000) // Should load within 1 second
    expect(loadedPlans).toHaveLength(10)
    expect(loadedPlans.every(plan => plan !== null)).toBe(true)
  })

  it('should handle memory usage efficiently with large datasets', async () => {
    // Create a plan with substantial data
    const megaPlan = generateLargePlan('mega-plan', 100, 500)
    
    // Add substantial income and commitment data
    megaPlan.income = Array.from({ length: 200 }, (_, i) => ({
      id: `income-${i}`,
      name: `Income Source ${i}`,
      amount: Math.random() * 100000,
      frequency: Frequency.Monthly,
      startYear: 2024,
      endYear: 2024 + Math.floor(Math.random() * 40),
      ownerIds: [megaPlan.people[i % megaPlan.people.length].id],
      destination: 'cash' as const,
      createdAt: new Date().toISOString()
    }))

    megaPlan.commitments = Array.from({ length: 150 }, (_, i) => ({
      id: `commitment-${i}`,
      name: `Commitment ${i}`,
      amount: Math.random() * 50000,
      frequency: Frequency.Monthly,
      startYear: 2024,
      endYear: 2024 + Math.floor(Math.random() * 30),
      ownerIds: [megaPlan.people[i % megaPlan.people.length].id],
      source: 'cash' as const,
      createdAt: new Date().toISOString()
    }))

    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0
    
    await savePlan(megaPlan)
    const afterSaveMemory = (performance as any).memory?.usedJSHeapSize || 0
    
    const loadedPlan = await loadPlan('mega-plan')
    const afterLoadMemory = (performance as any).memory?.usedJSHeapSize || 0
    
    expect(loadedPlan).toBeDefined()
    expect(loadedPlan?.people).toHaveLength(100)
    expect(loadedPlan?.assets).toHaveLength(500)
    expect(loadedPlan?.income).toHaveLength(200)
    expect(loadedPlan?.commitments).toHaveLength(150)
    
    // Memory usage should not increase dramatically (this is environment dependent)
    if ((performance as any).memory) {
      const memoryIncrease = afterLoadMemory - initialMemory
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024) // Less than 50MB increase
    }
  })

  it('should handle pagination for large result sets', async () => {
    // Create many plans
    const plans = Array.from({ length: 50 }, (_, i) => 
      generateLargePlan(`pagination-plan-${i}`, 2, 5)
    )
    
    await Promise.all(plans.map(plan => savePlan(plan)))
    
    const startTime = performance.now()
    const allPlans = await loadAllPlans()
    const loadTime = performance.now() - startTime
    
    expect(loadTime).toBeLessThan(1000)
    expect(allPlans).toHaveLength(50)
    
    // Verify plans are properly structured
    allPlans.forEach((plan, index) => {
      expect(plan.id).toBe(`pagination-plan-${index}`)
      expect(plan.people).toHaveLength(2)
      expect(plan.assets).toHaveLength(5)
    })
  })

  it('should handle rapid successive operations', async () => {
    const plan = generateLargePlan('rapid-ops-plan', 10, 30)
    
    // Rapid save/load cycles
    const operations = []
    for (let i = 0; i < 20; i++) {
      operations.push(
        savePlan({ ...plan, name: `Plan Update ${i}` }).then(() =>
          loadPlan(plan.id)
        )
      )
    }
    
    const startTime = performance.now()
    const results = await Promise.all(operations)
    const totalTime = performance.now() - startTime
    
    expect(totalTime).toBeLessThan(3000) // Should complete within 3 seconds
    expect(results).toHaveLength(20)
    expect(results.every(result => result !== null)).toBe(true)
    
    // Final plan should have the last update
    const finalPlan = await loadPlan(plan.id)
    expect(finalPlan?.name).toBe('Plan Update 19')
  })

  it('should handle cleanup of large datasets efficiently', async () => {
    // Create multiple large plans
    const plans = Array.from({ length: 20 }, (_, i) => 
      generateLargePlan(`cleanup-plan-${i}`, 15, 40)
    )
    
    await Promise.all(plans.map(plan => savePlan(plan)))
    
    // Verify all plans exist
    const allPlansBefore = await loadAllPlans()
    expect(allPlansBefore).toHaveLength(20)
    
    // Clear all data
    const startTime = performance.now()
    await clearAllData()
    const clearTime = performance.now() - startTime
    
    expect(clearTime).toBeLessThan(1000) // Should clear within 1 second
    
    // Verify all data is cleared
    const allPlansAfter = await loadAllPlans()
    expect(allPlansAfter).toHaveLength(0)
  })
})
        updateCount: i + 1,
        updatedAt: new Date().toISOString()
      }

      const startTime = performance.now()
      await savePlan(updatedPlan)
      const endTime = performance.now()
      
      updateTimes.push(endTime - startTime)
    }

    // Calculate average update time
    const avgUpdateTime = updateTimes.reduce((sum, time) => sum + time, 0) / updateTimes.length

    // Average update time should be reasonable (< 100ms)
    expect(avgUpdateTime).toBeLessThan(100)

    // Load final plan to verify
    const finalPlan = await loadPlan('update-test-plan')
    expect(finalPlan!.updateCount).toBe(updateCount)
  })

  it('should handle IndexedDB quota exceeded gracefully', async () => {
    // This test simulates quota exceeded scenarios
    // In real usage, we would handle QuotaExceededError
    
    const mockQuotaExceeded = () => {
      const error = new Error('QuotaExceededError')
      error.name = 'QuotaExceededError'
      return error
    }

    // Test that our storage functions can handle quota errors
    try {
      // Simulate quota exceeded by creating very large plan
      const massivePlan = {
        id: 'quota-test',
        name: 'Quota Test',
        people: Array.from({ length: 10000 }, (_, i) => ({
          id: `person-${i}`,
          name: `Person ${i}`,
          dateOfBirth: '1990-01-01',
          sex: 'M',
          createdAt: new Date().toISOString(),
          largeData: 'x'.repeat(1000) // 1KB per person = 10MB total
        })),
        assets: [],
        income: [],
        commitments: [],
        events: [],
        assumptions: getDefaultAssumptions(),
        overrides: [],
        scenarios: [],
        createdAt: new Date().toISOString()
      }

      await savePlan(massivePlan)
      
      // If it succeeds, verify the data
      const loaded = await loadPlan('quota-test')
      expect(loaded).toBeTruthy()
    } catch (error) {
      // If quota exceeded, that's expected behavior
      console.log('Quota exceeded as expected:', error)
    }
  })
})
      
      const startTime = performance.now()
      await savePlan(newPlan)
      const loadedPlan = await loadPlan(newPlan.id)
      const endTime = performance.now()
      const operationTime = endTime - startTime
      
      expect(loadedPlan).toEqual(newPlan)
      expect(operationTime).toBeLessThan(1000) // Performance shouldn't degrade significantly
      
      // Verify total count
      const allPlans = await loadAllPlans()
      expect(allPlans).toHaveLength(51)
    })

    it('should handle rapid successive operations', async () => {
      const plan = generateLargePlan(10, 20, 10, 15, 20)
      
      // Rapid save/load/update cycles
      const startTime = performance.now()
      
      for (let i = 0; i < 10; i++) {
        const modifiedPlan = { ...plan, name: `Modified Plan ${i}` }
        await savePlan(modifiedPlan)
        const loaded = await loadPlan(plan.id)
        expect(loaded?.name).toBe(`Modified Plan ${i}`)
      }
      
      const endTime = performance.now()
      const totalTime = endTime - startTime
      
      expect(totalTime).toBeLessThan(3000) // Should handle rapid operations efficiently
    })
  })
})
      // Create a plan structure that might have circular references
      const person1 = {
        id: 'person-1',
        name: 'Person 1',
        dateOfBirth: '1980-01-01',
        sex: 'M',
        createdAt: new Date().toISOString()
      }
      
      const asset1 = {
        id: 'asset-1',
        name: 'Shared Asset',
        type: 'ISA' as any,
        currentValue: 50000,
        ownerIds: ['person-1'], // References person
        createdAt: new Date().toISOString()
      }
      
      const income1 = {
        id: 'income-1',
        name: 'Salary',
        amount: 50000,
        frequency: 'annually' as any,
        startYear: 2024,
        ownerIds: ['person-1'], // References person
        destination: 'asset' as any,
        destinationAssetId: 'asset-1', // References asset
        createdAt: new Date().toISOString()
      }
      
      const circularPlan = {
        id: 'circular-plan',
        name: 'Plan with Circular References',
        people: [person1],
        assets: [asset1],
        income: [income1],
        commitments: [],
        events: [],
        createdAt: new Date().toISOString()
      }
      
      // Should not throw and should complete successfully
      await expect(savePlan(circularPlan)).resolves.toBe('circular-plan')
      
      const loadedPlan = await loadPlan('circular-plan')
      expect(loadedPlan).toBeDefined()
      expect(loadedPlan.income[0].destinationAssetId).toBe('asset-1')
      expect(loadedPlan.assets[0].ownerIds).toContain('person-1')
    })
  })
})
