export const STORAGE_KEYS = {
  theme: 'eventnest.theme',
  viewMode: 'eventnest.ui.viewMode',
  pageSize: 'eventnest.ui.pageSize',
  railScroll: 'eventnest.ui.railScroll',
  accessToken: 'eventnest.auth.accessToken',
  refreshToken: 'eventnest.auth.refreshToken',
  userId: 'eventnest.auth.userId',
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

export function getAccessToken(): string | null {
  return readStorage(STORAGE_KEYS.accessToken)
}

export function getRefreshToken(): string | null {
  return readStorage(STORAGE_KEYS.refreshToken)
}

export function getStoredUserId(): string | null {
  return readStorage(STORAGE_KEYS.userId)
}

export function setTokens(
  tokens: { accessToken: string; refreshToken: string },
  userId?: string,
): void {
  writeStorage(STORAGE_KEYS.accessToken, tokens.accessToken)
  writeStorage(STORAGE_KEYS.refreshToken, tokens.refreshToken)
  if (userId) {
    writeStorage(STORAGE_KEYS.userId, userId)
  }
}

export function clearSession(): void {
  removeStorage(STORAGE_KEYS.accessToken)
  removeStorage(STORAGE_KEYS.refreshToken)
  removeStorage(STORAGE_KEYS.userId)
}
