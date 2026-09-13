import type { WashiTone } from '@/types'
import { cn } from '@/lib/cn'

interface WashiProps {
  tone: WashiTone
  className?: string
}

export function Washi({ tone, className }: WashiProps) {
  return <span className={cn('washi', `washi--${tone}`, className)} aria-hidden="true" />
}
