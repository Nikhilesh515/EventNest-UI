import { useState } from 'react';

export type RsvpStatus = 'going' | 'maybe' | 'notgoing' | 'cancelled';

interface RsvpStickerSheetProps {
  currentStatus: RsvpStatus | null;
  guests: number;
  notes: string;
  capacity: number;
  going: number;
  disabled?: boolean;
  loading?: boolean;
  onSelect: (status: RsvpStatus) => void;
  onGuestsChange: (guests: number) => void;
  onNotesChange: (notes: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
}

const STICKERS: { key: RsvpStatus; label: string; glyph: string }[] = [
  { key: 'going', label: 'Going', glyph: '✓' },
  { key: 'maybe', label: 'Maybe', glyph: '?' },
  { key: 'notgoing', label: 'Not Going', glyph: '⊘' },
  { key: 'cancelled', label: 'Cancelled', glyph: '✕' },
];

function statusLine(key: RsvpStatus | null, guests: number): string {
  if (key === 'going') return `You're going${guests ? ` · ${guests} guest${guests === 1 ? '' : 's'}` : ''}. 福`;
  if (key === 'maybe') return "You're a maybe. We'll keep a spot warm.";
  if (key === 'notgoing') return "You're not going. You can change your mind.";
  return 'Pick a sticker to respond.';
}

function submitLabel(key: RsvpStatus | null): string {
  if (key === 'going') return 'RSVP · going';
  if (key === 'maybe') return 'Save as maybe';
  return 'Save response';
}

export function RsvpStickerSheet({
  currentStatus,
  guests: initialGuests,
  notes: initialNotes,
  capacity,
  going,
  disabled = false,
  loading = false,
  onSelect,
  onGuestsChange,
  onNotesChange,
  onSubmit,
  onCancel,
}: RsvpStickerSheetProps) {
  const [guests, setGuests] = useState(initialGuests);
  const [notes, setNotes] = useState(initialNotes);
  const spotsLeft = Math.max(0, capacity - going);
  const maxGuests = capacity > 0 ? Math.max(1, capacity - going + guests) : 99;
  const showDetails = currentStatus === 'going' || currentStatus === 'maybe' || currentStatus === 'notgoing';

  const handleGuestDelta = (delta: number) => {
    const next = Math.min(maxGuests, Math.max(1, guests + delta));
    setGuests(next);
    onGuestsChange(next);
  };

  return (
    <>
      <fieldset className="sticker-sheet" disabled={disabled}>
        <legend className="sr-only">Choose your RSVP status</legend>
        {STICKERS.map((s) => (
          <span key={s.key}>
            <input
              className="sr-only"
              type="radio"
              name="rsvp"
              id={`rsvp-${s.key}`}
              value={s.key}
              checked={currentStatus === s.key}
              onChange={() => onSelect(s.key)}
              disabled={disabled}
            />
            <label className={`rsvp-sticker rsvp-sticker--${s.key}`} htmlFor={`rsvp-${s.key}`}>
              <span className="rsvp-sticker__glyph" aria-hidden="true">{s.glyph}</span>
              <span className="rsvp-sticker__label">{s.label}</span>
            </label>
          </span>
        ))}
      </fieldset>

      <div className="rsvp-card__details" hidden={!showDetails}>
        <div className="cluster-3">
          <span className="field__label">Guests</span>
          <div className="stepper">
            <button
              type="button"
              className="btn btn--secondary btn--icon btn--sm"
              onClick={() => handleGuestDelta(-1)}
              disabled={guests <= 1}
              aria-label="Remove a guest"
            >
              −
            </button>
            <span className="stepper__value" aria-live="polite">{guests}</span>
            <button
              type="button"
              className="btn btn--secondary btn--icon btn--sm"
              onClick={() => handleGuestDelta(1)}
              disabled={guests >= maxGuests}
              aria-label="Add a guest"
            >
              +
            </button>
          </div>
          {spotsLeft <= 3 && spotsLeft > 0 && (
            <span className="field__hint">Only {spotsLeft} spot{spotsLeft === 1 ? '' : 's'} left.</span>
          )}
        </div>
        <div className="field">
          <label className="field__label" htmlFor="rsvp-notes">Notes for the organizer</label>
          <input
            id="rsvp-notes"
            className="input"
            type="text"
            maxLength={200}
            placeholder="Anything the organizer should know?"
            value={notes}
            onChange={(e) => { setNotes(e.target.value); onNotesChange(e.target.value); }}
          />
        </div>
      </div>

      <p className={`rsvp-status-line${currentStatus === 'going' ? ' rsvp-status-line--going' : ''}`}>
        {statusLine(currentStatus, guests)}
      </p>

      {disabled ? (
        <p className="rsvp-closed-note">This event is full.</p>
      ) : (
        <div className="stack-2">
          <button
            type="button"
            className="btn btn--primary btn--block"
            onClick={onSubmit}
            disabled={loading || !currentStatus}
          >
            {loading ? 'Saving…' : submitLabel(currentStatus)}
          </button>
          {onCancel && currentStatus && currentStatus !== 'cancelled' && (
            <button
              type="button"
              className="btn btn--ghost btn--block"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel RSVP
            </button>
          )}
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {currentStatus ? `RSVP set to ${currentStatus}.` : ''}
      </p>
    </>
  );
}
