import type { RsvpUiKey } from '@/types'

import { RSVP_KEY_TO_LABEL } from '../statusMap'
import { RsvpSticker } from './RsvpSticker'

const ORDER: RsvpUiKey[] = ['going', 'maybe', 'notgoing', 'cancelled']

interface RsvpStickerSheetProps {
  value: RsvpUiKey | null
  disabled?: boolean
  onChange(value: RsvpUiKey): void
}

export function RsvpStickerSheet({ value, disabled, onChange }: RsvpStickerSheetProps) {
  return (
    <fieldset className="sticker-sheet">
      <legend className="sr-only">Choose your RSVP status</legend>
      {ORDER.map((key) => (
        <RsvpSticker
          key={key}
          uiKey={key}
          label={RSVP_KEY_TO_LABEL[key]}
          checked={value === key}
          disabled={disabled}
          onChange={onChange}
        />
      ))}
    </fieldset>
  )
}
