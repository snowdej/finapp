import { useState } from 'react'
import { Scenario, ValidationError } from '../../types'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { ScenarioForm } from './ScenarioForm'
import { Badge } from '../ui/badge.tsx'
import { Edit, Trash2, Copy, Play, Star, StarOff, GitBranch } from 'lucide-react'

interface ScenarioListProps {
  scenarios: Scenario[]
  activeScenarioId?: string
  editingId: string | null
  planId: string
  onEdit: (scenarioId: string) => void
  onDelete: (scenarioId: string) => void
  onCopy: (scenario: Scenario) => void
  onSetActive: (scenarioId: string) => void
  onSetBase: (scenarioId: string) => void
  onSave: (scenario: Partial<Scenario>) => ValidationError[]
  onCancel: () => void
  disabled?: boolean
}

export function ScenarioList({
  scenarios,
  activeScenarioId,
  editingId,
  planId,
  onEdit,
  onDelete,
  onCopy,
  onSetActive,
  onSetBase,
  onSave,
  onCancel,
  disabled
}: ScenarioListProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const handleDelete = (scenarioId: string) => {
    if (showDeleteConfirm === scenarioId) {
      onDelete(scenarioId)
      setShowDeleteConfirm(null)
    } else {
      setShowDeleteConfirm(scenarioId)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirm(null)
  }

  if (scenarios.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <GitBranch className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No scenarios created yet</h3>
          <p className="text-muted-foreground text-center mb-4">
            Create your first scenario to start exploring different what-if possibilities
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {scenarios.map((scenario) => {
        const isActive = scenario.id === activeScenarioId
        const isEditing = scenario.id === editingId
        const isDeleting = showDeleteConfirm === scenario.id

        if (isEditing) {
          return (
            <Card key={scenario.id} className="col-span-full">
              <CardHeader>
                <CardTitle>Edit Scenario</CardTitle>
              </CardHeader>
              <CardContent>
                <ScenarioForm
                  scenario={scenario}
                  planId={planId}
                  defaultAssumptions={scenario.assumptions}
                  defaultOverrides={scenario.overrides}
                  onSubmit={onSave}
                  onCancel={onCancel}
                  submitLabel="Save"
                />
              </CardContent>
            </Card>
          )
        }

        return (
          <Card key={scenario.id} className={isActive ? 'ring-2 ring-primary' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4" />
                    {scenario.name}
                    {isActive && (
                      <Badge variant="secondary" className="text-xs">
                        ACTIVE
                      </Badge>
                    )}
                    {scenario.isBase && (
                      <Badge variant="default" className="text-xs">
                        BASE
                      </Badge>
                    )}
                  </CardTitle>
                  {scenario.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {scenario.description}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(scenario.id)}
                    disabled={disabled}
                    title="Edit scenario"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCopy(scenario)}
                    disabled={disabled}
                    title="Copy scenario"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(scenario.id)}
                    disabled={disabled || scenarios.length === 1}
                    className={isDeleting ? "text-destructive" : ""}
                    title="Delete scenario"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Inflation:</span>
                  <span>{scenario.assumptions.inflationRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Income Growth:</span>
                  <span>{scenario.assumptions.incomeGrowthRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Retirement Age:</span>
                  <span>{scenario.assumptions.retirementAge}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Overrides:</span>
                  <span>{scenario.overrides?.length || 0}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                {!isActive && (
                  <Button
                    size="sm"
                    onClick={() => onSetActive(scenario.id)}
                    disabled={disabled}
                    className="flex items-center gap-1"
                  >
                    <Play className="h-3 w-3" />
                    Activate
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSetBase(scenario.id)}
                  disabled={disabled}
                  className="flex items-center gap-1"
                >
                  {scenario.isBase ? (
                    <>
                      <StarOff className="h-3 w-3" />
                      Unmark Base
                    </>
                  ) : (
                    <>
                      <Star className="h-3 w-3" />
                      Mark Base
                    </>
                  )}
                </Button>
              </div>

              {isDeleting && (
                <div className="mt-4 p-3 border border-destructive rounded-md bg-destructive/10">
                  <p className="text-sm text-destructive mb-2">
                    Are you sure you want to delete "{scenario.name}"?
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleDelete(scenario.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelDelete}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
