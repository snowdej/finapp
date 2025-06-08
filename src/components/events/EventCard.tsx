import { useState } from 'react'
import { Event, Person, Asset, ValidationError } from '../../types'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { EventForm } from './EventForm'
import { Edit, Trash2, Calendar, Repeat } from 'lucide-react'

interface EventCardProps {
  event: Event
  people: Person[]
  assets: Asset[]
  affectedPersonNames: string
  linkedAssetName: string
  isEditing: boolean
  onEdit: () => void
  onDelete: () => void
  onSave: (event: Partial<Event>) => ValidationError[]
  onCancel: () => void
  disabled?: boolean
}

export function EventCard({ 
  event, 
  people,
  assets,
  affectedPersonNames,
  linkedAssetName,
  isEditing, 
  onEdit, 
  onDelete, 
  onSave, 
  onCancel,
  disabled 
}: EventCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const getEventTypeColor = (type: string): string => {
    switch (type) {
      case 'income': case 'deposit': case 'inheritance': return 'text-green-600'
      case 'expense': case 'withdrawal': return 'text-red-600'
      case 'asset_change': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const getEventTypeIcon = (type: string): string => {
    switch (type) {
      case 'income': return '💰'
      case 'expense': return '💸'
      case 'asset_change': return '📈'
      case 'withdrawal': return '🏧'
      case 'deposit': return '💳'
      case 'inheritance': return '🎁'
      default: return '📅'
    }
  }

  const formatAmount = (amount: number): string => {
    const prefix = amount >= 0 ? '+' : ''
    return `${prefix}£${amount.toLocaleString()}`
  }

  const getTotalValue = (): number => {
    if (!event.isRecurring) return event.amount
    if (!event.recurringEndYear) return event.amount // Single occurrence shown for infinite recurring
    return event.amount * (event.recurringEndYear - event.year + 1)
  }

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
            <Calendar className="h-5 w-5" />
            Edit Event
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EventForm
            event={event}
            people={people}
            assets={assets}
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
            <span className="text-lg">{getEventTypeIcon(event.type)}</span>
            <div>
              <div className="flex items-center gap-2">
                {event.name}
                {event.isRecurring && <Repeat className="h-4 w-4 text-muted-foreground" />}
              </div>
              <div className="text-sm font-normal text-muted-foreground">
                {event.year}{event.isRecurring && event.recurringEndYear ? ` - ${event.recurringEndYear}` : ''}
              </div>
            </div>
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
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium">Amount:</span>
            <span className={`font-bold ${getEventTypeColor(event.type)}`}>
              {formatAmount(event.amount)}
            </span>
          </div>
          
          {event.isRecurring && (
            <div className="flex items-center justify-between">
              <span className="font-medium">Total Value:</span>
              <span className={`font-bold ${getEventTypeColor(event.type)}`}>
                {event.recurringEndYear ? formatAmount(getTotalValue()) : `${formatAmount(event.amount)}/year`}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="font-medium">Type:</span>
            <span className="capitalize">{event.type.replace('_', ' ')}</span>
          </div>
          
          {event.description && (
            <div>
              <span className="font-medium">Description:</span>
              <p className="mt-1 text-muted-foreground">{event.description}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="font-medium">Affected People:</span>
            <span>{affectedPersonNames}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium">Linked Asset:</span>
            <span>{linkedAssetName}</span>
          </div>
        </div>
        
        {showDeleteConfirm && (
          <div className="mt-4 p-3 border border-destructive rounded-md bg-destructive/10">
            <p className="text-sm text-destructive mb-2">
              Are you sure you want to delete this event?
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
