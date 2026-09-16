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

const TAGS = [
  { id: 't1', name: 'Technology', color: '#3b82f6', createdAt: '2026-01-12T09:00:00Z' },
  { id: 't2', name: 'Music', color: '#ef4444', createdAt: '2026-01-12T09:00:00Z' },
  { id: 't3', name: 'Education', color: '#fde047', createdAt: '2026-01-12T09:00:00Z' },
]

const SECTION_IDS = [
  'sg-layout',
  'sg-colors',
  'sg-type',
  'sg-space',
  'sg-icons',
  'sg-mascots',
  'sg-patterns',
  'sg-components',
  'sg-status',
  'sg-tags',
  'sg-motion',
]

async function stubApi(page: Page) {
  await page.route('**/api/users/me', (route) => route.fulfill(json(null, 401)))
  await page.route('**/api/permissions/user/**', (route) => route.fulfill(json([])))
  await page.route('**/api/tags**', (route) => route.fulfill(json(TAGS)))
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
    test(`styleguide sections · ${viewport.name} · ${theme}`, async ({ page }) => {
      await bootstrap(page, theme)
      await stubApi(page)
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto('/styleguide')
      await page.waitForSelector('#sg-layout .compare-table')

      await expect(page.locator('.page-doc__overline')).toHaveText('Living reference · 手帳 祭')
      await expect(page.locator('.page-doc__title')).toHaveText('Styleguide')
      await expect(page.locator('.page-doc__sub')).toHaveText(
        'Every token, every component, every state. This page is the acceptance surface for the build.',
      )

      await expect(page.locator('.sg-nav .btn')).toHaveCount(11)
      await expect(page.locator('.sg-nav .btn').first()).toHaveAttribute('href', '#sg-layout')

      for (const id of SECTION_IDS) {
        await expect(page.locator(`#${id}`), id).toHaveCount(1)
      }
      await expect(page.locator('.sg-section')).toHaveCount(11)
      await expect(page.locator('.sg-section__title')).toHaveCount(11)

      await expect(page.locator('.compare-table .compare-row')).toHaveCount(19)
      await expect(page.locator('.swatch-grid')).toHaveCount(10)
      await expect(page.locator('.swatch')).toHaveCount(91)
      await expect(page.locator('.type-sample')).toHaveCount(17)
      await expect(page.locator('.icon-grid .icon-cell')).toHaveCount(26)
      await expect(page.locator('.mascot-row .mascot-cell')).toHaveCount(4)
      await expect(page.locator('.size-pair')).toHaveCount(4)
      await expect(page.locator('.pattern-demo .pattern-swatch')).toHaveCount(6)
      await expect(page.locator('.seg__btn')).toHaveCount(3)
      await expect(page.locator('.table-punch tbody tr')).toHaveCount(3)
      await expect(page.locator('.capacity')).toHaveCount(3)
      await expect(page.locator('.pager')).toHaveCount(1)
      await expect(page.locator('.norm-grid .norm-cell')).toHaveCount(3)
      await expect(page.locator('.motion-grid .motion-cell')).toHaveCount(4)
      await expect(page.locator('.check')).toHaveCount(4)

      const failures = await page.evaluate(() => {
        const problems: Array<{ selector: string; amount: number }> = []
        for (const selector of ['.sg-section']) {
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

test('tag normalizer reacts to presets and to invalid input', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubApi(page)
  await page.goto('/styleguide')
  await page.waitForSelector('#sg-tags .norm-grid')

  await page.locator('.contrast-readout', { hasText: 'fill' }).first().waitFor()
  const firstReadout = await page
    .locator('.contrast-readout', { hasText: 'fill' })
    .first()
    .textContent()
  expect(firstReadout).toContain('#')

  await page
    .locator('[data-norm-preset], .tag-chip--interactive', { hasText: '#000000' })
    .first()
    .click()
  await expect(page.locator('#sg-hex')).toHaveValue('#000000')
  await expect(page.locator('.contrast-readout', { hasText: 'Fill vs ground' })).toContainText(
    'Fill vs ground',
  )

  await page.locator('#sg-hex').fill('#invalid')
  await expect(
    page.locator('#sg-tags .norm-cell__label', { hasText: 'Not a hex color' }),
  ).toHaveCount(1)
})

test('compare toggle flips aria-pressed', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubApi(page)
  await page.goto('/styleguide')
  await page.waitForSelector('#sg-layout .compare-table')

  const toggle = page.locator('#sg-layout .btn', { hasText: 'Toggle embedded demo' })
  await expect(toggle).toHaveAttribute('aria-pressed', 'false')
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-pressed', 'true')
})

test('theme and idle toggles flip their state', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubApi(page)
  await page.goto('/styleguide')
  await page.waitForSelector('.sg-nav')

  const themeToggle = page.locator('[data-theme-toggle]')
  await expect(themeToggle).toHaveAttribute('aria-pressed', 'false')
  await themeToggle.click()
  await expect(themeToggle).toHaveAttribute('aria-pressed', 'true')

  const idle = page.locator('#sg-mascots .check input')
  await idle.uncheck()
  await expect(
    page.locator('#sg-mascots').locator('xpath=ancestor::*[contains(@class,"sg-static")]'),
  ).toHaveCount(1)
})

test('motion replay re-triggers the sticker press', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubApi(page)
  await page.goto('/styleguide')
  await page.waitForSelector('#sg-motion .motion-grid')

  await page.locator('#sg-motion .btn', { hasText: 'Replay sticker press' }).click()
  await expect(page.locator('#sg-motion .rsvp-sticker--going')).toHaveClass(/is-pressing/)
})

