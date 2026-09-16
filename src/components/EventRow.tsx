import { Link } from 'react-router';
import { TagChipList } from './TagChip';
import { StatusBadge, VisBadge } from './Badges';
import { MONTHS, formatTime } from '../lib/date';
import type { Event } from '../types';

export function EventRow({ event }: { event: Event }) {
  const d = new Date(event.startsAt);
  const full = event.capacity > 0 && event.goingCount >= event.capacity;
  const cls = `event-row${event.status === 'Cancelled' ? ' event-card--cancelled' : ''}`;

  return (
    <article className={cls} data-event-id={event.id}>
      <div className="event-row__date">
        <span className="d">{d.getDate()}</span>
        <span>{MONTHS[d.getMonth()]}</span>
      </div>
      <div className="event-row__main">
        <div className="event-row__title">
          <Link to={`/events/${event.id}`}>{event.title}</Link>
        </div>
        <div className="event-row__meta">
          <TagChipList tags={event.tags ?? []} max={4} />
          <span>
            {' '}· {formatTime(event.startsAt)} · {event.location} · {event.goingCount}/{event.capacity}
            {full ? ' FULL' : ''}
          </span>
        </div>
      </div>
      <div className="event-row__side">
        <StatusBadge status={event.status} />
        <VisBadge visibility={event.visibility} />
        <span className="pager-meta">{event.organizerName}</span>
      </div>
    </article>
  );
}
