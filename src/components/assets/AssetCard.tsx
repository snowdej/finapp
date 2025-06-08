import { useState } from 'react'
import { Asset, Person, ValidationError } from '../../types'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { AssetForm } from './AssetForm'
import { LoanManager } from './LoanManager'
import { Edit, Trash2, PiggyBank, CreditCard } from 'lucide-react'

interface AssetCardProps {
  asset: Asset
  people: Person[]
  ownerNames: string
  isEditing: boolean
  onEdit: () => void
  onDelete: () => void
  onSave: (asset: Partial<Asset>) => ValidationError[]
  onCancel: () => void
  onUpdateLoans: (loans: any[]) => void
  disabled?: boolean
}

export function AssetCard({ 
  asset, 
  people,
  ownerNames,
  isEditing, 
  onEdit, 
  onDelete, 
  onSave, 
  onCancel,
  onUpdateLoans,
  disabled 
}: AssetCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showLoans, setShowLoans] = useState(false)

  const totalLoanAmount = asset.loans?.reduce((sum, loan) => sum + (loan.remainingBalance || loan.amount), 0) || 0
  const netValue = asset.currentValue - totalLoanAmount

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
            <PiggyBank className="h-5 w-5" />
            Edit Asset
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AssetForm
            asset={asset}
            people={people}
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
            <PiggyBank className="h-5 w-5" />
            <div>
              <div>{asset.name}</div>
              <div className="text-sm font-normal text-muted-foreground">{asset.type}</div>
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
              <span className="font-medium">Value:</span> £{asset.currentValue.toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Net Value:</span> £{netValue.toLocaleString()}
            </div>
          </div>
          
          <div>
            <span className="font-medium">Owners:</span> {ownerNames}
          </div>

          {asset.growthRate && (
            <div>
              <span className="font-medium">Growth Rate:</span> {asset.growthRate}% per year
            </div>
          )}

          {asset.loans && asset.loans.length > 0 && (
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium flex items-center gap-1">
                  <CreditCard className="h-4 w-4" />
                  Loans ({asset.loans.length})
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLoans(!showLoans)}
                >
                  {showLoans ? 'Hide' : 'Show'}
                </Button>
              </div>
              <div className="text-sm">
                Total: £{totalLoanAmount.toLocaleString()}
              </div>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLoans(!showLoans)}
            className="w-full"
            disabled={disabled}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Manage Loans
          </Button>
        </div>
        
        {showLoans && (
          <div className="mt-4 pt-4 border-t">
            <LoanManager
              loans={asset.loans || []}
              onUpdateLoans={onUpdateLoans}
            />
          </div>
        )}
        
        {showDeleteConfirm && (
          <div className="mt-4 p-3 border border-destructive rounded-md bg-destructive/10">
            <p className="text-sm text-destructive mb-2">
              Are you sure you want to delete this asset?
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleDelete}
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
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
