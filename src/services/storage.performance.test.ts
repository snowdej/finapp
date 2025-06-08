import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach } from 'vitest'
import {
  savePlan,
  loadPlan,
  loadAllPlans,
  clearAllData
} from './storage'
import { generateId } from '../utils/validation'

describe('Storage Performance Tests', () => {
  beforeEach(async () => {
    await clearAllData()
  })

  it('handles large datasets efficiently', async () => {
    const startTime = performance.now()
    
    // Create a large plan with many items
    const largePlan = {
      id: 'large-plan',
      name: 'Large Test Plan',
      people: Array.from({ length: 50 }, (_, i) => ({
        id: generateId('person'),
        name: `Person ${i}`,
        dateOfBirth: '1980-01-01',
        sex: 'M' as const
      })),
      assets: Array.from({ length: 100 }, (_, i) => ({
        id: generateId('asset'),
        name: `Asset ${i}`,
        type: 'ISA',
        currentValue: 10000 + i * 1000,
        ownerIds: [`person-${i % 10}`]
      })),
      income: Array.from({ length: 200 }, (_, i) => ({
        id: generateId('income'),
        name: `Income ${i}`,
        amount: 5000 + i * 100,
        frequency: 'monthly' as const,
        startYear: 2024,
        ownerIds: [`person-${i % 10}`]
      })),
      commitments: Array.from({ length: 150 }, (_, i) => ({
        id: generateId('commitment'),
        name: `Commitment ${i}`,
        amount: 1000 + i * 50,
        frequency: 'monthly' as const,
        startYear: 2024,
        ownerIds: [`person-${i % 10}`]
      })),
      events: Array.from({ length: 75 }, (_, i) => ({
        id: generateId('event'),
        name: `Event ${i}`,
        year: 2024 + i,
        amount: 5000 + i * 1000,
        type: 'income' as const
      })),
      createdAt: new Date().toISOString()
    }
    
    // Save large plan
    await savePlan(largePlan)
    const saveTime = performance.now()
    console.log(`Save time for large plan: ${saveTime - startTime}ms`)
    
    // Should save within reasonable time (< 1 second)
    expect(saveTime - startTime).toBeLessThan(1000)
    
    // Load large plan
    const loadStartTime = performance.now()
    const loadedPlan = await loadPlan('large-plan')
    const loadTime = performance.now()
    console.log(`Load time for large plan: ${loadTime - loadStartTime}ms`)
    
    // Should load within reasonable time (< 500ms)
    expect(loadTime - loadStartTime).toBeLessThan(500)
    
    // Verify data integrity
    expect(loadedPlan).toBeDefined()
    expect(loadedPlan!.people).toHaveLength(50)
    expect(loadedPlan!.assets).toHaveLength(100)
    expect(loadedPlan!.income).toHaveLength(200)
    expect(loadedPlan!.commitments).toHaveLength(150)
    expect(loadedPlan!.events).toHaveLength(75)
  })

  it('handles multiple concurrent operations', async () => {
    const plans = Array.from({ length: 20 }, (_, i) => ({
      id: `concurrent-plan-${i}`,
      name: `Concurrent Plan ${i}`,
      people: [
        {
          id: generateId('person'),
          name: `Person ${i}`,
          dateOfBirth: '1980-01-01',
          sex: 'M' as const
        }
      ],
      assets: [],
      income: [],
      commitments: [],
      events: []
    }))
    
    const startTime = performance.now()
    
    // Save all plans concurrently
    await Promise.all(plans.map(plan => savePlan(plan)))
    
    const saveTime = performance.now()
    console.log(`Concurrent save time for 20 plans: ${saveTime - startTime}ms`)
    
    // Load all plans concurrently
    const loadStartTime = performance.now()
    const loadedPlans = await Promise.all(
      plans.map(plan => loadPlan(plan.id))
    )
    const loadTime = performance.now()
    console.log(`Concurrent load time for 20 plans: ${loadTime - loadStartTime}ms`)
    
    // Verify all plans loaded correctly
    expect(loadedPlans).toHaveLength(20)
    loadedPlans.forEach((plan, index) => {
      expect(plan).toBeDefined()
      expect(plan!.id).toBe(`concurrent-plan-${index}`)
    })
    
    // Total time should be reasonable
    expect(loadTime - startTime).toBeLessThan(2000)
  })

  it('handles memory efficiently with repeated operations', async () => {
    const testPlan = {
      id: 'memory-test-plan',
      name: 'Memory Test Plan',
      people: [
        {
          id: generateId('person'),
          name: 'Test Person',
          dateOfBirth: '1980-01-01',
          sex: 'M' as const
        }
      ],
      assets: [],
      income: [],
      commitments: [],
      events: []
    }
    
    // Perform many save/load cycles
    const iterations = 100
    const startTime = performance.now()
    
    for (let i = 0; i < iterations; i++) {
      const modifiedPlan = {
        ...testPlan,
        name: `Memory Test Plan ${i}`,
        updatedAt: new Date().toISOString()
      }
      
      await savePlan(modifiedPlan)
      const loaded = await loadPlan('memory-test-plan')
      expect(loaded).toBeDefined()
      expect(loaded!.name).toBe(`Memory Test Plan ${i}`)
    }
    
    const endTime = performance.now()
    const averageTime = (endTime - startTime) / iterations
    
    console.log(`Average time per save/load cycle: ${averageTime}ms`)
    
    // Should maintain consistent performance
    expect(averageTime).toBeLessThan(50)
  })

  it('handles stress testing with random operations', async () => {
    const operations = []
    const planIds = []
    
    // Generate random operations
    for (let i = 0; i < 50; i++) {
      const operation = Math.random()
      
      if (operation < 0.4 || planIds.length === 0) {
        // Create operation
        const planId = `stress-plan-${i}`
        planIds.push(planId)
        operations.push({
          type: 'save',
          planId,
          plan: {
            id: planId,
            name: `Stress Plan ${i}`,
            people: [],
            assets: [],
            income: [],
            commitments: [],
            events: []
          }
        })
      } else if (operation < 0.7) {
        // Load operation
        const planId = planIds[Math.floor(Math.random() * planIds.length)]
        operations.push({
          type: 'load',
          planId
        })
      } else if (operation < 0.9) {
        // Update operation
        const planId = planIds[Math.floor(Math.random() * planIds.length)]
        operations.push({
          type: 'save',
          planId,
          plan: {
            id: planId,
            name: `Updated Stress Plan ${i}`,
            people: [],
            assets: [],
            income: [],
            commitments: [],
            events: [],
            updatedAt: new Date().toISOString()
          }
        })
      } else {
        // Load all operation
        operations.push({
          type: 'loadAll'
        })
      }
    }
    
    const startTime = performance.now()
    
    // Execute all operations
    for (const operation of operations) {
      switch (operation.type) {
        case 'save':
          await savePlan(operation.plan!)
          break
        case 'load':
          await loadPlan(operation.planId!)
          break
        case 'loadAll':
          await loadAllPlans()
          break
      }
    }
    
    const endTime = performance.now()
    const totalTime = endTime - startTime
    
    console.log(`Stress test completed in ${totalTime}ms for ${operations.length} operations`)
    
    // Should complete within reasonable time
    expect(totalTime).toBeLessThan(5000)
    
    // Verify final state
    const allPlans = await loadAllPlans()
    expect(allPlans.length).toBeGreaterThan(0)
  })

  it('measures storage space usage', async () => {
    // Create plans of varying sizes
    const sizes = [1, 10, 50, 100]
    const results = []
    
    for (const size of sizes) {
      await clearAllData()
      
      const plan = {
        id: `size-test-${size}`,
        name: `Size Test Plan ${size}`,
        people: Array.from({ length: size }, (_, i) => ({
          id: generateId('person'),
          name: `Person ${i}`,
          dateOfBirth: '1980-01-01',
          sex: 'M' as const
        })),
        assets: Array.from({ length: size }, (_, i) => ({
          id: generateId('asset'),
          name: `Asset ${i}`,
          type: 'ISA',
          currentValue: 10000,
          ownerIds: [`person-${i % Math.max(1, size / 2)}`]
        })),
        income: [],
        commitments: [],
        events: []
      }
      
      const startTime = performance.now()
      await savePlan(plan)
      const saveTime = performance.now() - startTime
      
      const loadStartTime = performance.now()
      await loadPlan(plan.id)
      const loadTime = performance.now() - loadStartTime
      
      results.push({
        size,
        saveTime,
        loadTime,
        dataSize: JSON.stringify(plan).length
      })
    }
    
    console.log('Storage performance by size:', results)
    
    // Verify performance scales reasonably
    const lastResult = results[results.length - 1]
    expect(lastResult.saveTime).toBeLessThan(1000)
    expect(lastResult.loadTime).toBeLessThan(500)
  })
})
