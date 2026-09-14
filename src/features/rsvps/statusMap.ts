import type { RsvpStatus, RsvpUiKey, RsvpUiLabel } from '@/types'

export const RSVP_STATUS_TO_KEY: Record<RsvpStatus, RsvpUiKey> = {
  Confirmed: 'going',
  Maybe: 'maybe',
  Declined: 'notgoing',
  Cancelled: 'cancelled',
}

export const RSVP_KEY_TO_STATUS: Record<RsvpUiKey, RsvpStatus> = {
  going: 'Confirmed',
  maybe: 'Maybe',
  notgoing: 'Declined',
  cancelled: 'Cancelled',
}

export const RSVP_KEY_TO_LABEL: Record<RsvpUiKey, RsvpUiLabel> = {
  going: 'Going',
  maybe: 'Maybe',
  notgoing: 'Not Going',
  cancelled: 'Cancelled',
}

export const RSVP_LABEL_TO_STATUS: Record<RsvpUiLabel, RsvpStatus> = {
  Going: 'Confirmed',
  Maybe: 'Maybe',
  'Not Going': 'Declined',
  Cancelled: 'Cancelled',
}

export const RSVP_KEY_TO_CHIP_MOD: Record<RsvpUiKey, string> = {
  going: 'rsvp-chip--going',
  maybe: 'rsvp-chip--maybe',
  notgoing: 'rsvp-chip--notgoing',
  cancelled: 'rsvp-chip--cancelled',
}
