import { useState } from 'react'
import { Commitment, Person, Asset, ValidationError } from '../../types'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { CommitmentForm } from './CommitmentForm'
import { Edit, Trash2, CreditCard } from 'lucide-react'

interface CommitmentCardProps {
  commitment: Commitment
  people: Person[]
  assets: Asset[]
  ownerNames: string
  isEditing: boolean
  onEdit: () => void
  onDelete: () => void
  onSave: (commitment: Partial<Commitment>) => ValidationError[]
  onCancel: () => void
  disabled?: boolean
}

export function CommitmentCard({ 
  commitment, 
  people,
  assets,
  ownerNames,
  isEditing, 
  onEdit, 
  onDelete, 
  onSave, 
  onCancel,
  disabled 
}: CommitmentCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const formatAmount = (amount: number, frequency: string): string => {
    return `£${amount.toLocaleString()} per ${frequency.slice(0, -2)}`
  }

  const getAnnualAmount = (): number => {
    let multiplier = 1
    switch (commitment.frequency) {
      case 'weekly':
        multiplier = 52
        break
      case 'monthly':
        multiplier = 12
        break
      case 'quarterly':
        multiplier = 4
        break
      case 'annually':
        multiplier = 1
        break
    }
    return commitment.amount * multiplier
  }

  const getSourceDisplay = (): string => {
    switch (commitment.source) {
      case 'asset':
        const asset = assets.find(a => a.id === commitment.sourceAssetId)
        return asset ? `${asset.name} (${asset.type})` : 'Unknown Asset'
      case 'external':
        return 'External Account'
      default:
        return 'Cash'
    }
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
            <CreditCard className="h-5 w-5" />
            Edit Commitment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CommitmentForm
            commitment={commitment}
            people={people}
            assets={assets}
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
            <CreditCard className="h-5 w-5" />
            <div>
              <div>{commitment.name}</div>
              <div className="text-sm font-normal text-muted-foreground">
                {formatAmount(commitment.amount, commitment.frequency)}
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
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="font-medium">Annual:</span> £{getAnnualAmount().toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Period:</span> {commitment.startYear}{commitment.endYear ? ` - ${commitment.endYear}` : ' onwards'}
            </div>
          </div>
          
          <div>
            <span className="font-medium">Responsible:</span> {ownerNames}
          </div>

          <div>
            <span className="font-medium">Source:</span> {getSourceDisplay()}
          </div>

          {(commitment.growthRate || commitment.inflationRate) && (
            <div className="pt-2 border-t">
              {commitment.growthRate && (
                <div>
                  <span className="font-medium">Growth Rate:</span> {commitment.growthRate}% per year
                </div>
              )}
              {commitment.inflationRate && (
                <div>
                  <span className="font-medium">Inflation Rate:</span> {commitment.inflationRate}% per year
                </div>
              )}
            </div>
          )}
        </div>
        
        {showDeleteConfirm && (
          <div className="mt-4 p-3 border border-destructive rounded-md bg-destructive/10">
            <p className="text-sm text-destructive mb-2">
              Are you sure you want to delete this commitment?
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={handleDelete}
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
