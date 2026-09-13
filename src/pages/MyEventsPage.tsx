import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { useToast } from '@/app/providers/ToastProvider'
import { Breadcrumbs } from '@/components/data-display/Breadcrumbs'
import { Icon } from '@/components/icons/Icon'
import { PageDoc } from '@/components/data-display/PageDoc'
import { ConfirmDialog } from '@/components/overlays/ConfirmDialog'
import { AccessDenied } from '@/components/states/AccessDenied'
import { EmptyState } from '@/components/states/EmptyState'
import { ErrorState } from '@/components/states/ErrorState'
import { SkeletonRows } from '@/components/states/SkeletonRows'
import { useAuth } from '@/features/auth/AuthContext'
import { EventPunchRow } from '@/features/events/components/EventPunchRow'
import { MyEventRowActions } from '@/features/events/components/MyEventRowActions'
import { useEventActions } from '@/features/events/useEventActions'
import { useMyEvents } from '@/features/events/useMyEvents'
import { EventNestPermissions } from '@/lib/permissions'
import type { EventDto, EventStatus } from '@/types'

const TABS = ['all', 'Draft', 'Published', 'Completed', 'Cancelled'] as const
type Tab = (typeof TABS)[number]

const TAB_LABELS: Record<Tab, string> = {
  all: 'All',
  Draft: 'Draft',
  Published: 'Published',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
}

export default function MyEventsPage() {
  const { hasPermission } = useAuth()
  const { push } = useToast()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const active = ((params.get('status') as Tab | null) ?? 'all') as Tab
  const query = useMyEvents(active as EventStatus | 'all')
  const actions = useEventActions()
  const [confirm, setConfirm] = useState<{ kind: 'cancel' | 'complete' | 'delete'; event: EventDto } | null>(
    null,
  )

  if (!hasPermission(EventNestPermissions.Events.Create)) {
    return (
      <AccessDenied
        crumbs={[{ label: 'Events', href: '/events' }, { label: 'My events' }]}
      />
    )
  }

  const events = query.data
  const counts = query.counts
  const total = query.total

  async function publish(event: EventDto) {
    await actions.publish(event.id)
    push({ kind: 'success', title: 'Published!', body: 'The daruma has both eyes now. ●●' })
  }

  async function resolveConfirm() {
    const current = confirm
    setConfirm(null)
    if (!current) return
    if (current.kind === 'cancel') {
      await actions.cancel(current.event.id)
      push({ kind: 'info', title: 'Event cancelled', body: "Guests will see it's off." })
    } else if (current.kind === 'complete') {
      await actions.complete(current.event.id)
      push({ kind: 'success', title: 'Completed', body: 'A hanko star for the stall.' })
    } else {
      await actions.remove(current.event.id)
      push({ kind: 'info', title: 'Event deleted', body: "The table's a little emptier." })
    }
  }

  const confirmCopy: Record<'cancel' | 'complete' | 'delete', { title: string; body: string; label: string }> =
    {
      cancel: {
        title: 'Cancel this event?',
        body: `Cancel '${confirm?.event.title ?? ''}'? Guests will see it's off.`,
        label: 'Cancel event',
      },
      complete: {
        title: 'Mark this event as complete?',
        body: 'It moves to the Completed tab.',
        label: 'Mark complete',
      },
      delete: {
        title: 'Delete this event?',
        body: `Delete '${confirm?.event.title ?? ''}'? This can't be undone.`,
        label: 'Delete event',
      },
    }

  return (
    <>
      <Breadcrumbs items={[{ label: 'Events', href: '/events' }, { label: 'My events' }]} />
      <PageDoc
        title="My events"
        overline="Organizer · 手帳"
        subtitle={`${total} events · ${counts.Published ?? 0} published · ${counts.Draft ?? 0} draft`}
        kanji="手帳"
        tapeVariant="matcha"
        cornerTape="sakura"
        actions={
          <Link className="btn btn--primary" to="/events/create">
            <Icon name="plus" size={18} />
            Create event
          </Link>
        }
      />
      <div className="tabs" role="tablist" aria-label="Event status" style={{ marginTop: 'var(--space-4)' }}>
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
            {TAB_LABELS[tab]}
            <span className="tab__count">{tab === 'all' ? total : (counts[tab] ?? 0)}</span>
          </button>
        ))}
      </div>
      <div className="notebook">
        <div className="notebook__spiral" aria-hidden="true">
          {Array.from({ length: 8 }, (_, index) => (
            <span key={index} />
          ))}
        </div>
        <div className="notebook__body" id="my-events-list" aria-busy={query.isLoading}>
          {query.isLoading ? <SkeletonRows count={4} /> : null}
          {query.isError ? <ErrorState onRetry={() => void query.refetch()} /> : null}
          {!query.isLoading && !query.isError && events.length === 0
            ? total === 0
              ? (
                  <EmptyState
                    title="Your stall is empty."
                    body="You haven't created an event yet. Start with a card and a sticker."
                    cta={{ label: '＋ Create your first event', to: '/events/create' }}
                  />
                )
              : (
                  <EmptyState
                    title={`Nothing in ${TAB_LABELS[active]}.`}
                    body="Try another tab."
                    cta={{ label: 'Show all', onClick: () => setParams({}) }}
                  />
                )
            : null}
          {!query.isLoading && !query.isError
            ? events.map((event) => (
                <EventPunchRow
                  key={event.id}
                  event={event}
                  actions={
                    <MyEventRowActions
                      event={event}
                      onEdit={() => navigate(`/events/${event.id}/edit`)}
                      onPublish={() => void publish(event)}
                      onCancel={() => setConfirm({ kind: 'cancel', event })}
                      onComplete={() => setConfirm({ kind: 'complete', event })}
                      onDelete={() => setConfirm({ kind: 'delete', event })}
                      onAttendees={() => navigate(`/events/${event.id}/attendees`)}
                    />
                  }
                />
              ))
            : null}
        </div>
      </div>

      <ConfirmDialog
        open={confirm?.kind === 'cancel'}
        title={confirmCopy.cancel.title}
        body={confirmCopy.cancel.body}
        confirmLabel={confirmCopy.cancel.label}
        danger
        onCancel={() => setConfirm(null)}
        onConfirm={() => void resolveConfirm()}
      />
      <ConfirmDialog
        open={confirm?.kind === 'complete'}
        title={confirmCopy.complete.title}
        body={confirmCopy.complete.body}
        confirmLabel={confirmCopy.complete.label}
        onCancel={() => setConfirm(null)}
        onConfirm={() => void resolveConfirm()}
      />
      <ConfirmDialog
        open={confirm?.kind === 'delete'}
        title={confirmCopy.delete.title}
        body={confirmCopy.delete.body}
        confirmLabel={confirmCopy.delete.label}
        danger
        onCancel={() => setConfirm(null)}
        onConfirm={() => void resolveConfirm()}
      />
    </>
  )
}
