import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { PageDoc } from '@/components/data-display/PageDoc'
import { Icon } from '@/components/icons/Icon'
import { useAuth } from '@/features/auth/AuthContext'
import { EventNestPermissions } from '@/lib/permissions'

interface EventsHeroProps {
  total: number
  value: string
  onChange(value: string): void
  onSearch(value: string): void
}

export function EventsHero({ total, value, onChange, onSearch }: EventsHeroProps) {
  const { status, hasPermission } = useAuth()
  const [draft, setDraft] = useState(value)
  const canCreate =
    status === 'authenticated' && hasPermission(EventNestPermissions.Events.Create)

  function submit(event: FormEvent) {
    event.preventDefault()
    onSearch(draft.trim())
  }

  return (
    <>
      <PageDoc
        className="collage-hero"
        fullTape
        tapeVariant="sakura"
        kanji="祭"
        title="Find your next festival."
        subtitle="Discover events near you and paste yourself in."
        actions={
          canCreate ? (
            <Link className="btn btn--primary" to="/events/create">
              <Icon name="plus" size={18} />
              Create event
            </Link>
          ) : null
        }
      />
      <div className="collage-hero__inner" style={{ marginTop: 'var(--space-5)' }}>
        <p className="collage-hero__count" id="hero-count">
          {total} events on the table
        </p>
        <form className="collage-search" id="event-search-form" role="search" onSubmit={submit}>
          <div className="collage-search__row">
            <div className="search-field">
              <span className="search-field__icon" aria-hidden="true">
                <Icon name="search" size={18} />
              </span>
              <label className="sr-only" htmlFor="event-search">
                Search events
              </label>
              <input
                id="event-search"
                type="search"
                className="input"
                autoComplete="off"
                placeholder="Search events by title, place, or vibe…"
                value={draft}
                onChange={(event) => {
                  setDraft(event.target.value)
                  onChange(event.target.value)
                }}
              />
            </div>
            <button className="btn btn--primary" type="submit">
              Search
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
