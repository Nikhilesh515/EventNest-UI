import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

import { useTheme } from '@/app/providers/ThemeContext'
import { Icon } from '@/components/icons/Icon'
import { Washi } from '@/components/decorations/Washi'
import { PhotoCorners } from '@/components/decorations/PhotoCorners'
import { cn } from '@/lib/cn'
import { normalizeTag } from '@/lib/color'
import { dateFlag, fmtDate, fmtDateShort, fmtRange, isPast } from '@/lib/format'
import { tilePatternClass } from '@/lib/mosaic'
import type { MosaicSlot } from '@/lib/mosaic'
import type { EventDto, StyleVars, WashiTone } from '@/types'
import { StatusBadge } from './StatusBadge'
import { VisibilityBadge } from './VisibilityBadge'
import { TagChip } from './TagChip'
import { CapacityMeter } from './CapacityMeter'

interface EventTileProps {
  event: EventDto
  slot: MosaicSlot
  washi?: WashiTone | null
  actions?: ReactNode
  isPast?: boolean
}

function tileAria(event: EventDto): string {
  const full = event.capacity > 0 && event.going >= event.capacity
  return `${event.title}, ${fmtDate(event.start)}, ${event.status}, ${
    full ? 'full' : `${event.going} of ${event.capacity} going`
  }`
}

export function EventTile({ event, slot, washi, actions, isPast: pastProp }: EventTileProps) {
  const { theme } = useTheme()
  const kind = slot.kind
  const firstTag = event.tags[0]
  const tint = normalizeTag(firstTag?.color ?? '', theme).fill
  const flag = dateFlag(event.start)
  const full = event.capacity > 0 && event.going >= event.capacity
  const past = pastProp ?? isPast(event.end)
  const tagMax = kind === 'feature' ? 3 : kind === 'portrait' ? 2 : 1
  const tagTilts = [-1.5, 1.5, -0.8]

  const classes = cn(
    'tile',
    `tile--${kind}`,
    slot.cls,
    event.status === 'Cancelled' && 'tile--cancelled',
    event.status === 'Draft' && 'tile--draft',
    full && 'tile--full',
    past && 'tile--past',
  )

  let meta: ReactNode
  if (kind === 'wide' || kind === 'portrait') {
    meta = (
      <div className="tile__meta">
        <div className="tile__meta-row">
          <Icon name="clock" size={14} />
          <span>
            {fmtRange(event.start, event.end)} · {event.location}
          </span>
        </div>
      </div>
    )
  } else {
    meta = (
      <div className="tile__meta">
        <div className="tile__meta-row">
          <Icon name="calendar" size={14} />
          <span>
            {fmtDateShort(event.start)} · {fmtRange(event.start, event.end)}
          </span>
        </div>
        <div className="tile__meta-row">
          <Icon name="pin" size={14} />
          <span>{event.location}</span>
        </div>
      </div>
    )
  }

  return (
    <article
      className={classes}
      style={{ '--tile-rot': `${slot.rot}deg`, '--tile-tint': tint } as StyleVars}
      data-event-id={event.id}
      aria-label={tileAria(event)}
    >
      <div className="tile__polaroid">
        <div className={cn('tile__photo', 'pattern', tilePatternClass(event.id))}>
          {washi ? <Washi tone={washi} className="tile__washi" /> : null}
          <span className="tile__date-flag">
            {flag.md} · {flag.dow}
          </span>
          <PhotoCorners />
        </div>
        <div className="tile__caption">
          <div className="tile__badges">
            <StatusBadge status={event.status} />
            {kind !== 'wide' ? <VisibilityBadge visibility={event.visibility} /> : null}
            {full ? <span className="badge badge--full">FULL</span> : null}
          </div>
          <h3 className="tile__title">
            <Link className="tile__stretch" to={`/events/${event.id}`} title={event.title}>
              {event.title}
            </Link>
          </h3>
          <div className="tile__tags">
            {event.tags.slice(0, tagMax).map((tag, index) => (
              <TagChip key={tag.id} tag={tag} tilt={tagTilts[index] ?? 0} />
            ))}
            {event.tags.length > tagMax ? (
              <span
                className="tag-chip tag-chip--more"
                title={event.tags
                  .slice(tagMax)
                  .map((tag) => tag.name)
                  .join(', ')}
              >
                +{event.tags.length - tagMax}
              </span>
            ) : null}
          </div>
          <div className="tile__rule" />
          {meta}
          <div className="tile__footer">
            {kind === 'feature' ? (
              <span className="tile__cap-num">
                <span aria-hidden="true">{event.organizerName}</span>
              </span>
            ) : null}
            {kind === 'portrait' ? (
              <span className="tile__cap-num">
                {full ? 'FULL' : `${event.going} / ${event.capacity}`}
              </span>
            ) : null}
            {kind === 'wide' ? (
              <span className="tile__cap-num">
                {event.going} / {event.capacity}
              </span>
            ) : null}
          </div>
          {kind === 'wide' ? null : (
            <CapacityMeter going={event.going} capacity={event.capacity} noMeta label="Going" />
          )}
        </div>
        {actions ? <div className="tile__actions">{actions}</div> : null}
      </div>
    </article>
  )
}
