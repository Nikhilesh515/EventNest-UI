import { useState } from 'react';

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
  const [timeframe, setTimeframe] = useState(initialFilters?.timeframe || 'upcoming');
  const [selectedTags, setSelectedTags] = useState<string[]>(initialFilters?.tags || []);
  const [visibility, setVisibility] = useState(initialFilters?.visibility || 'all');
  const [status, setStatus] = useState(initialFilters?.status || 'all');
  const [sort, setSort] = useState(initialFilters?.sort || 'date-asc');

  if (!isOpen) return null;

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
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

  return (
    <>
      <div className="rail-scrim" onClick={onClose} />
      <div className="drawer is-open" role="dialog" aria-modal="true" aria-label="Filters">
        <div className="drawer__head">
          <span className="drawer__title">Filters</span>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close filters">×</button>
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
            <div className="cluster">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  className={`tag-chip ${selectedTags.includes(tag.id) ? 'tag-chip--pressed' : ''}`}
                  aria-pressed={selectedTags.includes(tag.id)}
                  onClick={() => toggleTag(tag.id)}
                  style={{ '--tag-hex': tag.hex } as React.CSSProperties}
                >
                  {tag.name}
                </button>
              ))}
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
            <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="filter-section">
            <p className="filter-section__label">Sort</p>
            <select className="select" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="date-asc">Date · soonest</option>
              <option value="date-desc">Date · latest</option>
              <option value="created-desc">Newest created</option>
              <option value="popular">Most popular</option>
            </select>
          </div>
          <div className="filter-divider" role="presentation" />
          <div className="filter-actions">
            <button type="button" className="btn btn--ghost" onClick={handleClear}>Clear all</button>
            <button type="button" className="btn btn--primary" onClick={handleApply}>Apply</button>
          </div>
        </div>
      </div>
    </>
  );
}
