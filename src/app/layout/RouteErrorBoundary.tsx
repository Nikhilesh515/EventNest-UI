import { useRouteError } from 'react-router-dom'
import { ErrorState } from '@/components/states/ErrorState'

export function RouteErrorBoundary() {
  const error = useRouteError()
  const message = error instanceof Error ? error.message : 'An unexpected error occurred.'
  return (
    <div className="content-canvas">
      <ErrorState
        title="The page slipped out of the album."
        body="Something went wrong while rendering this page. Try again."
        meta={import.meta.env.DEV ? message : undefined}
        onRetry={() => window.location.reload()}
      />
    </div>
  )
}
