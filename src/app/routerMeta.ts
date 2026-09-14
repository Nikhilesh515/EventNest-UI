import type { Density, TemplateName } from '@/types'

export interface RouteMeta {
  template: TemplateName
  density: Density
  width: string
  title: string
  stamp: string
  liveMessage: string
  animate?: boolean
}

const DEFAULT_META: RouteMeta = {
  template: 'spread',
  density: 'festival',
  width: '100%',
  title: 'Not found',
  stamp: 'page · Not found',
  liveMessage: 'Not found',
  animate: false,
}

const EXACT: Record<string, RouteMeta> = {
  '/events': {
    template: 'collage',
    density: 'festival',
    width: '100%',
    title: 'Events',
    stamp: 'page 01 · Events',
    liveMessage: 'Events',
  },
  '/events/create': {
    template: 'clipboard',
    density: 'work',
    width: '900px',
    title: 'Create event',
    stamp: 'page 04 · Create',
    liveMessage: 'Create event',
  },
  '/my-events': {
    template: 'notebook',
    density: 'work',
    width: '980px',
    title: 'My events',
    stamp: 'page 02 · My events',
    liveMessage: 'My events',
  },
  '/my-rsvps': {
    template: 'notebook',
    density: 'work',
    width: '980px',
    title: 'My RSVPs',
    stamp: 'page 03 · My RSVPs',
    liveMessage: 'My RSVPs',
  },
  '/profile': {
    template: 'clipboard',
    density: 'work',
    width: '900px',
    title: 'Profile',
    stamp: 'page 07 · Profile',
    liveMessage: 'Profile',
  },
  '/admin/tags': {
    template: 'ledger',
    density: 'admin',
    width: '1120px',
    title: 'Tags',
    stamp: 'page 07 · Tags',
    liveMessage: 'Tags',
  },
  '/admin/users': {
    template: 'ledger',
    density: 'admin',
    width: '1120px',
    title: 'Users',
    stamp: 'page 06 · Users',
    liveMessage: 'Users',
  },
  '/login': {
    template: 'cover',
    density: 'festival',
    width: '100%',
    title: 'Log in',
    stamp: '',
    liveMessage: 'Log in',
  },
  '/register': {
    template: 'cover',
    density: 'festival',
    width: '100%',
    title: 'Create account',
    stamp: '',
    liveMessage: 'Create account',
  },
  '/styleguide': {
    template: 'guide',
    density: 'festival',
    width: '1280px',
    title: 'Styleguide',
    stamp: 'page 08 · Styleguide',
    liveMessage: 'Styleguide',
  },
}

const PATTERNS: { pattern: RegExp; meta: RouteMeta }[] = [
  {
    pattern: /^\/events\/[^/]+\/edit$/,
    meta: {
      template: 'clipboard',
      density: 'work',
      width: '900px',
      title: 'Edit event',
      stamp: 'page 04 · Create',
      liveMessage: 'Edit event',
    },
  },
  {
    pattern: /^\/events\/[^/]+\/attendees$/,
    meta: {
      template: 'guestbook',
      density: 'work',
      width: '1080px',
      title: 'Attendees',
      stamp: 'page 05 · Attendees',
      liveMessage: 'Attendees',
    },
  },
  {
    pattern: /^\/admin\/users\/[^/]+\/permissions$/,
    meta: {
      template: 'ledger',
      density: 'admin',
      width: '1120px',
      title: 'Permissions',
      stamp: 'page 06 · Permissions',
      liveMessage: 'Permissions',
    },
  },
  {
    pattern: /^\/events\/[^/]+$/,
    meta: {
      template: 'spread',
      density: 'festival',
      width: '1120px',
      title: 'Event',
      stamp: 'page 02 · Event',
      liveMessage: 'Event',
    },
  },
]

export function resolveRouteMeta(pathname: string): RouteMeta {
  const exact = EXACT[pathname]
  if (exact) return exact
  const found = PATTERNS.find((entry) => entry.pattern.test(pathname))
  return found ? found.meta : DEFAULT_META
}
