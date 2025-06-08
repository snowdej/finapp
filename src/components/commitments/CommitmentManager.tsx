import { useState } from 'react'
import { Commitment, Person, Asset } from '../../types'
import { validateCommitment, generateId } from '../../utils/validation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { CommitmentForm } from './CommitmentForm.tsx'
import { CommitmentCard } from './CommitmentCard.tsx'
import { CreditCard, Plus } from 'lucide-react'

interface CommitmentManagerProps {
  commitments: Commitment[]
  people: Person[]
  assets: Asset[]
  onUpdateCommitments: (commitments: Commitment[]) => void
}

export function CommitmentManager({ commitments, people, assets, onUpdateCommitments }: CommitmentManagerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const generateCommitmentName = (existingCommitments: Commitment[]): string => {
    const count = existingCommitments.length + 1
    return `Commitment ${count}`
  }

  const calculateAnnualTotal = (): number => {
    return commitments.reduce((sum, item) => {
      let annualAmount = item.amount
      switch (item.frequency) {
        case 'weekly':
          annualAmount *= 52
          break
        case 'monthly':
          annualAmount *= 12
          break
        case 'quarterly':
          annualAmount *= 4
          break
        // 'annually' stays the same
      }
      return sum + annualAmount
    }, 0)
  }

  const handleAddCommitment = (commitmentData: Partial<Commitment>) => {
    const validation = validateCommitment(commitmentData, people, assets)
    if (!validation.isValid) {
      return validation.errors
    }

    const newCommitment: Commitment = {
      id: generateId('commitment'),
      name: commitmentData.name?.trim() || generateCommitmentName(commitments),
      amount: commitmentData.amount!,
      frequency: commitmentData.frequency!,
      startYear: commitmentData.startYear!,
      endYear: commitmentData.endYear,
      ownerIds: commitmentData.ownerIds!,
      source: commitmentData.source || 'cash',
      sourceAssetId: commitmentData.sourceAssetId,
      growthRate: commitmentData.growthRate,
      inflationRate: commitmentData.inflationRate,
      createdAt: new Date().toISOString()
    }

    onUpdateCommitments([...commitments, newCommitment])
    setIsAdding(false)
    return []
  }

  const handleEditCommitment = (commitmentData: Partial<Commitment>) => {
    const validation = validateCommitment(commitmentData, people, assets)
    if (!validation.isValid) {
      return validation.errors
    }

    const updatedCommitments = commitments.map(item => 
      item.id === editingId 
        ? {
            ...item,
            name: commitmentData.name?.trim() || item.name,
            amount: commitmentData.amount!,
            frequency: commitmentData.frequency!,
            startYear: commitmentData.startYear!,
            endYear: commitmentData.endYear,
            ownerIds: commitmentData.ownerIds!,
            source: commitmentData.source || 'cash',
            sourceAssetId: commitmentData.sourceAssetId,
            growthRate: commitmentData.growthRate,
            inflationRate: commitmentData.inflationRate,
            updatedAt: new Date().toISOString()
          }
        : item
    )

    onUpdateCommitments(updatedCommitments)
    setEditingId(null)
    return []
  }

  const handleDeleteCommitment = (id: string) => {
    const updatedCommitments = commitments.filter(item => item.id !== id)
    onUpdateCommitments(updatedCommitments)
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
  }

  const getOwnerNames = (ownerIds: string[]): string => {
    if (ownerIds.length === people.length && people.length > 1) {
      return 'All'
    }
    return ownerIds.map(id => people.find(p => p.id === id)?.name).filter(Boolean).join(', ')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Commitments</h2>
          <p className="text-muted-foreground mt-2">
            Manage your financial commitments including mortgages, loans, utilities, and other regular expenses
          </p>
        </div>
        <Button 
          onClick={() => setIsAdding(true)}
          disabled={isAdding || editingId !== null || people.length === 0}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Commitment
        </Button>
      </div>

      {people.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No people in plan</h3>
            <p className="text-muted-foreground text-center mb-4">
              You need to add people to your plan before you can add commitments
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add Commitment Form */}
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Commitment</CardTitle>
            <CardDescription>
              Enter the details for the new commitment. Name will be auto-generated if left blank.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CommitmentForm
              people={people}
              assets={assets}
              onSubmit={handleAddCommitment}
              onCancel={handleCancel}
              submitLabel="Add Commitment"
            />
          </CardContent>
        </Card>
      )}

      {/* Commitments List */}
      {commitments.length === 0 && !isAdding && people.length > 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No commitments added yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start by adding your first commitment to track your expenses
            </p>
            <Button onClick={() => setIsAdding(true)}>
              Add Your First Commitment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {commitments.map((item) => (
            <CommitmentCard
              key={item.id}
              commitment={item}
              people={people}
              assets={assets}
              ownerNames={getOwnerNames(item.ownerIds)}
              isEditing={editingId === item.id}
              onEdit={() => setEditingId(item.id)}
              onDelete={() => handleDeleteCommitment(item.id)}
              onSave={handleEditCommitment}
              onCancel={handleCancel}
              disabled={isAdding || (editingId !== null && editingId !== item.id)}
            />
          ))}
        </div>
      )}

      {/* Summary */}
      {commitments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Commitments Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{commitments.length}</div>
                <div className="text-sm text-muted-foreground">Total Commitments</div>
              </div>
              <div>
                <div className="text-2xl font-bold">£{calculateAnnualTotal().toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Annual Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {commitments.filter(c => c.source === 'asset').length}
                </div>
                <div className="text-sm text-muted-foreground">From Assets</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {new Set(commitments.flatMap(c => c.ownerIds)).size}
                </div>
                <div className="text-sm text-muted-foreground">Unique Payers</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
