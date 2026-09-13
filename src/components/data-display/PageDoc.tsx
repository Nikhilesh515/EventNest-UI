import type { CSSProperties, ReactNode } from 'react'

import { cn } from '@/lib/cn'
import type { WashiTone } from '@/types'

interface PageDocProps {
  title: string
  overline?: string
  subtitle?: ReactNode
  badges?: ReactNode
  tags?: ReactNode
  kanji?: string
  tapeVariant?: WashiTone
  cornerTape?: WashiTone
  fullTape?: boolean
  actions?: ReactNode
  headingLevel?: 1 | 2
  titleClassName?: string
  className?: string
}

export function PageDoc({
  title,
  overline,
  subtitle,
  badges,
  tags,
  kanji,
  tapeVariant = 'sakura',
  cornerTape,
  fullTape,
  actions,
  headingLevel = 1,
  titleClassName,
  className,
}: PageDocProps) {
  const Heading = headingLevel === 2 ? 'h2' : 'h1'
  const tapeStyle = fullTape ? ({ '--tape-page-w': '100%' } as CSSProperties) : undefined

  return (
    <header className={cn('page-doc', className)}>
      <span
        className={cn('washi', 'page-doc__tape', `washi--${tapeVariant}`)}
        aria-hidden="true"
        style={tapeStyle}
      />
      {cornerTape ? (
        <span
          className={cn('washi', 'page-doc__corner-tape', `washi--${cornerTape}`)}
          aria-hidden="true"
        />
      ) : null}
      {kanji ? (
        <span className="page-doc__kanji kanji-watermark" aria-hidden="true" lang="ja">
          {kanji}
        </span>
      ) : null}
      <div className="page-doc__head">
        {overline ? <p className="page-doc__overline">{overline}</p> : null}
        {badges ? <div className="cluster-3">{badges}</div> : null}
        <Heading className={cn('page-doc__title', titleClassName)}>{title}</Heading>
        {tags ? <div className="cluster">{tags}</div> : null}
        {subtitle ? <p className="page-doc__sub">{subtitle}</p> : null}
      </div>
      {actions ? <div className="page-doc__actions">{actions}</div> : null}
    </header>
  )
}
