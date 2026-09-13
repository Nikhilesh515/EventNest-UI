import { Link } from 'react-router-dom'

import { cn } from '@/lib/cn'
import { dateFlag, fmtTime } from '@/lib/format'
import type { EventDto } from '@/types'
import { StatusBadge } from './StatusBadge'
import { VisibilityBadge } from './VisibilityBadge'
import { TagChip } from './TagChip'

interface EventRowProps {
  event: EventDto
}

export function EventRow({ event }: EventRowProps) {
  const flag = dateFlag(event.start)
  const full = event.capacity > 0 && event.going >= event.capacity
  const shownTags = event.tags.slice(0, 4)
  return (
    <article
      className={cn('event-row', event.status === 'Cancelled' && 'event-card--cancelled')}
      data-event-id={event.id}
    >
      <div className="event-row__date">
        <span className="d">{flag.day}</span>
        <span>{flag.mon}</span>
      </div>
      <div className="event-row__main">
        <div className="event-row__title">
          <Link to={`/events/${event.id}`}>{event.title}</Link>
        </div>
        <div className="event-row__meta">
          {shownTags.map((tag, index) => (
            <TagChip key={tag.id} tag={tag} tilt={index % 2 === 0 ? -1 : 1} />
          ))}
          {shownTags.length ? ` · ${fmtTime(event.start)} · ` : `${fmtTime(event.start)} · `}
          {event.location} · {event.going}/{event.capacity}
          {full ? ' FULL' : ''}
        </div>
      </div>
      <div className="event-row__side">
        <StatusBadge status={event.status} />
        <VisibilityBadge visibility={event.visibility} />
        <span className="pager-meta">{event.organizerName}</span>
      </div>
    </article>
  )
}
