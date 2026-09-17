import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { AppApiError } from '@/api/errors'
import { useToast } from '@/app/providers/ToastProvider'
import { useTheme } from '@/app/providers/ThemeContext'
import { Breadcrumbs } from '@/components/data-display/Breadcrumbs'
import { Icon } from '@/components/icons/Icon'
import { MetaGrid } from '@/components/data-display/MetaGrid'
import { PageDoc } from '@/components/data-display/PageDoc'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { TagChip } from '@/components/data-display/TagChip'
import { VisibilityBadge } from '@/components/data-display/VisibilityBadge'
import { PhotoCorners } from '@/components/decorations/PhotoCorners'
import { ConfirmDialog } from '@/components/overlays/ConfirmDialog'
import { DetailSkeleton } from '@/components/states/DetailSkeleton'
import { ErrorState } from '@/components/states/ErrorState'
import { NotFoundState } from '@/components/states/NotFoundState'
import { useAuth } from '@/features/auth/AuthContext'
import { EventCapacityPanel } from '@/features/events/components/EventCapacityPanel'
import { EventOrganizerStrip } from '@/features/events/components/EventOrganizerStrip'
import { useDeleteEvent } from '@/features/events/useDeleteEvent'
import { useEvent } from '@/features/events/useEvent'
import { useEventStatusMutations } from '@/features/events/useEventStatusMutations'
import { RsvpPanel } from '@/features/rsvps/components/RsvpPanel'
import type { RsvpPanelState, RsvpSubmitInput } from '@/features/rsvps/components/RsvpPanel'
import { useCancelRsvp } from '@/features/rsvps/useCancelRsvp'
import { useChangeRsvp } from '@/features/rsvps/useChangeRsvp'
import { useMyRsvp } from '@/features/rsvps/useMyRsvp'
import { useSaveRsvp } from '@/features/rsvps/useSaveRsvp'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { normalizeTag } from '@/lib/color'
import { fmtDate, fmtDateTime, isPast } from '@/lib/format'
import { EventNestPermissions } from '@/lib/permissions'

export default function EventDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { user, status: authStatus, hasPermission } = useAuth()
  const { theme } = useTheme()
  const { push } = useToast()
  const reducedMotion = useReducedMotion()
  const eventQuery = useEvent(id)
  const myRsvpQuery = useMyRsvp(id)
  const saveRsvp = useSaveRsvp(id)
  const changeRsvp = useChangeRsvp(id)
  const cancelRsvp = useCancelRsvp(id)
  const statusMutations = useEventStatusMutations(id)
  const deleteEvent = useDeleteEvent()
  const [confirm, setConfirm] = useState<null | 'cancel' | 'complete' | 'delete'>(null)
  const seamRef = useRef<HTMLDivElement>(null)

  const event = eventQuery.data

  useEffect(() => {
    const node = seamRef.current
    if (!node || reducedMotion) return
    node.classList.add('spread__seam--draw')
  }, [reducedMotion, event?.id])

  if (eventQuery.isLoading) {
    return (
      <div id="detail-root" aria-busy="true">
        <DetailSkeleton />
      </div>
    )
  }

  if (eventQuery.isError) {
    const notFound = eventQuery.error instanceof AppApiError && eventQuery.error.status === 404
    return (
      <div id="detail-root" aria-busy="false">
        {notFound ? (
          <NotFoundState
            crumbs={[{ label: 'Events', href: '/events' }, { label: 'Not found' }]}
            body="We couldn't find that event. It may have been removed."
          />
        ) : (
          <ErrorState onRetry={() => void eventQuery.refetch()} />
        )}
      </div>
    )
  }

  if (!event) {
    return (
      <div id="detail-root" aria-busy="false">
        <NotFoundState />
      </div>
    )
  }

  const isOwner = Boolean(user && user.id === event.organizerId)
  const isAuthed = authStatus === 'authenticated'
  const manage = isOwner && hasPermission(EventNestPermissions.Events.Edit)
  const canDelete = isOwner && hasPermission(EventNestPermissions.Events.Delete)
  const canManageAttendees = isOwner && hasPermission(EventNestPermissions.RSVPs.Manage)
  const ended = isPast(event.end) || event.status === 'Completed'
  const myRsvp = myRsvpQuery.data ?? null
  const tint = normalizeTag(event.tags[0]?.color ?? '', theme).fill

  const rsvpState: RsvpPanelState = !isAuthed
    ? 'anonymous'
    : isOwner
      ? 'owner'
      : event.status === 'Draft'
        ? 'draft'
        : event.status === 'Cancelled'
          ? 'cancelled'
          : ended
            ? 'ended'
            : hasPermission(EventNestPermissions.RSVPs.Create)
              ? 'open'
              : 'closed'

  async function submitRsvp(input: RsvpSubmitInput) {
    if (myRsvp) {
      await changeRsvp.mutateAsync({
        rsvpId: myRsvp.id,
        body: { status: input.status, guestCount: input.guestCount, notes: input.notes },
      })
    } else {
      const created = await saveRsvp.mutateAsync({
        guestCount: input.guestCount,
        notes: input.notes,
      })
      if (input.status !== 'Confirmed') {
        await changeRsvp.mutateAsync({
          rsvpId: created.id,
          body: { status: input.status, guestCount: input.guestCount, notes: input.notes },
        })
      }
    }
    push({
      kind: 'success',
      title: input.status === 'Confirmed' ? "You're going! 福" : 'RSVP saved',
      body: 'Your sticker is on the card.',
    })
  }

  async function cancelMyRsvp() {
    await cancelRsvp.mutateAsync()
    push({ kind: 'info', title: 'RSVP cancelled', body: 'The sticker came off cleanly.' })
  }

  async function publish() {
    await statusMutations.publish()
    push({ kind: 'success', title: 'Published!', body: 'The daruma has both eyes now. ●●' })
  }

  return (
    <div id="detail-root" aria-busy="false">
      <div className="stack-6">
        <Breadcrumbs items={[{ label: 'Events', href: '/events' }, { label: event.title }]} />
        <PageDoc
          title={event.title}
          overline="Event · 手帳"
          kanji="祭"
          tapeVariant="sora"
          cornerTape="sakura"
          titleClassName="wrap-anywhere"
          badges={
            <>
              <StatusBadge status={event.status} />
              <VisibilityBadge visibility={event.visibility} />
            </>
          }
          tags={event.tags.map((tag) => (
            <TagChip key={tag.id} tag={tag} />
          ))}
          actions={
            manage ? (
              <>
                <Link className="btn btn--secondary btn--sm" to={`/events/${event.id}/edit`}>
                  <Icon name="edit" size={16} />
                  Edit
                </Link>
                {event.status === 'Draft' ? (
                  <button type="button" className="btn btn--leaf btn--sm" onClick={() => void publish()}>
                    Publish
                  </button>
                ) : null}
              </>
            ) : null
          }
        />

        <div className="spread" id="spread-root">
          <div className="spread__postcard postcard">
            <div
              className="postcard__patch pattern pattern--chiyogami-asa"
              style={{ '--postcard-tint': tint } as CSSProperties}
              aria-hidden="true"
            >
              <PhotoCorners />
            </div>
            <div className="postcard__rule" role="presentation" />
            <section>
              <p className="postcard__overline">About this event</p>
              <p className="detail-desc" style={{ marginTop: 'var(--space-2)' }}>
                {event.description || 'No description yet.'}
              </p>
            </section>
            <div className="postcard__rule" role="presentation" />
            <MetaGrid
              rows={[
                {
                  icon: 'calendar',
                  term: 'Start',
                  detail: <time dateTime={event.start}>{fmtDateTime(event.start)}</time>,
                },
                {
                  icon: 'clock',
                  term: 'End',
                  detail: <time dateTime={event.end}>{fmtDateTime(event.end)}</time>,
                },
                { icon: 'pin', term: 'Location', detail: event.location },
                {
                  icon: 'user',
                  term: 'Organizer',
                  detail: (
                    <>
                      {event.organizerName} <span className="owner-chip">Organizer</span>
                    </>
                  ),
                },
                { icon: 'users', term: 'Capacity', detail: event.capacity, detailClassName: 'tnum' },
              ]}
            />
            {canManageAttendees ? (
              <div>
                <Link className="btn btn--secondary btn--sm" to={`/events/${event.id}/attendees`}>
                  View attendees →
                </Link>
              </div>
            ) : null}
            {ended ? <p className="detail-note">This event has ended on {fmtDate(event.end)}.</p> : null}
            {manage ? (
              <EventOrganizerStrip
                event={event}
                canEdit={manage}
                canDelete={canDelete}
                canManageAttendees={canManageAttendees}
                onEdit={() => navigate(`/events/${event.id}/edit`)}
                onPublish={() => void publish()}
                onCancel={() => setConfirm('cancel')}
                onComplete={() => setConfirm('complete')}
                onDelete={() => setConfirm('delete')}
                onAttendees={() => navigate(`/events/${event.id}/attendees`)}
              />
            ) : null}
          </div>

          <div ref={seamRef} className="spread__seam" id="spread-seam" aria-hidden="true" />

          <aside className="spread__reply reply-card">
            <div id="rsvp-slot">
              <RsvpPanel
                key={myRsvp?.id ?? 'new'}
                event={event}
                myRsvp={myRsvp}
                state={rsvpState}
                onSubmit={submitRsvp}
                onCancel={cancelMyRsvp}
                onPickRequired={() =>
                  push({
                    kind: 'info',
                    title: 'Pick a sticker',
                    body: 'Choose Going, Maybe, or Not Going first.',
                  })
                }
              />
            </div>
            <EventCapacityPanel going={event.going} capacity={event.capacity} />
          </aside>
        </div>
      </div>

      <ConfirmDialog
        open={confirm === 'cancel'}
        title="Cancel this event?"
        body={`'${event.title}' will be marked cancelled. Guests will see it's off.`}
        confirmLabel="Cancel event"
        danger
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          setConfirm(null)
          void statusMutations.cancel().then(() => {
            push({ kind: 'info', title: 'Event cancelled', body: 'Guests will see it\'s off.' })
          })
        }}
      />
      <ConfirmDialog
        open={confirm === 'complete'}
        title="Mark this event as complete?"
        body="It moves to the Completed tab."
        confirmLabel="Mark complete"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          setConfirm(null)
          void statusMutations.complete().then(() => {
            push({ kind: 'success', title: 'Event completed', body: 'Moved to Completed.' })
          })
        }}
      />
      <ConfirmDialog
        open={confirm === 'delete'}
        title="Delete this event?"
        body={`Delete '${event.title}'? This removes the event and its RSVPs. This can't be undone.`}
        confirmLabel="Delete event"
        danger
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          setConfirm(null)
          void deleteEvent.mutateAsync({ id: event.id, redirectTo: '/events' })
        }}
      />
    </div>
  )
}
