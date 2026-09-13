import { Fragment } from 'react'
import { Link } from 'react-router-dom'

import type { BreadcrumbItem } from '@/types'

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <Fragment key={`${item.label}-${index}`}>
            {index > 0 ? (
              <span className="sep" aria-hidden="true">
                /
              </span>
            ) : null}
            {item.href && !isLast ? (
              <Link to={item.href}>{item.label}</Link>
            ) : (
              <span className="current clamp-1" aria-current="page">
                {item.label}
              </span>
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}
