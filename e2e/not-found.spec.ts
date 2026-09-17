import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'access-control-allow-headers': '*',
}

const json = (result: unknown, status = 200) => ({
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

async function stubApi(page: Page) {
  await page.route('**/api/users/me', (route) => route.fulfill(json(null, 401)))
  await page.route('**/api/permissions/user/**', (route) => route.fulfill(json([])))
  await page.route('**/api/tags**', (route) => route.fulfill(json([])))
}

async function bootstrap(page: Page, theme: string) {
  await page.addInitScript((value) => {
    window.localStorage.setItem('eventnest.theme', value)
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
    test(`not-found empty state · ${viewport.name} · ${theme}`, async ({ page }) => {
      await bootstrap(page, theme)
      await stubApi(page)
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto('/definitely-not-a-page')
      await page.waitForSelector('.empty[role="status"]')

      await expect(page.locator('.template')).toHaveClass(/template--spread/)
      await expect(page.locator('.page-doc')).toHaveCount(0)
      await expect(page.locator('.empty')).toHaveCount(1)

      await expect(page.locator('h1.empty__title')).toHaveCount(1)
      await expect(page.locator('.empty__title')).toHaveText('This stall has packed up.')
      await expect(page.locator('.empty__body')).toHaveText(
        "We couldn't find that page. It may have been removed, or the link may be off by a sticker.",
      )

      const mascot = page.locator('.empty__mascot')
      await expect(mascot).toHaveCSS('width', '120px')
      await expect(mascot).toHaveCSS('height', '120px')

      const back = page.locator('.empty .cluster .btn', { hasText: 'Back to events' })
      await expect(back).toHaveClass(/btn--primary/)
      await expect(back).toHaveAttribute('href', '/events')

      await expect(
        page.locator('.empty .cluster .btn', { hasText: 'Visit the styleguide' }),
      ).toHaveCount(0)

      await expect(page).toHaveTitle('Not found · EventNest')
    })
  }
}

test('the empty-state CTA navigates back to events', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubApi(page)
  await page.goto('/definitely-not-a-page')
  await page.locator('.empty .cluster .btn', { hasText: 'Back to events' }).click()
  await expect(page).toHaveURL(/\/events$/)
})
