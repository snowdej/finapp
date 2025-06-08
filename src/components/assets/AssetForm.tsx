import { useState } from 'react'
import { Asset, Person, ValidationError } from '../../types'
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
    type: asset?.type || 'ISA',
    currentValue: asset?.currentValue || 0,
    ownerIds: asset?.ownerIds || [],
    growthRate: asset?.growthRate || 5,
    inflationRate: asset?.inflationRate || 2.5
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
    const currentOwners = formData.ownerIds || []
    if (checked) {
      setFormData({ ...formData, ownerIds: [...currentOwners, personId] })
    } else {
      setFormData({ ...formData, ownerIds: currentOwners.filter(id => id !== personId) })
    }
  }

  const handleSelectAllOwners = () => {
    const allSelected = formData.ownerIds?.length === people.length
    setFormData({ 
      ...formData, 
      ownerIds: allSelected ? [] : people.map(p => p.id) 
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Asset Name (optional)</Label>
        <Input
          id="name"
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Will be auto-generated based on type"
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
          onChange={(e) => setFormData({ ...formData, type: e.target.value as Asset['type'] })}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          title="Select asset type"
          required
        >
          <option value="ISA">ISA</option>
          <option value="SIPP">SIPP</option>
          <option value="Property">Property</option>
          <option value="Stocks">Stocks</option>
          <option value="Bonds">Bonds</option>
          <option value="Cash">Cash</option>
          <option value="Other">Other</option>
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
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="select-all"
              checked={formData.ownerIds?.length === people.length}
              onChange={handleSelectAllOwners}
              className="rounded border-gray-300"
              title="Select all people as owners"
            />
            <Label htmlFor="select-all" className="text-sm font-medium">
              Select All ({people.length} people)
            </Label>
          </div>
          {people.map((person) => (
            <div key={person.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`owner-${person.id}`}
                checked={formData.ownerIds?.includes(person.id) || false}
                onChange={(e) => handleOwnerChange(person.id, e.target.checked)}
                className="rounded border-gray-300"
                title={`Select ${person.name} as owner`}
              />
              <Label htmlFor={`owner-${person.id}`} className="text-sm">
                {person.name}
              </Label>
            </div>
          ))}
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
            placeholder="5.0"
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
            placeholder="2.5"
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
