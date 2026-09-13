const DEFAULT_API_URL = 'http://localhost:5000'

function readBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback
  }
  return value === 'true' || value === '1'
}

export const env = {
  appName: 'EventNest',
  apiUrl: import.meta.env.VITE_API_URL ?? DEFAULT_API_URL,
  enableStyleguide: readBoolean(import.meta.env.VITE_ENABLE_STYLEGUIDE, import.meta.env.DEV),
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const
