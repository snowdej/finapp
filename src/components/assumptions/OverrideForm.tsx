import { useState } from 'react'
import { AssumptionOverride, ValidationError, Asset, Income, Commitment } from '../../types'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'

interface OverrideFormProps {
  override?: AssumptionOverride
  items: Array<(Asset | Income | Commitment) & { itemType: 'asset' | 'income' | 'commitment' }>
  onSubmit: (override: Partial<AssumptionOverride>) => ValidationError[]
  onCancel: () => void
  submitLabel: string
}

export function OverrideForm({ override, items, onSubmit, onCancel, submitLabel }: OverrideFormProps) {
  const currentYear = new Date().getFullYear()
  
  const [formData, setFormData] = useState<Partial<AssumptionOverride>>({
    entityType: override?.entityType || 'category',
    entityId: override?.entityId || '',
    category: override?.category || '',
    overrideType: override?.overrideType || 'growth',
    value: override?.value || 0,
    startYear: override?.startYear,
    endYear: override?.endYear,
    description: override?.description || ''
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

  const getUniqueCategories = () => {
    const categories = new Set<string>()
    items.forEach(item => {
      if ('type' in item) {
        categories.add(item.type) // Asset type
      } else {
        categories.add(item.itemType) // income/commitment
      }
    })
    return Array.from(categories).sort()
  }

  const getItemsForEntityType = () => {
    if (formData.entityType === 'category') return []
    
    return items.filter(item => {
      switch (formData.entityType) {
        case 'asset': return item.itemType === 'asset'
        case 'income': return item.itemType === 'income'
        case 'commitment': return item.itemType === 'commitment'
        default: return false
      }
    })
  }

  const handleEntityTypeChange = (entityType: string) => {
    setFormData({
      ...formData,
      entityType: entityType as AssumptionOverride['entityType'],
      entityId: '',
      category: ''
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="entityType">Override Target *</Label>
        <select
          id="entityType"
          value={formData.entityType || ''}
          onChange={(e) => handleEntityTypeChange(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          title="Select override target type"
          required
        >
          <option value="category">Category (all items of a type)</option>
          <option value="asset">Specific Asset</option>
          <option value="income">Specific Income</option>
          <option value="commitment">Specific Commitment</option>
        </select>
        {getFieldError('entityType') && (
          <p className="text-sm text-destructive">{getFieldError('entityType')}</p>
        )}
      </div>

      {formData.entityType === 'category' ? (
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <select
            id="category"
            value={formData.category || ''}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            title="Select category for override"
            required
          >
            <option value="">Select category</option>
            {getUniqueCategories().map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {getFieldError('category') && (
            <p className="text-sm text-destructive">{getFieldError('category')}</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="entityId">Specific Item *</Label>
          <select
            id="entityId"
            value={formData.entityId || ''}
            onChange={(e) => setFormData({ ...formData, entityId: e.target.value })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            title="Select specific item for override"
            required
          >
            <option value="">Select item</option>
            {getItemsForEntityType().map(item => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          {getFieldError('entityId') && (
            <p className="text-sm text-destructive">{getFieldError('entityId')}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="overrideType">Override Type *</Label>
          <select
            id="overrideType"
            value={formData.overrideType || ''}
            onChange={(e) => setFormData({ ...formData, overrideType: e.target.value as AssumptionOverride['overrideType'] })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            title="Select override type"
            required
          >
            <option value="growth">Growth Rate</option>
            <option value="inflation">Inflation Rate</option>
            <option value="interest">Interest Rate</option>
            <option value="tax">Tax Rate</option>
          </select>
          {getFieldError('overrideType') && (
            <p className="text-sm text-destructive">{getFieldError('overrideType')}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="value">Rate (%) *</Label>
          <Input
            id="value"
            type="number"
            step="0.1"
            value={formData.value || ''}
            onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
            required
          />
          {getFieldError('value') && (
            <p className="text-sm text-destructive">{getFieldError('value')}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startYear">Start Year (optional)</Label>
          <Input
            id="startYear"
            type="number"
            min="1900"
            max="2200"
            value={formData.startYear || ''}
            onChange={(e) => setFormData({ ...formData, startYear: parseInt(e.target.value) || undefined })}
            placeholder={`Default: ${currentYear}`}
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
            max="2200"
            value={formData.endYear || ''}
            onChange={(e) => setFormData({ ...formData, endYear: parseInt(e.target.value) || undefined })}
            placeholder="Leave blank for indefinite"
          />
          {getFieldError('endYear') && (
            <p className="text-sm text-destructive">{getFieldError('endYear')}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Optional notes about this override"
          rows={3}
        />
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