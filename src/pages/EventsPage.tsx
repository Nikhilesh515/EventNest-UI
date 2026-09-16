import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { useAuthStore } from '../lib/auth-store';
import { isAdmin } from '../lib/permissions';
import { PageHeader } from '../components/PageHeader';
import { FilterDrawer, type FilterState } from '../components/FilterDrawer';
import { MosaicGrid } from '../components/MosaicGrid';
import { EventRow } from '../components/EventRow';
import { SheetPager } from '../components/SheetPager';
import { EmptyState } from '../components/EmptyState';
import { Icon } from '../components/Icon';
import type { EventListResponse, TagsResponse } from '../types';

interface EventsResponse {
  result: EventListResponse;
}

const VIEW_STORAGE_KEY = 'eventnest.kawaii.scrapbook.view';

function sortParam(sort: string) {
  return sort === 'popular' ? 'popularity' : sort;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
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
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(9);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'collage' | 'list'>(() => {
    try {
      return localStorage.getItem(VIEW_STORAGE_KEY) === 'list' ? 'list' : 'collage';
    } catch {
      return 'collage';
    }
  });

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  const { data: allData } = useQuery({
    queryKey: ['events', 'total'],
    queryFn: () => api.get<EventsResponse>('/api/events?pageSize=1'),
  });
  const totalAll = allData?.result?.total ?? 0;

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['events', filters, search, page, size],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(size));
      if (filters.timeframe !== 'all') params.set('timeframe', filters.timeframe);
      if (filters.visibility !== 'all') params.set('visibility', capitalize(filters.visibility));
      if (filters.status !== 'all') params.set('status', capitalize(filters.status));
      if (filters.sort) params.set('sort', sortParam(filters.sort));
      if (search) params.set('search', search);
      filters.tags.forEach((tagId) => params.append('tagId', tagId));
      return api.get<EventsResponse>(`/api/events?${params.toString()}`);
    },
  });

  const { data: tagsData } = useQuery({
    queryKey: ['tags'],
    queryFn: () => api.get<TagsResponse>('/api/tags'),
  });

  const tags = tagsData?.result || [];
  const events = eventsData?.result?.items || [];
  const total = eventsData?.result?.total ?? events.length;
  const pages = eventsData?.result?.pages ?? 1;
  const canCreate = isAdmin(user);

  const activeFilters =
    (filters.tags.length > 0 ? 1 : 0) +
    (filters.visibility !== 'all' ? 1 : 0) +
    (filters.status !== 'all' ? 1 : 0);

  const setView = (mode: 'collage' | 'list') => {
    setViewMode(mode);
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, mode);
    } catch {
      // storage unavailable — keep in-memory state
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      toast.error('Could not copy link');
    }
  };

  return (
    <div>
      <PageHeader
        className="collage-hero"
        tapeVariant="sakura"
        fullTape
        kanji="祭"
        title="Find your next festival."
        subtitle="Discover events near you and paste yourself in."
        actions={
          canCreate ? (
            <a className="btn btn--primary" href="/events/new">+ Create event</a>
          ) : undefined
        }
      />

      <div className="collage-hero__inner" style={{ marginTop: 'var(--space-5)' }}>
        <p className="collage-hero__count">{totalAll} events on the table</p>
        <form
          className="collage-search"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(searchInput.trim());
            setPage(1);
          }}
        >
          <div className="collage-search__row">
            <div className="search-field">
              <span className="search-field__icon" aria-hidden="true"><Icon name="search" size={18} /></span>
              <label className="sr-only" htmlFor="event-search">Search events</label>
              <input
                id="event-search"
                type="search"
                className="input"
                autoComplete="off"
                placeholder="Search events by title, place, or vibe…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
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
                onClick={() => {
                  setFilters((f) => ({ ...f, timeframe: tf }));
                  setPage(1);
                }}
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
              aria-controls="filter-drawer"
            >
              <Icon name="filter" size={16} /> Filters ({activeFilters})
            </button>
            <label className="sr-only" htmlFor="sort-filter">Sort</label>
            <select
              id="sort-filter"
              className="select select--inline"
              value={filters.sort}
              onChange={(e) => {
                setFilters((f) => ({ ...f, sort: e.target.value }));
                setPage(1);
              }}
            >
              <option value="date-asc">Date · soonest</option>
              <option value="date-desc">Date · latest</option>
              <option value="created-desc">Newest created</option>
              <option value="popular">Most popular</option>
            </select>
            <button
              type="button"
              className="icon-btn"
              aria-label="Copy link to these filters"
              onClick={handleShare}
            >
              <Icon name={copied ? 'check' : 'ticket'} size={18} />
            </button>
          </div>
        </div>
        <div className="sheet-tools__row">
          <span className="sheet-tools__count" aria-live="polite">
            {isLoading
              ? 'Loading…'
              : `${total} ${total === 1 ? 'event' : 'events'} · sheet ${page} of ${Math.max(1, pages)}`}
          </span>
          <div className="sheet-tools__end">
            <div className="view-toggle" role="group" aria-label="View mode">
              <button
                type="button"
                className="seg__btn"
                data-view-mode="collage"
                aria-pressed={viewMode !== 'list'}
                aria-label="Collage view"
                onClick={() => setView('collage')}
              >
                <Icon name="calendar" size={18} />
              </button>
              <button
                type="button"
                className="seg__btn"
                data-view-mode="list"
                aria-pressed={viewMode === 'list'}
                aria-label="List view"
                onClick={() => setView('list')}
              >
                <Icon name="menu" size={18} />
              </button>
            </div>
          </div>
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
          <div className="collection">
            <EmptyState
              title="The stall is quiet."
              body={
                activeFilters > 0 || search
                  ? 'No events match your filters.'
                  : 'No events are on the table yet.'
              }
              cta={
                activeFilters > 0 || search ? (
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => {
                      setFilters({
                        timeframe: 'upcoming',
                        tags: [],
                        visibility: 'all',
                        status: 'all',
                        sort: 'date-asc',
                      });
                      setSearchInput('');
                      setSearch('');
                      setPage(1);
                    }}
                  >
                    Paint the other eye · Clear filters
                  </button>
                ) : canCreate ? (
                  <a className="btn btn--primary" href="/events/new">+ Create your first event</a>
                ) : undefined
              }
            />
          </div>
        ) : viewMode === 'list' ? (
          <div className="collection event-grid event-grid--list">
            {events.map((event) => (
              <EventRow key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <MosaicGrid events={events} taped />
        )}
      </div>

      {!isLoading && total > 0 && (
        <div id="events-pager">
          <SheetPager
            page={page}
            pages={pages}
            size={size}
            total={total}
            sizeOptions={[9, 18]}
            onPageChange={setPage}
            onSizeChange={(nextSize) => {
              setSize(nextSize);
              setPage(1);
            }}
          />
        </div>
      )}

      {drawerOpen && (
        <FilterDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onApply={(f) => {
            setFilters(f);
            setPage(1);
          }}
          initialFilters={filters}
          tags={tags.map((t) => ({ id: t.id, name: t.name, hex: t.color }))}
        />
      )}
    </div>
  );
}
