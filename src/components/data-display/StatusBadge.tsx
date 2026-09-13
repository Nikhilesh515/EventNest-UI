import type { EventStatus } from '@/types'

interface StatusBadgeProps {
  status: EventStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const key = status.toLowerCase()

  let glyph = null
  if (key === 'draft') {
    glyph = (
      <span
        className="badge__glyph"
        aria-hidden="true"
        style={{ border: '2px dashed currentColor', borderRadius: '50%' }}
      />
    )
  } else if (key === 'published') {
    glyph = (
      <span
        className="badge__glyph"
        aria-hidden="true"
        style={{ background: 'currentColor', borderRadius: '50%' }}
      />
    )
  } else if (key === 'cancelled') {
    glyph = (
      <span
        className="badge__glyph"
        aria-hidden="true"
        style={{ border: '2px solid currentColor', borderRadius: '50%', position: 'relative' }}
      />
    )
  } else if (key === 'completed') {
    glyph = (
      <span
        className="badge__glyph"
        aria-hidden="true"
        style={{
          background: 'currentColor',
          clipPath:
            'polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)',
        }}
      />
    )
  }

  return (
    <span className={`badge badge--${key}`}>
      {glyph}
      {status}
    </span>
  )
}
