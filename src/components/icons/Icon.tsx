import type { IconName } from '@/types'
import { ICON_PATHS } from './iconRegistry'

interface IconProps {
  name: IconName
  size?: number
  className?: string
  title?: string
}

export function Icon({ name, size = 20, className, title }: IconProps) {
  const labelled = Boolean(title)
  return (
    <svg
      className={className ? `icon ${className}` : 'icon'}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={labelled ? undefined : true}
      focusable="false"
      role={labelled ? 'img' : undefined}
    >
      {labelled ? <title>{title}</title> : null}
      {ICON_PATHS[name]}
    </svg>
  )
}
