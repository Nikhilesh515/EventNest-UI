import { test, expect } from '@playwright/test'
import type { Page, Route } from '@playwright/test'

const ADMIN_ID = '33333333-3333-4333-8333-333333333333'
const TAG = '0e7a2b11-0000-4000-8000-000000000001'

const admin = {
  id: ADMIN_ID,
  email: 'admin@eventnest.io',
  displayName: 'Admin User',
  roleName: 'Admin',
  isActive: true,
}
const permissions = [{ name: 'Events.Create' }, { name: 'Events.Edit' }, { name: 'Tags.Create' }]
const tags = [{ id: TAG, name: 'Technology', color: '#3b82f6', createdAt: '2026-09-12T09:00:00Z' }]

function makeEvent(index: number, status: string, startsAt: string, endsAt: string) {
  return {
    id: `e000000${index}-0000-4000-8000-00000000000${index}`,
    title: `My Event ${index}`,
    description: 'desc',
    location: 'Somewhere',
    startsAt,
    endsAt,
    capacity: 30,
    organizerId: ADMIN_ID,
    organizerName: 'Admin User',
    status,
    visibility: 'Public',
    going: 12,
    createdAt: '2026-09-12T09:00:00Z',
    tags: [{ tagId: TAG, tagName: 'Technology' }],
  }
}

const events = [
  makeEvent(1, 'Draft', '2026-12-01T18:00:00Z', '2026-12-01T21:00:00Z'),
  makeEvent(2, 'Published', '2026-01-10T18:00:00Z', '2026-01-10T21:00:00Z'),
  makeEvent(3, 'Published', '2026-12-20T18:00:00Z', '2026-12-20T21:00:00Z'),
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
    body: JSON.stringify({ code: status, success: status < 400, message: null, result, errors: null }),
  })
}

async function stubApi(page: Page, list: unknown[]) {
  await page.route('**/api/users/me', (route) => fulfillJson(route, admin))
  await page.route('**/api/permissions/user/**', (route) => fulfillJson(route, permissions))
  await page.route('**/api/tags**', (route) => fulfillJson(route, tags))
  await page.route('**/api/events/my**', (route) => fulfillJson(route, list))
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
    test(`my-events notebook structure · ${viewport.name} · ${theme}`, async ({ page }) => {
      await bootstrap(page, theme)
      await stubApi(page, events)
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto('/my-events')
      await page.waitForSelector('#my-events-list[aria-busy="false"] .punch-row')

      await expect(page.locator('.breadcrumbs')).toHaveCount(1)
      await expect(page.locator('.page-doc__overline')).toHaveText('Organizer · 手帳')
      await expect(page.locator('.tab')).toHaveCount(5)
      await expect(page.locator('.tab .tab__count')).toHaveCount(5)
      await expect(page.locator('.tab').first().locator('.tab__count')).toHaveText('3')
      await expect(page.locator('.notebook')).toHaveCount(1)
      await expect(page.locator('#my-events-list')).toHaveCount(1)
      await expect(page.locator('.notebook__spiral span')).toHaveCount(8)
      await expect(page.locator('#my-events-list .punch-row')).toHaveCount(3)

      const draftRow = page.locator('.punch-row', { hasText: 'My Event 1' })
      await expect(draftRow).toHaveClass(/is-draft/)
      await expect(draftRow.locator('.punch-row__actions .btn', { hasText: 'Publish' })).toHaveCount(1)
      const pastRow = page.locator('.punch-row', { hasText: 'My Event 2' })
      await expect(pastRow.locator('.punch-row__actions .btn', { hasText: 'Complete' })).toHaveCount(1)
      await expect(page.locator('.punch-row__head .cluster')).toHaveCount(3)

      const failures = await page.evaluate(() => {
        const problems: Array<{ selector: string; amount: number }> = []
        for (const selector of ['.notebook', '.punch-row']) {
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

test('row dropdown opens with Edit + Delete', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubApi(page, events)
  await page.goto('/my-events')
  await page.waitForSelector('#my-events-list[aria-busy="false"] .punch-row')
  const row = page.locator('.punch-row', { hasText: 'My Event 3' })
  await row.locator('.menu-wrap .icon-btn').click()
  const panel = row.locator('.menu-panel[role="menu"]')
  await expect(panel).toBeVisible()
  await expect(row.locator('.menu-panel .menu-item')).toHaveCount(2)
  await expect(row.locator('.menu-item--danger')).toHaveCount(1)

  // The panel must be the topmost element over the next row (not covered by it).
  const onTop = await panel.evaluate((el) => {
    const rect = el.getBoundingClientRect()
    const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
    return hit !== null && el.contains(hit)
  })
  expect(onTop).toBe(true)
})

test('empty stall shows the create CTA', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubApi(page, [])
  await page.goto('/my-events')
  await page.waitForSelector('#my-events-list[aria-busy="false"]')
  await expect(page.locator('.empty__title')).toHaveText('Your stall is empty.')
})

test('empty tab shows the Show all CTA', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubApi(page, events)
  await page.goto('/my-events?status=Cancelled')
  await page.waitForSelector('#my-events-list[aria-busy="false"]')
  await expect(page.locator('.empty__title')).toHaveText('Nothing in Cancelled.')
  await expect(page.locator('.empty .btn', { hasText: 'Show all' })).toHaveCount(1)
})
