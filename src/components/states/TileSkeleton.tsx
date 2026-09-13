import type { CSSProperties } from 'react'

import type { MosaicSlot } from '@/lib/mosaic'

export function TileSkeleton({ slot }: { slot: MosaicSlot }) {
  return (
    <div
      className={`tile ${slot.cls} skeleton-tile`}
      aria-hidden="true"
      style={{ '--tile-rot': `${slot.rot}deg` } as CSSProperties}
    >
      <div className="skeleton" style={{ flex: 1, borderRadius: 'var(--tile-radius)' }} />
    </div>
  )
}
