import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { KoiLoader } from '@/components/states/KoiLoader'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'idle' || status === 'loading') {
    return <KoiLoader label="Checking your pass…" size="lg" />
  }
  if (status !== 'authenticated') {
    const returnUrl = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?returnUrl=${returnUrl}`} replace />
  }
  return <>{children}</>
}
