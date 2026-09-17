export const STORAGE_KEYS = {
  theme: 'eventnest.theme',
  viewMode: 'eventnest.ui.viewMode',
  pageSize: 'eventnest.ui.pageSize',
  railScroll: 'eventnest.ui.railScroll',
} as const

const memory = new Map<string, string>()

export function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return memory.get(key) ?? null
  }
}

export function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    memory.set(key, value)
  }
}

export function removeStorage(key: string): void {
  try {
    window.localStorage.removeItem(key)
  } catch {
    memory.delete(key)
  }
}

let accessToken: string | null = null

export function getAccessToken(): string | null {
  return accessToken
}

export function setAccessToken(token: string | null): void {
  accessToken = token
}

export function clearSession(): void {
  accessToken = null
}
