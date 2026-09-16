import { useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { AttendeeTable } from '../components/AttendeeTable';
import { normalizeTag } from '../lib/tag-style';
import { useColorMode } from '../lib/theme-store';
import { useState } from 'react';
import type { Event, Rsvp } from '../types';

interface EventResponse {
  result: Event;
}

interface RsvpsResponse {
  result: Rsvp[];
}

type FilterKey = 'all' | 'going' | 'maybe' | 'notgoing' | 'cancelled';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'going', label: 'Going' },
  { key: 'maybe', label: 'Maybe' },
  { key: 'notgoing', label: 'Not going' },
  { key: 'cancelled', label: 'Cancelled' },
];

export function AttendeesPage() {
  const { id } = useParams<{ id: string }>();
  const mode = useColorMode();
  const [filter, setFilter] = useState<FilterKey>('all');

  const { data: eventData } = useQuery({
    queryKey: ['event', id],
    queryFn: () => api.get<EventResponse>(`/api/events/${id}`),
    enabled: !!id,
  });

  const { data: rsvpsData, isLoading } = useQuery({
    queryKey: ['attendees', id],
    queryFn: () => api.get<RsvpsResponse>(`/api/events/${id}/rsvps`),
    enabled: !!id,
  });

  const event = eventData?.result;
  const rsvps = rsvpsData?.result || [];

  const counts: Record<FilterKey, number> = {
    all: rsvps.length,
    going: rsvps.filter((r) => r.status === 'Confirmed').length,
    maybe: rsvps.filter((r) => r.status === 'Maybe').length,
    notgoing: rsvps.filter((r) => r.status === 'Declined').length,
    cancelled: rsvps.filter((r) => r.status === 'Cancelled').length,
  };

  const guestsBy = (status: string) =>
    rsvps.filter((r) => r.status === status).reduce((sum, r) => sum + r.guestCount, 0);

  const goingCount = guestsBy('Confirmed');
  const initials = (event?.organizerName || '?')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="stack-6">
      <Breadcrumbs items={[
        { label: 'My Events', href: '/my-events' },
        { label: event?.title || 'Event', href: `/events/${id}` },
        { label: 'Attendees' },
      ]} />

      <div className="guestbook">
        <div className="guestbook__head">
          <span className="guestbook__watermark kanji-watermark" aria-hidden="true" lang="ja">縁</span>
          <span
            className="guestbook__frame"
            aria-hidden="true"
            style={{ '--frame-tint': normalizeTag(event?.tags?.[0]?.color, mode).edge } as React.CSSProperties}
          >
            {initials}
          </span>
          <div className="guestbook__titles">
            <p className="page-doc__overline">Attendees · 縁</p>
            <h1 className="page-doc__title">Attendees</h1>
            {event && (
              <p className="page-doc__sub">
                Capacity {event.capacity} · {goingCount} going · {Math.max(0, event.capacity - goingCount)} spots left
              </p>
            )}
          </div>
          {event && (
            <Link className="btn btn--secondary btn--sm" to={`/events/${id}`}>View event →</Link>
          )}
        </div>

        <div className="stats-wrap" style={{ marginTop: 'var(--space-5)' }}>
          <div className="stat-row">
            <div className="stat stat--going">
              <span className="stat__label">Going</span>
              <span className="stat__value tnum">{guestsBy('Confirmed')}</span>
              <span className="stat__sub">people</span>
            </div>
            <div className="stat stat--maybe">
              <span className="stat__label">Maybe</span>
              <span className="stat__value tnum">{guestsBy('Maybe')}</span>
              <span className="stat__sub">people</span>
            </div>
            <div className="stat stat--notgoing">
              <span className="stat__label">Not going</span>
              <span className="stat__value tnum">{guestsBy('Declined')}</span>
              <span className="stat__sub">people</span>
            </div>
            <div className="stat stat--cancelled">
              <span className="stat__label">Cancelled</span>
              <span className="stat__value tnum">{guestsBy('Cancelled')}</span>
              <span className="stat__sub">people</span>
            </div>
            <div className="stat stat--guests">
              <span className="stat__label">Total guests</span>
              <span className="stat__value tnum">{goingCount} / {event?.capacity || 0}</span>
              <span className="stat__sub">going people</span>
            </div>
          </div>

          <div className="filter-chips">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                className={`filter-chip${filter === f.key ? ' is-active' : ''}`}
                aria-pressed={filter === f.key}
                onClick={() => setFilter(f.key)}
              >
                {f.label} <span className="filter-chip__n">({counts[f.key]})</span>
              </button>
            ))}
          </div>

          {isLoading ? (
            <p style={{ textAlign: 'center', padding: 'var(--space-6)' }}>Loading…</p>
          ) : (
            <AttendeeTable attendees={rsvps} filter={filter} />
          )}
        </div>
      </div>
    </div>
  );
}
