import { Link } from 'react-router';
import { MetaGrid } from './MetaGrid';
import { normalizeTag } from '../lib/tag-style';
import { useColorMode } from '../lib/theme-store';
import { formatDateTimeWithWeekday } from '../lib/date';
import type { Event } from '../types';

interface PostcardProps {
  event: Event;
  isOwner: boolean;
  canManage: boolean;
  hasManageRsvp: boolean;
  isEnded: boolean;
  onPublish?: (id: string) => void;
  onCancel?: (id: string) => void;
  onDelete?: (id: string) => void;
  loading?: boolean;
}

export function Postcard({
  event,
  isOwner,
  canManage,
  hasManageRsvp,
  isEnded,
  onPublish,
  onCancel,
  onDelete,
  loading,
}: PostcardProps) {
  const mode = useColorMode();
  const firstTagColor = event.tags[0]?.color || '#A8D8EA';
  const patchTint = normalizeTag(firstTagColor, mode).fill;

  return (
    <div className="spread__postcard postcard">
      <div
        className="postcard__patch pattern pattern--chiyogami-asa"
        style={{ '--postcard-tint': patchTint } as React.CSSProperties}
        aria-hidden="true"
      >
        <span className="photo-corners" aria-hidden="true">
          <span></span><span></span><span></span><span></span>
        </span>
      </div>

      <div className="postcard__rule" role="presentation" />

      <section>
        <p className="postcard__overline">About this event</p>
        <p className="detail-desc" style={{ marginTop: 'var(--space-2)' }}>
          {event.description || 'No description yet.'}
        </p>
      </section>

      <div className="postcard__rule" role="presentation" />

      <MetaGrid items={[
        { icon: '📅', label: 'Start', value: formatDateTimeWithWeekday(event.startsAt), datetime: event.startsAt },
        { icon: '🕐', label: 'End', value: formatDateTimeWithWeekday(event.endsAt), datetime: event.endsAt },
        { icon: '📍', label: 'Location', value: event.location || 'TBD' },
        { icon: '👤', label: 'Organizer', value: event.organizerName },
        { icon: '👥', label: 'Capacity', value: String(event.capacity), className: 'tnum' },
      ]} />

      {hasManageRsvp && isOwner && (
        <div>
          <Link className="btn btn--secondary btn--sm" to={`/events/${event.id}/attendees`}>
            View attendees →
          </Link>
        </div>
      )}

      {isEnded && (
        <p className="detail-note">
          This event has ended on {formatDateTimeWithWeekday(event.endsAt)}.
        </p>
      )}

      {canManage && (
        <section className="organizer-strip">
          <p className="page-doc__overline">Organizer sticker strip</p>
          <div className="action-bar">
            <Link className="btn btn--secondary btn--sm" to={`/events/${event.id}/edit`}>Edit</Link>
            {event.status === 'Draft' && (
              <button
                type="button"
                className="btn btn--leaf btn--sm"
                onClick={() => onPublish?.(event.id)}
                disabled={loading}
              >
                Publish
              </button>
            )}
            {event.status === 'Published' && (
              <button
                type="button"
                className="btn btn--sun btn--sm"
                onClick={() => onCancel?.(event.id)}
                disabled={loading}
              >
                Cancel event
              </button>
            )}
            {hasManageRsvp && (
              <Link className="btn btn--secondary btn--sm" to={`/events/${event.id}/attendees`}>
                View attendees
              </Link>
            )}
          </div>
          <div className="action-bar action-bar--danger">
            <button
              type="button"
              className="btn btn--danger btn--sm"
              onClick={() => onDelete?.(event.id)}
              disabled={loading}
            >
              Delete
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
