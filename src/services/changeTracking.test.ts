import { describe, it, expect, beforeEach, vi } from 'vitest'
import { changeTracker, trackPersonChange, trackAssetChange } from './changeTracking'

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

describe('Change Tracking Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
      currentVersion: 0,
      entries: []
    }))
  })

  it('initializes tracking for a plan', async () => {
    await changeTracker.initializePlan('test-plan-id')
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('timeline_test-plan-id')
  })

  it('records a change entry', async () => {
    await changeTracker.initializePlan('test-plan-id')
    
    const entry = await changeTracker.recordChange(
      'create',
      'person',
      'Added new person',
      'Person details: John Doe',
      {
        entityId: 'person-1',
        afterSnapshot: { id: 'person-1', name: 'John Doe' }
      }
    )

    expect(entry.actionType).toBe('create')
    expect(entry.entityType).toBe('person')
    expect(entry.summary).toBe('Added new person')
    expect(entry.version).toBe(1)
    expect(mockLocalStorage.setItem).toHaveBeenCalled()
  })

  it('tracks person changes with helper function', async () => {
    await changeTracker.initializePlan('test-plan-id')
    
    const personData = {
      id: 'person-1',
      name: 'John Doe',
      dateOfBirth: '1980-01-01',
      sex: 'M'
    }

    const entry = await trackPersonChange('create', personData)

    expect(entry.summary).toContain('Added person: John Doe')
    expect(entry.entityType).toBe('person')
    expect(entry.afterSnapshot).toEqual(personData)
  })

  it('tracks asset changes with helper function', async () => {
    await changeTracker.initializePlan('test-plan-id')
    
    const assetData = {
      id: 'asset-1',
      name: 'ISA Account',
      type: 'ISA',
      currentValue: 50000
    }

    const entry = await trackAssetChange('create', assetData)

    expect(entry.summary).toContain('Added asset: ISA Account')
    expect(entry.entityType).toBe('asset')
    expect(entry.details).toContain('Asset type: ISA, Value: £50,000')
  })

  it('retrieves timeline with filters', async () => {
    await changeTracker.initializePlan('test-plan-id')
    
    // Add some test entries
    await changeTracker.recordChange('create', 'person', 'Added person', 'Details')
    await changeTracker.recordChange('update', 'asset', 'Updated asset', 'Details')
    await changeTracker.recordChange('delete', 'person', 'Deleted person', 'Details')

    const allEntries = changeTracker.getTimeline()
    expect(allEntries).toHaveLength(3)

    const personEntries = changeTracker.getTimeline({ entityType: 'person' })
    expect(personEntries).toHaveLength(2)

    const createEntries = changeTracker.getTimeline({ actionType: 'create' })
    expect(createEntries).toHaveLength(1)
  })

  it('generates statistics correctly', async () => {
    await changeTracker.initializePlan('test-plan-id')
    
    await changeTracker.recordChange('create', 'person', 'Added person', 'Details')
    await changeTracker.recordChange('update', 'person', 'Updated person', 'Details')
    await changeTracker.recordChange('create', 'asset', 'Added asset', 'Details')

    const stats = changeTracker.getStatistics()

    expect(stats.totalChanges).toBe(3)
    expect(stats.changesByType.create).toBe(2)
    expect(stats.changesByType.update).toBe(1)
    expect(stats.changesByEntity.person).toBe(2)
    expect(stats.changesByEntity.asset).toBe(1)
  })

  it('exports and imports timeline', async () => {
    await changeTracker.initializePlan('test-plan-id')
    
    await changeTracker.recordChange('create', 'person', 'Test entry', 'Details')

    const exported = changeTracker.exportTimeline()
    const exportedData = JSON.parse(exported)

    expect(exportedData.currentVersion).toBe(1)
    expect(exportedData.entries).toHaveLength(1)

    // Clear timeline and import
    await changeTracker.clearTimeline()
    const imported = await changeTracker.importTimeline(exported)

    expect(imported).toBe(true)
    expect(changeTracker.getCurrentVersion()).toBe(1)
    expect(changeTracker.getTimeline()).toHaveLength(1)
  })
})
