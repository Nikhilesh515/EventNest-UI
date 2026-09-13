import { Icon } from '@/components/icons/Icon'
import type { EventDto } from '@/types'

interface EventOrganizerStripProps {
  event: EventDto
  canEdit: boolean
  canDelete: boolean
  canManageAttendees: boolean
  onEdit(): void
  onPublish(): void
  onCancel(): void
  onComplete(): void
  onDelete(): void
  onAttendees(): void
}

export function EventOrganizerStrip({
  event,
  canEdit,
  canDelete,
  canManageAttendees,
  onEdit,
  onPublish,
  onCancel,
  onComplete,
  onDelete,
  onAttendees,
}: EventOrganizerStripProps) {
  const ended = new Date(event.end).getTime() < Date.now()
  return (
    <section className="organizer-strip">
      <p className="page-doc__overline">Organizer sticker strip</p>
      <div className="action-bar">
        {canEdit ? (
          <button type="button" className="btn btn--secondary btn--sm" onClick={onEdit}>
            <Icon name="edit" size={16} />
            Edit
          </button>
        ) : null}
        {event.status === 'Draft' && canEdit ? (
          <button type="button" className="btn btn--leaf btn--sm" onClick={onPublish}>
            Publish
          </button>
        ) : null}
        {event.status === 'Published' && canEdit ? (
          <button type="button" className="btn btn--sun btn--sm" onClick={onCancel}>
            Cancel event
          </button>
        ) : null}
        {event.status === 'Published' && ended && canEdit ? (
          <button type="button" className="btn btn--leaf btn--sm" onClick={onComplete}>
            Mark complete
          </button>
        ) : null}
        {canManageAttendees ? (
          <button type="button" className="btn btn--secondary btn--sm" onClick={onAttendees}>
            View attendees
          </button>
        ) : null}
      </div>
      {canDelete ? (
        <div className="action-bar action-bar--danger">
          <button type="button" className="btn btn--danger btn--sm" onClick={onDelete}>
            <Icon name="trash" size={16} />
            Delete
          </button>
        </div>
      ) : null}
    </section>
  )
}
