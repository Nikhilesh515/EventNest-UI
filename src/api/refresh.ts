import { apiClient } from '@/api/client'
import { AUTH } from './endpoints'

let refreshInFlight: Promise<void> | null = null

function redirectToLogin(): void {
  if (typeof window === 'undefined') return
  const returnUrl = encodeURIComponent(window.location.pathname + window.location.search)
  if (!window.location.pathname.startsWith('/login')) {
    window.location.assign(`/login?returnUrl=${returnUrl}`)
  }
}

export async function refreshTokens(): Promise<void> {
  await apiClient.post(AUTH.refresh, undefined, { withCredentials: true })
}

export function getRefreshInFlight(): Promise<void> | null {
  return refreshInFlight
}

export function setRefreshInFlight(p: Promise<void> | null): void {
  refreshInFlight = p
}

export { redirectToLogin }
