import type { EventDto } from '@/types'
import { EventRow } from '@/components/data-display/EventRow'
import { SkeletonRows } from '@/components/states/SkeletonRows'

interface EventListViewProps {
  events: EventDto[]
  loading?: boolean
}

export function EventListView({ events, loading }: EventListViewProps) {
  if (loading) return <SkeletonRows count={4} />
  return (
    <div className="collection event-grid event-grid--list">
      {events.map((event) => (
        <EventRow key={event.id} event={event} />
      ))}
    </div>
  )
}
