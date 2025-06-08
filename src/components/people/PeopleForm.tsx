import { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { AlertCircle, Save, X } from 'lucide-react'
import { Person, Sex, ValidationResult } from '../../types'
import { generateDefaultName } from '../../utils'

interface PeopleFormProps {
  person?: Person
  existingNames: string[]
  onSave: (person: Person) => void
  onCancel: () => void
}

export function PeopleForm({ person, existingNames, onSave, onCancel }: PeopleFormProps) {
  const [formData, setFormData] = useState<Partial<Person>>({
    id: person?.id || '',
    name: person?.name || '',
    dateOfBirth: person?.dateOfBirth || '',
    sex: person?.sex || Sex.M
  })
  
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true, errors: [] })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = (): ValidationResult => {
    const result: ValidationResult = { isValid: true, errors: [] }
    
    // Validate required fields
    if (!formData.dateOfBirth) {
      result.errors.push({ field: 'dateOfBirth', message: 'Date of birth is required' })
      result.isValid = false
    }
    
    if (!formData.sex) {
      result.errors.push({ field: 'sex', message: 'Sex is required' })
      result.isValid = false
    }
    
    // Check for duplicate names (excluding current person if editing)
    if (formData.name && existingNames.includes(formData.name) && formData.name !== person?.name) {
      result.errors.push({ field: 'name', message: 'A person with this name already exists' })
      result.isValid = false
    }
    
    return result
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const validationResult = validateForm()
    setValidation(validationResult)

    if (!validationResult.isValid) {
      setIsSubmitting(false)
      return
    }

    try {
      // Auto-generate name if blank
      let finalName = formData.name?.trim()
      if (!finalName) {
        finalName = generateDefaultName('Person', existingNames)
      }

      const personData: Person = {
        id: formData.id || `person-${Date.now()}`,
        name: finalName,
        dateOfBirth: formData.dateOfBirth!,
        sex: formData.sex!
      }

      onSave(personData)
    } catch (error) {
      console.error('Error saving person:', error)
      setValidation({ 
        isValid: false, 
        errors: [{ field: 'general', message: 'Failed to save person. Please try again.' }] 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getFieldError = (field: string) => {
    return validation.errors.find(error => error.field === field)?.message
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {person ? 'Edit Person' : 'Add New Person'}
        </CardTitle>
        <CardDescription>
          {person ? 'Update the person\'s details below.' : 'Enter the details for a new person in your plan.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General validation errors */}
          {validation.errors.some(e => e.field === 'general') && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-700 dark:text-red-300">
                {getFieldError('general')}
              </span>
            </div>
          )}

          {/* Name Field */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter name (or leave blank for auto-generated)"
              className={`w-full px-3 py-2 border rounded-md ${
                getFieldError('name') 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:border-blue-500'
              }`}
            />
            {getFieldError('name') && (
              <p className="text-sm text-red-600">{getFieldError('name')}</p>
            )}
            <p className="text-xs text-muted-foreground">
              If left blank, a unique name will be generated automatically
            </p>
          </div>

          {/* Date of Birth Field */}
          <div className="space-y-2">
            <label htmlFor="dateOfBirth" className="text-sm font-medium">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              required
              className={`w-full px-3 py-2 border rounded-md ${
                getFieldError('dateOfBirth') 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:border-blue-500'
              }`}
            />
            {getFieldError('dateOfBirth') && (
              <p className="text-sm text-red-600">{getFieldError('dateOfBirth')}</p>
            )}
          </div>

          {/* Sex Field */}
          <div className="space-y-2">
            <label htmlFor="sex" className="text-sm font-medium">
              Sex <span className="text-red-500">*</span>
            </label>
            <select
              id="sex"
              value={formData.sex}
              onChange={(e) => setFormData({ ...formData, sex: e.target.value as Sex })}
              required
              className={`w-full px-3 py-2 border rounded-md ${
                getFieldError('sex') 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:border-blue-500'
              }`}
            >
              <option value={Sex.M}>Male</option>
              <option value={Sex.F}>Female</option>
            </select>
            {getFieldError('sex') && (
              <p className="text-sm text-red-600">{getFieldError('sex')}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Saving...' : 'Save Person'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

