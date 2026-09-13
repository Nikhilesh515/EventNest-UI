import { CapacityMeter } from '@/components/data-display/CapacityMeter'

interface EventCapacityPanelProps {
  going: number
  capacity: number
}

export function EventCapacityPanel({ going, capacity }: EventCapacityPanelProps) {
  const left = Math.max(0, capacity - going)
  return (
    <section className="reply-card__panel" id="capacity-panel">
      <p className="page-doc__overline">Capacity</p>
      <div style={{ marginTop: 'var(--space-3)' }}>
        <CapacityMeter going={going} capacity={capacity} label={`${going} / ${capacity} going`} />
        <p className="field__hint" style={{ marginTop: 'var(--space-2)' }}>
          {left > 0 ? `${left} spots left` : 'This event is full.'}
        </p>
      </div>
    </section>
  )
}
