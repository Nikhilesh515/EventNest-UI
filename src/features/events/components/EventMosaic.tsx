import type { ReactNode } from 'react'

import type { EventDto, WashiTone } from '@/types'
import { composeMosaic, fillerVariant } from '@/lib/mosaic'
import { EventTile } from '@/components/data-display/EventTile'
import { FillerTile } from '@/components/data-display/FillerTile'
import { MosaicSkeleton } from '@/components/states/MosaicSkeleton'

const WASHI_VARIANTS: WashiTone[] = ['sakura', 'sora', 'yamabuki', 'matcha', 'sora', 'sakura']

function buildSpread(items: EventDto[], taped: boolean): ReactNode {
  const { assignments, lastBand } = composeMosaic(items)
  if (lastBand === 0) return null
  return assignments
    .filter(({ slot }) => slot.band <= lastBand)
    .map(({ slot, item }) => {
      if (slot.kind === 'filler') return <FillerTile key={slot.cls} slot={slot} />
      if (!item) {
        return <FillerTile key={slot.cls} slot={slot} variant={fillerVariant(slot.index)} />
      }
      const washi = taped ? (WASHI_VARIANTS[slot.index % WASHI_VARIANTS.length] ?? null) : null
      return <EventTile key={slot.cls} event={item} slot={slot} washi={washi} />
    })
}

interface EventMosaicProps {
  events: EventDto[]
  pageSize?: number
  loading?: boolean
}

export function EventMosaic({ events, pageSize = 9, loading }: EventMosaicProps) {
  if (loading) {
    return (
      <div className="mosaic">
        <MosaicSkeleton />
      </div>
    )
  }

  const slice1 = events.slice(0, 9)
  const slice2 = events.slice(9, 18)

  return (
    <div className="mosaic-stack">
      <section className="mosaic" aria-label="Events, sheet 1">
        <h2 className="sr-only">Events</h2>
        {buildSpread(slice1, true)}
      </section>
      {pageSize > 9 && slice2.length > 0 ? (
        <section className="mosaic" aria-label="Events, sheet 2">
          <h2 className="sr-only">Events</h2>
          {buildSpread(slice2, false)}
        </section>
      ) : null}
    </div>
  )
}
