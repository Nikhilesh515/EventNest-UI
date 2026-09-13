import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Mascot } from '@/components/brand/Mascot'

interface EmptyStateProps {
  title: string
  body?: string
  cta?: { label: string; to?: string; onClick?: () => void }
  painted?: boolean
  kanji?: string
  className?: string
}

export function EmptyState({ title, body, cta, painted, kanji, className }: EmptyStateProps) {
  return (
    <div className={cn('empty', className)} role="status">
      <div className="empty__mascot" aria-hidden="true">
        <Mascot kind="daruma" painted={painted} />
      </div>
      <h2 className="empty__title">{title}</h2>
      {body ? <p className="empty__body">{body}</p> : null}
      {cta ? (
        <div className="cluster">
          {cta.to ? (
            <Link className="btn btn--primary" to={cta.to}>
              {cta.label}
            </Link>
          ) : (
            <button type="button" className="btn btn--primary" onClick={cta.onClick}>
              {cta.label}
            </button>
          )}
        </div>
      ) : null}
      {kanji ? (
        <span className="empty__kanji kanji-watermark" aria-hidden="true" lang="ja">
          {kanji}
        </span>
      ) : null}
    </div>
  )
}
