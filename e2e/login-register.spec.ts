import { test, expect } from '@playwright/test'
import type { Page, Route } from '@playwright/test'

const USER = {
  id: '33333333-3333-4333-8333-333333333333',
  email: 'ava@eventnest.dev',
  displayName: 'Ava Sinclair',
  roleName: 'SuperAdmin',
  isActive: true,
}

const AUTH_OK = {
  accessToken: 'test.token',
  refreshToken: 'test.refresh',
  expiresIn: 3600,
  user: USER,
}

const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'access-control-allow-headers': '*',
}

function envelope(result: unknown, status = 200, overrides: Record<string, unknown> = {}) {
  return {
    status,
    contentType: 'application/json',
    headers: cors,
    body: JSON.stringify({
      code: status,
      success: status < 400,
      message: status < 400 ? null : 'Hmm, that did not work.',
      result,
      errors: null,
      ...overrides,
    }),
  }
}

async function stubBase(page: Page) {
  await page.route('**/api/users/me', (route) => route.fulfill(envelope(USER)))
  await page.route('**/api/permissions/user/**', (route) => route.fulfill(envelope([])))
  await page.route('**/api/permissions', (route) => route.fulfill(envelope([])))
  await page.route('**/api/events**', (route) =>
    route.fulfill(envelope({ items: [], total: 0, page: 1, size: 12, pages: 1 })),
  )
  await page.route('**/api/tags**', (route) => route.fulfill(envelope([])))
}

async function stubAuth(page: Page, handler: (route: Route) => void) {
  await page.route('**/api/auth/login', handler)
  await page.route('**/api/auth/register', handler)
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
    test(`login cover structure · ${viewport.name} · ${theme}`, async ({ page }) => {
      await bootstrap(page, theme)
      await stubBase(page)
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto('/login')
      await page.waitForSelector('.cover__card #auth-form')

      await expect(page.locator('.cover')).toHaveCount(1)
      await expect(
        page.locator('.cover__art .cover__art-pattern.pattern--chiyogami-hana'),
      ).toHaveCount(1)
      await expect(page.locator('.cover__wordmark')).toHaveText('EventNest')
      await expect(page.locator('.cover__hanko')).toHaveText('祭')
      await expect(page.locator('.cover__caption')).toHaveText('A warm stall is a lucky stall. 招')

      await expect(page.locator('.cover__card-tape.washi--sakura')).toHaveCount(1)
      await expect(page.locator('.cover__card .cover__kanji')).toHaveText('祭')
      await expect(page.locator('.cover__title')).toHaveText('Welcome back.')
      await expect(page.locator('.cover__card > .cover__sub').first()).toHaveText(
        'Pick up where you left off.',
      )
      await expect(page.locator('.cover__mobile-mascot')).toHaveCount(1)

      await expect(page.locator('#a-name')).toHaveCount(0)
      await expect(page.locator('#a-email')).toHaveAttribute('placeholder', 'ava@eventnest.dev')
      await expect(page.locator('#a-password')).toHaveAttribute('type', 'password')
      await expect(page.locator('#a-confirm')).toHaveCount(0)
      await expect(page.locator('.input-wrap__action')).toHaveCount(1)
      await expect(page.locator('.btn--block.btn--primary')).toHaveCount(1)
      await expect(page.locator('.btn--block .btn__label')).toHaveText('Log in')
      await expect(page.locator('.cover__card a', { hasText: 'Sign up' })).toHaveAttribute(
        'href',
        '/register',
      )

      const failures = await page.evaluate(() => {
        const problems: Array<{ selector: string; amount: number }> = []
        for (const selector of ['.cover__card', '.cover']) {
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

test('register cover structure', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubBase(page)
  await page.setViewportSize({ width: 1280, height: 1000 })
  await page.goto('/register')
  await page.waitForSelector('.cover__card #auth-form')

  await expect(page.locator('.cover__title')).toHaveText('Create your account')
  await expect(page.locator('.cover__caption')).toHaveText('Your stall is ready. 招')
  await expect(page.locator('.cover__card > .cover__sub').first()).toHaveText(
    'Set up your stall in a minute.',
  )
  await expect(page.locator('#a-name')).toHaveCount(1)
  await expect(page.locator('#a-confirm')).toHaveCount(1)
  await expect(page.locator('.btn--block .btn__label')).toHaveText('Create account')
  await expect(page.locator('.cover__card a', { hasText: 'Log in' })).toHaveAttribute(
    'href',
    '/login',
  )
})

test('password toggle flips the input type', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubBase(page)
  await page.goto('/login')
  await page.waitForSelector('#a-password')

  const toggle = page.locator('.input-wrap__action')
  await expect(toggle).toHaveAttribute('aria-pressed', 'false')
  await expect(toggle).toHaveAttribute('aria-label', 'Show password')
  await toggle.click()
  await expect(page.locator('#a-password')).toHaveAttribute('type', 'text')
  await expect(toggle).toHaveAttribute('aria-pressed', 'true')
  await expect(toggle).toHaveAttribute('aria-label', 'Hide password')
})

test('login validation uses the prototype copy', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubBase(page)
  await page.goto('/login')
  await page.waitForSelector('#auth-form')

  await page.locator('.btn--block').click()
  await expect(page.locator('#a-email-error')).toHaveText('Enter a valid email address.')
  await expect(page.locator('#a-password-error')).toHaveText('Enter your password.')
  await expect(page.locator('.banner')).toHaveCount(0)
})

test('register validation uses the prototype copy', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubBase(page)
  await page.goto('/register')
  await page.waitForSelector('#auth-form')

  await page.locator('#a-name').fill('Ava')
  await page.locator('#a-email').fill('ava@eventnest.dev')
  await page.locator('#a-password').fill('short')
  await page.locator('.btn--block').click()
  await expect(page.locator('#a-password-error')).toHaveText('Use at least 8 characters.')

  await page.locator('#a-password').fill('longenough1')
  await page.locator('#a-confirm').fill('mismatch')
  await page.locator('.btn--block').click()
  await expect(page.locator('#a-confirm-error')).toHaveText("Passwords don't match.")
})

test('401 shows the prototype banner', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubBase(page)
  await stubAuth(page, (route) => route.fulfill(envelope(null, 401)))
  await page.goto('/login')
  await page.waitForSelector('#auth-form')

  await page.locator('#a-email').fill('ava@eventnest.dev')
  await page.locator('#a-password').fill('whatever')
  await page.locator('.btn--block').click()

  const banner = page.locator('.banner')
  await expect(banner).toBeVisible()
  await expect(banner.locator('.banner__title')).toHaveText("Hmm, that didn't work.")
  await expect(banner).toContainText("We couldn't log you in. Check your email and password.")
})

test('successful login toasts and lands on events', async ({ page }) => {
  await bootstrap(page, 'light')
  await stubBase(page)
  await stubAuth(page, (route) => route.fulfill(envelope(AUTH_OK)))
  await page.goto('/login')
  await page.waitForSelector('#auth-form')

  await page.locator('#a-email').fill('ava@eventnest.dev')
  await page.locator('#a-password').fill('super-secret')
  await page.locator('.btn--block').click()

  await expect(page).toHaveURL(/\/events/)
  await expect(page.locator('.toast__title')).toHaveText('Welcome back, Ava! 福')
  await expect(page.locator('.toast__text')).toHaveText('Your permissions are warm.')
})
