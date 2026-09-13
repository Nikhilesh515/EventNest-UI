import { cn } from '@/lib/cn'

interface SkeletonProps {
  width?: string
  height?: string
  variant?: 'line' | 'chunk' | 'pill'
  className?: string
}

export function Skeleton({ width, height, variant = 'line', className }: SkeletonProps) {
  return (
    <span
      className={cn('skeleton', `skeleton--${variant}`, className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}
