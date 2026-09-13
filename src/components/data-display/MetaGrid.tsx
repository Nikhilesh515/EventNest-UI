import type { ReactNode } from 'react'

import { Icon } from '@/components/icons/Icon'
import { cn } from '@/lib/cn'
import type { IconName } from '@/types'

interface MetaGridRow {
  icon: IconName
  term: string
  detail: ReactNode
  detailClassName?: string
}

export function MetaGrid({ rows }: { rows: MetaGridRow[] }) {
  return (
    <dl className="meta-grid">
      {rows.map((row) => (
        <div className="meta-row" key={row.term}>
          <dt>
            <Icon name={row.icon} size={16} />
            {row.term}
          </dt>
          <dd className={cn(row.detailClassName)}>{row.detail}</dd>
        </div>
      ))}
    </dl>
  )
}
