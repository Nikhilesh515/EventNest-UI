import { test, expect } from '@playwright/test'
import type { Page, Route } from '@playwright/test'

const USER_ID = '33333333-3333-4333-8333-333333333333'

const E_UPCOMING_A = 'e0000001-0000-4000-8000-000000000001'
const E_UPCOMING_B = 'e0000002-0000-4000-8000-000000000002'
const E_PAST = 'e0000003-0000-4000-8000-000000000003'
const E_CANCELLED = 'e0000004-0000-4000-8000-000000000004'

const user = {
  id: USER_ID,
  email: 'admin@eventnest.io',
  displayName: 'Admin User',
  roleName: 'Admin',
  isActive: true,
}
const permissions = [{ name: 'RSVPs.View' }, { name: 'RSVPs.Edit' }, { name: 'RSVPs.Cancel' }]

function makeEvent(id: string, title: string, startsAt: string, endsAt: string, location: string) {
  return {
    id,
    title,
    description: 'desc',
    location,
    startsAt,
    endsAt,
    capacity: 30,
    organizerId: USER_ID,
    organizerName: 'Admin User',
    status: 'Published',
    visibility: 'Public',
    going: 12,
    createdAt: '2026-09-12T09:00:00Z',
    tags: [],
  }
}

const events = [
  makeEvent(
    E_UPCOMING_A,
    'Lantern Night',
    '2026-12-01T18:00:00Z',
    '2026-12-01T21:00:00Z',
    'Shrine Hall',
  ),
  makeEvent(
    E_UPCOMING_B,
    'Mochi Market',
    '2026-12-20T10:00:00Z',
    '2026-12-20T13:00:00Z',
    'Old Market',
  ),
  makeEvent(E_PAST, 'Spring Parade', '2026-01-10T18:00:00Z', '2026-01-10T21:00:00Z', 'River Road'),
  makeEvent(
    E_CANCELLED,
    'Firefly Tour',
    '2026-12-28T19:00:00Z',
    '2026-12-28T22:00:00Z',
    'Bamboo Grove',
  ),
]

function makeRsvp(id: string, eventId: string, status: string, eventTitle: string, extra = {}) {
  return {
    id,
    userId: USER_ID,
    eventId,
    userName: 'Admin User',
    status,
    guestCount: 1,
    notes: '',
    respondedAt: '2026-09-02T10:00:00Z',
    createdAt: '2026-09-02T10:00:00Z',
    eventTitle,
    userEmail: 'admin@eventnest.io',
    active: status !== 'Cancelled',
    ...extra,
  }
}

const rsvps = [
  makeRsvp('r0000001-0000-4000-8000-000000000001', E_UPCOMING_A, 'Confirmed', 'Lantern Night', {
    guestCount: 3,
    notes: 'Bringing stickers',
  }),
  makeRsvp('r0000002-0000-4000-8000-000000000002', E_UPCOMING_B, 'Maybe', 'Mochi Market'),
  makeRsvp('r0000003-0000-4000-8000-000000000003', E_PAST, 'Declined', 'Spring Parade'),
  makeRsvp('r0000004-0000-4000-8000-000000000004', E_CANCELLED, 'Cancelled', 'Firefly Tour'),
]

const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'access-control-allow-headers': '*',
}

async function fulfillJson(route: Route, result: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    headers: cors,
    body: JSON.stringify({
      code: status,
      success: status < 400,
      message: null,
      result,
      errors: null,
    }),
  })
}

async function stubApi(page: Page, list: unknown[]) {
  await page.route('**/api/auth/refresh', (route) => fulfillJson(route, null, 204))
  await page.route('**/api/users/me', (route) => fulfillJson(route, user))
  await page.route('**/api/permissions/user/**', (route) => fulfillJson(route, permissions))
  await page.route('**/api/users/*/rsvps', (route) => fulfillJson(route, list))
  await page.route('**/api/events/*', (route) => {
    const id = new URL(route.request().url()).pathname.split('/').pop()
    const event = events.find((candidate) => candidate.id === id)
    if (event) return fulfillJson(route, event)
    return fulfillJson(route, null, 404)
  })
}

async function bootstrap(page: Page, theme: string) {
  await page.addInitScript((value) => {
    window.localStorage.setItem('eventnest.theme', value)
    window.localStorage.setItem('eventnest.auth.accessToken', 'test.token')
    window.localStorage.setItem('eventnest.auth.refreshToken', 'test.refresh')
    window.localStorage.setItem('eventnest.auth.userId', '33333333-3333-4333-8333-333333333333')
  }, theme)
}

const VIEWPORTS = [
  { name: 'desktop 1280', width: 1280, height: 900 },
  { name: 'tablet 768', width: 768, height: 1024 },
  { name: 'mobile 360', width: 360, height: 800 },
] as const
const THEMES = ['light', 'dark'] as const

for (const viewport of VIEWPORTS) {
  for (const theme of THEMES) {
    test(`my-rsvps stamp log structure · ${viewport.name} · ${theme}`, async ({ page }) => {
      await bootstrap(page, theme)
      await stubApi(page, rsvps)
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto('/my-rsvps')
      await page.waitForSelector('#my-rsvps-body[aria-busy="false"] .log-entry')

      await expect(page.locator('.breadcrumbs')).toHaveCount(1)
      await expect(page.locator('.page-doc__overline')).toHaveText('Attendee · 縁')
      await expect(page.locator('.page-doc__sub')).toHaveText('4 responses · 1 going · 1 maybe')

      const body = page.locator('#my-rsvps-body')
      await expect(body).toHaveCount(1)
      await expect(body).toHaveAttribute('aria-busy', 'false')

      await expect(page.locator('#my-rsvps-body .log-group')).toHaveCount(2)
      const heads = page.locator('#my-rsvps-body .log-group__head')
      await expect(heads.nth(0)).toContainText('Upcoming')
      await expect(heads.nth(0).locator('.tab__count')).toHaveText('(2)')
      await expect(heads.nth(1)).toContainText('Past')
      await expect(heads.nth(1).locator('.tab__count')).toHaveText('(1)')

      await expect(page.locator('.rsvp-details')).toHaveCount(1)
      await expect(page.locator('.rsvp-details > summary')).toHaveText('Cancelled (1)')

      await expect(page.locator('.log-entry')).toHaveCount(4)
      await expect(page.locator('.log-stamp--going')).toHaveCount(1)
      await expect(page.locator('.log-stamp--maybe')).toHaveCount(1)
      await expect(page.locator('.log-stamp--notgoing')).toHaveCount(1)
      await expect(page.locator('.log-stamp--cancelled')).toHaveCount(1)
      await expect(page.locator('.log-entry.is-past')).toHaveCount(1)
      await expect(page.locator('.log-entry.is-cancelled')).toHaveCount(1)

      const going = page.locator('.log-entry', { hasText: 'Lantern Night' })
      await expect(going.locator('.log-entry__date time')).toHaveCount(1)
      await expect(going.locator('.log-stamp__label')).toHaveText('Going')
      await expect(going.locator('.log-stamp__glyph')).toHaveText('✓')
      await expect(going.locator('.log-entry__title a')).toHaveAttribute(
        'href',
        `/events/${E_UPCOMING_A}`,
      )
      await expect(going.locator('.log-entry__meta')).toContainText('Shrine Hall')
      await expect(going.locator('.log-entry__meta')).toContainText('3 guests')
      await expect(going.locator('.log-entry__meta')).toContainText('Responded')
      await expect(going.locator('.log-entry__notes')).toHaveText('"Bringing stickers"')
      await expect(
        going.locator('.log-entry__actions .btn', { hasText: 'View event' }),
      ).toHaveCount(1)

      const cancelledRow = page.locator('.log-entry.is-cancelled')
      await expect(
        cancelledRow.locator('.log-entry__actions .btn', { hasText: 'RSVP again' }),
      ).toHaveCount(1)
      await expect(
        cancelledRow.locator('.log-entry__actions .btn', { hasText: 'Cancel' }),
      ).toHaveCount(0)

      const failures = await page.evaluate(() => {
        const problems: Array<{ selector: string; amount: number }> = []
        for (const selector of ['.stamp-log', '.log-entry']) {
          for (const node of Array.from(document.querySelectorAll<HTMLElement>(selector))) {
            const overflow = node.scrollHeight - node.clientHeight
            if (overflow > 1) problems.push({ selector, amount: overflow })
          }
        }
        return problems
      })
      expect(failures, JSON.stringify(failures)).toEqual([])
    })
  }
}

test('change menu lists the other two statuses and stays on top', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubApi(page, rsvps)
  await page.goto('/my-rsvps')
  await page.waitForSelector('#my-rsvps-body[aria-busy="false"] .log-entry')

  const going = page.locator('.log-entry', { hasText: 'Lantern Night' })
  await going.locator('.menu-wrap .btn').click()
  const panel = going.locator('.menu-panel[role="menu"]')
  await expect(panel).toBeVisible()
  const items = going.locator('.menu-panel .menu-item')
  await expect(items).toHaveCount(2)
  await expect(items.nth(0)).toHaveText('Change to Maybe')
  await expect(items.nth(1)).toHaveText('Change to Not Going')

  const onTop = await panel.evaluate((el) => {
    const rect = el.getBoundingClientRect()
    const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
    return hit !== null && el.contains(hit)
  })
  expect(onTop).toBe(true)
})

test('cancel opens the inline confirm across the row', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubApi(page, rsvps)
  await page.goto('/my-rsvps')
  await page.waitForSelector('#my-rsvps-body[aria-busy="false"] .log-entry')

  const going = page.locator('.log-entry', { hasText: 'Lantern Night' })
  await going.locator('.log-entry__actions .btn', { hasText: 'Cancel' }).click()

  const box = going.locator('.rsvp-confirm')
  await expect(box).toBeVisible()
  await expect(box.locator('.perm-confirm__msg')).toHaveText(
    'Remove this RSVP? The host will see one less guest.',
  )
  await expect(box.locator('.btn', { hasText: 'Keep it' })).toHaveCount(1)
  await expect(box.locator('.btn', { hasText: 'Yes, cancel' })).toHaveCount(1)

  const width = await box.evaluate((el) => el.getBoundingClientRect().width)
  expect(width, `confirm box width ${width}`).toBeGreaterThan(240)

  await box.locator('.btn', { hasText: 'Keep it' }).click()
  await expect(box).toHaveCount(0)
})

test('empty log shows the browse CTA', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubApi(page, [])
  await page.goto('/my-rsvps')
  await page.waitForSelector('#my-rsvps-body[aria-busy="false"]')
  await expect(page.locator('.empty__title')).toHaveText('No RSVPs pinned yet.')
  await expect(page.locator('.empty .btn', { hasText: 'Browse events' })).toHaveCount(1)
})
