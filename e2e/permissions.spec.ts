import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

const ACTOR_ID = '33333333-3333-4333-8333-333333333333'
const TARGET_ID = '99999999-9999-4999-8999-999999999999'

const actor = {
  id: ACTOR_ID,
  email: 'admin@eventnest.io',
  displayName: 'Ava Sinclair',
  role: 'Admin',
  isActive: true,
}

const target = {
  id: TARGET_ID,
  email: 'sofia@eventnest.dev',
  displayName: 'Sofia Almeida',
  roleName: 'User',
  isActive: true,
}

const GROUPS = ['Events', 'Tags', 'RSVPs', 'Users'] as const
const CATALOG: Record<string, string[]> = {
  Events: ['Events.View', 'Events.Create', 'Events.Edit', 'Events.Delete'],
  Tags: ['Tags.View', 'Tags.Create', 'Tags.Edit', 'Tags.Delete'],
  RSVPs: ['RSVPs.View', 'RSVPs.Create', 'RSVPs.Edit', 'RSVPs.Manage', 'RSVPs.Cancel'],
  Users: ['Users.View', 'Users.Manage'],
}

const granted = [
  'Events.View',
  'Events.Create',
  'Tags.View',
  'RSVPs.View',
  'RSVPs.Create',
  'RSVPs.Edit',
  'RSVPs.Cancel',
]

const catalog = GROUPS.flatMap((group) =>
  CATALOG[group].map((name) => ({
    name,
    displayName: name,
    group,
    isGranted: granted.includes(name),
  })),
)

const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'access-control-allow-headers': '*',
}

function envelope(result: unknown, status = 200) {
  return {
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
  }
}

async function stubApi(page: Page, opts: { permissions?: unknown[] } = {}) {
  await page.route('**/api/users/me', (route) => route.fulfill(envelope(actor)))
  await page.route('**/api/users/*/permissions', (route) => route.fulfill(envelope([])))
  await page.route('**/api/permissions/user/**', (route) => route.fulfill(envelope(catalog)))
  await page.route('**/api/permissions/grant', (route) => route.fulfill(envelope({}, 201)))
  await page.route('**/api/permissions/revoke', (route) => route.fulfill(envelope(null)))
  await page.route('**/api/permissions', (route) => route.fulfill(envelope(catalog)))
  await page.route('**/api/users/**', (route) => route.fulfill(envelope(target)))
  void opts
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
    test(`permissions ledger structure · ${viewport.name} · ${theme}`, async ({ page }) => {
      await bootstrap(page, theme)
      await stubApi(page)
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto(`/admin/users/${TARGET_ID}/permissions`)
      await page.waitForSelector('.ledger-group .perm-row')

      await expect(page.locator('.breadcrumbs')).toContainText('Admin')
      await expect(page.locator('.breadcrumbs')).toContainText('Users')
      await expect(page.locator('.breadcrumbs')).toContainText('Sofia Almeida')
      await expect(page.locator('.breadcrumbs')).toContainText('Permissions')

      await expect(page.locator('.page-doc__overline')).toHaveText('Admin · 手帳')
      await expect(page.locator('.page-doc__title')).toHaveText('Permissions')
      await expect(page.locator('.page-doc__sub')).toHaveText(
        'Sofia Almeida · sofia@eventnest.dev · Role: User',
      )

      await expect(page.locator('.stats-wrap .stat-row .stat')).toHaveCount(3)
      await expect(page.locator('.stat--capacity .stat__label')).toHaveText('Effective')
      await expect(page.locator('.stat--capacity .stat__value')).toHaveText('7')
      await expect(page.locator('.stat--guests .stat__label')).toHaveText('Direct grants')
      await expect(page.locator('.stat--guests .stat__value')).toHaveText('1')
      await expect(page.locator('.stat--cancelled .stat__label')).toHaveText('Direct denies')
      await expect(page.locator('.stat__value.tnum')).toHaveCount(3)

      const note = page.locator('.cache-note.ledger-note')
      await expect(note).toHaveCount(1)
      await expect(note).toHaveAttribute('role', 'note')
      await expect(note).toHaveText('Changes may take up to 5 minutes to apply (permission cache).')

      await expect(page.locator('.group-tabs .btn')).toHaveCount(4)
      await expect(page.locator('.group-tabs .btn')).toHaveText([
        'Events',
        'Tags',
        'RSVPs',
        'Users',
      ])
      await expect(page.locator('.group-tabs .btn').first()).toHaveAttribute('href', '#perm-events')

      await expect(page.locator('.ledger-group')).toHaveCount(4)
      await expect(page.locator('.ledger-group').first()).toHaveAttribute('id', 'perm-events')
      await expect(page.locator('.ledger-group').first()).toHaveAttribute(
        'aria-label',
        'Events permissions',
      )
      await expect(page.locator('.ledger-group__head')).toHaveCount(4)
      await expect(page.locator('.ledger-group__head').first().locator('span').first()).toHaveText(
        'Events (4)',
      )
      await expect(page.locator('.ledger-group__head .mock-badge')).toHaveCount(4)
      await expect(page.locator('.perm-group')).toHaveCount(4)

      const rows = page.locator('.perm-row')
      await expect(rows).toHaveCount(15)
      const children = await rows.evaluateAll((nodes) => nodes.map((node) => node.children.length))
      expect(children).toEqual(Array(15).fill(2))
      await expect(page.locator('.perm-name').first()).toHaveText('Events.View')
      await expect(page.locator('.perm-state--on')).toHaveCount(7)
      await expect(page.locator('.perm-state--off')).toHaveCount(8)
      await expect(page.locator('.perm-source--grant')).toHaveCount(1)
      await expect(page.locator('.perm-action .btn', { hasText: 'Revoke' })).toHaveCount(1)
      await expect(page.locator('.perm-action .btn', { hasText: 'Grant' })).toHaveCount(8)
      await expect(page.locator('.perm-action .perm-expiry')).toHaveCount(6)

      const failures = await page.evaluate(() => {
        const problems: Array<{ selector: string; amount: number }> = []
        for (const selector of ['.ledger', '.page-doc']) {
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

test('revoke opens the inline confirm and posts on confirm', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubApi(page)
  const posts: string[] = []
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().includes('/api/permissions/')) {
      posts.push(`${new URL(request.url()).pathname} ${request.postData() ?? ''}`)
    }
  })

  await page.goto(`/admin/users/${TARGET_ID}/permissions`)
  await page.waitForSelector('.ledger-group .perm-row')

  const createRow = page.locator('.perm-row', { hasText: 'Events.Create' })
  await createRow.locator('.perm-action .btn', { hasText: 'Revoke' }).click()

  const confirm = createRow.locator('.perm-confirm')
  await expect(confirm).toBeVisible()
  await expect(confirm.locator('.perm-confirm__msg')).toHaveText('Revoke Events.Create from Sofia?')
  await expect(confirm.locator('.btn', { hasText: 'Keep' })).toHaveCount(1)

  await confirm.locator('.btn', { hasText: 'Revoke' }).click()
  await expect(confirm).toHaveCount(0)
  expect(posts.some((entry) => entry.includes('/api/permissions/revoke'))).toBe(true)
})

test('grant opens the inline confirm with an expiry field', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubApi(page)
  const posts: string[] = []
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().includes('/api/permissions/')) {
      posts.push(`${new URL(request.url()).pathname} ${request.postData() ?? ''}`)
    }
  })

  await page.goto(`/admin/users/${TARGET_ID}/permissions`)
  await page.waitForSelector('.ledger-group .perm-row')

  const editRow = page.locator('.perm-row', { hasText: 'Events.Edit' })
  await editRow.locator('.perm-action .btn', { hasText: 'Grant' }).click()

  const confirm = editRow.locator('.perm-confirm')
  await expect(confirm).toBeVisible()
  await expect(confirm.locator('input[type="date"]')).toHaveCount(1)
  await confirm.locator('input[type="date"]').fill('2026-12-31')
  await confirm.locator('.btn', { hasText: 'Grant' }).click()

  await expect(confirm).toHaveCount(0)
  expect(
    posts.some((entry) => entry.includes('/api/permissions/grant') && entry.includes('2026-12-31')),
  ).toBe(true)
})
