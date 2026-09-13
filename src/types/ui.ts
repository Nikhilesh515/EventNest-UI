import type { CSSProperties, ReactNode } from 'react'

export type Density = 'festival' | 'work' | 'admin'
export type TemplateName =
  'collage' | 'spread' | 'notebook' | 'guestbook' | 'clipboard' | 'ledger' | 'cover' | 'guide'
export type WashiTone = 'sakura' | 'sora' | 'yamabuki' | 'shu' | 'matcha'
export type PatternName =
  'chiyogami-hana' | 'chiyogami-asa' | 'polka-sakura' | 'polka-sora' | 'tatami' | 'asanoha'
export type IconName =
  | 'calendar'
  | 'clock'
  | 'pin'
  | 'users'
  | 'user'
  | 'ticket'
  | 'tag'
  | 'search'
  | 'filter'
  | 'chevron-down'
  | 'chevron-right'
  | 'chevron-left'
  | 'x'
  | 'plus'
  | 'edit'
  | 'trash'
  | 'check'
  | 'question'
  | 'slash-circle'
  | 'star'
  | 'eye'
  | 'eye-off'
  | 'refresh'
  | 'menu'
  | 'moon-lantern'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export type StyleVars = CSSProperties & Record<`--${string}`, string | number>

export interface BaseProps {
  className?: string
  children?: ReactNode
}
