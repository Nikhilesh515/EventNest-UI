import { useState } from 'react'
import { Link } from 'react-router-dom'

import { AppApiError } from '@/api/errors'
import { fmtDate } from '@/lib/format'
import type { EventDto, RsvpDto, RsvpStatus, RsvpUiKey } from '@/types'

import { RSVP_KEY_TO_LABEL, RSVP_LABEL_TO_STATUS, RSVP_STATUS_TO_KEY } from '../statusMap'
import { RsvpStickerSheet } from './RsvpStickerSheet'

export type RsvpPanelState =
  | 'anonymous'
  | 'owner'
  | 'draft'
  | 'cancelled'
  | 'ended'
  | 'closed'
  | 'open'

export interface RsvpSubmitInput {
  status: Exclude<RsvpStatus, 'Cancelled'>
  guestCount: number
  notes: string
}

interface RsvpPanelProps {
  event: EventDto
  myRsvp: RsvpDto | null
  state: RsvpPanelState
  onSubmit(input: RsvpSubmitInput): Promise<void>
  onCancel(): Promise<void>
  onPickRequired?(): void
}

const DETAIL_KEYS: RsvpUiKey[] = ['going', 'maybe', 'notgoing']

function submitLabel(key: RsvpUiKey): string {
  if (key === 'going') return 'RSVP · going'
  if (key === 'maybe') return 'Save as maybe'
  return 'Save response'
}

function statusLine(key: RsvpUiKey, guests: number): string {
  if (key === 'going') {
    return `You're going${guests ? ` · ${guests} guest${guests === 1 ? '' : 's'}` : ''}. 福`
  }
  if (key === 'maybe') return "You're a maybe. We'll keep a spot warm."
  if (key === 'notgoing') return "You're not going. You can change your mind."
  return 'Your RSVP is cancelled.'
}

const CLOSED_COPY: Record<Exclude<RsvpPanelState, 'open'>, string> = {
  anonymous: 'Log in to RSVP.',
  owner: "You're hosting this event.",
  draft: "This event isn't published yet.",
  cancelled: 'This event was cancelled.',
  ended: '',
  closed: 'RSVP is closed for this event.',
}

export function RsvpPanel({ event, myRsvp, state, onSubmit, onCancel, onPickRequired }: RsvpPanelProps) {
  const currentKey = myRsvp ? RSVP_STATUS_TO_KEY[myRsvp.status] : null
  const [selected, setSelected] = useState<RsvpUiKey | null>(currentKey)
  const [guests, setGuests] = useState(myRsvp?.guestCount ?? 1)
  const [notes, setNotes] = useState(myRsvp?.notes ?? '')
  const [detailsVisible, setDetailsVisible] = useState(
    currentKey !== null && (DETAIL_KEYS.includes(currentKey) || currentKey === 'cancelled'),
  )
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (state !== 'open') {
    const copy =
      state === 'ended'
        ? `This event has ended on ${fmtDate(event.end)}.`
        : CLOSED_COPY[state]
    return (
      <div className="reply-card__panel rsvp-card">
        <p className="rsvp-card__legend">Your RSVP</p>
        <p className="rsvp-closed-note">{copy}</p>
        {state === 'anonymous' ? (
          <div className="cluster">
            <Link className="btn btn--primary" to={`/login?returnUrl=/events/${event.id}`}>
              Log in
            </Link>
            <Link className="btn btn--ghost" to="/register">
              New here? Create an account
            </Link>
          </div>
        ) : null}
      </div>
    )
  }

  const alreadyIn = currentKey !== null && DETAIL_KEYS.includes(currentKey)
  const full = event.capacity > 0 && event.going >= event.capacity
  const disabled = full && !alreadyIn
  const spotsLeft = Math.max(0, event.capacity - event.going)
  const orgFirst = event.organizerName.split(' ')[0] || 'they'
  const displayKey = selected && selected !== 'cancelled' ? selected : null
  const labelKey = selected ?? (alreadyIn && currentKey ? currentKey : 'going')

  async function run(action: () => Promise<void>) {
    setBusy(true)
    setError(null)
    try {
      await action()
    } catch (caught) {
      setError(caught instanceof AppApiError ? caught.message : 'That did not work. Try again.')
    } finally {
      setBusy(false)
    }
  }

  function choose(key: RsvpUiKey) {
    setSelected(key)
    setDetailsVisible(key !== 'cancelled')
  }

  function submit() {
    if (!selected) {
      onPickRequired?.()
      return
    }
    if (selected === 'cancelled') {
      void run(onCancel)
      return
    }
    const status = RSVP_LABEL_TO_STATUS[RSVP_KEY_TO_LABEL[selected]]
    void run(() => onSubmit({ status: status as Exclude<RsvpStatus, 'Cancelled'>, guestCount: guests, notes }))
  }

  function changeGuests(delta: number) {
    const max = event.capacity > 0 ? Math.max(1, event.capacity - event.going + guests) : 99
    setGuests((value) => Math.min(max, Math.max(1, value + delta)))
  }

  return (
    <div className="reply-card__panel rsvp-card" data-rsvp-card data-rsvp-value={selected ?? ''}>
      {selected === 'going' ? (
        <span className="hanko rsvp-card__hanko" aria-hidden="true">
          福
        </span>
      ) : null}
      <p className="rsvp-card__legend">Your RSVP</p>
      {currentKey === 'cancelled' ? (
        <p className="rsvp-prev">Your previous response: Cancelled.</p>
      ) : null}
      {error ? (
        <p className="banner banner--error" role="alert">
          {error}
        </p>
      ) : null}
      <RsvpStickerSheet value={selected} disabled={disabled || busy} onChange={choose} />
      <div className="rsvp-card__details" hidden={!detailsVisible}>
        <div className="cluster-3">
          <span className="field__label">Guests</span>
          <div className="stepper">
            <button
              type="button"
              className="btn btn--secondary btn--icon btn--sm"
              aria-label="Remove a guest"
              disabled={busy || guests <= 1}
              onClick={() => changeGuests(-1)}
            >
              −
            </button>
            <span className="stepper__value" aria-live="polite">
              {guests}
            </span>
            <button
              type="button"
              className="btn btn--secondary btn--icon btn--sm"
              aria-label="Add a guest"
              disabled={busy}
              onClick={() => changeGuests(1)}
            >
              +
            </button>
          </div>
          {full ? (
            <span className="field__hint">This event is full.</span>
          ) : spotsLeft <= 3 ? (
            <span className="field__hint">
              Only {spotsLeft} spot{spotsLeft === 1 ? '' : 's'} left.
            </span>
          ) : null}
        </div>
        <div className="field">
          <label className="field__label" htmlFor="rsvp-notes">
            Notes for the organizer
          </label>
          <input
            id="rsvp-notes"
            className="input"
            type="text"
            maxLength={200}
            placeholder={`Anything ${orgFirst} should know?`}
            value={notes}
            onChange={(changeEvent) => setNotes(changeEvent.target.value)}
          />
        </div>
      </div>
      <p className={`rsvp-status-line${displayKey === 'going' ? ' rsvp-status-line--going' : ''}`}>
        {displayKey ? statusLine(displayKey, guests) : 'Pick a sticker to respond.'}
      </p>
      {disabled ? (
        <p className="rsvp-closed-note">This event is full.</p>
      ) : (
        <div className="stack-2">
          <button
            type="button"
            className="btn btn--primary btn--block"
            disabled={busy}
            aria-busy={busy}
            onClick={submit}
          >
            {submitLabel(labelKey)}
          </button>
          {alreadyIn ? (
            <button
              type="button"
              className="btn btn--ghost btn--block"
              disabled={busy}
              onClick={() => void run(onCancel)}
            >
              Cancel RSVP
            </button>
          ) : null}
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        {selected ? `RSVP set to ${selected}.` : ''}
      </p>
    </div>
  )
}
