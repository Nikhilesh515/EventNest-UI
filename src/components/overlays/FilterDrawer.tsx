import { useEffect, useState } from 'react'
import type { RefObject } from 'react'

import { useFocusTrap } from './useFocusTrap'
import { Icon } from '@/components/icons/Icon'
import { TagChip } from '@/components/data-display/TagChip'
import { useIsCompact } from '@/hooks/useIsCompact'
import type { EventFilters, EventSort, TagDto } from '@/types'

interface FilterDrawerProps {
  open: boolean
  filters: EventFilters
  tags: TagDto[]
  onApply(next: Partial<EventFilters>): void
  onClear(): void
  onClose(): void
  triggerRef: RefObject<HTMLElement | null>
}

const TIMEFRAMES: { value: EventFilters['timeframe']; label: string }[] = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
  { value: 'all', label: 'All' },
]

const STATUSES: { value: EventFilters['status']; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Published', label: 'Published' },
  { value: 'Cancelled', label: 'Cancelled' },
  { value: 'Completed', label: 'Completed' },
]

const VISIBILITIES: { value: EventFilters['visibility']; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
]

const SORTS: { value: EventSort; label: string }[] = [
  { value: 'date-asc', label: 'Date · soonest' },
  { value: 'date-desc', label: 'Date · latest' },
  { value: 'created-desc', label: 'Newest created' },
  { value: 'popularity', label: 'Most popular' },
]

export function FilterDrawer({
  open,
  filters,
  tags,
  onApply,
  onClear,
  onClose,
  triggerRef,
}: FilterDrawerProps) {
  const compact = useIsCompact()
  const [draft, setDraft] = useState<EventFilters>(filters)

  useEffect(() => {
    if (open) setDraft(filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const ref = useFocusTrap<HTMLDivElement>({
    active: open && compact,
    onEscape: onClose,
    initialFocus: triggerRef.current,
  })

  if (!open) return null

  function toggleTag(id: string) {
    setDraft((current) => ({
      ...current,
      tagIds: current.tagIds.includes(id)
        ? current.tagIds.filter((value) => value !== id)
        : [...current.tagIds, id],
    }))
  }

  return (
    <>
      {compact ? <div className="rail-scrim" onClick={onClose} aria-hidden="true" /> : null}
      <div
        className={compact ? 'drawer-filter is-sheet' : 'drawer-filter'}
        id="filter-drawer"
        role="dialog"
        aria-modal={compact ? 'true' : 'false'}
        aria-label="Filters"
        ref={ref}
      >
        <div className="drawer__head">
          <span className="drawer__title">Filters</span>
          <button type="button" className="icon-btn" aria-label="Close filters" onClick={onClose}>
            <Icon name="x" size={20} />
          </button>
        </div>
        <div className="filter-panel">
          <div className="filter-section">
            <p className="filter-section__label">When</p>
            <div className="divider-stack" role="tablist" aria-label="Timeframe">
              {TIMEFRAMES.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="tab"
                  className="tab"
                  aria-selected={draft.timeframe === option.value}
                  onClick={() => setDraft((current) => ({ ...current, timeframe: option.value }))}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-divider" role="presentation" />
          <div className="filter-section">
            <p className="filter-section__label">Tags</p>
            <div className="cluster">
              {tags.map((tag, index) => (
                <TagChip
                  key={tag.id}
                  tag={tag}
                  md
                  interactive
                  pressed={draft.tagIds.includes(tag.id)}
                  tilt={index % 2 === 0 ? -1 : 1}
                  onToggle={() => toggleTag(tag.id)}
                />
              ))}
            </div>
          </div>
          <div className="filter-section">
            <p className="filter-section__label">Visibility</p>
            <div className="seg" role="radiogroup" aria-label="Visibility">
              {VISIBILITIES.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  className="seg__btn"
                  aria-checked={draft.visibility === option.value}
                  onClick={() =>
                    setDraft((current) => ({ ...current, visibility: option.value }))
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-section">
            <p className="filter-section__label">Status</p>
            <label className="sr-only" htmlFor="fd-status">
              Status
            </label>
            <select
              id="fd-status"
              className="select"
              value={draft.status}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  status: event.target.value as EventFilters['status'],
                }))
              }
            >
              {STATUSES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-section">
            <p className="filter-section__label">Sort</p>
            <label className="sr-only" htmlFor="fd-sort">
              Sort
            </label>
            <select
              id="fd-sort"
              className="select"
              value={draft.sort}
              onChange={(event) =>
                setDraft((current) => ({ ...current, sort: event.target.value as EventSort }))
              }
            >
              {SORTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="filter-foot">
          <button type="button" className="btn btn--ghost" onClick={onClear}>
            Clear all
          </button>
          <button type="button" className="btn btn--primary" onClick={() => onApply(draft)}>
            Apply ✓
          </button>
        </div>
      </div>
    </>
  )
}
