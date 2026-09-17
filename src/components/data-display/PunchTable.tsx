import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

interface PunchColumn {
  key: string
  header: string
  numeric?: boolean
  width?: string
}

interface PunchTableProps {
  caption: string
  columns: PunchColumn[]
  children: ReactNode
}

export function PunchTable({ caption, columns, children }: PunchTableProps) {
  const hasWidths = columns.some((c) => c.width)
  return (
    <div className="table-scroll">
      <table className="table-punch">
        <caption className="sr-only">{caption}</caption>
        {hasWidths ? (
          <colgroup>
            {columns.map((column) => (
              <col key={column.key} style={{ width: column.width }} />
            ))}
          </colgroup>
        ) : null}
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" className={cn(column.numeric && 'num')}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}
