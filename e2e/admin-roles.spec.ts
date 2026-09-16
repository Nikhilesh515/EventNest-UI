import { test, expect } from '@playwright/test'
import type { Page, Route } from '@playwright/test'

const ADMIN_ID = '33333333-3333-4333-8333-333333333333'

const admin = {
  id: ADMIN_ID,
  email: 'admin@eventnest.io',
  displayName: 'Ava Sinclair',
  roleName: 'Admin',
  isActive: true,
}

const adminPermissions = [
  { name: 'Users.View' },
  { name: 'Users.Manage' },
  { name: 'Tags.View' },
  { name: 'Events.View' },
]

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
  {
    id: 'r3',
    name: 'TagManager',
    displayName: 'Tag Manager',
    description: 'manages tags',
    sortOrder: 50,
    userCount: 2,
    permissionNames: ['Tags.View', 'Tags.Create'],
  },
]

const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'access-control-allow-headers': '*',
}

function envelope(
  result: unknown,
  status = 200,
  errors: Record<string, string[]> | null = null,
  message?: string,
) {
  return {
    status,
    contentType: 'application/json',
    headers: cors,
    body: JSON.stringify({
      code: status,
      success: status < 400,
      message: status < 400 ? null : (message ?? 'Request failed.'),
      result,
      errors,
    }),
  }
}

interface StubOptions {
  list?: unknown
  listStatus?: number
  createStatus?: number
  createErrors?: Record<string, string[]> | null
  deleteStatus?: number
  deleteMessage?: string
}

const requests: { method: string; url: string; body: unknown }[] = []

async function stubApi(page: Page, opts: StubOptions = {}) {
  requests.length = 0

  await page.route('**/api/users/me', (route) => route.fulfill(envelope(admin)))
  await page.route('**/api/permissions/user/**', (route) => route.fulfill(envelope(adminPermissions)))
  await page.route('**/api/roles**', (route: Route) => {
    const request = route.request()
    const method = request.method()
    let body: unknown = null
    if (method === 'POST' || method === 'PUT') {
      try {
        body = request.postDataJSON()
      } catch {
        body = null
      }
    }
    requests.push({ method, url: request.url(), body })

    if (method === 'GET') {
      if (opts.listStatus && opts.listStatus >= 400) return route.fulfill(envelope(null, opts.listStatus))
      return route.fulfill(envelope(opts.list ?? roles))
    }
    if (method === 'POST') {
      if (opts.createStatus && opts.createStatus >= 400) {
        return route.fulfill(envelope(null, opts.createStatus, opts.createErrors ?? null))
      }
      return route.fulfill(envelope({ ...(body as object), id: 'r9', userCount: 0 }, 201))
    }
    if (method === 'PUT') {
      return route.fulfill(envelope({ ...(body as object), id: 'r3', userCount: 2 }, 200))
    }
    if (method === 'DELETE') {
      if (opts.deleteStatus && opts.deleteStatus >= 400) {
        return route.fulfill(
          envelope(
            null,
            opts.deleteStatus,
            null,
            opts.deleteMessage ?? 'Role cannot be deleted.',
          ),
        )
      }
      return route.fulfill(envelope(null))
    }
    return route.fulfill(envelope(null))
  })
}

async function bootstrap(page: Page) {
  await page.addInitScript((value) => {
    window.localStorage.setItem('eventnest.theme', 'light')
    window.localStorage.setItem('eventnest.auth.accessToken', 'test.token')
    window.localStorage.setItem('eventnest.auth.refreshToken', 'test.refresh')
    window.localStorage.setItem('eventnest.auth.userId', value)
  }, ADMIN_ID)
}

test('roles list shows counts and hides delete for built-in roles', async ({ page }) => {
  await bootstrap(page)
  await stubApi(page)
  await page.goto('/admin/roles')
  await page.waitForSelector('table.table-punch tbody tr')

  const rows = page.locator('table.table-punch tbody tr')
  await expect(rows).toHaveCount(3)
  await expect(page.locator('.page-doc__title')).toHaveText('Roles')
  await expect(page.locator('.page-doc__sub')).toHaveText('3 roles')

  const tagManager = rows.filter({ hasText: 'TagManager' })
  await expect(tagManager.locator('td[data-label="Permissions"]')).toHaveText('2')
  await expect(tagManager.locator('td[data-label="Users"]')).toHaveText('2')
  await expect(tagManager.getByRole('button', { name: 'Delete' })).toHaveCount(1)

  const builtIn = rows.filter({ hasText: 'Admin' })
  await expect(builtIn.getByRole('button', { name: 'Delete' })).toHaveCount(0)
})

test('create role submits the payload and shows a toast', async ({ page }) => {
  await bootstrap(page)
  await stubApi(page)
  await page.goto('/admin/roles')
  await page.waitForSelector('table.table-punch tbody tr')

  await page.getByRole('button', { name: 'Create role' }).click()
  await page.locator('#role-name').fill('TagManager2')
  await page.locator('#role-displayName').fill('Tag Manager Two')
  await page.getByRole('switch', { name: 'Events.Edit excluded' }).click()
  await page.getByRole('button', { name: 'Save role' }).click()

  await expect(page.locator('.toast--success .toast__title')).toHaveText('Role created')
  const post = requests.find((entry) => entry.method === 'POST')
  expect(post).toBeTruthy()
  expect(post?.body).toMatchObject({
    name: 'TagManager2',
    displayName: 'Tag Manager Two',
    permissionNames: ['Events.Edit'],
  })
})

test('create role surfaces field errors from the API', async ({ page }) => {
  await bootstrap(page)
  await stubApi(page, {
    createStatus: 409,
    createErrors: { name: ["Role with name 'TagManager2' already exists."] },
  })
  await page.goto('/admin/roles')
  await page.waitForSelector('table.table-punch tbody tr')

  await page.getByRole('button', { name: 'Create role' }).click()
  await page.locator('#role-name').fill('TagManager2')
  await page.locator('#role-displayName').fill('Dup')
  await page.getByRole('button', { name: 'Save role' }).click()

  await expect(page.locator('.error-summary')).toContainText('already exists')
})

test('edit role keeps the name read-only and submits PUT', async ({ page }) => {
  await bootstrap(page)
  await stubApi(page)
  await page.goto('/admin/roles')
  await page.waitForSelector('table.table-punch tbody tr')

  await page
    .locator('table.table-punch tbody tr', { hasText: 'TagManager' })
    .getByRole('button', { name: 'Edit' })
    .click()
  await expect(page.locator('#role-name')).toBeDisabled()
  await page.locator('#role-displayName').fill('Tag Manager v2')
  await page.getByRole('button', { name: 'Save role' }).click()

  await expect(page.locator('.toast--success .toast__title')).toHaveText('Role updated')
  const put = requests.find((entry) => entry.method === 'PUT')
  expect(put).toBeTruthy()
  expect(put?.url).toContain('/api/roles/r3')
  expect(put?.body).toMatchObject({ displayName: 'Tag Manager v2' })
})

test('delete custom role confirms and calls the API', async ({ page }) => {
  await bootstrap(page)
  await stubApi(page)
  await page.goto('/admin/roles')
  await page.waitForSelector('table.table-punch tbody tr')

  await page
    .locator('table.table-punch tbody tr', { hasText: 'TagManager' })
    .getByRole('button', { name: 'Delete' })
    .click()
  await page.getByRole('button', { name: 'Delete role' }).click()

  await expect(page.locator('.toast--success .toast__title')).toHaveText('Role deleted')
  const del = requests.find((entry) => entry.method === 'DELETE')
  expect(del?.url).toContain('/api/roles/r3')
})

test('delete conflict surfaces the API message', async ({ page }) => {
  await bootstrap(page)
  await stubApi(page, {
    deleteStatus: 409,
    deleteMessage: "Role 'TagManager' still has 2 user(s) assigned.",
  })
  await page.goto('/admin/roles')
  await page.waitForSelector('table.table-punch tbody tr')

  await page
    .locator('table.table-punch tbody tr', { hasText: 'TagManager' })
    .getByRole('button', { name: 'Delete' })
    .click()
  await page.getByRole('button', { name: 'Delete role' }).click()

  await expect(page.locator('.toast--error .toast__text')).toContainText('still has 2 user(s)')
})

test('roles list failure renders the error state', async ({ page }) => {
  await bootstrap(page)
  await stubApi(page, { listStatus: 500 })
  await page.goto('/admin/roles')

  await expect(page.locator('.error-state')).toBeVisible({ timeout: 20000 })
})

