import { useMemo } from 'react'

import { useTheme } from '@/app/providers/ThemeContext'
import { cn } from '@/lib/cn'
import { normalizeTag, tagStyleVars } from '@/lib/color'

interface TagLike {
  id: string
  name: string
  color: string
}

interface TagChipProps {
  tag: TagLike
  md?: boolean
  interactive?: boolean
  pressed?: boolean
  tilt?: number
  onToggle?: () => void
  onRemove?: () => void
}

export function TagChip({ tag, md, interactive, pressed, tilt, onToggle, onRemove }: TagChipProps) {
  const { theme } = useTheme()
  const color = useMemo(() => normalizeTag(tag.color, theme), [tag.color, theme])
  const style = tagStyleVars(color, tilt)
  const classes = cn(
    'tag-chip',
    interactive && 'tag-chip--interactive',
    md && 'tag-chip--md',
    onRemove && 'tag-chip--remove',
  )

  const inner = (
    <>
      <span className="tag-chip__dot" aria-hidden="true" />
      <span className="tag-chip__label">{tag.name}</span>
      {onRemove ? (
        <span
          className="tag-chip__x"
          role="button"
          tabIndex={0}
          aria-label={`Remove ${tag.name}`}
          onClick={onRemove}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onRemove()
            }
          }}
        >
          ×
        </span>
      ) : null}
    </>
  )

  if (interactive || onToggle) {
    return (
      <button
        type="button"
        className={classes}
        style={style}
        title={tag.name}
        aria-label={tag.name}
        aria-pressed={pressed ?? false}
        onClick={onToggle}
      >
        {inner}
      </button>
    )
  }

  return (
    <span className={classes} style={style} title={tag.name} aria-label={tag.name}>
      {inner}
    </span>
  )
}
