import { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Edit, Trash2, Users, Calendar, UserCheck, UserX } from 'lucide-react'
import { Person } from '../../types'
import { calculateAge, formatDate } from '../../utils'

interface PeopleListProps {
  people: Person[]
  onEdit: (person: Person) => void
  onDelete: (personId: string) => void
}

export function PeopleList({ people, onEdit, onDelete }: PeopleListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const handleDeleteClick = (personId: string) => {
    setDeleteConfirm(personId)
  }

  const handleDeleteConfirm = (personId: string) => {
    onDelete(personId)
    setDeleteConfirm(null)
  }

  const handleDeleteCancel = () => {
    setDeleteConfirm(null)
  }

  if (people.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No People Added</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Start building your financial plan by adding the people who will be included.
            You can add family members, dependants, or anyone relevant to your financial planning.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            People in Plan ({people.length})
          </CardTitle>
          <CardDescription>
            Manage the people included in your financial planning
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {people.map((person) => {
          const age = calculateAge(person.dateOfBirth)
          const isDeleting = deleteConfirm === person.id

          return (
            <Card key={person.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {person.isChild ? (
                      <UserX className="h-4 w-4 text-orange-500" />
                    ) : (
                      <UserCheck className="h-4 w-4 text-green-500" />
                    )}
                    <CardTitle className="text-lg">{person.name}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(person)}
                      disabled={isDeleting}
                      aria-label={`Edit ${person.name}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(person.id)}
                      disabled={isDeleting}
                      aria-label={`Delete ${person.name}`}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Born {formatDate(person.dateOfBirth)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Age:</span>
                    <span className="font-medium">{age} years old</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Sex:</span>
                    <span className="font-medium">{person.sex === 'M' ? 'Male' : 'Female'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`font-medium ${person.isChild ? 'text-orange-600' : 'text-green-600'}`}>
                      {person.isChild ? 'Child' : 'Adult'}
                    </span>
                  </div>
                </div>

                {/* Delete Confirmation */}
                {isDeleting && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                      Are you sure you want to delete {person.name}? This action cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleDeleteConfirm(person.id)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Delete
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleDeleteCancel}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
