import { Skeleton } from './Skeleton'

export function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <Skeleton variant="line" className="w-40" />
      <Skeleton variant="line" className="w-80" style={{ minHeight: 22 }} />
      <Skeleton variant="line" className="w-60" />
      <Skeleton variant="line" className="w-80" />
      <Skeleton variant="line" className="w-40" />
      <Skeleton style={{ height: 12, borderRadius: 999 }} />
    </div>
  )
}
