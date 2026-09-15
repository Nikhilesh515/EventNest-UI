import { Icon } from './Icon';

interface SheetPagerProps {
  page: number;
  pages: number;
  size: number;
  total: number;
  sizeOptions?: number[];
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
}

export function SheetPager({
  page,
  pages,
  size,
  total,
  sizeOptions = [9, 18],
  onPageChange,
  onSizeChange,
}: SheetPagerProps) {
  const maxNums = 5;
  const safePages = Math.max(1, pages);
  let start = Math.max(1, page - 2);
  const end = Math.min(safePages, start + maxNums - 1);
  start = Math.max(1, end - maxNums + 1);

  const numbers: number[] = [];
  for (let i = start; i <= end; i += 1) numbers.push(i);

  const pageButton = (p: number) => (
    <button
      key={p}
      type="button"
      className="pager__btn"
      onClick={() => onPageChange(p)}
      aria-label={`Go to sheet ${p}`}
      aria-current={p === page ? 'page' : undefined}
    >
      {p}
    </button>
  );

  return (
    <nav className="pager" aria-label="Sheet navigation">
      <span className="pager-meta tnum">
        {total} {total === 1 ? 'event' : 'events'}
      </span>
      <div className="pager__pages">
        <button
          type="button"
          className="pager__btn"
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous sheet"
          disabled={page <= 1}
        >
          <Icon name="chevron-left" size={16} />
        </button>
        {start > 1 && (
          <>
            {pageButton(1)}
            {start > 2 && <span className="pager__ellipsis">…</span>}
          </>
        )}
        {numbers.map((p) => pageButton(p))}
        {end < safePages && (
          <>
            {end < safePages - 1 && <span className="pager__ellipsis">…</span>}
            {pageButton(safePages)}
          </>
        )}
        <button
          type="button"
          className="pager__btn"
          onClick={() => onPageChange(page + 1)}
          aria-label="Next sheet"
          disabled={page >= safePages}
        >
          <Icon name="chevron-right" size={16} />
        </button>
      </div>
      <label className="pager__size">
        Sheets:{' '}
        <select
          className="select select--inline"
          value={size}
          onChange={(e) => onSizeChange(Number(e.target.value))}
          aria-label="Sheets:"
        >
          {sizeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    </nav>
  );
}
