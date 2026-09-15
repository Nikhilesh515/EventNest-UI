import { Link } from 'react-router';
import { TagChipList } from './TagChip';
import { StatusBadge, VisBadge } from './Badges';

interface EventTag {
  id: string;
  name: string;
  color: string;
}

interface Event {
  id: string;
  title: string;
  location: string;
  startsAt: string;
  capacity: number;
  goingCount: number;
  organizerName: string;
  status: string;
  visibility: string;
  tags: EventTag[];
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function fmtTime(iso: string) {
  const d = new Date(iso);
  const h = d.getHours();
  const m = d.getMinutes();
  const ap = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${ap}`;
}

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
            {' '}· {fmtTime(event.startsAt)} · {event.location} · {event.goingCount}/{event.capacity}
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
