import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { Icon } from './Icon';
import { StatusBadge, VisBadge } from './Badges';

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
  capacity: number;
  goingCount: number;
  maybeCount: number;
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

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function formatDateFlag(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function PunchRow({ event, onPublish, onCancel, onComplete, onDelete, loading }: PunchRowProps) {
  const isPast = new Date(event.endsAt) < new Date();
  const full = event.capacity > 0 && event.goingCount >= event.capacity;
  const tagNames = event.tags.map((t) => t.name).join(' · ');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  return (
    <article className={`punch-row${event.status === 'Cancelled' ? ' is-cancelled' : ''}${event.status === 'Draft' ? ' is-draft' : ''}`}>
      <div className="punch-row__head">
        <div className="punch-row__date">
          <span>{formatDateFlag(event.startsAt)}</span>
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
          <p className="punch-row__counts tnum">
            Going {event.goingCount} · Maybe {event.maybeCount} · {event.capacity} cap
            {full && <> · <span style={{ color: 'var(--text-danger)' }}>FULL</span></>}
          </p>
        </div>
        <div className="cluster">
          <StatusBadge status={event.status} />
          <VisBadge visibility={event.visibility} />
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
        <div className="menu-wrap" ref={menuRef}>
          <button
            type="button"
            className="icon-btn"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={`More actions for ${event.title}`}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Icon name="chevron-down" size={16} />
          </button>
          {menuOpen && (
            <div className="menu-panel" role="menu">
              <Link className="menu-item" role="menuitem" to={`/events/${event.id}/edit`} onClick={() => setMenuOpen(false)}>
                <Icon name="edit" size={16} /> Edit
              </Link>
              {onDelete && (
                <button
                  type="button"
                  className="menu-item menu-item--danger"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(event.id);
                  }}
                  disabled={loading}
                >
                  <Icon name="trash" size={16} /> Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
