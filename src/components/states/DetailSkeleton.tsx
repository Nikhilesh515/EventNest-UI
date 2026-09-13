export function DetailSkeleton() {
  return (
    <div className="stack-6" aria-busy="true" aria-hidden="true">
      <div className="skeleton skeleton--chunk" style={{ height: 180 }} />
      <div className="spread">
        <div className="skeleton skeleton--chunk" style={{ height: 320 }} />
        <div className="skeleton skeleton--chunk" style={{ height: 320 }} />
      </div>
    </div>
  )
}
