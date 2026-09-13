import { useMemo } from 'react'
import { cn } from '@/lib/cn'
import { initialsOf } from '@/lib/format'

const PASTELS = ['sakura', 'sora', 'wakatake', 'yamabuki', 'fuji']

interface UserAvatarProps {
  name: string
  size?: number
  decorative?: boolean
  className?: string
}

export function UserAvatar({ name, size = 34, decorative, className }: UserAvatarProps) {
  const pastel = useMemo(() => {
    let seed = 0
    for (let i = 0; i < name.length; i += 1) seed += name.charCodeAt(i)
    return PASTELS[seed % PASTELS.length] ?? 'sakura'
  }, [name])
  return (
    <span
      className={cn('nav-avatar', `nav-avatar--${pastel}`, className)}
      style={{ width: size, height: size }}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : name}
    >
      {initialsOf(name)}
    </span>
  )
}
