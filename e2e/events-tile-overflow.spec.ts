import { test, expect } from '@playwright/test'
import type { Page, Route } from '@playwright/test'

const TAG_TECH = '0e7a2b11-0000-4000-8000-000000000001'
const TAG_MUSIC = '0e7a2b11-0000-4000-8000-000000000002'
const TAG_FOOD = '0e7a2b11-0000-4000-8000-000000000003'
const ORGANIZER = '33333333-3333-4333-8333-333333333333'

const tags = [
  { id: TAG_TECH, name: 'Technology', color: '#3b82f6', createdAt: '2026-09-12T09:00:00Z' },
  { id: TAG_MUSIC, name: 'Music', color: '#ef4444', createdAt: '2026-09-12T09:00:00Z' },
  { id: TAG_FOOD, name: 'Food', color: '#f59e0b', createdAt: '2026-09-12T09:00:00Z' },
]

/* Deliberately long titles/locations so every caption is pushed well past the
   old fixed `36% / 1fr` caption track — this is what the regression guards. */
const LONG_LOCATION = 'The Grand Riverside Exhibition Hall, North Pavilion, Bay 7, Kyoto'

function event(index: number) {
  const tagPool = [
    [TAG_TECH, TAG_MUSIC, TAG_FOOD],
    [TAG_MUSIC, TAG_FOOD],
    [TAG_TECH, TAG_FOOD],
  ]
  const tagIds = tagPool[index % tagPool.length] ?? [TAG_TECH]
  return {
    id: `1111111${index}-1111-4111-8111-1111111111${String(index).padStart(2, '0')}`,
    title: `Neon Paper Lantern Night Market & Street Food Festival, Chapter ${index + 1}`,
    description: 'An evening of lanterns, stalls, and loud music.',
    location: LONG_LOCATION,
    startsAt: `2026-11-${String((index % 27) + 1).padStart(2, '0')}T18:00:00Z`,
    endsAt: `2026-11-${String((index % 27) + 1).padStart(2, '0')}T23:30:00Z`,
    capacity: 120,
    organizerId: ORGANIZER,
    organizerName: 'System Admin',
    status: index % 5 === 0 ? 'Draft' : 'Published',
    visibility: index % 3 === 0 ? 'Private' : 'Public',
    going: (index * 7) % 120,
    createdAt: '2026-09-12T09:00:00Z',
    tags: tagIds.map((tagId) => ({
      tagId,
      tagName: tags.find((tag) => tag.id === tagId)?.name ?? 'Tag',
    })),
  }
}

const events = Array.from({ length: 9 }, (_, index) => event(index))

const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'access-control-allow-headers': '*',
}

async function fulfillJson(route: Route, result: unknown) {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    headers: cors,
    body: JSON.stringify({ code: 200, success: true, message: null, result, errors: null }),
  })
}

async function stubApi(page: Page) {
  await page.route('**/api/tags**', (route) => fulfillJson(route, tags))

  await page.route('**/api/events**', (route) => {
    const url = new URL(route.request().url())
    const pageSize = Number(url.searchParams.get('pageSize') ?? '9')
    const page = Number(url.searchParams.get('page') ?? '1')

    if (pageSize === 1) {
      return fulfillJson(route, { items: events.slice(0, 1), total: events.length, page: 1, size: 1, pages: events.length })
    }

    const start = (page - 1) * pageSize
    const items = events.slice(start, start + pageSize)
    return fulfillJson(route, {
      items,
      total: events.length,
      page,
      size: pageSize,
      pages: Math.max(1, Math.ceil(events.length / pageSize)),
    })
  })
}

const VIEWPORTS = [
  { name: 'desktop 1280', width: 1280, height: 900 },
  { name: 'tablet 768', width: 768, height: 1024 },
  { name: 'mobile 360', width: 360, height: 800 },
] as const

const THEMES = ['light', 'dark'] as const

for (const viewport of VIEWPORTS) {
  for (const theme of THEMES) {
    test(`every tile caption fits its polaroid · ${viewport.name} · ${theme}`, async ({ page }) => {
      await page.addInitScript((value) => {
        window.localStorage.setItem('eventnest.theme', value)
      }, theme)
      await stubApi(page)

      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto('/events')

      await page.waitForSelector('#events-results[aria-busy="false"] .tile')
      await expect(page.locator('.tile').first()).toBeVisible()
      await page.evaluate(() => document.fonts?.ready)

      const failures = await page.evaluate(() => {
        const problems: Array<{ kind: string; reason: string; amount: number }> = []
        const captions = Array.from(document.querySelectorAll<HTMLElement>('.tile__caption'))
        for (const caption of captions) {
          const kind = caption.closest('.tile')?.className ?? 'tile'

          const captionOverflow = caption.scrollHeight - caption.clientHeight
          if (captionOverflow > 1) {
            problems.push({ kind, reason: 'caption scroll', amount: captionOverflow })
          }

          const captionBox = caption.getBoundingClientRect()
          const polaroid = caption.parentElement?.getBoundingClientRect()
          if (polaroid && captionBox.bottom - polaroid.bottom > 1) {
            problems.push({
              kind,
              reason: 'polaroid clip',
              amount: Math.round(captionBox.bottom - polaroid.bottom),
            })
          }

          for (const node of Array.from(
            caption.querySelectorAll<HTMLElement>('.tile__meta, .tile__footer, .capacity'),
          )) {
            const box = node.getBoundingClientRect()
            if (box.bottom - captionBox.bottom > 1) {
              problems.push({
                kind,
                reason: `clipped ${node.className}`,
                amount: Math.round(box.bottom - captionBox.bottom),
              })
            }
          }
        }
        return problems
      })

      expect(failures, JSON.stringify(failures, null, 2)).toEqual([])
    })
  }
}
