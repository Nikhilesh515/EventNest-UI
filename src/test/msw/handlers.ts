import { http, HttpResponse } from 'msw'

export const ok = <T>(result: T, code = 200) =>
  HttpResponse.json({ code, success: true, message: null, result, errors: null }, { status: code })

export const fail = (
  status: number,
  message: string,
  errors: Record<string, string[]> | null = null,
) => HttpResponse.json({ code: status, success: false, message, result: null, errors }, { status })

const TAG_TECH = '0e7a2b11-0000-4000-8000-000000000001'
const TAG_MUSIC = '0e7a2b11-0000-4000-8000-000000000002'
const EVENT_DRAFT = '11111111-1111-4111-8111-111111111111'
const EVENT_PUBLISHED = '22222222-2222-4222-8222-222222222222'
const ADMIN_ID = '33333333-3333-4333-8333-333333333333'

const tags = [
  { id: TAG_TECH, name: 'Technology', color: '#3b82f6', createdAt: '2026-09-12T09:00:00Z' },
  { id: TAG_MUSIC, name: 'Music', color: '#ef4444', createdAt: '2026-09-12T09:00:00Z' },
]

const events = [
  {
    id: EVENT_DRAFT,
    title: 'Tech Meetup 2026',
    description: 'Monthly tech meetup',
    location: 'Convention Center',
    startsAt: '2026-10-12T18:00:00Z',
    endsAt: '2026-10-12T21:00:00Z',
    capacity: 100,
    organizerId: ADMIN_ID,
    organizerName: 'System Admin',
    status: 'Draft',
    createdAt: '2026-09-12T09:00:00Z',
    tags: [{ tagId: TAG_TECH, tagName: 'Technology' }],
  },
  {
    id: EVENT_PUBLISHED,
    title: 'Food Festival',
    description: 'Street food festival',
    location: 'Riverside Park',
    startsAt: '2026-11-01T11:00:00Z',
    endsAt: '2026-11-01T18:00:00Z',
    capacity: 200,
    organizerId: ADMIN_ID,
    organizerName: 'System Admin',
    status: 'Published',
    createdAt: '2026-09-12T09:00:00Z',
    tags: [{ tagId: TAG_MUSIC, tagName: 'Music' }],
  },
]

const adminUser = {
  id: ADMIN_ID,
  email: 'admin@eventnest.io',
  displayName: 'Admin User',
  roleName: 'Admin',
  isActive: true,
}

export const handlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = (await request.json()) as { email: string; password: string }
    if (email !== 'admin@eventnest.io' || password !== 'Admin@123') {
      return fail(401, 'Invalid email or password.')
    }
    return ok({
      accessToken: 'test.access.token',
      refreshToken: 'test.refresh.token',
      expiresIn: 3600,
      user: adminUser,
    })
  }),
  http.post('/api/auth/refresh', async ({ request }) => {
    const { refreshToken } = (await request.json()) as { refreshToken: string }
    if (refreshToken !== 'test.refresh.token') return fail(401, 'Invalid refresh token.')
    return ok({
      accessToken: 'test.access.token.2',
      refreshToken: 'test.refresh.token.2',
      expiresIn: 3600,
      user: adminUser,
    })
  }),
  http.post('/api/auth/logout', () => new HttpResponse(null, { status: 204 })),
  http.post('/api/auth/register', async ({ request }) => {
    const body = (await request.json()) as { email: string; displayName: string }
    return ok({
      accessToken: 'test.access.token',
      refreshToken: 'test.refresh.token',
      expiresIn: 3600,
      user: { ...adminUser, email: body.email, displayName: body.displayName, roleName: 'User' },
    })
  }),

  http.get('/api/users/me', () => ok(adminUser)),
  http.get('/api/users', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '1')
    const pageSize = Number(url.searchParams.get('pageSize') ?? '20')
    const start = (page - 1) * pageSize
    return ok([adminUser].slice(start, start + pageSize))
  }),
  http.get('/api/users/:id', ({ params }) =>
    params.id === ADMIN_ID ? ok(adminUser) : fail(404, 'User not found.'),
  ),
  http.put('/api/users/:id', async ({ request }) => {
    const body = (await request.json()) as { displayName: string }
    return ok({ ...adminUser, displayName: body.displayName })
  }),
  http.delete('/api/users/:id', () => new HttpResponse(null, { status: 204 })),

  http.get('/api/permissions', () =>
    HttpResponse.json({ error: { code: 404, message: 'Not found' } }, { status: 404 }),
  ),
  http.get('/api/permissions/user/:userId', () =>
    HttpResponse.json({ error: { code: 404, message: 'Not found' } }, { status: 404 }),
  ),
  http.post('/api/permissions/grant', ({ params }) => fail(404, `Not found: ${String(params)}`)),
  http.post('/api/permissions/revoke', () => new HttpResponse(null, { status: 204 })),

  http.get('/api/tags', () => ok(tags)),
  http.post('/api/tags', async ({ request }) => {
    const body = (await request.json()) as { name: string; color: string }
    if (tags.some((tag) => tag.name.toLowerCase() === body.name.toLowerCase())) {
      return fail(409, 'A tag with that name already exists.', { name: ['Duplicate name.'] })
    }
    return ok(
      {
        id: `tag-${Date.now()}`,
        name: body.name,
        color: body.color,
        createdAt: new Date().toISOString(),
      },
      201,
    )
  }),
  http.get('/api/tags/:id', ({ params }) => {
    const tag = tags.find((item) => item.id === params.id)
    return tag ? ok(tag) : fail(404, 'Tag not found.')
  }),
  http.put('/api/tags/:id', async ({ params, request }) => {
    const tag = tags.find((item) => item.id === params.id)
    if (!tag) return fail(404, 'Tag not found.')
    const body = (await request.json()) as { name: string; color: string }
    return ok({ ...tag, ...body })
  }),
  http.delete('/api/tags/:id', () => new HttpResponse(null, { status: 204 })),

  http.get('/api/events', ({ request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const result = status
      ? events.filter((event) => event.status.toLowerCase() === status.toLowerCase())
      : events
    return ok(result)
  }),
  http.get('/api/events/:id', ({ params }) => {
    const event = events.find((item) => item.id === params.id)
    return event ? ok(event) : fail(404, `Event with ID '${String(params.id)}' was not found.`)
  }),
  http.post('/api/events', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    return ok(
      { id: `event-${Date.now()}`, status: 'Draft', going: 0, visibility: 'Public', ...body },
      201,
    )
  }),
  http.put('/api/events/:id', async ({ params, request }) => {
    const event = events.find((item) => item.id === params.id)
    const body = (await request.json()) as Record<string, unknown>
    return ok({ ...(event ?? events[0]), ...body })
  }),
  http.delete('/api/events/:id', () => new HttpResponse(null, { status: 204 })),
  http.put('/api/events/:id/publish', ({ params }) =>
    ok({ ...(events.find((item) => item.id === params.id) ?? events[0]), status: 'Published' }),
  ),
  http.put('/api/events/:id/cancel', ({ params }) =>
    ok({ ...(events.find((item) => item.id === params.id) ?? events[0]), status: 'Cancelled' }),
  ),
  http.put('/api/events/:id/complete', ({ params }) =>
    ok({ ...(events.find((item) => item.id === params.id) ?? events[0]), status: 'Completed' }),
  ),
  http.get('/api/events/my', () => ok(events)),

  http.get('/api/events/:eventId/rsvps', () => ok([])),
  http.post('/api/events/:eventId/rsvps', async ({ request }) => {
    const body = (await request.json()) as { guestCount: number; notes?: string }
    return ok(
      {
        id: `rsvp-${Date.now()}`,
        eventId: 'event',
        userId: ADMIN_ID,
        userName: 'Admin User',
        status: 'Confirmed',
        guestCount: body.guestCount,
        notes: body.notes ?? '',
        respondedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
      201,
    )
  }),
  http.delete('/api/events/:eventId/rsvps', () => new HttpResponse(null, { status: 204 })),
  http.get('/api/users/:userId/rsvps', () => ok([])),
  http.get('/api/rsvps/:id', () =>
    HttpResponse.json({ error: { code: 404, message: 'Not found' } }, { status: 404 }),
  ),
  http.put('/api/rsvps/:id', () =>
    HttpResponse.json({ error: { code: 404, message: 'Not found' } }, { status: 404 }),
  ),
]
