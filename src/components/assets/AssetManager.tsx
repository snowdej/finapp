import { useState } from 'react'
import { Asset, Person } from '../../types'
import { validateAsset, generateId, calculateAge } from '../../utils/validation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { AssetForm } from './AssetForm'
import { AssetCard } from './AssetCard'
import { PiggyBank, Plus } from 'lucide-react'

interface AssetManagerProps {
  assets: Asset[]
  people: Person[]
  onUpdateAssets: (assets: Asset[]) => void
}

export function AssetManager({ assets, people, onUpdateAssets }: AssetManagerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const generateAssetName = (existingAssets: Asset[], type: string): string => {
    const existingOfType = existingAssets.filter(a => a.type === type)
    if (existingOfType.length === 0) {
      return type
    }
    return `${type} ${existingOfType.length + 1}`
  }

  const calculateTotalValue = (): number => {
    return assets.reduce((sum, asset) => {
      const netValue = asset.currentValue - (asset.loans?.reduce((loanSum, loan) => loanSum + (loan.remainingBalance || loan.amount), 0) || 0)
      return sum + netValue
    }, 0)
  }

  const handleAddAsset = (assetData: Partial<Asset>) => {
    const validation = validateAsset(assetData, people)
    if (!validation.isValid) {
      return validation.errors
    }

    const newAsset: Asset = {
      id: generateId('asset'),
      name: assetData.name?.trim() || generateAssetName(assets, assetData.type || 'Other'),
      type: assetData.type!,
      currentValue: assetData.currentValue!,
      ownerIds: assetData.ownerIds!,
      growthRate: assetData.growthRate,
      inflationRate: assetData.inflationRate,
      loans: [],
      manualOverrides: [],
      createdAt: new Date().toISOString()
    }

    onUpdateAssets([...assets, newAsset])
    setIsAdding(false)
    return []
  }

  const handleEditAsset = (assetData: Partial<Asset>) => {
    const validation = validateAsset(assetData, people)
    if (!validation.isValid) {
      return validation.errors
    }

    const updatedAssets = assets.map(asset => 
      asset.id === editingId 
        ? {
            ...asset,
            name: assetData.name?.trim() || asset.name,
            type: assetData.type!,
            currentValue: assetData.currentValue!,
            ownerIds: assetData.ownerIds!,
            growthRate: assetData.growthRate,
            inflationRate: assetData.inflationRate,
            updatedAt: new Date().toISOString()
          }
        : asset
    )

    onUpdateAssets(updatedAssets)
    setEditingId(null)
    return []
  }

  const handleDeleteAsset = (id: string) => {
    const updatedAssets = assets.filter(asset => asset.id !== id)
    onUpdateAssets(updatedAssets)
  }

  const handleUpdateAssetLoans = (assetId: string, loans: any[]) => {
    const updatedAssets = assets.map(asset =>
      asset.id === assetId
        ? { ...asset, loans, updatedAt: new Date().toISOString() }
        : asset
    )
    onUpdateAssets(updatedAssets)
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
          <h2 className="text-3xl font-bold tracking-tight">Assets</h2>
          <p className="text-muted-foreground mt-2">
            Manage your financial assets including ISAs, SIPPs, property, and investments
          </p>
        </div>
        <Button 
          onClick={() => setIsAdding(true)}
          disabled={isAdding || editingId !== null || people.length === 0}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Asset
        </Button>
      </div>

      {people.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <PiggyBank className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No people in plan</h3>
            <p className="text-muted-foreground text-center mb-4">
              You need to add people to your plan before you can add assets
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add Asset Form */}
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Asset</CardTitle>
            <CardDescription>
              Enter the details for the new asset. Name will be auto-generated if left blank.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AssetForm
              people={people}
              onSubmit={handleAddAsset}
              onCancel={handleCancel}
              submitLabel="Add Asset"
            />
          </CardContent>
        </Card>
      )}

      {/* Assets List */}
      {assets.length === 0 && !isAdding && people.length > 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <PiggyBank className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No assets added yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start by adding your first asset to track your financial portfolio
            </p>
            <Button onClick={() => setIsAdding(true)}>
              Add Your First Asset
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              people={people}
              ownerNames={getOwnerNames(asset.ownerIds)}
              isEditing={editingId === asset.id}
              onEdit={() => setEditingId(asset.id)}
              onDelete={() => handleDeleteAsset(asset.id)}
              onSave={handleEditAsset}
              onCancel={handleCancel}
              onUpdateLoans={(loans) => handleUpdateAssetLoans(asset.id, loans)}
              disabled={isAdding || (editingId !== null && editingId !== asset.id)}
            />
          ))}
        </div>
      )}

      {/* Summary */}
      {assets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Assets Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{assets.length}</div>
                <div className="text-sm text-muted-foreground">Total Assets</div>
              </div>
              <div>
                <div className="text-2xl font-bold">£{calculateTotalValue().toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Net Value</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {assets.filter(a => a.loans && a.loans.length > 0).length}
                </div>
                <div className="text-sm text-muted-foreground">With Loans</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {new Set(assets.flatMap(a => a.ownerIds)).size}
                </div>
                <div className="text-sm text-muted-foreground">Unique Owners</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
