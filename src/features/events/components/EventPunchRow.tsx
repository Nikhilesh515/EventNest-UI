import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

import { StatusBadge } from '@/components/data-display/StatusBadge'
import { VisibilityBadge } from '@/components/data-display/VisibilityBadge'
import { cn } from '@/lib/cn'
import { dateFlag, fmtTime } from '@/lib/format'
import type { EventDto } from '@/types'

interface EventPunchRowProps {
  event: EventDto
  actions?: ReactNode
}

export function EventPunchRow({ event, actions }: EventPunchRowProps) {
  const flag = dateFlag(event.start)
  const full = event.capacity > 0 && event.going >= event.capacity
  const classes = cn(
    'punch-row',
    event.status === 'Cancelled' && 'is-cancelled',
    event.status === 'Draft' && 'is-draft',
  )

  return (
    <article className={classes} data-id={event.id}>
      <div className="punch-row__head">
        <div className="punch-row__date">
          <span>{flag.md}</span>
        </div>
        <div className="punch-row__body">
          <h2 className="punch-row__title">
            <Link to={`/events/${event.id}`}>{event.title}</Link>
          </h2>
          <p className="punch-row__meta">
            {event.tags.map((tag) => tag.name).join(' · ')} · {fmtTime(event.start)} ·{' '}
            {event.location}
          </p>
          <p className="punch-row__counts tnum">
            Going {event.going} · {event.capacity} cap
            {full ? (
              <>
                {' '}
                · <span style={{ color: 'var(--text-danger)' }}>FULL</span>
              </>
            ) : null}
          </p>
        </div>
        <div className="cluster">
          <StatusBadge status={event.status} />
          <VisibilityBadge visibility={event.visibility} />
        </div>
      </div>
      {actions ? <div className="punch-row__actions">{actions}</div> : null}
    </article>
  )
}
