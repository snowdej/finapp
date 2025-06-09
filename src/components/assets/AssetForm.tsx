import { useState } from 'react'
import { Asset, Person, AssetType, ValidationError } from '../../types'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

interface AssetFormProps {
  asset?: Asset
  people: Person[]
  onSubmit: (asset: Partial<Asset>) => ValidationError[]
  onCancel: () => void
  submitLabel: string
}

export function AssetForm({ asset, people, onSubmit, onCancel, submitLabel }: AssetFormProps) {
  const [formData, setFormData] = useState<Partial<Asset>>({
    name: asset?.name || '',
    type: asset?.type || undefined,
    currentValue: asset?.currentValue || 0,
    ownerIds: asset?.ownerIds || [],
    growthRate: asset?.growthRate,
    inflationRate: asset?.inflationRate
  })
  const [errors, setErrors] = useState<ValidationError[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const validationErrors = onSubmit(formData)
    setErrors(validationErrors)
  }

  const getFieldError = (field: string) => {
    return errors.find(error => error.field === field)?.message
  }

  const handleOwnerChange = (personId: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        ownerIds: [...(formData.ownerIds || []), personId]
      })
    } else {
      setFormData({
        ...formData,
        ownerIds: (formData.ownerIds || []).filter(id => id !== personId)
      })
    }
  }

  const selectAllOwners = () => {
    setFormData({
      ...formData,
      ownerIds: people.map(p => p.id)
    })
  }

  const clearAllOwners = () => {
    setFormData({
      ...formData,
      ownerIds: []
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name (optional)</Label>
        <Input
          id="name"
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Will be auto-generated if left blank"
        />
        {getFieldError('name') && (
          <p className="text-sm text-destructive">{getFieldError('name')}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Asset Type *</Label>
        <select
          id="type"
          value={formData.type || ''}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as AssetType })}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          title="Select asset type"
          required
        >
          <option value="">Select asset type</option>
          <option value={AssetType.ISA}>ISA</option>
          <option value={AssetType.SIPP}>SIPP</option>
          <option value={AssetType.Property}>Property</option>
          <option value={AssetType.Savings}>Savings</option>
          <option value={AssetType.Investment}>Investment</option>
          <option value={AssetType.Pension}>Pension</option>
          <option value={AssetType.Other}>Other</option>
        </select>
        {getFieldError('type') && (
          <p className="text-sm text-destructive">{getFieldError('type')}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="currentValue">Current Value (£) *</Label>
        <Input
          id="currentValue"
          type="number"
          min="0"
          step="0.01"
          value={formData.currentValue || ''}
          onChange={(e) => setFormData({ ...formData, currentValue: parseFloat(e.target.value) || 0 })}
          required
        />
        {getFieldError('currentValue') && (
          <p className="text-sm text-destructive">{getFieldError('currentValue')}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Owners *</Label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={selectAllOwners}
            >
              Select All
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearAllOwners}
            >
              Clear All
            </Button>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-2">
            {people.map((person) => (
              <div key={person.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`owner-${person.id}`}
                  checked={(formData.ownerIds || []).includes(person.id)}
                  onChange={(e) => handleOwnerChange(person.id, e.target.checked)}
                  className="rounded"
                />
                <label htmlFor={`owner-${person.id}`} className="text-sm">
                  {person.name}
                </label>
              </div>
            ))}
          </div>
        </div>
        {getFieldError('ownerIds') && (
          <p className="text-sm text-destructive">{getFieldError('ownerIds')}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="growthRate">Growth Rate (% per year)</Label>
          <Input
            id="growthRate"
            type="number"
            step="0.1"
            value={formData.growthRate || ''}
            onChange={(e) => setFormData({ ...formData, growthRate: parseFloat(e.target.value) || undefined })}
            placeholder="Leave blank for default"
          />
          {getFieldError('growthRate') && (
            <p className="text-sm text-destructive">{getFieldError('growthRate')}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="inflationRate">Inflation Rate (% per year)</Label>
          <Input
            id="inflationRate"
            type="number"
            step="0.1"
            value={formData.inflationRate || ''}
            onChange={(e) => setFormData({ ...formData, inflationRate: parseFloat(e.target.value) || undefined })}
            placeholder="Leave blank for default"
          />
          {getFieldError('inflationRate') && (
            <p className="text-sm text-destructive">{getFieldError('inflationRate')}</p>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit">{submitLabel}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
