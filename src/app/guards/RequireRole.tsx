import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { AccessDenied } from '@/components/states/AccessDenied'
import { KoiLoader } from '@/components/states/KoiLoader'
import type { UserRole } from '@/types'

interface RequireRoleProps {
  roles: UserRole[]
  children: ReactNode
}

export function RequireRole({ roles, children }: RequireRoleProps) {
  const { status, user } = useAuth()
  const location = useLocation()

  if (status === 'idle' || status === 'loading') {
    return <KoiLoader label="Checking your pass." size="lg" />
  }
  if (status !== 'authenticated' || !user) {
    const returnUrl = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?returnUrl=${returnUrl}`} replace />
  }
  if (!roles.includes(user.role)) {
    return <AccessDenied crumbs={[{ label: 'Events', href: '/events' }, { label: 'Restricted' }]} />
  }
  return <>{children}</>
}
