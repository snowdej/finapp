import { useState } from 'react'
import { Person, Sex } from '../../types'
import { validatePerson, generateId, calculateAge, generateDefaultName } from '../../utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { PersonForm } from './PersonForm'
import { PeopleList } from './PeopleList'
import { Users, Plus } from 'lucide-react'

interface PeopleManagerProps {
  people: Person[]
  onUpdatePeople: (people: Person[]) => void
}

export function PeopleManager({ people, onUpdatePeople }: PeopleManagerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingPerson, setEditingPerson] = useState<Person | null>(null)

  const handleAddPerson = (personData: Partial<Person>) => {
    const validation = validatePerson(personData)
    if (!validation.isValid) {
      return validation.errors
    }

    const newPerson: Person = {
      id: generateId('person'),
      name: personData.name?.trim() || generateDefaultName('Person', people.map(p => p.name)),
      dateOfBirth: personData.dateOfBirth!,
      sex: personData.sex!
    }

    onUpdatePeople([...people, newPerson])
    setIsAdding(false)
    return []
  }

  const handleEditPerson = (personData: Partial<Person>) => {
    if (!editingPerson) return []

    const validation = validatePerson(personData)
    if (!validation.isValid) {
      return validation.errors
    }

    const updatedPeople = people.map(person => 
      person.id === editingPerson.id 
        ? {
            ...person,
            name: personData.name?.trim() || person.name,
            dateOfBirth: personData.dateOfBirth!,
            sex: personData.sex!
          }
        : person
    )

    onUpdatePeople(updatedPeople)
    setEditingPerson(null)
    return []
  }

  const handleDeletePerson = (id: string) => {
    const updatedPeople = people.filter(person => person.id !== id)
    onUpdatePeople(updatedPeople)
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingPerson(null)
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
          disabled={isAdding || editingPerson !== null}
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

      {/* Edit Person Form */}
      {editingPerson && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Person</CardTitle>
            <CardDescription>
              Update the person's details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PersonForm
              person={editingPerson}
              onSubmit={handleEditPerson}
              onCancel={handleCancel}
              submitLabel="Save"
            />
          </CardContent>
        </Card>
      )}

      {/* People List or Empty State */}
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
      ) : people.length > 0 && !isAdding && !editingPerson ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {people.map((person) => (
            <Card key={person.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{person.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingPerson(person)}
                      disabled={isAdding || editingPerson !== null}
                      aria-label={`Edit ${person.name}`}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePerson(person.id)}
                      disabled={isAdding || editingPerson !== null}
                      aria-label={`Delete ${person.name}`}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div data-testid={`age-${person.id}`}>
                    <span className="font-medium">Age:</span> {calculateAge(person.dateOfBirth)}
                  </div>
                  <div>
                    <span className="font-medium">Sex:</span> {person.sex === Sex.M ? 'Male' : 'Female'}
                  </div>
                  <div>
                    <span className="font-medium">Date of Birth:</span> {new Date(person.dateOfBirth).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

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