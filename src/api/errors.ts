export class AppApiError extends Error {
  readonly status: number
  readonly code: number
  readonly fieldErrors: Record<string, string>
  readonly retryAfterMs?: number
  readonly isNetwork: boolean

  constructor(init: {
    status: number
    code: number
    message: string
    errors?: Record<string, string[]> | null
    retryAfterMs?: number
    isNetwork?: boolean
  }) {
    super(init.message)
    this.name = 'AppApiError'
    this.status = init.status
    this.code = init.code
    this.fieldErrors = mapFieldErrors(init.errors ?? null)
    this.retryAfterMs = init.retryAfterMs
    this.isNetwork = init.isNetwork ?? false
  }
}

export function isAppApiError(value: unknown): value is AppApiError {
  return value instanceof AppApiError
}

export function mapFieldErrors(errors: Record<string, string[]> | null): Record<string, string> {
  if (!errors) return {}
  const out: Record<string, string> = {}
  for (const [field, messages] of Object.entries(errors)) {
    out[field] = messages[0] ?? 'Invalid value.'
  }
  return out
}

export function defaultMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Please check the highlighted fields.'
    case 401:
      return 'Your session has expired. Please log in again.'
    case 403:
      return "You can't peek behind this counter."
    case 404:
      return 'This stall has packed up.'
    case 409:
      return 'That already exists.'
    case 429:
      return 'Whoa, slow down. Please try again shortly.'
    case 500:
      return 'Something went wrong on our side. Try again.'
    case 502:
      return 'The service is unavailable right now. Try again shortly.'
    case 504:
      return 'The request timed out. Try again.'
    default:
      return 'Something went wrong.'
  }
}

export function parseRetryAfter(header: string | undefined): number | undefined {
  if (!header) return undefined
  const seconds = Number(header)
  if (Number.isFinite(seconds)) return seconds * 1000
  const date = Date.parse(header)
  if (!Number.isNaN(date)) return Math.max(0, date - Date.now())
  return undefined
}

export function normalizeError(
  body: unknown,
  status: number,
  retryAfterHeader?: string,
): AppApiError {
  const b = (body ?? {}) as {
    code?: number
    message?: string
    errors?: Record<string, string[]> | null
    error?: { code?: number; message?: string }
  }
  const code =
    typeof b.code === 'number' ? b.code : typeof b.error?.code === 'number' ? b.error.code : status
  const message = b.message ?? b.error?.message ?? defaultMessage(status)
  return new AppApiError({
    status,
    code,
    message,
    errors: b.errors ?? null,
    retryAfterMs: parseRetryAfter(retryAfterHeader),
  })
}
