import { test, expect } from '@playwright/test'
import type { Page, Route } from '@playwright/test'

const USER_ID = '33333333-3333-4333-8333-333333333333'
const EVENT_ID = 'e0000001-0000-4000-8000-000000000001'

const user = {
  id: USER_ID,
  email: 'admin@eventnest.io',
  displayName: 'Ava Sinclair',
  role: 'Admin',
  isActive: true,
}

const permissions = [{ name: 'RSVPs.Manage' }, { name: 'RSVPs.View' }]

const event = {
  id: EVENT_ID,
  title: 'Distributed Systems Deep Dive',
  description: 'desc',
  location: 'Innovation Hub',
  startsAt: '2026-10-24T18:00:00Z',
  endsAt: '2026-10-24T21:00:00Z',
  capacity: 120,
  organizerId: USER_ID,
  organizerName: 'Ava Sinclair',
  status: 'Published',
  visibility: 'Public',
  going: 84,
  createdAt: '2026-09-01T09:00:00Z',
  tags: [{ tagId: 'tag-1', tagName: 'Technology' }],
}

function attendee(
  id: string,
  userName: string,
  status: string,
  guestCount: number,
  notes: string,
  respondedAt: string,
  active = true,
) {
  return {
    id,
    userId: `u-${id}`,
    eventId: EVENT_ID,
    userName,
    userEmail: `${userName.split(' ')[0]?.toLowerCase()}@example.com`,
    status,
    guestCount,
    notes,
    respondedAt,
    createdAt: respondedAt,
    eventTitle: event.title,
    active,
  }
}

const attendees = [
  attendee('a1', 'Priya Nair', 'Confirmed', 2, 'Vegan meal, please', '2026-03-03T09:00:00Z'),
  attendee('a2', 'Marcus Lee', 'Maybe', 1, '', '2026-03-04T13:20:00Z'),
  attendee('a3', 'Hana Sato', 'Confirmed', 3, 'Bringing colleagues', '2026-02-28T16:10:00Z'),
  attendee('a4', 'Diego Alvarez', 'Declined', 0, "Can't make it, sorry!", '2026-03-01T10:45:00Z'),
  attendee('a5', 'Yuki Tanaka', 'Confirmed', 1, '', '2026-03-02T07:30:00Z'),
  attendee('a6', 'Omar Haddad', 'Cancelled', 1, 'Had to cancel', '2026-03-05T18:00:00Z'),
  attendee('a7', 'Lena Fischer', 'Confirmed', 2, 'Wheelchair access', '2026-02-26T11:15:00Z'),
  attendee('a8', 'Jonas Weber', 'Maybe', 0, 'Tentative', '2026-03-06T14:50:00Z', false),
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

async function stubApi(
  page: Page,
  list: unknown[],
  opts: { user?: unknown; permissions?: unknown[]; event?: unknown } = {},
) {
  await page.route('**/api/auth/refresh', (route) => fulfillJson(route, null, 204))
  await page.route('**/api/users/me', (route) => fulfillJson(route, opts.user ?? user))
  await page.route('**/api/permissions/user/**', (route) =>
    fulfillJson(route, opts.permissions ?? permissions),
  )
  await page.route('**/api/events/*/rsvps', (route) => fulfillJson(route, list))
  await page.route('**/api/events/*', (route) => fulfillJson(route, opts.event ?? event))
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
    test(`attendees guestbook structure · ${viewport.name} · ${theme}`, async ({ page }) => {
      await bootstrap(page, theme)
      await stubApi(page, attendees)
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto(`/events/${EVENT_ID}/attendees`)
      await page.waitForSelector('#attendees-root[aria-busy="false"] table.table-punch')

      await expect(page.locator('.breadcrumbs')).toHaveCount(1)
      await expect(page.locator('.breadcrumbs')).toContainText('My Events')
      await expect(page.locator('.breadcrumbs')).toContainText('Attendees')

      await expect(page.locator('.guestbook')).toHaveCount(1)
      await expect(page.locator('.guestbook__watermark')).toHaveText('縁')
      await expect(page.locator('.guestbook__frame')).toHaveText('祭')
      await expect(page.locator('.guestbook__titles .page-doc__title')).toHaveText('Attendees')
      await expect(page.locator('.guestbook__titles .page-doc__overline')).toHaveText(
        'My events / … / Attendees · 縁',
      )
      await expect(page.locator('.guestbook__titles .page-doc__sub')).toHaveText(
        'Capacity 120 · 84 going · 36 spots left',
      )
      await expect(page.locator('.guestbook__head .btn', { hasText: 'View event' })).toHaveCount(1)

      await expect(page.locator('.stats-wrap .stat-row .stat')).toHaveCount(5)
      await expect(page.locator('.stat--going .stat__value')).toHaveText('84')
      await expect(page.locator('.stat--going .stat__sub')).toHaveText('people')
      await expect(page.locator('.stat--maybe .stat__value')).toHaveText('2')
      await expect(page.locator('.stat--notgoing .stat__value')).toHaveText('1')
      await expect(page.locator('.stat--cancelled .stat__value')).toHaveText('1')
      await expect(page.locator('.stat--guests .stat__value')).toHaveText('84 / 120')
      await expect(page.locator('.stat--guests .stat__sub')).toHaveText('going people')

      await expect(page.locator('.filter-chips#att-filter .filter-chip')).toHaveCount(5)
      await expect(page.locator('.filter-chip .filter-chip__n')).toHaveCount(5)
      await expect(page.locator('.filter-chip').first()).toHaveAttribute('aria-pressed', 'true')
      await expect(page.locator('.filter-chip').first().locator('.filter-chip__n')).toHaveText(
        '(8)',
      )

      await expect(page.locator('table.table-punch')).toHaveCount(1)
      await expect(page.locator('table.table-punch caption.sr-only')).toHaveCount(1)
      await expect(page.locator('table.table-punch thead th')).toHaveCount(5)
      await expect(page.locator('table.table-punch tbody tr')).toHaveCount(8)
      await expect(page.locator('.guestbook-table__frame')).toHaveCount(8)
      await expect(page.locator('.guestbook-table__frame').first()).toHaveText('PN')
      await expect(page.locator('.table-punch__guest .email').first()).toHaveText(
        'priya@example.com',
      )
      await expect(page.locator('.deactivated-chip')).toHaveCount(1)
      await expect(page.locator('.notes-btn')).toHaveCount(6)
      await expect(page.locator('.tertiary')).toHaveCount(2)
      await expect(page.locator('td.num.tnum')).toHaveCount(8)
      await expect(page.locator('.rsvp-chip--going')).toHaveCount(4)

      const cancelledRow = page.locator('tbody tr', { hasText: 'Omar Haddad' })
      await expect(cancelledRow).toHaveAttribute('style', /opacity:\s*0\.75/)

      await expect(page.locator('tbody time').first()).toHaveText('Mar 3, 2026')
      await expect(page.locator('#att-table-slot .pager-meta')).toHaveText('8 records')

      const failures = await page.evaluate(() => {
        const problems: Array<{ selector: string; amount: number }> = []
        for (const selector of ['.guestbook', '.table-scroll']) {
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

test('filter chips narrow the guest list', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubApi(page, attendees)
  await page.goto(`/events/${EVENT_ID}/attendees`)
  await page.waitForSelector('#attendees-root[aria-busy="false"] table.table-punch')

  const goingChip = page.getByRole('button', { name: 'Going (4)' })
  await goingChip.click()
  await expect(goingChip).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('table.table-punch tbody tr')).toHaveCount(4)
  await expect(page.locator('#att-table-slot .pager-meta')).toHaveText('4 records')

  await page.getByRole('button', { name: 'Cancelled (1)' }).click()
  await expect(page.locator('table.table-punch tbody tr')).toHaveCount(1)
})

test('notes button opens the note modal', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubApi(page, attendees)
  await page.goto(`/events/${EVENT_ID}/attendees`)
  await page.waitForSelector('#attendees-root[aria-busy="false"] table.table-punch')

  await page.locator('.notes-btn').first().click()
  const modal = page.locator('.modal[role="dialog"]')
  await expect(modal).toBeVisible()
  await expect(modal.locator('.modal__title')).toHaveText('Note from Priya Nair')
  await expect(modal.locator('.modal__body')).toHaveText('Vegan meal, please')
  await modal.locator('.modal__footer .btn', { hasText: 'Close' }).click()
  await expect(modal).toHaveCount(0)
})

test('empty guestbook shows the back-to-event CTA', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubApi(page, [])
  await page.goto(`/events/${EVENT_ID}/attendees`)
  await page.waitForSelector('#attendees-root[aria-busy="false"] .empty')
  await expect(page.locator('.empty__title')).toHaveText("No one's RSVP'd yet.")
  await expect(page.locator('.empty .btn', { hasText: 'Back to event' })).toHaveCount(1)
})

test('empty filtered view drops the CTA', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubApi(
    page,
    attendees.filter((row) => row.status !== 'Cancelled'),
  )
  await page.goto(`/events/${EVENT_ID}/attendees?status=cancelled`)
  await page.waitForSelector('#attendees-root[aria-busy="false"] .empty')
  await expect(page.locator('.empty__title')).toHaveText('No Cancelled guests yet.')
  await expect(page.locator('.empty__body')).toHaveText('Try another filter.')
  await expect(page.locator('.empty .btn')).toHaveCount(0)
})

test('a permitted non-organizer cannot peek', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubApi(page, attendees, {
    user: { ...user, id: '99999999-9999-4999-8999-999999999999', role: 'Organizer' },
  })
  await page.goto(`/events/${EVENT_ID}/attendees`)
  await page.waitForSelector('#attendees-root[aria-busy="false"] .error-state')
  await expect(page.locator('.error-state__title')).toHaveText(
    "You can't peek behind this counter.",
  )
  await expect(page.locator('.error-state__body')).toHaveText(
    "Only the event's organizer can see the guest list.",
  )
})
