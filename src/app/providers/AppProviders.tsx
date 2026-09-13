import type { ReactNode } from 'react'
import { AuthProvider } from './AuthProvider'
import { QueryProvider } from './QueryProvider'
import { ThemeProvider } from './ThemeProvider'
import { ToastProvider } from './ToastProvider'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}
