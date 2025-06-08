import { useState } from 'react'
import { Event, Person, Asset, ValidationError } from '../../types'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'

interface EventFormProps {
  event?: Event
  people: Person[]
  assets: Asset[]
  onSubmit: (event: Partial<Event>) => ValidationError[]
  onCancel: () => void
  submitLabel: string
}

export function EventForm({ event, people, assets, onSubmit, onCancel, submitLabel }: EventFormProps) {
  const currentYear = new Date().getFullYear()
  
  const [formData, setFormData] = useState<Partial<Event>>({
    name: event?.name || '',
    year: event?.year || currentYear,
    amount: event?.amount || 0,
    type: event?.type || 'other',
    description: event?.description || '',
    affectedPersonIds: event?.affectedPersonIds || [],
    linkedAssetId: event?.linkedAssetId || '',
    isRecurring: event?.isRecurring || false,
    recurringEndYear: event?.recurringEndYear
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

  const handlePersonChange = (personId: string, checked: boolean) => {
    const currentPersons = formData.affectedPersonIds || []
    if (checked) {
      setFormData({ ...formData, affectedPersonIds: [...currentPersons, personId] })
    } else {
      setFormData({ ...formData, affectedPersonIds: currentPersons.filter(id => id !== personId) })
    }
  }

  const handleSelectAllPersons = () => {
    const allSelected = formData.affectedPersonIds?.length === people.length
    setFormData({ 
      ...formData, 
      affectedPersonIds: allSelected ? [] : people.map(p => p.id) 
    })
  }

  const getEventTypeLabel = (type: string): string => {
    switch (type) {
      case 'income': return 'Income'
      case 'expense': return 'Expense'
      case 'asset_change': return 'Asset Change'
      case 'withdrawal': return 'Withdrawal'
      case 'deposit': return 'Deposit'
      case 'inheritance': return 'Inheritance'
      default: return 'Other'
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Event Name (optional)</Label>
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
          <Label htmlFor="year">Year *</Label>
          <Input
            id="year"
            type="number"
            min="1900"
            max="2200"
            value={formData.year || ''}
            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || currentYear })}
            required
          />
          {getFieldError('year') && (
            <p className="text-sm text-destructive">{getFieldError('year')}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount (£) *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={formData.amount || ''}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            placeholder="Positive for income, negative for expense"
            required
          />
          {getFieldError('amount') && (
            <p className="text-sm text-destructive">{getFieldError('amount')}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Event Type *</Label>
        <select
          id="type"
          title="Select event type"
          value={formData.type || ''}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as Event['type'] })}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          required
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
          <option value="asset_change">Asset Change</option>
          <option value="withdrawal">Withdrawal</option>
          <option value="deposit">Deposit</option>
          <option value="inheritance">Inheritance</option>
          <option value="other">Other</option>
        </select>
        {getFieldError('type') && (
          <p className="text-sm text-destructive">{getFieldError('type')}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Additional details about this event"
          rows={3}
        />
      </div>

      {/* Recurring Event */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isRecurring"
            checked={formData.isRecurring || false}
            onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
            className="rounded border-gray-300"
            aria-label="Recurring event"
          />
          <Label htmlFor="isRecurring">Recurring event</Label>
        </div>
        
        {formData.isRecurring && (
          <div className="ml-6 space-y-2">
            <Label htmlFor="recurringEndYear">End Year (optional)</Label>
            <Input
              id="recurringEndYear"
              type="number"
              min="1900"
              max="2200"
              value={formData.recurringEndYear || ''}
              onChange={(e) => setFormData({ ...formData, recurringEndYear: parseInt(e.target.value) || undefined })}
              placeholder="Leave blank for indefinite"
            />
            {getFieldError('recurringEndYear') && (
              <p className="text-sm text-destructive">{getFieldError('recurringEndYear')}</p>
            )}
          </div>
        )}
      </div>

      {/* Affected People */}
      {people.length > 0 && (
        <div className="space-y-2">
          <Label>Affected People (optional)</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="select-all-persons"
                checked={formData.affectedPersonIds?.length === people.length}
                onChange={handleSelectAllPersons}
                className="rounded border-gray-300"
                title="Select all people"
              />
              <Label htmlFor="select-all-persons" className="text-sm font-medium">
                Select All ({people.length} people)
              </Label>
            </div>
            {people.map((person) => (
              <div key={person.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`event-person-${person.id}`}
                  checked={formData.affectedPersonIds?.includes(person.id) || false}
                  onChange={(e) => handlePersonChange(person.id, e.target.checked)}
                  className="rounded border-gray-300"
                  aria-label={`Select ${person.name}`}
                />
                <Label htmlFor={`event-person-${person.id}`} className="text-sm">
                  {person.name}
                </Label>
              </div>
            ))}
          </div>
          {getFieldError('affectedPersonIds') && (
            <p className="text-sm text-destructive">{getFieldError('affectedPersonIds')}</p>
          )}
        </div>
      )}

      {/* Linked Asset */}
      {assets.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="linkedAsset">Linked Asset (optional)</Label>
          <select
            id="linkedAsset"
            title="Select linked asset"
            value={formData.linkedAssetId || ''}
            onChange={(e) => setFormData({ ...formData, linkedAssetId: e.target.value })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">No linked asset</option>
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.name} ({asset.type})
              </option>
            ))}
          </select>
          {getFieldError('linkedAssetId') && (
            <p className="text-sm text-destructive">{getFieldError('linkedAssetId')}</p>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button type="submit">{submitLabel}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
