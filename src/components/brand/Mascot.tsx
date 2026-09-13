import { Kokeshi } from '@/components/icons/masks/Kokeshi'
import { Koi } from '@/components/icons/masks/Koi'
import { Daruma } from '@/components/icons/masks/Daruma'
import { Neko } from '@/components/icons/masks/Neko'
import { cn } from '@/lib/cn'

interface MascotProps {
  kind: 'daruma' | 'neko' | 'koi' | 'kokeshi'
  size?: number
  static?: boolean
  painted?: boolean
  className?: string
}

export function Mascot({ kind, size, static: isStatic, painted, className }: MascotProps) {
  const style = size ? { width: size, height: size } : undefined
  const maskClass = cn(isStatic && 'is-static', painted && 'daruma--painted')
  return (
    <span className={cn('mascot-wrap', className)} style={style} aria-hidden="true">
      {kind === 'daruma' ? <Daruma className={maskClass} /> : null}
      {kind === 'neko' ? <Neko className={maskClass} /> : null}
      {kind === 'koi' ? <Koi className={maskClass} /> : null}
      {kind === 'kokeshi' ? <Kokeshi className={maskClass} /> : null}
    </span>
  )
}
