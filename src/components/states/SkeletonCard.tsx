import { Skeleton } from './Skeleton'

export function SkeletonCard({ rows = 4 }: { rows?: number }) {
  return (
    <div className="skeleton-card" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} variant="line" />
      ))}
    </div>
  )
}
