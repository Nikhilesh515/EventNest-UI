import { SkeletonCard } from './SkeletonCard'

export function SkeletonRows({ count }: { count: number }) {
  return (
    <div className="stack-3" aria-busy="true">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} rows={2} />
      ))}
    </div>
  )
}
