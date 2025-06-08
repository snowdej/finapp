import { useState } from 'react'
import { Event, Person, Asset } from '../../types'
import { validateEvent, generateId } from '../../utils/validation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { EventForm } from './EventForm.tsx'
import { EventCard } from './EventCard.tsx'
import { EventTimeline } from './EventTimeline.tsx'
import { Calendar, Plus, Clock } from 'lucide-react'

interface EventManagerProps {
  events: Event[]
  people: Person[]
  assets: Asset[]
  onUpdateEvents: (events: Event[]) => void
}

export function EventManager({ events, people, assets, onUpdateEvents }: EventManagerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'cards' | 'timeline'>('cards')

  const generateEventName = (existingEvents: Event[]): string => {
    const count = existingEvents.length + 1
    return `Event ${count}`
  }

  const getUpcomingEventsCount = (): number => {
    const currentYear = new Date().getFullYear()
    return events.filter(event => event.year >= currentYear).length
  }

  const getTotalEventValue = (): number => {
    return events.reduce((sum, event) => {
      let eventValue = event.amount
      if (event.isRecurring && event.recurringEndYear) {
        const years = event.recurringEndYear - event.year + 1
        eventValue *= years
      }
      return sum + eventValue
    }, 0)
  }

  const handleAddEvent = (eventData: Partial<Event>) => {
    const validation = validateEvent(eventData, people, assets)
    if (!validation.isValid) {
      return validation.errors
    }

    const newEvent: Event = {
      id: generateId('event'),
      name: eventData.name?.trim() || generateEventName(events),
      year: eventData.year!,
      amount: eventData.amount!,
      type: eventData.type!,
      description: eventData.description,
      affectedPersonIds: eventData.affectedPersonIds,
      linkedAssetId: eventData.linkedAssetId,
      isRecurring: eventData.isRecurring || false,
      recurringEndYear: eventData.recurringEndYear,
      createdAt: new Date().toISOString()
    }

    onUpdateEvents([...events, newEvent])
    setIsAdding(false)
    return []
  }

  const handleEditEvent = (eventData: Partial<Event>) => {
    const validation = validateEvent(eventData, people, assets)
    if (!validation.isValid) {
      return validation.errors
    }

    const updatedEvents = events.map(event => 
      event.id === editingId 
        ? {
            ...event,
            name: eventData.name?.trim() || event.name,
            year: eventData.year!,
            amount: eventData.amount!,
            type: eventData.type!,
            description: eventData.description,
            affectedPersonIds: eventData.affectedPersonIds,
            linkedAssetId: eventData.linkedAssetId,
            isRecurring: eventData.isRecurring || false,
            recurringEndYear: eventData.recurringEndYear,
            updatedAt: new Date().toISOString()
          }
        : event
    )

    onUpdateEvents(updatedEvents)
    setEditingId(null)
    return []
  }

  const handleDeleteEvent = (id: string) => {
    const updatedEvents = events.filter(event => event.id !== id)
    onUpdateEvents(updatedEvents)
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
  }

  const getAffectedPersonNames = (personIds: string[]): string => {
    if (!personIds || personIds.length === 0) return 'None'
    if (personIds.length === people.length && people.length > 1) {
      return 'All'
    }
    return personIds.map(id => people.find(p => p.id === id)?.name).filter(Boolean).join(', ')
  }

  const getLinkedAssetName = (assetId?: string): string => {
    if (!assetId) return 'None'
    const asset = assets.find(a => a.id === assetId)
    return asset ? `${asset.name} (${asset.type})` : 'Unknown Asset'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Events</h2>
          <p className="text-muted-foreground mt-2">
            Manage future events that will impact your financial plan
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="rounded-r-none"
            >
              <Calendar className="h-4 w-4 mr-1" />
              Cards
            </Button>
            <Button
              variant={viewMode === 'timeline' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('timeline')}
              className="rounded-l-none border-l"
            >
              <Clock className="h-4 w-4 mr-1" />
              Timeline
            </Button>
          </div>
          <Button 
            onClick={() => setIsAdding(true)}
            disabled={isAdding || editingId !== null}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Add Event Form */}
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Event</CardTitle>
            <CardDescription>
              Enter the details for the new event. Name will be auto-generated if left blank.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EventForm
              people={people}
              assets={assets}
              onSubmit={handleAddEvent}
              onCancel={handleCancel}
              submitLabel="Add Event"
            />
          </CardContent>
        </Card>
      )}

      {/* Events Display */}
      {events.length === 0 && !isAdding ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No events added yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start by adding your first event to plan for future financial changes
            </p>
            <Button onClick={() => setIsAdding(true)}>
              Add Your First Event
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'timeline' ? (
        <EventTimeline
          events={events}
          people={people}
          assets={assets}
          getAffectedPersonNames={getAffectedPersonNames}
          getLinkedAssetName={getLinkedAssetName}
          onEdit={setEditingId}
          onDelete={handleDeleteEvent}
          disabled={isAdding || editingId !== null}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              people={people}
              assets={assets}
              affectedPersonNames={getAffectedPersonNames(event.affectedPersonIds || [])}
              linkedAssetName={getLinkedAssetName(event.linkedAssetId)}
              isEditing={editingId === event.id}
              onEdit={() => setEditingId(event.id)}
              onDelete={() => handleDeleteEvent(event.id)}
              onSave={handleEditEvent}
              onCancel={handleCancel}
              disabled={isAdding || (editingId !== null && editingId !== event.id)}
            />
          ))}
        </div>
      )}

      {/* Summary */}
      {events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Events Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{events.length}</div>
                <div className="text-sm text-muted-foreground">Total Events</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{getUpcomingEventsCount()}</div>
                <div className="text-sm text-muted-foreground">Upcoming Events</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {events.filter(e => e.isRecurring).length}
                </div>
                <div className="text-sm text-muted-foreground">Recurring Events</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  £{getTotalEventValue().toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Value</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
