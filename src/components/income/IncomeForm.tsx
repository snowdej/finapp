import { useState } from 'react'
import { Income, Person, Asset, ValidationError } from '../../types'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { getCurrentYear } from '../../utils'

interface IncomeFormProps {
  income?: Income
  people: Person[]
  assets: Asset[]
  onSubmit: (income: Partial<Income>) => ValidationError[]
  onCancel: () => void
  submitLabel: string
}

export function IncomeForm({ income, people, assets, onSubmit, onCancel, submitLabel }: IncomeFormProps) {
  const currentYear = getCurrentYear()
  
  const [formData, setFormData] = useState<Partial<Income>>({
    name: income?.name || '',
    amount: income?.amount || 0,
    frequency: income?.frequency || 'monthly',
    startYear: income?.startYear || currentYear,
    endYear: income?.endYear,
    ownerIds: income?.ownerIds || [],
    destination: income?.destination || 'cash',
    destinationAssetId: income?.destinationAssetId,
    growthRate: income?.growthRate || 3,
    inflationRate: income?.inflationRate || 2.5
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
        <Label htmlFor="name">Income Name (optional)</Label>
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (£) *</Label>
          <Input
            id="amount"
            type="number"
            min="0"
            step="0.01"
            value={formData.amount || ''}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            required
          />
          {getFieldError('amount') && (
            <p className="text-sm text-destructive">{getFieldError('amount')}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="frequency">Frequency *</Label>
          <select
            id="frequency"
            value={formData.frequency || ''}
            onChange={(e) => setFormData({ ...formData, frequency: e.target.value as Income['frequency'] })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            title="Select the frequency of income payments"
            required
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="annually">Annually</option>
          </select>
          {getFieldError('frequency') && (
            <p className="text-sm text-destructive">{getFieldError('frequency')}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startYear">Start Year *</Label>
          <Input
            id="startYear"
            type="number"
            min="1900"
            max="2100"
            value={formData.startYear || ''}
            onChange={(e) => setFormData({ ...formData, startYear: parseInt(e.target.value) || currentYear })}
            required
          />
          {getFieldError('startYear') && (
            <p className="text-sm text-destructive">{getFieldError('startYear')}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endYear">End Year (optional)</Label>
          <Input
            id="endYear"
            type="number"
            min="1900"
            max="2100"
            value={formData.endYear || ''}
            onChange={(e) => setFormData({ ...formData, endYear: parseInt(e.target.value) || undefined })}
            placeholder="Ongoing if not specified"
          />
          {getFieldError('endYear') && (
            <p className="text-sm text-destructive">{getFieldError('endYear')}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Owners *</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="select-all-income"
              checked={formData.ownerIds?.length === people.length}
              onChange={handleSelectAllOwners}
              className="rounded border-gray-300"
              title="Select all people as owners of this income"
            />
            <Label htmlFor="select-all-income" className="text-sm font-medium">
              Select All ({people.length} people)
            </Label>
          </div>
          {people.map((person) => (
            <div key={person.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`income-owner-${person.id}`}
                checked={formData.ownerIds?.includes(person.id) || false}
                onChange={(e) => handleOwnerChange(person.id, e.target.checked)}
                className="rounded border-gray-300"
                title={`Select ${person.name} as an owner of this income`}
              />
              <Label htmlFor={`income-owner-${person.id}`} className="text-sm">
                {person.name}
              </Label>
            </div>
          ))}
        </div>
        {getFieldError('ownerIds') && (
          <p className="text-sm text-destructive">{getFieldError('ownerIds')}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="destination">Destination</Label>
        <select
          id="destination"
          value={formData.destination || 'cash'}
          onChange={(e) => setFormData({ ...formData, destination: e.target.value as Income['destination'], destinationAssetId: undefined })}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          title="Select where the income should be deposited"
        >
          <option value="cash">Cash</option>
          <option value="asset">Specific Asset</option>
          <option value="external">External Account</option>
        </select>
      </div>

      {formData.destination === 'asset' && (
        <div className="space-y-2">
          <Label htmlFor="destinationAsset">Destination Asset</Label>
          <select
            id="destinationAsset"
            value={formData.destinationAssetId || ''}
            onChange={(e) => setFormData({ ...formData, destinationAssetId: e.target.value })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            title="Select the destination asset for this income"
          >
            <option value="">Select asset</option>
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.name} ({asset.type})
              </option>
            ))}
          </select>
          {getFieldError('destinationAssetId') && (
            <p className="text-sm text-destructive">{getFieldError('destinationAssetId')}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="growthRate">Growth Rate (% per year)</Label>
          <Input
            id="growthRate"
            type="number"
            step="0.1"
            value={formData.growthRate || ''}
            onChange={(e) => setFormData({ ...formData, growthRate: parseFloat(e.target.value) || undefined })}
            placeholder="3.0"
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