import { Icon } from '@/components/icons/Icon'
import { FEATURES } from '@/lib/features'
import type { EventFilters } from '@/types'

interface EventSheetToolsProps {
  filters: EventFilters
  resultCount: number
  sheet: number
  sheets: number
  viewMode: 'collage' | 'list'
  onTimeframe(value: EventFilters['timeframe']): void
  onSort(value: EventFilters['sort']): void
  onViewMode(value: 'collage' | 'list'): void
  onOpenFilters(): void
  onShare(): void
}

export function EventSheetTools({
  filters,
  resultCount,
  sheet,
  sheets,
  viewMode,
  onTimeframe,
  onSort,
  onViewMode,
  onOpenFilters,
  onShare,
}: EventSheetToolsProps) {
  const eventCount = countActiveFilters(filters)
  const resultsLabel = `${resultCount} ${resultCount === 1 ? 'event' : 'events'} · sheet ${sheet} of ${sheets}`

  return (
    <div className="sheet-tools">
      <div className="sheet-tools__row">
        <div className="tabs" role="tablist" aria-label="Timeframe">
          {(['upcoming', 'past', 'all'] as const).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              className="tab"
              aria-selected={filters.timeframe === key}
              tabIndex={filters.timeframe === key ? 0 : -1}
              onClick={() => onTimeframe(key)}
            >
              {key === 'upcoming' ? 'Upcoming' : key === 'past' ? 'Past' : 'All'}
            </button>
          ))}
        </div>
        <div className="sheet-tools__end">
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={onOpenFilters}
            aria-haspopup="dialog"
          >
            <Icon name="filter" size={16} />
            Filters ({eventCount})
          </button>
          <label className="sr-only" htmlFor="sort-filter">
            Sort
          </label>
          <select
            id="sort-filter"
            className="select select--inline"
            value={filters.sort}
            onChange={(event) => onSort(event.target.value as EventFilters['sort'])}
          >
            <option value="date-asc">Date · soonest</option>
            <option value="date-desc">Date · latest</option>
            <option value="created-desc">Newest created</option>
            {FEATURES.eventGoing ? <option value="popularity">Most popular</option> : null}
          </select>
          <button
            type="button"
            className="icon-btn"
            data-action="share"
            aria-label="Copy link to these filters"
            onClick={onShare}
          >
            <Icon name="ticket" size={18} />
          </button>
        </div>
      </div>
      <div className="sheet-tools__row">
        <span className="sheet-tools__count" id="results-count" aria-live="polite">
          {resultsLabel}
        </span>
        <div className="sheet-tools__end">
          <div className="view-toggle" role="group" aria-label="View mode">
            <button
              type="button"
              className="seg__btn"
              aria-pressed={viewMode === 'collage'}
              aria-label="Collage view"
              onClick={() => onViewMode('collage')}
            >
              <Icon name="calendar" size={18} />
            </button>
            <button
              type="button"
              className="seg__btn"
              aria-pressed={viewMode === 'list'}
              aria-label="List view"
              onClick={() => onViewMode('list')}
            >
              <Icon name="menu" size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function countActiveFilters(filters: EventFilters): number {
  let count = 0
  if (filters.q) count += 1
  count += filters.tagIds.length
  if (filters.visibility !== 'all') count += 1
  if (filters.status !== 'all') count += 1
  return count
}
