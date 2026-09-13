import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import type { EventStatus } from '@/types'
import { useMyEvents } from '@/features/events/useMyEvents'
import { useAuth } from '@/features/auth/AuthContext'
import { EventNestPermissions } from '@/lib/permissions'
import { FEATURES } from '@/lib/features'
import { PageDoc } from '@/components/data-display/PageDoc'
import { EventPunchRow } from '@/features/events/components/EventPunchRow'
import { EmptyState } from '@/components/states/EmptyState'
import { ErrorState } from '@/components/states/ErrorState'
import { AccessDenied } from '@/components/states/AccessDenied'
import { SkeletonRows } from '@/components/states/SkeletonRows'

const TABS: (EventStatus | 'all')[] = ['all', 'Draft', 'Published', 'Completed', 'Cancelled']

export default function MyEventsPage() {
  const { hasPermission } = useAuth()
  const [params, setParams] = useSearchParams()
  const active = (params.get('status') ?? 'all') as EventStatus | 'all'
  const query = useMyEvents(active)
  const navigate = useNavigate()
  const [deletingId] = useState<string | null>(null)

  if (!hasPermission(EventNestPermissions.Events.Create)) {
    return <AccessDenied message="My events is for organizers." backTo="/events" />
  }

  const events = query.data ?? []
  const counts = query.counts ?? {}

  return (
    <div className="stack-6">
      <PageDoc
        title="My events"
        subtitle={`${events.length} shown${FEATURES.myEventsEndpoint ? '' : ' · filtered from the public list'}`}
        kanji="手帳"
        tapeVariant="matcha"
        cornerTape="sakura"
        actions={
          <Link className="btn btn--primary" to="/events/create">
            + Create event
          </Link>
        }
      />
      <div className="tabs" role="tablist" aria-label="Status">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            className="tab"
            aria-selected={active === tab}
            tabIndex={active === tab ? 0 : -1}
            onClick={() => setParams(tab === 'all' ? {} : { status: tab })}
          >
            {tab === 'all' ? 'All' : tab}
            {tab !== 'all' && counts[tab] != null ? ` (${counts[tab]})` : ''}
          </button>
        ))}
      </div>
      {query.isLoading ? <SkeletonRows count={4} /> : null}
      {query.isError ? <ErrorState onRetry={() => void query.refetch()} /> : null}
      {!query.isLoading && !query.isError && events.length === 0 ? (
        <EmptyState
          title="Nothing here yet."
          body="Create your first event and it will appear on this page."
          cta={{ label: 'Create event', to: '/events/create' }}
        />
      ) : null}
      <div className="notebook">
        <div className="notebook__spiral" aria-hidden="true">
          {Array.from({ length: 9 }, (_, i) => (
            <span key={i} />
          ))}
        </div>
        <div className="notebook__body">
          {events.map((event) => (
            <EventPunchRow key={event.id} event={event}>
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={() => navigate(`/events/${event.id}/edit`)}
              >
                Edit
              </button>
              {event.status === 'Draft' ? (
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  onClick={() => navigate(`/events/${event.id}/edit`)}
                >
                  Publish
                </button>
              ) : null}
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={() => navigate(`/events/${event.id}/attendees`)}
              >
                Attendees
              </button>
            </EventPunchRow>
          ))}
        </div>
      </div>
      <span hidden>{deletingId}</span>
    </div>
  )
}
