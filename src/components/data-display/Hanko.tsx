import { cn } from '@/lib/cn'

interface HankoProps {
  glyph?: string
  size?: 'sm' | 'md' | 'lg'
  thumping?: boolean
}

export function Hanko({ glyph = '祭', size = 'md', thumping }: HankoProps) {
  return (
    <span
      className={cn('hanko', size !== 'md' && `hanko--${size}`, thumping && 'is-thumping')}
      aria-hidden="true"
    >
      {glyph}
    </span>
  )
}
