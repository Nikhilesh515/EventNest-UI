import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';
import { tagStyleVars } from '../lib/tag-style';
import { useColorMode } from '../lib/theme-store';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters?: FilterState;
  tags?: Array<{ id: string; name: string; hex: string }>;
}

export interface FilterState {
  timeframe: string;
  tags: string[];
  visibility: string;
  status: string;
  sort: string;
}

export function FilterDrawer({ isOpen, onClose, onApply, initialFilters, tags = [] }: FilterDrawerProps) {
  const mode = useColorMode();
  const [timeframe, setTimeframe] = useState(initialFilters?.timeframe || 'upcoming');
  const [selectedTags, setSelectedTags] = useState<string[]>(initialFilters?.tags || []);
  const [visibility, setVisibility] = useState(initialFilters?.visibility || 'all');
  const [status, setStatus] = useState(initialFilters?.status || 'all');
  const [sort, setSort] = useState(initialFilters?.sort || 'date-asc');
  const [isSheet] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 1023.98px)').matches,
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId],
    );
  };

  const handleApply = () => {
    onApply({ timeframe, tags: selectedTags, visibility, status, sort });
    onClose();
  };

  const handleClear = () => {
    setTimeframe('upcoming');
    setSelectedTags([]);
    setVisibility('all');
    setStatus('all');
    setSort('date-asc');
  };

  return createPortal(
    <>
      {isSheet && <div className="rail-scrim" onClick={onClose} />}
      <div
        className={`drawer-filter${isSheet ? ' is-sheet' : ''}`}
        id="filter-drawer"
        role="dialog"
        aria-modal={isSheet}
        aria-label="Filters"
      >
        <div
          className="drawer__head"
          style={{
            padding: 'var(--space-4) var(--space-4) 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-3)',
          }}
        >
          <span className="drawer__title">Filters</span>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close filters">
            <Icon name="x" size={20} />
          </button>
        </div>
        <div className="filter-panel">
          <div className="filter-section">
            <p className="filter-section__label">When</p>
            <div className="divider-stack" role="tablist" aria-label="Timeframe">
              {['upcoming', 'past', 'all'].map((tf) => (
                <button
                  key={tf}
                  type="button"
                  role="tab"
                  className="tab"
                  aria-selected={timeframe === tf}
                  onClick={() => setTimeframe(tf)}
                >
                  {tf.charAt(0).toUpperCase() + tf.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-divider" role="presentation" />
          <div className="filter-section">
            <p className="filter-section__label">Tags</p>
            <div className="cluster" id="fd-tags">
              {tags.map((tag, i) => {
                const pressed = selectedTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    className="tag-chip tag-chip--interactive tag-chip--md"
                    style={tagStyleVars(tag.hex, mode, i % 2 === 0 ? -1 : 1)}
                    aria-pressed={pressed}
                    title={tag.name}
                    aria-label={tag.name}
                    onClick={() => toggleTag(tag.id)}
                  >
                    <span className="tag-chip__dot" aria-hidden="true" />
                    <span className="tag-chip__label">{tag.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="filter-section">
            <p className="filter-section__label">Visibility</p>
            <div className="seg" role="radiogroup" aria-label="Visibility">
              {['all', 'public', 'private'].map((v) => (
                <button
                  key={v}
                  type="button"
                  className="seg__btn"
                  role="radio"
                  aria-checked={visibility === v}
                  onClick={() => setVisibility(v)}
                >
                  {v === 'all' ? 'All' : v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-section">
            <p className="filter-section__label">Status</p>
            <label className="sr-only" htmlFor="fd-status">Status</label>
            <select
              id="fd-status"
              className="select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="filter-section">
            <p className="filter-section__label">Sort</p>
            <label className="sr-only" htmlFor="fd-sort">Sort</label>
            <select id="fd-sort" className="select" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="date-asc">Date · soonest</option>
              <option value="date-desc">Date · latest</option>
              <option value="created-desc">Newest created</option>
              <option value="popular">Most popular</option>
            </select>
          </div>
        </div>
        <div className="filter-foot">
          <button type="button" className="btn btn--ghost" onClick={handleClear}>Clear all</button>
          <button type="button" className="btn btn--primary" onClick={handleApply}>Apply ✓</button>
        </div>
      </div>
    </>,
    document.body,
  );
}
