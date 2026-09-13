import { Icon } from '@/components/icons/Icon'
import type { EventVisibility } from '@/types'

interface VisibilityBadgeProps {
  visibility: EventVisibility
}

export function VisibilityBadge({ visibility }: VisibilityBadgeProps) {
  const isPublic = visibility === 'Public'
  return (
    <span className={`vis-badge vis-badge--${isPublic ? 'public' : 'private'}`}>
      <Icon name={isPublic ? 'eye' : 'user'} size={12} />
      {visibility}
    </span>
  )
}
