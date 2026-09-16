import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

const ADMIN_ID = '33333333-3333-4333-8333-333333333333'
const MOD_ID = '44444444-4444-4444-8444-444444444444'

const admin = {
  id: ADMIN_ID,
  email: 'admin@eventnest.io',
  displayName: 'Ava Sinclair',
  roleName: 'Admin',
  isActive: true,
}

const moderator = {
  id: MOD_ID,
  email: 'moderator@eventnest.io',
  displayName: 'Mo Derator',
  roleName: 'Moderator',
  isActive: true,
}

const adminPermissions = [
  { name: 'Users.View' },
  { name: 'Users.Manage' },
  { name: 'Tags.View' },
  { name: 'Events.View' },
]

const moderatorPermissions = [
  { name: 'Tags.View' },
  { name: 'Tags.Create' },
  { name: 'Users.View' },
  { name: 'Events.View' },
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
      message: status < 400 ? null : 'Request failed.',
      result,
      errors,
    }),
  }
}

const roles = [
  {
    id: 'r1',
    name: 'User',
    displayName: 'User',
    description: null,
    sortOrder: 0,
    userCount: 3,
    permissionNames: ['Events.View', 'Tags.View'],
  },
  {
    id: 'r2',
    name: 'Admin',
    displayName: 'Admin',
    description: 'Full access',
    sortOrder: 3,
    userCount: 1,
    permissionNames: ['Events.View', 'Users.View', 'Users.Manage'],
  },
]

async function stub(
  page: Page,
  user: typeof admin | typeof moderator,
  permissions: unknown[],
  withRoles = false,
) {
  await page.route('**/api/users**', (route) => {
    if (route.request().method() === 'GET' && route.request().url().endsWith('/api/users')) {
      return route.fulfill(envelope([]))
    }
    return route.fallback()
  })
  await page.route('**/api/permissions/user/**', (route) => route.fulfill(envelope(permissions)))
  await page.route('**/api/users/me', (route) => route.fulfill(envelope(user)))
  if (withRoles) {
    await page.route('**/api/roles**', (route) => route.fulfill(envelope(roles)))
  }
}

async function bootstrap(page: Page, userId: string) {
  await page.addInitScript((value) => {
    window.localStorage.setItem('eventnest.theme', 'light')
    window.localStorage.setItem('eventnest.auth.accessToken', 'test.token')
    window.localStorage.setItem('eventnest.auth.refreshToken', 'test.refresh')
    window.localStorage.setItem('eventnest.auth.userId', value)
  }, userId)
}

test('admin sees the System group with Users, Roles and Tags', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await bootstrap(page, ADMIN_ID)
  await stub(page, admin, adminPermissions, true)
  await page.goto('/events')

  const group = page.locator('.album-rail .index-group')
  await expect(group).toBeVisible()
  const toggle = group.locator('.index-tab--group')
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')

  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  const children = group.locator('.index-group__list')
  await expect(children.getByText('Users', { exact: true })).toBeVisible()
  await expect(children.getByText('Roles', { exact: true })).toBeVisible()
  await expect(children.getByText('Tags', { exact: true })).toBeVisible()
})

test('system group auto-expands on admin routes', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await bootstrap(page, ADMIN_ID)
  await stub(page, admin, adminPermissions, true)
  await page.goto('/admin/roles')

  const group = page.locator('.album-rail .index-group')
  await expect(group.locator('.index-tab--group')).toHaveAttribute('aria-expanded', 'true')
  await expect(group.locator('.index-tab--child[aria-current="page"]')).toContainText('Roles')
})

test('moderator sees Tags only', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await bootstrap(page, MOD_ID)
  await stub(page, moderator, moderatorPermissions)
  await page.goto('/events')

  const group = page.locator('.album-rail .index-group')
  await expect(group).toBeVisible()
  await group.locator('.index-tab--group').click()
  const children = group.locator('.index-group__list')
  await expect(children.getByText('Tags', { exact: true })).toBeVisible()
  await expect(children.getByText('Users', { exact: true })).toHaveCount(0)
  await expect(children.getByText('Roles', { exact: true })).toHaveCount(0)
})

test('moderator is denied the users admin page', async ({ page }) => {
  await bootstrap(page, MOD_ID)
  await stub(page, moderator, moderatorPermissions)
  await page.goto('/admin/users')

  await expect(page.getByText("You can't peek behind this counter.")).toBeVisible()
})

test('moderator is denied the roles page', async ({ page }) => {
  await bootstrap(page, MOD_ID)
  await stub(page, moderator, moderatorPermissions, true)
  await page.goto('/admin/roles')

  await expect(page.getByText("You can't peek behind this counter.")).toBeVisible()
})

test('anonymous visitors see no System group', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.route('**/api/events**', (route) => route.fulfill(envelope({ items: [], total: 0, page: 1, size: 10, pages: 0 })))
  await page.goto('/events')

  await expect(page.locator('.album-rail .index-group')).toHaveCount(0)
})

test('anonymous deep link to roles redirects to login', async ({ page }) => {
  await page.goto('/admin/roles')
  await expect(page).toHaveURL(/\/login\?returnUrl=/)
})

test('tabbar System entry navigates to an admin page', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await bootstrap(page, ADMIN_ID)
  await stub(page, admin, adminPermissions, true)
  await page.goto('/events')

  await page.locator('.tabbar').getByText('System', { exact: true }).click()
  await expect(page).toHaveURL(/\/admin\/users/)
})

test('styleguide entry stays wired to the feature flag', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await bootstrap(page, ADMIN_ID)
  await stub(page, admin, adminPermissions, true)
  await page.goto('/events')

  const rail = page.locator('.album-rail')
  const styleguide = rail.locator('.index-tab', { hasText: 'Styleguide' })
  const enabled = process.env.VITE_ENABLE_STYLEGUIDE !== 'false'
  if (enabled) {
    await expect(styleguide).toHaveCount(1)
  } else {
    await expect(styleguide).toHaveCount(0)
  }
})

