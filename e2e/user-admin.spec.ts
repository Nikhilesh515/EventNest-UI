import { test, expect } from '@playwright/test'
import type { Page, Request as PlaywrightRequest } from '@playwright/test'

const ADMIN_ID = '33333333-3333-4333-8333-333333333333'

const admin = {
  id: ADMIN_ID,
  email: 'admin@eventnest.io',
  displayName: 'Ava Sinclair',
  roleName: 'Admin',
  roleId: 'r-admin',
  isActive: true,
}

const roles = [
  {
    id: 'r-user',
    name: 'User',
    displayName: 'User',
    description: null,
    sortOrder: 0,
    userCount: 1,
    permissionNames: ['Events.View'],
  },
  {
    id: 'r-org',
    name: 'Organizer',
    displayName: 'Organizer',
    description: null,
    sortOrder: 1,
    userCount: 1,
    permissionNames: ['Events.View', 'Events.Create'],
  },
  {
    id: 'r-admin',
    name: 'Admin',
    displayName: 'Admin',
    description: null,
    sortOrder: 3,
    userCount: 1,
    permissionNames: ['Users.View', 'Users.Manage'],
  },
]

interface FixtureUser {
  id: string
  email: string
  displayName: string
  roleName: string
  roleId: string
  isActive: boolean
}

const baseUsers: FixtureUser[] = [
  {
    id: 'u1',
    email: 'ava@eventnest.dev',
    displayName: 'Ava Sinclair',
    roleName: 'SuperAdmin',
    roleId: 'r-admin',
    isActive: true,
  },
  {
    id: 'u2',
    email: 'maya@eventnest.dev',
    displayName: 'Maya Chen',
    roleName: 'Organizer',
    roleId: 'r-org',
    isActive: true,
  },
  {
    id: 'u3',
    email: 'jonas@eventnest.dev',
    displayName: 'Jonas Weber',
    roleName: 'User',
    roleId: 'r-user',
    isActive: false,
  },
]

const manyUsers: FixtureUser[] = Array.from({ length: 25 }, (_, index) => ({
  id: `p${index + 1}`,
  email: `person${index + 1}@eventnest.dev`,
  displayName: `Person ${index + 1}`,
  roleName: 'User',
  roleId: 'r-user',
  isActive: true,
}))

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
  list?: FixtureUser[]
  listStatus?: number
  createStatus?: number
  createErrors?: Record<string, string[]> | null
  permissions?: unknown[]
}

const requests: { method: string; url: string; body: unknown }[] = []

function requestBody(request: PlaywrightRequest): Record<string, unknown> | null {
  try {
    return request.postDataJSON() as Record<string, unknown>
  } catch {
    return null
  }
}

function pagedResponse(list: FixtureUser[], url: URL) {
  const page = Number(url.searchParams.get('page') ?? '1')
  const pageSize = Number(url.searchParams.get('pageSize') ?? '20')
  const search = (url.searchParams.get('search') ?? '').toLowerCase()
  const role = url.searchParams.get('role') ?? ''

  let filtered = list
  if (search) {
    filtered = filtered.filter(
      (user) =>
        user.email.toLowerCase().includes(search) || user.displayName.toLowerCase().includes(search),
    )
  }
  if (role) filtered = filtered.filter((user) => user.roleId === role)

  const total = filtered.length
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const items = filtered.slice((page - 1) * pageSize, page * pageSize)
  return { items, total, page, size: pageSize, pages }
}

async function stubApi(page: Page, opts: StubOptions = {}) {
  requests.length = 0
  const list = opts.list ?? baseUsers
  const permissions = opts.permissions ?? [
    { name: 'Users.View' },
    { name: 'Users.Manage' },
  ]

  await page.route('**/api/permissions/user/**', (route) => route.fulfill(envelope(permissions)))
  await page.route('**/api/roles**', (route) => route.fulfill(envelope(roles)))

  await page.route('**/api/users**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const method = request.method()

    if (url.pathname !== '/api/users') return route.fallback()

    if (method === 'GET') {
      requests.push({ method, url: request.url(), body: null })
      if (opts.listStatus && opts.listStatus >= 400) {
        return route.fulfill(envelope(null, opts.listStatus))
      }
      return route.fulfill(envelope(pagedResponse(list, url)))
    }

    if (method === 'POST') {
      const body = requestBody(request)
      requests.push({ method, url: request.url(), body })

      if (opts.createStatus && opts.createStatus >= 400) {
        return route.fulfill(
          envelope(null, opts.createStatus, opts.createErrors ?? null, 'Could not create user.'),
        )
      }
      const role = roles.find((entry) => entry.id === body?.roleId)
      return route.fulfill(
        envelope(
          {
            id: 'u9',
            email: body?.email,
            displayName: body?.displayName,
            roleName: role?.name ?? 'User',
            roleId: body?.roleId,
            isActive: true,
          },
          201,
        ),
      )
    }

    return route.fulfill(envelope(null))
  })

  await page.route('**/api/users/**', (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const method = request.method()

    if (url.pathname.endsWith('/role') && method === 'PUT') {
      const body = requestBody(request)
      requests.push({ method: 'PUT-ROLE', url: request.url(), body })
      const role = roles.find((entry) => entry.id === body?.roleId)
      return route.fulfill(
        envelope({
          id: url.pathname.split('/')[3],
          email: 'member@eventnest.dev',
          displayName: 'Member',
          roleName: role?.name ?? 'User',
          roleId: body?.roleId,
          isActive: true,
        }),
      )
    }

    if (method === 'PUT') {
      const body = requestBody(request)
      requests.push({ method: 'PUT', url: request.url(), body })
      return route.fulfill(
        envelope({
          id: url.pathname.split('/')[3],
          email: 'ava@eventnest.dev',
          displayName: body?.displayName,
          roleName: 'SuperAdmin',
          roleId: 'r-admin',
          isActive: true,
        }),
      )
    }

    if (method === 'DELETE') {
      requests.push({ method: 'DELETE', url: request.url(), body: null })
      return route.fulfill(envelope(null, 204))
    }

    return route.fallback()
  })

  await page.route('**/api/users/me', (route) => route.fulfill(envelope(admin)))
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
    test(`user admin ledger structure · ${viewport.name} · ${theme}`, async ({ page }) => {
      await bootstrap(page, theme)
      await stubApi(page)
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

test('debounced search sends the search param and filters server-side', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubApi(page)
  await page.goto('/admin/users')
  await page.waitForSelector('table.table-punch tbody tr')

  await page.locator('#user-search').fill('maya')
  await page.waitForRequest((request) => request.url().includes('search=maya'))
  await expect(page.locator('table.table-punch tbody tr')).toHaveCount(1)
  await expect(page.locator('tbody td[data-label="Role"]')).toHaveText(['Organizer'])

  await page.locator('#user-search').fill('nobody-here')
  await expect(page.locator('.empty__title')).toHaveText('No users match that search.')
})

test('search resets the page to 1', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubApi(page, { list: manyUsers })
  await page.goto('/admin/users')
  await page.waitForSelector('table.table-punch tbody tr')

  const nextPage = page.waitForRequest((request) => request.url().includes('page=2'))
  await page.getByRole('button', { name: 'Next page' }).click()
  await nextPage
  await expect(page.locator('tbody tr')).toHaveCount(5)

  const searchReset = page.waitForRequest(
    (request) => request.url().includes('search=person1') && request.url().includes('page=1'),
  )
  await page.locator('#user-search').fill('person1')
  await searchReset
})

test('role filter sends the role id', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubApi(page)
  await page.goto('/admin/users')
  await page.waitForSelector('table.table-punch tbody tr')

  const filterRequest = page.waitForRequest((request) => request.url().includes('role=r-org'))
  await page.getByLabel('Filter by role').selectOption('r-org')
  await filterRequest
  await expect(page.locator('table.table-punch tbody tr')).toHaveCount(1)
  await expect(page.locator('tbody td[data-label="Role"]')).toHaveText(['Organizer'])

  const combined = page.waitForRequest(
    (request) => request.url().includes('role=r-org') && request.url().includes('search=maya'),
  )
  await page.locator('#user-search').fill('maya')
  await combined

  await page.locator('#user-search').fill('')
  await page.getByLabel('Filter by role').selectOption('')
  await expect(page.locator('table.table-punch tbody tr')).toHaveCount(3)
})

test('page-size change requests the new size from page 1', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubApi(page, { list: manyUsers })
  await page.goto('/admin/users')
  await page.waitForSelector('table.table-punch tbody tr')

  await expect(page.locator('tbody tr')).toHaveCount(20)
  await page.getByRole('button', { name: 'Next page' }).click()
  await expect(page.locator('tbody tr')).toHaveCount(5)

  const sizeChange = page.waitForRequest(
    (request) => request.url().includes('pageSize=10') && request.url().includes('page=1'),
  )
  await page.getByLabel('Rows per page').selectOption('10')
  await sizeChange
  await expect(page.locator('tbody tr')).toHaveCount(10)
})

test('list failure renders the error state', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubApi(page, { listStatus: 500 })
  await page.goto('/admin/users')

  await expect(page.locator('.error-state')).toBeVisible({ timeout: 20000 })
})

test('pagination requests the next page and renders its slice', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubApi(page, { list: manyUsers })
  await page.goto('/admin/users')
  await page.waitForSelector('table.table-punch tbody tr')

  await expect(page.locator('.pager-meta')).toContainText('25 results')
  await expect(page.locator('tbody tr')).toHaveCount(20)

  const secondPage = page.waitForRequest((request) => request.url().includes('page=2'))
  await page.getByRole('button', { name: 'Next page' }).click()
  await secondPage
  await expect(page.locator('tbody tr')).toHaveCount(5)
  await expect(page.locator('tbody td[data-label="Email"]').first()).toHaveText(
    'person21@eventnest.dev',
  )
})

test('create user posts the payload and shows a toast', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubApi(page)
  await page.goto('/admin/users')
  await page.waitForSelector('table.table-punch tbody tr')

  await page.getByRole('button', { name: 'Create user' }).click()
  await page.locator('#create-email').fill('new@eventnest.dev')
  await page.locator('#create-displayName').fill('New Person')
  await page.locator('#create-password').fill('Secret@123')
  await page.locator('#create-role').selectOption('r-org')
  await page.getByRole('button', { name: 'Save user' }).click()

  await expect(page.locator('.toast--success .toast__title')).toHaveText('User created')
  const post = requests.find((entry) => entry.method === 'POST')
  expect(post?.body).toMatchObject({
    email: 'new@eventnest.dev',
    displayName: 'New Person',
    password: 'Secret@123',
    roleId: 'r-org',
  })
})

test('create user surfaces API field errors', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubApi(page, {
    createStatus: 409,
    createErrors: { email: ["User with email 'new@eventnest.dev' is already registered."] },
  })
  await page.goto('/admin/users')
  await page.waitForSelector('table.table-punch tbody tr')

  await page.getByRole('button', { name: 'Create user' }).click()
  await page.locator('#create-email').fill('new@eventnest.dev')
  await page.locator('#create-displayName').fill('New Person')
  await page.locator('#create-password').fill('Secret@123')
  await page.locator('#create-role').selectOption('r-user')
  await page.getByRole('button', { name: 'Save user' }).click()

  await expect(page.locator('.error-summary')).toContainText('already registered')
})

test('edit user assigns a role', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubApi(page)
  await page.goto('/admin/users')
  await page.waitForSelector('table.table-punch tbody tr')

  await page
    .locator('table.table-punch tbody tr', { hasText: 'Maya Chen' })
    .getByRole('button', { name: 'Edit' })
    .click()
  await page.locator('#admin-user-role').selectOption('r-admin')
  await page.getByRole('button', { name: 'Save' }).click()

  await expect(page.locator('.toast--success .toast__title')).toHaveText('User updated')
  const assign = requests.find((entry) => entry.method === 'PUT-ROLE')
  expect(assign?.url).toContain('/api/users/u2/role')
  expect(assign?.body).toMatchObject({ roleId: 'r-admin' })
  expect(requests.find((entry) => entry.method === 'PUT')).toBeUndefined()
})

test('rename-only edit does not call the role endpoint', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubApi(page)
  await page.goto('/admin/users')
  await page.waitForSelector('table.table-punch tbody tr')

  await page
    .locator('table.table-punch tbody tr', { hasText: 'Ava Sinclair' })
    .first()
    .getByRole('button', { name: 'Edit' })
    .click()
  await page.locator('#admin-user-name').fill('Ava S.')
  await page.getByRole('button', { name: 'Save' }).click()

  await expect(page.locator('.toast--success .toast__title')).toHaveText('User updated')
  const rename = requests.find((entry) => entry.method === 'PUT')
  expect(rename?.url).toContain('/api/users/u1')
  expect(requests.find((entry) => entry.method === 'PUT-ROLE')).toBeUndefined()
})

test('deactivate confirms and deletes', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubApi(page)
  await page.goto('/admin/users')
  await page.waitForSelector('table.table-punch tbody tr')

  await page
    .locator('table.table-punch tbody tr', { hasText: 'Maya Chen' })
    .getByRole('button', { name: 'Deactivate' })
    .click()
  await page.getByRole('button', { name: 'Deactivate' }).last().click()

  const del = requests.find((entry) => entry.method === 'DELETE')
  expect(del?.url).toContain('/api/users/u2')
})

test('read-only permission keeps the permissions link only', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubApi(page, { permissions: [{ name: 'Users.View' }] })
  await page.goto('/admin/users')
  await page.waitForSelector('table.table-punch tbody tr')

  await expect(page.locator('tbody .btn', { hasText: 'Permissions' })).toHaveCount(3)
  await expect(page.locator('tbody .btn', { hasText: 'Edit' })).toHaveCount(0)
  await expect(page.locator('tbody .btn', { hasText: 'Deactivate' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Create user' })).toHaveCount(0)
})

test('empty directory shows the empty state', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubApi(page, { list: [] })
  await page.goto('/admin/users')
  await page.waitForSelector('.empty__title')
  await expect(page.locator('.empty__title')).toHaveText('No users found.')
  await expect(page.locator('table.table-punch')).toHaveCount(0)
})
