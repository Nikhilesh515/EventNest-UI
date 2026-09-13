import type { BreadcrumbItem } from '@/types'
import { Breadcrumbs } from '@/components/data-display/Breadcrumbs'
import { ErrorState } from './ErrorState'

interface NotFoundStateProps {
  crumbs?: BreadcrumbItem[]
  title?: string
  body?: string
  secondary?: { label: string; to?: string }
}

export function NotFoundState({
  crumbs,
  title = 'This stall has packed up.',
  body = "We couldn't find that page. It may have been removed, or the link may be off by a sticker.",
  secondary = { label: 'Back to events', to: '/events' },
}: NotFoundStateProps) {
  return (
    <div className="stack-6">
      {crumbs ? <Breadcrumbs items={crumbs} /> : null}
      <ErrorState mascot="kokeshi" title={title} body={body} secondary={secondary} />
    </div>
  )
}
