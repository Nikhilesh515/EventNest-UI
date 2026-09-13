import { useState } from 'react'

import { Icon } from '@/components/icons/Icon'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { ConfirmDialog } from '@/components/overlays/ConfirmDialog'
import { FEATURES } from '@/lib/features'
import { useEventStatusMutations } from '@/features/events/useEventStatusMutations'
import { useDeleteEvent } from '@/features/events/useDeleteEvent'
import type { EventDto } from '@/types'

export interface FormNotice {
  kind: 'success' | 'info' | 'error'
  title: string
  body?: string
}

export function EventStatusStrip({
  event,
  onNotify,
}: {
  event: EventDto
  onNotify?(notice: FormNotice): void
}) {
  const statusMutations = useEventStatusMutations(event.id)
  const deleteEvent = useDeleteEvent()
  const [confirm, setConfirm] = useState<null | 'cancel' | 'complete' | 'delete'>(null)
  const ended = new Date(event.end).getTime() < Date.now()

  return (
    <>
      <div className="clipboard-status edit-status-strip">
        <span className="field__label">Status: {event.status}</span>
        <StatusBadge status={event.status} />
        {event.status === 'Draft' ? (
          <button
            type="button"
            className="btn btn--leaf btn--sm"
            onClick={() =>
              void statusMutations.publish().then(() =>
                onNotify?.({
                  kind: 'success',
                  title: 'Published!',
                  body: 'The daruma has both eyes now. ●●',
                }),
              )
            }
          >
            Publish
          </button>
        ) : null}
        {event.status === 'Published' ? (
          <button
            type="button"
            className="btn btn--sun btn--sm"
            onClick={() => setConfirm('cancel')}
          >
            Cancel event
          </button>
        ) : null}
        {FEATURES.eventComplete && event.status === 'Published' && ended ? (
          <button
            type="button"
            className="btn btn--leaf btn--sm"
            onClick={() => setConfirm('complete')}
          >
            Mark complete
          </button>
        ) : null}
      </div>
      <div className="clipboard-danger">
        <button
          type="button"
          className="btn btn--danger btn--sm"
          onClick={() => setConfirm('delete')}
        >
          <Icon name="trash" size={16} />
          Delete event
        </button>
      </div>
      <ConfirmDialog
        open={confirm === 'cancel'}
        title="Cancel this event?"
        body={`Cancel '${event.title}'. Guests will see it's off.`}
        confirmLabel="Cancel event"
        danger
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          setConfirm(null)
          void statusMutations
            .cancel()
            .then(() =>
              onNotify?.({
                kind: 'info',
                title: 'Event cancelled',
                body: "Guests will see it's off.",
              }),
            )
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
          void statusMutations
            .complete()
            .then(() =>
              onNotify?.({ kind: 'success', title: 'Completed', body: 'A hanko star for the stall.' }),
            )
        }}
      />
      <ConfirmDialog
        open={confirm === 'delete'}
        title="Delete this event?"
        body={`Delete '${event.title}'? This can't be undone.`}
        confirmLabel="Delete event"
        danger
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          setConfirm(null)
          void deleteEvent.mutateAsync({ id: event.id, redirectTo: '/my-events' }).then(() =>
            onNotify?.({
              kind: 'info',
              title: 'Event deleted',
              body: "The table's a little emptier.",
            }),
          )
        }}
      />
    </>
  )
}
