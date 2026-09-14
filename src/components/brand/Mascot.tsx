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
  const maskClass = cn(isStatic && 'is-static', painted && 'daruma--painted', className)
  if (kind === 'daruma') return <Daruma className={maskClass} style={style} />
  if (kind === 'neko') return <Neko className={maskClass} style={style} />
  if (kind === 'koi') return <Koi className={maskClass} style={style} />
  return <Kokeshi className={maskClass} style={style} />
}
