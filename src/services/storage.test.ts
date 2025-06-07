import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, vi } from 'vitest';
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
  scheduleAutosave,
  cancelAutosave,
  clearAllData
} from './storage';

describe('Storage Service', () => {
  beforeEach(async () => {
    await clearAllData();
  });

  describe('Database Initialization', () => {
    it('should initialize the database successfully', async () => {
      const db = await initDB();
      expect(db).toBeDefined();
      expect(db.name).toBe('FinancialPlannerDB');
    });
  });

  describe('Plan Operations', () => {
    it('should save and load a plan', async () => {
      const testPlan = {
        id: 'test-plan-1',
        name: 'My Test Plan',
        people: [],
        assets: []
      };

      const savedId = await savePlan(testPlan);
      expect(savedId).toBe('test-plan-1');
      
      const loadedPlan = await loadPlan('test-plan-1');
      expect(loadedPlan).toEqual(testPlan);
    });

    it('should generate ID if not provided', async () => {
      const testPlan = {
        name: 'Plan Without ID',
        people: []
      };

      const savedId = await savePlan(testPlan);
      expect(savedId).toBeDefined();
      expect(typeof savedId).toBe('string');
      
      const allPlans = await loadAllPlans();
      expect(allPlans).toHaveLength(1);
      expect(allPlans[0].id).toBe(savedId);
      expect(allPlans[0].name).toBe('Plan Without ID');
    });

    it('should load all plans', async () => {
      const plan1 = { id: 'plan-1', name: 'Plan 1' };
      const plan2 = { id: 'plan-2', name: 'Plan 2' };

      await savePlan(plan1);
      await savePlan(plan2);

      const allPlans = await loadAllPlans();
      expect(allPlans).toHaveLength(2);
    });

    it('should delete a plan and associated scenarios', async () => {
      const testPlan = { id: 'plan-to-delete', name: 'Delete Me' };
      const testScenario = { id: 'scenario-1', planId: 'plan-to-delete', name: 'Test Scenario' };
      
      await savePlan(testPlan);
      await saveScenario(testScenario);
      
      expect(await loadPlan('plan-to-delete')).toEqual(testPlan);
      expect(await loadScenario('scenario-1')).toEqual(testScenario);
      
      await deletePlan('plan-to-delete');
      
      expect(await loadPlan('plan-to-delete')).toBeNull();
      expect(await loadScenario('scenario-1')).toBeNull();
    });

    it('should return null for non-existent plan', async () => {
      const result = await loadPlan('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('Scenario Operations', () => {
    it('should save and load a scenario', async () => {
      const testScenario = {
        id: 'scenario-1',
        planId: 'plan-1',
        name: 'Base Scenario',
        isBase: true,
        data: { assumptions: {} }
      };

      const savedId = await saveScenario(testScenario);
      expect(savedId).toBe('scenario-1');
      
      const loadedScenario = await loadScenario('scenario-1');
      expect(loadedScenario).toEqual(testScenario);
    });

    it('should load scenarios by plan ID', async () => {
      const scenario1 = { id: 'sc-1', planId: 'plan-1', name: 'Base' };
      const scenario2 = { id: 'sc-2', planId: 'plan-1', name: 'What-if' };
      const scenario3 = { id: 'sc-3', planId: 'plan-2', name: 'Other Plan' };

      await saveScenario(scenario1);
      await saveScenario(scenario2);
      await saveScenario(scenario3);

      const plan1Scenarios = await loadScenariosByPlan('plan-1');
      expect(plan1Scenarios).toHaveLength(2);
      
      const plan2Scenarios = await loadScenariosByPlan('plan-2');
      expect(plan2Scenarios).toHaveLength(1);
    });

    it('should delete a scenario', async () => {
      const testScenario = { id: 'scenario-to-delete', planId: 'plan-1' };
      
      await saveScenario(testScenario);
      expect(await loadScenario('scenario-to-delete')).toEqual(testScenario);
      
      await deleteScenario('scenario-to-delete');
      expect(await loadScenario('scenario-to-delete')).toBeNull();
    });
  });

  describe('Export/Import Operations', () => {
    it('should export plan as JSON', async () => {
      const testPlan = { id: 'export-plan', name: 'Export Test' };
      const testScenario = { id: 'export-scenario', planId: 'export-plan', name: 'Base' };
      
      await savePlan(testPlan);
      await saveScenario(testScenario);
      
      const exportedJSON = await exportPlanAsJSON('export-plan');
      const exportedData = JSON.parse(exportedJSON);
      
      expect(exportedData.metadata).toBeDefined();
      expect(exportedData.plan).toEqual(testPlan);
      expect(exportedData.scenarios).toHaveLength(1);
      expect(exportedData.scenarios[0]).toEqual(testScenario);
    });

    it('should import plan from JSON', async () => {
      const importData = {
        metadata: { version: '1.0.0' },
        plan: { id: 'original-id', name: 'Original Plan' },
        scenarios: [
          { id: 'original-scenario', planId: 'original-id', name: 'Base' }
        ]
      };
      
      const jsonData = JSON.stringify(importData);
      const newPlanId = await importPlanFromJSON(jsonData);
      
      expect(newPlanId).toBeDefined();
      expect(newPlanId).not.toBe('original-id');
      
      const importedPlan = await loadPlan(newPlanId);
      expect(importedPlan.name).toBe('Original Plan (Imported)');
      
      const importedScenarios = await loadScenariosByPlan(newPlanId);
      expect(importedScenarios).toHaveLength(1);
      expect(importedScenarios[0].name).toBe('Base');
    });
  });

  describe('Autosave functionality', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    });

    afterEach(() => {
      vi.useRealTimers()
      cancelAutosave()
    });

    it('should schedule autosave with delay', async () => {
      const testPlan = { id: 'autosave-test', name: 'Autosave Plan' };
      
      scheduleAutosave(testPlan, 1000);
      
      // Fast-forward time
      vi.advanceTimersByTime(1000);
      
      // Wait for async operations
      await vi.runAllTimersAsync();
      
      const savedPlan = await loadPlan('autosave-test');
      expect(savedPlan).toEqual(testPlan);
    });

    it('should cancel previous autosave when scheduling new one', async () => {
      const plan1 = { id: 'plan1', name: 'Plan 1' };
      const plan2 = { id: 'plan2', name: 'Plan 2' };
      
      scheduleAutosave(plan1, 1000);
      scheduleAutosave(plan2, 1000); // Should cancel previous
      
      vi.advanceTimersByTime(500);
      expect(await loadPlan('plan1')).toBeNull();
      
      vi.advanceTimersByTime(500);
      await vi.runAllTimersAsync();
      
      expect(await loadPlan('plan1')).toBeNull();
      expect(await loadPlan('plan2')).toEqual(plan2);
    });
  });

  describe('File operations', () => {
    it('should handle import from JSON string with validation', async () => {
      const validData = {
        metadata: { version: '1.0.0' },
        plan: { id: 'test', name: 'Test Plan', people: [] },
        scenarios: []
      };
      
      const newPlanId = await importPlanFromJSON(JSON.stringify(validData));
      expect(newPlanId).toBeDefined();
      
      const importedPlan = await loadPlan(newPlanId);
      expect(importedPlan.name).toBe('Test Plan (Imported)');
    });

    it('should handle malformed JSON gracefully', async () => {
      const invalidJson = '{ invalid json }';
      
      await expect(importPlanFromJSON(invalidJson)).rejects.toThrow();
    });
  });
});
