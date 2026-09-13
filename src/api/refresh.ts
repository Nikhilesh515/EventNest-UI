import axios from 'axios'
import { env } from '@/lib/env'
import { getRefreshToken, setTokens } from '@/lib/storage'
import { AUTH } from './endpoints'

const refreshClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 20_000,
  withCredentials: false,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
})

/**
 * Rotates the refresh token and stores the new pair atomically.
 * Throws when there is no refresh token or the backend rejects it.
 */
export async function refreshTokens(): Promise<void> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new Error('No refresh token available.')
  const response = await refreshClient.post(AUTH.refresh, { refreshToken })
  const body = response.data as {
    success?: boolean
    result?: { accessToken: string; refreshToken: string; user?: { id: string } }
  }
  const result = body.result
  if (!result?.accessToken || !result.refreshToken) throw new Error('Refresh response was empty.')
  setTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken }, result.user?.id)
}
