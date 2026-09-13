import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { AppApiError } from '@/api/errors'

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
            retry: (failureCount, error) => {
              if (
                error instanceof AppApiError &&
                [400, 401, 403, 404, 409, 429].includes(error.status)
              ) {
                return false
              }
              return failureCount < 2
            },
            retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
          },
          mutations: { retry: false },
        },
      }),
  )
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
