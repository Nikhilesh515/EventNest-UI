import type { RsvpUiKey, RsvpUiLabel } from '@/types'

const GLYPHS: Record<RsvpUiKey, string> = {
  going: '✓',
  maybe: '?',
  notgoing: '⊘',
  cancelled: '✕',
}

interface RsvpStickerProps {
  uiKey: RsvpUiKey
  label: RsvpUiLabel
  checked: boolean
  disabled?: boolean
  onChange(uiKey: RsvpUiKey): void
}

export function RsvpSticker({ uiKey, label, checked, disabled, onChange }: RsvpStickerProps) {
  const id = `rsvp-${uiKey}`
  return (
    <>
      <input
        className="sr-only"
        type="radio"
        name="rsvp"
        id={id}
        value={uiKey}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(uiKey)}
      />
      <label className={`rsvp-sticker rsvp-sticker--${uiKey}`} htmlFor={id}>
        <span className="rsvp-sticker__glyph" aria-hidden="true">
          {GLYPHS[uiKey]}
        </span>
        <span className="rsvp-sticker__label">{label}</span>
      </label>
    </>
  )
}
