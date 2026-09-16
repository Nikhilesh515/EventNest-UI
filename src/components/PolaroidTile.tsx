import { Link } from 'react-router';
import type { MosaicSlot } from '../lib/mosaic';
import { tilePatternClass, washiVariant } from '../lib/mosaic';
import type { ColorMode } from '../lib/tag-style';
import { normalizeTag } from '../lib/tag-style';
import { useColorMode } from '../lib/theme-store';
import { formatDateFlag, formatShortDate, formatTimeRange } from '../lib/date';
import type { Event } from '../types';
import { Icon } from './Icon';
import { TagChipList } from './TagChip';
import { StatusBadge, VisBadge } from './Badges';

function tileTint(event: Event, mode: ColorMode) {
  return normalizeTag(event.tags?.[0]?.color, mode).fill;
}

function tileAria(event: Event) {
  const full = event.capacity > 0 && event.goingCount >= event.capacity;
  return `${event.title}, ${new Date(event.startsAt).toDateString()}, ${event.status}, ${
    full ? 'full' : `${event.goingCount} of ${event.capacity} going`
  }`;
}

interface PolaroidTileProps {
  event: Event;
  slot: MosaicSlot;
  taped?: boolean;
}

export function PolaroidTile({ event, slot, taped = false }: PolaroidTileProps) {
  const mode = useColorMode();
  const flag = formatDateFlag(event.startsAt);
  const kind = slot.kind;
  const full = event.capacity > 0 && event.goingCount >= event.capacity;
  // eslint-disable-next-line react-hooks/purity -- render-time clock read drives the tile--past class
  const isPast = new Date(event.endsAt).getTime() < Date.now();

  let cls = `tile tile--${kind} ${slot.cls}`;
  if (event.status === 'Cancelled') cls += ' tile--cancelled';
  if (event.status === 'Draft') cls += ' tile--draft';
  if (full) cls += ' tile--full';
  if (isPast) cls += ' tile--past';

  const tagMax = kind === 'feature' ? 3 : kind === 'portrait' ? 2 : 1;
  const tagTilts = [-1.5, 1.5, -0.8];
  const pct = event.capacity > 0 ? Math.round((event.goingCount / event.capacity) * 100) : 0;

  return (
    <article
      className={cls}
      style={{ '--tile-rot': `${slot.rot}deg`, '--tile-tint': tileTint(event, mode) } as React.CSSProperties}
      data-event-id={event.id}
      aria-label={tileAria(event)}
      role="listitem"
    >
      <div className="tile__polaroid">
        <div className={`tile__photo pattern ${tilePatternClass(event.id)}`}>
          {taped && (
            <span
              className={`washi tile__washi washi--${washiVariant(slot.index)}`}
              aria-hidden="true"
            />
          )}
          <span className="tile__date-flag">{flag.md} · {flag.dow}</span>
          <span className="photo-corners" aria-hidden="true"><span /><span /><span /><span /></span>
        </div>
        <div className="tile__caption">
          <div className="tile__badges">
            <StatusBadge status={event.status} />
            {kind !== 'wide' && <VisBadge visibility={event.visibility} />}
            {full && <span className="badge badge--full">FULL</span>}
          </div>
          <h3 className="tile__title">
            <Link className="tile__stretch" to={`/events/${event.id}`} title={event.title}>
              {event.title}
            </Link>
          </h3>
          <div className="tile__tags">
            <TagChipList tags={event.tags ?? []} max={tagMax} tilts={tagTilts} />
          </div>
          <div className="tile__rule" />
          <div className="tile__meta">
            {kind === 'wide' ? (
              <div className="tile__meta-row">
                <Icon name="clock" size={14} />
                <span>{formatTimeRange(event.startsAt, event.endsAt)} · {event.location}</span>
              </div>
            ) : kind === 'portrait' ? (
              <div className="tile__meta-row">
                <Icon name="clock" size={14} />
                <span>{formatTimeRange(event.startsAt, event.endsAt)} · {event.location}</span>
              </div>
            ) : (
              <>
                <div className="tile__meta-row">
                  <Icon name="calendar" size={14} />
                  <span>{formatShortDate(event.startsAt)} · {formatTimeRange(event.startsAt, event.endsAt)}</span>
                </div>
                <div className="tile__meta-row">
                  <Icon name="pin" size={14} />
                  <span>{event.location}</span>
                </div>
              </>
            )}
          </div>
          <div className="tile__footer">
            {kind === 'feature' && <span className="tile__cap-num">{event.organizerName}</span>}
            {kind === 'portrait' && (
              <span className="tile__cap-num">{full ? 'FULL' : `${event.goingCount} / ${event.capacity}`}</span>
            )}
            {kind === 'wide' && (
              <span className="tile__cap-num">{event.goingCount} / {event.capacity}</span>
            )}
          </div>
          {kind !== 'wide' && (
            <div className={`capacity${pct >= 100 ? ' capacity--full' : pct >= 70 ? ' capacity--near' : ''}`}>
              <div
                className="capacity__track"
                role="progressbar"
                aria-valuenow={event.goingCount}
                aria-valuemin={0}
                aria-valuemax={event.capacity}
                aria-valuetext={`${event.goingCount} of ${event.capacity} going`}
              >
                <div className="capacity__fill" style={{ '--cap-pct': `${pct}%` } as React.CSSProperties} />
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
