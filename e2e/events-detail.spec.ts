import { test, expect } from '@playwright/test'
import type { Page, Route } from '@playwright/test'

const TAG = '0e7a2b11-0000-4000-8000-000000000001'
const GUEST_ID = '99999999-9999-4999-8999-999999999999'
const ORGANIZER_ID = '33333333-3333-4333-8333-333333333333'
const EVENT_ID = 'a1a1a1a1-0000-4000-8000-000000000001'

const tags = [{ id: TAG, name: 'Technology', color: '#3b82f6', createdAt: '2026-09-12T09:00:00Z' }]

const event = {
  id: EVENT_ID,
  title: 'Distributed Systems Deep Dive',
  description: 'A deep dive into consensus, replication, and the tradeoffs that keep systems standing.',
  location: 'Innovation Hub, Floor 3, Room 3B',
  startsAt: '2026-10-13T18:00:00Z',
  endsAt: '2026-10-13T21:00:00Z',
  capacity: 120,
  organizerId: ORGANIZER_ID,
  organizerName: 'Ava Sinclair',
  status: 'Published',
  visibility: 'Public',
  going: 84,
  createdAt: '2026-09-12T09:00:00Z',
  tags: [{ tagId: TAG, tagName: 'Technology' }],
}

const guest = {
  id: GUEST_ID,
  email: 'guest@eventnest.io',
  displayName: 'Guest Tester',
  roleName: 'User',
  isActive: true,
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
  await page.route('**/api/users/me', (route) => fulfillJson(route, guest))
  await page.route('**/api/permissions/user/**', (route) => fulfillJson(route, null, 404))
  await page.route('**/api/users/*/rsvps**', (route) => fulfillJson(route, []))
  await page.route('**/api/tags**', (route) => fulfillJson(route, tags))
  await page.route(/\/api\/events\/[^/?]+$/, (route) => fulfillJson(route, event))
}

const VIEWPORTS = [
  { name: 'desktop 1280', width: 1280, height: 900 },
  { name: 'tablet 768', width: 768, height: 1024 },
  { name: 'mobile 360', width: 360, height: 800 },
] as const

const THEMES = ['light', 'dark'] as const

for (const viewport of VIEWPORTS) {
  for (const theme of THEMES) {
    test(`detail spread structure + no overflow · ${viewport.name} · ${theme}`, async ({ page }) => {
      await page.addInitScript((value) => {
        window.localStorage.setItem('eventnest.theme', value)
        window.localStorage.setItem('eventnest.auth.accessToken', 'test.token')
        window.localStorage.setItem('eventnest.auth.refreshToken', 'test.refresh')
        window.localStorage.setItem('eventnest.auth.userId', '99999999-9999-4999-8999-999999999999')
      }, theme)
      await stubApi(page)
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto(`/events/${EVENT_ID}`)
      await page.waitForSelector('#detail-root[aria-busy="false"] .spread__postcard')

      await expect(page.locator('#detail-root')).toHaveCount(1)
      await expect(page.locator('#spread-root')).toHaveCount(1)
      await expect(page.locator('#spread-seam')).toHaveCount(1)
      await expect(page.locator('#rsvp-slot')).toHaveCount(1)
      await expect(page.locator('#capacity-panel')).toHaveCount(1)

      await expect(page.locator('.spread__postcard.postcard')).toHaveCount(1)
      await expect(page.locator('aside.spread__reply.reply-card')).toHaveCount(1)
      await expect(page.locator('.postcard__patch.pattern--chiyogami-asa')).toHaveCount(1)
      await expect(page.locator('.postcard__rule')).toHaveCount(2)
      await expect(page.locator('.detail-desc')).toHaveText(/consensus/)
      await expect(page.locator('.meta-grid .meta-row')).toHaveCount(5)
      await expect(page.locator('.owner-chip')).toHaveCount(1)

      await expect(page.locator('.rsvp-card')).toHaveCount(1)
      await expect(page.locator('.sticker-sheet')).toHaveCount(1)
      await expect(page.locator('.sticker-sheet .rsvp-sticker')).toHaveCount(4)
      await expect(page.locator('.sticker-sheet .rsvp-sticker__glyph')).toHaveCount(4)

      const failures = await page.evaluate(() => {
        const problems: Array<{ selector: string; amount: number }> = []
        for (const selector of ['.spread__postcard', '.spread__reply', '#capacity-panel', '.rsvp-card']) {
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
