import { useState } from 'react'
import { useParams } from 'react-router-dom'
import type { RsvpStatus } from '@/types'
import { useEvent } from '@/features/events/useEvent'
import { useEventRsvps } from '@/features/rsvps/useEventRsvps'
import { useAuth } from '@/features/auth/AuthContext'
import { PageDoc } from '@/components/data-display/PageDoc'
import { StatCard } from '@/components/data-display/StatCard'
import { StatRow } from '@/components/data-display/StatRow'
import { RsvpChip } from '@/components/data-display/RsvpChip'
import { AccessDenied } from '@/components/states/AccessDenied'
import { EmptyState } from '@/components/states/EmptyState'
import { ErrorState } from '@/components/states/ErrorState'
import { DetailSkeleton } from '@/components/states/DetailSkeleton'

const STATUSES: RsvpStatus[] = ['Confirmed', 'Maybe', 'Declined', 'Cancelled']

export default function AttendeesPage() {
  const { id = '' } = useParams()
  const { user } = useAuth()
  const eventQuery = useEvent(id)
  const rsvpsQuery = useEventRsvps(id)
  const [filter, setFilter] = useState<RsvpStatus | 'all'>('all')

  if (eventQuery.isLoading || rsvpsQuery.isLoading) return <DetailSkeleton />
  if (eventQuery.isError || rsvpsQuery.isError)
    return (
      <ErrorState
        onRetry={() => {
          void eventQuery.refetch()
          void rsvpsQuery.refetch()
        }}
      />
    )
  const event = eventQuery.data
  if (!event) return null
  if (!user || user.id !== event.organizerId) {
    return (
      <AccessDenied
        message="Only the event's organizer can view the guestbook."
        backTo={`/events/${id}`}
      />
    )
  }

  const rsvps = rsvpsQuery.data ?? []
  const rows = filter === 'all' ? rsvps : rsvps.filter((rsvp) => rsvp.status === filter)
  const countFor = (status: RsvpStatus) => rsvps.filter((rsvp) => rsvp.status === status).length
  const peopleFor = (status: RsvpStatus) =>
    rsvps.filter((rsvp) => rsvp.status === status).reduce((sum, rsvp) => sum + rsvp.guestCount, 0)

  return (
    <div className="stack-6">
      <PageDoc
        title={event.title}
        overline="Attendees"
        subtitle={`Capacity ${event.capacity} · ${event.going} going · ${Math.max(0, event.capacity - event.going)} spots left`}
        kanji="縁"
        tapeVariant="sora"
      />
      <StatRow>
        <StatCard label="Going" value={peopleFor('Confirmed')} tone="going" />
        <StatCard label="Maybe" value={peopleFor('Maybe')} tone="maybe" />
        <StatCard label="Not going" value={peopleFor('Declined')} tone="notgoing" />
        <StatCard label="Cancelled" value={peopleFor('Cancelled')} tone="cancelled" />
      </StatRow>
      <div className="cluster" role="tablist" aria-label="RSVP status filter">
        <button
          type="button"
          role="tab"
          aria-selected={filter === 'all'}
          onClick={() => setFilter('all')}
        >
          All ({rsvps.length})
        </button>
        {STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            role="tab"
            aria-selected={filter === status}
            onClick={() => setFilter(status)}
          >
            {status} ({countFor(status)})
          </button>
        ))}
      </div>
      {rows.length === 0 ? (
        <EmptyState
          title="No responses yet."
          body="When guests RSVP they will be signed into this guestbook."
        />
      ) : (
        <div className="guestbook">
          {rows.map((rsvp) => (
            <article key={rsvp.id} className="guestbook__row">
              <span className="guestbook__name">{rsvp.userName}</span>
              <RsvpChip status={rsvp.status} />
              <span className="tnum">{rsvp.guestCount}</span>
              <span className="guestbook__notes">{rsvp.notes || '—'}</span>
              <time dateTime={rsvp.respondedAt}>{rsvp.respondedAt.slice(0, 10)}</time>
            </article>
          ))}
        </div>
      )}
      {hasPermissionText(event.id, user.id) ? null : null}
    </div>
  )
}

function hasPermissionText(_eventId: string, _userId: string): boolean {
  return false
}
