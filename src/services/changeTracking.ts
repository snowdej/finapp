import { ChangeLogEntry, ChangeTimelineState, RevertOptions } from '../types'
import { generateId, deepClone } from '../utils/validation'
import { loadPlan, savePlan } from './storage'

class ChangeTrackingService {
  private static instance: ChangeTrackingService
  private currentPlanId: string | null = null
  private timeline: ChangeTimelineState = {
    currentVersion: 0,
    entries: []
  }

  static getInstance(): ChangeTrackingService {
    if (!ChangeTrackingService.instance) {
      ChangeTrackingService.instance = new ChangeTrackingService()
    }
    return ChangeTrackingService.instance
  }

  // Initialize tracking for a plan
  async initializePlan(planId: string): Promise<void> {
    this.currentPlanId = planId
    await this.loadTimeline()
  }

  // Load timeline from localStorage
  private async loadTimeline(): Promise<void> {
    if (!this.currentPlanId) return

    const timelineKey = `timeline_${this.currentPlanId}`
    const stored = localStorage.getItem(timelineKey)
    
    if (stored) {
      try {
        this.timeline = JSON.parse(stored)
      } catch (error) {
        console.error('Failed to parse timeline:', error)
        this.timeline = { currentVersion: 0, entries: [] }
      }
    } else {
      this.timeline = { currentVersion: 0, entries: [] }
    }
  }

  // Save timeline to localStorage
  private async saveTimeline(): Promise<void> {
    if (!this.currentPlanId) return

    const timelineKey = `timeline_${this.currentPlanId}`
    try {
      localStorage.setItem(timelineKey, JSON.stringify(this.timeline))
    } catch (error) {
      console.error('Failed to save timeline:', error)
    }
  }

  // Record a change
  async recordChange(
    actionType: ChangeLogEntry['actionType'],
    entityType: ChangeLogEntry['entityType'],
    summary: string,
    details: string,
    options: {
      entityId?: string
      scenarioId?: string
      beforeSnapshot?: any
      afterSnapshot?: any
    } = {}
  ): Promise<ChangeLogEntry> {
    if (!this.currentPlanId) {
      throw new Error('No plan initialized for change tracking')
    }

    const entry: ChangeLogEntry = {
      id: generateId('change'),
      planId: this.currentPlanId,
      scenarioId: options.scenarioId,
      timestamp: new Date().toISOString(),
      actionType,
      entityType,
      entityId: options.entityId,
      summary,
      details,
      beforeSnapshot: options.beforeSnapshot ? deepClone(options.beforeSnapshot) : undefined,
      afterSnapshot: options.afterSnapshot ? deepClone(options.afterSnapshot) : undefined,
      version: this.timeline.currentVersion + 1
    }

    this.timeline.currentVersion++
    this.timeline.entries.push(entry)

    // Keep only last 1000 entries for performance
    if (this.timeline.entries.length > 1000) {
      this.timeline.entries = this.timeline.entries.slice(-1000)
    }

    await this.saveTimeline()
    return entry
  }

  // Get timeline entries with filtering
  getTimeline(options: {
    limit?: number
    entityType?: ChangeLogEntry['entityType']
    actionType?: ChangeLogEntry['actionType']
    fromDate?: string
    toDate?: string
  } = {}): ChangeLogEntry[] {
    let entries = [...this.timeline.entries]

    // Apply filters
    if (options.entityType) {
      entries = entries.filter(e => e.entityType === options.entityType)
    }

    if (options.actionType) {
      entries = entries.filter(e => e.actionType === options.actionType)
    }

    if (options.fromDate) {
      entries = entries.filter(e => e.timestamp >= options.fromDate!)
    }

    if (options.toDate) {
      entries = entries.filter(e => e.timestamp <= options.toDate!)
    }

    // Sort by version (newest first)
    entries.sort((a, b) => b.version - a.version)

    // Apply limit
    if (options.limit) {
      entries = entries.slice(0, options.limit)
    }

    return entries
  }

  // Get specific entry by ID
  getEntry(entryId: string): ChangeLogEntry | undefined {
    return this.timeline.entries.find(e => e.id === entryId)
  }

  // Revert to a specific version
  async revertToVersion(targetVersion: number, options: RevertOptions = {}): Promise<boolean> {
    if (!this.currentPlanId) {
      throw new Error('No plan initialized for revert')
    }

    const targetEntry = this.timeline.entries.find(e => e.version === targetVersion)
    if (!targetEntry) {
      throw new Error(`Version ${targetVersion} not found`)
    }

    try {
      // Create backup if requested
      if (options.createBackup) {
        const currentPlan = await loadPlan(this.currentPlanId)
        if (currentPlan) {
          await this.recordChange(
            'create',
            'plan',
            'Backup before revert',
            `Backup created before reverting to version ${targetVersion}`,
            { afterSnapshot: currentPlan }
          )
        }
      }

      // Find the plan state at target version
      let planStateAtTarget: any = null

      // Look for the most recent plan snapshot at or before target version
      const relevantEntries = this.timeline.entries
        .filter(e => e.version <= targetVersion && e.afterSnapshot)
        .sort((a, b) => b.version - a.version)

      if (relevantEntries.length > 0) {
        planStateAtTarget = relevantEntries[0].afterSnapshot
      } else {
        throw new Error('Cannot find plan state for target version')
      }

      // Apply the revert
      await savePlan(planStateAtTarget)

      // Record the revert action
      await this.recordChange(
        'revert',
        'plan',
        `Reverted to version ${targetVersion}`,
        `Plan reverted to state from ${targetEntry.timestamp}`,
        {
          beforeSnapshot: await loadPlan(this.currentPlanId),
          afterSnapshot: planStateAtTarget
        }
      )

      return true
    } catch (error) {
      console.error('Revert failed:', error)
      return false
    }
  }

  // Get statistics about changes
  getStatistics(): {
    totalChanges: number
    changesByType: Record<string, number>
    changesByEntity: Record<string, number>
    oldestChange?: string
    newestChange?: string
  } {
    const entries = this.timeline.entries
    const stats = {
      totalChanges: entries.length,
      changesByType: {} as Record<string, number>,
      changesByEntity: {} as Record<string, number>,
      oldestChange: entries.length > 0 ? entries[0].timestamp : undefined,
      newestChange: entries.length > 0 ? entries[entries.length - 1].timestamp : undefined
    }

    entries.forEach(entry => {
      stats.changesByType[entry.actionType] = (stats.changesByType[entry.actionType] || 0) + 1
      stats.changesByEntity[entry.entityType] = (stats.changesByEntity[entry.entityType] || 0) + 1
    })

    return stats
  }

  // Clear timeline (use with caution)
  async clearTimeline(): Promise<void> {
    if (!this.currentPlanId) return

    this.timeline = { currentVersion: 0, entries: [] }
    await this.saveTimeline()
  }

  // Export timeline as JSON
  exportTimeline(): string {
    return JSON.stringify(this.timeline, null, 2)
  }

  // Import timeline from JSON
  async importTimeline(timelineJson: string): Promise<boolean> {
    try {
      const importedTimeline = JSON.parse(timelineJson)
      this.timeline = importedTimeline
      await this.saveTimeline()
      return true
    } catch (error) {
      console.error('Import failed:', error)
      return false
    }
  }

  // Get current version
  getCurrentVersion(): number {
    return this.timeline.currentVersion
  }

  // Check if there are any changes
  hasChanges(): boolean {
    return this.timeline.entries.length > 0
  }
}

// Export singleton instance
export const changeTracker = ChangeTrackingService.getInstance()

// Helper functions for common change types
export async function trackPersonChange(
  action: 'create' | 'update' | 'delete',
  personData: any,
  beforeData?: any
) {
  const summary = `${action === 'create' ? 'Added' : action === 'update' ? 'Updated' : 'Deleted'} person: ${personData.name || 'Unknown'}`
  const details = action === 'delete' 
    ? `Removed person ${personData.name}` 
    : `Person details: ${JSON.stringify(personData, null, 2)}`

  return changeTracker.recordChange(action, 'person', summary, details, {
    entityId: personData.id,
    beforeSnapshot: beforeData,
    afterSnapshot: action !== 'delete' ? personData : undefined
  })
}

export async function trackAssetChange(
  action: 'create' | 'update' | 'delete',
  assetData: any,
  beforeData?: any
) {
  const summary = `${action === 'create' ? 'Added' : action === 'update' ? 'Updated' : 'Deleted'} asset: ${assetData.name || 'Unknown'}`
  const details = `Asset type: ${assetData.type}, Value: £${assetData.currentValue?.toLocaleString() || 0}`

  return changeTracker.recordChange(action, 'asset', summary, details, {
    entityId: assetData.id,
    beforeSnapshot: beforeData,
    afterSnapshot: action !== 'delete' ? assetData : undefined
  })
}

export async function trackIncomeChange(
  action: 'create' | 'update' | 'delete',
  incomeData: any,
  beforeData?: any
) {
  const summary = `${action === 'create' ? 'Added' : action === 'update' ? 'Updated' : 'Deleted'} income: ${incomeData.name || 'Unknown'}`
  const details = `Amount: £${incomeData.amount?.toLocaleString() || 0} ${incomeData.frequency || ''}`

  return changeTracker.recordChange(action, 'income', summary, details, {
    entityId: incomeData.id,
    beforeSnapshot: beforeData,
    afterSnapshot: action !== 'delete' ? incomeData : undefined
  })
}

export async function trackCommitmentChange(
  action: 'create' | 'update' | 'delete',
  commitmentData: any,
  beforeData?: any
) {
  const summary = `${action === 'create' ? 'Added' : action === 'update' ? 'Updated' : 'Deleted'} commitment: ${commitmentData.name || 'Unknown'}`
  const details = `Amount: £${commitmentData.amount?.toLocaleString() || 0} ${commitmentData.frequency || ''}`

  return changeTracker.recordChange(action, 'commitment', summary, details, {
    entityId: commitmentData.id,
    beforeSnapshot: beforeData,
    afterSnapshot: action !== 'delete' ? commitmentData : undefined
  })
}

export async function trackEventChange(
  action: 'create' | 'update' | 'delete',
  eventData: any,
  beforeData?: any
) {
  const summary = `${action === 'create' ? 'Added' : action === 'update' ? 'Updated' : 'Deleted'} event: ${eventData.name || 'Unknown'}`
  const details = `Year: ${eventData.year}, Amount: £${eventData.amount?.toLocaleString() || 0}`

  return changeTracker.recordChange(action, 'event', summary, details, {
    entityId: eventData.id,
    beforeSnapshot: beforeData,
    afterSnapshot: action !== 'delete' ? eventData : undefined
  })
}

export async function trackScenarioChange(
  action: 'create' | 'update' | 'delete',
  scenarioData: any,
  beforeData?: any
) {
  const summary = `${action === 'create' ? 'Created' : action === 'update' ? 'Updated' : 'Deleted'} scenario: ${scenarioData.name || 'Unknown'}`
  const details = `Scenario ${scenarioData.isBase ? '(Base)' : ''}: ${scenarioData.description || 'No description'}`

  return changeTracker.recordChange(action, 'scenario', summary, details, {
    entityId: scenarioData.id,
    scenarioId: scenarioData.id,
    beforeSnapshot: beforeData,
    afterSnapshot: action !== 'delete' ? scenarioData : undefined
  })
}

export async function trackPlanChange(
  action: 'create' | 'update' | 'import',
  planData: any,
  beforeData?: any
) {
  const summary = `${action === 'create' ? 'Created' : action === 'update' ? 'Updated' : 'Imported'} plan: ${planData.name || 'Unknown'}`
  const details = action === 'import' 
    ? `Imported plan with ${planData.people?.length || 0} people, ${planData.assets?.length || 0} assets`
    : `Plan updated`

  return changeTracker.recordChange(action, 'plan', summary, details, {
    entityId: planData.id,
    beforeSnapshot: beforeData,
    afterSnapshot: planData
  })
}