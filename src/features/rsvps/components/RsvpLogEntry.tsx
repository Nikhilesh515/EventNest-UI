import { Link } from 'react-router-dom'
import type { RsvpDetailDto } from '@/types'
import { useEvent } from '@/features/events/useEvent'
import { fmtDate, fmtTime } from '@/lib/format'
import { RsvpChip } from '@/components/data-display/RsvpChip'
import { Hanko } from '@/components/data-display/Hanko'

interface RsvpLogEntryProps {
  rsvp: RsvpDetailDto
  onChange(): void
  onCancel(): void
}

export function RsvpLogEntry({ rsvp, onChange, onCancel }: RsvpLogEntryProps) {
  const eventQuery = useEvent(rsvp.eventId)
  const title = rsvp.eventTitle ?? eventQuery.data?.title ?? 'Loading event…'
  const event = eventQuery.data

  return (
    <article className="log-entry">
      <div className="log-entry__main">
        <Link className="log-entry__title" to={`/events/${rsvp.eventId}`}>
          {title}
        </Link>
        <div className="log-entry__meta">
          {event
            ? `${fmtDate(event.start)} · ${fmtTime(event.start)} · ${event.location || 'TBA'}`
            : '—'}
        </div>
        <div className="log-entry__notes">
          {rsvp.notes ? `“${rsvp.notes}”` : '—'} · {rsvp.guestCount}{' '}
          {rsvp.guestCount === 1 ? 'guest' : 'guests'}
        </div>
      </div>
      <div className="log-entry__side">
        <RsvpChip status={rsvp.status} />
        {rsvp.status === 'Confirmed' ? <Hanko glyph="福" size="sm" /> : null}
        <time dateTime={rsvp.respondedAt}>{fmtDate(rsvp.respondedAt)}</time>
        <button type="button" className="btn btn--secondary btn--sm" onClick={onChange}>
          Change
        </button>
        <button type="button" className="btn btn--secondary btn--sm" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </article>
  )
}
