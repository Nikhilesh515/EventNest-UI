import { useState } from 'react'

import { Icon } from '@/components/icons/Icon'
import { TagChip } from '@/components/data-display/TagChip'
import type { TagDto } from '@/types'

interface TagPickerProps {
  tags: TagDto[]
  selectedIds: string[]
  canCreate: boolean
  loading?: boolean
  onChange(ids: string[]): void
  onCreateRequest(): void
}

export function TagPicker({
  tags,
  selectedIds,
  canCreate,
  loading,
  onChange,
  onCreateRequest,
}: TagPickerProps) {
  const [open, setOpen] = useState(false)
  const selected = tags.filter((tag) => selectedIds.includes(tag.id))

  function toggle(tagId: string) {
    onChange(
      selectedIds.includes(tagId)
        ? selectedIds.filter((value) => value !== tagId)
        : [...selectedIds, tagId],
    )
  }

  return (
    <div className="chip-select" id="tag-select">
      <div id="tag-select-body">
        <button
          type="button"
          className="chip-select__trigger"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-labelledby="tags-label"
          onClick={() => setOpen((value) => !value)}
        >
          {selected.length ? (
            <span className="cluster">
              {selected.map((tag) => (
                <TagChip key={tag.id} tag={tag} md onRemove={() => toggle(tag.id)} />
              ))}
            </span>
          ) : (
            <span className="chip-select__placeholder">＋ Add tag</span>
          )}
          <Icon name="chevron-down" size={16} />
        </button>
        {open ? (
          <div
            className="chip-select__list"
            role="listbox"
            aria-multiselectable="true"
            aria-label="Tags"
          >
            {loading ? (
              <div className="cluster">
                <span className="skeleton skeleton--line" style={{ width: 100 }} />
                <span className="skeleton skeleton--line" style={{ width: 80 }} />
              </div>
            ) : null}
            {!loading
              ? tags.map((tag) => {
                  const isSelected = selectedIds.includes(tag.id)
                  return (
                    <div
                      key={tag.id}
                      className="chip-option"
                      role="option"
                      aria-selected={isSelected}
                      tabIndex={0}
                      onClick={() => toggle(tag.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          toggle(tag.id)
                        }
                      }}
                    >
                      <TagChip tag={tag} />
                      {isSelected ? (
                        <span className="chip-option__check" aria-hidden="true">
                          <Icon name="check" size={16} />
                        </span>
                      ) : null}
                    </div>
                  )
                })
              : null}
            {canCreate ? (
              <div className="chip-select__create">
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => {
                    setOpen(false)
                    onCreateRequest()
                  }}
                >
                  <Icon name="plus" size={16} />
                  Create tag
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
