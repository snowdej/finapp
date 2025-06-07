import { useState } from 'react'
import { Person, Sex } from '../../types'
import { validatePerson } from '../../utils/validation'
import { generateId, calculateAge, generateDefaultName } from '../../utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { PersonForm } from './PersonForm'
import { PersonCard } from './PersonCard'
import { Users, Plus } from 'lucide-react'

interface PeopleManagerProps {
  people: Person[]
  onUpdatePeople: (people: Person[]) => void
}

export function PeopleManager({ people, onUpdatePeople }: PeopleManagerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const generatePersonName = (existingPeople: Person[]): string => {
    const existingNames = existingPeople.map(p => p.name)
    return generateDefaultName('Person', existingNames)
  }

  const handleAddPerson = (personData: Partial<Person>) => {
    const validation = validatePerson(personData)
    if (!validation.isValid) {
      return validation.errors
    }

    const newPerson: Person = {
      id: generateId('person'),
      name: personData.name?.trim() || generatePersonName(people),
      dateOfBirth: personData.dateOfBirth!,
      sex: personData.sex!
    }

    onUpdatePeople([...people, newPerson])
    setIsAdding(false)
    return []
  }

  const handleEditPerson = (personData: Partial<Person>) => {
    const validation = validatePerson(personData)
    if (!validation.isValid) {
      return validation.errors
    }

    const updatedPeople = people.map(person => 
      person.id === editingId 
        ? {
            ...person,
            name: personData.name?.trim() || person.name,
            dateOfBirth: personData.dateOfBirth!,
            sex: personData.sex!
          }
        : person
    )

    onUpdatePeople(updatedPeople)
    setEditingId(null)
    return []
  }

  const handleDeletePerson = (id: string) => {
    const updatedPeople = people.filter(person => person.id !== id)
    onUpdatePeople(updatedPeople)
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">People</h2>
          <p className="text-muted-foreground mt-2">
            Manage the people in your financial plan
          </p>
        </div>
        <Button 
          onClick={() => setIsAdding(true)}
          disabled={isAdding || editingId !== null}
          className="flex items-center gap-2"
          data-testid="main-add-person-button"
        >
          <Plus className="h-4 w-4" />
          Add Person
        </Button>
      </div>

      {/* Add Person Form */}
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Person</CardTitle>
            <CardDescription>
              Enter the details for the new person. Name will be auto-generated if left blank.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PersonForm
              onSubmit={handleAddPerson}
              onCancel={handleCancel}
              submitLabel="Add Person"
            />
          </CardContent>
        </Card>
      )}

      {/* People List */}
      {people.length === 0 && !isAdding ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No people added yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start by adding the people who are part of your financial plan
            </p>
            <Button 
              onClick={() => setIsAdding(true)}
              data-testid="empty-state-add-person-button"
            >
              Add Your First Person
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {people.map((person) => (
            <PersonCard
              key={person.id}
              person={person}
              age={calculateAge(person.dateOfBirth)}
              isEditing={editingId === person.id}
              onEdit={() => setEditingId(person.id)}
              onDelete={() => handleDeletePerson(person.id)}
              onSave={handleEditPerson}
              onCancel={handleCancel}
              disabled={isAdding || (editingId !== null && editingId !== person.id)}
            />
          ))}
        </div>
      )}

      {/* Summary */}
      {people.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div data-testid="summary-total">
                <div className="text-2xl font-bold">{people.length}</div>
                <div className="text-sm text-muted-foreground">Total People</div>
              </div>
              <div data-testid="summary-male">
                <div className="text-2xl font-bold">
                  {people.filter(p => p.sex === Sex.M).length}
                </div>
                <div className="text-sm text-muted-foreground">Male</div>
              </div>
              <div data-testid="summary-female">
                <div className="text-2xl font-bold">
                  {people.filter(p => p.sex === Sex.F).length}
                </div>
                <div className="text-sm text-muted-foreground">Female</div>
              </div>
              <div data-testid="summary-avg-age">
                <div className="text-2xl font-bold">
                  {people.length > 0 
                    ? Math.round(people.reduce((sum, p) => sum + calculateAge(p.dateOfBirth), 0) / people.length)
                    : 0
                  }
                </div>
                <div className="text-sm text-muted-foreground">Avg Age</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}