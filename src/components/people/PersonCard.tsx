import { useState } from 'react'
import { Person, Sex, ValidationError } from '../../types'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { PersonForm } from './PersonForm'
import { Edit, Trash2, User } from 'lucide-react'

interface PersonCardProps {
  person: Person
  age: number
  isEditing: boolean
  onEdit: () => void
  onDelete: () => void
  onSave: (person: Partial<Person>) => ValidationError[]
  onCancel: () => void
  disabled?: boolean
}

export function PersonCard({ 
  person, 
  age, 
  isEditing, 
  onEdit, 
  onDelete, 
  onSave, 
  onCancel,
  disabled 
}: PersonCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete()
      setShowDeleteConfirm(false)
    } else {
      setShowDeleteConfirm(true)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false)
  }

  if (isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Edit Person
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PersonForm
            person={person}
            onSubmit={onSave}
            onCancel={onCancel}
            submitLabel="Save"
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {person.name}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              disabled={disabled}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={disabled}
              className={showDeleteConfirm ? "text-destructive" : ""}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Age:</span> {age}
          </div>
          <div>
            <span className="font-medium">Sex:</span> {person.sex === Sex.M ? 'Male' : 'Female'}
          </div>
          <div>
            <span className="font-medium">Date of Birth:</span> {person.dateOfBirth}
          </div>
          <div>
            <span className="font-medium">Status:</span> 
            <span className={`font-medium ml-1 ${person.isChild ? 'text-orange-600' : 'text-green-600'}`}>
              {person.isChild ? 'Child' : 'Adult'}
            </span>
          </div>
        </div>
        
        {showDeleteConfirm && (
          <div className="mt-4 p-3 border border-destructive rounded-md bg-destructive/10">
            <p className="text-sm text-destructive mb-2">
              Are you sure you want to delete this person?
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={handleDelete}
              >
                Confirm
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelDelete}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
