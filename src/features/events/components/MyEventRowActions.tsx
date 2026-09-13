import { useEffect, useRef, useState } from 'react'

import { Icon } from '@/components/icons/Icon'
import { isPast } from '@/lib/format'
import type { EventDto } from '@/types'

interface MyEventRowActionsProps {
  event: EventDto
  onEdit(): void
  onPublish(): void
  onCancel(): void
  onComplete(): void
  onDelete(): void
  onAttendees(): void
}

export function MyEventRowActions({
  event,
  onEdit,
  onPublish,
  onCancel,
  onComplete,
  onDelete,
  onAttendees,
}: MyEventRowActionsProps) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const ended = isPast(event.end)

  useEffect(() => {
    if (!open) return
    function onDocClick(caught: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(caught.target as Node)) setOpen(false)
    }
    function onKey(event_: KeyboardEvent) {
      if (event_.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      <button type="button" className="btn btn--secondary btn--sm" onClick={onEdit}>
        Edit
      </button>
      {event.status === 'Draft' ? (
        <button type="button" className="btn btn--leaf btn--sm" onClick={onPublish}>
          Publish
        </button>
      ) : null}
      {event.status === 'Published' ? (
        <button type="button" className="btn btn--sun btn--sm" onClick={onCancel}>
          Cancel
        </button>
      ) : null}
      {event.status === 'Published' && ended ? (
        <button type="button" className="btn btn--leaf btn--sm" onClick={onComplete}>
          Complete
        </button>
      ) : null}
      <button type="button" className="btn btn--secondary btn--sm" onClick={onAttendees}>
        Attendees
      </button>
      <div className="menu-wrap" ref={wrapRef}>
        <button
          type="button"
          className="icon-btn"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={`More actions for ${event.title}`}
          onClick={() => setOpen((value) => !value)}
        >
          <Icon name="chevron-down" size={16} />
        </button>
        {open ? (
          <div className="menu-panel" role="menu">
            <button
              type="button"
              className="menu-item"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                onEdit()
              }}
            >
              <Icon name="edit" size={16} />
              Edit
            </button>
            <button
              type="button"
              className="menu-item menu-item--danger"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                onDelete()
              }}
            >
              <Icon name="trash" size={16} />
              Delete
            </button>
          </div>
        ) : null}
      </div>
    </>
  )
}
