import { Skeleton } from './Skeleton'

export function SkeletonRows({ count }: { count: number }) {
  return (
    <div className="stack-3" aria-busy="true">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="skeleton-card"
          style={{ padding: 'var(--space-3) var(--space-4)' }}
          aria-hidden="true"
        >
          <Skeleton variant="line" className="w-40" />
          <Skeleton variant="line" className="w-60" />
        </div>
      ))}
    </div>
  )
}
