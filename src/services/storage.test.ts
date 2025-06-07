import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach } from 'vitest'
import {
  initDB,
  savePlan,
  loadPlan,
  loadAllPlans,
  deletePlan,
  saveScenario,
  loadScenario,
  loadScenariosByPlan,
  deleteScenario,
  exportPlanAsJSON,
  importPlanFromJSON,
  clearAllData
} from './storage'

describe('Storage Service - Step 4 Complete', () => {
  beforeEach(async () => {
    await clearAllData()
  })

  describe('Database Initialization', () => {
    it('should initialize the database successfully', async () => {
      const db = await initDB()
      expect(db).toBeDefined()
      expect(db.name).toBe('FinancialPlannerDB')
    })
  })

  describe('Plan CRUD Operations', () => {
    it('should save and load a complete financial plan', async () => {
      const completePlan = {
        id: 'test-plan-1',
        name: 'Complete Financial Plan',
        people: [
          { id: 'person-1', name: 'John Doe', dateOfBirth: '1980-01-01', sex: 'M' }
        ],
        assets: [
          { id: 'asset-1', name: 'ISA', type: 'ISA', currentValue: 10000, ownerIds: ['person-1'] }
        ],
        income: [
          { id: 'income-1', name: 'Salary', amount: 50000, frequency: 'annual', startYear: 2024, ownerIds: ['person-1'] }
        ],
        commitments: [],
        events: [],
        createdAt: new Date().toISOString()
      }

      const savedId = await savePlan(completePlan)
      expect(savedId).toBe('test-plan-1')
      
      const loadedPlan = await loadPlan('test-plan-1')
      expect(loadedPlan).toEqual(completePlan)
      expect(loadedPlan.people).toHaveLength(1)
      expect(loadedPlan.assets).toHaveLength(1)
      expect(loadedPlan.income).toHaveLength(1)
    })

    it('should generate ID if not provided', async () => {
      const testPlan = {
        name: 'Plan Without ID',
        people: []
      }

      const savedId = await savePlan(testPlan)
      expect(savedId).toBeDefined()
      expect(typeof savedId).toBe('string')
      
      const allPlans = await loadAllPlans()
      expect(allPlans).toHaveLength(1)
      expect(allPlans[0].id).toBe(savedId)
      expect(allPlans[0].name).toBe('Plan Without ID')
    })

    it('should delete a plan and associated scenarios', async () => {
      const testPlan = { id: 'plan-to-delete', name: 'Delete Me' }
      const testScenario = { id: 'scenario-1', planId: 'plan-to-delete', name: 'Test Scenario' }
      
      await savePlan(testPlan)
      await saveScenario(testScenario)
      
      expect(await loadPlan('plan-to-delete')).toEqual(testPlan)
      expect(await loadScenario('scenario-1')).toEqual(testScenario)
      
      await deletePlan('plan-to-delete')
      
      expect(await loadPlan('plan-to-delete')).toBeNull()
      expect(await loadScenario('scenario-1')).toBeNull()
    })
  })

  describe('Export/Import with Metadata', () => {
    it('should export plan with complete metadata', async () => {
      const testPlan = {
        id: 'export-plan',
        name: 'Export Test Plan',
        people: [
          { id: 'person-1', name: 'Jane Doe', dateOfBirth: '1985-05-15', sex: 'F' }
        ],
        assets: [
          { id: 'asset-1', name: 'SIPP', type: 'SIPP', currentValue: 25000, ownerIds: ['person-1'] }
        ]
      }
      
      const testScenario = {
        id: 'scenario-1',
        planId: 'export-plan',
        name: 'Base Scenario',
        isBase: true,
        assumptions: {
          inflationRate: 2.5,
          incomeGrowthRate: 3.0,
          assetGrowthRates: { SIPP: 7.0 }
        }
      }
      
      await savePlan(testPlan)
      await saveScenario(testScenario)
      
      const exportedJSON = await exportPlanAsJSON('export-plan')
      const exportedData = JSON.parse(exportedJSON)
      
      // Verify metadata
      expect(exportedData.metadata).toBeDefined()
      expect(exportedData.metadata.version).toBe('1.0.0')
      expect(exportedData.metadata.planId).toBe('export-plan')
      expect(exportedData.metadata.exportDate).toBeDefined()
      
      // Verify plan data
      expect(exportedData.plan).toEqual(testPlan)
      expect(exportedData.scenarios).toHaveLength(1)
      expect(exportedData.scenarios[0]).toEqual(testScenario)
    })

    it('should import plan with unique GUID and rename conflicts', async () => {
      const originalPlan = {
        id: 'original-id',
        name: 'Original Plan Name',
        people: [
          { id: 'person-1', name: 'John Smith', dateOfBirth: '1990-01-01', sex: 'M' }
        ],
        assets: [],
        income: [],
        commitments: [],
        events: []
      }
      
      const importData = {
        metadata: { version: '1.0.0', exportDate: new Date().toISOString() },
        plan: originalPlan,
        scenarios: [
          {
            id: 'original-scenario',
            planId: 'original-id',
            name: 'Base Scenario',
            isBase: true,
            assumptions: { inflationRate: 2.0 }
          }
        ]
      }
      
      const jsonData = JSON.stringify(importData)
      const newPlanId = await importPlanFromJSON(jsonData)
      
      // Should have new GUID
      expect(newPlanId).toBeDefined()
      expect(newPlanId).not.toBe('original-id')
      
      // Should rename to avoid conflicts
      const importedPlan = await loadPlan(newPlanId)
      expect(importedPlan.name).toBe('Original Plan Name (Imported)')
      expect(importedPlan.people).toHaveLength(1)
      
      // Should import scenarios with new IDs
      const importedScenarios = await loadScenariosByPlan(newPlanId)
      expect(importedScenarios).toHaveLength(1)
      expect(importedScenarios[0].planId).toBe(newPlanId)
      expect(importedScenarios[0].name).toBe('Base Scenario')
    })
  })

  describe('Data Persistence and Recovery', () => {
    it('should handle database recovery after clear', async () => {
      const plan1 = { id: 'plan-1', name: 'Plan 1' }
      const plan2 = { id: 'plan-2', name: 'Plan 2' }
      
      await savePlan(plan1)
      await savePlan(plan2)
      
      let allPlans = await loadAllPlans()
      expect(allPlans).toHaveLength(2)
      
      await clearAllData()
      
      allPlans = await loadAllPlans()
      expect(allPlans).toHaveLength(0)
      
      // Should be able to save new data after clear
      await savePlan(plan1)
      allPlans = await loadAllPlans()
      expect(allPlans).toHaveLength(1)
    })

    it('should handle concurrent operations safely', async () => {
      const plans = Array.from({ length: 5 }, (_, i) => ({
        id: `concurrent-plan-${i}`,
        name: `Concurrent Plan ${i}`,
        people: [],
        assets: []
      }))
      
      // Save all plans concurrently
      await Promise.all(plans.map(plan => savePlan(plan)))
      
      const allPlans = await loadAllPlans()
      expect(allPlans).toHaveLength(5)
      
      // Load all plans concurrently
      const loadedPlans = await Promise.all(
        plans.map(plan => loadPlan(plan.id))
      )
      
      loadedPlans.forEach((plan, index) => {
        expect(plan).toEqual(plans[index])
      })
    })
  })

  describe('File operations', () => {
    it('should handle import from JSON string with validation', async () => {
      const validData = {
        metadata: { version: '1.0.0' },
        plan: { id: 'test', name: 'Test Plan', people: [] },
        scenarios: []
      }
      
      const newPlanId = await importPlanFromJSON(JSON.stringify(validData))
      expect(newPlanId).toBeDefined()
      
      const importedPlan = await loadPlan(newPlanId)
      expect(importedPlan.name).toBe('Test Plan (Imported)')
    })

    it('should handle malformed JSON gracefully', async () => {
      const invalidJson = '{ invalid json }'
      
      await expect(importPlanFromJSON(invalidJson)).rejects.toThrow()
    })
  })
})
