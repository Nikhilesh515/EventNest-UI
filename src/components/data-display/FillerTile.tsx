import type { CSSProperties } from 'react'

import { cn } from '@/lib/cn'
import { FILLER_VARIANTS } from '@/lib/mosaic'
import type { FillerVariant, MosaicSlot } from '@/lib/mosaic'

const FILLER_INDEXES = [2, 3, 11, 12]

export function FillerTile({ slot, variant }: { slot: MosaicSlot; variant?: FillerVariant }) {
  const order = FILLER_INDEXES.indexOf(slot.index)
  const resolved = variant ?? FILLER_VARIANTS[order >= 0 ? order : 0] ?? 'sakura'
  return (
    <div
      className={cn('tile', slot.cls, 'tile--mini')}
      style={{ '--tile-rot': `${slot.rot}deg` } as CSSProperties}
      aria-hidden="true"
    >
      <div className={cn('tile__filler', `filler--${resolved}`)}>花</div>
    </div>
  )
}
