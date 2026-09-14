import { useState } from 'react'
import type { CSSProperties } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'

import { useTheme } from '@/app/providers/ThemeContext'
import { Breadcrumbs } from '@/components/data-display/Breadcrumbs'
import { Pager } from '@/components/data-display/Pager'
import { RsvpChip } from '@/components/data-display/RsvpChip'
import { Modal } from '@/components/overlays/Modal'
import { AccessDenied } from '@/components/states/AccessDenied'
import { DetailSkeleton } from '@/components/states/DetailSkeleton'
import { EmptyState } from '@/components/states/EmptyState'
import { ErrorState } from '@/components/states/ErrorState'
import { useAuth } from '@/features/auth/AuthContext'
import { useEvent } from '@/features/events/useEvent'
import { RSVP_KEY_TO_STATUS } from '@/features/rsvps/statusMap'
import { useEventRsvps } from '@/features/rsvps/useEventRsvps'
import { normalizeTag } from '@/lib/color'
import { fmtDate, initialsOf } from '@/lib/format'
import { EventNestPermissions } from '@/lib/permissions'
import type { RsvpDetailDto, RsvpStatus, RsvpUiKey } from '@/types'

const FILTERS: { key: 'all' | RsvpUiKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'going', label: 'Going' },
  { key: 'maybe', label: 'Maybe' },
  { key: 'notgoing', label: 'Not going' },
  { key: 'cancelled', label: 'Cancelled' },
]

const PAGE_SIZE = 25

export default function AttendeesPage() {
  const { id = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const { user, hasPermission } = useAuth()
  const { theme } = useTheme()
  const eventQuery = useEvent(id)
  const rsvpsQuery = useEventRsvps(id)
  const [note, setNote] = useState<{ name: string; body: string } | null>(null)

  const event = eventQuery.data
  const rsvps = rsvpsQuery.data ?? []

  const requested = params.get('status')
  const filter: 'all' | RsvpUiKey = FILTERS.some((entry) => entry.key === requested)
    ? (requested as RsvpUiKey)
    : 'all'

  const filtered =
    filter === 'all' ? rsvps : rsvps.filter((rsvp) => rsvp.status === RSVP_KEY_TO_STATUS[filter])
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const page = Math.min(Math.max(1, Number(params.get('page') ?? 1) || 1), pages)
  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (eventQuery.isLoading || rsvpsQuery.isLoading) {
    return (
      <div id="attendees-root" aria-busy="true">
        <DetailSkeleton />
      </div>
    )
  }

  if (eventQuery.isError || rsvpsQuery.isError || !event) {
    return (
      <div id="attendees-root" aria-busy="false">
        <ErrorState
          mascot="kokeshi"
          title="This stall has packed up."
          body="We couldn't find that event."
          secondary={{ label: 'Back to events', to: '/events' }}
        />
      </div>
    )
  }

  if (!hasPermission(EventNestPermissions.RSVPs.Manage)) {
    return <AccessDenied crumbs={[{ label: 'Events', href: '/events' }, { label: 'Attendees' }]} />
  }

  if (!user || (user.id !== event.organizerId && !isAdmin(user.role))) {
    return (
      <div id="attendees-root" aria-busy="false">
        <Breadcrumbs
          items={[
            { label: 'Events', href: '/events' },
            { label: event.title, href: `/events/${event.id}` },
            { label: 'Attendees' },
          ]}
        />
        <ErrorState
          mascot="kokeshi"
          title="You can't peek behind this counter."
          body="Only the event's organizer can see the guest list."
          secondary={{ label: 'Back to event', to: `/events/${event.id}` }}
        />
      </div>
    )
  }

  const rim = event.tags[0] ? normalizeTag(event.tags[0].color, theme).edge : undefined
  const frameStyle = rim ? ({ '--frame-tint': rim } as CSSProperties) : undefined
  const counts = {
    all: rsvps.length,
    going: countKey(rsvps, 'going'),
    maybe: countKey(rsvps, 'maybe'),
    notgoing: countKey(rsvps, 'notgoing'),
    cancelled: countKey(rsvps, 'cancelled'),
  }
  const left = Math.max(0, event.capacity - event.going)

  function applyFilter(next: 'all' | RsvpUiKey) {
    const nextParams = new URLSearchParams(params)
    if (next === 'all') nextParams.delete('status')
    else nextParams.set('status', next)
    setParams(nextParams)
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'My Events', href: '/my-events' },
          { label: event.title, href: `/events/${event.id}` },
          { label: 'Attendees' },
        ]}
      />
      <div className="guestbook" id="attendees-root" aria-busy="false">
        <div className="guestbook__head">
          <span className="guestbook__watermark kanji-watermark" aria-hidden="true" lang="ja">
            縁
          </span>
          <span className="guestbook__frame" style={frameStyle} aria-hidden="true">
            祭
          </span>
          <div className="guestbook__titles">
            <p className="page-doc__overline">My events / … / Attendees · 縁</p>
            <h1 className="page-doc__title" tabIndex={-1}>
              Attendees
            </h1>
            <p className="page-doc__sub">
              Capacity {event.capacity} · {event.going} going · {left} spots left
            </p>
          </div>
          <Link className="btn btn--secondary btn--sm" to={`/events/${event.id}`}>
            View event →
          </Link>
        </div>
        <div className="stats-wrap" style={{ marginTop: 'var(--space-5)' }}>
          <div className="stat-row">
            <div className="stat stat--going">
              <span className="stat__label">Going</span>
              <span className="stat__value tnum">{event.going}</span>
              <span className="stat__sub">people</span>
            </div>
            <div className="stat stat--maybe">
              <span className="stat__label">Maybe</span>
              <span className="stat__value tnum">{counts.maybe}</span>
              <span className="stat__sub">people</span>
            </div>
            <div className="stat stat--notgoing">
              <span className="stat__label">Not going</span>
              <span className="stat__value tnum">{counts.notgoing}</span>
              <span className="stat__sub">people</span>
            </div>
            <div className="stat stat--cancelled">
              <span className="stat__label">Cancelled</span>
              <span className="stat__value tnum">{counts.cancelled}</span>
              <span className="stat__sub">people</span>
            </div>
            <div className="stat stat--guests">
              <span className="stat__label">Total guests</span>
              <span className="stat__value tnum">
                {event.going} / {event.capacity}
              </span>
              <span className="stat__sub">going people</span>
            </div>
          </div>
          <div className="filter-chips" id="att-filter">
            {FILTERS.map((entry) => (
              <button
                key={entry.key}
                type="button"
                className="filter-chip"
                aria-pressed={filter === entry.key}
                onClick={() => applyFilter(entry.key)}
              >
                {entry.label} <span className="filter-chip__n">({counts[entry.key]})</span>
              </button>
            ))}
          </div>
          <div id="att-table-slot">
            {filtered.length === 0 ? (
              <EmptyState
                title={
                  filter === 'all' ? "No one's RSVP'd yet." : `No ${labelFor(filter)} guests yet.`
                }
                body={
                  filter === 'all'
                    ? "When guests respond, they'll line up here."
                    : 'Try another filter.'
                }
                cta={
                  filter === 'all'
                    ? { label: 'Back to event', to: `/events/${event.id}` }
                    : undefined
                }
              />
            ) : (
              <>
                <div className="table-scroll guestbook-table">
                  <table className="table-punch">
                    <caption className="sr-only">Guest list for {event.title}</caption>
                    <thead>
                      <tr>
                        <th scope="col">Guest</th>
                        <th scope="col">Status</th>
                        <th scope="col" className="num">
                          Guests
                        </th>
                        <th scope="col">Notes</th>
                        <th scope="col">Responded</th>
                      </tr>
                    </thead>
                    <tbody>
                      {slice.map((rsvp) => (
                        <tr
                          key={rsvp.id}
                          style={rsvp.status === 'Cancelled' ? { opacity: 0.75 } : undefined}
                        >
                          <td data-label="Guest">
                            <div className="guestbook-table__guest">
                              <span className="guestbook-table__frame" aria-hidden="true">
                                {initialsOf(rsvp.userName)}
                              </span>
                              <div className="table-punch__guest">
                                <span className="name">{rsvp.userName}</span>
                                <span className="email">{rsvp.userEmail}</span>
                                {rsvp.active === false ? (
                                  <span className="deactivated-chip">Deactivated</span>
                                ) : null}
                              </div>
                            </div>
                          </td>
                          <td data-label="Status">
                            <RsvpChip status={rsvp.status} />
                          </td>
                          <td data-label="Guests" className="num tnum">
                            {rsvp.guestCount}
                          </td>
                          <td data-label="Notes">
                            {rsvp.notes ? (
                              <button
                                type="button"
                                className="notes-btn"
                                aria-label={`Show full note from ${rsvp.userName}`}
                                onClick={() => setNote({ name: rsvp.userName, body: rsvp.notes })}
                              >
                                <span className="table-punch__notes">{rsvp.notes}</span>
                              </button>
                            ) : (
                              <span className="tertiary">—</span>
                            )}
                          </td>
                          <td data-label="Responded">
                            <time dateTime={rsvp.respondedAt}>{fmtDate(rsvp.respondedAt)}</time>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {pages > 1 ? (
                  <Pager
                    page={page}
                    pages={pages}
                    total={filtered.length}
                    pageSize={PAGE_SIZE}
                    sizeOptions={[PAGE_SIZE]}
                    onPageChange={(next) => {
                      const nextParams = new URLSearchParams(params)
                      nextParams.set('page', String(next))
                      setParams(nextParams)
                    }}
                    onPageSizeChange={() => undefined}
                  />
                ) : (
                  <p className="pager-meta" style={{ padding: 'var(--space-4) 0' }}>
                    {filtered.length} records
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Modal
        open={Boolean(note)}
        title={note ? `Note from ${note.name}` : ''}
        onClose={() => setNote(null)}
        footer={
          <button type="button" className="btn btn--primary" onClick={() => setNote(null)}>
            Close
          </button>
        }
      >
        <p style={{ whiteSpace: 'pre-line' }}>{note?.body}</p>
      </Modal>
    </>
  )
}

function isAdmin(role: string): boolean {
  return role === 'Admin' || role === 'SuperAdmin'
}

function labelFor(filter: RsvpUiKey): string {
  return FILTERS.find((entry) => entry.key === filter)?.label ?? filter
}

function countKey(rsvps: RsvpDetailDto[], key: RsvpUiKey): number {
  const status: RsvpStatus = RSVP_KEY_TO_STATUS[key]
  return rsvps.filter((rsvp) => rsvp.status === status).length
}
