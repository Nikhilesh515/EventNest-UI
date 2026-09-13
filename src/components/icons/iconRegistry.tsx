import type { IconName } from '@/types'
import type { ReactNode } from 'react'

/* Ported verbatim from the frozen prototype js/icons.js (24 icons). */
export const ICON_PATHS: Record<IconName, ReactNode> = {
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="3"/>
      <path d="M3 9.5h18M8 3v4M16 3v4"/>
      <circle cx="8.5" cy="13.5" r="1" fill="currentColor" stroke="none"/>
      <circle cx="12" cy="13.5" r="1" fill="currentColor" stroke="none"/>
      <circle cx="15.5" cy="13.5" r="1" fill="currentColor" stroke="none"/>
      <circle cx="8.5" cy="17" r="1" fill="currentColor" stroke="none"/>
      <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none"/>
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5"/>
      <path d="M12 7.5V12l3.2 2"/>
    </>
  ),
  pin: (
    <>
      <path d="M12 21s6.5-5.5 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 15.5 12 21 12 21Z"/>
      <circle cx="12" cy="10.5" r="2.5"/>
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2"/>
      <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/>
      <path d="M15.8 6.2a3 3 0 0 1 0 5.6"/>
      <path d="M17.4 14.3c2 .6 3.2 2.2 3.2 4.7"/>
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5"/>
      <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6"/>
    </>
  ),
  ticket: (
    <>
      <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z"/>
      <path d="M14.5 6.5v11" strokeDasharray="2 3"/>
    </>
  ),
  tag: (
    <>
      <path d="M4 11.5V5a1 1 0 0 1 1-1h6.5L20 12.5 12.5 20 4 11.5Z"/>
      <circle cx="8.2" cy="8.2" r="1.4"/>
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5"/>
      <path d="M16 16l4.5 4.5"/>
    </>
  ),
  filter: (
    <>
      <path d="M4 7h16M7 12h10M10.5 17h3"/>
      <circle cx="7.5" cy="7" r="1.7" fill="currentColor" stroke="none"/>
      <circle cx="13.5" cy="12" r="1.7" fill="currentColor" stroke="none"/>
      <circle cx="11.5" cy="17" r="1.7" fill="currentColor" stroke="none"/>
    </>
  ),
  'chevron-down': (
    <>
      <path d="M6 9.5l6 6 6-6"/>
    </>
  ),
  'chevron-right': (
    <>
      <path d="M9.5 6l6 6-6 6"/>
    </>
  ),
  'chevron-left': (
    <>
      <path d="M14.5 6l-6 6 6 6"/>
    </>
  ),
  x: (
    <>
      <path d="M6 6l12 12M18 6L6 18"/>
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14M5 12h14"/>
    </>
  ),
  edit: (
    <>
      <path d="M16.6 4.4l3 3L9.2 17.8 5 19l1.2-4.2L16.6 4.4Z"/>
      <path d="M14.6 6.4l3 3"/>
    </>
  ),
  trash: (
    <>
      <path d="M5 7h14M10 4h4M6.6 7l.9 13h9l.9-13"/>
      <path d="M10 11v6M14 11v6"/>
    </>
  ),
  check: (
    <>
      <path d="M5 12.5l4.5 4.5L19 7"/>
    </>
  ),
  question: (
    <>
      <path d="M9.2 9.3a2.9 2.9 0 1 1 3.5 3c-.9.3-1.4 1-1.4 2"/>
      <circle cx="11.3" cy="17.5" r="1.1" fill="currentColor" stroke="none"/>
    </>
  ),
  'slash-circle': (
    <>
      <circle cx="12" cy="12" r="8.5"/>
      <path d="M6 18L18 6"/>
    </>
  ),
  star: (
    <>
      <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L12 16.9 6.7 19.7l1.1-5.9L3.5 9.7l5.9-.8L12 3.5Z"/>
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/>
      <circle cx="12" cy="12" r="3"/>
    </>
  ),
  'eye-off': (
    <>
      <path d="M4 4l16 16"/>
      <path d="M9.9 5.2A9.7 9.7 0 0 1 12 5c6 0 9.5 7 9.5 7a15.8 15.8 0 0 1-3.2 4M6.3 7.3A15.3 15.3 0 0 0 2.5 12s3.5 7 9.5 7a9.5 9.5 0 0 0 3.9-.8"/>
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>
    </>
  ),
  refresh: (
    <>
      <path d="M20 11.5A8 8 0 1 0 18 16.8"/>
      <path d="M20 5.5v6h-6"/>
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16M4 12h16M4 17h16"/>
    </>
  ),
  'moon-lantern': (
    <>
      <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z"/>
      <circle cx="17" cy="7" r="1.7" fill="currentColor" stroke="none"/>
    </>
  ),
}
