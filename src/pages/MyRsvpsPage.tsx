import { useState } from 'react'
import { useQueries } from '@tanstack/react-query'

import { useToast } from '@/app/providers/ToastProvider'
import { Breadcrumbs } from '@/components/data-display/Breadcrumbs'
import { PageDoc } from '@/components/data-display/PageDoc'
import { EmptyState } from '@/components/states/EmptyState'
import { ErrorState } from '@/components/states/ErrorState'
import { SkeletonRows } from '@/components/states/SkeletonRows'
import { useAuth } from '@/features/auth/AuthContext'
import { getEvent } from '@/features/events/api'
import { eventKeys } from '@/features/events/queryKeys'
import { RsvpLogEntry } from '@/features/rsvps/components/RsvpLogEntry'
import { RSVP_KEY_TO_LABEL, RSVP_STATUS_TO_KEY } from '@/features/rsvps/statusMap'
import { useCancelRsvp } from '@/features/rsvps/useCancelRsvp'
import { useChangeRsvp } from '@/features/rsvps/useChangeRsvp'
import { useUserRsvps } from '@/features/rsvps/useUserRsvps'
import type { EventDto, RsvpDetailDto, RsvpStatus } from '@/types'

export default function MyRsvpsPage() {
  const { user } = useAuth()
  const { push } = useToast()
  const userId = user?.id ?? ''
  const query = useUserRsvps(userId)
  const changeRsvp = useChangeRsvp('')
  const cancelRsvp = useCancelRsvp('')
  const [thump, setThump] = useState({ id: '', nonce: 0 })

  const rsvps = query.data ?? []

  const eventQueries = useQueries({
    queries: rsvps.map((rsvp) => ({
      queryKey: eventKeys.detail(rsvp.eventId),
      queryFn: (context: { signal: AbortSignal }) => getEvent(rsvp.eventId, context.signal),
      staleTime: 30_000,
    })),
  })

  const enriched = rsvps
    .map((rsvp, index) => ({ rsvp, event: eventQueries[index]?.data }))
    .filter((row): row is { rsvp: RsvpDetailDto; event: EventDto } => Boolean(row.event))

  const now = Date.now()
  const upcoming = enriched.filter(
    ({ rsvp, event }) => new Date(event.end).getTime() >= now && rsvp.status !== 'Cancelled',
  )
  const past = enriched.filter(
    ({ rsvp, event }) => new Date(event.end).getTime() < now && rsvp.status !== 'Cancelled',
  )
  const cancelled = enriched.filter(({ rsvp }) => rsvp.status === 'Cancelled')

  const responses = rsvps.length
  const going = rsvps.filter((rsvp) => rsvp.status === 'Confirmed').length
  const maybe = rsvps.filter((rsvp) => rsvp.status === 'Maybe').length

  const eventsLoading = eventQueries.some((eventQuery) => eventQuery.isLoading)
  const bodyLoading = query.isLoading || eventsLoading

  async function handleChange(rsvp: RsvpDetailDto, status: RsvpStatus) {
    try {
      await changeRsvp.mutateAsync({
        rsvpId: rsvp.id,
        body: { status },
        eventId: rsvp.eventId,
      })
      push({
        kind: 'success',
        title: `Updated to ${RSVP_KEY_TO_LABEL[RSVP_STATUS_TO_KEY[status]]}.`,
        body: "We'll keep a spot warm.",
      })
      setThump((current) => ({ id: rsvp.eventId, nonce: current.nonce + 1 }))
    } catch {
      push({ kind: 'error', title: "Couldn't update", body: 'Try again.' })
    }
  }

  async function handleCancel(rsvp: RsvpDetailDto) {
    try {
      await cancelRsvp.mutateAsync(rsvp.eventId)
      push({ kind: 'info', title: 'RSVP cancelled', body: 'The sticker came off cleanly.' })
    } catch {
      push({ kind: 'error', title: "Couldn't cancel", body: 'Try again.' })
    }
  }

  if (!user) return null

  return (
    <>
      <Breadcrumbs items={[{ label: 'Events', href: '/events' }, { label: 'My RSVPs' }]} />
      <PageDoc
        title="My RSVPs"
        overline="Attendee · 縁"
        subtitle={
          query.isSuccess && !bodyLoading
            ? `${responses} responses · ${going} going · ${maybe} maybe`
            : 'Your responses, pinned in one place.'
        }
        kanji="縁"
        tapeVariant="sakura"
      />
      <div className="stamp-log" id="my-rsvps-body" aria-busy={bodyLoading}>
        {bodyLoading ? <SkeletonRows count={3} /> : null}
        {!bodyLoading && query.isError ? (
          <ErrorState body="Give it another go." onRetry={() => void query.refetch()} />
        ) : null}
        {!bodyLoading && !query.isError && enriched.length === 0 ? (
          <EmptyState
            title="No RSVPs pinned yet."
            body="Find something to look forward to."
            cta={{ label: 'Browse events', to: '/events' }}
          />
        ) : null}
        {!bodyLoading && !query.isError && enriched.length > 0 ? (
          <>
            {upcoming.length > 0 ? (
              <section className="log-group">
                <h2 className="log-group__head">
                  Upcoming <span className="tab__count">({upcoming.length})</span>
                </h2>
                {upcoming.map(({ rsvp, event }) => (
                  <RsvpLogEntry
                    key={rsvp.id}
                    rsvp={rsvp}
                    event={event}
                    thumpSignal={thump.id === rsvp.eventId ? thump.nonce : 0}
                    onChange={(status) => void handleChange(rsvp, status)}
                    onCancel={() => void handleCancel(rsvp)}
                  />
                ))}
              </section>
            ) : null}
            {past.length > 0 ? (
              <section className="log-group" style={{ marginTop: 'var(--space-6)' }}>
                <h2 className="log-group__head">
                  Past <span className="tab__count">({past.length})</span>
                </h2>
                {past.map(({ rsvp, event }) => (
                  <RsvpLogEntry
                    key={rsvp.id}
                    rsvp={rsvp}
                    event={event}
                    thumpSignal={thump.id === rsvp.eventId ? thump.nonce : 0}
                    onChange={(status) => void handleChange(rsvp, status)}
                    onCancel={() => void handleCancel(rsvp)}
                  />
                ))}
              </section>
            ) : null}
            {cancelled.length > 0 ? (
              <details className="rsvp-details" style={{ marginTop: 'var(--space-6)' }}>
                <summary>Cancelled ({cancelled.length})</summary>
                {cancelled.map(({ rsvp, event }) => (
                  <RsvpLogEntry
                    key={rsvp.id}
                    rsvp={rsvp}
                    event={event}
                    thumpSignal={0}
                    onChange={(status) => void handleChange(rsvp, status)}
                    onCancel={() => void handleCancel(rsvp)}
                  />
                ))}
              </details>
            ) : null}
          </>
        ) : null}
      </div>
    </>
  )
}
