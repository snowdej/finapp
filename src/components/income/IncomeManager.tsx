import { useState } from 'react'
import { Income, Person, Asset } from '../../types'
import { validateIncome, generateId } from '../../utils/validation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { IncomeForm } from './IncomeForm.tsx'
import { IncomeCard } from './IncomeCard.tsx'
import { Wallet, Plus } from 'lucide-react'

interface IncomeManagerProps {
  income: Income[]
  people: Person[]
  assets: Asset[]
  onUpdateIncome: (income: Income[]) => void
}

export function IncomeManager({ income, people, assets, onUpdateIncome }: IncomeManagerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const generateIncomeName = (existingIncome: Income[]): string => {
    const count = existingIncome.length + 1
    return `Income ${count}`
  }

  const calculateAnnualTotal = (): number => {
    return income.reduce((sum, item) => {
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

  const handleAddIncome = (incomeData: Partial<Income>) => {
    const validation = validateIncome(incomeData, people, assets)
    if (!validation.isValid) {
      return validation.errors
    }

    const newIncome: Income = {
      id: generateId('income'),
      name: incomeData.name?.trim() || generateIncomeName(income),
      amount: incomeData.amount!,
      frequency: incomeData.frequency!,
      startYear: incomeData.startYear!,
      endYear: incomeData.endYear,
      ownerIds: incomeData.ownerIds!,
      destination: incomeData.destination || 'cash',
      destinationAssetId: incomeData.destinationAssetId,
      growthRate: incomeData.growthRate,
      inflationRate: incomeData.inflationRate,
      createdAt: new Date().toISOString()
    }

    onUpdateIncome([...income, newIncome])
    setIsAdding(false)
    return []
  }

  const handleEditIncome = (incomeData: Partial<Income>) => {
    const validation = validateIncome(incomeData, people, assets)
    if (!validation.isValid) {
      return validation.errors
    }

    const updatedIncome = income.map(item => 
      item.id === editingId 
        ? {
            ...item,
            name: incomeData.name?.trim() || item.name,
            amount: incomeData.amount!,
            frequency: incomeData.frequency!,
            startYear: incomeData.startYear!,
            endYear: incomeData.endYear,
            ownerIds: incomeData.ownerIds!,
            destination: incomeData.destination || 'cash',
            destinationAssetId: incomeData.destinationAssetId,
            growthRate: incomeData.growthRate,
            inflationRate: incomeData.inflationRate,
            updatedAt: new Date().toISOString()
          }
        : item
    )

    onUpdateIncome(updatedIncome)
    setEditingId(null)
    return []
  }

  const handleDeleteIncome = (id: string) => {
    const updatedIncome = income.filter(item => item.id !== id)
    onUpdateIncome(updatedIncome)
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
          <h2 className="text-3xl font-bold tracking-tight">Income</h2>
          <p className="text-muted-foreground mt-2">
            Manage your income sources including salaries, benefits, and other regular income
          </p>
        </div>
        <Button 
          onClick={() => setIsAdding(true)}
          disabled={isAdding || editingId !== null || people.length === 0}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Income
        </Button>
      </div>

      {people.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No people in plan</h3>
            <p className="text-muted-foreground text-center mb-4">
              You need to add people to your plan before you can add income
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add Income Form */}
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Income</CardTitle>
            <CardDescription>
              Enter the details for the new income source. Name will be auto-generated if left blank.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IncomeForm
              people={people}
              assets={assets}
              onSubmit={handleAddIncome}
              onCancel={handleCancel}
              submitLabel="Add Income"
            />
          </CardContent>
        </Card>
      )}

      {/* Income List */}
      {income.length === 0 && !isAdding && people.length > 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No income sources added yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start by adding your first income source to track your earnings
            </p>
            <Button onClick={() => setIsAdding(true)}>
              Add Your First Income
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {income.map((item) => (
            <IncomeCard
              key={item.id}
              income={item}
              people={people}
              assets={assets}
              ownerNames={getOwnerNames(item.ownerIds)}
              isEditing={editingId === item.id}
              onEdit={() => setEditingId(item.id)}
              onDelete={() => handleDeleteIncome(item.id)}
              onSave={handleEditIncome}
              onCancel={handleCancel}
              disabled={isAdding || (editingId !== null && editingId !== item.id)}
            />
          ))}
        </div>
      )}

      {/* Summary */}
      {income.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Income Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{income.length}</div>
                <div className="text-sm text-muted-foreground">Income Sources</div>
              </div>
              <div>
                <div className="text-2xl font-bold">£{calculateAnnualTotal().toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Annual Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {income.filter(i => i.destination === 'asset').length}
                </div>
                <div className="text-sm text-muted-foreground">To Assets</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {new Set(income.flatMap(i => i.ownerIds)).size}
                </div>
                <div className="text-sm text-muted-foreground">Unique Earners</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
