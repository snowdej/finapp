import { useState } from 'react'
import { AssumptionOverride, Asset, Income, Commitment } from '../../types'
import { validateAssumptionOverride, generateId } from '../../utils/validation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { OverrideForm } from './OverrideForm.tsx'
import { OverrideCard } from './OverrideCard.tsx'
import { Target, Plus } from 'lucide-react'

interface OverridesManagerProps {
  overrides: AssumptionOverride[]
  assets: Asset[]
  income: Income[]
  commitments: Commitment[]
  onUpdateOverrides: (overrides: AssumptionOverride[]) => void
}

export function OverridesManager({
  overrides,
  assets,
  income,
  commitments,
  onUpdateOverrides
}: OverridesManagerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const allItems = [
    ...assets.map(a => ({ ...a, itemType: 'asset' as const })),
    ...income.map(i => ({ ...i, itemType: 'income' as const })),
    ...commitments.map(c => ({ ...c, itemType: 'commitment' as const }))
  ]

  const handleAddOverride = (overrideData: Partial<AssumptionOverride>) => {
    const validation = validateAssumptionOverride(overrideData)
    if (!validation.isValid) {
      return validation.errors
    }

    const newOverride: AssumptionOverride = {
      id: generateId('override'),
      entityType: overrideData.entityType!,
      entityId: overrideData.entityId,
      category: overrideData.category,
      overrideType: overrideData.overrideType!,
      value: overrideData.value!,
      startYear: overrideData.startYear,
      endYear: overrideData.endYear,
      description: overrideData.description,
      createdAt: new Date().toISOString()
    }

    onUpdateOverrides([...overrides, newOverride])
    setIsAdding(false)
    return []
  }

  const handleEditOverride = (overrideData: Partial<AssumptionOverride>) => {
    const validation = validateAssumptionOverride(overrideData)
    if (!validation.isValid) {
      return validation.errors
    }

    const updatedOverrides = overrides.map(override => 
      override.id === editingId 
        ? {
            ...override,
            entityType: overrideData.entityType!,
            entityId: overrideData.entityId,
            category: overrideData.category,
            overrideType: overrideData.overrideType!,
            value: overrideData.value!,
            startYear: overrideData.startYear,
            endYear: overrideData.endYear,
            description: overrideData.description,
            updatedAt: new Date().toISOString()
          }
        : override
    )

    onUpdateOverrides(updatedOverrides)
    setEditingId(null)
    return []
  }

  const handleDeleteOverride = (id: string) => {
    const updatedOverrides = overrides.filter(override => override.id !== id)
    onUpdateOverrides(updatedOverrides)
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
  }

  const getItemName = (entityType: string, entityId?: string): string => {
    if (!entityId) return 'N/A'
    const item = allItems.find(i => i.id === entityId && i.itemType === entityType)
    return item ? item.name : 'Unknown Item'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Assumption Overrides</h3>
          <p className="text-muted-foreground">
            Create specific overrides for categories or individual items
          </p>
        </div>
        <Button 
          onClick={() => setIsAdding(true)}
          disabled={isAdding || editingId !== null}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Override
        </Button>
      </div>

      {/* Add Override Form */}
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Override</CardTitle>
            <CardDescription>
              Create a specific override for a category or individual item
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OverrideForm
              assets={assets}
              income={income}
              commitments={commitments}
              onSubmit={handleAddOverride}
              onCancel={handleCancel}
              submitLabel="Add Override"
            />
          </CardContent>
        </Card>
      )}

      {/* Overrides List */}
      {overrides.length === 0 && !isAdding ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No overrides created yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create overrides to customize rates for specific categories or items
            </p>
            <Button onClick={() => setIsAdding(true)}>
              Create Your First Override
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {overrides.map((override) => (
            <OverrideCard
              key={override.id}
              override={override}
              assets={assets}
              income={income}
              commitments={commitments}
              itemName={getItemName(override.entityType, override.entityId)}
              isEditing={editingId === override.id}
              onEdit={() => setEditingId(override.id)}
              onDelete={() => handleDeleteOverride(override.id)}
              onSave={handleEditOverride}
              onCancel={handleCancel}
              disabled={isAdding || (editingId !== null && editingId !== override.id)}
            />
          ))}
        </div>
      )}

      {/* Summary */}
      {overrides.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Override Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{overrides.length}</div>
                <div className="text-sm text-muted-foreground">Total Overrides</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {overrides.filter(o => o.entityType === 'category').length}
                </div>
                <div className="text-sm text-muted-foreground">Category Overrides</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {overrides.filter(o => o.entityId).length}
                </div>
                <div className="text-sm text-muted-foreground">Item Overrides</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {overrides.filter(o => o.startYear || o.endYear).length}
                </div>
                <div className="text-sm text-muted-foreground">Time-Limited</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
