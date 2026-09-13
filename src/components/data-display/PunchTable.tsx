import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

interface PunchColumn {
  key: string
  header: string
  numeric?: boolean
}

interface PunchTableProps {
  caption: string
  columns: PunchColumn[]
  children: ReactNode
}

export function PunchTable({ caption, columns, children }: PunchTableProps) {
  return (
    <div className="table-scroll">
      <table className="table-punch">
        <caption className="sr-only">{caption}</caption>
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
