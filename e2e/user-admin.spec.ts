import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

const ADMIN_ID = '33333333-3333-4333-8333-333333333333'

const admin = {
  id: ADMIN_ID,
  email: 'admin@eventnest.io',
  displayName: 'Ava Sinclair',
  roleName: 'Admin',
  isActive: true,
}

const users = [
  {
    id: 'u1',
    email: 'ava@eventnest.dev',
    displayName: 'Ava Sinclair',
    roleName: 'SuperAdmin',
    isActive: true,
  },
  {
    id: 'u2',
    email: 'maya@eventnest.dev',
    displayName: 'Maya Chen',
    roleName: 'Organizer',
    isActive: true,
  },
  {
    id: 'u3',
    email: 'jonas@eventnest.dev',
    displayName: 'Jonas Weber',
    roleName: 'User',
    isActive: false,
  },
]

const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'access-control-allow-headers': '*',
}

async function stubApi(page: Page, list: unknown[], permissions: unknown[]) {
  await page.route('**/api/users/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: cors,
      body: JSON.stringify({
        code: 200,
        success: true,
        message: null,
        result: admin,
        errors: null,
      }),
    }),
  )
  await page.route('**/api/permissions/user/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: cors,
      body: JSON.stringify({
        code: 200,
        success: true,
        message: null,
        result: permissions,
        errors: null,
      }),
    }),
  )
  await page.route('**/api/users?**', (route) => {
    if (route.request().method() !== 'GET')
      return route.fulfill({ status: 200, headers: cors, body: '{}' })
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: cors,
      body: JSON.stringify({ code: 200, success: true, message: null, result: list, errors: null }),
    })
  })
  await page.route('**/api/users', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: cors,
      body: JSON.stringify({ code: 200, success: true, message: null, result: list, errors: null }),
    }),
  )
}

async function bootstrap(page: Page, theme: string) {
  await page.addInitScript((value) => {
    window.localStorage.setItem('eventnest.theme', value)
    window.localStorage.setItem('eventnest.auth.accessToken', 'test.token')
    window.localStorage.setItem('eventnest.auth.refreshToken', 'test.refresh')
    window.localStorage.setItem('eventnest.auth.userId', '33333333-3333-4333-8333-333333333333')
  }, theme)
}

const MANAGE = [{ name: 'Users.View' }, { name: 'Users.Manage' }]

const VIEWPORTS = [
  { name: 'desktop 1280', width: 1280, height: 900 },
  { name: 'tablet 768', width: 768, height: 1024 },
  { name: 'mobile 360', width: 360, height: 800 },
] as const
const THEMES = ['light', 'dark'] as const

for (const viewport of VIEWPORTS) {
  for (const theme of THEMES) {
    test(`user admin ledger structure · ${viewport.name} · ${theme}`, async ({ page }) => {
      await bootstrap(page, theme)
      await stubApi(page, users, MANAGE)
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto('/admin/users')
      await page.waitForSelector('table.table-punch tbody tr')

      await expect(page.locator('.breadcrumbs')).toHaveCount(1)
      await expect(page.locator('.breadcrumbs')).toContainText('Admin')
      await expect(page.locator('.breadcrumbs')).toContainText('Users')

      await expect(page.locator('.page-doc__overline')).toHaveText('Admin')
      await expect(page.locator('.page-doc__title')).toHaveText('Users')
      await expect(page.locator('#user-search')).toHaveCount(1)

      await expect(page.locator('table.table-punch caption.sr-only')).toHaveText('Users')
      await expect(page.locator('table.table-punch thead th')).toHaveText([
        'User',
        'Email',
        'Role',
        'Status',
        'Created',
        'Actions',
      ])
      await expect(page.locator('table.table-punch tbody tr')).toHaveCount(3)
      await expect(page.locator('tbody .nav-avatar')).toHaveCount(3)
      await expect(page.locator('tbody td[data-label="Email"]')).toHaveText([
        'ava@eventnest.dev',
        'maya@eventnest.dev',
        'jonas@eventnest.dev',
      ])
      await expect(page.locator('tbody td[data-label="Role"]')).toHaveText([
        'SuperAdmin',
        'Organizer',
        'User',
      ])
      await expect(page.locator('tbody .badge--published')).toHaveCount(2)
      await expect(page.locator('tbody .badge--cancelled')).toHaveCount(1)
      await expect(page.locator('tbody td[data-label="Created"] .tertiary')).toHaveCount(3)
      await expect(page.locator('tbody .btn', { hasText: 'Permissions' })).toHaveCount(3)
      await expect(page.locator('tbody .btn', { hasText: 'Edit' })).toHaveCount(3)
      await expect(page.locator('tbody .btn', { hasText: 'Deactivate' })).toHaveCount(2)

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

test('search filters the user list', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubApi(page, users, MANAGE)
  await page.goto('/admin/users')
  await page.waitForSelector('table.table-punch tbody tr')

  await page.locator('#user-search').fill('maya')
  await expect(page.locator('table.table-punch tbody tr')).toHaveCount(1)
  await expect(page.locator('tbody td[data-label="Role"]')).toHaveText(['Organizer'])

  await page.locator('#user-search').fill('Organizer')
  await expect(page.locator('table.table-punch tbody tr')).toHaveCount(1)

  await page.locator('#user-search').fill('nobody-here')
  await expect(page.locator('.empty__title')).toHaveText('No users match that search.')
})

test('read-only permission keeps the permissions link only', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubApi(page, users, [{ name: 'Users.View' }])
  await page.goto('/admin/users')
  await page.waitForSelector('table.table-punch tbody tr')

  await expect(page.locator('tbody .btn', { hasText: 'Permissions' })).toHaveCount(3)
  await expect(page.locator('tbody .btn', { hasText: 'Edit' })).toHaveCount(0)
  await expect(page.locator('tbody .btn', { hasText: 'Deactivate' })).toHaveCount(0)
})

test('empty directory shows the empty state', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubApi(page, [], MANAGE)
  await page.goto('/admin/users')
  await page.waitForSelector('.empty__title')
  await expect(page.locator('.empty__title')).toHaveText('No users found.')
  await expect(page.locator('table.table-punch')).toHaveCount(0)
})

