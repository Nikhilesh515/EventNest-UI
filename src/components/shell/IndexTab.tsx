import { Link } from 'react-router-dom'

import { Icon } from '@/components/icons/Icon'
import type { IconName } from '@/types'

interface IndexTabProps {
  page: string
  icon: IconName
  label: string
  href: string
  active: boolean
  onNavigate?: () => void
}

export function IndexTab({ page, icon, label, href, active, onNavigate }: IndexTabProps) {
  return (
    <li>
      <Link
        className="index-tab"
        to={href}
        aria-current={active ? 'page' : undefined}
        title={`Page ${page}, ${label}`}
        aria-label={`Page ${page}, ${label}`}
        onClick={onNavigate}
      >
        <span className="index-tab__num tnum" aria-hidden="true">
          {page}
        </span>
        <Icon name={icon} size={20} />
        <span className="index-tab__label">{label}</span>
      </Link>
    </li>
  )
}
