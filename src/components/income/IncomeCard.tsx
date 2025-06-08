import { useState } from 'react'
import { Income, Person, Asset, ValidationError } from '../../types'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { IncomeForm } from './IncomeForm'
import { Edit, Trash2, Wallet } from 'lucide-react'

interface IncomeCardProps {
  income: Income
  people: Person[]
  assets: Asset[]
  ownerNames: string
  isEditing: boolean
  onEdit: () => void
  onDelete: () => void
  onSave: (income: Partial<Income>) => ValidationError[]
  onCancel: () => void
  disabled?: boolean
}

export function IncomeCard({ 
  income, 
  people,
  assets,
  ownerNames,
  isEditing, 
  onEdit, 
  onDelete, 
  onSave, 
  onCancel,
  disabled 
}: IncomeCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const formatAmount = (amount: number, frequency: string): string => {
    return `£${amount.toLocaleString()} per ${frequency.slice(0, -2)}`
  }

  const getAnnualAmount = (): number => {
    let multiplier = 1
    switch (income.frequency) {
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
    return income.amount * multiplier
  }

  const getDestinationDisplay = (): string => {
    switch (income.destination) {
      case 'asset':
        const asset = assets.find(a => a.id === income.destinationAssetId)
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
            <Wallet className="h-5 w-5" />
            Edit Income
          </CardTitle>
        </CardHeader>
        <CardContent>
          <IncomeForm
            income={income}
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
            <Wallet className="h-5 w-5" />
            <div>
              <div>{income.name}</div>
              <div className="text-sm font-normal text-muted-foreground">
                {formatAmount(income.amount, income.frequency)}
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
              <span className="font-medium">Period:</span> {income.startYear}{income.endYear ? ` - ${income.endYear}` : ' onwards'}
            </div>
          </div>
          
          <div>
            <span className="font-medium">Owners:</span> {ownerNames}
          </div>

          <div>
            <span className="font-medium">Destination:</span> {getDestinationDisplay()}
          </div>

          {(income.growthRate || income.inflationRate) && (
            <div className="pt-2 border-t">
              {income.growthRate && (
                <div>
                  <span className="font-medium">Growth Rate:</span> {income.growthRate}% per year
                </div>
              )}
              {income.inflationRate && (
                <div>
                  <span className="font-medium">Inflation Rate:</span> {income.inflationRate}% per year
                </div>
              )}
            </div>
          )}
        </div>
        
        {showDeleteConfirm && (
          <div className="mt-4 p-3 border border-destructive rounded-md bg-destructive/10">
            <p className="text-sm text-destructive mb-2">
              Are you sure you want to delete this income source?
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
