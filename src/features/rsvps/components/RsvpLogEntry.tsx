import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Icon } from '@/components/icons/Icon'
import type { EventDto, RsvpDetailDto, RsvpStatus, RsvpUiKey } from '@/types'
import { dateFlag, fmtDateShort, fmtTime, plural } from '@/lib/format'
import { cn } from '@/lib/cn'
import { RSVP_KEY_TO_LABEL, RSVP_KEY_TO_STATUS, RSVP_STATUS_TO_KEY } from '../statusMap'

const STAMP_GLYPH: Record<RsvpUiKey, string> = {
  going: '✓',
  maybe: '?',
  notgoing: '⊘',
  cancelled: '✕',
}

const CHANGE_KEYS: RsvpUiKey[] = ['going', 'maybe', 'notgoing']

interface RsvpLogEntryProps {
  rsvp: RsvpDetailDto
  event: EventDto
  thumpSignal: number
  onChange(status: RsvpStatus): void
  onCancel(): void
}

export function RsvpLogEntry({ rsvp, event, thumpSignal, onChange, onCancel }: RsvpLogEntryProps) {
  const navigate = useNavigate()
  const key = RSVP_STATUS_TO_KEY[rsvp.status]
  const cancelled = rsvp.status === 'Cancelled'
  const past = new Date(event.end).getTime() < Date.now()

  const [menuOpen, setMenuOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [thumping, setThumping] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const keepRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (thumpSignal === 0) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setThumping(true)
    const timer = window.setTimeout(() => setThumping(false), 320)
    return () => window.clearTimeout(timer)
  }, [thumpSignal])

  useEffect(() => {
    if (confirming) keepRef.current?.focus()
  }, [confirming])

  useEffect(() => {
    if (!menuOpen) return
    function onDocClick(caught: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(caught.target as Node)) setMenuOpen(false)
    }
    function onKey(event_: KeyboardEvent) {
      if (event_.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  return (
    <article
      className={cn('log-entry', past && 'is-past', cancelled && 'is-cancelled')}
      data-id={event.id}
    >
      <div className="log-entry__date">
        <time dateTime={event.start}>{dateFlag(event.start).md}</time>
      </div>
      <div className={cn('log-stamp', `log-stamp--${key}`, thumping && 'is-thumping')} data-stamp>
        <span className="log-stamp__glyph" aria-hidden="true">
          {STAMP_GLYPH[key]}
        </span>
        <span className="log-stamp__label">{RSVP_KEY_TO_LABEL[key]}</span>
      </div>
      <div className="log-entry__body">
        <h3 className="log-entry__title">
          <Link to={`/events/${event.id}`}>{event.title}</Link>
        </h3>
        <p className="log-entry__meta">
          {event.location} · {fmtTime(event.start)} · {plural(rsvp.guestCount, 'guest')} · Responded{' '}
          {fmtDateShort(rsvp.respondedAt)}
        </p>
        {rsvp.notes ? <p className="log-entry__notes">{`"${rsvp.notes}"`}</p> : null}
      </div>
      <div className="log-entry__actions">
        {!cancelled ? (
          <>
            <div className="menu-wrap" ref={wrapRef}>
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((value) => !value)}
              >
                Change <Icon name="chevron-down" size={14} />
              </button>
              {menuOpen ? (
                <div className="menu-panel" role="menu">
                  {CHANGE_KEYS.filter((option) => option !== key).map((option) => (
                    <button
                      key={option}
                      type="button"
                      className="menu-item"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false)
                        onChange(RSVP_KEY_TO_STATUS[option])
                      }}
                    >
                      Change to {RSVP_KEY_TO_LABEL[option]}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => setConfirming(true)}
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => navigate(`/events/${event.id}`)}
          >
            RSVP again
          </button>
        )}
        <Link className="btn btn--ghost btn--sm" to={`/events/${event.id}`}>
          View event →
        </Link>
      </div>
      {confirming ? (
        <div className="rsvp-confirm" role="group">
          <span className="perm-confirm__msg">
            Remove this RSVP? The host will see one less guest.
          </span>
          <button
            ref={keepRef}
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => setConfirming(false)}
          >
            Keep it
          </button>
          <button
            type="button"
            className="btn btn--danger btn--sm"
            onClick={() => {
              setConfirming(false)
              onCancel()
            }}
          >
            Yes, cancel
          </button>
        </div>
      ) : null}
    </article>
  )
}
