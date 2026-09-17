import type { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { AppApiError, normalizeError } from './errors'
import { refreshTokens, getRefreshInFlight, setRefreshInFlight, redirectToLogin } from './refresh'
import { getAccessToken } from '@/lib/storage'

function isEnvelope(value: unknown): value is { success: boolean; result: unknown } {
  return typeof value === 'object' && value !== null && 'success' in value && 'result' in value
}

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean
}

export function attachRequestInterceptors(client: AxiosInstance): void {
  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getAccessToken()
    if (token && !config.headers.has('Authorization')) {
      config.headers.set('Authorization', `Bearer ${token}`)
    }
    return config
  })
}

export function attachResponseInterceptors(client: AxiosInstance): void {
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      const body = response.data
      if (isEnvelope(body)) {
        if (body.success === false) throw normalizeError(body, response.status)
        return { ...response, data: body.result }
      }
      return response
    },
    async (error: AxiosError) => {
      const config = error.config as RetriableConfig | undefined
      if (error.response) {
        const status = error.response.status
        const body = error.response.data as Record<string, unknown> | undefined
        const url = config?.url ?? ''

        if (status === 401 && config && !config._retried && !url.includes('/api/auth/')) {
          config._retried = true
          try {
            const existing = getRefreshInFlight()
            const inflight = existing ?? refreshTokens().finally(() => setRefreshInFlight(null))
            setRefreshInFlight(inflight)
            await inflight
            if (config.headers.has('Authorization')) {
              config.headers.delete('Authorization')
            }
            return await client.request(config)
          } catch {
            redirectToLogin()
            throw new AppApiError({
              status: 401,
              code: 401,
              message: 'Your session has expired. Please log in again.',
            })
          }
        }
        throw normalizeError(
          body,
          status,
          error.response.headers['retry-after'] as string | undefined,
        )
      }
      throw new AppApiError({
        status: 0,
        code: 0,
        isNetwork: true,
        message: "Can't reach the server. Check your connection.",
      })
    },
  )
}
