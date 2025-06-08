import { Event, Person, Asset } from '../../types'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Edit, Trash2, Repeat } from 'lucide-react'

interface EventTimelineProps {
  events: Event[]
  people: Person[]
  assets: Asset[]
  getAffectedPersonNames: (personIds: string[]) => string
  getLinkedAssetName: (assetId?: string) => string
  onEdit: (eventId: string) => void
  onDelete: (eventId: string) => void
  disabled?: boolean
}

export function EventTimeline({
  events,
  people,
  assets,
  getAffectedPersonNames,
  getLinkedAssetName,
  onEdit,
  onDelete,
  disabled
}: EventTimelineProps) {
  const sortedEvents = [...events].sort((a, b) => a.year - b.year)
  const currentYear = new Date().getFullYear()

  const getEventTypeColor = (type: string): string => {
    switch (type) {
      case 'income': case 'deposit': case 'inheritance': return 'border-green-500 bg-green-50'
      case 'expense': case 'withdrawal': return 'border-red-500 bg-red-50'
      case 'asset_change': return 'border-blue-500 bg-blue-50'
      default: return 'border-gray-500 bg-gray-50'
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

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No events to display in timeline</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Events Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedEvents.map((event, index) => (
            <div key={event.id} className="relative">
              {/* Timeline connector */}
              {index < sortedEvents.length - 1 && (
                <div className="absolute left-6 top-16 w-px h-8 bg-border" />
              )}
              
              <div className={`relative flex items-start gap-4 p-4 rounded-lg border-l-4 ${getEventTypeColor(event.type)}`}>
                {/* Timeline dot */}
                <div className="absolute -left-2 top-6 w-4 h-4 bg-background border-2 border-current rounded-full" />
                
                {/* Event icon */}
                <div className="text-2xl flex-shrink-0 mt-1">
                  {getEventTypeIcon(event.type)}
                </div>
                
                {/* Event details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold flex items-center gap-2">
                        {event.name}
                        {event.isRecurring && <Repeat className="h-4 w-4 text-muted-foreground" />}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {event.year}{event.isRecurring && event.recurringEndYear ? ` - ${event.recurringEndYear}` : ''}
                        {event.year >= currentYear ? ' (Upcoming)' : ' (Past)'}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(event.id)}
                        disabled={disabled}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(event.id)}
                        disabled={disabled}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                    <div>
                      <span className="font-medium">Amount: </span>
                      <span className={event.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatAmount(event.amount)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Type: </span>
                      <span className="capitalize">{event.type.replace('_', ' ')}</span>
                    </div>
                  </div>
                  
                  {event.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {event.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <div>
                      <span className="font-medium">People: </span>
                      {getAffectedPersonNames(event.affectedPersonIds || [])}
                    </div>
                    <div>
                      <span className="font-medium">Asset: </span>
                      {getLinkedAssetName(event.linkedAssetId)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
