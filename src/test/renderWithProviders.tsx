import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { ReactElement } from 'react'
import { AuthContext, ANONYMOUS_AUTH } from '@/features/auth/AuthContext'
import type { AuthContextValue } from '@/features/auth/AuthContext'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import { ToastProvider } from '@/app/providers/ToastProvider'

interface RenderOptions {
  route?: string
  auth?: Partial<AuthContextValue>
}

export function renderWithProviders(ui: ReactElement, { route = '/', auth }: RenderOptions = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const authValue: AuthContextValue = { ...ANONYMOUS_AUTH, ...auth }
  return render(
    <QueryClientProvider client={client}>
      <AuthContext.Provider value={authValue}>
        <ThemeProvider>
          <ToastProvider>
            <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
          </ToastProvider>
        </ThemeProvider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  )
}
