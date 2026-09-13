import { Icon } from '@/components/icons/Icon'

interface PagerProps {
  page: number
  pages: number
  total: number
  pageSize: number
  sizeOptions?: number[]
  variant?: 'sheet' | 'plain'
  onPageChange(page: number): void
  onPageSizeChange(pageSize: number): void
}

export function Pager({
  page,
  pages,
  total,
  pageSize,
  sizeOptions = [9, 12, 24],
  variant = 'plain',
  onPageChange,
  onPageSizeChange,
}: PagerProps) {
  const safePages = Math.max(1, pages)
  const sheet = variant === 'sheet'
  const navLabel = sheet ? 'Sheet navigation' : 'Pagination'
  const prevLabel = sheet ? 'Previous sheet' : 'Previous page'
  const nextLabel = sheet ? 'Next sheet' : 'Next page'
  const sizeLabel = sheet ? 'Sheets:' : 'Rows per page'
  const unit = sheet ? 'sheet' : 'page'
  const totalLabel = `${total}${
    total === 1 ? (sheet ? ' event' : ' result') : sheet ? ' events' : ' results'
  }`

  const maxNums = 5
  let start = Math.max(1, page - 2)
  const end = Math.min(safePages, start + maxNums - 1)
  start = Math.max(1, end - maxNums + 1)

  const numbers: number[] = []
  for (let i = start; i <= end; i += 1) numbers.push(i)

  return (
    <nav className="pager" aria-label={navLabel}>
      <span className="pager-meta tnum">{totalLabel}</span>
      <div className="pager__pages">
        <button
          type="button"
          className="pager__btn"
          aria-label={prevLabel}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <Icon name="chevron-left" size={16} />
        </button>
        {start > 1 ? (
          <>
            <button
              type="button"
              className="pager__btn"
              aria-label={`Go to ${unit} 1`}
              onClick={() => onPageChange(1)}
            >
              1
            </button>
            {start > 2 ? <span className="pager__ellipsis">…</span> : null}
          </>
        ) : null}
        {numbers.map((n) => (
          <button
            key={n}
            type="button"
            className="pager__btn"
            aria-label={`Go to ${unit} ${n}`}
            aria-current={n === page ? 'page' : undefined}
            onClick={() => onPageChange(n)}
          >
            {n}
          </button>
        ))}
        {end < safePages ? (
          <>
            {end < safePages - 1 ? <span className="pager__ellipsis">…</span> : null}
            <button
              type="button"
              className="pager__btn"
              aria-label={`Go to ${unit} ${safePages}`}
              onClick={() => onPageChange(safePages)}
            >
              {safePages}
            </button>
          </>
        ) : null}
        <button
          type="button"
          className="pager__btn"
          aria-label={nextLabel}
          disabled={page >= safePages}
          onClick={() => onPageChange(page + 1)}
        >
          <Icon name="chevron-right" size={16} />
        </button>
      </div>
      <label className="pager__size">
        {sizeLabel}{' '}
        <select
          className="select select--inline"
          aria-label={sizeLabel}
          value={String(pageSize)}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
        >
          {sizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>
    </nav>
  )
}
