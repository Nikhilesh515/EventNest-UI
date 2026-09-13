import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { AccessDenied } from '@/components/states/AccessDenied'
import { KoiLoader } from '@/components/states/KoiLoader'

interface RequirePermissionProps {
  permission: string
  children: ReactNode
}

export function RequirePermission({ permission, children }: RequirePermissionProps) {
  const { status, hasPermission } = useAuth()
  const location = useLocation()

  if (status === 'idle' || status === 'loading') {
    return <KoiLoader label="Checking your pass…" size="lg" />
  }
  if (status !== 'authenticated') {
    const returnUrl = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?returnUrl=${returnUrl}`} replace />
  }
  if (!hasPermission(permission)) {
    return <AccessDenied crumbs={[{ label: 'Events', href: '/events' }, { label: 'Restricted' }]} />
  }
  return <>{children}</>
}
