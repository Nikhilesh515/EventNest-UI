import type { CSSProperties } from 'react'
import { cn } from '@/lib/cn'

interface CapacityMeterProps {
  going: number
  capacity: number
  label?: string
  noMeta?: boolean
}

export function CapacityMeter({ going, capacity, label = 'Going', noMeta }: CapacityMeterProps) {
  const pct = capacity > 0 ? Math.round((going / capacity) * 100) : 0
  const full = pct >= 100
  const near = pct >= 70
  return (
    <div className={cn('capacity', full && 'capacity--full', near && !full && 'capacity--near')}>
      {!noMeta ? (
        <div className="capacity__meta">
          <span>{label}</span>
          <span className="capacity__num tnum">
            {going} / {capacity}
          </span>
        </div>
      ) : null}
      <div
        className="capacity__track"
        role="progressbar"
        aria-valuenow={going}
        aria-valuemin={0}
        aria-valuemax={capacity}
        aria-valuetext={`${going} of ${capacity} going`}
      >
        <div className="capacity__fill" style={{ '--cap-pct': `${pct}%` } as CSSProperties} />
      </div>
    </div>
  )
}
