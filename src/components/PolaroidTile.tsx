import { Link } from 'react-router';
import type { MosaicSlot } from '../lib/mosaic';
import { tilePatternClass } from '../lib/mosaic';

interface EventTag {
  id: string;
  name: string;
  color: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  organizerId: string;
  organizerName: string;
  status: string;
  visibility: string;
  tags: EventTag[];
  createdAt: string;
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const DOW = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function dateFlag(iso: string) {
  const d = new Date(iso);
  return {
    md: `${MONTHS[d.getMonth()]} ${d.getDate()}`,
    dow: DOW[d.getDay()],
  };
}

function fmtTimeRangeSameDay(start: string, end: string) {
  const a = new Date(start);
  const b = new Date(end);
  const fmt = (d: Date) => {
    const h = d.getHours();
    const m = d.getMinutes();
    const ap = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${ap}`;
  };
  if (a.toDateString() === b.toDateString()) {
    return `${fmt(a)}–${fmt(b)}`;
  }
  return `${fmt(a)} – ${fmt(b)}`;
}

function statusColor(status: string) {
  switch (status) {
    case 'Published': return 'badge--published';
    case 'Draft': return 'badge--draft';
    case 'Cancelled': return 'badge--cancelled';
    case 'Completed': return 'badge--completed';
    default: return '';
  }
}

function tileTint(event: Event) {
  const tints = ['rgba(255,180,162,.08)', 'rgba(162,189,255,.08)', 'rgba(255,217,61,.08)', 'rgba(162,255,209,.08)'];
  const hash = event.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return tints[hash % tints.length];
}

interface PolaroidTileProps {
  event: Event;
  slot: MosaicSlot;
}

export function PolaroidTile({ event, slot }: PolaroidTileProps) {
  const flag = dateFlag(event.startsAt);
  const kind = slot.kind;

  let cls = `tile tile--${kind} ${slot.cls}`;
  if (event.status === 'Cancelled') cls += ' tile--cancelled';
  if (event.status === 'Draft') cls += ' tile--draft';

  const tagMax = kind === 'feature' ? 3 : kind === 'portrait' ? 2 : 1;
  const eventTags = (event.tags || []).slice(0, tagMax);

  return (
    <article
      className={cls}
      style={{ '--tile-rot': `${slot.rot}deg`, '--tile-tint': tileTint(event) } as React.CSSProperties}
      data-event-id={event.id}
      role="listitem"
    >
      <div className="tile__polaroid">
        <div className={`tile__photo pattern ${tilePatternClass(event.id)}`}>
          <span className="tile__date-flag">{flag.md} · {flag.dow}</span>
          <span className="photo-corners" aria-hidden="true"><span /><span /><span /><span /></span>
        </div>
        <div className="tile__caption">
          <div className="tile__badges">
            <span className={`badge ${statusColor(event.status)}`}>{event.status}</span>
            {event.visibility === 'Private' && <span className="badge badge--private">Private</span>}
          </div>
          <h3 className="tile__title">
            <Link className="tile__stretch" to={`/events/${event.id}`} title={event.title}>
              {event.title}
            </Link>
          </h3>
          <div className="tile__tags">
            {eventTags.map((t) => (
              <span key={t.id} className="tag-chip tag-chip--sm" style={{ '--tag-hex': t.color } as React.CSSProperties}>
                {t.name}
              </span>
            ))}
          </div>
          <div className="tile__rule" />
          <div className="tile__meta">
            {kind === 'wide' ? (
              <div className="tile__meta-row">
                <span>{fmtTimeRangeSameDay(event.startsAt, event.endsAt)} · {event.location}</span>
              </div>
            ) : kind === 'portrait' ? (
              <div className="tile__meta-row">
                <span>{fmtTimeRangeSameDay(event.startsAt, event.endsAt)} · {event.location}</span>
              </div>
            ) : (
              <>
                <div className="tile__meta-row">
                  <span>{fmtTimeRangeSameDay(event.startsAt, event.endsAt)}</span>
                </div>
                <div className="tile__meta-row">
                  <span>{event.location}</span>
                </div>
              </>
            )}
          </div>
          <div className="tile__footer">
            <span className="tile__cap-num">
              {kind === 'feature' && event.organizerName}
              {kind === 'portrait' && event.capacity}
              {kind === 'wide' && event.capacity}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
