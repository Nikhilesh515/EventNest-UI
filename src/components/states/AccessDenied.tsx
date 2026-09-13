import type { BreadcrumbItem } from '@/types'
import { Breadcrumbs } from '@/components/data-display/Breadcrumbs'
import { ErrorState } from './ErrorState'

interface AccessDeniedProps {
  crumbs?: BreadcrumbItem[]
  message?: string
  backTo?: string
}

export function AccessDenied({
  crumbs,
  message = "This page needs a permission you don't have.",
  backTo = '/events',
}: AccessDeniedProps) {
  return (
    <div className="stack-6">
      {crumbs ? <Breadcrumbs items={crumbs} /> : null}
      <ErrorState
        title="You can't peek behind this counter."
        body={message}
        mascot="kokeshi"
        secondary={{ label: 'Back to events', to: backTo }}
      />
    </div>
  )
}
