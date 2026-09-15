import { Link } from 'react-router';

interface EventTag {
  id: string;
  name: string;
  color: string;
}

interface EventData {
  id: string;
  title: string;
  location: string | null;
  startsAt: string;
  endsAt: string;
  status: string;
  visibility: string;
  tags: EventTag[];
}

interface PunchRowProps {
  event: EventData;
  onPublish?: (id: string) => void;
  onCancel?: (id: string) => void;
  onComplete?: (id: string) => void;
  onDelete?: (id: string) => void;
  loading?: boolean;
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function statusBadge(status: string): string {
  const map: Record<string, string> = {
    Draft: 'badge--draft',
    Published: 'badge--published',
    Cancelled: 'badge--cancelled',
    Completed: 'badge--completed',
  };
  return map[status] || '';
}

export function PunchRow({ event, onPublish, onCancel, onComplete, onDelete, loading }: PunchRowProps) {
  const isPast = new Date(event.endsAt) < new Date();
  const tagNames = event.tags.map((t) => t.name).join(', ');

  return (
    <article className={`punch-row${event.status === 'Cancelled' ? ' is-cancelled' : ''}${event.status === 'Draft' ? ' is-draft' : ''}`}>
      <div className="punch-row__head">
        <div className="punch-row__date">
          <span>{formatShortDate(event.startsAt)}</span>
        </div>
        <div className="punch-row__body">
          <h2 className="punch-row__title">
            <Link to={`/events/${event.id}`}>{event.title}</Link>
          </h2>
          <p className="punch-row__meta">
            {tagNames && `${tagNames} · `}
            {formatTime(event.startsAt)}
            {event.location && ` · ${event.location}`}
          </p>
        </div>
        <div className="cluster">
          <span className={`badge ${statusBadge(event.status)}`}>{event.status}</span>
        </div>
      </div>
      <div className="punch-row__actions">
        <Link className="btn btn--secondary btn--sm" to={`/events/${event.id}/edit`}>Edit</Link>
        {event.status === 'Draft' && onPublish && (
          <button type="button" className="btn btn--leaf btn--sm" onClick={() => onPublish(event.id)} disabled={loading}>
            Publish
          </button>
        )}
        {event.status === 'Published' && onCancel && (
          <button type="button" className="btn btn--sun btn--sm" onClick={() => onCancel(event.id)} disabled={loading}>
            Cancel
          </button>
        )}
        {event.status === 'Published' && isPast && onComplete && (
          <button type="button" className="btn btn--leaf btn--sm" onClick={() => onComplete(event.id)} disabled={loading}>
            Complete
          </button>
        )}
        <Link className="btn btn--secondary btn--sm" to={`/events/${event.id}/attendees`}>Attendees</Link>
        {onDelete && (
          <button type="button" className="btn btn--danger btn--sm" onClick={() => onDelete(event.id)} disabled={loading}>
            Delete
          </button>
        )}
      </div>
    </article>
  );
}
