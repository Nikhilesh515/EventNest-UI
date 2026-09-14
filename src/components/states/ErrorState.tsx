import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Mascot } from '@/components/brand/Mascot'
import { Icon } from '@/components/icons/Icon'

interface ErrorStateProps {
  title?: string
  body?: string
  retryLabel?: string
  onRetry?: () => void
  secondary?: { label: string; to?: string; onClick?: () => void }
  mascot?: 'koi' | 'kokeshi'
  meta?: string
  className?: string
}

export function ErrorState({
  title = "We couldn't load this.",
  body = 'Try again in a moment.',
  retryLabel = 'Try again',
  onRetry,
  secondary,
  mascot = 'koi',
  meta,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('error-state', className)} role="alert">
      <div aria-hidden="true" style={{ width: 64 }}>
        <Mascot kind={mascot} className="error-state__mascot" />
      </div>
      <h2 className="error-state__title">{title}</h2>
      <p className="error-state__body">{body}</p>
      <div className="cluster">
        {onRetry ? (
          <button type="button" className="btn btn--primary" onClick={onRetry}>
            <Icon name="refresh" size={18} />
            <span className="btn__label">{retryLabel}</span>
          </button>
        ) : null}
        {secondary ? (
          secondary.to ? (
            <Link className="btn btn--secondary" to={secondary.to}>
              {secondary.label}
            </Link>
          ) : (
            <button type="button" className="btn btn--secondary" onClick={secondary.onClick}>
              {secondary.label}
            </button>
          )
        ) : null}
      </div>
      {meta ? <p className="error-state__meta">{meta}</p> : null}
    </div>
  )
}
