import { test, expect } from '@playwright/test'
import type { Page, Route } from '@playwright/test'

const ADMIN_ID = '33333333-3333-4333-8333-333333333333'
const TAG = '0e7a2b11-0000-4000-8000-000000000001'
const EVENT_ID = 'a1a1a1a1-0000-4000-8000-000000000001'

const admin = {
  id: ADMIN_ID,
  email: 'admin@eventnest.io',
  displayName: 'Admin User',
  roleName: 'Admin',
  isActive: true,
}
const permissions = [
  { name: 'Events.Create' },
  { name: 'Events.Edit' },
  { name: 'Events.Delete' },
  { name: 'Tags.Create' },
  { name: 'RSVPs.Create' },
  { name: 'RSVPs.Manage' },
]
const tags = [{ id: TAG, name: 'Technology', color: '#3b82f6', createdAt: '2026-09-12T09:00:00Z' }]
const event = {
  id: EVENT_ID,
  title: 'GapGamma 131800',
  description: 'gamma',
  location: 'Somewhere',
  startsAt: '2026-10-13T18:00:00Z',
  endsAt: '2026-10-13T21:00:00Z',
  capacity: 10,
  organizerId: ADMIN_ID,
  organizerName: 'Admin User',
  status: 'Published',
  visibility: 'Public',
  going: 0,
  createdAt: '2026-09-12T09:00:00Z',
  tags: [{ tagId: TAG, tagName: 'Technology' }],
}

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

async function stubApi(page: Page) {
  await page.route('**/api/users/me', (route) => fulfillJson(route, admin))
  await page.route('**/api/permissions/user/**', (route) => fulfillJson(route, permissions))
  await page.route('**/api/tags**', (route) => fulfillJson(route, tags))
  await page.route(/\/api\/events\/[^/?]+$/, (route) => fulfillJson(route, event))
}

async function bootstrap(page: Page, theme: string) {
  await page.addInitScript((value) => {
    window.localStorage.setItem('eventnest.theme', value)
    window.localStorage.setItem('eventnest.auth.accessToken', 'test.token')
    window.localStorage.setItem('eventnest.auth.refreshToken', 'test.refresh')
    window.localStorage.setItem('eventnest.auth.userId', '33333333-3333-4333-8333-333333333333')
  }, theme)
  await stubApi(page)
}

const VIEWPORTS = [
  { name: 'desktop 1280', width: 1280, height: 900 },
  { name: 'tablet 768', width: 768, height: 1024 },
  { name: 'mobile 360', width: 360, height: 800 },
] as const
const THEMES = ['light', 'dark'] as const

async function assertClipboard(page: Page) {
  await expect(page.locator('.clipboard')).toHaveCount(1)
  await expect(page.locator('.clipboard__clip')).toHaveCount(1)
  await expect(page.locator('#create-form')).toHaveCount(1)
  await expect(page.locator('.clipboard-tabs')).toHaveCount(1)
  await expect(page.locator('#form-summary-slot')).toHaveCount(1)
  await expect(page.locator('#f-title')).toHaveCount(1)
  await expect(page.locator('#f-desc')).toHaveCount(1)
  await expect(page.locator('#f-loc')).toHaveCount(1)
  await expect(page.locator('#f-start')).toHaveCount(1)
  await expect(page.locator('#f-end')).toHaveCount(1)
  await expect(page.locator('#f-capacity')).toHaveCount(1)
  await expect(page.locator('.field--lined')).not.toHaveCount(0)
  await expect(page.locator('.chip-select')).toHaveCount(1)
  await expect(page.locator('.form-footer .btn')).toHaveCount(3)
  const failures = await page.evaluate(() => {
    const problems: Array<{ selector: string; amount: number }> = []
    for (const node of Array.from(document.querySelectorAll<HTMLElement>('.clipboard'))) {
      const overflow = node.scrollHeight - node.clientHeight
      if (overflow > 1) problems.push({ selector: '.clipboard', amount: overflow })
    }
    return problems
  })
  expect(failures, JSON.stringify(failures)).toEqual([])
}

for (const viewport of VIEWPORTS) {
  for (const theme of THEMES) {
    test(`create form structure · ${viewport.name} · ${theme}`, async ({ page }) => {
      await bootstrap(page, theme)
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto('/events/create')
      await page.waitForSelector('#create-form')
      await expect(page.locator('#f-title')).toHaveValue('')
      await expect(page.locator('#f-capacity')).toHaveValue('50')
      await assertClipboard(page)
    })

    test(`edit form structure · ${viewport.name} · ${theme}`, async ({ page }) => {
      await bootstrap(page, theme)
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto(`/events/${EVENT_ID}/edit`)
      await page.waitForSelector('#create-form')
      await expect(page.locator('#f-title')).toHaveValue('GapGamma 131800')
      await expect(page.locator('.clipboard-status.edit-status-strip')).toHaveCount(1)
      await expect(page.locator('.clipboard-danger')).toHaveCount(1)
      await assertClipboard(page)
    })
  }
}
