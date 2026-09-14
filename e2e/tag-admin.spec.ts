import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

const ADMIN_ID = '33333333-3333-4333-8333-333333333333'

const admin = {
  id: ADMIN_ID,
  email: 'admin@eventnest.io',
  displayName: 'Ava Sinclair',
  role: 'Admin',
  isActive: true,
}

const allPermissions = [
  { name: 'Tags.View' },
  { name: 'Tags.Create' },
  { name: 'Tags.Edit' },
  { name: 'Tags.Delete' },
]

const tags = [
  { id: 't1', name: 'Technology', color: '#3b82f6', createdAt: '2026-01-12T09:00:00Z' },
  { id: 't2', name: 'Music', color: '#ef4444', createdAt: '2026-01-12T09:00:00Z' },
  { id: 't3', name: 'Education', color: '#fde047', createdAt: '2026-01-12T09:00:00Z' },
]

const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'access-control-allow-headers': '*',
}

function envelope(result: unknown, status = 200, errors: Record<string, string[]> | null = null) {
  return {
    status,
    contentType: 'application/json',
    headers: cors,
    body: JSON.stringify({
      code: status,
      success: status < 400,
      message: status < 400 ? null : 'That already exists.',
      result,
      errors,
    }),
  }
}

async function stubApi(
  page: Page,
  list: unknown[],
  opts: { permissions?: unknown[]; onCreate?: boolean } = {},
) {
  await page.route('**/api/users/me', (route) => route.fulfill(envelope(admin)))
  await page.route('**/api/permissions/user/**', (route) =>
    route.fulfill(envelope(opts.permissions ?? allPermissions)),
  )
  await page.route('**/api/tags**', (route) => {
    const method = route.request().method()
    if (method === 'GET') return route.fulfill(envelope(list))
    if (method === 'POST') {
      if (opts.onCreate === false) {
        return route.fulfill(
          envelope(null, 409, { name: ["A tag with the name 'Technology' already exists."] }),
        )
      }
      return route.fulfill(
        envelope(
          { id: 't4', name: 'New', color: '#6366F1', createdAt: '2026-01-12T09:00:00Z' },
          201,
        ),
      )
    }
    return route.fulfill(envelope(null))
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
    test(`tag admin ledger structure · ${viewport.name} · ${theme}`, async ({ page }) => {
      await bootstrap(page, theme)
      await stubApi(page, tags)
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto('/admin/tags')
      await page.waitForSelector('table.table-punch tbody tr')

      await expect(page.locator('.breadcrumbs')).toHaveCount(1)
      await expect(page.locator('.breadcrumbs')).toContainText('Admin')
      await expect(page.locator('.breadcrumbs')).toContainText('Tags')

      await expect(page.locator('.page-doc__overline')).toHaveText('Admin')
      await expect(page.locator('.page-doc__title')).toHaveText('Tags')
      await expect(page.locator('.page-doc__sub')).toHaveText('3 tags')
      await expect(page.locator('.page-doc__actions .btn', { hasText: 'Create tag' })).toHaveCount(
        1,
      )

      await expect(page.locator('table.table-punch')).toHaveCount(1)
      await expect(page.locator('table.table-punch caption.sr-only')).toHaveText('Tags')
      await expect(page.locator('table.table-punch thead th')).toHaveCount(4)
      await expect(page.locator('table.table-punch thead th')).toHaveText([
        'Name',
        'Colour',
        'Created',
        'Actions',
      ])
      await expect(page.locator('table.table-punch tbody tr')).toHaveCount(3)
      await expect(page.locator('tbody .tag-chip')).toHaveCount(3)
      await expect(page.locator('tbody td[data-label="Colour"]').first()).toHaveText('#3B82F6')
      await expect(page.locator('tbody td[data-label="Created"] time').first()).toHaveText(
        'Jan 12, 2026',
      )
      await expect(
        page.locator('tbody td[data-label="Actions"] .btn', { hasText: 'Edit' }),
      ).toHaveCount(3)
      await expect(
        page.locator('tbody td[data-label="Actions"] .btn', { hasText: 'Delete' }),
      ).toHaveCount(3)

      const failures = await page.evaluate(() => {
        const problems: Array<{ selector: string; amount: number }> = []
        for (const selector of ['.table-scroll', '.page-doc']) {
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

test('duplicate tag name reports inline on the name field', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubApi(page, tags, { onCreate: false })
  await page.goto('/admin/tags')
  await page.waitForSelector('table.table-punch tbody tr')

  await page.locator('.page-doc__actions .btn', { hasText: 'Create tag' }).click()
  const modal = page.locator('.modal[role="dialog"]')
  await expect(modal.locator('.modal__title')).toHaveText('Create tag')

  await modal.locator('#tag-name').fill('Technology')
  await modal.locator('.modal__footer .btn', { hasText: 'Save tag' }).click()

  await expect(modal.locator('#tag-name-error')).toHaveText(
    "A tag with the name 'Technology' already exists.",
  )
  await expect(modal).toBeVisible()
})

test('invalid hex blocks the save', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubApi(page, tags)
  await page.goto('/admin/tags')
  await page.waitForSelector('table.table-punch tbody tr')

  let posted = false
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().includes('/api/tags')) posted = true
  })

  await page.locator('.page-doc__actions .btn', { hasText: 'Create tag' }).click()
  const modal = page.locator('.modal[role="dialog"]')
  await modal.locator('#tag-name').fill('Science')
  await modal.locator('#tag-color').fill('nope')
  await modal.locator('.modal__footer .btn', { hasText: 'Save tag' }).click()

  await expect(modal.locator('#tag-color-error')).toHaveText(
    'Enter a valid hex colour, e.g. #6366F1.',
  )
  expect(posted).toBe(false)
})

test('empty tag list shows the daruma empty state', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubApi(page, [])
  await page.goto('/admin/tags')
  await page.waitForSelector('.empty__title')
  await expect(page.locator('.empty__title')).toHaveText('No tags yet.')
  await expect(page.locator('table.table-punch')).toHaveCount(0)
})

test('read-only permission hides create, edit and delete', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubApi(page, tags, { permissions: [{ name: 'Tags.View' }] })
  await page.goto('/admin/tags')
  await page.waitForSelector('table.table-punch tbody tr')

  await expect(page.locator('.page-doc__actions .btn', { hasText: 'Create tag' })).toHaveCount(0)
  await expect(page.locator('tbody .btn', { hasText: 'Edit' })).toHaveCount(0)
  await expect(page.locator('tbody .btn', { hasText: 'Delete' })).toHaveCount(0)
})
