import { openDB, type DBSchema, type IDBPDatabase } from 'idb'

// Define the database schema
interface FinAppDB extends DBSchema {
  plans: {
    key: string
    value: {
      id: string
      name: string
      createdAt: string
      updatedAt: string
      data: any
    }
    indexes: {
      'by-name': string
      'by-updatedAt': string
    }
  }
  scenarios: {
    key: string
    value: {
      id: string
      planId: string
      name: string
      isBase: boolean
      createdAt: string
      data: any
    }
    indexes: {
      'by-planId': string
      'by-isBase': string
    }
  }
}

const DB_NAME = 'FinancialPlannerDB'
const DB_VERSION = 1

let dbInstance: IDBPDatabase<FinAppDB> | null = null

// Utility function to generate unique IDs
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Initialize the database
export async function initDB(): Promise<IDBPDatabase<FinAppDB>> {
  if (dbInstance) {
    return dbInstance
  }

  try {
    dbInstance = await openDB<FinAppDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create plans store
        if (!db.objectStoreNames.contains('plans')) {
          const planStore = db.createObjectStore('plans', { keyPath: 'id' })
          planStore.createIndex('by-name', 'name')
          planStore.createIndex('by-updatedAt', 'updatedAt')
        }

        // Create scenarios store
        if (!db.objectStoreNames.contains('scenarios')) {
          const scenarioStore = db.createObjectStore('scenarios', { keyPath: 'id' })
          scenarioStore.createIndex('by-planId', 'planId')
          scenarioStore.createIndex('by-isBase', 'isBase')
        }
      },
    })

    return dbInstance
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}

// Plan CRUD operations
export async function savePlan(plan: any): Promise<string> {
  try {
    const db = await initDB()
    const planId = plan.id || generateId()
    const planData = {
      id: planId,
      name: plan.name || 'Untitled Plan',
      createdAt: plan.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data: { ...plan, id: planId }
    }
    
    await db.put('plans', planData)
    return planId
  } catch (error) {
    console.error('Error saving plan:', error)
    throw error
  }
}

export async function loadPlan(id: string): Promise<any | null> {
  try {
    const db = await initDB()
    const plan = await db.get('plans', id)
    return plan?.data || null
  } catch (error) {
    console.error('Error loading plan:', error)
    return null
  }
}

export async function loadAllPlans(): Promise<any[]> {
  try {
    const db = await initDB()
    const plans = await db.getAll('plans')
    return plans.map(p => p.data)
  } catch (error) {
    console.error('Error loading all plans:', error)
    return []
  }
}

export async function deletePlan(id: string): Promise<void> {
  try {
    const db = await initDB()
    
    // Delete the plan
    await db.delete('plans', id)
    
    // Delete associated scenarios
    const scenarios = await db.getAllFromIndex('scenarios', 'by-planId', id)
    for (const scenario of scenarios) {
      await db.delete('scenarios', scenario.id)
    }
  } catch (error) {
    console.error('Error deleting plan:', error)
    throw error
  }
}

// Scenario CRUD operations
export async function saveScenario(scenario: any): Promise<string> {
  try {
    const db = await initDB()
    const scenarioId = scenario.id || generateId()
    const scenarioData = {
      id: scenarioId,
      planId: scenario.planId,
      name: scenario.name || 'Untitled Scenario',
      isBase: scenario.isBase || false,
      createdAt: scenario.createdAt || new Date().toISOString(),
      data: { ...scenario, id: scenarioId }
    }
    
    await db.put('scenarios', scenarioData)
    return scenarioId
  } catch (error) {
    console.error('Error saving scenario:', error)
    throw error
  }
}

export async function loadScenario(id: string): Promise<any | null> {
  try {
    const db = await initDB()
    const scenario = await db.get('scenarios', id)
    return scenario?.data || null
  } catch (error) {
    console.error('Error loading scenario:', error)
    return null
  }
}

export async function loadScenariosByPlan(planId: string): Promise<any[]> {
  try {
    const db = await initDB()
    const scenarios = await db.getAllFromIndex('scenarios', 'by-planId', planId)
    return scenarios.map(s => s.data)
  } catch (error) {
    console.error('Error loading scenarios by plan:', error)
    return []
  }
}

export async function deleteScenario(id: string): Promise<void> {
  try {
    const db = await initDB()
    await db.delete('scenarios', id)
  } catch (error) {
    console.error('Error deleting scenario:', error)
    throw error
  }
}

// Add autosave functionality
let autosaveTimeout: NodeJS.Timeout | null = null

export function scheduleAutosave(planData: any, delay: number = 2000): void {
  if (autosaveTimeout) {
    clearTimeout(autosaveTimeout)
  }
  
  autosaveTimeout = setTimeout(async () => {
    try {
      await savePlan(planData)
      console.log('Plan autosaved successfully')
    } catch (error) {
      console.error('Autosave failed:', error)
    }
  }, delay)
}

export function cancelAutosave(): void {
  if (autosaveTimeout) {
    clearTimeout(autosaveTimeout)
    autosaveTimeout = null
  }
}

// Export plan as downloadable file
export async function downloadPlanAsJSON(planId: string, fileName?: string): Promise<void> {
  try {
    const jsonData = await exportPlanAsJSON(planId)
    const plan = await loadPlan(planId)
    const defaultFileName = `${plan?.name || 'financial-plan'}-${new Date().toISOString().split('T')[0]}.json`
    
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = fileName || defaultFileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading plan:', error)
    throw error
  }
}

// Import plan from file
export async function importPlanFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = async (event) => {
      try {
        const jsonData = event.target?.result as string
        const newPlanId = await importPlanFromJSON(jsonData)
        resolve(newPlanId)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsText(file)
  })
}

// Export/Import functions
export async function exportPlanAsJSON(planId: string): Promise<string> {
  try {
    const plan = await loadPlan(planId)
    if (!plan) {
      throw new Error(`Plan with id ${planId} not found`)
    }
    
    const scenarios = await loadScenariosByPlan(planId)
    
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        planId: planId
      },
      plan,
      scenarios
    }
    
    return JSON.stringify(exportData, null, 2)
  } catch (error) {
    console.error('Error exporting plan:', error)
    throw error
  }
}

export async function importPlanFromJSON(jsonData: string): Promise<string> {
  try {
    const data = JSON.parse(jsonData)
    const newPlanId = generateId()
    
    // Import plan with new ID
    const plan = {
      ...data.plan,
      id: newPlanId,
      name: `${data.plan.name || 'Imported Plan'} (Imported)`,
      createdAt: new Date().toISOString()
    }
    
    await savePlan(plan)
    
    // Import scenarios with new IDs
    if (data.scenarios && Array.isArray(data.scenarios)) {
      for (const scenario of data.scenarios) {
        const newScenario = {
          ...scenario,
          id: generateId(),
          planId: newPlanId,
          createdAt: new Date().toISOString()
        }
        await saveScenario(newScenario)
      }
    }
    
    return newPlanId
  } catch (error) {
    console.error('Error importing plan:', error)
    throw error
  }
}

// Clear all data (for testing)
export async function clearAllData(): Promise<void> {
  try {
    const db = await initDB()
    await db.clear('plans')
    await db.clear('scenarios')
  } catch (error) {
    console.error('Error clearing data:', error)
    throw error
  }
}
