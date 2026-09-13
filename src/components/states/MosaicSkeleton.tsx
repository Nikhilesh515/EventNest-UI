import { MOSAIC_SLOTS } from '@/lib/mosaic'

import { TileSkeleton } from './TileSkeleton'

export function MosaicSkeleton() {
  return (
    <div className="mosaic" aria-busy="true" aria-hidden="true">
      {MOSAIC_SLOTS.map((slot) => (
        <TileSkeleton key={slot.cls} slot={slot} />
      ))}
    </div>
  )
}
