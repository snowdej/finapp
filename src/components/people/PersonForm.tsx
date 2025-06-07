import { useState } from 'react'
import { Person, Sex, ValidationError } from '../../types'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

interface PersonFormProps {
  person?: Person
  onSubmit: (person: Partial<Person>) => ValidationError[]
  onCancel: () => void
  submitLabel: string
}

export function PersonForm({ person, onSubmit, onCancel, submitLabel }: PersonFormProps) {
  const [formData, setFormData] = useState<Partial<Person>>({
    name: person?.name || '',
    dateOfBirth: person?.dateOfBirth || '',
    sex: person?.sex || undefined
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
        <Label htmlFor="dateOfBirth">Date of Birth *</Label>
        <Input
          id="dateOfBirth"
          type="date"
          value={formData.dateOfBirth || ''}
          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
          required
        />
        {getFieldError('dateOfBirth') && (
          <p className="text-sm text-destructive">{getFieldError('dateOfBirth')}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="sex">Sex *</Label>
        <select
          id="sex"
          value={formData.sex || ''}
          onChange={(e) => setFormData({ ...formData, sex: e.target.value as Sex })}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Sex"
          required
        >
          <option value="">Select sex</option>
          <option value={Sex.M}>Male</option>
          <option value={Sex.F}>Female</option>
        </select>
        {getFieldError('sex') && (
          <p className="text-sm text-destructive">{getFieldError('sex')}</p>
        )}
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
