import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { EventDto } from '@/types'
import { dateFlag, fmtTime } from '@/lib/format'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { VisibilityBadge } from '@/components/data-display/VisibilityBadge'

interface EventPunchRowProps {
  event: EventDto
  children?: ReactNode
}

export function EventPunchRow({ event, children }: EventPunchRowProps) {
  const flag = dateFlag(event.start)
  const full = event.capacity > 0 && event.going >= event.capacity
  return (
    <article className="punch-row" data-event-id={event.id}>
      <div className="punch-row__head">
        <div className="punch-row__date">
          <span>{flag.md}</span>
        </div>
        <div className="punch-row__body">
          <h2 className="punch-row__title">
            <Link to={`/events/${event.id}`}>{event.title}</Link>
          </h2>
          <p className="punch-row__meta">
            {event.tags.map((tag) => tag.name).join(' · ') || 'No tags'} · {fmtTime(event.start)} ·{' '}
            {event.location || 'TBA'}
          </p>
          <p className="punch-row__counts tnum">
            Going {event.going} · {event.capacity} cap
            {full ? ' · FULL' : ''}
          </p>
          <div className="cluster">
            <StatusBadge status={event.status} />
            <VisibilityBadge visibility={event.visibility} />
          </div>
        </div>
        {children ? <div className="punch-row__actions">{children}</div> : null}
      </div>
    </article>
  )
}
