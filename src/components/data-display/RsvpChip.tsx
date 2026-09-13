import type { RsvpStatus } from '@/types'
import { RSVP_STATUS_TO_KEY, RSVP_KEY_TO_LABEL } from '@/features/rsvps/statusMap'

interface RsvpChipProps {
  status: RsvpStatus | 'none'
  label?: string
}

export function RsvpChip({ status, label }: RsvpChipProps) {
  if (status === 'none') {
    return <span className="rsvp-chip rsvp-chip--none">{label ?? 'No RSVP'}</span>
  }
  const key = RSVP_STATUS_TO_KEY[status]
  return <span className={`rsvp-chip rsvp-chip--${key}`}>{label ?? RSVP_KEY_TO_LABEL[key]}</span>
}
