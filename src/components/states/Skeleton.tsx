import type { CSSProperties } from 'react'

import { cn } from '@/lib/cn'

interface SkeletonProps {
  variant?: 'line' | 'chunk' | 'pill'
  className?: string
  style?: CSSProperties
}

export function Skeleton({ variant, className, style }: SkeletonProps) {
  return (
    <div
      className={cn('skeleton', variant && `skeleton--${variant}`, className)}
      style={style}
      aria-hidden="true"
    />
  )
}
