import { Link } from 'react-router-dom'
import type { RefObject } from 'react'

import { Icon } from '@/components/icons/Icon'
import { useFocusTrap } from './useFocusTrap'
import type { UserDto } from '@/types'

interface UserMenuProps {
  open: boolean
  user: UserDto
  onLogout: () => void
  onClose: () => void
  triggerRef: RefObject<HTMLElement | null>
}

export function UserMenu({ open, user, onLogout, onClose, triggerRef }: UserMenuProps) {
  const ref = useFocusTrap<HTMLDivElement>({
    active: open,
    onEscape: onClose,
    returnFocus: triggerRef.current,
  })

  if (!open) return null

  return (
    <div className="rail-menu" id="rail-user-menu" role="menu" aria-label="Account menu" ref={ref}>
      <span className="menu-label">{user.role}</span>
      <Link className="menu-item" role="menuitem" to="/my-rsvps" onClick={onClose}>
        <Icon name="ticket" size={18} />
        My RSVPs
      </Link>
      {user.role !== 'User' ? (
        <Link className="menu-item" role="menuitem" to="/my-events" onClick={onClose}>
          <Icon name="star" size={18} />
          My Events
        </Link>
      ) : null}
      <div className="menu-sep" />
      <button
        type="button"
        className="menu-item menu-item--danger"
        role="menuitem"
        onClick={onLogout}
      >
        <Icon name="chevron-right" size={18} />
        Log out
      </button>
    </div>
  )
}
