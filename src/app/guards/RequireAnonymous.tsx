import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '@/features/auth/AuthContext'

export function RequireAnonymous({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  if (status === 'authenticated') return <Navigate to="/events" replace />
  return <>{children}</>
}
