export const AUTH = {
  register: '/api/auth/register',
  login: '/api/auth/login',
  refresh: '/api/auth/refresh',
  logout: '/api/auth/logout',
} as const

export const USERS = {
  me: '/api/users/me',
  list: '/api/users',
  byId: (id: string) => `/api/users/${id}`,
} as const

export const PERMISSIONS = {
  catalog: '/api/permissions',
  byUser: (userId: string) => `/api/permissions/user/${userId}`,
  grant: '/api/permissions/grant',
  revoke: '/api/permissions/revoke',
  check: '/api/permissions/check',
} as const

export const TAGS = {
  list: '/api/tags',
  create: '/api/tags',
  byId: (id: string) => `/api/tags/${id}`,
} as const

export const EVENTS = {
  list: '/api/events',
  create: '/api/events',
  byId: (id: string) => `/api/events/${id}`,
  publish: (id: string) => `/api/events/${id}/publish`,
  cancel: (id: string) => `/api/events/${id}/cancel`,
  complete: (id: string) => `/api/events/${id}/complete`,
  mine: '/api/events/my',
} as const

export const RSVPS = {
  byEvent: (eventId: string) => `/api/events/${eventId}/rsvps`,
  byUser: (userId: string) => `/api/users/${userId}/rsvps`,
  byId: (id: string) => `/api/rsvps/${id}`,
} as const
