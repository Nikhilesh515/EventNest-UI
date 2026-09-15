import { Link } from 'react-router';

export type RsvpStatus = 'Confirmed' | 'Maybe' | 'Declined' | 'Cancelled';

interface RsvpData {
  id: string;
  eventId: string;
  eventTitle: string | null;
  eventStartsAt: string | null;
  eventLocation: string | null;
  status: RsvpStatus;
  guestCount: number;
  notes: string | null;
  respondedAt: string;
}

interface StampEntryProps {
  rsvp: RsvpData;
  isPast?: boolean;
  onChangeStatus?: (rsvpId: string, newStatus: RsvpStatus) => void;
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

function formatTime(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours();
  const m = d.getMinutes();
  const ap = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${ap}`;
}

export function StampEntry({ rsvp, isPast = false, onChangeStatus, onCancel }: StampEntryProps) {
  const stamp = STAMP_MAP[rsvp.status];
  const otherStatuses = (['Confirmed', 'Maybe', 'Declined'] as RsvpStatus[]).filter(
    (s) => s !== rsvp.status,
  );
  const eventDate = rsvp.eventStartsAt || rsvp.respondedAt;

  return (
    <article className={`log-entry${isPast ? ' is-past' : ''}${rsvp.status === 'Cancelled' ? ' is-cancelled' : ''}`}>
      <div className="log-entry__date">
        <time dateTime={eventDate}>{formatShortDate(eventDate)}</time>
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
          {rsvp.eventLocation ? `${rsvp.eventLocation} · ` : ''}
          {rsvp.eventStartsAt ? `${formatTime(rsvp.eventStartsAt)} · ` : ''}
          {rsvp.guestCount} guest{rsvp.guestCount === 1 ? '' : 's'} · Responded {formatShortDate(rsvp.respondedAt)}
        </p>
        {rsvp.notes && <p className="log-entry__notes">&ldquo;{rsvp.notes}&rdquo;</p>}
      </div>
      <div className="log-entry__actions">
        {rsvp.status !== 'Cancelled' && onChangeStatus && (
          <>
            <details className="log-entry__change">
              <summary className="btn btn--secondary btn--sm">Change ▾</summary>
              <div className="log-entry__change-menu">
                {otherStatuses.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="menu-item"
                    onClick={() => onChangeStatus(rsvp.id, s)}
                  >
                    {STAMP_MAP[s].label}
                  </button>
                ))}
              </div>
            </details>
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
        <Link className="btn btn--ghost btn--sm" to={`/events/${rsvp.eventId}`}>
          View event →
        </Link>
      </div>
    </article>
  );
}
