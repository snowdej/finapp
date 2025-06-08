import { useState } from 'react'
import { AssumptionOverride, Asset, Income, Commitment, ValidationError } from '../../types'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { OverrideForm } from './OverrideForm'
import { Edit, Trash2, Target } from 'lucide-react'

interface OverrideCardProps {
  override: AssumptionOverride
  assets: Asset[]
  income: Income[]
  commitments: Commitment[]
  itemName: string
  isEditing: boolean
  onEdit: () => void
  onDelete: () => void
  onSave: (override: Partial<AssumptionOverride>) => ValidationError[]
  onCancel: () => void
  disabled?: boolean
}

export function OverrideCard({
  override,
  assets,
  income,
  commitments,
  itemName,
  isEditing,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  disabled
}: OverrideCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const getOverrideTypeColor = (type: string): string => {
    switch (type) {
      case 'growth': return 'text-green-600'
      case 'inflation': return 'text-orange-600'
      case 'interest': return 'text-blue-600'
      case 'tax': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getTargetDisplay = (): string => {
    if (override.entityType === 'category') {
      return `${override.category} (Category)`
    }
    return `${itemName} (${override.entityType})`
  }

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete()
      setShowDeleteConfirm(false)
    } else {
      setShowDeleteConfirm(true)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false)
  }

  if (isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Edit Override
          </CardTitle>
        </CardHeader>
        <CardContent>
          <OverrideForm
            override={override}
            assets={assets}
            income={income}
            commitments={commitments}
            onSubmit={onSave}
            onCancel={onCancel}
            submitLabel="Save"
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            <div>
              <div className="text-sm font-normal text-muted-foreground capitalize">
                {override.overrideType} Override
              </div>
              <div className={`font-bold ${getOverrideTypeColor(override.overrideType)}`}>
                {override.value}%
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              disabled={disabled}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={disabled}
              className={showDeleteConfirm ? "text-destructive" : ""}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          <div>
            <span className="font-medium">Target:</span>
            <div className="mt-1">{getTargetDisplay()}</div>
          </div>
          
          {(override.startYear || override.endYear) && (
            <div>
              <span className="font-medium">Period:</span>
              <div className="mt-1">
                {override.startYear || 'Start'} - {override.endYear || 'End'}
              </div>
            </div>
          )}
          
          {override.description && (
            <div>
              <span className="font-medium">Description:</span>
              <p className="mt-1 text-muted-foreground">{override.description}</p>
            </div>
          )}
        </div>
        
        {showDeleteConfirm && (
          <div className="mt-4 p-3 border border-destructive rounded-md bg-destructive/10">
            <p className="text-sm text-destructive mb-2">
              Are you sure you want to delete this override?
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={handleDelete}
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
}
