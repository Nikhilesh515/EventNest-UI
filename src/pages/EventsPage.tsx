import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore } from '../lib/auth-store';
import { MosaicGrid } from '../components/MosaicGrid';
import { FilterDrawer, type FilterState } from '../components/FilterDrawer';
import { PageHeader } from '../components/PageHeader';
import '../styles/tile-layout.css';

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

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface EventsResponse {
  code: number;
  success: boolean;
  result: {
    items: Event[];
    total: number;
    page: number;
    size: number;
    pages: number;
  };
}

interface TagsResponse {
  code: number;
  success: boolean;
  result: { items: Tag[] };
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

export function EventsPage() {
  const { user } = useAuthStore();
  const [filters, setFilters] = useState<FilterState>({
    timeframe: 'upcoming',
    tags: [],
    visibility: 'all',
    status: 'all',
    sort: 'date-asc',
  });
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['events', filters, search],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.timeframe !== 'all') params.set('timeframe', filters.timeframe);
      if (filters.visibility !== 'all') params.set('visibility', filters.visibility);
      if (filters.status !== 'all') params.set('status', filters.status);
      if (filters.sort) params.set('sort', filters.sort);
      if (search) params.set('q', search);
      params.set('size', '9');
      return api.get<EventsResponse>(`/api/events?${params.toString()}`);
    },
  });

  const { data: tagsData } = useQuery({
    queryKey: ['tags'],
    queryFn: () => api.get<TagsResponse>('/api/tags'),
  });

  const tags: Tag[] = tagsData?.result?.items || [];
  const events = eventsData?.result?.items || [];
  const total = eventsData?.result?.total || events.length;
  const canCreate = user?.role === 'Admin' || user?.role === 'SuperAdmin';

  const activeFilters = (filters.tags.length > 0 ? 1 : 0) +
    (filters.visibility !== 'all' ? 1 : 0) +
    (filters.status !== 'all' ? 1 : 0);

  return (
    <div className="template--collage">
      <PageHeader
        className="collage-hero"
        overline="祭"
        title="Find your next festival."
        subtitle="Discover events near you and paste yourself in."
        tapeWidth="full"
        actions={
          canCreate ? (
            <a className="btn btn--primary" href="/events/new">+ Create event</a>
          ) : undefined
        }
      />

      <div style={{ marginTop: 'var(--space-5)' }}>
        <p className="collage-hero__count">{total} events on the table</p>
        <form className="collage-search" role="search" onSubmit={(e) => { e.preventDefault(); }}>
          <div className="collage-search__row">
            <div className="search-field">
              <span className="search-field__icon" aria-hidden="true"><SearchIcon /></span>
              <label className="sr-only" htmlFor="event-search">Search events</label>
              <input
                id="event-search"
                type="search"
                className="input"
                autoComplete="off"
                placeholder="Search events by title, place, or vibe…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="btn btn--primary" type="submit">Search</button>
          </div>
        </form>
      </div>

      <div className="sheet-tools">
        <div className="sheet-tools__row">
          <div className="tabs" role="tablist" aria-label="Timeframe">
            {['upcoming', 'past', 'all'].map((tf) => (
              <button
                key={tf}
                type="button"
                role="tab"
                className="tab"
                aria-selected={filters.timeframe === tf}
                onClick={() => setFilters((f) => ({ ...f, timeframe: tf }))}
              >
                {tf.charAt(0).toUpperCase() + tf.slice(1)}
              </button>
            ))}
          </div>
          <div className="sheet-tools__end">
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={() => setDrawerOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={drawerOpen}
            >
              <FilterIcon /> Filters ({activeFilters})
            </button>
            <label className="sr-only" htmlFor="sort-filter">Sort</label>
            <select
              id="sort-filter"
              className="select select--inline"
              value={filters.sort}
              onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
            >
              <option value="date-asc">Date · soonest</option>
              <option value="date-desc">Date · latest</option>
              <option value="created-desc">Newest created</option>
              <option value="popular">Most popular</option>
            </select>
          </div>
        </div>
        <div className="sheet-tools__row">
          <span className="sheet-tools__count" aria-live="polite">
            {isLoading ? 'Loading…' : `${total} result${total !== 1 ? 's' : ''}`}
          </span>
        </div>
      </div>

      <div id="events-results" className="collection" aria-busy={isLoading}>
        {isLoading ? (
          <div className="mosaic">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="tile skeleton" style={{ gridColumn: 'span 2', gridRow: 'span 1' }}>
                <div className="tile__polaroid">
                  <div className="tile__photo skeleton-photo" />
                  <div className="tile__caption">
                    <div className="skeleton-line skeleton-line--short" />
                    <div className="skeleton-line" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <p>No events found. Try adjusting your filters.</p>
          </div>
        ) : (
          <MosaicGrid events={events} />
        )}
      </div>

      <FilterDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onApply={(f) => setFilters(f)}
        initialFilters={filters}
        tags={tags.map((t) => ({ id: t.id, name: t.name, hex: t.color }))}
      />
    </div>
  );
}
