import type { PatternName } from '@/types'
import { cn } from '@/lib/cn'

interface PatternSurfaceProps {
  pattern: PatternName
  tintVar?: string
  className?: string
}

export function PatternSurface({ pattern, tintVar, className }: PatternSurfaceProps) {
  return (
    <span
      className={cn('pattern', `pattern--${pattern}`, className)}
      style={tintVar ? { background: tintVar } : undefined}
      aria-hidden="true"
    />
  )
}
