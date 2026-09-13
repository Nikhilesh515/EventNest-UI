import { useMemo, useState } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { useUserRsvps } from '@/features/rsvps/useUserRsvps'
import { useCancelRsvp } from '@/features/rsvps/useCancelRsvp'
import { useChangeRsvp } from '@/features/rsvps/useChangeRsvp'
import { FEATURES } from '@/lib/features'
import { PageDoc } from '@/components/data-display/PageDoc'
import { RsvpLogEntry } from '@/features/rsvps/components/RsvpLogEntry'
import { EmptyState } from '@/components/states/EmptyState'
import { ErrorState } from '@/components/states/ErrorState'
import { ConfirmDialog } from '@/components/overlays/ConfirmDialog'
import { SkeletonRows } from '@/components/states/SkeletonRows'
import type { RsvpDetailDto } from '@/types'

export default function MyRsvpsPage() {
  const { user } = useAuth()
  const userId = user?.id ?? ''
  const query = useUserRsvps(userId)
  const cancelRsvp = useCancelRsvp('')
  const changeRsvp = useChangeRsvp('')
  const [pendingCancel, setPendingCancel] = useState<RsvpDetailDto | null>(null)

  const { upcoming, past, cancelled } = useMemo(() => {
    const all = query.data ?? []
    const active = all.filter((rsvp) => rsvp.status !== 'Cancelled')
    const cancelledRows = all.filter((rsvp) => rsvp.status === 'Cancelled')
    const up: RsvpDetailDto[] = []
    const pa: RsvpDetailDto[] = []
    for (const rsvp of active) {
      if (new Date(rsvp.respondedAt).getTime() >= 0) up.push(rsvp)
      else pa.push(rsvp)
    }
    return { upcoming: up, past: pa, cancelled: cancelledRows }
  }, [query.data])

  if (!user) return null

  return (
    <div className="stack-6">
      <PageDoc
        title="My RSVPs"
        subtitle={`${upcoming.length} upcoming · ${past.length} past`}
        kanji="縁"
        tapeVariant="sakura"
      />
      {query.isLoading ? <SkeletonRows count={3} /> : null}
      {query.isError ? <ErrorState onRetry={() => void query.refetch()} /> : null}
      {query.isSuccess && (query.data?.length ?? 0) === 0 ? (
        <EmptyState
          title="No responses yet."
          body="Browse the table and RSVP to your first event."
          cta={{ label: 'Browse events', to: '/events' }}
        />
      ) : null}
      {upcoming.length > 0 ? (
        <section className="stamp-log">
          <h2 className="stamp-log__heading">Upcoming ({upcoming.length})</h2>
          {upcoming.map((rsvp) => (
            <RsvpLogEntry
              key={rsvp.id}
              rsvp={rsvp}
              onChange={() => {
                if (FEATURES.rsvpUpdate)
                  void changeRsvp.mutateAsync({ rsvpId: rsvp.id, body: { status: 'Maybe' } })
              }}
              onCancel={() => setPendingCancel(rsvp)}
            />
          ))}
        </section>
      ) : null}
      {past.length > 0 ? (
        <section className="stamp-log stamp-log--past">
          <h2 className="stamp-log__heading">Past ({past.length})</h2>
          {past.map((rsvp) => (
            <RsvpLogEntry
              key={rsvp.id}
              rsvp={rsvp}
              onChange={() => undefined}
              onCancel={() => setPendingCancel(rsvp)}
            />
          ))}
        </section>
      ) : null}
      {cancelled.length > 0 ? (
        <details className="stamp-log stamp-log--cancelled">
          <summary>Cancelled ({cancelled.length})</summary>
          {cancelled.map((rsvp) => (
            <RsvpLogEntry
              key={rsvp.id}
              rsvp={rsvp}
              onChange={() => undefined}
              onCancel={() => undefined}
            />
          ))}
        </details>
      ) : null}
      <ConfirmDialog
        open={Boolean(pendingCancel)}
        title="Cancel this RSVP?"
        body="Your spot will be released to other attendees."
        confirmLabel="Cancel RSVP"
        danger
        onCancel={() => setPendingCancel(null)}
        onConfirm={() => {
          if (pendingCancel) void cancelRsvp.mutateAsync(pendingCancel.eventId)
          setPendingCancel(null)
        }}
      />
    </div>
  )
}
