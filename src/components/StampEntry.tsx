import { Link } from 'react-router';

export type RsvpStatus = 'Confirmed' | 'Maybe' | 'Declined' | 'Cancelled';

interface RsvpData {
  id: string;
  eventId: string;
  eventTitle: string | null;
  status: RsvpStatus;
  guestCount: number;
  notes: string | null;
  respondedAt: string;
}

interface StampEntryProps {
  rsvp: RsvpData;
  isPast?: boolean;
  onChangeStatus?: (eventId: string, newStatus: string) => void;
  onCancel?: (eventId: string) => void;
}

const STAMP_MAP: Record<RsvpStatus, { glyph: string; label: string; cssClass: string }> = {
  Confirmed: { glyph: '✓', label: 'Going', cssClass: 'log-stamp--going' },
  Maybe: { glyph: '?', label: 'Maybe', cssClass: 'log-stamp--maybe' },
  Declined: { glyph: '⊘', label: 'Not Going', cssClass: 'log-stamp--notgoing' },
  Cancelled: { glyph: '✕', label: 'Cancelled', cssClass: 'log-stamp--cancelled' },
};

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function StampEntry({ rsvp, isPast = false, onChangeStatus, onCancel }: StampEntryProps) {
  const stamp = STAMP_MAP[rsvp.status];
  const otherStatuses = Object.keys(STAMP_MAP).filter((s) => s !== rsvp.status && s !== 'Cancelled') as RsvpStatus[];

  return (
    <article className={`log-entry${isPast ? ' is-past' : ''}${rsvp.status === 'Cancelled' ? ' is-cancelled' : ''}`}>
      <div className="log-entry__date">
        <time dateTime={rsvp.respondedAt}>{formatShortDate(rsvp.respondedAt)}</time>
      </div>
      <div className={`log-stamp ${stamp.cssClass}`} data-stamp>
        <span className="log-stamp__glyph" aria-hidden="true">{stamp.glyph}</span>
        <span className="log-stamp__label">{stamp.label}</span>
      </div>
      <div className="log-entry__body">
        <h3 className="log-entry__title">
          <Link to={`/events/${rsvp.eventId}`}>{rsvp.eventTitle || 'Event'}</Link>
        </h3>
        <p className="log-entry__meta">
          {rsvp.guestCount} guest{rsvp.guestCount === 1 ? '' : 's'} · Responded {formatDate(rsvp.respondedAt)}
        </p>
        {rsvp.notes && <p className="log-entry__notes">&ldquo;{rsvp.notes}&rdquo;</p>}
      </div>
      <div className="log-entry__actions">
        {rsvp.status !== 'Cancelled' && onChangeStatus && (
          <>
            {otherStatuses.map((s) => (
              <button
                key={s}
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={() => onChangeStatus(rsvp.eventId, s)}
              >
                Change to {STAMP_MAP[s].label}
              </button>
            ))}
            {onCancel && (
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => onCancel(rsvp.eventId)}
              >
                Cancel
              </button>
            )}
          </>
        )}
        {rsvp.status === 'Cancelled' && (
          <Link className="btn btn--secondary btn--sm" to={`/events/${rsvp.eventId}`}>
            RSVP again
          </Link>
        )}
        <Link className="btn btn--ghost btn--sm" to={`/events/${rsvp.eventId}`}>
          View event →
        </Link>
      </div>
    </article>
  );
}
