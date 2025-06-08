import { useState, useEffect } from 'react'
import { ChangeLogEntry } from '../../types'
import { changeTracker } from '../../services/changeTracking'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { 
  History, 
  RotateCcw, 
  Search, 
  Filter, 
  Download, 
  Upload,
  Clock,
  User,
  FileText,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface TimelineViewerProps {
  planId: string
  onRevert?: (version: number) => void
}

export function TimelineViewer({ planId, onRevert }: TimelineViewerProps) {
  const [entries, setEntries] = useState<ChangeLogEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<ChangeLogEntry[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEntityType, setSelectedEntityType] = useState<string>('all')
  const [selectedActionType, setSelectedActionType] = useState<string>('all')
  const [selectedEntry, setSelectedEntry] = useState<ChangeLogEntry | null>(null)
  const [showRevertConfirm, setShowRevertConfirm] = useState<number | null>(null)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    loadTimeline()
  }, [planId])

  useEffect(() => {
    applyFilters()
  }, [entries, searchTerm, selectedEntityType, selectedActionType])

  const loadTimeline = async () => {
    await changeTracker.initializePlan(planId)
    const timelineEntries = changeTracker.getTimeline({ limit: 500 })
    const timelineStats = changeTracker.getStatistics()
    
    setEntries(timelineEntries)
    setStats(timelineStats)
  }

  const applyFilters = () => {
    let filtered = entries

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(entry => 
        entry.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.details.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply entity type filter
    if (selectedEntityType !== 'all') {
      filtered = filtered.filter(entry => entry.entityType === selectedEntityType)
    }

    // Apply action type filter
    if (selectedActionType !== 'all') {
      filtered = filtered.filter(entry => entry.actionType === selectedActionType)
    }

    setFilteredEntries(filtered)
  }

  const handleRevert = async (version: number) => {
    try {
      const success = await changeTracker.revertToVersion(version, { 
        createBackup: true 
      })
      
      if (success) {
        await loadTimeline()
        setShowRevertConfirm(null)
        onRevert?.(version)
      } else {
        alert('Failed to revert. Please try again.')
      }
    } catch (error) {
      console.error('Revert error:', error)
      alert('Failed to revert: ' + (error as Error).message)
    }
  }

  const exportTimeline = () => {
    const timelineData = changeTracker.exportTimeline()
    const blob = new Blob([timelineData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `timeline-${planId}-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const importTimeline = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const content = await file.text()
      const success = await changeTracker.importTimeline(content)
      
      if (success) {
        await loadTimeline()
        alert('Timeline imported successfully')
      } else {
        alert('Failed to import timeline')
      }
    } catch (error) {
      console.error('Import error:', error)
      alert('Failed to import timeline: ' + (error as Error).message)
    }
    
    // Reset input
    event.target.value = ''
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'update': return <FileText className="h-4 w-4 text-blue-600" />
      case 'delete': return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'revert': return <RotateCcw className="h-4 w-4 text-orange-600" />
      case 'import': return <Upload className="h-4 w-4 text-purple-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'bg-green-100 text-green-800'
      case 'update': return 'bg-blue-100 text-blue-800'
      case 'delete': return 'bg-red-100 text-red-800'
      case 'revert': return 'bg-orange-100 text-orange-800'
      case 'import': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <History className="h-8 w-8" />
            Change Timeline
          </h2>
          <p className="text-muted-foreground mt-2">
            Track all changes and revert to any previous state
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportTimeline}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={() => document.getElementById('timeline-import')?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <input
            id="timeline-import"
            type="file"
            accept=".json"
            className="hidden"
            onChange={importTimeline}
            aria-label="Import timeline file"
          />
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.totalChanges}</div>
              <div className="text-sm text-muted-foreground">Total Changes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{changeTracker.getCurrentVersion()}</div>
              <div className="text-sm text-muted-foreground">Current Version</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {Object.keys(stats.changesByEntity).length}
              </div>
              <div className="text-sm text-muted-foreground">Entity Types</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {stats.newestChange ? formatTimestamp(stats.newestChange).split(' ')[0] : 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Last Change</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search changes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="entity-type">Entity Type</Label>
              <select
                id="entity-type"
                value={selectedEntityType}
                onChange={(e) => setSelectedEntityType(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                title="Filter by entity type"
              >
                <option value="all">All Types</option>
                <option value="person">People</option>
                <option value="asset">Assets</option>
                <option value="income">Income</option>
                <option value="commitment">Commitments</option>
                <option value="event">Events</option>
                <option value="scenario">Scenarios</option>
                <option value="plan">Plan</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="action-type">Action Type</Label>
              <select
                id="action-type"
                value={selectedActionType}
                onChange={(e) => setSelectedActionType(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                title="Filter by action type"
              >
                <option value="all">All Actions</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="revert">Revert</option>
                <option value="import">Import</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Change History ({filteredEntries.length} entries)</CardTitle>
          <CardDescription>
            Click on any entry to view details or revert to that state
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {entries.length === 0 ? 'No changes recorded yet' : 'No changes match your filters'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEntries.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedEntry?.id === entry.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getActionIcon(entry.actionType)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{entry.summary}</span>
                          <Badge className={getActionColor(entry.actionType)}>
                            {entry.actionType}
                          </Badge>
                          <Badge variant="outline">
                            {entry.entityType}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatTimestamp(entry.timestamp)} • Version {entry.version}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {entry.version < changeTracker.getCurrentVersion() && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowRevertConfirm(entry.version)
                          }}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Revert
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedEntry?.id === entry.id && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">Details</Label>
                          <div className="text-sm text-muted-foreground mt-1">
                            {entry.details}
                          </div>
                        </div>
                        
                        {entry.scenarioId && (
                          <div>
                            <Label className="text-sm font-medium">Scenario ID</Label>
                            <div className="text-sm text-muted-foreground mt-1">
                              {entry.scenarioId}
                            </div>
                          </div>
                        )}

                        {(entry.beforeSnapshot || entry.afterSnapshot) && (
                          <div className="grid gap-4 md:grid-cols-2">
                            {entry.beforeSnapshot && (
                              <div>
                                <Label className="text-sm font-medium">Before</Label>
                                <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto max-h-32">
                                  {JSON.stringify(entry.beforeSnapshot, null, 2)}
                                </pre>
                              </div>
                            )}
                            {entry.afterSnapshot && (
                              <div>
                                <Label className="text-sm font-medium">After</Label>
                                <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto max-h-32">
                                  {JSON.stringify(entry.afterSnapshot, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revert Confirmation Dialog */}
      {showRevertConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Confirm Revert
              </CardTitle>
              <CardDescription>
                Are you sure you want to revert to version {showRevertConfirm}? This will:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mb-4">
                <li>Create a backup of the current state</li>
                <li>Restore the plan to version {showRevertConfirm}</li>
                <li>This action will be recorded in the timeline</li>
              </ul>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowRevertConfirm(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={() => handleRevert(showRevertConfirm)}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Revert
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
