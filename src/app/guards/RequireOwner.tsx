import type { ReactNode } from 'react'
import { AccessDenied } from '@/components/states/AccessDenied'

interface RequireOwnerProps {
  isOwner: boolean
  children: ReactNode
}

export function RequireOwner({ isOwner, children }: RequireOwnerProps) {
  if (!isOwner) {
    return (
      <AccessDenied
        crumbs={[{ label: 'My events', href: '/my-events' }, { label: 'Restricted' }]}
        message="Only the event's organizer can manage this event."
        backTo="/my-events"
      />
    )
  }
  return <>{children}</>
}
